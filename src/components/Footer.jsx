import { useApp } from '../context/AppContext';

export default function Footer() {
  const { config } = useApp();
  const logo = config.branding.logoDataUrl || config.branding.logoUrl || '/logo-mark.svg';

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <div className="brand brand--footer">
            <img src={logo} alt={config.branding.siteName} className="brand__logo" />
            <div>
              <strong>{config.branding.siteName}</strong>
              <span>{config.branding.tagline}</span>
            </div>
          </div>
          <p>{config.content.footer.text}</p>
          <small>{config.branding.footerCopyright}</small>
        </div>
        <div>
          <h4>Liens légaux</h4>
          <ul>
            {config.branding.footerLinks.map((link) => (
              <li key={`${link.label}-${link.url}`}>
                <a href={link.url}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Social</h4>
          <ul>
            <li><a href={config.branding.socials.twitter}>Twitter</a></li>
            <li><a href={config.branding.socials.telegram}>Telegram</a></li>
            <li><a href={config.branding.socials.discord}>Discord</a></li>
          </ul>
        </div>
        <div>
          <h4>Support</h4>
          <ul>
            <li>{config.branding.supportEmail}</li>
            <li>{config.payments.paypalEmail}</li>
            <li>{config.payments.confirmationDelay}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
