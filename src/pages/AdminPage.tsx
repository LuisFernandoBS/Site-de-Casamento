import { useEffect, useState } from "react"
import { LoaderCircle, RefreshCw } from "lucide-react"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { AdminLayout } from "@/components/AdminLayout"
import { DashboardStats, StatusChart } from "@/components/DashboardStats"
import { GuestDetailModal } from "@/components/GuestDetailModal"
import { GuestForm } from "@/components/GuestForm"
import { GuestTable } from "@/components/GuestTable"
import type { Guest } from "@/lib/types"
import {
  createGuest,
  deleteGuest,
  listGuests,
  logHistory,
  updateGuest,
} from "@/services/guests"

export function AdminPage() {
  const { signOut } = useAdminAuth()
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [section, setSection] = useState<"dashboard" | "guests">("dashboard")
  const [selected, setSelected] = useState<Guest | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Guest | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    try {
      setError("")
      const list = await listGuests()
      setGuests(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!error) return
    const id = window.setInterval(load, 15000)
    return () => window.clearInterval(id)
  }, [error])

  async function handleSave(g: Guest) {
    setSaving(true)
    try {
      await updateGuest(g.id, {
        full_name: g.full_name,
        email: g.email,
        phone: g.phone,
        guest_count: g.guest_count,
        companion_name: g.companion_name,
        dietary_restrictions: g.dietary_restrictions,
        message: g.message,
        status: g.status,
        confirmed_at:
          g.status === "confirmed" && !g.confirmed_at
            ? new Date().toISOString()
            : g.status !== "confirmed"
              ? null
              : g.confirmed_at,
      })
      await logHistory(g.id, {
        action: "atualização manual",
        field: "status",
        old_value: guests.find((x) => x.id === g.id)?.status ?? null,
        new_value: g.status,
      })
      setGuests((prev) => prev.map((x) => (x.id === g.id ? g : x)))
      setSelected(g)
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate(data: Parameters<typeof createGuest>[0]) {
    setSaving(true)
    try {
      const created = await createGuest(data)
      setGuests((prev) => [created, ...prev])
      setFormOpen(false)
      setEditing(null)
      setSection("guests")
      setSelected(created)
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(g: Guest) {
    if (!window.confirm(`Excluir ${g.full_name} permanentemente?`)) return
    setDeleting(g.id)
    try {
      await deleteGuest(g.id)
      setGuests((prev) => prev.filter((x) => x.id !== g.id))
      if (selected?.id === g.id) setSelected(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir.")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminLayout section={section} onSection={setSection} onSignOut={signOut}>
      {loading ? (
        <div className="admin-empty">
          <LoaderCircle className="spin" size={28} />
          <p>Carregando painel...</p>
        </div>
      ) : error ? (
        <div className="admin-empty">
          <p className="form-error">{error}</p>
          <button className="button button--ghost" onClick={load}>
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </div>
      ) : section === "dashboard" ? (
        <>
          <DashboardStats guests={guests} />
          <div className="admin-grid-2">
            <StatusChart guests={guests} />
            <section className="admin-card">
              <div className="admin-card__head">
                <h3>Resumo rápido</h3>
              </div>
              <ul className="admin-summary">
                <li>
                  <span>Confirmados</span>
                  <strong>
                    {guests.filter((g) => g.status === "confirmed").length}
                  </strong>
                </li>
                <li>
                  <span>Não comparecerão</span>
                  <strong>
                    {guests.filter((g) => g.status === "declined").length}
                  </strong>
                </li>
                <li>
                  <span>Cadastrados por você</span>
                  <strong>
                    {guests.filter((g) => g.source === "admin").length}
                  </strong>
                </li>
                <li>
                  <span>Respostas públicas</span>
                  <strong>
                    {guests.filter((g) => g.source === "public").length}
                  </strong>
                </li>
              </ul>
            </section>
          </div>
        </>
      ) : (
        <GuestTable
          guests={guests}
          busyId={deleting}
          onEdit={(g) => {
            setEditing(g)
            setFormOpen(true)
          }}
          onDelete={handleDelete}
          onAdd={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        />
      )}

      {selected && (
        <GuestDetailModal
          guest={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      )}
      {formOpen && (
        <GuestForm
          initial={editing}
          saving={saving}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSubmit={handleCreate}
        />
      )}
    </AdminLayout>
  )
}