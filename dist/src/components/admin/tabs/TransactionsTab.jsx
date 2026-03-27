import { useMemo, useState } from 'react';
import Badge from '../../Badge';
import { EmptyState, Field, SaveBar, SectionCard, StatCard } from '../AdminPrimitives';
import { euro, formatDateTime, formatInputDateTime, statusTone } from '../../../utils/format';
import { downloadTextFile, makeId, toCsvString } from '../../../utils/storage';

const STATUS_OPTIONS = ['En attente', 'Confirmée', 'Rejetée', 'En cours'];

export default function TransactionsTab({ value, dirty, onChange, onSave, onReset }) {
  const [filters, setFilters] = useState({
    status: 'all',
    crypto: 'all',
    minAmount: '',
    date: '',
  });
  const [newTransaction, setNewTransaction] = useState({
    userName: '',
    userEmail: '',
    type: 'Crypto → PayPal',
    amount: 100,
    crypto: 'BTC',
    quantity: 0.002,
    status: 'En attente',
    payoutMethod: 'PayPal',
    date: formatInputDateTime(new Date().toISOString()),
  });

  const filteredTransactions = useMemo(() => {
    return value.filter((transaction) => {
      if (filters.status !== 'all' && transaction.status !== filters.status) return false;
      if (filters.crypto !== 'all' && transaction.crypto !== filters.crypto) return false;
      if (filters.minAmount && Number(transaction.amount) < Number(filters.minAmount)) return false;
      if (filters.date && !transaction.date.startsWith(filters.date)) return false;
      return true;
    });
  }, [filters, value]);

  function updateTransaction(id, patch) {
    onChange(value.map((transaction) => (transaction.id === id ? { ...transaction, ...patch } : transaction)));
  }

  function deleteTransaction(id) {
    onChange(value.filter((transaction) => transaction.id !== id));
  }

  function addTransaction() {
    if (!newTransaction.userName.trim()) return;
    onChange([
      {
        id: makeId('TX'),
        userId: newTransaction.userEmail || makeId('USR'),
        userName: newTransaction.userName.trim(),
        userEmail: newTransaction.userEmail.trim(),
        type: newTransaction.type,
        amount: Number(newTransaction.amount || 0),
        crypto: newTransaction.crypto,
        quantity: Number(newTransaction.quantity || 0),
        payoutMethod: newTransaction.payoutMethod,
        status: newTransaction.status,
        date: new Date(newTransaction.date || new Date().toISOString()).toISOString(),
      },
      ...value,
    ]);
  }

  function exportCsv() {
    const rows = filteredTransactions.map((transaction) => ({
      id: transaction.id,
      utilisateur: transaction.userName,
      email: transaction.userEmail,
      type: transaction.type,
      montant: transaction.amount,
      crypto: transaction.crypto,
      quantite: transaction.quantity,
      statut: transaction.status,
      date: formatDateTime(transaction.date),
    }));
    downloadTextFile('transactions-export.csv', toCsvString(rows), 'text/csv;charset=utf-8');
  }

  const totalVolume = value.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const pendingCount = value.filter((transaction) => transaction.status === 'En attente').length;
  const confirmedCount = value.filter((transaction) => transaction.status === 'Confirmée').length;
  const cryptos = Array.from(new Set(value.map((transaction) => transaction.crypto)));

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <StatCard label="Transactions" value={String(value.length)} helper="Dataset complet" />
        <StatCard label="Volume total" value={euro(totalVolume)} helper="Montants cumulés" tone="warning" />
        <StatCard label="En attente" value={String(pendingCount)} helper="À traiter" tone="info" />
        <StatCard label="Confirmées" value={String(confirmedCount)} helper="Validées" tone="success" />
      </div>

      <SectionCard eyebrow="Ajout" title="Ajouter une transaction mock" description="Création manuelle d’une ligne dans le dataset local.">
        <div className="field-grid field-grid--4">
          <Field label="Utilisateur">
            <input value={newTransaction.userName} onChange={(event) => setNewTransaction((current) => ({ ...current, userName: event.target.value }))} />
          </Field>
          <Field label="Email utilisateur">
            <input value={newTransaction.userEmail} onChange={(event) => setNewTransaction((current) => ({ ...current, userEmail: event.target.value }))} />
          </Field>
          <Field label="Crypto">
            <input value={newTransaction.crypto} onChange={(event) => setNewTransaction((current) => ({ ...current, crypto: event.target.value.toUpperCase() }))} />
          </Field>
          <Field label="Montant (€)">
            <input type="number" min="0" step="0.01" value={newTransaction.amount} onChange={(event) => setNewTransaction((current) => ({ ...current, amount: Number(event.target.value || 0) }))} />
          </Field>
          <Field label="Quantité crypto">
            <input type="number" min="0" step="0.0001" value={newTransaction.quantity} onChange={(event) => setNewTransaction((current) => ({ ...current, quantity: Number(event.target.value || 0) }))} />
          </Field>
          <Field label="Statut">
            <select value={newTransaction.status} onChange={(event) => setNewTransaction((current) => ({ ...current, status: event.target.value }))}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="Date / heure">
            <input type="datetime-local" value={newTransaction.date} onChange={(event) => setNewTransaction((current) => ({ ...current, date: event.target.value }))} />
          </Field>
          <div className="field field--action">
            <span className="field__label">Action</span>
            <button className="button button--primary" type="button" onClick={addTransaction}>
              Ajouter la transaction
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Filtres" title="Filtrer et exporter" description="Affiche uniquement les transactions correspondant à tes critères puis exporte le résultat en CSV.">
        <div className="field-grid field-grid--4">
          <Field label="Statut">
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="all">Tous</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="Crypto">
            <select value={filters.crypto} onChange={(event) => setFilters((current) => ({ ...current, crypto: event.target.value }))}>
              <option value="all">Toutes</option>
              {cryptos.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="Montant minimum (€)">
            <input type="number" min="0" value={filters.minAmount} onChange={(event) => setFilters((current) => ({ ...current, minAmount: event.target.value }))} />
          </Field>
          <Field label="Date">
            <input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
          </Field>
        </div>
        <div className="section-toolbar section-toolbar--right">
          <button className="button button--ghost" type="button" onClick={exportCsv}>
            Exporter CSV
          </button>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Tableau" title="Transactions mock" description="Change les statuts inline, supprime des lignes ou ajuste les montants à la volée.">
        {!filteredTransactions.length ? (
          <EmptyState title="Aucune transaction" description="Aucun résultat avec les filtres actuels." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Utilisateur</th>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Crypto</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>
                      <strong>{transaction.userName}</strong>
                      <span>{transaction.userEmail}</span>
                    </td>
                    <td>{transaction.type}</td>
                    <td>
                      <input type="number" min="0" step="0.01" value={transaction.amount} onChange={(event) => updateTransaction(transaction.id, { amount: Number(event.target.value || 0) })} />
                    </td>
                    <td>
                      <input value={transaction.crypto} onChange={(event) => updateTransaction(transaction.id, { crypto: event.target.value.toUpperCase() })} />
                    </td>
                    <td>
                      <select value={transaction.status} onChange={(event) => updateTransaction(transaction.id, { status: event.target.value })}>
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                    <td>{formatDateTime(transaction.date)}</td>
                    <td>
                      <div className="inline-actions">
                        <Badge tone={statusTone(transaction.status)}>{transaction.status}</Badge>
                        <button className="button button--ghost button--sm" type="button" onClick={() => deleteTransaction(transaction.id)}>
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
