import { useEffect, type PropsWithChildren } from "react"

interface DialogProps extends PropsWithChildren {
  open: boolean
  title: string
  onClose: () => void
  /** "md" para conteúdo com tabela (ex.: itens de uma venda); "lg" para tabelas largas. */
  size?: "sm" | "md" | "lg"
}

const dialogWidths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-3xl" }

export default function Dialog({
  open,
  title,
  onClose,
  children,
  size = "sm",
}: DialogProps) {
  useEffect(() => {
    if (!open) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      <div
        aria-labelledby="dialog-title"
        aria-modal="true"
        className={`w-full ${dialogWidths[size]} max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl bg-white p-5 shadow-2xl`}
        role="dialog"
      >
        <h2 id="dialog-title" className="text-lg font-bold text-[#292927]">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}
