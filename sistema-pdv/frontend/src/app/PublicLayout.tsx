import { Outlet } from "react-router-dom"

export default function PublicLayout() {
  return (
    <main className="min-h-dvh bg-[#f4f4f2]">
      <Outlet />
    </main>
  )
}
