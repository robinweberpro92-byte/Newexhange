export default function AdminLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-10 w-64 animate-pulse rounded-2xl bg-white/5" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-[1.6rem] border border-line bg-white/5" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-[1.8rem] border border-line bg-white/5" />
    </div>
  );
}
