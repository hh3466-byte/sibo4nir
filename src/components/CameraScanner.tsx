import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SiboPhase } from '../types';
import {
  Camera,
  Upload,
  Search,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  CameraOff,
  SwitchCamera,
  Barcode,
  RotateCcw,
  Zap,
  ZapOff,
  Crosshair,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { fetchProductByBarcode } from '../services/barcodeService';

interface CameraScannerProps {
  currentPhase: SiboPhase;
  onAnalyze: (payload: { imageBase64?: string; textPrompt?: string; mimeType?: string; barcode?: string }) => Promise<void>;
  onCancelAnalyze?: () => void;
  isLoading: boolean;
  onOpenAllowedForbidden?: () => void;
  initialMode?: 'camera' | 'barcode' | 'upload' | 'text';
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  currentPhase,
  onAnalyze,
  onCancelAnalyze,
  isLoading,
  onOpenAllowedForbidden,
  initialMode = 'camera',
}) => {
  const [mode, setMode] = useState<'camera' | 'barcode' | 'upload' | 'text'>(initialMode);
  const [cameraActive, setCameraActive] = useState(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Barcode Scanning Mode: 'manual' (Nir aims & clicks) vs 'auto' (continuous auto-detect)
  const [barcodeScanMode, setBarcodeScanMode] = useState<'manual' | 'auto'>('manual');
  const [isDecodingManualBarcode, setIsDecodingManualBarcode] = useState(false);

  // Barcode Zoom & Torch Controls
  const [barcodeZoom, setBarcodeZoom] = useState<number>(1.5);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorchSupport, setHasTorchSupport] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const barcodeFileInputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef(true);
  const requestCounterRef = useRef(0);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Synchronize initialMode changes from parent (e.g. when user clicks "סרוק ברקוד" from result modal)
  useEffect(() => {
    if (initialMode && initialMode !== mode) {
      setMode(initialMode);
      if (initialMode !== 'camera') {
        stopCamera();
      }
    }
  }, [initialMode]);

  // Stop camera tracks safely and release hardware locks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      } catch (err) {
        console.warn('[CameraScanner] Error stopping tracks:', err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (isMountedRef.current) {
      setCameraActive(false);
      setIsInitializingCamera(false);
      setIsTorchOn(false);
    }
  }, []);

  // Check available camera devices
  const checkAvailableCameras = useCallback(async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        if (isMountedRef.current) {
          setHasMultipleCameras(videoDevices.length > 1);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Start Camera with resilient multi-tier fallback
  const startCamera = useCallback(async (targetFacing: 'environment' | 'user' = facingMode) => {
    const currentRequestId = ++requestCounterRef.current;
    setCameraError(null);
    setIsInitializingCamera(true);

    stopCamera();

    if (!navigator?.mediaDevices?.getUserMedia) {
      if (isMountedRef.current) {
        setCameraError('דפדפן זה אינו תומך בהפעלת מצלמה חיה ישירה. ניתן לצלם בקלות עם מצלמת הטלפון.');
        setIsInitializingCamera(false);
      }
      return;
    }

    let activeStream: MediaStream | null = null;

    // Strategy 1: High-res video with environment camera
    try {
      activeStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      });
    } catch (e1) {
      console.warn('[CameraScanner] Strategy 1 failed, trying Strategy 2...', e1);
    }

    // Strategy 2: Simple target facingMode
    if (!activeStream && isMountedRef.current && currentRequestId === requestCounterRef.current) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: targetFacing,
          },
          audio: false,
        });
      } catch (e2) {
        console.warn('[CameraScanner] Strategy 2 failed, trying Strategy 3...', e2);
      }
    }

    // Strategy 3: Any video track available
    if (!activeStream && isMountedRef.current && currentRequestId === requestCounterRef.current) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (e3: any) {
        console.error('[CameraScanner] All camera strategies failed:', e3);
        if (isMountedRef.current && currentRequestId === requestCounterRef.current) {
          const isDenied = e3.name === 'NotAllowedError' || e3.name === 'PermissionDeniedError';
          setCameraError(
            isDenied
              ? 'גישה למצלמה נחסמה בדפדפן. יש לאשר הרשאת מצלמה בהגדרות הדפדפן, או ללחוץ על "צלמי במצלמת הטלפון".'
              : 'לא הצלחנו לפתוח את שידור המצלמה. באפשרותך לצלם ישירות במצלמת המכשיר.'
          );
          setIsInitializingCamera(false);
        }
        return;
      }
    }

    if (!isMountedRef.current || currentRequestId !== requestCounterRef.current) {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
      return;
    }

    if (activeStream) {
      streamRef.current = activeStream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = activeStream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;

        video
          .play()
          .then(() => {
            if (isMountedRef.current) {
              setCameraActive(true);
            }
          })
          .catch((playErr) => {
            console.warn('[CameraScanner] Play interrupted:', playErr);
            if (isMountedRef.current) {
              setCameraActive(true);
            }
          });
      }

      if (isMountedRef.current) {
        setIsInitializingCamera(false);
        checkAvailableCameras();
      }
    }
  }, [facingMode, stopCamera, checkAvailableCameras]);

  // Start camera when entering Camera mode
  useEffect(() => {
    if (mode === 'camera' && !isLoading) {
      startCamera(facingMode);
    }
    return () => {
      stopCamera();
    };
  }, [mode, facingMode]);

  // Track mount state and handle visibility change
  useEffect(() => {
    isMountedRef.current = true;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      } else if (mode === 'camera') {
        startCamera(facingMode);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopCamera();
    };
  }, [stopCamera, startCamera, mode, facingMode]);

  // Apply Hardware / Track Zoom on barcode scanner
  const applyBarcodeZoom = (targetZoom: number) => {
    setBarcodeZoom(targetZoom);

    try {
      const videoEl = document.querySelector('#barcode-reader-viewfinder video') as HTMLVideoElement;
      if (videoEl && videoEl.srcObject) {
        const stream = videoEl.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        if (track) {
          const caps = track.getCapabilities?.() as any;
          if (caps && caps.zoom) {
            const clamped = Math.max(caps.zoom.min || 1, Math.min(caps.zoom.max || 5, targetZoom));
            track.applyConstraints({ advanced: [{ zoom: clamped } as any] }).catch(() => {});
          }
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // Toggle Torch on barcode reader
  const toggleBarcodeTorch = async () => {
    try {
      const videoEl = document.querySelector('#barcode-reader-viewfinder video') as HTMLVideoElement;
      if (videoEl && videoEl.srcObject) {
        const stream = videoEl.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        if (track) {
          const caps = track.getCapabilities?.() as any;
          if (caps && 'torch' in caps) {
            const nextTorch = !isTorchOn;
            await track.applyConstraints({ advanced: [{ torch: nextTorch } as any] });
            setIsTorchOn(nextTorch);
          }
        }
      }
    } catch (e) {
      console.warn('[BarcodeScanner] Torch toggle failed:', e);
    }
  };

  // Barcode Scanner Lifecycle using Html5Qrcode with all barcode formats
  useEffect(() => {
    let isScannerRunning = false;

    if (mode === 'barcode' && !isLoading) {
      setBarcodeError(null);
      const elementId = 'barcode-reader-viewfinder';

      const timer = setTimeout(() => {
        const el = document.getElementById(elementId);
        if (!el) return;

        try {
          const supportedFormats = [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.QR_CODE,
          ];

          const qrScanner = new Html5Qrcode(elementId, {
            formatsToSupport: supportedFormats,
            verbose: false,
          });
          html5QrCodeRef.current = qrScanner;

          qrScanner
            .start(
              {
                facingMode: 'environment',
              },
              {
                fps: 15,
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                  return {
                    width: Math.min(viewfinderWidth - 30, 340),
                    height: Math.min(viewfinderHeight - 30, 220),
                  };
                },
                aspectRatio: 1.777778,
                videoConstraints: {
                  facingMode: 'environment',
                  width: { ideal: 1920, min: 1280 },
                  height: { ideal: 1080, min: 720 },
                },
              },
              (decodedText) => {
                // If in manual mode, ignore automatic triggers so Nir can aim in peace!
                if (barcodeScanMode === 'manual') return;

                if (isMountedRef.current && isScannerRunning) {
                  isScannerRunning = false;
                  handleBarcodeLookup(decodedText);
                  setTimeout(() => {
                    if (isMountedRef.current) isScannerRunning = true;
                  }, 3000);
                }
              },
              () => {
                // scanning frame loop
              }
            )
            .then(() => {
              isScannerRunning = true;
              try {
                const videoEl = document.querySelector('#barcode-reader-viewfinder video') as HTMLVideoElement;
                if (videoEl?.srcObject) {
                  const track = (videoEl.srcObject as MediaStream).getVideoTracks()[0];
                  const caps = track?.getCapabilities?.() as any;
                  if (caps && 'torch' in caps) {
                    setHasTorchSupport(true);
                  }
                  if (caps && 'zoom' in caps) {
                    track.applyConstraints({ advanced: [{ zoom: barcodeZoom } as any] }).catch(() => {});
                  }
                }
              } catch (e) {
                // ignore
              }
            })
            .catch((err) => {
              console.warn('[BarcodeScanner] start error:', err);
            });
        } catch (initErr) {
          console.warn('[BarcodeScanner] init error:', initErr);
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if (html5QrCodeRef.current && isScannerRunning) {
          html5QrCodeRef.current.stop().catch(() => {});
          html5QrCodeRef.current = null;
        }
      };
    } else {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current = null;
      }
    }
  }, [mode, isLoading, barcodeScanMode]);

  // Manual Trigger: Nir aims calmly, clicks the button, and we decode the current frame!
  const handleManualBarcodeScan = async () => {
    setIsDecodingManualBarcode(true);
    setBarcodeError(null);

    try {
      const videoEl = document.querySelector('#barcode-reader-viewfinder video') as HTMLVideoElement;
      if (!videoEl || videoEl.videoWidth === 0) {
        barcodeFileInputRef.current?.click();
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsDecodingManualBarcode(false);
          return;
        }

        const file = new File([blob], 'barcode_snap.jpg', { type: 'image/jpeg' });
        const qrScanner = html5QrCodeRef.current || new Html5Qrcode('barcode-reader-viewfinder');

        try {
          const decodedText = await qrScanner.scanFile(file, true);
          if (decodedText) {
            await handleBarcodeLookup(decodedText);
            return;
          }
        } catch (err) {
          setBarcodeError('לא זוהה ברקוד בפריים הנוכחי. הקרבי מעט את המצלמה לברקוד ולחצי שוב.');
        } finally {
          setIsDecodingManualBarcode(false);
        }
      }, 'image/jpeg', 0.95);
    } catch (e) {
      console.warn('[BarcodeScanner] Manual scan error:', e);
      setIsDecodingManualBarcode(false);
    }
  };

  // Lookup product by barcode from Open Food Facts & send to SIBO analysis
  const handleBarcodeLookup = async (barcode: string) => {
    const cleanCode = barcode.trim();
    if (!cleanCode) return;

    setIsFetchingBarcode(true);
    setBarcodeError(null);

    try {
      const prod = await fetchProductByBarcode(cleanCode);
      if (prod.found) {
        const cleanName = prod.productName || 'מוצר ארוז';
        const textPrompt = prod.ingredientsText
          ? `${cleanName} (רכיבים: ${prod.ingredientsText})`
          : cleanName;

        await onAnalyze({
          textPrompt,
          barcode: prod.barcode,
          imageBase64: prod.imageUrl || undefined,
        });
      } else {
        setBarcodeError(
          `הברקוד (${cleanCode}) טרם נרשם במאגר. צלמי ישירות את רשימת הרכיבים בגב האריזה לקבלת ניתוח SIBO מדויק!`
        );
      }
    } catch (e: any) {
      setBarcodeError('שגיאה בסריקת הברקוד. אנא נסי שוב או צלמי את רשימת הרכיבים בגב האריזה.');
    } finally {
      setIsFetchingBarcode(false);
    }
  };

  // High-Resolution Native Mobile Photo Scan for Barcode
  const handleBarcodeFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsFetchingBarcode(true);
    setBarcodeError(null);

    try {
      const qrScanner = html5QrCodeRef.current || new Html5Qrcode('barcode-reader-viewfinder');
      try {
        const decodedText = await qrScanner.scanFile(file, true);
        if (decodedText) {
          await handleBarcodeLookup(decodedText);
          return;
        }
      } catch (scanErr) {
        console.log('[BarcodeScanner] Falling back to image analysis...', scanErr);
      }
      processImageFile(file);
    } catch (err: any) {
      processImageFile(file);
    } finally {
      setIsFetchingBarcode(false);
    }
  };

  // Flip camera between front and back
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const handleVideoCanPlay = () => {
    if (isMountedRef.current) {
      setCameraActive(true);
      setIsInitializingCamera(false);
    }
  };

  // Capture Snapshot from active video stream (Only when user explicitly clicks!)
  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      nativeCameraInputRef.current?.click();
      return;
    }

    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const canvas = document.createElement('canvas');
    const MAX_DIM = 1280;
    let targetWidth = video.videoWidth;
    let targetHeight = video.videoHeight;

    if (targetWidth > MAX_DIM || targetHeight > MAX_DIM) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * MAX_DIM) / targetWidth);
        targetWidth = MAX_DIM;
      } else {
        targetWidth = Math.round((targetWidth * MAX_DIM) / targetHeight);
        targetHeight = MAX_DIM;
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (facingMode === 'user') {
      ctx.translate(targetWidth, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setPreviewImage(dataUrl);
    stopCamera();
    onAnalyze({ imageBase64: dataUrl, mimeType: 'image/jpeg' });
  };

  // Handle file select (Gallery or Native Mobile Camera)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    e.target.value = '';
  };

  // Process file to compressed base64 for instant upload
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPreviewImage(compressedDataUrl);
          stopCamera();
          onAnalyze({ imageBase64: compressedDataUrl, mimeType: 'image/jpeg' });
        } else {
          setPreviewImage(rawDataUrl);
          stopCamera();
          onAnalyze({ imageBase64: rawDataUrl, mimeType: file.type || 'image/jpeg' });
        }
      };
      img.onerror = () => {
        setPreviewImage(rawDataUrl);
        stopCamera();
        onAnalyze({ imageBase64: rawDataUrl, mimeType: file.type || 'image/jpeg' });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onAnalyze({ textPrompt: textInput.trim() });
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    handleBarcodeLookup(barcodeInput.trim());
  };

  const handleResetScanner = () => {
    setPreviewImage(null);
    setCameraError(null);
    setBarcodeError(null);
    setIsFetchingBarcode(false);
    setIsDecodingManualBarcode(false);
    setTextInput('');
    setBarcodeInput('');
    stopCamera();
    if (mode === 'camera') {
      setTimeout(() => startCamera(facingMode), 100);
    }
  };

  return (
    <div id="camera-scanner-container" className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4">
      {/* Hidden Native Mobile Inputs for Crystal-Clear Phone Camera */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={barcodeFileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleBarcodeFileCapture}
        className="hidden"
      />

      {/* Top Segmented Mode Switcher with PROMINENT Refresh Button */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-100/95 backdrop-blur-md rounded-2xl border border-stone-300 shadow-sm max-w-3xl mx-auto">
        <button
          id="scanner-mode-camera"
          type="button"
          onClick={() => {
            setPreviewImage(null);
            setMode('camera');
          }}
          className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-xs sm:text-sm active:scale-95 ${
            mode === 'camera'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
              : 'text-stone-700 hover:bg-stone-200/70'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>מצלמה 📸</span>
        </button>

        <button
          id="scanner-mode-barcode"
          type="button"
          onClick={() => {
            setMode('barcode');
            stopCamera();
          }}
          className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-xs sm:text-sm active:scale-95 ${
            mode === 'barcode'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md'
              : 'text-stone-700 hover:bg-stone-200/70'
          }`}
        >
          <Barcode className="w-4 h-4" />
          <span>ברקוד 🏷️</span>
        </button>

        <button
          id="scanner-mode-text"
          type="button"
          onClick={() => {
            setMode('text');
            stopCamera();
          }}
          className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-xs sm:text-sm active:scale-95 ${
            mode === 'text'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
              : 'text-stone-700 hover:bg-stone-200/70'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>הקלדה 🔍</span>
        </button>

        <button
          id="scanner-mode-upload"
          type="button"
          onClick={() => {
            setMode('upload');
            stopCamera();
          }}
          className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-xs sm:text-sm active:scale-95 ${
            mode === 'upload'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-stone-700 hover:bg-stone-200/70'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>גלריה 🖼️</span>
        </button>

        {/* Large Prominent Refresh Button */}
        <button
          type="button"
          onClick={handleResetScanner}
          className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-1 shadow-sm"
          title="איפוס וריענון סורק"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">ריענון</span>
        </button>
      </div>

      {/* Loading Overlay State */}
      {isLoading || isFetchingBarcode ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-lg text-center space-y-4">
          {previewImage && (
            <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-emerald-400 relative">
              <img src={previewImage} alt="תמונת המאכל שצולם" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-xs flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-300 animate-spin" />
              </div>
            </div>
          )}

          {!previewImage && (
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
              <div className="relative w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              {isFetchingBarcode ? 'שולף רכיבים ממאגר הברקודים ומנתח...' : 'מנתח את המאכל על פי פרוטוקול SIBO...'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto font-medium">
              בודק פרוקטנים, לקטוז, עודף פרוקטוז, סורביטול, מניטול וגלקטנים
            </p>
          </div>

          {onCancelAnalyze && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onCancelAnalyze}
                className="px-5 py-2.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-stone-700 rounded-xl text-xs font-bold transition-all border border-stone-200 cursor-pointer shadow-xs"
              >
                ✕ ביטול וחזרה למצלמה
              </button>
            </div>
          )}
        </div>
      ) : (
        /* MAIN VIEWFINDER BOX - Elevated at Top of Viewport */
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-3 sm:p-5 space-y-3">
          {/* CAMERA MODE */}
          {mode === 'camera' && (
            <div className="space-y-3 sm:space-y-4">
              {/* Aiming Guide Banner */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-center text-xs font-bold text-stone-600">
                🎯 כווני את המצלמה למאכל או לאריזה בנחת, וכשאת מוכנה לחצי על כפתור הצילום הירוק:
              </div>

              <div className="relative bg-stone-950 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center shadow-inner">
                {isFlashActive && (
                  <div className="absolute inset-0 bg-white z-30 animate-fade-out pointer-events-none" />
                )}

                {cameraError ? (
                  <div className="p-6 text-center space-y-3 text-stone-300 max-w-md">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                      <CameraOff className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-white">פתיחת מצלמת הטלפון</p>
                      <p className="text-xs text-stone-400">{cameraError}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>צלמי במצלמת הטלפון 📷</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={handleVideoCanPlay}
                      onCanPlay={handleVideoCanPlay}
                      className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />

                    {isInitializingCamera && (
                      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-stone-300 z-10">
                        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                        <span className="text-xs font-bold">מפעיל מצלמה...</span>
                      </div>
                    )}

                    {/* Viewfinder Target Guide */}
                    {cameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
                        <div className="w-56 h-56 sm:w-72 sm:h-72 border-2 border-dashed border-white/80 rounded-3xl flex items-center justify-center shadow-lg">
                          <span className="bg-stone-900/80 text-white text-xs px-3.5 py-1 rounded-full font-bold backdrop-blur-xs shadow-sm">
                            הציבי את המאכל במרכז
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Top Status & Controls */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                      {cameraActive && (
                        <div className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs border border-white/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>מצלמה מוכנה</span>
                        </div>
                      )}

                      {cameraActive && (
                        <button
                          type="button"
                          onClick={handleToggleFacingMode}
                          title="החלפת מצלמה קדמית/אחורית"
                          className="p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 backdrop-blur-xs border border-white/20 text-white shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <SwitchCamera className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons: Big Green Shutter + High-Res Camera + Refresh */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                <button
                  id="capture-photo-btn"
                  type="button"
                  onClick={() => {
                    if (cameraActive && videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.readyState >= 2) {
                      captureSnapshot();
                    } else {
                      nativeCameraInputRef.current?.click();
                    }
                  }}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex-1 py-4 px-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-2 ring-emerald-400/30"
                >
                  <Camera className="w-6 h-6" />
                  <span>📸 צלמי עכשיו (בדיקת רמזור) 🚦</span>
                </button>

                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="w-full sm:w-auto px-5 py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
                  title="צילום חד במיוחד במצלמת הטלפון"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>צילום חד במצלמת המכשיר 📷</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetScanner}
                  className="w-full sm:w-auto px-4 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border border-stone-300 shadow-xs cursor-pointer active:scale-95"
                  title="איפוס וריענון מצלמה"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>איפוס 🔄</span>
                </button>
              </div>
            </div>
          )}

          {/* BARCODE SCANNER MODE */}
          {mode === 'barcode' && (
            <div className="space-y-3 sm:space-y-4">
              {/* Aiming Guide & Trigger Mode Switch */}
              <div className="flex items-center justify-between gap-2 bg-indigo-50 border border-indigo-200 rounded-2xl p-2.5 text-xs">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>כווני את הפס האדום למרכז הברקוד:</span>
                </span>

                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-indigo-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setBarcodeScanMode('manual')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      barcodeScanMode === 'manual'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    🎯 בלחיצה
                  </button>
                  <button
                    type="button"
                    onClick={() => setBarcodeScanMode('auto')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      barcodeScanMode === 'auto'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    ⚡ אוטומטי
                  </button>
                </div>
              </div>

              <div className="relative bg-stone-950 rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[340px] flex items-center justify-center shadow-inner">
                <div
                  id="barcode-reader-viewfinder"
                  className="w-full h-full min-h-[280px] transition-transform duration-200 origin-center"
                />

                {/* Laser animation line */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_14px_#f43f5e] animate-pulse pointer-events-none z-10" />

                {/* Floating Zoom & Torch Controls */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-auto">
                  <div className="flex items-center gap-1 bg-stone-900/85 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-md">
                    {[1, 1.5, 2, 2.5].map((z) => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => applyBarcodeZoom(z)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                          barcodeZoom === z
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        x{z}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasTorchSupport && (
                      <button
                        type="button"
                        onClick={toggleBarcodeTorch}
                        className={`p-2 rounded-full backdrop-blur-md border shadow-md transition-all cursor-pointer ${
                          isTorchOn
                            ? 'bg-yellow-400 text-stone-950 border-yellow-300'
                            : 'bg-stone-900/80 text-white border-white/20 hover:bg-stone-800'
                        }`}
                        title="הפעלת פנס"
                      >
                        {isTorchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleResetScanner}
                      className="p-2 rounded-full bg-stone-900/80 text-white hover:bg-stone-800 backdrop-blur-md border border-white/20 shadow-md transition-all cursor-pointer"
                      title="ריענון סורק ברקוד"
                    >
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Big Dedicated Manual Barcode Scan Button */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleManualBarcodeScan}
                  disabled={isDecodingManualBarcode || isFetchingBarcode}
                  className="flex-1 w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-600 active:scale-95 text-white rounded-2xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer ring-2 ring-indigo-400/30"
                >
                  {isDecodingManualBarcode ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>מפענח ברקוד...</span>
                    </>
                  ) : (
                    <>
                      <Barcode className="w-5 h-5 text-indigo-200" />
                      <span>🎯 סרוק את הברקוד עכשיו (בדיקת מוצר)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => barcodeFileInputRef.current?.click()}
                  className="w-full sm:w-auto py-4 px-5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
                  title="צילום תמונת מקרו חדה"
                >
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <span>צילום מקרו 📸</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetScanner}
                  className="w-full sm:w-auto py-4 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1 border border-stone-300 shadow-xs cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>איפוס 🔄</span>
                </button>
              </div>

              {barcodeError && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-medium space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="font-bold">{barcodeError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('camera');
                      nativeCameraInputRef.current?.click();
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>צלמי את רשימת הרכיבים בגב האריזה 📸</span>
                  </button>
                </div>
              )}

              {/* Manual Barcode Form */}
              <form onSubmit={handleBarcodeSubmit} className="pt-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="או הקלידי מספר ברקוד (לדוגמה: 7290110115623)..."
                    className="flex-1 px-4 py-3.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-right font-medium"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    disabled={!barcodeInput.trim()}
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    בדיקה
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* UPLOAD MODE */}
          {mode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50/50 scale-[0.99]'
                    : 'border-stone-300 hover:border-purple-400 hover:bg-stone-50/50'
                }`}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-base font-black text-stone-900 mb-1">
                  לחצי לבחירת תמונה מהגלריה
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4 leading-relaxed font-medium">
                  תמונה של צלחת, מוצר בסופר, תפריט במסעדה או צילום מסך
                </p>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-md transition-all pointer-events-none"
                >
                  עיון בקבצים
                </button>
              </div>
            </div>
          )}

          {/* TEXT MODE */}
          {mode === 'text' && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="food-text-input" className="block text-xs font-black text-stone-700">
                  שם המאכל, המנה או רשימת הרכיבים:
                </label>
                <div className="relative">
                  <input
                    id="food-text-input"
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="למשל: קוטג', פיוז תה, חלב דל לקטוז, במבה, לחם כוסמין..."
                    className="w-full pl-4 pr-11 py-3.5 bg-stone-50 border border-stone-300 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition-all text-stone-900 placeholder:text-stone-400 font-medium"
                  />
                  <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Quick suggestions chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-stone-400">חיפושים נפוצים:</span>
                {['קוטג\'', 'פיוז תה', 'חלב דל לקטוז', 'במבה', 'חלב שקדים', 'אורז בסמטי', 'חומוס', 'קפה'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setTextInput(item);
                      onAnalyze({ textPrompt: item });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-xs font-bold transition-colors border border-stone-200 cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!textInput.trim() || isLoading}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>בדוק ברמזור SIBO 🚦</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Traffic Light Quick Reference Badges (Underneath Camera) */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs pt-1">
        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-3 py-1 rounded-xl shadow-2xs">
          🟢 אור ירוק (מותר ובטוח)
        </span>
        <span className="inline-flex items-center gap-1 font-bold text-yellow-950 bg-yellow-300/80 border border-yellow-400 px-3 py-1 rounded-xl shadow-2xs">
          🟡 אור צהוב (כמות מוגבלת)
        </span>
        <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-100/80 border border-rose-300 px-3 py-1 rounded-xl shadow-2xs">
          🔴 אור אדום (אסור בתכלית)
        </span>
      </div>
    </div>
  );
};
