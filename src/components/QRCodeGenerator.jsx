import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const QR_SIZE = 640;
const QUIET_ZONE_MODULES = 4;

function createQrImage(content) {
  const qr = QRCode.create(content, { errorCorrectionLevel: 'H' });
  const canvas = document.createElement('canvas');
  canvas.width = QR_SIZE;
  canvas.height = QR_SIZE;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Impossible de préparer le QR code sur cet appareil.');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, QR_SIZE, QR_SIZE);
  const moduleCount = qr.modules.size;
  const gridSize = moduleCount + QUIET_ZONE_MODULES * 2;
  const pitch = QR_SIZE / gridSize;
  const inset = pitch * 0.055;
  const radius = pitch * 0.31;
  const finderOrigins = [
    [0, 0],
    [moduleCount - 7, 0],
    [0, moduleCount - 7],
  ];
  const isFinderModule = (x, y) => finderOrigins.some(([originX, originY]) => (
    x >= originX - 1 && x <= originX + 7 && y >= originY - 1 && y <= originY + 7
  ));

  context.fillStyle = '#000000';
  for (let y = 0; y < moduleCount; y += 1) {
    for (let x = 0; x < moduleCount; x += 1) {
      if (!qr.modules.data[y * moduleCount + x] || isFinderModule(x, y)) continue;

      const centerX = (x + QUIET_ZONE_MODULES + 0.5) * pitch;
      const centerY = (y + QUIET_ZONE_MODULES + 0.5) * pitch;
      const left = (x + QUIET_ZONE_MODULES) * pitch + inset;
      const top = (y + QUIET_ZONE_MODULES) * pitch + inset;
      const size = pitch - inset * 2;
      context.beginPath();
      context.roundRect(left, top, size, size, radius);
      context.fill();
    }
  }

  finderOrigins.forEach(([x, y]) => {
    const left = (x + QUIET_ZONE_MODULES) * pitch;
    const top = (y + QUIET_ZONE_MODULES) * pitch;
    context.fillRect(left, top, pitch * 7, pitch * 7);
    context.fillStyle = '#ffffff';
    context.fillRect(left + pitch, top + pitch, pitch * 5, pitch * 5);
    context.fillStyle = '#000000';
    context.fillRect(left + pitch * 2, top + pitch * 2, pitch * 3, pitch * 3);
  });

  return canvas.toDataURL('image/png');
}

export default function QRCodeGenerator({ content, onClose }) {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setImageUrl('');
    setError('');
    createQrImage(content)
      .then((url) => {
        if (active) setImageUrl(url);
      })
      .catch((generationError) => {
        if (active) {
          setError(generationError.message || 'Impossible de créer ce QR code.');
        }
      });
    return () => { active = false; };
  }, [content]);

  const download = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'vcard-qr-code.png';
    link.click();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section
        aria-labelledby="qr-title"
        aria-modal="true"
        className="qr-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button aria-label="Fermer" className="icon-button modal-close" onClick={onClose} type="button"><X size={19} /></button>
        <span className="eyebrow">PARTAGER VOTRE CONTACT</span>
        <h2 id="qr-title">Votre QR code</h2>
        <p>Scannez-le pour ajouter cette fiche de contact sur un téléphone.</p>
        {imageUrl ? <img className="qr-image" src={imageUrl} alt="QR code de la vCard" /> : !error ? <div className="qr-loading">Création du QR code…</div> : null}
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="button button-primary qr-download" disabled={!imageUrl} onClick={download} type="button">
          <Download size={17} /> Télécharger le PNG
        </button>
        <span className="qr-note">Coordonnées encodées dans le QR code</span>
      </section>
    </div>
  );
}
