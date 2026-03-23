import { Badge } from "@/components/ui/badge";

type SectionHeadingProps = {
  badge?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ badge, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-4">
      {badge ? <Badge tone="green">{badge}</Badge> : null}
      <h2 className="font-display text-3xl font-extrabold tracking-tight text-text md:text-5xl">{title}</h2>
      {description ? <p className="text-base leading-7 text-muted md:text-lg">{description}</p> : null}
    </div>
  );
}
