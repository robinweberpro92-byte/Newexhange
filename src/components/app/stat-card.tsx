import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  meta?: string;
};

export function StatCard({ label, value, meta }: StatCardProps) {
  return (
    <Card className="space-y-2 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="font-display text-3xl font-extrabold text-text">{value}</p>
      {meta ? <p className="text-sm text-muted">{meta}</p> : null}
    </Card>
  );
}
