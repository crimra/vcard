const MAX_IMAGE_EDGE = 640;
const MAX_IMAGE_BYTES = 450_000;

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Impossible de traiter cette image sur cet appareil.'));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let quality = 0.82;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      while (dataUrl.length * 0.75 > MAX_IMAGE_BYTES && quality > 0.42) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      resolve({ dataUrl, type: 'JPEG' });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Cette image n’a pas pu être ouverte.'));
    };
    image.src = objectUrl;
  });
}
