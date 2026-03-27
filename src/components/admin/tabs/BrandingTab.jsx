import { useMemo, useState } from 'react';
import { Field, SaveBar, SectionCard, ToggleRow } from '../AdminPrimitives';
import { fileToDataUrl, isEmail, isLikelyUrl } from '../../../utils/storage';

export default function BrandingTab({ value, dirty, onChange, onSave, onReset }) {
  const [uploading, setUploading] = useState(false);

  const hasError = useMemo(() => {
    if (!value.siteName?.trim()) return true;
    if (!isEmail(value.supportEmail)) return true;
    if (value.logoUrl && !isLikelyUrl(value.logoUrl)) return true;
    if (value.faviconUrl && !isLikelyUrl(value.faviconUrl)) return true;
    return false;
  }, [value]);

  async function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange({ ...value, logoDataUrl: dataUrl });
    } finally {
      setUploading(false);
    }
  }

  function updateFooterLink(index, field, nextValue) {
    const footerLinks = value.footerLinks.map((item, currentIndex) =>
      currentIndex === index ? { ...item, [field]: nextValue } : item,
    );
    onChange({ ...value, footerLinks });
  }

  return (
    <div className="admin-stack">
      <SectionCard
        eyebrow="Branding"
        title="Identité du site"
        description="Gère le nom, le slogan, l’adresse de support et la signature visuelle globale."
      >
        <div className="field-grid field-grid--2">
          <Field label="Nom du site">
            <input value={value.siteName} onChange={(event) => onChange({ ...value, siteName: event.target.value })} />
          </Field>
          <Field label="Short name">
            <input value={value.shortName} onChange={(event) => onChange({ ...value, shortName: event.target.value })} />
          </Field>
          <Field label="Slogan / tagline">
            <input value={value.tagline} onChange={(event) => onChange({ ...value, tagline: event.target.value })} />
          </Field>
          <Field label="Email de support" error={!isEmail(value.supportEmail) ? 'Adresse email invalide.' : ''}>
            <input value={value.supportEmail} onChange={(event) => onChange({ ...value, supportEmail: event.target.value })} />
          </Field>
          <Field label="Logo (URL)" error={value.logoUrl && !isLikelyUrl(value.logoUrl) ? 'URL ou chemin invalide.' : ''}>
            <input value={value.logoUrl} onChange={(event) => onChange({ ...value, logoUrl: event.target.value })} placeholder="https://..." />
          </Field>
          <Field label="Favicon (URL)" error={value.faviconUrl && !isLikelyUrl(value.faviconUrl) ? 'URL ou chemin invalide.' : ''}>
            <input value={value.faviconUrl} onChange={(event) => onChange({ ...value, faviconUrl: event.target.value })} placeholder="/favicon.ico" />
          </Field>
          <Field label="Upload logo base64" hint="Le fichier est converti en base64 et stocké dans localStorage.">
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
          </Field>
          <div className="preview-card">
            <span className="field__label">Aperçu du logo</span>
            <div className="brand-preview">
              <img src={value.logoDataUrl || value.logoUrl || '/logo-mark.svg'} alt={value.siteName} />
              <div>
                <strong>{value.siteName}</strong>
                <span>{uploading ? 'Upload en cours…' : value.tagline}</span>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Apparence" title="Couleurs, thème et mode global" description="Le thème est appliqué sur toute l’application en temps réel.">
        <div className="field-grid field-grid--2">
          <Field label="Couleur principale">
            <input type="color" value={value.primaryColor} onChange={(event) => onChange({ ...value, primaryColor: event.target.value })} />
          </Field>
          <Field label="Couleur secondaire">
            <input type="color" value={value.secondaryColor} onChange={(event) => onChange({ ...value, secondaryColor: event.target.value })} />
          </Field>
          <ToggleRow
            label="Mode dark"
            description="Bascule entre thème sombre et clair pour tout le front."
            checked={value.themeMode === 'dark'}
            onChange={(checked) => onChange({ ...value, themeMode: checked ? 'dark' : 'light' })}
          />
        </div>
      </SectionCard>

      <SectionCard eyebrow="Footer" title="Footer, liens légaux et réseaux sociaux" description="Tous ces liens sont réutilisés dans le footer public du site.">
        <div className="field-grid field-grid--2">
          <Field label="Copyright footer">
            <input value={value.footerCopyright} onChange={(event) => onChange({ ...value, footerCopyright: event.target.value })} />
          </Field>
          <Field label="Twitter" error={value.socials.twitter && !isLikelyUrl(value.socials.twitter) ? 'URL invalide.' : ''}>
            <input
              value={value.socials.twitter}
              onChange={(event) => onChange({ ...value, socials: { ...value.socials, twitter: event.target.value } })}
              placeholder="https://twitter.com/..."
            />
          </Field>
          <Field label="Telegram" error={value.socials.telegram && !isLikelyUrl(value.socials.telegram) ? 'URL invalide.' : ''}>
            <input
              value={value.socials.telegram}
              onChange={(event) => onChange({ ...value, socials: { ...value.socials, telegram: event.target.value } })}
              placeholder="https://t.me/..."
            />
          </Field>
          <Field label="Discord" error={value.socials.discord && !isLikelyUrl(value.socials.discord) ? 'URL invalide.' : ''}>
            <input
              value={value.socials.discord}
              onChange={(event) => onChange({ ...value, socials: { ...value.socials, discord: event.target.value } })}
              placeholder="https://discord.gg/..."
            />
          </Field>
        </div>

        <div className="sub-grid">
          {value.footerLinks.map((link, index) => (
            <div className="sub-grid__row" key={`${link.label}-${index}`}>
              <Field label={`Lien légal ${index + 1} • label`}>
                <input value={link.label} onChange={(event) => updateFooterLink(index, 'label', event.target.value)} />
              </Field>
              <Field label={`Lien légal ${index + 1} • URL`}>
                <input value={link.url} onChange={(event) => updateFooterLink(index, 'url', event.target.value)} />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>

      <SaveBar dirty={dirty} disabled={hasError} onSave={() => onSave()} onReset={onReset} />
    </div>
  );
}
