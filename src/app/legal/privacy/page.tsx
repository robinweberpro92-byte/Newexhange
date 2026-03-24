import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Legal</p>
          <h1 className="font-display text-4xl font-black text-text">Politique de confidentialite</h1>
          <p className="text-muted">Cette version de travail de YasarPack explique quelles donnees sont collectées, pourquoi elles le sont et comment elles sont protegées.</p>
        </div>
        <Card className="space-y-4 p-8 text-sm leading-7 text-muted">
          <p>Nous collectons uniquement les informations necessaires a la creation du compte, a la securisation des sessions, a la prevention de la fraude, a la gestion des transactions et au support client.</p>
          <p>Les donnees sensibles de verification peuvent etre demandees uniquement lorsque le montant, le pays ou le rail de paiement l'exige.</p>
          <p>Les acces administrateur sont journalises. Les mots de passe sont haches. Les sessions sont protegees et les changements critiques peuvent donner lieu a des verifications supplementaires.</p>
          <p>Pour toute question relative a vos donnees, contactez support@yasarpack.com.</p>
        </Card>
      </div>
    </section>
  );
}
