import { AdminAuthProvider } from "@/contexts/AdminAuthContext"
import { AdminPage } from "@/pages/AdminPage"
import AdminLogin from "@/pages/AdminLogin"
import { useAdminAuth } from "@/contexts/AdminAuthContext"

function Router() {
  const { session, loading } = useAdminAuth()
  if (loading) return <div style={{ padding: "5rem", textAlign: "center" }}>Carregando painel...</div>
  return session ? <AdminPage /> : <AdminLogin />
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Router />
    </AdminAuthProvider>
  )
}