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
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Zap,
  ZapOff,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
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

    // Clean up existing stream first
    stopCamera();

    if (!navigator?.mediaDevices?.getUserMedia) {
      if (isMountedRef.current) {
        setCameraError('דפדפן זה אינו תומך בהפעלת מצלמה חיה ישירה. ניתן לצלם בקלות עם מצלמת הטלפון או להעלות תמונה.');
        setIsInitializingCamera(false);
      }
      return;
    }

    let activeStream: MediaStream | null = null;

    // Constraint Strategy 1: Ideal target facingMode with 720p/1080p and continuous autofocus
    try {
      activeStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          advanced: [{ focusMode: 'continuous' } as any],
        },
        audio: false,
      });
    } catch (e1) {
      console.warn('[CameraScanner] Strategy 1 failed, trying Strategy 2...', e1);
    }

    // Constraint Strategy 2: Simple target facingMode
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

    // Constraint Strategy 3: Any video track available
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
              ? 'גישה למצלמה נחסמה בדפדפן. יש לאשר הרשאת מצלמה בהגדרות הדפדפן, או ללחוץ על "צלם במצלמת הטלפון".'
              : 'לא הצלחנו לפתוח את שידור המצלמה. באפשרותך לצלם ישירות במצלמת המכשיר או להעלות תמונה.'
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
            console.warn('[CameraScanner] Play interrupted, waiting for user gesture or metadata:', playErr);
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

  // Track mount state and handle visibility change
  useEffect(() => {
    isMountedRef.current = true;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopCamera();
    };
  }, [stopCamera]);

  // Apply Hardware / Track Zoom or CSS Zoom on barcode scanner
  const applyBarcodeZoom = (targetZoom: number) => {
    setBarcodeZoom(targetZoom);

    // 1. Try hardware zoom via MediaStream track
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

  // Barcode Scanner Lifecycle using Html5Qrcode
  useEffect(() => {
    let isScannerRunning = false;

    if (mode === 'barcode' && !isLoading) {
      setBarcodeError(null);
      const elementId = 'barcode-reader-viewfinder';

      const timer = setTimeout(() => {
        const el = document.getElementById(elementId);
        if (!el) return;

        try {
          const qrScanner = new Html5Qrcode(elementId);
          html5QrCodeRef.current = qrScanner;

          qrScanner
            .start(
              {
                facingMode: 'environment',
              },
              {
                fps: 15,
                qrbox: { width: 300, height: 170 },
                aspectRatio: 1.777778,
                videoConstraints: {
                  facingMode: 'environment',
                  width: { ideal: 1920, min: 1280 },
                  height: { ideal: 1080, min: 720 },
                  advanced: [{ focusMode: 'continuous' } as any],
                },
              },
              (decodedText) => {
                if (isMountedRef.current && isScannerRunning) {
                  isScannerRunning = false;
                  qrScanner.stop().catch(() => {});
                  handleBarcodeLookup(decodedText);
                }
              },
              () => {
                // Ignore scanning frames without barcodes
              }
            )
            .then(() => {
              isScannerRunning = true;
              // Check torch capabilities
              try {
                const videoEl = document.querySelector('#barcode-reader-viewfinder video') as HTMLVideoElement;
                if (videoEl?.srcObject) {
                  const track = (videoEl.srcObject as MediaStream).getVideoTracks()[0];
                  const caps = track?.getCapabilities?.() as any;
                  if (caps && 'torch' in caps) {
                    setHasTorchSupport(true);
                  }
                  if (caps && 'zoom' in caps) {
                    // Apply initial zoom
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
      }, 200);

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
  }, [mode, isLoading]);

  // Lookup product by barcode from Open Food Facts & send to SIBO analysis
  const handleBarcodeLookup = async (barcode: string) => {
    const cleanCode = barcode.trim();
    if (!cleanCode) return;

    setIsFetchingBarcode(true);
    setBarcodeError(null);

    try {
      const prod = await fetchProductByBarcode(cleanCode);
      if (prod.found) {
        const textPrompt = `מוצר ארוז מסחרי (זוהה מברקוד ${prod.barcode}):
שם המוצר: ${prod.productName} ${prod.brand ? `(מותג: ${prod.brand})` : ''}
רשימת רכיבים רשמית: ${prod.ingredientsText || 'ללא פירוט רכיבים במאגר'}
אלרגנים/הערות: ${prod.allergens || 'לא צוינו אלרגנים'}
קטגוריות: ${prod.categories || 'מזון'}`;

        await onAnalyze({
          textPrompt,
          barcode: prod.barcode,
          imageBase64: prod.imageUrl || undefined,
        });
      } else {
        setBarcodeError(
          `הברקוד (${cleanCode}) טרם נרשם במאגר הברקודים. צלמי ישירות את רשימת הרכיבים בגב האריזה לקבלת ניתוח SIBO מיידי!`
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
      // 1. Try decoding barcode from the high-res photo using html5-qrcode
      const qrScanner = html5QrCodeRef.current || new Html5Qrcode('barcode-reader-viewfinder');
      try {
        const decodedText = await qrScanner.scanFile(file, true);
        if (decodedText) {
          await handleBarcodeLookup(decodedText);
          return;
        }
      } catch (scanErr) {
        console.log('[BarcodeScanner] Direct photo scan did not find barcode, falling back to full image analysis...', scanErr);
      }

      // 2. If barcode was not decoded, treat image as food/ingredients label and analyze directly
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

  // Video metadata & canplay handlers
  const handleVideoCanPlay = () => {
    if (isMountedRef.current) {
      setCameraActive(true);
      setIsInitializingCamera(false);
    }
  };

  // Capture Snapshot from active video stream
  const captureSnapshot = () => {
    if (!videoRef.current || !cameraActive) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Trigger visual shutter flash
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const canvas = document.createElement('canvas');
    const MAX_DIM = 960;
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

  // Process file to compressed base64 for instant upload (<100KB)
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 960;
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
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

  // Drag & Drop handlers
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

  return (
    <div id="camera-scanner-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Intro Header Card - Mobile Optimized */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-extrabold shadow-2xs border border-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>פרוטוקול תזונה קליני ל-SIBO</span>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          צלמי כל מאכל, מוצר בסופר, ברקוד או תפריט — המערכת תנתח את רמת התסיסה וה-FODMAP:
        </p>

        {/* Beautiful Centered Traffic Light Badge Bar */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl shadow-2xs">
            🟢 אור ירוק (מותר)
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-yellow-950 bg-yellow-300 border border-yellow-400 px-2.5 py-1 rounded-xl shadow-2xs">
            🟡 אור צהוב (מוגבל)
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-xl shadow-2xs">
            🔴 אור אדום (אסור)
          </span>
        </div>
      </div>

      {/* Hidden Native Mobile Camera Input */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden Native Mobile Camera Input for High-Res Barcode Photo */}
      <input
        ref={barcodeFileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleBarcodeFileCapture}
        className="hidden"
      />

      {/* Symmetrical, Sleek 5-Button Toolbar (Perfect on Mobile & Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full max-w-3xl mx-auto">
        <button
          id="scanner-mode-camera"
          type="button"
          onClick={() => {
            setPreviewImage(null);
            setMode('camera');
          }}
          className={`py-3 px-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm border shadow-xs active:scale-95 ${
            mode === 'camera'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow-md ring-2 ring-sky-300/40'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Camera className={`w-4 h-4 ${mode === 'camera' ? 'text-white' : 'text-sky-500'}`} />
          <span>מצלמה</span>
        </button>

        <button
          id="scanner-mode-barcode"
          type="button"
          onClick={() => {
            setMode('barcode');
            stopCamera();
          }}
          className={`py-3 px-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm border shadow-xs active:scale-95 ${
            mode === 'barcode'
              ? 'bg-gradient-to-r from-indigo-500 to-blue-700 text-white border-indigo-400 shadow-md ring-2 ring-indigo-300/40'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Barcode className={`w-4 h-4 ${mode === 'barcode' ? 'text-white' : 'text-indigo-600'}`} />
          <span>סורק ברקוד 🏷️</span>
        </button>

        <button
          id="scanner-mode-upload"
          type="button"
          onClick={() => {
            setMode('upload');
            stopCamera();
          }}
          className={`py-3 px-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm border shadow-xs active:scale-95 ${
            mode === 'upload'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400 shadow-md ring-2 ring-purple-300/40'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Upload className={`w-4 h-4 ${mode === 'upload' ? 'text-white' : 'text-purple-500'}`} />
          <span>העלאת תמונה</span>
        </button>

        <button
          id="scanner-mode-text"
          type="button"
          onClick={() => {
            setMode('text');
            stopCamera();
          }}
          className={`py-3 px-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm border shadow-xs active:scale-95 ${
            mode === 'text'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400 shadow-md ring-2 ring-amber-300/40'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Search className={`w-4 h-4 ${mode === 'text' ? 'text-white' : 'text-amber-500'}`} />
          <span>הקלדת מאכל</span>
        </button>

        {onOpenAllowedForbidden && (
          <button
            id="btn-allowed-forbidden-top-row"
            type="button"
            onClick={onOpenAllowedForbidden}
            className="col-span-2 sm:col-span-1 py-3 px-2.5 rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer font-extrabold text-xs sm:text-sm border shadow-md active:scale-95 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white border-emerald-400 ring-2 ring-emerald-300/30"
          >
            <span>🚦 מותר / אסור</span>
          </button>
        )}
      </div>

      {/* Loading Overlay State */}
      {isLoading || isFetchingBarcode ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-500/40 shadow-lg text-center space-y-5">
          {previewImage && (
            <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-emerald-400 relative">
              <img src={previewImage} alt="תמונת המאכל שצולם" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-xs flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-300 animate-spin" />
              </div>
            </div>
          )}

          {!previewImage && (
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
              <div className="relative w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-extrabold text-stone-900">
              {isFetchingBarcode ? 'שולף רכיבי מוצר ממאגר הברקודים ומנתח...' : 'מנתח את המאכל על פי פרוטוקול SIBO קליני...'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              בודק ריכוז פרוקטנים, לקטוז, עודף פרוקטוז, סורביטול, מניטול וגלקטנים לפי הנחיות ד״ר סיבקר ומונאש
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 max-w-md mx-auto text-xs text-emerald-900 font-medium leading-relaxed">
            💡 <strong>ידעת?</strong> בסיבו, חיידקים שנמצאים במעי הדק מתסיסים סוכרים תוך פחות מ-30 דקות.
            אור ירוק מבטיח שהחיידקים יורעבו ולא יוכלו לתסוס!
          </div>

          {onCancelAnalyze && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onCancelAnalyze}
                className="px-5 py-2.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-stone-600 rounded-xl text-xs font-bold transition-all border border-stone-200 cursor-pointer shadow-xs"
              >
                ✕ ביטול וחזרה למצלמה
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Main Viewfinder / Scanner Area */
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-4 sm:p-6">
          {/* BARCODE SCANNER MODE */}
          {mode === 'barcode' && (
            <div className="space-y-4">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center space-y-1">
                <h3 className="text-sm font-extrabold text-stone-900 flex items-center justify-center gap-1.5">
                  <Barcode className="w-4 h-4 text-indigo-600" />
                  <span>סורק ברקודים למוצרי מזון ארוזים 🏷️</span>
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  החזיקי את הטלפון במרחק נוח (20-30 ס״מ) מול הברקוד. השתמשי בכפתורי הזום (x1.5 / x2) לקבלת פוקוס חד!
                </p>
              </div>

              {/* Barcode Camera Viewport with Zoom & Controls Overlay */}
              <div className="relative bg-stone-950 rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[340px] flex items-center justify-center shadow-inner">
                <div
                  id="barcode-reader-viewfinder"
                  className="w-full h-full min-h-[280px] transition-transform duration-200 origin-center"
                  style={{ transform: `scale(${barcodeZoom})` }}
                />

                {/* Laser animation overlay */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_14px_#f43f5e] animate-pulse pointer-events-none z-10" />

                {/* Floating Zoom & Torch Controls Bar on Camera */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-auto">
                  {/* Zoom Preset Pills */}
                  <div className="flex items-center gap-1 bg-stone-900/85 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-md">
                    {[1, 1.5, 2, 2.5].map((z) => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => applyBarcodeZoom(z)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          barcodeZoom === z
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        x{z}
                      </button>
                    ))}
                  </div>

                  {/* Torch Toggle Button if Supported */}
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
                </div>
              </div>

              {/* Macro Native Camera Capture Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => barcodeFileInputRef.current?.click()}
                  className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <span>צלמי תמונת ברקוד ברורה במצלמת הטלפון (פוקוס מקרו אוטומטי) 📸</span>
                </button>
              </div>

              {barcodeError && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-medium space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{barcodeError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('camera');
                      nativeCameraInputRef.current?.click();
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>צלמי את רשימת הרכיבים בגב האריזה 📸</span>
                  </button>
                </div>
              )}

              {/* Manual Barcode Input Form */}
              <form onSubmit={handleBarcodeSubmit} className="pt-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="או הקלידי מספר ברקוד ידנית (לדוגמה: 729000000000)..."
                    className="flex-1 px-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-right"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    disabled={!barcodeInput.trim()}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
                  >
                    בדיקת ברקוד
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CAMERA MODE */}
          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-stone-950 rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/9 flex items-center justify-center shadow-inner">
                {/* Visual Shutter Flash Effect */}
                {isFlashActive && (
                  <div className="absolute inset-0 bg-white z-30 animate-fade-out pointer-events-none" />
                )}

                {cameraError ? (
                  <div className="p-6 sm:p-8 text-center space-y-4 text-stone-300 max-w-md">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                      <CameraOff className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">לא ניתן לפתוח מצלמה חיה</p>
                      <p className="text-xs text-stone-400 leading-relaxed">{cameraError}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>צלמי במצלמת הטלפון 📷</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('upload')}
                        className="w-full sm:w-auto px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-stone-700 cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>בחירת תמונה מהגלריה</span>
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

                    {/* Tap to start camera overlay */}
                    {!cameraActive && !isInitializingCamera && (
                      <div
                        onClick={() => startCamera(facingMode)}
                        className="absolute inset-0 bg-stone-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer z-15 hover:bg-stone-950/75 transition-all"
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg animate-pulse ring-4 ring-emerald-400/40">
                          <Camera className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-extrabold text-white block">
                            לחצי כאן לפתיחת המצלמה 📷
                          </span>
                          <span className="text-xs text-stone-300 block">
                            או צלמי ישירות באמצעות הכפתור הירוק למטה
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Camera Loading Spinner Overlay */}
                    {isInitializingCamera && (
                      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-stone-300 z-10">
                        <Loader2 className="w-9 h-9 text-emerald-400 animate-spin" />
                        <span className="text-xs font-medium tracking-wide">פותח את המצלמה מיד...</span>
                      </div>
                    )}

                    {/* Viewfinder Target Overlay Guide */}
                    {cameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8 z-10">
                        <div className="w-64 h-64 border-2 border-dashed border-white/70 rounded-3xl flex items-center justify-center shadow-lg">
                          <span className="bg-stone-900/75 text-white/95 text-xs px-3.5 py-1.5 rounded-full font-bold backdrop-blur-xs shadow-sm">
                            כווני למאכל או לרכיבים בגב האריזה
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Top-Right Badges: Active Status & Flip Camera Button */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                      {cameraActive && (
                        <div className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs border border-white/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>פעיל</span>
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

              {/* Camera Action Buttons */}
              {!cameraError && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
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
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white font-extrabold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-2 ring-emerald-400/30"
                  >
                    <Camera className="w-6 h-6" />
                    <span>{cameraActive && videoRef.current?.videoWidth ? 'צלם ובדוק ברמזור 🚦' : 'צלם מאכל / רכיבים 📷'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="w-full sm:w-auto px-5 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-stone-300 shadow-xs cursor-pointer"
                    title="פתיחת מצלמת הטלפון המלאה"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>צלמי ישירות מהטלפון / גלריה 📸</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD MODE */}
          {mode === 'upload' && (
            <div className="space-y-4">
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
                <h3 className="text-base font-bold text-stone-900 mb-1">
                  לחצי לבחירת תמונה או גררי לכאן
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4 leading-relaxed">
                  ניתן להעלות תמונה של צלחת, מוצר בסופר, תפריט במסעדה או צילום מסך (JPG, PNG, WebP)
                </p>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all pointer-events-none"
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
                <label htmlFor="food-text-input" className="block text-xs font-bold text-stone-700">
                  שם המאכל, המנה או רשימת הרכיבים:
                </label>
                <div className="relative">
                  <input
                    id="food-text-input"
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="למשל: קוטג', חלב דל לקטוז, סלט יווני, לחם מחמצת, חזה עוף..."
                    className="w-full pl-4 pr-11 py-3.5 bg-stone-50 border border-stone-300 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition-all text-stone-900 placeholder:text-stone-400"
                  />
                  <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Quick suggestions chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-stone-400">חיפושים נפוצים:</span>
                {['קוטג\'', 'חלב דל לקטוז', 'שום ובצל', 'חלב שיבולת שועל', 'תפוח עץ', 'לחם כוסמין', 'חומוס', 'אורז לבן', 'קפה'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setTextInput(item);
                      onAnalyze({ textPrompt: item });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-xs font-medium transition-colors border border-stone-200"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!textInput.trim() || isLoading}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>בדוק ברמזור SIBO 🚦</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
