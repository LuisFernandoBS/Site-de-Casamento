import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Download, Edit, Plus, Search, Trash2, Users, UserCheck, UserX } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
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

  function exportPdf(list: Guest[], name: string) {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pageWidth = pdf.internal.pageSize.getWidth()

    pdf.setFillColor(250, 248, 243)
    pdf.rect(0, 0, pageWidth, 42, "F")
    pdf.setTextColor(185, 154, 95)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.text("Lista de convidados", pageWidth / 2, 18, { align: "center" })
    pdf.setTextColor(120, 106, 79)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(9)
    pdf.text(`${list.length} convidado${list.length === 1 ? "" : "s"} - gerado em ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, 27, { align: "center" })

    autoTable(pdf, {
      startY: 48,
      head: [["Convidado", "Status", "Confirmado em"]],
      body: list.map((guest) => [
        guest.full_name,
        statusLabel(guest.status),
        guest.confirmed_at ? new Date(guest.confirmed_at).toLocaleDateString("pt-BR") : "—",
      ]),
      styles: { font: "helvetica", fontSize: 9, textColor: [51, 46, 39], cellPadding: 3 },
      headStyles: { fillColor: [185, 154, 95], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 248, 243] },
      columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 42 }, 2: { cellWidth: 38 } },
      margin: { left: 14, right: 14 },
    })

    pdf.save(`${name}.pdf`)
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
            placeholder="Pesquisar por nome"
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
              <div className="admin-export__group" key={opt.label} role="group" aria-label={opt.label}>
                <strong>{opt.label}</strong>
                <button
                  role="option"
                  onClick={() => exportCsv(opt.list, `convidados-${opt.label.split(" ")[0].toLowerCase()}.csv`)}
                >
                  Baixar CSV
                </button>
                <button
                  role="option"
                  onClick={() => exportPdf(opt.list, `convidados-${opt.label.split(" ")[0].toLowerCase()}`)}
                >
                  Baixar PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Convidado</th>
              <th>Status</th>
              <th>Mensagem para os noivos</th>
              <th className="num">Confirmado em</th>
              <th className="admin-th-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-table__empty">
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
                  <td>
                    <StatusBadge status={g.status} />
                  </td>
                  <td className="admin-table-message" title={g.message ?? undefined}>
                    {g.message?.trim() || "—"}
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