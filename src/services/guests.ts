import { supabase } from "@/lib/supabase"
import type { Guest, GuestHistoryEntry } from "@/lib/types"

type GuestRow = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  guest_count: number
  companion_name: string | null
  dietary_restrictions: string | null
  message: string | null
  status: Guest["status"]
  confirmed_at: string | null
  source: Guest["source"]
  created_at: string
  updated_at: string
}

function mapRow(row: GuestRow): Guest {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    guest_count: row.guest_count,
    companion_name: row.companion_name,
    dietary_restrictions: row.dietary_restrictions,
    message: row.message,
    status: row.status,
    confirmed_at: row.confirmed_at,
    source: row.source,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function listGuests(): Promise<Guest[]> {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRow)
}

export async function getGuest(id: string): Promise<Guest> {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) throw new Error(error?.message ?? "Convidado não encontrado")
  return mapRow(data as GuestRow)
}

export async function updateGuest(
  id: string,
  updates: Partial<
    Omit<Guest, "id" | "created_at" | "updated_at" | "source">
  >,
): Promise<Guest> {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) {
    throw new Error("Sua sessão expirou. Entre novamente no painel administrativo.")
  }

  const { data, error } = await supabase
    .from("guests")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) {
    if (error?.code === "42501" || error?.code === "PGRST301" || error?.message?.toLowerCase().includes("row-level security") || error?.message?.toLowerCase().includes("forbidden")) {
      throw new Error("Você não tem permissão para atualizar convidados. Entre novamente ou confira as permissões administrativas.")
    }
    throw new Error(error?.message ?? "Não foi possível atualizar")
  }
  return mapRow(data as GuestRow)
}

export async function deleteGuest(id: string): Promise<void> {
  const { error } = await supabase.from("guests").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function createGuest(input: {
  full_name: string
  email?: string | null
  phone?: string | null
  guest_count: number
  companion_name?: string | null
  dietary_restrictions?: string | null
  message?: string | null
  status?: Guest["status"]
  confirmed_at?: string | null
}): Promise<Guest> {
  const { data, error } = await supabase
    .from("guests")
    .insert({
      full_name: input.full_name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      guest_count: input.guest_count,
      companion_name: input.companion_name ?? null,
      dietary_restrictions: input.dietary_restrictions ?? null,
      message: input.message ?? null,
      status: input.status ?? "pending",
      confirmed_at: input.confirmed_at ?? null,
      source: "admin",
    })
    .select("*")
    .single()

  if (error || !data) throw new Error(error?.message ?? "Não foi possível cadastrar")
  return mapRow(data as GuestRow)
}

export async function logHistory(
  guestId: string,
  entry: {
    action: string
    field?: string | null
    old_value?: string | null
    new_value?: string | null
  },
): Promise<void> {
  const { error } = await supabase.from("guest_history").insert({
    guest_id: guestId,
    admin_id: null,
    action: entry.action,
    field: entry.field ?? null,
    old_value: entry.old_value ?? null,
    new_value: entry.new_value ?? null,
  })
  if (error) console.warn("Falha ao registrar histórico:", error.message)
}

export async function listHistory(
  guestId: string,
): Promise<GuestHistoryEntry[]> {
  const { data, error } = await supabase
    .from("guest_history")
    .select("*")
    .eq("guest_id", guestId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as GuestHistoryEntry[]
}

export function exportGuestsToCsv(guests: Guest[]): string {
  const headers = [
    "Nome",
    "E-mail",
    "Telefona",
    "Pessoas",
    "Acompanhante",
    "Restrições",
    "Status",
    "Mensagem",
    "Confirmação",
    "Origem",
    "Criado em",
  ]
  const rows = guests.map((g) => [
    g.full_name,
    g.email ?? "",
    g.phone ?? "",
    String(g.guest_count),
    g.companion_name ?? "",
    g.dietary_restrictions ?? "",
    statusLabel(g.status),
    g.message ?? "",
    g.confirmed_at ? new Date(g.confirmed_at).toLocaleString("pt-BR") : "",
    g.source === "admin" ? "Admin" : "Público",
    new Date(g.created_at).toLocaleString("pt-BR"),
  ])
  const escape = (v: string) =>
    /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
  return [
    headers.map(escape).join(";"),
    ...rows.map((r) => r.map(escape).join(";")),
  ].join("\n")
}

export function statusLabel(status: Guest["status"]): string {
  switch (status) {
    case "confirmed":
      return "Confirmado"
    case "pending":
      return "Aguardando"
    case "declined":
      return "Não comparecerá"
  }
}

export function statusColor(status: Guest["status"]): string {
  switch (status) {
    case "confirmed":
      return "text-emerald-700 bg-emerald-100 ring-emerald-200"
    case "pending":
      return "text-amber-700 bg-amber-100 ring-amber-200"
    case "declined":
      return "text-rose-700 bg-rose-100 ring-rose-200"
  }
}