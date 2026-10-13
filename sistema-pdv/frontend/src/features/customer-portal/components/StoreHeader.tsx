import type { PublicStore } from "../../../domain/types"

interface StoreHeaderProps {
  store: PublicStore
}

export default function StoreHeader({ store }: StoreHeaderProps) {
  return (
    <header className="border-b border-[#d7d7d2] bg-white px-5 py-5">
      <div className="mx-auto flex max-w-[430px] items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-dashed border-[#9d9d98] text-[9px] uppercase tracking-wide text-[#777873]">
          logo
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-[#292927]">
            {store.name}
          </p>
          <p className="truncate text-xs text-[#6e6f6a]">{store.address}</p>
        </div>
      </div>
    </header>
  )
}
