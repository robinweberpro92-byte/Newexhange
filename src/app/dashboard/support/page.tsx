import Link from "next/link";
import { createTicketAction } from "@/actions/user";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { getUserTicketsData } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function DashboardSupportPage() {
  const user = await requireUser();
  const tickets = await getUserTicketsData(user.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Your tickets</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">Support history</h2>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Messages</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <Link href={`/dashboard/support/${ticket.id}`} className="font-semibold text-text hover:underline">
                      {ticket.number}
                    </Link>
                  </td>
                  <td>{ticket.subject}</td>
                  <td>
                    <Badge tone={ticket.status === "OPEN" ? "amber" : ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "green" : "blue"}>{ticket.status}</Badge>
                  </td>
                  <td>{ticket.priority}</td>
                  <td>{ticket._count.messages}</td>
                  <td>{formatDate(ticket.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Create a ticket</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">Need help?</h2>
        </div>
        <form action={createTicketAction} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-muted">Subject</label>
            <Input name="subject" placeholder="Example: Deposit still pending" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-muted">Priority</label>
              <Select name="priority" defaultValue="MEDIUM">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Category</label>
              <Select name="category" defaultValue="GENERAL">
                <option value="GENERAL">General</option>
                <option value="PAYMENT">Payment</option>
                <option value="KYC">KYC</option>
                <option value="ACCOUNT">Account</option>
                <option value="LOYALTY">Loyalty</option>
                <option value="TECHNICAL">Technical</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Message</label>
            <Textarea name="message" placeholder="Describe your issue with as much context as possible" required />
          </div>
          <SubmitButton label="Create ticket" pendingLabel="Creating..." className="w-full" />
        </form>
      </Card>
    </div>
  );
}
