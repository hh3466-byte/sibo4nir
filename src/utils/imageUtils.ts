/**
 * High-performance client-side image compressor & optimizer for Hebrew OCR
 * Shrinks 10MB+ mobile camera photos to ~300KB Full-HD (1600px-1920px)
 * keeping text razor-sharp for Gemini AI Vision OCR.
 */
export async function optimizeImageForOcr(fileOrDataUrl: File | string): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImage = (img: HTMLImageElement) => {
      try {
        const MAX_DIM = 1920; // Full HD for pin-sharp Hebrew text
        let width = img.width || 1280;
        let height = img.height || 720;

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

        if (!ctx) {
          if (typeof fileOrDataUrl === 'string') {
            resolve(fileOrDataUrl);
          } else {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(fileOrDataUrl);
          }
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Quality 0.88 gives ~300KB-500KB file with 100% crisp OCR readability
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.88);
        resolve(compressedBase64);
      } catch (err) {
        console.warn('[ImageOptimizer] Canvas compress failed, using fallback:', err);
        if (typeof fileOrDataUrl === 'string') {
          resolve(fileOrDataUrl);
        } else {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(fileOrDataUrl);
        }
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      const img = new Image();
      img.onload = () => processImage(img);
      img.onerror = () => resolve(fileOrDataUrl);
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new Image();
        img.onload = () => processImage(img);
        img.onerror = () => resolve(src);
        img.src = src;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
