import { NavLink, Outlet } from "react-router-dom"

const navigation = [
  { label: "Vender", to: "/vender" },
  { label: "Ordens de serviço", to: "/os/1" },
  { label: "Painel", to: "/painel" },
]

export default function OperationLayout() {
  return (
    <div className="min-h-dvh w-full max-w-full overflow-x-hidden bg-[#f4f4f2]">
      <header className="no-print border-b border-[#d8d7d2] bg-white px-5 py-4">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-10 place-items-center rounded-lg border border-dashed border-neutral-400 text-[9px] uppercase text-neutral-500">
              logo
            </div>
            <div>
              <p className="font-bold text-neutral-900">Oficina Central</p>
              <p className="text-xs text-neutral-500">
                Caixa 01 · Operador: Marina
              </p>
            </div>
          </div>

          <nav
            aria-label="Navegação operacional"
            className="flex flex-wrap gap-2"
          >
            {navigation.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `inline-flex min-h-10 items-center rounded-lg border px-4 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
                  }`
                }
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
