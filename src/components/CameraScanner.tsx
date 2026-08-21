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
  CheckCircle2,
} from 'lucide-react';

interface CameraScannerProps {
  currentPhase: SiboPhase;
  onAnalyze: (payload: { imageBase64?: string; textPrompt?: string; mimeType?: string }) => Promise<void>;
  isLoading: boolean;
  onOpenAllowedForbidden?: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  currentPhase,
  onAnalyze,
  isLoading,
  onOpenAllowedForbidden,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload' | 'text'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef(true);
  const requestCounterRef = useRef(0);

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

    // Constraint Strategy 1: Ideal target facingMode with 720p/1080p
    try {
      activeStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
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
          video: { facingMode: targetFacing },
          audio: false,
        });
      } catch (e2) {
        console.warn('[CameraScanner] Strategy 2 failed, trying Strategy 3 (fallback facingMode)...', e2);
      }
    }

    // Constraint Strategy 3: Inverted facingMode (user or environment fallback)
    if (!activeStream && isMountedRef.current && currentRequestId === requestCounterRef.current) {
      try {
        const fallbackFacing = targetFacing === 'environment' ? 'user' : 'environment';
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: fallbackFacing } },
          audio: false,
        });
      } catch (e3) {
        console.warn('[CameraScanner] Strategy 3 failed, trying Strategy 4 (any video device)...', e3);
      }
    }

    // Constraint Strategy 4: Any available video device
    if (!activeStream && isMountedRef.current && currentRequestId === requestCounterRef.current) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (e4: any) {
        console.error('[CameraScanner] All camera initialization strategies failed:', e4);
        if (isMountedRef.current && currentRequestId === requestCounterRef.current) {
          let errorMsg = 'לא ניתן להפעיל את המצלמה. אנא ודאי שאישרת גישה למצלמה בדפדפן, או השתמשי בצילום מהטלפון.';
          if (e4?.name === 'NotAllowedError' || e4?.name === 'PermissionDeniedError') {
            errorMsg = 'הרשאת המצלמה נדחתה. יש לאשר שימוש במצלמה בהגדרות הדפדפן כדי לצפות במצלמה החיה.';
          } else if (e4?.name === 'NotFoundError' || e4?.name === 'DevicesNotFoundError') {
            errorMsg = 'לא נמצאה מצלמה מחוברת במכשיר זה. ניתן להעלות תמונה או להקליד מאכל.';
          } else if (e4?.name === 'NotReadableError' || e4?.name === 'TrackStartError') {
            errorMsg = 'המצלמה בשימוש ע"י אפליקציה אחרת. אנא סגרי חלונות/אפליקציות מצלמה אחרות ונסי שוב.';
          }
          setCameraError(errorMsg);
          setIsInitializingCamera(false);
          setCameraActive(false);
        }
        return;
      }
    }

    // Check if request is still current and component is mounted
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

        try {
          await video.play();
          if (isMountedRef.current) {
            setCameraActive(true);
          }
        } catch (playErr) {
          console.warn('[CameraScanner] Play interrupted, waiting for loadedmetadata event...', playErr);
        }
      }

      if (isMountedRef.current) {
        setIsInitializingCamera(false);
        checkAvailableCameras();
      }
    }
  }, [facingMode, stopCamera, checkAvailableCameras]);

  // Track mount state and trigger camera
  useEffect(() => {
    isMountedRef.current = true;

    if (mode === 'camera' && !isLoading) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [mode, isLoading, facingMode, startCamera, stopCamera]);

  // Flip camera between front and back
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Video metadata & canplay handlers
  const handleVideoCanPlay = () => {
    if (videoRef.current && isMountedRef.current) {
      videoRef.current.play().then(() => {
        setCameraActive(true);
        setIsInitializingCamera(false);
      }).catch((err) => {
        console.warn('[CameraScanner] CanPlay video.play catch:', err);
      });
    }
  };

  // Capture snapshot from live video stream
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual shutter flash
    setIsFlashActive(true);
    setTimeout(() => {
      if (isMountedRef.current) setIsFlashActive(false);
    }, 250);

    const videoWidth = video.videoWidth || 1280;
    const videoHeight = video.videoHeight || 720;

    // Scale to max dimension 1280px for optimal speed and Gemini clarity
    const MAX_DIM = 1280;
    let targetWidth = videoWidth;
    let targetHeight = videoHeight;

    if (targetWidth > MAX_DIM || targetHeight > MAX_DIM) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * MAX_DIM) / targetWidth);
        targetWidth = MAX_DIM;
      } else {
        targetWidth = Math.round((targetWidth * MAX_DIM) / targetHeight);
        targetHeight = MAX_DIM;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // If front camera (user mode), optionally mirror canvas
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
  };

  // Process file to base64
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewImage(dataUrl);
      stopCamera();
      onAnalyze({ imageBase64: dataUrl, mimeType: file.type || 'image/jpeg' });
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

  return (
    <div id="camera-scanner-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Intro Header Card */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-extrabold shadow-2xs border border-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>פרוטוקול תזונה קליני ל-SIBO</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
          סורק רמזור מזון לסיבו (SIBO) לגורגורילה
        </h2>
        <p className="text-sm text-stone-600 max-w-2xl mx-auto">
          צלמי כל מאכל, צלחת, מוצר בסופר או תפריט — המערכת תנתח את רמת התסיסה וה-FODMAP ותסמן מיד{' '}
          <span className="text-emerald-700 font-bold">באור ירוק (מותר)</span>,{' '}
          <span className="text-amber-700 font-bold">אור צהוב (מוגבל)</span> או{' '}
          <span className="text-rose-700 font-bold">אור אדום (אסור)</span>.
        </p>
      </div>

      {/* Hidden Native Mobile Camera Input (Direct Smartphone Camera Trigger) */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Input Mode Selector Tabs & Allowed/Forbidden Quick Button */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <div className="inline-flex p-1 rounded-2xl bg-gradient-to-r from-sky-100/80 via-purple-100/80 to-amber-100/80 border border-stone-300/80 text-xs font-semibold shadow-xs">
          <button
            id="scanner-mode-camera"
            type="button"
            onClick={() => {
              setPreviewImage(null);
              setMode('camera');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'camera'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold'
                : 'text-sky-900 hover:text-sky-950 hover:bg-white/60'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>מצלמה חיה</span>
          </button>

          <button
            id="scanner-mode-upload"
            type="button"
            onClick={() => {
              setMode('upload');
              stopCamera();
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'upload'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm font-bold'
                : 'text-purple-900 hover:text-purple-950 hover:bg-white/60'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>העלאת תמונה</span>
          </button>

          <button
            id="scanner-mode-text"
            type="button"
            onClick={() => {
              setMode('text');
              stopCamera();
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'text'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm font-bold'
                : 'text-amber-900 hover:text-amber-950 hover:bg-white/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>הקלדת מאכל / מנה</span>
          </button>
        </div>

        {/* מותר / אסור Button positioned in top line */}
        {onOpenAllowedForbidden && (
          <button
            id="btn-allowed-forbidden-top-row"
            type="button"
            onClick={onOpenAllowedForbidden}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md active:scale-95 flex items-center gap-2 border border-emerald-400/50 cursor-pointer ring-2 ring-emerald-400/20"
          >
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            </span>
            <span>מותר / אסור 🚦</span>
          </button>
        )}
      </div>

      {/* Loading Overlay State */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-emerald-500/40 shadow-lg text-center space-y-6 animate-pulse">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
            <div className="relative w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-10 h-10 animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-stone-900">
              מנתח את המאכל על פי פרוטוקול SIBO קליני...
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              בודק ריכוז פרוקטנים, לקטוז, עודף פרוקטוז, סורביטול, מניטול וגלקטנים לפי הנחיות ד״ר סיבקר ומונאש
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 max-w-md mx-auto text-xs text-emerald-900 font-medium">
            💡 <strong>ידעת?</strong> בסיבו, חיידקים שנמצאים במעי הדק מתסיסים סוכרים תוך פחות מ-30 דקות.
            אור ירוק מבטיח שהחיידקים יורעבו ולא יוכלו לתסוס!
          </div>
        </div>
      ) : (
        /* Main Viewfinder / Scanner Area */
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-4 sm:p-6">
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
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        cameraActive ? 'opacity-100' : 'opacity-0'
                      } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />

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
                            כווני את המצלמה למאכל
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

                      {/* Camera Flip / Switcher Button (Available if multiple cameras or on mobile) */}
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

              {/* Camera Action Buttons (Clean hero capture button - Absolutely No Refresh button) */}
              {!cameraError && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    id="capture-photo-btn"
                    type="button"
                    onClick={captureSnapshot}
                    disabled={!cameraActive || isInitializingCamera}
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white font-extrabold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-2 ring-emerald-400/30"
                  >
                    <Camera className="w-6 h-6" />
                    <span>צלם ובדוק ברמזור 🚦</span>
                  </button>

                  {/* Direct smartphone camera fallback trigger */}
                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="text-xs text-stone-600 hover:text-emerald-700 py-2.5 px-4 rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                    title="פתיחת מצלמת הטלפון המלאה"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>או צלמי ישירות מהטלפון / גלריה</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD MODE */}
          {mode === 'upload' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-stone-300 hover:border-emerald-400 bg-stone-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-bold text-stone-800">
                    לחצי כאן להעלאת תמונה של המאכל
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    תומך בכל סוגי התמונות מהטלפון או המחשב (JPEG, PNG, WEBP)
                  </p>
                </div>
                <span className="inline-block px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 shadow-2xs">
                  בחירת קובץ מהגלריה
                </span>
              </div>
            </div>
          )}

          {/* TEXT SEARCH MODE */}
          {mode === 'text' && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="relative">
                <input
                  id="food-text-input"
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="הקלידי שם מאכל, מנה או מצרך (למשל: סושי סלמון, חביתה עם שמן זית, חומוס...)"
                  className="w-full pl-4 pr-12 py-3.5 bg-stone-50 border border-stone-300 rounded-2xl text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <Search className="w-5 h-5 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                {onOpenAllowedForbidden ? (
                  <button
                    type="button"
                    onClick={onOpenAllowedForbidden}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <span>רשימת מותר / אסור המלאה 🚦</span>
                  </button>
                ) : <div />}

                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  בדוק ברמזור SIBO 🚦
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
