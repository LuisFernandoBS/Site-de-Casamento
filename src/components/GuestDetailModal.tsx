import { useEffect, useState } from "react"
import { X } from "lucide-react"
import type { Guest, GuestHistoryEntry } from "@/lib/types"
import { statusLabel } from "@/services/guests"
import { listHistory } from "@/services/guests"

export function GuestDetailModal({
  guest,
  onClose,
  onSave,
}: {
  guest: Guest | null
  onClose: () => void
  onSave: (g: Guest) => Promise<void>
}) {
  const [draft, setDraft] = useState<Guest | null>(guest)
  const [saving, setSaving] = useState(false)
  const [history, setHistory] = useState<GuestHistoryEntry[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    setDraft(guest.status === "pending" ? { ...guest, status: "confirmed" } : guest)
    setHistory([])
    setError("")
    if (guest) {
      listHistory(guest.id)
        .then(setHistory)
        .catch(() => {})
    }
  }, [guest?.id])

  if (!guest || !draft) return null

  const changed =
    draft.status !== guest.status ||
    draft.full_name !== guest.full_name ||
    draft.email !== guest.email ||
    draft.guest_count !== guest.guest_count ||
    draft.companion_name !== guest.companion_name ||
    draft.dietary_restrictions !== guest.dietary_restrictions ||
    draft.message !== guest.message

  async function save() {
    setSaving(true)
    setError("")
    try {
      await onSave(draft)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal__backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-detail-title"
      >
        <header className="admin-modal__header">
          <div>
            <p className="eyebrow">Detalhes do convidado</p>
            <h2 id="guest-detail-title">{draft.full_name}</h2>
          </div>
          <button
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </header>

        <div className="admin-modal__body">
          <div className="admin-detail-grid">
            <label className="admin-field">
              <span>Nome completo</span>
              <input
                value={draft.full_name}
                onChange={(e) =>
                  setDraft({ ...draft, full_name: e.target.value })
                }
              />
            </label>
            <label className="admin-field">
              <span>Restrições alimentares</span>
              <input
                value={draft.dietary_restrictions ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    dietary_restrictions: e.target.value || null,
                  })
                }
              />
            </label>
          </div>

          <fieldset className="admin-field admin-field--full">
            <legend>Status da confirmação</legend>
            <div className="choices choices--row">
              {(["confirmed", "declined"] as const).map((s) => (
                <label
                  key={s}
                  className={draft.status === s ? "active" : ""}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={draft.status === s}
                    onChange={() => setDraft({ ...draft, status: s })}
                  />
                  {statusLabel(s)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="admin-detail-meta">
            <span className={statusBadgeClass(draft.status)}>
              {statusLabel(draft.status)}
            </span>
            <span>
              Origem:{" "}
              <strong>{draft.source === "admin" ? "Cadastrado por você" : "Resposta pública"}</strong>
            </span>
            {draft.confirmed_at && (
              <span>
                Confirmado em:{" "}
                <strong>
                  {new Date(draft.confirmed_at).toLocaleString("pt-BR")}
                </strong>
              </span>
            )}
          </div>

          {history.length > 0 && (
            <section className="admin-history">
              <h3>Histórico de alterações</h3>
              <ul>
                {history.map((h) => (
                  <li key={h.id}>
                    <span>{h.action}</span>
                    <small>
                      {h.field ? ` · ${h.field}` : ""}{" "}
                      {h.old_value ? `de "${h.old_value}"` : ""}{" "}
                      {h.new_value ? `para "${h.new_value}"` : ""}
                    </small>
                    <time>
                      {new Date(h.created_at).toLocaleDateString("pt-BR")}
                    </time>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <footer className="admin-modal__footer">
          {error && <p className="form-error">{error}</p>}
          <div className="admin-modal__actions">
            <button className="button button--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="button"
              onClick={save}
              disabled={saving || !changed}
            >
              {saving ? "Salvando..." : " Salvar alterações"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

function statusBadgeClass(status: Guest["status"]) {
  switch (status) {
    case "confirmed":
      return "status-badge status-badge--confirmed"
    case "pending":
      return "status-badge status-badge--pending"
    case "declined":
      return "status-badge status-badge--declined"
  }
}