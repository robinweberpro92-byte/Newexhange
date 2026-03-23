import { deleteReviewAction, upsertReviewAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminReviewsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const editId = typeof params.edit === "string" ? params.edit : undefined;

  const reviews = await prisma.review.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

  const selected = reviews.find((review) => review.id === editId) ?? null;
  const pendingCount = reviews.filter((review) => review.status === "PENDING").length;
  const featuredCount = reviews.filter((review) => review.featured).length;
  const verifiedCount = reviews.filter((review) => review.verifiedBadge).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Pending moderation</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{pendingCount}</p>
          <p className="mt-2 text-sm text-muted">Reviews waiting for approval or rejection.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Featured on homepage</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{featuredCount}</p>
          <p className="mt-2 text-sm text-muted">These reviews can surface above the fold when approved.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Verified badge</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{verifiedCount}</p>
          <p className="mt-2 text-sm text-muted">Proof-backed testimonials highlighted for trust.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Review editor</p>
              <h2 className="mt-2 font-display text-2xl font-black text-text">{selected ? `Edit ${selected.authorName}` : "Create a review"}</h2>
            </div>
            {selected ? (
              <Link href="/admin/reviews" className="text-sm font-semibold text-[var(--brand-secondary)] hover:underline">
                Clear selection
              </Link>
            ) : null}
          </div>

          <form action={upsertReviewAction} className="grid gap-4 md:grid-cols-2">
            {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
            <div>
              <label className="mb-2 block text-sm text-muted">Author name</label>
              <Input name="authorName" defaultValue={selected?.authorName ?? ""} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Country</label>
              <Input name="country" defaultValue={selected?.country ?? ""} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Avatar URL</label>
              <Input name="avatarUrl" defaultValue={selected?.avatarUrl ?? ""} placeholder="https://..." />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Display date</label>
              <Input
                name="displayDate"
                type="datetime-local"
                defaultValue={selected?.displayDate ? new Date(selected.displayDate).toISOString().slice(0, 16) : ""}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Locale</label>
              <Select name="locale" defaultValue={selected?.locale ?? "fr"}>
                <option value="fr">French</option>
                <option value="en">English</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Status</label>
              <Select name="status" defaultValue={selected?.status ?? "PENDING"}>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Rating</label>
              <Input name="rating" type="number" min="1" max="5" step="1" defaultValue={selected?.rating ?? 5} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Sort order</label>
              <Input name="sortOrder" type="number" min="0" step="1" defaultValue={selected?.sortOrder ?? reviews.length} required />
            </div>
            <div className="rounded-3xl border border-line bg-white/5 p-4 md:col-span-2">
              <p className="mb-3 text-sm font-semibold text-text">Visibility</p>
              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="featured" defaultChecked={selected?.featured ?? false} /> Featured</label>
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="verifiedBadge" defaultChecked={selected?.verifiedBadge ?? false} /> Verified badge</label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-muted">Review text</label>
              <Textarea name="text" defaultValue={selected?.text ?? ""} required className="min-h-[180px]" />
            </div>
            <div className="md:col-span-2">
              <SubmitButton label={selected ? "Update review" : "Create review"} pendingLabel="Saving..." className="w-full" />
            </div>
          </form>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Moderation queue</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Reviews catalogue</h2>
          </div>

          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-3xl border border-line bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-xl font-black text-text">{review.authorName}</p>
                      <Badge tone={review.status === "APPROVED" ? "green" : review.status === "PENDING" ? "amber" : "red"}>{review.status}</Badge>
                      {review.featured ? <Badge tone="blue">FEATURED</Badge> : null}
                      {review.verifiedBadge ? <Badge tone="green">VERIFIED</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-muted">{review.country ?? "No country"} • {review.locale.toUpperCase()} • {review.rating}/5</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/reviews?edit=${review.id}`} className="rounded-full border border-line px-3 py-2 text-sm text-text transition hover:bg-white/10">
                      Edit
                    </Link>
                    <form action={deleteReviewAction}>
                      <input type="hidden" name="id" value={review.id} />
                      <SubmitButton label="Delete" pendingLabel="Deleting..." variant="danger" size="sm" />
                    </form>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">“{review.text}”</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">Updated {formatDate(review.updatedAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
