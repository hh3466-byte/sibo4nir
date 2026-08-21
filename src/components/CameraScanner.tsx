import React, { useState, useRef, useEffect } from 'react';
import { SiboPhase } from '../types';
import {
  Camera,
  Upload,
  Search,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle,
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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isPhase1 = currentPhase === 'phase1_strict';

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('לא ניתן להפעיל את המצלמה. ניתן להעלות תמונה מהגלריה או להקליד את שם המאכל.');
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  // Capture image from video stream
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreviewImage(dataUrl);
    stopCamera();
    onAnalyze({ imageBase64: dataUrl, mimeType: 'image/jpeg' });
  };

  // Handle file select
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
      onAnalyze({ imageBase64: dataUrl, mimeType: file.type || 'image/jpeg' });
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop
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

        {/* מותר / אסור Button positioned right in the top line next to the food typing option */}
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
                {cameraError ? (
                  <div className="p-6 text-center space-y-3 text-stone-300">
                    <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-sm font-medium">{cameraError}</p>
                    <button
                      onClick={() => setMode('upload')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                    >
                      העלאת תמונה במקום
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Viewfinder Target Overlay Guide */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                      <div className="w-64 h-64 border-2 border-dashed border-white/60 rounded-3xl flex items-center justify-center">
                        <span className="bg-stone-900/70 text-white/90 text-xs px-3 py-1 rounded-full font-medium backdrop-blur-xs">
                          כווני את המצלמה למאכל
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Camera Action Buttons */}
              {!cameraError && (
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    id="capture-photo-btn"
                    onClick={captureSnapshot}
                    disabled={!cameraActive}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-base rounded-2xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>צלם ובדוק ברמזור 🚦</span>
                  </button>

                  <button
                    onClick={startCamera}
                    title="הפעל מחדש מצלמה"
                    className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
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
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold text-sm rounded-xl transition-all shadow-xs"
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
