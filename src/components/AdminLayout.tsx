import { useState } from "react"
import { BarChart3, CalendarDays, DoorOpen, Heart, LogOut, Menu, Users } from "lucide-react"
import { useAdminAuth } from "@/contexts/AdminAuthContext"

type Section = "dashboard" | "guests"

export function AdminLayout({
  children,
  section,
  onSection,
  onSignOut,
}: {
  children: React.ReactNode
  section: Section
  onSection: (s: Section) => void
  onSignOut: () => void
}) {
  const { user } = useAdminAuth()
  const [open, setOpen] = useState(false)

  const items: { id: Section; label: string; icon: typeof Users }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "guests", label: "Convidados", icon: Users },
  ]

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__heart">
            <Heart size={20} />
          </span>
          <div>
            <p className="admin-sidebar__eyebrow">Painel do casal</p>
            <strong>Administração</strong>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <button
                key={it.id}
                className={`admin-sidebar__item ${section === it.id ? "active" : ""}`}
                onClick={() => {
                  onSection(it.id)
                  setOpen(false)
                }}
              >
                <Icon size={18} />
                {it.label}
              </button>
            )
          })}
        </nav>

        <div className="admin-sidebar__foot">
          <div className="admin-sidebar__user">
            <span className="admin-avatar">
              {(user?.email ?? "?").charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="admin-sidebar__user-name">
                {user?.email ?? "Administrador"}
              </p>
              <small>Conectado</small>
            </div>
          </div>
          <button
            className="admin-sidebar__item"
            onClick={onSignOut}
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {open && (
        <button
          className="admin-overlay"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-icon-button"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <div className="admin-topbar__title">
            <h1>
              {section === "dashboard" ? "Dashboard" : "Gestão de convidados"}
            </h1>
            <p>
              {section === "dashboard"
                ? "Acompanhe as confirmações e organize os detalhes do nosso grande dia."
                : "Gerencie a lista de convidados e respostas."}
            </p>
          </div>
          <span className="admin-topbar__date">
            <CalendarDays size={16} />
            {new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </header>

        <main className="admin-content">{children}</main>

        <footer className="admin-footer">
          <DoorOpen size={14} />
          <span>
            Nosso casamento · 15 de dezembro de 2026 · Lago Doce
          </span>
          <span>Feito com amor, fé e a bênção de Deus.</span>
        </footer>
      </div>
    </div>
  )
}