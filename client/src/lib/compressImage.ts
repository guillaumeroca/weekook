/**
 * Compresse une image via Canvas avant upload.
 * Redimensionne si width > maxWidthPx, puis abaisse la qualité JPEG
 * jusqu'à rester sous 900 KB (limite nginx 1 MB - marge de sécurité).
 */
export async function compressImage(
  file: File,
  maxWidthPx = 1400,
  qualityStart = 0.82,
): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidthPx) {
        height = Math.round((height * maxWidthPx) / width);
        width = maxWidthPx;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      const tryExport = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size > 900_000 && quality > 0.5) {
              tryExport(quality - 0.1);
            } else {
              resolve(
                new File(
                  [blob],
                  file.name.replace(/\.[^.]+$/, '.jpg'),
                  { type: 'image/jpeg' },
                ),
              );
            }
          },
          'image/jpeg',
          quality,
        );
      };
      tryExport(qualityStart);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}
