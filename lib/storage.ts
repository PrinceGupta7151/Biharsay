import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

/**
 * Compresses an image file on the client using HTML5 Canvas.
 * Produces a high-quality lightweight JPEG (~30-50KB) that safely fits into Firestore documents.
 */
export function compressImage(file: File, maxWidth = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Upload story thumbnail image.
 * Tries Firebase Storage with a strict 2.5s timeout, and smoothly falls back to an optimized, lightweight compressed image.
 */
export async function uploadStoryThumbnail(file: File): Promise<string> {
  // Always prepare compressed data URL first (~30-50KB)
  const compressedDataUrl = await compressImage(file, 800, 0.75);

  if (isFirebaseConfigured() && storage) {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `submissions/${Date.now()}_${cleanName}`;
      const storageRef = ref(storage, filename);
      
      const uploadPromise = (async () => {
        const snapshot = await uploadBytes(storageRef, file, {
          contentType: file.type || 'image/jpeg',
        });
        return await getDownloadURL(snapshot.ref);
      })();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Storage upload timed out')), 2500)
      );

      const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage upload timed out or unavailable, using optimized thumbnail:', err);
    }
  }

  return compressedDataUrl;
}

