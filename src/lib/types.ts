export type GuestStatus = "confirmed" | "pending" | "declined"

export type GuestSource = "public" | "admin"

export type Guest = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  guest_count: number
  companion_name: string | null
  dietary_restrictions: string | null
  message: string | null
  status: GuestStatus
  confirmed_at: string | null
  source: GuestSource
  created_at: string
  updated_at: string
}

export type GuestHistoryEntry = {
  id: string
  guest_id: string
  admin_id: string | null
  action: string
  field: string | null
  old_value: string | null
  new_value: string | null
  created_at: string
}

export type AdminUser = {
  id: string
  full_name: string | null
  created_at: string
}

export type DashboardStats = {
  total: number
  confirmed: number
  pending: number
  declined: number
  companions: number
}