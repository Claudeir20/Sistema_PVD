import { storeInitials, storeName } from "../../config/store"

/** Iniciais e nome da loja, no topo dos dois layouts. */
export default function StoreBrand({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-lg bg-neutral-900 text-sm font-bold text-white"
      >
        {storeInitials(storeName)}
      </div>
      <div className="min-w-0">
        <p className="truncate font-bold text-neutral-900">{storeName}</p>
        <p className="text-xs text-neutral-500">{subtitle}</p>
      </div>
    </div>
  )
}
