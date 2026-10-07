const escapeValue = (value) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');

const foldLine = (line) => {
  const encoder = new TextEncoder();
  const chunks = [];
  let current = '';
  let byteLength = 0;

  for (const character of line) {
    const characterBytes = encoder.encode(character).length;
    if (byteLength + characterBytes > 75) {
      chunks.push(current);
      current = ` ${character}`;
      byteLength = 1 + characterBytes;
    } else {
      current += character;
      byteLength += characterBytes;
    }
  }

  chunks.push(current);
  return chunks.join('\r\n');
};

export function createVCard(contact, { includePhoto = true } = {}) {
  const {
    firstName,
    lastName,
    title,
    company,
    mobile,
    office,
    fax,
    whatsapp,
    email,
    otherEmail,
    website,
    street,
    city,
    postalCode,
    country,
    photo,
  } = contact;
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const displayName = fullName || company || email || otherEmail || mobile || office || whatsapp || fax;

  if (!displayName) {
    throw new Error('Ajoutez au moins un nom, une société ou une information de contact.');
  }

  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeValue(displayName)}`];
  if (firstName || lastName) {
    lines.push(`N:${escapeValue(lastName)};${escapeValue(firstName)};;;`);
  }
  if (company) lines.push(`ORG:${escapeValue(company)}`);
  if (title) lines.push(`TITLE:${escapeValue(title)}`);
  if (mobile) lines.push(`TEL;TYPE=CELL:${escapeValue(mobile)}`);
  if (office) lines.push(`TEL;TYPE=WORK,VOICE:${escapeValue(office)}`);
  if (fax) lines.push(`TEL;TYPE=WORK,FAX:${escapeValue(fax)}`);
  if (whatsapp) lines.push(`TEL;TYPE=WhatsApp:${escapeValue(whatsapp)}`);
  if (email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${escapeValue(email)}`);
  if (otherEmail) lines.push(`EMAIL;TYPE=INTERNET:${escapeValue(otherEmail)}`);
  if (website) lines.push(`URL:${escapeValue(website)}`);
  if (street || city || postalCode || country) {
    lines.push(`ADR;TYPE=WORK:;;${escapeValue(street)};${escapeValue(city)};;${escapeValue(postalCode)};${escapeValue(country)}`);
  }
  if (photo && includePhoto) {
    const base64 = photo.dataUrl.split(',')[1];
    if (base64) lines.push(`PHOTO;ENCODING=b;TYPE=${photo.type || 'JPEG'}:${base64}`);
  }
  lines.push('END:VCARD');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

export function createVCardFilename(contact) {
  const name = [contact.firstName, contact.lastName].filter(Boolean).join('-') || contact.company || 'contact';
  const safeName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${safeName || 'contact'}.vcf`;
}
