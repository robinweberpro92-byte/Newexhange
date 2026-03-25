import { Card } from "@/components/ui/card";
import { getContactContent, getSocialLinks } from "@/lib/cms";

export default async function ContactPage() {
  const [contact, socials] = await Promise.all([getContactContent(), getSocialLinks()]);

  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Contact</p>
          <h1 className="font-display text-4xl font-black text-text">Parler a l'equipe</h1>
          <p className="text-muted">Besoin d'aide sur un rail PayPal, BTC, LTC, USDT, carte ou virement ? Contactez le support ou rejoignez nos canaux communautaires.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="space-y-3 p-8 text-sm leading-7 text-muted">
            <p>Email : {contact.email}</p>
            <p>Telephone : {contact.phone}</p>
            <p>Adresse : {contact.address}</p>
            <p>Delai de reponse cible : moins de 2 heures sur les tickets critiques.</p>
          </Card>
          <Card className="space-y-3 p-8 text-sm leading-7 text-muted">
            <p className="font-semibold text-text">Community shortcuts</p>
            {socials.discord ? <a className="block text-[var(--brand-secondary)] hover:underline" href={socials.discord} target="_blank" rel="noreferrer">Discord</a> : null}
            {socials.telegram ? <a className="block text-[var(--brand-secondary)] hover:underline" href={socials.telegram} target="_blank" rel="noreferrer">Telegram</a> : null}
            {socials.twitter ? <a className="block text-[var(--brand-secondary)] hover:underline" href={socials.twitter} target="_blank" rel="noreferrer">Twitter / X</a> : null}
          </Card>
        </div>
      </div>
    </section>
  );
}
