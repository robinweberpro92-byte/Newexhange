import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Legal</p>
          <h1 className="font-display text-4xl font-black text-text">Conditions d'utilisation</h1>
          <p className="text-muted">Les operations proposees par YasarPack sont soumises aux controles de securite, de conformite et aux disponibilites des moyens de paiement.</p>
        </div>
        <Card className="space-y-4 p-8 text-sm leading-7 text-muted">
          <p>En utilisant la plateforme, vous acceptez de fournir des informations exactes, de respecter les lois applicables et de cooperer avec les demandes de verification lorsqu'elles sont necessaires.</p>
          <p>Les frais, delais et disponibilites sont affiches avant confirmation de toute operation. Une transaction ne devient definitive qu'apres validation complete du flux et des controles requis.</p>
          <p>Les comptes peuvent etre restreints ou suspendus en cas de fraude suspectee, de retrofacturation abusive ou de non-respect des obligations de conformite.</p>
        </Card>
      </div>
    </section>
  );
}
