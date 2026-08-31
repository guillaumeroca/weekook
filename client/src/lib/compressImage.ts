/**
 * Compresse une image via Canvas avant upload.
 * Étape 1 : réduit la qualité JPEG de 0.85 → 0.40 par paliers de 0.1
 * Étape 2 : si toujours trop lourd, réduit les dimensions de 25% et recommence
 * Cible : 500 KB (marge confortable sous la limite nginx 1 MB)
 */
export async function compressImage(
  file: File,
  maxWidthPx = 1400,
  targetSizeBytes = 500_000,
): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const compress = (width: number, quality: number) => {
        const height = Math.round((img.height * width) / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }

            if (blob.size <= targetSizeBytes) {
              // Taille OK
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
            } else if (quality > 0.4) {
              // Réduire la qualité
              compress(width, parseFloat((quality - 0.1).toFixed(1)));
            } else if (width > 400) {
              // Qualité minimale atteinte → réduire les dimensions de 25%
              compress(Math.round(width * 0.75), 0.75);
            } else {
              // Impossible de réduire davantage, on accepte
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
            }
          },
          'image/jpeg',
          quality,
        );
      };

      compress(Math.min(img.width, maxWidthPx), 0.85);
    };

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}
