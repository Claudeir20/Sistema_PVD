import Card from "../../../components/ui/Card"
import type { ServiceOrderDetail } from "../../../services/serviceOrders"
import PhotoPreview from "./PhotoPreview"

type DeviceFields = Pick<
  ServiceOrderDetail,
  "device" | "serialNumber" | "reportedIssue" | "intakeCondition"
>

interface DeviceFormProps {
  fields: DeviceFields
  onChange: (fields: DeviceFields) => void
}

export default function DeviceForm({ fields, onChange }: DeviceFormProps) {
  function updateField<Key extends keyof DeviceFields>(
    key: Key,
    value: DeviceFields[Key],
  ) {
    onChange({ ...fields, [key]: value })
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"

  return (
    <Card className="p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Aparelho</span>
          <input
            className={inputClass}
            onChange={(event) => updateField("device", event.target.value)}
            placeholder="Tipo, marca e modelo"
            value={fields.device}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">
            Nº de série / IMEI
          </span>
          <input
            className={inputClass}
            onChange={(event) =>
              updateField("serialNumber", event.target.value)
            }
            value={fields.serialNumber}
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="text-xs font-medium text-neutral-600">
          Defeito relatado pelo cliente
        </span>
        <textarea
          className={inputClass}
          onChange={(event) => updateField("reportedIssue", event.target.value)}
          rows={3}
          value={fields.reportedIssue}
        />
      </label>
      <label className="mt-4 block">
        <span className="text-xs font-medium text-neutral-600">
          Estado na entrada
        </span>
        <textarea
          className={inputClass}
          onChange={(event) =>
            updateField("intakeCondition", event.target.value)
          }
          rows={3}
          value={fields.intakeCondition}
        />
      </label>
      <PhotoPreview />
    </Card>
  )
}
