import Card from '../components/Card';
import Badge from '../components/Badge';
import { useApp } from '../context/AppContext';
import { euro, formatDateTime, statusTone } from '../utils/format';

export default function TransactionsPage() {
  const { config } = useApp();

  return (
    <section className="container section page-intro">
      <div className="page-head">
        <span className="eyebrow">Transactions</span>
        <h1>Historique simulé</h1>
        <p>Table prête à être alimentée par ton propre backend ensuite, sans casser le front statique.</p>
      </div>

      <Card>
        <div className="table-wrap">
          <table className="market-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Asset</th>
                <th>Montant</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {config.transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{formatDateTime(transaction.date)}</td>
                  <td>
                    <strong>{transaction.userName}</strong>
                    <span>{transaction.userEmail}</span>
                  </td>
                  <td>{transaction.crypto}</td>
                  <td>{euro(transaction.amount)}</td>
                  <td>{transaction.type}</td>
                  <td>
                    <Badge tone={statusTone(transaction.status)}>{transaction.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
