import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { useAuth } from "@/auth/useAuth"
import { getApiErrorMessage } from "@/lib/api"

function RegisterPage() {
  const navigate = useNavigate()
  const { register, login } = useAuth()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileImage, setProfileImage] = useState<File>()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setIsSubmitting(true)
    try {
      await register({ username: username.trim(), email: email.trim(), password, profileImage })
      await login(username.trim(), password)
      navigate("/album", { replace: true })
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
        <p className="eyebrow">Empieza tu colección</p>
        <h1>Crear usuario</h1>
        <p className="auth-intro">Tu foto de perfil es opcional. Puedes añadirla más tarde.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Nombre de usuario</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={20}
              autoComplete="username"
              required
            />
          </label>
          <label className="form-field">
            <span>Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="form-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="form-field">
            <span>Repetir contraseña</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="auth-file-field">
            <span>Foto de perfil (opcional)</span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(event) => setProfileImage(event.target.files?.[0])}
            />
          </label>
          {error && <div className="feedback feedback-error" role="alert">{error}</div>}
          <button type="submit" className="primary-button auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear usuario"}
          </button>
        </form>
        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
