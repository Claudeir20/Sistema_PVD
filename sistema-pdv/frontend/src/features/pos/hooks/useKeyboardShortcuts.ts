import { useEffect, useRef } from "react"

interface KeyboardShortcutActions {
  canFinish: boolean
  disabled?: boolean
  onSearch: () => void
  onCustomer: () => void
  onDiscount: () => void
  onFinish: () => void
}

type ShortcutAction = Exclude<
  keyof KeyboardShortcutActions,
  "canFinish" | "disabled"
>

export default function useKeyboardShortcuts(actions: KeyboardShortcutActions) {
  const actionsRef = useRef(actions)

  useEffect(() => {
    actionsRef.current = actions
  }, [actions])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcuts: Partial<Record<KeyboardEvent["key"], ShortcutAction>> = {
        F2: "onSearch",
        F4: "onCustomer",
        F6: "onDiscount",
        F10: "onFinish",
      }
      const action = shortcuts[event.key]

      if (!action) return

      event.preventDefault()

      if (actionsRef.current.disabled) return

      if (action === "onFinish" && !actionsRef.current.canFinish) return

      actionsRef.current[action]()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])
}
