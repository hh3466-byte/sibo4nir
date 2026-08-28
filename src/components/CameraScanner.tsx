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
  CheckCircle2,
  Play,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
  GlobalHistogramBinarizer,
} from '@zxing/library';
import { fetchProductByBarcode } from '../services/barcodeService';
import { logMobileEvent } from '../services/telemetryService';

interface CameraScannerProps {
  currentPhase: SiboPhase;
  onAnalyze: (payload: { imageBase64?: string; textPrompt?: string; mimeType?: string; barcode?: string }) => Promise<void>;
  onCancelAnalyze?: () => void;
  isLoading: boolean;
  onOpenAllowedForbidden?: () => void;
  initialMode?: 'camera' | 'barcode' | 'upload' | 'text';
  resetTrigger?: number;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  currentPhase,
  onAnalyze,
  onCancelAnalyze,
  isLoading,
  onOpenAllowedForbidden,
  initialMode = 'camera',
  resetTrigger,
}) => {
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024 && !('ontouchstart' in window);
  const [isCameraTurnedOnByUser, setIsCameraTurnedOnByUser] = useState<boolean>(() => !isDesktop);
  const [mode, setMode] = useState<'camera' | 'barcode' | 'upload' | 'text'>(initialMode);
  const [cameraActive, setCameraActive] = useState(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoPaused, setIsVideoPaused] = useState(false);

  // Staged snapshot for user review before sending to analysis (100% control for Nir!)
  const [stagedImage, setStagedImage] = useState<string | null>(null);

  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [scannedBarcodeSuccess, setScannedBarcodeSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const barcodeFileInputRef = useRef<HTMLInputElement | null>(null);

  const zxingReaderRef = useRef<MultiFormatReader | null>(null);
  const barcodeScanLoopRef = useRef<number | null>(null);
  const isBarcodeScanningActiveRef = useRef<boolean>(false);

  // Initialize ZXing with TRY_HARDER and exact 1D/2D formats
  const getZxingReader = useCallback(() => {
    if (!zxingReaderRef.current) {
      const reader = new MultiFormatReader();
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.ITF,
        BarcodeFormat.QR_CODE,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      reader.setHints(hints);
      zxingReaderRef.current = reader;
    }
    return zxingReaderRef.current;
  }, []);

  // Stop camera tracks safely (Declared before useEffect hooks)
  const stopCameraStream = useCallback(() => {
    if (barcodeScanLoopRef.current) {
      cancelAnimationFrame(barcodeScanLoopRef.current);
      barcodeScanLoopRef.current = null;
    }
    isBarcodeScanningActiveRef.current = false;

    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          try {
            track.stop();
          } catch (e) {}
        });
      } catch (err) {
        console.warn('[CameraScanner] Error stopping tracks:', err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsInitializingCamera(false);
    setIsVideoPaused(false);
  }, []);

  // Universal Single Video Stream Starter (Declared before useEffect hooks)
  const startCameraStream = useCallback(async (targetFacing: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    setIsInitializingCamera(true);
    setIsVideoPaused(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('דפדפן זה אינו תומך במצלמה חיה ישירה. ניתן לצלם במצלמת המכשיר.');
      setIsInitializingCamera(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (firstErr) {
        console.warn('[CameraScanner] High-res constraints failed, falling back to universal video constraint for desktop/laptop webcams:', firstErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.defaultMuted = true;
        video.muted = true;
        video.volume = 0;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.srcObject = stream;

        // Apply hardware continuous macro focus and slight optical zoom (1.2x) for razor-sharp barcodes
        try {
          const track = stream.getVideoTracks()[0];
          if (track) {
            const caps: any = track.getCapabilities ? track.getCapabilities() : {};
            const adv: any = {};
            if (caps.focusMode && caps.focusMode.includes('continuous')) {
              adv.focusMode = 'continuous';
            }
            if (caps.zoom && caps.zoom.max >= 1.2) {
              adv.zoom = Math.min(1.2, caps.zoom.max);
            }
            if (Object.keys(adv).length > 0) {
              track.applyConstraints({ advanced: [adv] }).catch(() => {});
            }
          }
        } catch (fErr) {}

        const onPlay = async () => {
          try {
            await video.play();
            setCameraActive(true);
            setIsInitializingCamera(false);
            setIsVideoPaused(false);
            logMobileEvent('camera_ready', {
              resolution: `${video.videoWidth}x${video.videoHeight}`,
              facingMode: targetFacing,
            });
          } catch (playErr) {
            console.warn('[CameraScanner] Video play caught:', playErr);
            setCameraActive(true);
            setIsInitializingCamera(false);
            setIsVideoPaused(true);
            logMobileEvent('camera_play_blocked', { error: String(playErr) });

            // Auto-resume camera video playback on first user touch anywhere
            const handleFirstUserGesture = () => {
              if (videoRef.current) {
                videoRef.current.play().then(() => {
                  setIsVideoPaused(false);
                  logMobileEvent('camera_resumed_on_first_touch');
                }).catch(() => {});
              }
              window.removeEventListener('touchstart', handleFirstUserGesture);
              window.removeEventListener('pointerdown', handleFirstUserGesture);
              window.removeEventListener('click', handleFirstUserGesture);
            };
            window.addEventListener('touchstart', handleFirstUserGesture, { once: true });
            window.addEventListener('pointerdown', handleFirstUserGesture, { once: true });
            window.addEventListener('click', handleFirstUserGesture, { once: true });
          }
        };

        if (video.readyState >= 2) {
          onPlay();
        } else {
          video.onloadedmetadata = () => {
            onPlay();
          };
        }
      }
    } catch (err: any) {
      console.warn('[CameraScanner] getUserMedia error:', err);
      setIsInitializingCamera(false);
      logMobileEvent('camera_get_user_media_error', { error: String(err) });
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      setCameraError(
        isDenied
          ? 'גישה למצלמה נחסמה בדפדפן. יש לאשר הרשאת מצלמה בהגדרות, או ללחוץ על "צלמי במצלמת המכשיר".'
          : 'לא הצלחנו לפתוח את שידור המצלמה. באפשרותך לצלם ישירות במצלמת המכשיר.'
      );
    }
  }, [facingMode]);

  // Sync initialMode changes from parent (e.g. when user clicks "סרוק ברקוד" from result modal)
  useEffect(() => {
    if (initialMode && initialMode !== mode) {
      setMode(initialMode);
      setStagedImage(null);
      setBarcodeError(null);
      setScannedBarcodeSuccess(null);
      if (initialMode === 'barcode' || initialMode === 'camera') {
        startCameraStream(facingMode);
      }
      logMobileEvent('mode_switched', { newMode: initialMode });
    }
  }, [initialMode, facingMode, startCameraStream]);

  // Manage Camera Mode Lifecycle (Food and Barcode modes use the same rock-solid stream)
  useEffect(() => {
    const isCameraNeeded = (mode === 'camera' || mode === 'barcode') && isCameraTurnedOnByUser;

    if (isCameraNeeded) {
      if (!streamRef.current) {
        startCameraStream(facingMode);
      } else if (videoRef.current) {
        videoRef.current.play().catch(() => {});
        setIsVideoPaused(false);
      }
    } else {
      stopCameraStream();
    }
  }, [mode, facingMode, isCameraTurnedOnByUser, startCameraStream, stopCameraStream]);

  // Handle Reset Signal from parent (when user dismisses modal or resets to scan next item)
  useEffect(() => {
    if (resetTrigger) {
      setStagedImage(null);
      setScannedBarcodeSuccess(null);
      setBarcodeError(null);
      isProcessingBarcodeRef.current = false;
      if (mode === 'barcode' || mode === 'camera') {
        isBarcodeScanningActiveRef.current = true;
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().then(() => setIsVideoPaused(false)).catch(() => {});
        }
      }
    }
  }, [resetTrigger, mode]);

  // Stop camera only when unmounting the entire component
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Force resume playback if paused by browser
  const handleResumeVideo = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsVideoPaused(false);
        logMobileEvent('video_manual_resumed');
      } catch (e) {
        console.warn('Resume video caught:', e);
      }
    }
  };

  const isProcessingBarcodeRef = useRef<boolean>(false);

  // Lookup product by barcode from Open Food Facts & send to SIBO analysis
  const handleBarcodeLookup = useCallback(async (barcode: string) => {
    const cleanCode = barcode.trim();
    if (!cleanCode || isProcessingBarcodeRef.current) return;

    isProcessingBarcodeRef.current = true;
    isBarcodeScanningActiveRef.current = false;
    if (barcodeScanLoopRef.current) {
      cancelAnimationFrame(barcodeScanLoopRef.current);
      barcodeScanLoopRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.pause();
        setIsVideoPaused(true);
      } catch (pErr) {}
    }

    setIsFetchingBarcode(true);
    setBarcodeError(null);
    logMobileEvent('barcode_lookup_started', { barcode: cleanCode });

    try {
      const prod = await fetchProductByBarcode(cleanCode);
      const cleanName = prod.productName || `מוצר ארוז (${cleanCode})`;
      const textPrompt = prod.ingredientsText
        ? `${cleanName} (רכיבים: ${prod.ingredientsText})`
        : cleanName;

      logMobileEvent('barcode_lookup_success', {
        barcode: cleanCode,
        productName: prod.productName,
        found: prod.found,
      });

      await onAnalyze({
        textPrompt,
        barcode: cleanCode,
        imageBase64: prod.imageUrl || undefined,
      });
    } catch (e: any) {
      console.warn('[BarcodeScanner] Lookup error, analyzing barcode name fallback:', e);
      logMobileEvent('barcode_lookup_fallback_error', { barcode: cleanCode, error: String(e) });
      await onAnalyze({
        textPrompt: `מוצר ארוז (ברקוד ${cleanCode})`,
        barcode: cleanCode,
      });
    } finally {
      setIsFetchingBarcode(false);
      // Automatically re-enable scanning after 600ms cooldown so subsequent scans work instantly!
      setTimeout(() => {
        isProcessingBarcodeRef.current = false;
        if (mode === 'barcode' && !isLoading && !stagedImage) {
          isBarcodeScanningActiveRef.current = true;
          if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play().then(() => setIsVideoPaused(false)).catch(() => {});
          }
        }
      }, 600);
    }
  }, [onAnalyze, mode, isLoading, stagedImage]);

  // Real-Time High-Precision Barcode Scanner Worker
  useEffect(() => {
    if (mode !== 'barcode' || stagedImage || isLoading) {
      isBarcodeScanningActiveRef.current = false;
      if (barcodeScanLoopRef.current) {
        cancelAnimationFrame(barcodeScanLoopRef.current);
        barcodeScanLoopRef.current = null;
      }
      return;
    }

    isProcessingBarcodeRef.current = false;
    isBarcodeScanningActiveRef.current = true;
    setBarcodeError(null);
    setScannedBarcodeSuccess(null);

    const reader = getZxingReader();

    let lastZxingScanTime = 0;
    const zxingScanIntervalMs = 40; // 40ms interval for CPU ZXing

    // Modern Native BarcodeDetector (Hardware Accelerated if available)
    const hasNativeBarcodeDetector = 'BarcodeDetector' in window;
    let nativeDetector: any = null;
    if (hasNativeBarcodeDetector) {
      try {
        nativeDetector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
        });
      } catch (e) {
        nativeDetector = null;
      }
    }

    // Proportional canvas dynamically matching video dimensions (100% true aspect ratio)
    const canvas = document.createElement('canvas');
    const wideCanvas = document.createElement('canvas');
    wideCanvas.width = 720;
    wideCanvas.height = 360;
    const wideCtx = wideCanvas.getContext('2d', { willReadFrequently: true });

    const boostCanvas = document.createElement('canvas');
    boostCanvas.width = 720;
    boostCanvas.height = 360;
    const boostCtx = boostCanvas.getContext('2d', { willReadFrequently: true });

    let frameCount = 0;

    const scanFrame = async (now: number) => {
      if (!isBarcodeScanningActiveRef.current || mode !== 'barcode' || isProcessingBarcodeRef.current) return;

      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        frameCount++;

        if (frameCount % 60 === 0) {
          logMobileEvent('scanning_alive', {
            frames: frameCount,
            resolution: `${video.videoWidth}x${video.videoHeight}`,
          });
        }

        const vW = video.videoWidth;
        const vH = video.videoHeight;

        // Strategy 1: Instant Hardware GPU Native Barcode Detector on raw video
        if (nativeDetector) {
          try {
            const detected = await nativeDetector.detect(video);
            if (detected && detected.length > 0 && detected[0]?.rawValue && !isProcessingBarcodeRef.current) {
              const code = String(detected[0].rawValue).trim();
              if (code && code.length >= 6) {
                isBarcodeScanningActiveRef.current = false;
                setScannedBarcodeSuccess(code);
                logMobileEvent('barcode_captured_gpu', { code, format: detected[0].format });
                handleBarcodeLookup(code);
                return;
              }
            }
          } catch (detErr) {
            // fallback
          }
        }

        // Strategy 2: Wide Horizontal Macro Crop (720x360) for Cylindrical Bottles & Reflective Packaging
        if (wideCtx && vW >= 400 && vH >= 300) {
          try {
            const cropW = Math.min(vW, Math.floor(vW * 0.85));
            const cropH = Math.min(vH, Math.floor(cropW * 0.5));
            const startX = Math.floor((vW - cropW) / 2);
            const startY = Math.floor((vH - cropH) / 2);

            wideCtx.drawImage(video, startX, startY, cropW, cropH, 0, 0, 720, 360);

            // Pass 2A: Hardware GPU Detector on Wide Horizontal Crop
            if (nativeDetector) {
              try {
                const detectedCrop = await nativeDetector.detect(wideCanvas);
                if (detectedCrop && detectedCrop.length > 0 && detectedCrop[0]?.rawValue && !isProcessingBarcodeRef.current) {
                  const code = String(detectedCrop[0].rawValue).trim();
                  if (code && code.length >= 6) {
                    isBarcodeScanningActiveRef.current = false;
                    setScannedBarcodeSuccess(code);
                    logMobileEvent('barcode_captured_gpu_wide', { code, format: detectedCrop[0].format });
                    handleBarcodeLookup(code);
                    return;
                  }
                }
              } catch (cropGpuErr) {}
            }

            // Pass 2B: High-Contrast Filter for Glare / Plastic Bottles
            if (boostCtx) {
              const imgData = wideCtx.getImageData(0, 0, 720, 360);
              const d = imgData.data;
              for (let i = 0; i < d.length; i += 4) {
                const gray = (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8;
                // S-curve contrast boost
                const boosted = gray < 100 ? Math.max(0, gray * 0.5) : Math.min(255, (gray - 100) * 2.2 + 80);
                d[i] = boosted;
                d[i + 1] = boosted;
                d[i + 2] = boosted;
              }
              boostCtx.putImageData(imgData, 0, 0);

              // GPU Detector on High-Contrast Glare Filter
              if (nativeDetector) {
                try {
                  const detectedBoost = await nativeDetector.detect(boostCanvas);
                  if (detectedBoost && detectedBoost.length > 0 && detectedBoost[0]?.rawValue && !isProcessingBarcodeRef.current) {
                    const code = String(detectedBoost[0].rawValue).trim();
                    if (code && code.length >= 6) {
                      isBarcodeScanningActiveRef.current = false;
                      setScannedBarcodeSuccess(code);
                      logMobileEvent('barcode_captured_gpu_boost', { code, format: detectedBoost[0].format });
                      handleBarcodeLookup(code);
                      return;
                    }
                  }
                } catch (boostGpuErr) {}
              }

              // ZXing GlobalHistogram + Hybrid on High-Contrast Crop
              if (!isProcessingBarcodeRef.current && (now - lastZxingScanTime >= zxingScanIntervalMs)) {
                lastZxingScanTime = now;
                const cropLum = new RGBLuminanceSource(imgData.data, 720, 360);
                let zxResult = null;
                try {
                  zxResult = reader.decode(new BinaryBitmap(new GlobalHistogramBinarizer(cropLum)));
                } catch (e1) {
                  try {
                    zxResult = reader.decode(new BinaryBitmap(new HybridBinarizer(cropLum)));
                  } catch (e2) {}
                }

                if (zxResult && zxResult.getText() && !isProcessingBarcodeRef.current) {
                  const code = zxResult.getText().trim();
                  if (code && code.length >= 6) {
                    isBarcodeScanningActiveRef.current = false;
                    setScannedBarcodeSuccess(code);
                    logMobileEvent('barcode_captured_zxing_boost', { code });
                    handleBarcodeLookup(code);
                    return;
                  }
                }
              }
            }
          } catch (wideErr) {}
        }

        // Strategy 3: Full Proportional Frame with ZXing GlobalHistogram + Hybrid
        if (!isProcessingBarcodeRef.current && (now - lastZxingScanTime >= zxingScanIntervalMs)) {
          lastZxingScanTime = now;
          try {
            const targetW = 540;
            const targetH = Math.round(vH * (targetW / vW));
            if (canvas.width !== targetW || canvas.height !== targetH) {
              canvas.width = targetW;
              canvas.height = targetH;
            }
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, vW, vH, 0, 0, targetW, targetH);
              const fullData = ctx.getImageData(0, 0, targetW, targetH);
              const fullLum = new RGBLuminanceSource(fullData.data, targetW, targetH);

              let fullResult = null;
              try {
                fullResult = reader.decode(new BinaryBitmap(new GlobalHistogramBinarizer(fullLum)));
              } catch (e1) {
                try {
                  fullResult = reader.decode(new BinaryBitmap(new HybridBinarizer(fullLum)));
                } catch (e2) {}
              }

              if (fullResult && fullResult.getText() && !isProcessingBarcodeRef.current) {
                const code = fullResult.getText().trim();
                if (code && code.length >= 6) {
                  isBarcodeScanningActiveRef.current = false;
                  setScannedBarcodeSuccess(code);
                  logMobileEvent('barcode_captured_zxing_full', { code });
                  handleBarcodeLookup(code);
                  return;
                }
              }
            }
          } catch (zxingErr) {
            // normal frame
          }
        }
      }

      if (isBarcodeScanningActiveRef.current && !isProcessingBarcodeRef.current) {
        barcodeScanLoopRef.current = requestAnimationFrame(scanFrame);
      }
    };

    barcodeScanLoopRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isBarcodeScanningActiveRef.current = false;
      if (barcodeScanLoopRef.current) {
        cancelAnimationFrame(barcodeScanLoopRef.current);
        barcodeScanLoopRef.current = null;
      }
    };
  }, [mode, stagedImage, isLoading, getZxingReader, handleBarcodeLookup]);

  // High-Resolution Native Mobile Photo Scan for Barcode
  const handleBarcodeFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsFetchingBarcode(true);
    setBarcodeError(null);

    // Modern Native BarcodeDetector
    const hasNativeBarcodeDetector = 'BarcodeDetector' in window;
    let nativeDetector: any = null;
    if (hasNativeBarcodeDetector) {
      try {
        nativeDetector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
        });
      } catch (e) {
        nativeDetector = null;
      }
    }

    const reader = getZxingReader();
    const img = document.createElement('img');
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = async () => {
      // Step 1: Try Native Hardware GPU BarcodeDetector on full image (0ms)
      if (nativeDetector) {
        try {
          const detected = await nativeDetector.detect(img);
          if (detected && detected.length > 0 && detected[0]?.rawValue) {
            const code = String(detected[0].rawValue).trim();
            if (code && code.length >= 6) {
              URL.revokeObjectURL(objectUrl);
              logMobileEvent('barcode_photo_captured_gpu', { code });
              await handleBarcodeLookup(code);
              return;
            }
          }
        } catch (gpuErr) {}
      }

      // Step 2: High-Speed Downscaled Canvas (Max 1280px) for Fast ZXing Decoding
      try {
        const MAX_DIM = 1280;
        let targetW = img.naturalWidth;
        let targetH = img.naturalHeight;
        if (targetW > MAX_DIM || targetH > MAX_DIM) {
          if (targetW > targetH) {
            targetH = Math.round((targetH * MAX_DIM) / targetW);
            targetW = MAX_DIM;
          } else {
            targetW = Math.round((targetW * MAX_DIM) / targetH);
            targetH = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          const luminanceSource = new RGBLuminanceSource(imgData.data, targetW, targetH);
          let result = null;
          try {
            result = reader.decode(new BinaryBitmap(new GlobalHistogramBinarizer(luminanceSource)));
          } catch (e1) {
            try {
              result = reader.decode(new BinaryBitmap(new HybridBinarizer(luminanceSource)));
            } catch (e2) {}
          }

          if (result && result.getText()) {
            const code = result.getText().trim();
            if (code && code.length >= 6) {
              URL.revokeObjectURL(objectUrl);
              logMobileEvent('barcode_photo_captured_zxing', { code });
              await handleBarcodeLookup(code);
              return;
            }
          }
        }
      } catch (zxErr) {
        // fallback to SIBO image analyzer
      }
      URL.revokeObjectURL(objectUrl);
      processImageFile(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      processImageFile(file);
    };
  };

  // Flip camera between front and back
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCameraStream(nextFacing);
  };

  // Take Snapshot from video stream — 1-TAP DIRECT SIBO ANALYSIS!
  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      nativeCameraInputRef.current?.click();
      return;
    }

    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 150);

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

    // ⚡ 1-TAP DIRECT ANALYSIS (No staging delay, immediate traffic light!)
    onAnalyze({ imageBase64: dataUrl, mimeType: 'image/jpeg' });
  };

  // User confirmed the photo -> send for SIBO analysis!
  const handleConfirmStagedImage = () => {
    if (!stagedImage) return;
    const imgToSend = stagedImage;
    setStagedImage(null);
    onAnalyze({ imageBase64: imgToSend, mimeType: 'image/jpeg' });
  };

  // User discarded the photo -> return back to live camera stream!
  const handleRetakePhoto = () => {
    setStagedImage(null);
    setCameraError(null);
    setTimeout(() => startCameraStream(facingMode), 100);
  };

  // Handle file select (Gallery or Native Mobile Camera)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    e.target.value = '';
  };

  // Process file to compressed base64 for instant upload (High-Res 1920px for Hebrew OCR)
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1920; // Full HD for sharp Hebrew text OCR on bottles & packages
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
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.90);
          setStagedImage(null);
          // ⚡ 1-TAP DIRECT ANALYSIS FOR CAMERA PHOTO!
          onAnalyze({ imageBase64: compressedDataUrl, mimeType: 'image/jpeg' });
        } else {
          setStagedImage(null);
          onAnalyze({ imageBase64: rawDataUrl, mimeType: 'image/jpeg' });
        }
      };
      img.onerror = () => {
        setStagedImage(null);
        onAnalyze({ imageBase64: rawDataUrl, mimeType: 'image/jpeg' });
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

  // Web Speech API for Hebrew Voice Dictation - Dynamic Desktop & Mobile Lifecycle
  const handleToggleVoiceInput = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechError('הדפדפן שלך אינו תומך בהכתבה קולית ישירה (מומלץ לפתוח ב-Google Chrome או Edge במחשב).');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRec();
      recognition.lang = 'he-IL';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        if (transcript) {
          setTextInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setSpeechError('גישת המיקרופון חסומה. לחצי על סמל המנעול/הגדרות בשורת הכתובת בדפדפן ואשרי שימוש במיקרופון 🎤');
        } else if (event.error === 'no-speech') {
          setSpeechError('לא נקלט קול, לחצי שוב על המיקרופון ודברי בקול ברור.');
        } else if (event.error === 'network') {
          setSpeechError('שגיאת רשת בשירות זיהוי הדיבור. בדקי חיבור לאינטרנט.');
        } else {
          setSpeechError('לא זוהה דיבור, לחצי שוב על המיקרופון ודברי ברור.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      if (navigator.vibrate) navigator.vibrate([50]);
      recognition.start();
    } catch (err: any) {
      console.warn('Recognition start failed:', err);
      setSpeechError('לא ניתן להפעיל את המיקרופון. אנא ודאי שיש מיקרופון מחובר ומאושר במחשב.');
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    }
    onAnalyze({ textPrompt: textInput.trim() });
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    handleBarcodeLookup(barcodeInput.trim());
  };

  const handleResetScanner = () => {
    setStagedImage(null);
    setCameraError(null);
    setBarcodeError(null);
    setScannedBarcodeSuccess(null);
    setIsFetchingBarcode(false);
    setTextInput('');
    setBarcodeInput('');
    stopCameraStream();
    if (mode === 'camera' || mode === 'barcode') {
      setTimeout(() => startCameraStream(facingMode), 100);
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
            setStagedImage(null);
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
            setStagedImage(null);
            setMode('barcode');
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
            setStagedImage(null);
            setMode('text');
            stopCameraStream();
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
            setStagedImage(null);
            setMode('upload');
            stopCameraStream();
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-lg text-center space-y-4 animate-fadeIn">
          {stagedImage && (
            <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-emerald-400 relative">
              <img src={stagedImage} alt="תמונת המאכל שצולם" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-xs flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-300 animate-spin" />
              </div>
            </div>
          )}

          {!stagedImage && (
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
          {/* CAMERA & BARCODE SHARED FLUID LIVE VIDEO STREAM */}
          {(mode === 'camera' || mode === 'barcode') && (
            <div className="space-y-3 sm:space-y-4">
              {/* STAGED PHOTO REVIEW STATE (Nir inspects the photo and confirms!) */}
              {stagedImage ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="relative bg-stone-950 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center border-2 border-emerald-500 shadow-lg">
                    <img src={stagedImage} alt="תמונה שצולמה לבדיקה" className="w-full h-full object-contain" />
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-xs font-bold border border-white/20">
                      📸 תמונה שצולמה
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1">
                    <h4 className="text-sm font-black text-emerald-950">התמונה צולמה בהצלחה!</h4>
                    <p className="text-xs text-emerald-800 font-medium">
                      בדקי שהמאכל או האריזה נראים בבירור, ולחצי על הכפתור הירוק לבדיקת הרמזור:
                    </p>
                  </div>

                  {/* Confirmation & Retake Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleConfirmStagedImage}
                      className="flex-1 w-full py-4 px-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-2 ring-emerald-400/30"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span>🚦 בדוק מאכל זה ברמזור SIBO 🟢🟡🔴</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRetakePhoto}
                      className="w-full sm:w-auto py-4 px-6 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 border border-stone-300 shadow-xs cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-5 h-5 text-stone-600" />
                      <span>צלמי שוב (איפוס) 🔄</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {!isCameraTurnedOnByUser ? (
                    <div className="bg-stone-900 rounded-2xl p-8 text-center space-y-4 text-white shadow-inner aspect-[4/3] sm:aspect-[16/9] min-h-[260px] flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-2xl font-black">
                        📸
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <h4 className="text-base font-black text-white">המצלמה במחשב במצב המתנה</h4>
                        <p className="text-xs text-stone-300 font-medium">
                          המצלמה כבויה כדי לשמור על פרטיות ושלא תופיע נקודה אדומה בדפדפן.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 flex-wrap justify-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCameraTurnedOnByUser(true);
                            startCameraStream(facingMode);
                          }}
                          className="py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ring-2 ring-emerald-400/30"
                        >
                          <Play className="w-4 h-4" />
                          <span>הפעל מצלמה עכשיו 📸</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-center text-xs font-bold text-stone-700 flex items-center justify-between">
                        <span>
                          {mode === 'barcode'
                            ? '🏷️ סורק ברקודים חי: כווני את הפס האדום למרכז הברקוד לזיהוי מיידי'
                            : '📸 המצלמה פועלת בשידור חי: כווני למוצר בנחת ולחצי על כפתור הצילום למטה'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCameraTurnedOnByUser(false);
                            stopCameraStream();
                          }}
                          className="px-2.5 py-1 bg-stone-200 hover:bg-rose-100 hover:text-rose-800 text-stone-800 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CameraOff className="w-3 h-3 text-rose-600" />
                          <span>כבה מצלמה</span>
                        </button>
                      </div>

                      <div
                        onClick={handleResumeVideo}
                        className="relative bg-stone-950 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] min-h-[260px] flex items-center justify-center shadow-inner cursor-pointer"
                      >
                        {isFlashActive && (
                          <div className="absolute inset-0 bg-white z-30 animate-fade-out pointer-events-none" />
                        )}

                        {/* Turn off camera overlay button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCameraTurnedOnByUser(false);
                            stopCameraStream();
                          }}
                          className="absolute top-3 left-3 z-30 px-3 py-1.5 rounded-xl bg-stone-950/80 hover:bg-rose-900/90 text-white text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-xs border border-white/20 cursor-pointer active:scale-95 shadow-md"
                          title="כיבוי המצלמה והסרת הנקודה האדומה בדפדפן"
                        >
                          <CameraOff className="w-3.5 h-3.5 text-rose-400" />
                          <span>כבה מצלמה 🛑</span>
                        </button>

                        {cameraError ? (
                          <div className="p-6 text-center space-y-3 text-stone-300 max-w-md pointer-events-auto">
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
                              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                            />

                            {/* If browser paused autoplay, show gentle resume button */}
                            {isVideoPaused && (
                              <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white z-20 pointer-events-auto">
                                <button
                                  type="button"
                                  onClick={handleResumeVideo}
                                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 animate-bounce"
                                >
                                  <Play className="w-5 h-5 fill-current" />
                                  <span>לחצי להפעלת שידור המצלמה ▶️</span>
                                </button>
                              </div>
                            )}

                            {isInitializingCamera && (
                              <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-stone-300 z-10">
                                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                <span className="text-xs font-bold">מפעיל מצלמה...</span>
                              </div>
                            )}

                            {/* Barcode Laser Overlay (When in Barcode Mode) */}
                            {mode === 'barcode' && cameraActive && !isVideoPaused && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
                                <div className="w-64 h-36 sm:w-80 sm:h-44 border-2 border-dashed border-indigo-400/90 rounded-2xl flex items-center justify-center relative shadow-lg">
                                  {/* Laser Line */}
                                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_14px_#f43f5e] animate-pulse" />
                                  <span className="absolute -top-3 bg-indigo-600 text-white text-[11px] px-3 py-0.5 rounded-full font-bold shadow-xs">
                                    מקמי ברקוד כאן
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Food Frame Target Guide (When in Camera Mode) */}
                            {mode === 'camera' && cameraActive && !isVideoPaused && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
                                <div className="w-56 h-56 sm:w-72 sm:h-72 border-2 border-dashed border-white/80 rounded-3xl flex items-center justify-center shadow-lg">
                                  <span className="bg-stone-900/80 text-white text-xs px-3.5 py-1 rounded-full font-bold backdrop-blur-xs shadow-sm">
                                    הציבי את המאכל במרכז
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Success Badge for Barcode */}
                            {scannedBarcodeSuccess && (
                              <div className="absolute top-4 inset-x-4 p-3 rounded-2xl bg-emerald-600 text-white text-xs font-black text-center shadow-lg animate-bounce z-30 flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>ברקוד זוהה בהצלחה ({scannedBarcodeSuccess})! שולף נתונים...</span>
                              </div>
                            )}

                            {/* Top Status & Controls */}
                            <div className="absolute top-3 right-3 flex items-center gap-2 z-20 pointer-events-auto">
                              {cameraActive && (
                                <div className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs border border-white/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                  <span>מצלמה מוכנה</span>
                                </div>
                              )}

                              {cameraActive && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFacingMode();
                                  }}
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
                    </>
                  )}

                  {/* Mode-Specific Action Buttons */}
                  {mode === 'camera' ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                      <button
                        id="capture-photo-btn"
                        type="button"
                        onClick={() => {
                          if (cameraActive && videoRef.current && videoRef.current.videoWidth > 0) {
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
                  ) : (
                    /* BARCODE ACTION BUTTONS */
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => barcodeFileInputRef.current?.click()}
                          className="flex-1 w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-600 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                        >
                          <Camera className="w-5 h-5 text-indigo-200" />
                          <span>צלמי תמונת ברקוד במצלמת הטלפון (פוקוס מקרו) 📸</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetScanner}
                          className="w-full sm:w-auto py-4 px-5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 border border-stone-300 shadow-xs cursor-pointer active:scale-95"
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

                      {/* Manual Barcode Input Form */}
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
                </>
              )}
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
                <div className="flex items-center justify-between">
                  <label htmlFor="food-text-input" className="block text-xs font-black text-stone-700">
                    שם המאכל, המנה או רשימת הרכיבים:
                  </label>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    🎙️ ניתן גם לדבר במקום להקליד
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="food-text-input"
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="למשל: מיץ תפוזים סחוט, קפה שחור, קוטג', במבה, קקאו..."
                    className={`w-full pl-28 pr-11 py-3.5 bg-stone-50 border rounded-2xl text-sm focus:ring-2 focus:outline-hidden transition-all text-stone-900 placeholder:text-stone-400 font-medium ${
                      isListening
                        ? 'border-rose-400 ring-2 ring-rose-300 bg-rose-50/50'
                        : 'border-stone-300 focus:ring-amber-500'
                    }`}
                  />
                  <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />

                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {textInput && (
                      <button
                        type="button"
                        onClick={() => setTextInput('')}
                        className="text-stone-400 hover:text-stone-700 text-xs font-bold w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center cursor-pointer"
                        title="נקה טקסט"
                      >
                        ✕
                      </button>
                    )}
                    {/* Inline Microphone Button with Desktop Label */}
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-300'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-2xs'
                      }`}
                      title={isListening ? 'לחצי לסיום הדיבור' : 'חיפוש קולי - לחצי ודברי למיקרופון במחשב או בטלפון'}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span className="text-xs font-bold hidden sm:inline">הפסק</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 text-amber-800" />
                          <span className="text-xs font-bold hidden sm:inline text-amber-950">מיקרופון</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Voice Listening Animation Banner */}
              {isListening && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-300 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                    </span>
                    <div>
                      <p className="text-xs font-black text-rose-950">
                        🎙️ מקשיב לך עכשיו... דברי ברור למיקרופון!
                      </p>
                      <p className="text-[11px] text-rose-800 font-medium">
                        (למשל: "מיץ תפוזים פרי מור" או "חביתה עם שמן זית ומלפפון")
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer active:scale-95"
                  >
                    סיום דיבור 🛑
                  </button>
                </div>
              )}

              {/* Voice Error Alert if microphone blocked */}
              {speechError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold">{speechError}</span>
                </div>
              )}

              {/* Voice Trigger Button (if not listening) */}
              {!isListening && (
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300 rounded-2xl text-xs sm:text-sm font-black text-amber-950 flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  <Mic className="w-4 h-4 text-amber-700" />
                  <span>🎙️ דברי למיקרופון (הכתבה קולית בעברית) ✨</span>
                </button>
              )}

              {/* Quick suggestions chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-stone-400">חיפושים נפוצים:</span>
                {['מיץ תפוזים סחוט', 'קקאו טהור', 'קצפת צמחית', 'קוטג\' ללא לקטוז', 'פיוז תה', 'חלב שקדים', 'אורז בסמטי', 'חומוס', 'קפה'].map((item) => (
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
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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
        <span className="inline-flex items-center gap-1 font-bold text-rose-950 bg-gradient-to-r from-rose-100 via-amber-100 to-orange-100 border border-amber-300 px-3 py-1 rounded-xl shadow-2xs">
          🔍 מוצר לא מזוהה (סריקה חוזרת / הקלדה)
        </span>
      </div>
    </div>
  );
};
