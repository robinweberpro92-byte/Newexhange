import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

function kycTone(status: string) {
  if (status === "APPROVED") return "green" as const;
  if (status === "REJECTED") return "red" as const;
  if (status === "PENDING") return "amber" as const;
  return "slate" as const;
}

export default async function DashboardKycPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const params = await searchParams;
  const latest = await prisma.kycSubmission.findFirst({
    where: { userId: user.id },
    orderBy: { submittedAt: "desc" },
    include: { reviewedBy: true }
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Current KYC status</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Compliance review</h2>
          </div>
          <Badge tone={kycTone(user.kycStatus)}>{user.kycStatus.replaceAll("_", " ")}</Badge>
        </div>

        {params.submitted === "1" ? (
          <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">KYC submission uploaded successfully.</p>
        ) : null}

        {latest ? (
          <div className="space-y-3 rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">
            <p>Document type: <span className="font-semibold text-text">{latest.documentType}</span></p>
            <p>Submitted at: <span className="font-semibold text-text">{formatDate(latest.submittedAt)}</span></p>
            <p>Admin comment: <span className="font-semibold text-text">{latest.adminComment ?? "No comment yet"}</span></p>
            <p>Reviewed by: <span className="font-semibold text-text">{latest.reviewedBy ? `${latest.reviewedBy.firstName} ${latest.reviewedBy.lastName}` : "Pending"}</span></p>
          </div>
        ) : (
          <p className="rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">No document submitted yet.</p>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Upload mock documents</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">Submit KYC</h2>
        </div>
        <form action="/api/kyc/upload" method="post" encType="multipart/form-data" className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm text-muted">Document type</label>
            <select name="documentType" className="h-11 w-full rounded-2xl border border-line bg-white/5 px-4 text-sm text-text outline-none">
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
              <option value="drivers_license">Driver's license</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Front document *</label>
            <input name="documentFront" type="file" required className="w-full rounded-2xl border border-line bg-white/5 p-3 text-sm text-text" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Back document</label>
            <input name="documentBack" type="file" className="w-full rounded-2xl border border-line bg-white/5 p-3 text-sm text-text" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Selfie</label>
            <input name="selfie" type="file" className="w-full rounded-2xl border border-line bg-white/5 p-3 text-sm text-text" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Address proof</label>
            <input name="addressProof" type="file" className="w-full rounded-2xl border border-line bg-white/5 p-3 text-sm text-text" />
          </div>
          <button type="submit" className="h-11 rounded-2xl bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-secondary))] px-4 font-semibold text-slate-950">
            Submit KYC
          </button>
        </form>
      </Card>
    </div>
  );
}
