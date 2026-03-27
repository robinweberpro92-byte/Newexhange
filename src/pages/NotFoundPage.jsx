import { Link } from 'react-router-dom';
import Card from '../components/Card';

export default function NotFoundPage() {
  return (
    <section className="container section centered-page">
      <Card className="auth-card">
        <p className="eyebrow">404</p>
        <h1>Page non trouvée</h1>
        <p className="muted">La route n’existe pas encore ou n’est pas branchée.</p>
        <Link to="/" className="button button--primary">
          Retour accueil
        </Link>
      </Card>
    </section>
  );
}
