import { NavLink, Outlet } from "react-router-dom"

const navigation = [
  { label: "Painel", to: "/painel" },
  { label: "Vender (PDV)", to: "/vender" },
  { label: "Ordens de serviço", to: "/os/1" },
  { label: "Estoque", to: "/painel?area=estoque" },
  { label: "Financeiro", to: "/painel?area=financeiro" },
  { label: "Clientes", to: "/painel?area=clientes" },
  { label: "Notas fiscais", to: "/painel?area=notas-fiscais" },
  { label: "Configurações", to: "/painel?area=configuracoes" },
]

export default function AdminLayout() {
  return (
    <div className="min-h-dvh bg-[#f4f4f2] lg:flex">
      <aside className="border-b border-neutral-200 bg-white lg:min-h-dvh lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="grid size-10 place-items-center rounded-lg border border-dashed border-neutral-400 text-[9px] uppercase text-neutral-500">
            logo
          </div>
          <div>
            <p className="font-bold text-neutral-900">Oficina Central</p>
            <p className="text-xs text-neutral-500">Gestão da loja</p>
          </div>
        </div>

        <nav
          aria-label="Navegação administrativa"
          className="flex gap-2 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:overflow-visible"
        >
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `block shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive && item.to === "/painel"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`
              }
              key={item.label}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <Outlet />
    </div>
  )
}
