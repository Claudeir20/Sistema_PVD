import { Link } from "react-router-dom"
import Badge from "../components/ui/Badge"
import Card from "../components/ui/Card"
import PageHeader from "../components/ui/PageHeader"

const routes = [
  {
    path: "/painel",
    label: "Painel",
    description: "Visão administrativa e indicadores da loja.",
    area: "Admin",
  },
  {
    path: "/vender",
    label: "Vender",
    description: "Operação de venda no ponto de atendimento.",
    area: "Operação",
  },
  {
    path: "/os/1",
    label: "Ordem de serviço",
    description: "Detalhes e andamento da ordem de serviço número 1.",
    area: "Operação",
  },
  {
    path: "/acompanhar/os-0001-demo",
    label: "Acompanhamento do cliente",
    description: "Portal público usando o token válido dos dados de exemplo.",
    area: "Público",
  },
] as const

export default function DevIndexPage() {
  return (
    <main className="min-h-dvh bg-neutral-100 px-5 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader
          description="Acesse rapidamente as rotas disponíveis durante o desenvolvimento."
          eyebrow="Ambiente de desenvolvimento"
          title="Páginas do projeto"
        />

        <nav
          aria-label="Rotas de desenvolvimento"
          className="mt-8 grid gap-4 sm:grid-cols-2"
        >
          {routes.map((route) => (
            <Link
              className="group rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              key={route.path}
              to={route.path}
            >
              <Card className="h-full p-5 transition-colors group-hover:border-neutral-400">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {route.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {route.description}
                    </p>
                  </div>
                  <Badge
                    variant={route.area === "Público" ? "info" : "neutral"}
                  >
                    {route.area}
                  </Badge>
                </div>
                <p className="mt-5 font-mono text-xs text-neutral-500">
                  {route.path}
                </p>
              </Card>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}
