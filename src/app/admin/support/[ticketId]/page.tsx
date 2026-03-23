import { adminReplyTicketAction, updateTicketAdminAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { getAdminTicketDetail } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const [ticket, admins] = await Promise.all([
    getAdminTicketDetail(ticketId),
    prisma.user.findMany({
      where: { role: "ADMIN", isActive: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }]
    })
  ]);

  if (!ticket) {
    redirect("/admin/support");
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Support ticket</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">{ticket.subject}</h2>
            <p className="mt-2 text-sm text-muted">{ticket.number} • {ticket.user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={ticket.status === "OPEN" ? "amber" : ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "green" : "blue"}>{ticket.status}</Badge>
            <Badge tone={ticket.priority === "URGENT" ? "red" : ticket.priority === "HIGH" ? "amber" : "slate"}>{ticket.priority}</Badge>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Conversation</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Thread and internal notes</h2>
          </div>
          <div className="space-y-4">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-3xl border p-4 ${message.isInternal ? "border-amber-500/20 bg-amber-500/10" : message.authorRole === "ADMIN" ? "border-sky-500/20 bg-sky-500/10" : "border-line bg-white/5"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text">{message.author.firstName} {message.author.lastName}</p>
                    <Badge tone={message.isInternal ? "amber" : message.authorRole === "ADMIN" ? "blue" : "slate"}>{message.isInternal ? "INTERNAL" : message.authorRole}</Badge>
                  </div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">{formatDate(message.createdAt)}</p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">{message.message}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Ticket control</p>
              <h2 className="mt-2 font-display text-2xl font-black text-text">Assignment and status</h2>
            </div>
            <form action={updateTicketAdminAction} className="space-y-4">
              <input type="hidden" name="ticketId" value={ticket.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-muted">Status</label>
                  <Select name="status" defaultValue={ticket.status}>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="WAITING_ON_USER">Waiting on user</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-muted">Priority</label>
                  <Select name="priority" defaultValue={ticket.priority}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </Select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Assigned admin</label>
                <Select name="assignedAdminId" defaultValue={ticket.assignedAdminId ?? ""}>
                  <option value="">Unassigned</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>{admin.firstName} {admin.lastName}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Internal note</label>
                <Textarea name="internalNote" defaultValue={ticket.internalNote ?? ""} className="min-h-[140px]" />
              </div>
              <SubmitButton label="Update ticket" pendingLabel="Saving..." className="w-full" />
            </form>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Reply</p>
              <h2 className="mt-2 font-display text-2xl font-black text-text">Send message</h2>
            </div>
            <form action={adminReplyTicketAction} className="space-y-4">
              <input type="hidden" name="ticketId" value={ticket.id} />
              <div className="rounded-3xl border border-line bg-white/5 p-4">
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="isInternal" /> Post as internal note only</label>
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Message</label>
                <Textarea name="message" required className="min-h-[180px]" placeholder="Write the next response or internal note" />
              </div>
              <SubmitButton label="Send message" pendingLabel="Sending..." className="w-full" />
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
