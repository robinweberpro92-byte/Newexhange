export default function DashboardExchangeLoading() {
  return (
    <div className="container-app py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-64 rounded-2xl bg-white/10" />
        <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
          <div className="h-[520px] rounded-[2rem] bg-white/10" />
          <div className="h-[520px] rounded-[2rem] bg-white/10" />
        </div>
      </div>
    </div>
  );
}
