import { useState } from 'react';
import Badge from '../../Badge';
import { EmptyState, Field, SaveBar, SectionCard, ToggleRow } from '../AdminPrimitives';
import { formatDateTime, routeLabel, statusTone } from '../../../utils/format';
import { makeId } from '../../../utils/storage';

const TARGET_OPTIONS = ['all', '/', '/exchange', '/market', '/dashboard', '/transactions', '/login'];

export default function NotificationsTab({ value, dirty, onChange, onSave, onReset }) {
  const [draftNotification, setDraftNotification] = useState({
    type: 'info',
    message: '',
    durationMs: 3500,
    target: 'all',
  });

  function addNotification() {
    if (!draftNotification.message.trim()) return;
    const item = {
      id: makeId('NTF'),
      type: draftNotification.type,
      message: draftNotification.message.trim(),
      durationMs: Number(draftNotification.durationMs || 0),
      target: draftNotification.target,
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    onChange({
      ...value,
      items: [item, ...value.items],
      history: [item, ...value.history].slice(0, 30),
    });
    setDraftNotification({ type: 'info', message: '', durationMs: 3500, target: 'all' });
  }

  function updateItem(id, patch) {
    onChange({
      ...value,
      items: value.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function deleteItem(id) {
    onChange({
      ...value,
      items: value.items.filter((item) => item.id !== id),
    });
  }

  return (
    <div className="admin-stack">
      <SectionCard eyebrow="Notifications" title="Créer une notification globale" description="Une fois sauvegardées, les notifications sont jouées comme toasts sur les pages ciblées.">
        <div className="field-grid field-grid--4">
          <Field label="Type">
            <select value={draftNotification.type} onChange={(event) => setDraftNotification((current) => ({ ...current, type: event.target.value }))}>
              <option value="info">Info</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissement</option>
              <option value="danger">Erreur</option>
            </select>
          </Field>
          <Field label="Durée d’affichage (ms)">
            <input type="number" min="1000" step="100" value={draftNotification.durationMs} onChange={(event) => setDraftNotification((current) => ({ ...current, durationMs: Number(event.target.value || 0) }))} />
          </Field>
          <Field label="Ciblage">
            <select value={draftNotification.target} onChange={(event) => setDraftNotification((current) => ({ ...current, target: event.target.value }))}>
              {TARGET_OPTIONS.map((option) => (
                <option key={option} value={option}>{routeLabel(option)}</option>
              ))}
            </select>
          </Field>
          <Field className="field--full" label="Message">
            <textarea rows="2" value={draftNotification.message} onChange={(event) => setDraftNotification((current) => ({ ...current, message: event.target.value }))} />
          </Field>
          <div className="field field--action">
            <span className="field__label">Action</span>
            <button className="button button--primary" type="button" onClick={addNotification} disabled={!draftNotification.message.trim()}>
              Ajouter la notification
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Préférences" title="Comportement des notifications" description="Le dashboard peut masquer les notifications utilisateur si nécessaire.">
        <ToggleRow
          label="Notifications utilisateur dans le Dashboard"
          checked={value.dashboardEnabled}
          onChange={(checked) => onChange({ ...value, dashboardEnabled: checked })}
        />
      </SectionCard>

      <SectionCard eyebrow="Actives" title="Notifications publiées" description="Modifie leur cible, leur durée ou désactive-les temporairement.">
        {!value.items.length ? (
          <EmptyState title="Aucune notification active" description="Ajoute un premier message global pour commencer." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Durée</th>
                  <th>Page</th>
                  <th>État</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {value.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <select value={item.type} onChange={(event) => updateItem(item.id, { type: event.target.value })}>
                        <option value="info">Info</option>
                        <option value="success">Succès</option>
                        <option value="warning">Avertissement</option>
                        <option value="danger">Erreur</option>
                      </select>
                    </td>
                    <td>
                      <textarea rows="2" value={item.message} onChange={(event) => updateItem(item.id, { message: event.target.value })} />
                    </td>
                    <td>
                      <input type="number" min="1000" step="100" value={item.durationMs} onChange={(event) => updateItem(item.id, { durationMs: Number(event.target.value || 0) })} />
                    </td>
                    <td>
                      <select value={item.target} onChange={(event) => updateItem(item.id, { target: event.target.value })}>
                        {TARGET_OPTIONS.map((option) => (
                          <option key={option} value={option}>{routeLabel(option)}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="inline-actions">
                        <Badge tone={statusTone(item.type)}>{item.type}</Badge>
                        <ToggleRow label="Actif" checked={item.enabled} onChange={(checked) => updateItem(item.id, { enabled: checked })} />
                      </div>
                    </td>
                    <td>
                      <button className="button button--ghost button--sm" type="button" onClick={() => deleteItem(item.id)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard eyebrow="Historique" title="Historique des notifications envoyées" description="Conserve les messages créés depuis l’admin même si tu désactives ensuite leur diffusion.">
        <div className="history-list">
          {value.history.map((item) => (
            <div key={`${item.id}-${item.createdAt}`} className="history-row">
              <div>
                <strong>{item.message}</strong>
                <span>{routeLabel(item.target)} • {formatDateTime(item.createdAt)}</span>
              </div>
              <Badge tone={statusTone(item.type)}>{item.type}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      <SaveBar dirty={dirty} onSave={() => onSave()} onReset={onReset} />
    </div>
  );
}
