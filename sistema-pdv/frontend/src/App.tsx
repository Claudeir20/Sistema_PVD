import { RouterProvider } from "react-router-dom"
import { router } from "./app/routes"
import { AuthProvider } from "./features/auth/AuthContext"

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AuthProvider>
  )
}
