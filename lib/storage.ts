import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

/**
 * Upload story thumbnail image to Firebase Storage.
 * Generates a public CDN download URL, with local base64 fallback for offline/sandbox resiliency.
 */
export async function uploadStoryThumbnail(file: File): Promise<string> {
  if (isFirebaseConfigured() && storage) {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `submissions/${Date.now()}_${cleanName}`;
      const storageRef = ref(storage, filename);
      
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/jpeg',
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage upload failed, falling back to data URL:', err);
    }
  }

  // Fallback: Convert to Base64 data URL
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
