import { useEffect, useState } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import type { PosCustomer } from "../../../domain/types"
import { isValidCpf, normalizeCpf } from "../customerCpf"

interface CustomerDialogProps {
  customer: PosCustomer | null
  open: boolean
  onClose: () => void
  onSave: (customer: PosCustomer) => void
}

export default function CustomerDialog({
  customer,
  open,
  onClose,
  onSave,
}: CustomerDialogProps) {
  const [cpf, setCpf] = useState("")
  const [attemptedSave, setAttemptedSave] = useState(false)
  const cpfIsValid = isValidCpf(cpf)

  useEffect(() => {
    if (!open) return
    setCpf(customer?.cpf ?? "")
    setAttemptedSave(false)
  }, [customer, open])

  return (
    <Dialog onClose={onClose} open={open} title="Identificar cliente">
      <p className="text-sm leading-6 text-neutral-600">
        O cliente é opcional. Informe o CPF apenas quando ele desejar
        identificação na nota.
      </p>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium text-neutral-700">
          CPF na nota
        </span>
        <input
          autoFocus
          className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          inputMode="numeric"
          onChange={(event) => {
            setCpf(event.target.value)
            setAttemptedSave(false)
          }}
          placeholder="000.000.000-00"
          value={cpf}
        />
        {attemptedSave && !cpfIsValid ? (
          <span className="mt-1.5 block text-sm text-red-700">
            Informe um CPF válido.
          </span>
        ) : null}
      </label>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          disabled={!cpf.trim()}
          onClick={() => {
            setAttemptedSave(true)
            if (!cpfIsValid) return

            onSave({ cpf: normalizeCpf(cpf) })
          }}
          variant="primary"
        >
          Salvar cliente
        </Button>
      </div>
    </Dialog>
  )
}
