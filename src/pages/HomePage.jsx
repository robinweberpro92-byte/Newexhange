import { Link } from 'react-router-dom';
import Card from '../components/Card';
import ExchangeForm from '../components/ExchangeForm';
import MarketTable from '../components/MarketTable';
import StatsStrip from '../components/StatsStrip';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const { config } = useApp();

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">Interface démo prête à piloter</span>
            <h1>{config.content.home.heroTitle}</h1>
            <p>{config.content.home.heroSubtitle}</p>
            <div className="hero__actions">
              <Link to="/exchange" className="button button--primary">
                {config.content.home.primaryCtaText}
              </Link>
              <Link to="/admin" className="button button--ghost">
                {config.content.home.secondaryCtaText}
              </Link>
            </div>
            <div className="hero__chips">
              <span>SPA statique Vite</span>
              <span>Admin localStorage</span>
              <span>Dark / Light mode</span>
            </div>
          </div>
          <ExchangeForm compact />
        </div>
      </section>

      <section className="container section">
        <StatsStrip />
      </section>

      <section className="container section feature-grid">
        {config.content.home.reasons.map((item, index) => (
          <Card key={`${item.title}-${index}`}>
            <p className="eyebrow">0{index + 1}</p>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Card>
        ))}
      </section>

      <section className="container section two-col">
        <Card>
          <p className="eyebrow">Comment ça marche</p>
          <h3>Parcours utilisateur</h3>
          <div className="steps-list">
            {config.content.home.steps.map((step, index) => (
              <div key={`${step}-${index}`} className="step-row">
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="eyebrow">Mise en avant</p>
          <h3>Pourquoi ce starter est pratique</h3>
          <ul className="bullet-list">
            <li>Build Vite stable et compatible Vercel.</li>
            <li>Aucun Prisma ni backend imposé pour la démo.</li>
            <li>Panel admin complet pour piloter le contenu et les mocks.</li>
            <li>Tout est persisté en localStorage.</li>
          </ul>
        </Card>
      </section>

      <section className="container section">
        <MarketTable limit={4} />
      </section>
    </>
  );
}
