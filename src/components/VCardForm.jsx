import { Building2, Globe2, MapPin, UserRound } from 'lucide-react';
import ImageUploader from './ImageUploader.jsx';

const sections = [
  {
    id: 'identity',
    title: 'Identité',
    icon: UserRound,
    fields: [
      ['firstName', 'Prénom', 'Jean'],
      ['lastName', 'Nom', 'Dupont'],
      ['title', 'Fonction', 'Gérant'],
      ['company', 'Société', 'Nom de votre société'],
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: Building2,
    fields: [
      ['mobile', 'Portable', '+33 6 12 34 56 78', 'tel'],
      ['office', 'Téléphone bureau', '+33 1 23 45 67 89', 'tel'],
      ['fax', 'Fax', '+33 1 23 45 67 90', 'tel'],
      ['whatsapp', 'WhatsApp', '+33 6 12 34 56 78', 'tel'],
      ['email', 'E-mail principal', 'bonjour@entreprise.fr', 'email'],
      ['otherEmail', 'Autre e-mail', 'contact@entreprise.fr', 'email'],
    ],
  },
  {
    id: 'web',
    title: 'Web',
    icon: Globe2,
    fields: [['website', 'Site web', 'https://exemple.fr', 'url']],
  },
  {
    id: 'address',
    title: 'Adresse',
    icon: MapPin,
    fields: [
      ['street', 'Rue / immeuble', '12 rue des Fleurs'],
      ['city', 'Ville', 'Paris'],
      ['postalCode', 'Code postal', '75001'],
      ['country', 'Pays', 'France'],
    ],
  },
];

export const EMPTY_CONTACT = {
  firstName: '',
  lastName: '',
  title: 'Gérant',
  company: 'Société de Promotion Immobilière Gloulou',
  mobile: '+216 98 403 043',
  office: '+216 70 246 946',
  fax: '+216 70 246 941',
  whatsapp: '',
  email: '',
  otherEmail: '',
  website: 'https://immobilieregloulou.com/',
  street: 'Immeuble Les Arcades, Av. Ibn Jazzar',
  city: 'Sousse',
  postalCode: '4000',
  country: 'Tunisie',
  photo: null,
};

export default function VCardForm({ contact, onChange, onReset, imageError, onImageChange }) {
  const updateField = (key, value) => onChange({ ...contact, [key]: value });

  return (
    <section className="form-card" aria-labelledby="form-title">
      <div className="form-heading">
        <div>
          <span className="eyebrow">VOTRE FICHE DE CONTACT</span>
          <h1 id="form-title">Créer une vCard</h1>
          <p>Les champs sont tous facultatifs. Ajoutez uniquement ce que vous souhaitez partager.</p>
        </div>
      </div>

      <div className="form-content">
        <div className="form-section identity-section">
          <div className="section-heading">
            <UserRound size={17} />
            <h2>Identité</h2>
          </div>
          <ImageUploader photo={contact.photo} onChange={onImageChange} />
          {imageError && <p className="field-error" role="alert">{imageError}</p>}
          <div className="fields-grid">
            {sections[0].fields.map(([key, label, placeholder]) => (
              <label className={key === 'company' ? 'field field-wide' : 'field'} key={key}>
                <span>{label}</span>
                <input
                  autoComplete={key === 'firstName' ? 'given-name' : key === 'lastName' ? 'family-name' : 'organization-title'}
                  onChange={(event) => updateField(key, event.target.value)}
                  placeholder={placeholder}
                  value={contact[key]}
                />
              </label>
            ))}
          </div>
        </div>

        {sections.slice(1).map(({ id, title, icon: Icon, fields }) => (
          <div className="form-section" key={id}>
            <div className="section-heading">
              <Icon size={17} />
              <h2>{title}</h2>
            </div>
            <div className="fields-grid">
              {fields.map(([key, label, placeholder, type]) => (
                <label className="field" key={key}>
                  <span>{label}</span>
                  <input
                    autoComplete={key === 'email' ? 'email' : key === 'mobile' ? 'tel' : undefined}
                    inputMode={type === 'tel' ? 'tel' : undefined}
                    onChange={(event) => updateField(key, event.target.value)}
                    placeholder={placeholder}
                    type={type || 'text'}
                    value={contact[key]}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="form-footer">
        <button className="button button-secondary reset-button" onClick={onReset} type="button">
          Réinitialiser
        </button>
        <span className="privacy-note">Vos données restent sur cet appareil.</span>
      </div>
    </section>
  );
}
