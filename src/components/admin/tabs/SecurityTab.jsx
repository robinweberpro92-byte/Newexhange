import { useState } from 'react';
import { Field, SaveBar, SectionCard, ToggleRow } from '../AdminPrimitives';
import { formatDateTime } from '../../../utils/format';
import { isEmail } from '../../../utils/storage';
import { sha256 } from '../../../utils/hash';

export default function SecurityTab({ value, dirty, onChange, onSave, onReset }) {
  const [credentials, setCredentials] = useState({
    password: '',
    passwordConfirm: '',
    pin: '',
    pinConfirm: '',
    error: '',
  });

  async function handleSave() {
    let error = '';
    if (!isEmail(value.admin.username)) {
      error = 'Identifiant admin invalide.';
    } else if (credentials.password && credentials.password !== credentials.passwordConfirm) {
      error = 'Les mots de passe ne correspondent pas.';
    } else if (value.admin.pinEnabled && credentials.pin && credentials.pin !== credentials.pinConfirm) {
      error = 'Les codes PIN ne correspondent pas.';
    } else if (value.admin.pinEnabled && !value.admin.pinHash && !credentials.pin) {
      error = 'Renseigne un PIN pour sécuriser les onglets sensibles.';
    }

    if (error) {
      setCredentials((current) => ({ ...current, error }));
      return;
    }

    const nextSecurity = {
      ...value,
      admin: {
        ...value.admin,
      },
    };

    if (credentials.password) {
      nextSecurity.admin.passwordHash = await sha256(credentials.password);
      nextSecurity.admin.lastPasswordChange = new Date().toISOString();
    }

    if (value.admin.pinEnabled && credentials.pin) {
      nextSecurity.admin.pinHash = await sha256(credentials.pin);
    }

    if (!value.admin.pinEnabled) {
      nextSecurity.admin.pinHash = '';
    }

    onChange(nextSecurity);
    await onSave(nextSecurity);
    setCredentials({ password: '', passwordConfirm: '', pin: '', pinConfirm: '', error: '' });
  }

  return (
    <div className="admin-stack">
      <SectionCard eyebrow="Admin" title="Identifiants et protections admin" description="Le mot de passe et le PIN sont stockés hashés en localStorage.">
        <div className="field-grid field-grid--2">
          <Field label="Identifiant admin" error={!isEmail(value.admin.username) ? 'Adresse email invalide.' : ''}>
            <input value={value.admin.username} onChange={(event) => onChange({ ...value, admin: { ...value.admin, username: event.target.value } })} />
          </Field>
          <Field label="Dernier changement de mot de passe">
            <input value={formatDateTime(value.admin.lastPasswordChange)} readOnly />
          </Field>
          <Field label="Nouveau mot de passe">
            <input type="password" value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value, error: '' }))} placeholder="Laisser vide pour conserver" />
          </Field>
          <Field label="Confirmer le nouveau mot de passe">
            <input type="password" value={credentials.passwordConfirm} onChange={(event) => setCredentials((current) => ({ ...current, passwordConfirm: event.target.value, error: '' }))} />
          </Field>
          <ToggleRow
            label="Activer le PIN secondaire"
            description="Un PIN est demandé pour ouvrir certains onglets sensibles du panel admin."
            checked={value.admin.pinEnabled}
            onChange={(checked) => onChange({ ...value, admin: { ...value.admin, pinEnabled: checked } })}
          />
          {value.admin.pinEnabled ? (
            <>
              <Field label="Nouveau PIN">
                <input type="password" inputMode="numeric" value={credentials.pin} onChange={(event) => setCredentials((current) => ({ ...current, pin: event.target.value, error: '' }))} />
              </Field>
              <Field label="Confirmer le PIN">
                <input type="password" inputMode="numeric" value={credentials.pinConfirm} onChange={(event) => setCredentials((current) => ({ ...current, pinConfirm: event.target.value, error: '' }))} />
              </Field>
            </>
          ) : null}
          {credentials.error ? <p className="field__error field__error--inline">{credentials.error}</p> : null}
        </div>
      </SectionCard>

      <SectionCard eyebrow="Accès" title="Login utilisateur et maintenance" description="Contrôle l’accès public et le message affiché en cas de maintenance.">
        <ToggleRow
          label="Page Login publique active"
          description="Si désactivé, seul le login admin connu reste utilisable."
          checked={value.loginPageEnabled}
          onChange={(checked) => onChange({ ...value, loginPageEnabled: checked })}
        />
        <ToggleRow
          label="Maintenance mode"
          description="Les pages publiques affichent un écran de maintenance tant que ce mode est actif."
          checked={value.maintenanceMode}
          onChange={(checked) => onChange({ ...value, maintenanceMode: checked })}
        />
        <div className="field-grid field-grid--2">
          <Field label="Titre maintenance">
            <input value={value.maintenanceTitle} onChange={(event) => onChange({ ...value, maintenanceTitle: event.target.value })} />
          </Field>
          <Field className="field--full" label="Message maintenance">
            <textarea rows="3" value={value.maintenanceMessage} onChange={(event) => onChange({ ...value, maintenanceMessage: event.target.value })} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Historique" title="Dernières connexions admin" description="Les entrées sont ajoutées automatiquement après chaque connexion réussie.">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date / heure</th>
                <th>Compte</th>
              </tr>
            </thead>
            <tbody>
              {value.adminLoginHistory.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDateTime(entry.at)}</td>
                  <td>{entry.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SaveBar dirty={dirty} onSave={handleSave} onReset={onReset} />
    </div>
  );
}
