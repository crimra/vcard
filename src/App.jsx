import { useEffect, useMemo, useState } from 'react';
import { Download, QrCode, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import QRCodeGenerator from './components/QRCodeGenerator.jsx';
import VCardForm, { EMPTY_CONTACT } from './components/VCardForm.jsx';
import VCardPreview from './components/VCardPreview.jsx';
import { createVCard, createVCardFilename } from './utils/vcardGenerator.js';

const STORAGE_KEY = 'vcard-studio-contact-v1';
const SESSION_CLEAR_KEY = 'vcard-studio-contact-cleared';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BLANK_CONTACT = Object.fromEntries(
  Object.keys(EMPTY_CONTACT).map((key) => [key, key === 'photo' ? null : '']),
);

function loadContact() {
  try {
    if (sessionStorage.getItem(SESSION_CLEAR_KEY) === 'true') {
      return { contact: BLANK_CONTACT, error: '' };
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { contact: EMPTY_CONTACT, error: '' };
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid saved contact');
    return { contact: { ...EMPTY_CONTACT, ...parsed }, error: '' };
  } catch {
    return { contact: EMPTY_CONTACT, error: 'Les données locales sont illisibles. Un nouveau formulaire a été chargé.' };
  }
}

export default function App() {
  const [initialData] = useState(loadContact);
  const [contact, setContact] = useState(initialData.contact);
  const [qrOpen, setQrOpen] = useState(false);
  const [notice, setNotice] = useState(() => (
    initialData.error ? { text: initialData.error, type: 'error' } : { text: '', type: '' }
  ));
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    try {
      if (Object.values(contact).every((value) => !value)) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contact));
    } catch {
      setNotice({ text: 'Impossible de sauvegarder les données dans le stockage local de ce navigateur.', type: 'error' });
    }
  }, [contact]);

  const emailErrors = useMemo(() => ({
    email: contact.email && !EMAIL_PATTERN.test(contact.email),
    otherEmail: contact.otherEmail && !EMAIL_PATTERN.test(contact.otherEmail),
  }), [contact.email, contact.otherEmail]);
  const urlError = Boolean(contact.website && !/^https?:\/\/[^\s.]+(?:\.[^\s.]+)+(?:[/?#][^\s]*)?$/i.test(contact.website));
  const validationError = emailErrors.email || emailErrors.otherEmail || urlError;
  const qrContent = useMemo(() => {
    try {
      return createVCard(contact, { includePhoto: false });
    } catch {
      return '';
    }
  }, [contact]);

  const generate = () => {
    if (validationError) {
      setNotice({ text: 'Vérifiez le format de vos adresses e-mail et de votre site web.', type: 'error' });
      return;
    }
    try {
      const content = createVCard(contact);
      const blob = new Blob([content], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = createVCardFilename(contact);
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice({ text: 'vCard générée avec succès.', type: 'success' });
    } catch (error) {
      setNotice({ text: error.message, type: 'error' });
    }
  };

  const reset = () => {
    let storageWarning = '';
    try {
      sessionStorage.setItem(SESSION_CLEAR_KEY, 'true');
    } catch {
      storageWarning = 'Impossible de mémoriser ce formulaire vide pour un prochain rechargement.';
    }
    setContact({ ...BLANK_CONTACT });
    setImageError('');
    setNotice(storageWarning
      ? { text: storageWarning, type: 'error' }
      : { text: 'Le formulaire a été réinitialisé.', type: 'success' });
  };

  const clearEmptySessionMarker = () => {
    try {
      sessionStorage.removeItem(SESSION_CLEAR_KEY);
      return true;
    } catch {
      setNotice({ text: 'Impossible de mémoriser les modifications pour un prochain rechargement.', type: 'error' });
      return false;
    }
  };

  const updateContact = (nextContact) => {
    if (Object.values(nextContact).some(Boolean)) clearEmptySessionMarker();
    setContact(nextContact);
  };

  const clearData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      setNotice({ text: 'Impossible d’effacer les données locales de ce navigateur.', type: 'error' });
      return;
    }
    let storageWarning = '';
    try {
      sessionStorage.setItem(SESSION_CLEAR_KEY, 'true');
    } catch {
      storageWarning = 'Les données ont été effacées, mais le formulaire vide ne sera pas mémorisé après rechargement.';
    }
    setContact({ ...BLANK_CONTACT });
    setImageError('');
    setNotice(storageWarning
      ? { text: storageWarning, type: 'error' }
      : { text: 'Vos données enregistrées ont été effacées.', type: 'success' });
  };

  const handleImageChange = (photo, error) => {
    setImageError(error);
    if (photo) clearEmptySessionMarker();
    setContact((current) => ({ ...current, photo }));
    if (error) setNotice({ text: error, type: 'error' });
  };

  const openQr = () => {
    if (validationError) {
      setNotice({ text: 'Vérifiez le format de vos adresses e-mail et de votre site web.', type: 'error' });
      return;
    }
    if (!qrContent) {
      setNotice({ text: 'Ajoutez au moins un nom, une société ou une information de contact.', type: 'error' });
      return;
    }
    setQrOpen(true);
  };

  const scrollToPreview = () => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <main className="app-shell">
      <header className="site-header">
        <a aria-label="VCard Studio, accueil" className="brand" href="#">
          <span className="brand-mark"><span>v</span></span>
          <span>vcard<span className="brand-light">studio</span></span>
        </a>
        <div className="header-right">
          <span className="privacy-chip"><ShieldCheck size={15} /> 100 % privé</span>
          <button className="header-clear" onClick={clearData} type="button"><RotateCcw size={14} /> Effacer mes données</button>
        </div>
      </header>

      <section className="welcome">
        <span className="welcome-kicker"><Sparkles size={14} /> SIMPLE. PROFESSIONNEL. À VOUS.</span>
        <h1>Votre contact, <span>partout.</span></h1>
        <p>Créez une carte de contact élégante, prête à partager en quelques instants.</p>
      </section>

      <div className="workspace">
        <div className="editor-column">
          <VCardForm
            contact={contact}
            imageError={imageError}
            onChange={updateContact}
            onImageChange={handleImageChange}
            onReset={reset}
          />
          <div className="validation-messages" aria-live="polite">
            {emailErrors.email && <p className="field-error">L’adresse e-mail principale n’est pas valide.</p>}
            {emailErrors.otherEmail && <p className="field-error">L’autre adresse e-mail n’est pas valide.</p>}
            {urlError && <p className="field-error">Entrez une adresse de site complète (ex. https://exemple.fr).</p>}
          </div>
        </div>

        <aside className="preview-column" id="preview">
          <div className="preview-heading">
            <div>
              <span className="eyebrow">EN TEMPS RÉEL</span>
              <h2>Aperçu de la carte</h2>
            </div>
            <span className="preview-sync"><span /> En direct</span>
          </div>
          <VCardPreview contact={contact} />
          <div className="preview-footnote">
            <ShieldCheck size={16} />
            <p>Vos informations restent privées et ne quittent jamais votre appareil.</p>
          </div>
        </aside>
      </div>

      <footer className="page-footer">
        <span>VCard Studio <span className="footer-dot">·</span> Simplement à partager.</span>
        <span>Sans limite. Sans compte. Sans serveur.</span>
      </footer>

      <div className="desktop-actions">
        <button className="button button-secondary" onClick={openQr} type="button"><QrCode size={17} /> Créer un QR code</button>
        <button className="button button-primary" onClick={generate} type="button"><Download size={17} /> Générer la vCard</button>
      </div>

      {notice.text && (
        <div className={`toast toast-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          <span>{notice.text}</span>
          <button aria-label="Fermer le message" onClick={() => setNotice({ text: '', type: '' })} type="button">×</button>
        </div>
      )}

      <nav aria-label="Actions rapides" className="mobile-action-bar">
        <button onClick={scrollToPreview} type="button"><span className="mobile-action-icon"><SmartphoneIcon /></span>Aperçu</button>
        <button className="mobile-generate" onClick={generate} type="button"><Download size={17} /> Générer</button>
        <button onClick={openQr} type="button"><span className="mobile-action-icon"><QrCode size={19} /></span>QR Code</button>
      </nav>
      {qrOpen && <QRCodeGenerator content={qrContent} onClose={() => setQrOpen(false)} />}
    </main>
  );
}

function SmartphoneIcon() {
  return <span className="phone-preview-icon">▯</span>;
}
