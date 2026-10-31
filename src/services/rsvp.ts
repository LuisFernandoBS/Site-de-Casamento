import { supabase } from "@/lib/supabase"
import type { Guest } from "@/lib/types"

export type RsvpPayload = {
  fullName: string
  attending: boolean
  guestCount: number
  companionName?: string
  dietaryRestrictions?: string
  message?: string
}

export async function submitRsvp(payload: RsvpPayload): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("guests")
    .insert({
      full_name: payload.fullName.trim(),
      email: null,
      phone: null,
      guest_count: payload.guestCount,
      companion_name: payload.companionName?.trim() || null,
      dietary_restrictions: payload.dietaryRestrictions?.trim() || null,
      message: payload.message?.trim() || null,
      status: payload.attending ? "confirmed" : "declined",
      confirmed_at: new Date().toISOString(),
      source: "public",
    })
    .select("id")
    .single()

  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "A confirmação online estará disponível em breve. Tente novamente mais tarde.",
      )
    }
    throw new Error(
      "Não foi possível registrar sua resposta. Por favor, tente novamente.",
    )
  }

  return { id: data.id }
}

export async function fetchPublicGuests(): Promise<Guest[]> {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("source", "public")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Guest[]
}