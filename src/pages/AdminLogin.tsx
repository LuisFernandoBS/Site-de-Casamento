import { useState } from "react"
import { Eye, EyeOff, Heart, LoaderCircle, Lock, Mail } from "lucide-react"
import { useAdminAuth } from "@/contexts/AdminAuthContext"

export default function AdminLogin() {
  const { signIn, loading } = useAdminAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!username.trim() || !password) {
      setError("Preencha usuário e senha.")
      return
    }
    setBusy(true)
    try {
      await signIn(username.trim(), password)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.includes("invalid")
            ? "Usuário ou senha inválidos."
            : err.message
          : "Não foi possível entrar. Tente novamente.",
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-bg" aria-hidden="true">
        <span className="admin-bg__glow" />
        <span className="admin-bg__glow admin-bg__glow--2" />
      </div>

      <main className="admin-login">
        <div className="admin-login__card">
          <div className="admin-login__brand">
            <span className="admin-login__heart">
              <Heart size={22} />
            </span>
            <div>
              <p className="admin-login__eyebrow">Área dos noivos</p>
              <h1>Painel administrativo</h1>
            </div>
          </div>

          <p className="admin-login__hint">
            Acompanhe confirmações de presença, organize os convidados e
            gerencie os detalhes do nosso grande dia.
          </p>

          <form className="admin-login__form" onSubmit={submit} noValidate>
            <label className="admin-field">
              <span>Usuário</span>
              <span className="admin-field__input">
                <Mail size={16} />
                <input
                  type="text" inputMode="text" autoComplete="username"
                  placeholder="seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={busy}
                />
              </span>
            </label>

            <label className="admin-field">
              <span>Senha</span>
              <span className="admin-field__input">
                <Lock size={16} />
                <input
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                  disabled={busy}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            {error && (
              <p className="admin-field__error">
                <span /> {error}
              </p>
            )}

            <button
              className="button admin-login__submit"
              type="submit"
              disabled={busy || loading}
            >
              {busy ? (
                <>
                  Entrando <LoaderCircle className="spin" size={16} />
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}