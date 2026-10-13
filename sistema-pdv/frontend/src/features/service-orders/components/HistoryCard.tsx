import Card from "../../../components/ui/Card"
import type { ServiceOrderHistoryEntry } from "../../../services/serviceOrders"

interface HistoryCardProps {
  entries: readonly ServiceOrderHistoryEntry[]
}

export default function HistoryCard({ entries }: HistoryCardProps) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
        Histórico
      </p>
      <ol className="mt-4 space-y-4">
        {entries.map((entry) => (
          <li className="relative pl-5" key={entry.id}>
            <span className="absolute left-0 top-1.5 size-2 rounded-full bg-neutral-400" />
            <p className="text-sm font-medium text-neutral-800">
              {entry.description}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(entry.date))}{" "}
              · {entry.user}
            </p>
          </li>
        ))}
      </ol>
    </Card>
  )
}
