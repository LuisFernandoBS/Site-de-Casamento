import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Download, Edit, Plus, Search, Trash2, Users, UserCheck, UserX } from "lucide-react"
import type { Guest } from "@/lib/types"
import { exportGuestsToCsv, statusLabel } from "@/services/guests"
import { StatusBadge } from "./StatusBadge"

type SortKey = "name" | "date" | "count"

export function GuestTable({
  guests,
  busyId,
  onEdit,
  onDelete,
  onAdd,
}: {
  guests: Guest[]
  busyId: string | null
  onEdit: (g: Guest) => void
  onDelete: (g: Guest) => void
  onAdd: () => void
}) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<Guest["status"] | "all">("all")
  const [sort, setSort] = useState<SortKey>("date")

  function exportCsv(list: Guest[], name: string) {
    const csv = exportGuestsToCsv(list)
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportOptions: { label: string; list: Guest[] }[] = [
    { label: "Todos os convidados", list: guests },
    { label: "Somente confirmados", list: guests.filter((g) => g.status === "confirmed") },
    { label: "Somente não comparecerão", list: guests.filter((g) => g.status === "declined") },
  ]

  const filtered = useMemo(() => {
    let list = guests
    if (statusFilter !== "all") list = list.filter((g) => g.status === statusFilter)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (g) =>
          g.full_name.toLowerCase().includes(q) ||
          (g.email ?? "").toLowerCase().includes(q) ||
          (g.companion_name ?? "").toLowerCase().includes(q),
      )
    }
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.full_name.localeCompare(b.full_name, "pt-BR")
      if (sort === "count") return b.guest_count - a.guest_count
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return list
  }, [guests, query, statusFilter, sort])

  const toggleSort = (k: SortKey) => setSort((s) => (s === k ? "date" : k))
  const confirmedCount = guests.filter((guest) => guest.status === "confirmed").length
  const declinedCount = guests.filter((guest) => guest.status === "declined").length

  return (
    <section className="admin-table-wrap">
      <div className="guest-manager-heading">
        <div>
          <p>Lista de presença</p>
          <h2>Gestão de Convidados</h2>
        </div>
        <button className="button" onClick={onAdd}>
          <Plus size={16} /> Novo convidado
        </button>
      </div>

      <div className="guest-stat-grid">
        <div className="guest-stat-card">
          <span className="guest-stat-icon"><Users size={18} /></span>
          <div><strong>{guests.length}</strong><small>Total cadastrados</small></div>
        </div>
        <div className="guest-stat-card guest-stat-card--confirmed">
          <span className="guest-stat-icon"><UserCheck size={18} /></span>
          <div><strong>{confirmedCount}</strong><small>Confirmados</small></div>
        </div>
        <div className="guest-stat-card guest-stat-card--declined">
          <span className="guest-stat-icon"><UserX size={18} /></span>
          <div><strong>{declinedCount}</strong><small>Não comparecerão</small></div>
        </div>
      </div>

      <div className="admin-table__toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por nome, e-mail ou acompanhante"
            aria-label="Pesquisar convidados"
          />
        </div>
        <div className="admin-filter">
          <ChevronDown size={14} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Guest["status"] | "all")}
            aria-label="Filtrar por status"
          >
            <option value="all">Todos os status</option>
            <option value="confirmed">Confirmados</option>
            <option value="declined">Não comparecerão</option>
          </select>
        </div>
        <div className="admin-export">
          <button className="button button--ghost" aria-haspopup="listbox">
            <Download size={16} /> Exportar
          </button>
          <div className="admin-export__menu" role="listbox">
            {exportOptions.map((opt) => (
              <button
                key={opt.label}
                role="option"
                onClick={() => exportCsv(opt.list, `convidados-${opt.label.split(" ")[0].toLowerCase()}.csv`)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Convidado</th>
              <th>E-mail</th>
              <th className="num">Pessoas</th>
              <th>Acompanhante</th>
              <th>Status</th>
              <th className="num">Confirmado em</th>
              <th className="admin-th-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-table__empty">
                  Nenhum convidado encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((g) => (
                <tr key={g.id}>
                  <td>
                    <button
                      className="admin-link"
                      onClick={() => onEdit(g)}
                    >
                      {g.full_name}
                    </button>
                  </td>
                  <td className="admin-muted">{g.email || "—"}</td>
                  <td className="num">{g.guest_count}</td>
                  <td className="admin-muted">{g.companion_name || "—"}</td>
                  <td>
                    <StatusBadge status={g.status} />
                  </td>
                  <td className="num admin-muted">
                    {g.confirmed_at
                      ? new Date(g.confirmed_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-icon-button"
                        onClick={() => onEdit(g)}
                        aria-label="Editar"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        className="admin-icon-button admin-icon-button--danger"
                        onClick={() => onDelete(g)}
                        disabled={busyId === g.id}
                        aria-label="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="admin-table__footer">
        <span>
          Mostrando <strong>{filtered.length}</strong> de {guests.length}
        </span>
      </footer>
    </section>
  )
}