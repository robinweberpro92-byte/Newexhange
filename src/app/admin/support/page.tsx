import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { getAdminTicketsData } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function AdminSupportPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const priority = typeof params.priority === "string" ? params.priority : undefined;

  const tickets = await getAdminTicketsData({ status, priority });

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Ticket operations</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Support queue</h2>
          </div>

          <form className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-muted">Status</label>
              <Select name="status" defaultValue={status ?? ""}>
                <option value="">All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="WAITING_ON_USER">Waiting on user</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Priority</label>
              <Select name="priority" defaultValue={priority ?? ""}>
                <option value="">All</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-text transition hover:bg-white/10">
                Apply filters
              </button>
            </div>
          </form>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>User</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Messages</th>
                <th>Last update</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <Link href={`/admin/support/${ticket.id}`} className="font-semibold text-text hover:underline">
                      {ticket.number}
                    </Link>
                  </td>
                  <td>{ticket.user.email}</td>
                  <td>{ticket.subject}</td>
                  <td>
                    <Badge tone={ticket.status === "OPEN" ? "amber" : ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "green" : "blue"}>{ticket.status}</Badge>
                  </td>
                  <td>
                    <Badge tone={ticket.priority === "URGENT" ? "red" : ticket.priority === "HIGH" ? "amber" : "slate"}>{ticket.priority}</Badge>
                  </td>
                  <td>{ticket.assignedAdmin ? `${ticket.assignedAdmin.firstName} ${ticket.assignedAdmin.lastName}` : "Unassigned"}</td>
                  <td>{ticket._count.messages}</td>
                  <td>{formatDate(ticket.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
