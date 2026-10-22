import { Navigate, createBrowserRouter } from "react-router-dom"
import LoginPage from "../features/auth/LoginPage"
import ProductsPage from "../features/products/ProductsPage"
import SalesPage from "../features/sales/SalesPage"
import StockPage from "../features/stock/StockPage"
import UsersPage from "../features/users/UsersPage"
import RequireAuth from "../features/auth/RequireAuth"
import DashboardPage from "../features/dashboard/DashboardPage"
import PosPage from "../features/pos/PosPage"
import AdminLayout from "./AdminLayout"
import OperationLayout from "./OperationLayout"

export const router = createBrowserRouter([
  {
    element: (
      <RequireAuth roles={["ADMIN"]}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: "/painel",
        element: <DashboardPage key="dashboard-live-updates-v2" />,
      },
      {
        path: "/produtos",
        element: <ProductsPage />,
      },
      {
        path: "/vendas",
        element: <SalesPage />,
      },
      {
        path: "/estoque",
        element: <StockPage />,
      },
      {
        path: "/usuarios",
        element: <UsersPage />,
      },
    ],
  },
  {
    element: (
      <RequireAuth>
        <OperationLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: "/vender",
        element: <PosPage key="pos-sale-hooks-v2" />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  // A raiz e qualquer endereço desconhecido vão para o login, que manda quem já está
  // logado para a tela certa do perfil (painel ou PDV).
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
])
