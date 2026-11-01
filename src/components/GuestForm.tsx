import { useState } from "react"
import { X } from "lucide-react"
import type { Guest } from "@/lib/types"
import { statusLabel } from "@/services/guests"

export function GuestForm({
  initial,
  saving,
  onClose,
  onSubmit,
}: {
  initial?: Guest | null
  saving: boolean
  onClose: () => void
  onSubmit: (data: {
    full_name: string
    email: string | null
    phone: string | null
    guest_count: number
    companion_name: string | null
    dietary_restrictions: string | null
    message: string | null
    status: Guest["status"]
  }) => Promise<void>
}) {
  const [form, setForm] = useState({
    full_name: initial?.full_name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    guest_count: initial?.guest_count ?? 1,
    companion_name: initial?.companion_name ?? "",
    dietary_restrictions: initial?.dietary_restrictions ?? "",
    message: initial?.message ?? "",
    status: initial?.status === "confirmed" || initial?.status === "declined" ? initial.status : "confirmed",
  })
  const [error, setError] = useState("")

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (form.full_name.trim().length < 3) {
      setError("Nome completo é obrigatório (mínimo 3 letras).")
      return
    }
    if (form.guest_count < 1) {
      setError("Quantidade de pessoas deve ser no mínimo 1.")
      return
    }
    await onSubmit({
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      guest_count: form.guest_count,
      companion_name: form.companion_name.trim() || null,
      dietary_restrictions: form.dietary_restrictions.trim() || null,
      message: form.message.trim() || null,
      status: form.status,
    })
  }

  return (
    <div className="admin-modal__backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-form-title"
      >
        <header className="admin-modal__header">
          <div>
            <p className="eyebrow">Convidado</p>
            <h2 id="guest-form-title">
              {initial ? "Editar convidado" : "C cadastre um convidado"}
            </h2>
          </div>
          <button
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </header>

        <form className="admin-modal__body admin-form" onSubmit={submit}>
          <label className="admin-field">
            <span>Nome completo *</span>
            <input
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              placeholder="Como devemos chamá-lo?"
            />
          </label>
          <label className="admin-field">
            <span>E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="opcional"
            />
          </label>
          <label className="admin-field">
            <span>Telefone</span>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="opcional"
            />
          </label>
          <label className="admin-field">
            <span>Quantidade de pessoas *</span>
            <input
              type="number"
              min="1"
              max="20"
              value={form.guest_count}
              onChange={(e) => update("guest_count", Number(e.target.value) || 1)}
            />
          </label>
          <label className="admin-field">
            <span>Acompanhante</span>
            <input
              value={form.companion_name}
              onChange={(e) => update("companion_name", e.target.value)}
              placeholder="Nome do acompanhante"
            />
          </label>
          <label className="admin-field">
            <span>Restrições alimentares</span>
            <input
              value={form.dietary_restrictions}
              onChange={(e) => update("dietary_restrictions", e.target.value)}
              placeholder="Vegetariano, alérgico, etc."
            />
          </label>
          <label className="admin-field admin-field--full">
            <span>Mensagem para os noivos</span>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Deixe uma palavra de carinho (opcional)"
            />
          </label>
          <fieldset className="admin-field admin-field--full">
            <legend>Status inicial</legend>
            <div className="choices choices--row">
              {(["confirmed", "declined"] as const).map((s) => (
                <label key={s} className={form.status === s ? "active" : ""}>
                  <input
                    type="radio"
                    name="status"
                    checked={form.status === s}
                    onChange={() => update("status", s)}
                  />
                  {statusLabel(s)}
                </label>
              ))}
            </div>
          </fieldset>
        </form>

        <footer className="admin-modal__footer">
          {error && <p className="form-error">{error}</p>}
          <div className="admin-modal__actions">
            <button className="button button--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="button"
              onClick={submit}
              disabled={saving}
            >
              {saving ? "Salvando..." : " Salvar"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}