import type { Guest } from "@/lib/types"
import { statusColor, statusLabel } from "@/services/guests"

export function StatusBadge({ status }: { status: Guest["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusColor(
        status,
      )}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  )
}