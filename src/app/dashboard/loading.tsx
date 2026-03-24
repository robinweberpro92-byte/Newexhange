export default function DashboardLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-10 w-52 animate-pulse rounded-2xl bg-white/5" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[1.6rem] border border-line bg-white/5" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-[1.8rem] border border-line bg-white/5" />
    </div>
  );
}
