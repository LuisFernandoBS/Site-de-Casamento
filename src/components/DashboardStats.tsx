import { Check, Users, X } from "lucide-react"
import type { Guest } from "@/lib/types"

export function DashboardStats({ guests }: { guests: Guest[] }) {
  const total = guests.length
  const confirmed = guests.filter((g) => g.status === "confirmed").length
  const declined = guests.filter((g) => g.status === "declined").length

  const cards = [
    {
      label: "Total de convidados",
      value: total,
      icon: Users,
      tone: "bg-[#f3e9d9] text-[#756451]",
    },
    {
      label: "Confirmaram presença",
      value: confirmed,
      icon: Check,
      tone: "bg-[#b7c5ae] text-[#2f4a3a]",
    },
    {
      label: "Não poderão comparecer",
      value: declined,
      icon: X,
      tone: "bg-[#e8c9c9] text-[#7a3b3b]",
    },
  ]

  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <article
            key={c.label}
            className="admin-card flex flex-col justify-between gap-4 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[#756451]">
                {c.label}
              </span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${c.tone}`}
              >
                <Icon size={18} />
              </span>
            </div>
            <div>
              <p className="font-[family-name:var(--serif)] text-3xl font-normal text-[#3f382f]">
                {c.value}
              </p>
              <p className="mt-1 text-xs text-[#756451]">
                {pct(c.value)}% do total
              </p>
            </div>
          </article>
        )
      })}
    </section>
  )
}

export function StatusChart({ guests }: { guests: Guest[] }) {
  const total = guests.filter((g) => g.status === "confirmed" || g.status === "declined").length || 1
  const segments = [
    { label: "Confirmado", value: guests.filter((g) => g.status === "confirmed").length, color: "#b7c5ae" },
    { label: "Não comparecerá", value: guests.filter((g) => g.status === "declined").length, color: "#e8c9c9" },
  ]
  const size = 150
  const cx = size / 2
  const cy = size / 2
  const r = 58
  const circ = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="admin-card flex flex-col gap-4 p-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#756451]">
          Distribuição de respostas
        </h3>
        <p className="mt-1 text-xs text-[#756451]">
          Proporção entre cada status de confirmação.
        </p>
      </div>
      <div className="flex items-center gap-5">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8dccb" strokeWidth={14} />
          {segments.map((s) => {
            const len = (s.value / total) * circ
            const dash = `${len} ${circ - len}`
            const strokeDashoffset = -offset
            offset += len
            return (
              <circle
                key={s.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={14}
                strokeDasharray={dash}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
              />
            )
          })}
        </svg>
        <div className="flex flex-col gap-2.5">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-[#3f382f]">{s.label}</span>
              <span className="font-medium text-[#756451]">
                {s.value} ({Math.round((s.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}