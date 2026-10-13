import Button from "../../../components/ui/Button"

interface ShortcutBarProps {
  canFinish: boolean
  disabled?: boolean
  onSearch: () => void
  onCustomer: () => void
  onDiscount: () => void
  onFinish: () => void
}

export default function ShortcutBar({
  canFinish,
  disabled = false,
  onSearch,
  onCustomer,
  onDiscount,
  onFinish,
}: ShortcutBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        className="min-h-9 border-dashed px-3"
        disabled={disabled}
        onClick={onSearch}
      >
        F2 buscar
      </Button>
      <Button
        className="min-h-9 border-dashed px-3"
        disabled={disabled}
        onClick={onCustomer}
      >
        F4 cliente
      </Button>
      <Button
        className="min-h-9 border-dashed px-3"
        disabled={disabled}
        onClick={onDiscount}
      >
        F6 desconto
      </Button>
      <Button
        className="min-h-9 border-dashed px-3"
        disabled={disabled || !canFinish}
        onClick={onFinish}
      >
        F10 finalizar
      </Button>
    </div>
  )
}
