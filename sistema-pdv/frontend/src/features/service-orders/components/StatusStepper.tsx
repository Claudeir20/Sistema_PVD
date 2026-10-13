import {
  getStatusIndex,
  serviceOrderStatuses,
  serviceOrderStatusLabels,
  type ServiceOrderStatus,
} from "../../../domain/serviceOrderStatus"

interface StatusStepperProps {
  currentStatus: ServiceOrderStatus
  orientation?: "horizontal" | "vertical"
  includeDelivered?: boolean
}

export default function StatusStepper({
  currentStatus,
  orientation = "horizontal",
  includeDelivered = true,
}: StatusStepperProps) {
  const statuses = includeDelivered
    ? serviceOrderStatuses
    : serviceOrderStatuses.filter((status) => status !== "DELIVERED")
  const currentIndex = getStatusIndex(currentStatus)
  const isVertical = orientation === "vertical"

  return (
    <ol
      aria-label="Andamento da ordem de serviço"
      className={isVertical ? "space-y-0" : "flex flex-wrap gap-3"}
    >
      {statuses.map((status, index) => {
        const isComplete = index < currentIndex
        const isCurrent = status === currentStatus

        return (
          <li
            className={
              isVertical
                ? "relative flex min-h-8 items-start gap-3"
                : "flex items-center gap-2"
            }
            key={status}
          >
            {isVertical && index < statuses.length - 1 ? (
              <span
                aria-hidden="true"
                className={`absolute left-[7px] top-4 h-full w-px ${
                  isComplete ? "bg-[#686a65]" : "bg-[#d2d2cd]"
                }`}
              />
            ) : null}
            <span
              aria-hidden="true"
              className={`relative z-10 mt-0.5 block size-4 shrink-0 rounded-full ${
                isCurrent
                  ? "border-[3px] border-[#b9cffc] bg-[#2f65d5] ring-1 ring-[#2f65d5]"
                  : isComplete
                    ? "bg-[#686a65]"
                    : "border border-dashed border-[#c8c8c3] bg-white"
              }`}
            />
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={`pb-2 text-sm leading-5 ${
                isCurrent
                  ? "font-bold text-[#30302e]"
                  : isComplete
                    ? "text-[#3f403d]"
                    : "text-[#797a76]"
              }`}
            >
              {serviceOrderStatusLabels[status]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
