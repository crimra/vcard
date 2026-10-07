import { ImagePlus, Trash2 } from 'lucide-react';
import { useRef } from 'react';

export default function ImageUploader({ photo, onChange }) {
  const inputRef = useRef(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const supportedType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
      || ['jpg', 'jpeg', 'png', 'webp'].includes(extension);
    if (!supportedType) {
      onChange(photo, 'Choisissez une image JPG, PNG ou WebP.');
      return;
    }

    try {
      const { compressImage } = await import('../utils/imageUtils.js');
      onChange(await compressImage(file), '');
    } catch (error) {
      onChange(photo, error.message || 'Impossible de traiter cette image.');
    }
  };

  return (
    <div className="image-picker">
      <button className="image-picker-button" type="button" onClick={() => inputRef.current?.click()}>
        {photo ? (
          <img src={photo.dataUrl} alt="Logo de l’entreprise" />
        ) : (
          <ImagePlus size={21} strokeWidth={1.7} />
        )}
      </button>
      <div className="image-picker-copy">
        <strong>Logo de l’entreprise</strong>
        <span>JPG, PNG ou WebP · redimensionné sur votre appareil</span>
        <button className="text-button" type="button" onClick={() => inputRef.current?.click()}>
          {photo ? 'Changer le logo' : 'Ajouter le logo'}
        </button>
      </div>
      {photo && (
        <button
          aria-label="Supprimer l’image"
          className="icon-button remove-image"
          type="button"
          onClick={() => onChange(null, '')}
        >
          <Trash2 size={16} />
        </button>
      )}
      <input
        ref={inputRef}
        accept="image/jpeg,image/png,image/webp"
        className="visually-hidden"
        onChange={handleFile}
        type="file"
      />
    </div>
  );
}
