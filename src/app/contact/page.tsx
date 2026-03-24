import { Card } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Contact</p>
          <h1 className="font-display text-4xl font-black text-text">Parler a l'equipe</h1>
          <p className="text-muted">Besoin d'aide sur un rail PayPal, BTC, LTC, USDT, carte ou virement ? Contactez le support.</p>
        </div>
        <Card className="space-y-3 p-8 text-sm leading-7 text-muted">
          <p>Email : support@yasarpack.com</p>
          <p>Telephone : +33 1 84 80 29 11</p>
          <p>Adresse : 12 rue de la Paix, 75002 Paris, France</p>
          <p>Delai de reponse cible : moins de 2 heures sur les tickets critiques.</p>
        </Card>
      </div>
    </section>
  );
}
