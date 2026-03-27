import { useMemo, useState } from 'react';
import Badge from '../../Badge';
import { EmptyState, Field, SaveBar, SectionCard, StatCard } from '../AdminPrimitives';
import { euro, formatDateTime, statusTone } from '../../../utils/format';
import { isEmail, makeId } from '../../../utils/storage';

const STATUS_OPTIONS = ['Actif', 'Suspendu', 'Vérifié'];
const KYC_OPTIONS = ['Non vérifié', 'En cours', 'Vérifié'];

export default function UsersTab({ value, dirty, onChange, onSave, onReset }) {
  const [search, setSearch] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    balance: 0,
    status: 'Actif',
    kyc: 'Non vérifié',
  });

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return value;
    return value.filter(
      (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    );
  }, [search, value]);

  function updateUser(id, patch) {
    onChange(value.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  }

  function deleteUser(id) {
    onChange(value.filter((user) => user.id !== id));
  }

  function addUser() {
    if (!newUser.name.trim() || !isEmail(newUser.email)) return;
    onChange([
      {
        id: makeId('USR'),
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        createdAt: new Date().toISOString(),
        balance: Number(newUser.balance || 0),
        status: newUser.status,
        kyc: newUser.kyc,
      },
      ...value,
    ]);
    setNewUser({ name: '', email: '', balance: 0, status: 'Actif', kyc: 'Non vérifié' });
  }

  const activeUsers = value.filter((user) => user.status === 'Actif' || user.status === 'Vérifié').length;
  const totalBalance = value.reduce((sum, user) => sum + Number(user.balance || 0), 0);

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--3">
        <StatCard label="Utilisateurs" value={String(value.length)} helper="Base locale mock" />
        <StatCard label="Actifs" value={String(activeUsers)} helper="Actif + Vérifié" tone="success" />
        <StatCard label="Solde simulé" value={euro(totalBalance)} helper="Somme des soldes" tone="warning" />
      </div>

      <SectionCard eyebrow="Ajout" title="Ajouter un utilisateur mock" description="Le nouvel utilisateur est ajouté au dataset local et peut être édité ensuite.">
        <div className="field-grid field-grid--3">
          <Field label="Nom">
            <input value={newUser.name} onChange={(event) => setNewUser((current) => ({ ...current, name: event.target.value }))} />
          </Field>
          <Field label="Email" error={newUser.email && !isEmail(newUser.email) ? 'Adresse email invalide.' : ''}>
            <input value={newUser.email} onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))} />
          </Field>
          <Field label="Solde simulé (€)">
            <input type="number" min="0" step="0.01" value={newUser.balance} onChange={(event) => setNewUser((current) => ({ ...current, balance: Number(event.target.value || 0) }))} />
          </Field>
          <Field label="Statut">
            <select value={newUser.status} onChange={(event) => setNewUser((current) => ({ ...current, status: event.target.value }))}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="KYC">
            <select value={newUser.kyc} onChange={(event) => setNewUser((current) => ({ ...current, kyc: event.target.value }))}>
              {KYC_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <div className="field field--action">
            <span className="field__label">Action</span>
            <button className="button button--primary" type="button" onClick={addUser} disabled={!newUser.name.trim() || !isEmail(newUser.email)}>
              Ajouter l’utilisateur
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Gestion" title="Tableau des utilisateurs" description="Recherche, édition inline et contrôle du statut/KYC.">
        <div className="section-toolbar">
          <Field label="Recherche" className="field--compact">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom ou email" />
          </Field>
        </div>

        {!filteredUsers.length ? (
          <EmptyState title="Aucun utilisateur" description="Ajuste ta recherche ou ajoute un nouvel utilisateur mock." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Inscription</th>
                  <th>Solde</th>
                  <th>Statut</th>
                  <th>KYC</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input value={user.name} onChange={(event) => updateUser(user.id, { name: event.target.value })} />
                    </td>
                    <td>
                      <input value={user.email} onChange={(event) => updateUser(user.id, { email: event.target.value })} />
                    </td>
                    <td>{formatDateTime(user.createdAt)}</td>
                    <td>
                      <input type="number" min="0" step="0.01" value={user.balance} onChange={(event) => updateUser(user.id, { balance: Number(event.target.value || 0) })} />
                    </td>
                    <td>
                      <select value={user.status} onChange={(event) => updateUser(user.id, { status: event.target.value })}>
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={user.kyc} onChange={(event) => updateUser(user.id, { kyc: event.target.value })}>
                        {KYC_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="inline-actions">
                        <Badge tone={statusTone(user.status)}>{user.status}</Badge>
                        <button className="button button--ghost button--sm" type="button" onClick={() => deleteUser(user.id)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SaveBar dirty={dirty} onSave={() => onSave()} onReset={onReset} />
    </div>
  );
}
