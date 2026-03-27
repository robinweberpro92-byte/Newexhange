import { Field, SaveBar, SectionCard, ToggleRow } from '../AdminPrimitives';

export default function ContentTab({ value, dirty, onChange, onSave, onReset }) {
  function updateReason(index, field, nextValue) {
    const reasons = value.home.reasons.map((item, currentIndex) =>
      currentIndex === index ? { ...item, [field]: nextValue } : item,
    );
    onChange({ ...value, home: { ...value.home, reasons } });
  }

  function updateStep(index, nextValue) {
    const steps = value.home.steps.map((item, currentIndex) => (currentIndex === index ? nextValue : item));
    onChange({ ...value, home: { ...value.home, steps } });
  }

  return (
    <div className="admin-stack">
      <SectionCard eyebrow="Hero" title="Textes principaux de la Home" description="Édite le titre hero, le sous-titre et les CTA sans toucher au code.">
        <div className="field-grid field-grid--2">
          <Field label="Titre hero" className="field--full">
            <textarea rows="3" value={value.home.heroTitle} onChange={(event) => onChange({ ...value, home: { ...value.home, heroTitle: event.target.value } })} />
          </Field>
          <Field label="Sous-titre hero" className="field--full">
            <textarea rows="3" value={value.home.heroSubtitle} onChange={(event) => onChange({ ...value, home: { ...value.home, heroSubtitle: event.target.value } })} />
          </Field>
          <Field label="CTA principal">
            <input value={value.home.primaryCtaText} onChange={(event) => onChange({ ...value, home: { ...value.home, primaryCtaText: event.target.value } })} />
          </Field>
          <Field label="CTA secondaire">
            <input value={value.home.secondaryCtaText} onChange={(event) => onChange({ ...value, home: { ...value.home, secondaryCtaText: event.target.value } })} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Landing" title="Pourquoi nous choisir & comment ça marche" description="Les cartes et étapes affichées sur la Home sont gérées ici.">
        <div className="sub-grid">
          {value.home.reasons.map((item, index) => (
            <div className="sub-grid__row sub-grid__row--stack" key={`${item.title}-${index}`}>
              <Field label={`Bloc ${index + 1} • titre`}>
                <input value={item.title} onChange={(event) => updateReason(index, 'title', event.target.value)} />
              </Field>
              <Field label={`Bloc ${index + 1} • description`}>
                <textarea rows="2" value={item.description} onChange={(event) => updateReason(index, 'description', event.target.value)} />
              </Field>
            </div>
          ))}
        </div>
        <div className="sub-grid">
          {value.home.steps.map((step, index) => (
            <Field key={`${step}-${index}`} label={`Étape ${index + 1}`}>
              <input value={step} onChange={(event) => updateStep(index, event.target.value)} />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SectionCard eyebrow="Pages internes" title="Exchange, dashboard, footer et login" description="Centralise tous les textes UX secondaires du front.">
        <div className="field-grid field-grid--2">
          <Field className="field--full" label="Texte intro Exchange">
            <textarea rows="3" value={value.exchange.intro} onChange={(event) => onChange({ ...value, exchange: { ...value.exchange, intro: event.target.value } })} />
          </Field>
          <Field className="field--full" label="Avertissement Exchange">
            <textarea rows="3" value={value.exchange.warning} onChange={(event) => onChange({ ...value, exchange: { ...value.exchange, warning: event.target.value } })} />
          </Field>
          <Field className="field--full" label="Message de confirmation après échange">
            <textarea rows="3" value={value.exchange.confirmationMessage} onChange={(event) => onChange({ ...value, exchange: { ...value.exchange, confirmationMessage: event.target.value } })} />
          </Field>
          <Field className="field--full" label="Message dashboard">
            <textarea rows="3" value={value.dashboard.welcomeMessage} onChange={(event) => onChange({ ...value, dashboard: { ...value.dashboard, welcomeMessage: event.target.value } })} />
          </Field>
          <Field className="field--full" label="Texte éditorial du footer">
            <textarea rows="3" value={value.footer.text} onChange={(event) => onChange({ ...value, footer: { ...value.footer, text: event.target.value } })} />
          </Field>
          <Field label="Titre page Login">
            <input value={value.login.title} onChange={(event) => onChange({ ...value, login: { ...value.login, title: event.target.value } })} />
          </Field>
          <Field label="Sous-titre page Login" className="field--full">
            <textarea rows="3" value={value.login.subtitle} onChange={(event) => onChange({ ...value, login: { ...value.login, subtitle: event.target.value } })} />
          </Field>
          <Field className="field--full" label="Message d’erreur login personnalisé">
            <textarea rows="2" value={value.login.errorMessage} onChange={(event) => onChange({ ...value, login: { ...value.login, errorMessage: event.target.value } })} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Annonce globale" title="Bandeau global du site" description="Active un bandeau visible au-dessus de la navigation.">
        <ToggleRow label="Annonce activée" checked={value.announcement.enabled} onChange={(checked) => onChange({ ...value, announcement: { ...value.announcement, enabled: checked } })} />
        <div className="field-grid field-grid--2">
          <Field label="Type de l’annonce">
            <select value={value.announcement.tone} onChange={(event) => onChange({ ...value, announcement: { ...value.announcement, tone: event.target.value } })}>
              <option value="info">Info</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissement</option>
              <option value="danger">Erreur</option>
            </select>
          </Field>
          <Field className="field--full" label="Texte du bandeau">
            <textarea rows="2" value={value.announcement.text} onChange={(event) => onChange({ ...value, announcement: { ...value.announcement, text: event.target.value } })} />
          </Field>
        </div>
      </SectionCard>

      <SaveBar dirty={dirty} onSave={() => onSave()} onReset={onReset} />
    </div>
  );
}
