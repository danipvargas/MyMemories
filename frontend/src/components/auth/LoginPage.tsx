import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "@/auth/useAuth"
import { getApiErrorMessage } from "@/lib/api"

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(identifier.trim(), password)
      const destination = (location.state as { from?: string } | null)?.from ?? "/album"
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <img src="/logo.svg" alt="" />
          <span>MisPostales</span>
        </div>
        <p className="eyebrow">Tu colección de recuerdos</p>
        <h1>Iniciar sesión</h1>
        <p className="auth-intro">Guarda tus viajes y vuelve a ellos cuando quieras.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Usuario o correo electrónico</span>
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="form-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <div className="feedback feedback-error" role="alert">{error}</div>}
          <button type="submit" className="primary-button auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
        <p className="auth-switch">
          ¿Aún no tienes cuenta? <Link to="/register">Crear usuario</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
