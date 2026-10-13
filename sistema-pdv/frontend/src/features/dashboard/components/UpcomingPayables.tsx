import Card from "../../../components/ui/Card"
import { formatMoney } from "../../../domain/formatters"
import type { AccountPayable } from "../../../services/accountsPayable"

interface UpcomingPayablesProps {
  accounts: readonly AccountPayable[]
  now?: Date
}

export default function UpcomingPayables({
  accounts,
  now = new Date(),
}: UpcomingPayablesProps) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  end.setHours(23, 59, 59, 999)
  const upcoming = accounts
    .filter((account) => account.dueDate >= start && account.dueDate <= end)
    .sort((left, right) => left.dueDate.getTime() - right.dueDate.getTime())

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-neutral-200 px-4 py-4">
        <h2 className="font-bold text-neutral-900">
          Contas a pagar — próximos 7 dias
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          {upcoming.length} vencimentos próximos
        </p>
      </div>

      <div className="divide-y divide-neutral-200">
        {upcoming.map((account) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3"
            key={account.id}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-800">
                {account.supplier}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {new Intl.DateTimeFormat("pt-BR").format(account.dueDate)}
              </p>
            </div>
            <span className="self-center font-mono text-sm text-neutral-800">
              {formatMoney(account.amountInCents)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
