export default function GlobalLoading() {
  return (
    <div className="container-app flex min-h-[60vh] items-center justify-center py-20">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-16 w-16 animate-pulse rounded-3xl bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-secondary))]" />
        <div>
          <p className="font-display text-2xl font-black text-text">YasarPack</p>
          <p className="text-sm text-muted">Chargement de l'experience premium...</p>
        </div>
      </div>
    </div>
  );
}
