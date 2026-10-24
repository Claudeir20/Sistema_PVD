import { NavLink, Outlet } from "react-router-dom"
import StoreBrand from "../components/ui/StoreBrand"
import UserMenu from "../features/auth/UserMenu"

const navigation = [
  { label: "Painel", to: "/painel" },
  { label: "Vender (PDV)", to: "/vender" },
  { label: "Vendas", to: "/vendas" },
  { label: "Produtos", to: "/produtos" },
  { label: "Estoque", to: "/estoque" },
  { label: "Usuários", to: "/usuarios" },
]

export default function AdminLayout() {
  return (
    <div className="min-h-dvh bg-[#f4f4f2] lg:flex">
      <aside className="border-b border-neutral-200 bg-white lg:min-h-dvh lg:w-64 lg:border-b-0 lg:border-r">
        <div className="px-5 py-5">
          <StoreBrand subtitle="Gestão da loja" />
        </div>

        <nav
          aria-label="Navegação administrativa"
          className="flex gap-2 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:overflow-visible"
        >
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `block shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
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

        <div className="border-t border-neutral-200 px-5 py-4">
          <UserMenu />
        </div>
      </aside>
      <Outlet />
    </div>
  )
}
