import { Card } from "@/components/ui/card";

export default function SecurityPage() {
  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Trust & security</p>
          <h1 className="font-display text-4xl font-black text-text">Securite & verification</h1>
          <p className="text-muted">Sessions securisees, verification progressive, journalisation admin et gestion claire des transactions critiques.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3 p-6 text-sm leading-7 text-muted"><h2 className="font-display text-2xl font-black text-text">Protection des acces</h2><p>Mots de passe haches, sessions signees et restrictions de role entre comptes clients et comptes back-office.</p></Card>
          <Card className="space-y-3 p-6 text-sm leading-7 text-muted"><h2 className="font-display text-2xl font-black text-text">KYC progressif</h2><p>Les documents ne sont demandes que lorsque le rail, le pays ou le montant le rend necessaire.</p></Card>
        </div>
      </div>
    </section>
  );
}
