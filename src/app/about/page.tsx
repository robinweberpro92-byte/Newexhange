import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">About</p>
          <h1 className="font-display text-4xl font-black text-text">A propos de YasarPack</h1>
          <p className="text-muted">YasarPack est pense comme une base produit fintech/crypto premium : claire pour l'utilisateur, flexible pour l'admin et exploitable a long terme.</p>
        </div>
        <Card className="space-y-4 p-8 text-sm leading-7 text-muted">
          <p>Le produit s'appuie sur un back-office capable de piloter les moyens de paiement, les frais, les contenus publics, les annonces, les traductions et les parcours critiques.</p>
          <p>L'objectif est de rendre l'exchange plus lisible : savoir quoi envoyer, quoi recevoir, avec quel rail, en combien de temps et dans quelles conditions de verification.</p>
        </Card>
      </div>
    </section>
  );
}
