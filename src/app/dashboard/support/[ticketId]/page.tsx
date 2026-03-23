import { closeTicketAction, replyTicketAction } from "@/actions/user";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { requireUser } from "@/lib/auth";
import { getUserTicketDetail } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardTicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const user = await requireUser();
  const { ticketId } = await params;
  const ticket = await getUserTicketDetail(user.id, ticketId);
  if (!ticket) {
    redirect("/dashboard/support");
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Ticket detail</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">{ticket.subject}</h2>
            <p className="mt-2 text-sm text-muted">{ticket.number}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={ticket.status === "OPEN" ? "amber" : ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "green" : "blue"}>{ticket.status}</Badge>
            <Badge tone="slate">{ticket.priority}</Badge>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Conversation</p>
          <h3 className="mt-2 font-display text-2xl font-black text-text">Thread</h3>
        </div>
        <div className="space-y-4">
          {ticket.messages.map((message) => (
            <div key={message.id} className={`rounded-2xl border border-line p-4 ${message.authorId === user.id ? "bg-white/5" : "bg-[rgba(73,162,255,0.08)]"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-text">{message.author.firstName} {message.author.lastName}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">{formatDate(message.createdAt)}</p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">{message.message}</p>
            </div>
          ))}
        </div>
      </Card>

      {ticket.status !== "CLOSED" ? (
        <Card className="space-y-4">
          <form action={replyTicketAction} className="space-y-4">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <div>
              <label className="mb-2 block text-sm text-muted">Reply</label>
              <Textarea name="message" required placeholder="Write your reply" />
            </div>
            <SubmitButton label="Send reply" pendingLabel="Sending..." />
          </form>
          <form action={closeTicketAction}>
            <input type="hidden" name="ticketId" value={ticket.id} />
            <SubmitButton label="Close ticket" pendingLabel="Closing..." variant="secondary" />
          </form>
        </Card>
      ) : null}
    </div>
  );
}
