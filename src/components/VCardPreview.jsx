import { AtSign, BriefcaseBusiness, Building2, Globe2, MapPin, MessageCircle, Phone, Smartphone } from 'lucide-react';

function PreviewRow({ icon: Icon, label, value, href }) {
  if (!value) return null;
  return (
    <div className="preview-row">
      <span className="preview-row-icon"><Icon size={16} strokeWidth={1.8} /></span>
      <div className="preview-row-copy">
        <span className="preview-row-label">{label}</span>
        {href ? <a href={href}>{value}</a> : <span className="preview-row-value">{value}</span>}
      </div>
    </div>
  );
}

export default function VCardPreview({ contact }) {
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Votre nom';
  const street = contact.street;
  const cityLine = [contact.postalCode, contact.city].filter(Boolean).join(' ');
  const address = [street, cityLine, contact.country].filter(Boolean).join(', ');

  return (
    <div className="preview-card">
      <div className="preview-topline">
        <span className="preview-live"><span /> Aperçu en direct</span>
        <span className="preview-device-label">FICHE DE CONTACT</span>
      </div>
      <div className="contact-hero">
        <div className={`contact-avatar ${contact.photo ? 'has-photo' : ''}`}>
          {contact.photo ? (
            <img src={contact.photo.dataUrl} alt="Logo de l’entreprise" />
          ) : (
            <span>{[contact.firstName?.[0], contact.lastName?.[0]].filter(Boolean).join('').toUpperCase() || <Building2 size={32} />}</span>
          )}
          <span className="avatar-status" />
        </div>
        <h2>{fullName}</h2>
        {contact.company && <p className="contact-company">{contact.company}</p>}
        {contact.title && <span className="contact-role"><BriefcaseBusiness size={13} />{contact.title}</span>}
        {!contact.company && !contact.title && <p className="contact-subtitle">Nouveau contact</p>}
      </div>

      <div className="preview-actions" aria-hidden="true">
        <span><Phone size={18} /><small>Appeler</small></span>
        <span><MessageCircle size={18} /><small>Message</small></span>
        <span><AtSign size={18} /><small>E-mail</small></span>
      </div>

      <div className="preview-details">
        <p className="preview-group-label">COORDONNÉES</p>
        <PreviewRow icon={Smartphone} label="Portable" value={contact.mobile} href={contact.mobile ? `tel:${contact.mobile}` : ''} />
        <PreviewRow icon={Phone} label="Téléphone bureau" value={contact.office} href={contact.office ? `tel:${contact.office}` : ''} />
        <PreviewRow icon={Phone} label="Fax" value={contact.fax} />
        <PreviewRow icon={MessageCircle} label="WhatsApp" value={contact.whatsapp} href={contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}` : ''} />
        <PreviewRow icon={AtSign} label="E-mail principal" value={contact.email} href={contact.email ? `mailto:${contact.email}` : ''} />
        <PreviewRow icon={AtSign} label="Autre e-mail" value={contact.otherEmail} href={contact.otherEmail ? `mailto:${contact.otherEmail}` : ''} />
        <PreviewRow icon={Globe2} label="Site web" value={contact.website} href={contact.website} />
        <PreviewRow icon={MapPin} label="Adresse" value={address} />
        {!contact.mobile && !contact.office && !contact.fax && !contact.whatsapp && !contact.email && !contact.otherEmail && !contact.website && !address && (
          <p className="preview-empty">Vos coordonnées apparaîtront ici au fur et à mesure.</p>
        )}
      </div>
      <div className="preview-bottom">
        <span>Créé avec <strong>VCard Studio</strong>/sOmedia</span>
        <span className="format-badge">VCARD 3.0</span>
      </div>
    </div>
  );
}
