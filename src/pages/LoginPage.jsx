import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { auth, config, login, ready } = useApp();
  const [email, setEmail] = useState(config.security.admin.username);
  const [password, setPassword] = useState('demo1234');
  const [message, setMessage] = useState('Utilise les identifiants admin configurés dans l’onglet Sécurité.');
  const [loading, setLoading] = useState(false);

  if (!ready) {
    return (
      <section className="container section centered-page">
        <Card className="auth-card">
          <p className="eyebrow">Login démo</p>
          <h1>Chargement…</h1>
          <p className="muted">Lecture de la configuration locale.</p>
        </Card>
      </section>
    );
  }

  if (auth.loggedIn) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
    }
  }

  const loginDisabled = !config.security.loginPageEnabled;

  return (
    <section className="container section centered-page">
      <Card className="auth-card">
        <p className="eyebrow">Login démo</p>
        <h1>{config.content.login.title}</h1>
        <p className="muted">{loginDisabled ? 'Le login public est désactivé, mais l’accès admin reste possible avec les bons identifiants.' : config.content.login.subtitle}</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Mot de passe</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button className="button button--primary button--full" type="submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Ouvrir l’admin'}
          </button>
        </form>

        <div className="login-hint">{message}</div>
      </Card>
    </section>
  );
}
