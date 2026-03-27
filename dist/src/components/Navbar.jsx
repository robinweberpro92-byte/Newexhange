import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { config, auth, logout } = useApp();
  const logo = config.branding.logoDataUrl || config.branding.logoUrl || '/logo-mark.svg';

  return (
    <header className="nav-shell">
      <div className="container nav">
        <NavLink to="/" className="brand">
          <img src={logo} alt={`Logo ${config.branding.siteName}`} className="brand__logo" />
          <div>
            <strong>{config.branding.siteName}</strong>
            <span>{config.branding.tagline}</span>
          </div>
        </NavLink>

        <nav className="nav__links">
          <NavLink to="/exchange">Exchange</NavLink>
          <NavLink to="/market">Market</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>

        <div className="nav__actions">
          {auth.loggedIn ? (
            <>
              <span className="nav__user">{auth.email}</span>
              <button className="button button--ghost" onClick={logout}>
                Déconnexion
              </button>
            </>
          ) : config.security.loginPageEnabled ? (
            <NavLink to="/login" className="button button--ghost">
              Login démo
            </NavLink>
          ) : null}
          <NavLink to="/exchange" className="button button--primary">
            {config.content.home.primaryCtaText}
          </NavLink>
        </div>
      </div>
    </header>
  );
}
