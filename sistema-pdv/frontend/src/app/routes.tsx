import { Navigate, createBrowserRouter } from "react-router-dom"
import CustomerTrackingPage from "../features/customer-portal/pages/CustomerTrackingPage"
import DashboardPage from "../features/dashboard/DashboardPage"
import PosPage from "../features/pos/PosPage"
import ServiceOrderPage from "../features/service-orders/ServiceOrderPage"
import AdminLayout from "./AdminLayout"
import DevIndexPage from "./DevIndexPage"
import OperationLayout from "./OperationLayout"
import PublicLayout from "./PublicLayout"

export const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      {
        path: "/painel",
        element: <DashboardPage key="dashboard-live-updates-v2" />,
      },
    ],
  },
  {
    element: <OperationLayout />,
    children: [
      {
        path: "/vender",
        element: <PosPage key="pos-sale-hooks-v2" />,
      },
      {
        path: "/os/:id",
        element: <ServiceOrderPage key="service-order-detail-v1" />,
      },
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/acompanhar/:token",
        element: <CustomerTrackingPage />,
      },
    ],
  },
  {
    path: "/",
    element: <DevIndexPage />,
  },
  {
    path: "*",
    element: <Navigate to="/acompanhar/os-0001-demo" replace />,
  },
])
