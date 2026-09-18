/**
 * Image Optimizer Utility for Web Applications
 * Mengompresi dan mengubah ukuran gambar (Avatar, Cover, Banner) di sisi browser (Client-Side)
 * agar ukuran Base64 sangat ringan (< 50 KB), cepat dimuat oleh pengunjung,
 * dan tidak melanggar batas ukuran dokumen Cloud Firestore (1 MB).
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp';
}

/**
 * Kompres Base64 Data URL menjadi ukuran dan dimensi yang optimal menggunakan HTML5 Canvas
 */
export const compressBase64Image = (
  dataUrl: string,
  options: CompressOptions = {}
): Promise<string> => {
  if (typeof window === 'undefined' || !dataUrl || !dataUrl.startsWith('data:image/')) {
    return Promise.resolve(dataUrl || '');
  }

  // Jika ukuran string sudah cukup kecil (< 60 KB), tidak perlu kompresi ulang
  if (dataUrl.length < 80000) {
    return Promise.resolve(dataUrl);
  }

  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.85,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let { width, height } = img;

        // Hitung aspect ratio agar proporsional
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Jika JPEG, berikan background putih agar gambar transparan (PNG) tidak menjadi hitam
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL(format, quality);

        // Jika hasil kompresi lebih kecil, gunakan hasil kompresi
        if (compressed && compressed.length < dataUrl.length) {
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      } catch (err) {
        console.warn('[ImageOptimizer] Gagal mengompres gambar via canvas:', err);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      console.warn('[ImageOptimizer] Gagal memuat image source untuk kompresi');
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
};

/**
 * Membaca file gambar dari input browser dan mengompresnya secara instan
 */
export const compressImageFile = (
  file: File,
  options: CompressOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawBase64 = e.target?.result as string;
      if (!rawBase64) {
        reject(new Error('Gagal membaca data file gambar.'));
        return;
      }
      try {
        const compressed = await compressBase64Image(rawBase64, options);
        resolve(compressed);
      } catch {
        resolve(rawBase64);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
