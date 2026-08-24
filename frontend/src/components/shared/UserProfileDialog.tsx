import { useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Camera, KeyRound, LogOut, Pencil, UserRound, X } from "lucide-react"

import CropDialog from "@/components/add-postcard/CropDialog"
import { useAuth } from "@/auth/useAuth"
import {
  getApiErrorMessage,
  getUserProfilePicUrl,
  getUserStats,
  updateUser,
  type User,
  type UserStats,
} from "@/lib/api"
import { getCountryCode, getCountryName } from "@/lib/countries"

type UserProfileDialogProps = {
  open: boolean
  onClose: () => void
  onProfileUpdated: () => void
}

type ProfileForm = {
  username: string
  email: string
  oldPassword: string
  newPassword: string
  confirmPassword: string
  profileImage: File | undefined
}

const EMPTY_FORM: ProfileForm = {
  username: "",
  email: "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
  profileImage: undefined,
}

function getProfileForm(user: User): ProfileForm {
  return {
    ...EMPTY_FORM,
    username: user.username,
    email: user.email,
  }
}

function formatOldestDate(value: string | null): string {
  if (!value) {
    return "Sin fecha registrada"
  }

  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function ProfileStatistics({ stats }: { stats: UserStats }) {
  const topCountries = Object.entries(stats.top_countries_with_postcards).sort(
    ([, firstCount], [, secondCount]) => secondCount - firstCount,
  )
  const postcardsPerYear = Object.entries(stats.postcards_per_year).sort(
    ([firstYear], [secondYear]) => Number(firstYear) - Number(secondYear),
  )

  return (
    <section className="profile-statistics-panel" aria-labelledby="profile-statistics-title">
      <div className="profile-statistics-heading">
        <div>
          <p className="eyebrow">Colección</p>
          <h3 id="profile-statistics-title">Estadísticas</h3>
        </div>
      </div>

      <div className="profile-stat-counters">
        <div>
          <strong>{stats.total_postcards}</strong>
          <span>Postales</span>
        </div>
        <div>
          <strong>{stats.total_cities}</strong>
          <span>Ciudades</span>
        </div>
        <div>
          <strong>{stats.total_countries}</strong>
          <span>Países</span>
        </div>
      </div>

      <p className="profile-oldest-postcard">
        <span>Postal más antigua</span>
        <strong>{formatOldestDate(stats.oldest_postcard)}</strong>
      </p>

      <div className="profile-stat-tables">
        <section className="profile-stat-table" aria-labelledby="top-countries-title">
          <h4 id="top-countries-title">Países con más postales</h4>
          {topCountries.length > 0 ? (
            <ul>
              {topCountries.map(([country, count]) => {
                const countryCode = getCountryCode(country)
                return (
                  <li key={country}>
                    <span className={`fi fi-${countryCode.toLowerCase()}`} aria-hidden="true" />
                    <span>{getCountryName(country)}</span>
                    <strong> {count}</strong>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="profile-stat-empty">Sin datos todavía.</p>
          )}
        </section>

        <section className="profile-stat-table" aria-labelledby="years-title">
          <h4 id="years-title">Postales por año</h4>
          {postcardsPerYear.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th scope="col">Año</th>
                  <th scope="col">Postales</th>
                </tr>
              </thead>
              <tbody>
                {postcardsPerYear.map(([year, count]) => (
                  <tr key={year}>
                    <td>{year}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="profile-stat-empty">Sin datos todavía.</p>
          )}
        </section>
      </div>
    </section>
  )
}

function UserProfileDialog({ open, onClose, onProfileUpdated }: UserProfileDialogProps) {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null)
  const [avatarVersion, setAvatarVersion] = useState<number>(() => Date.now())
  const [profileCropSource, setProfileCropSource] = useState<string | null>(null)
  const profileCameraInputRef = useRef<HTMLInputElement>(null)
  const profileGalleryInputRef = useRef<HTMLInputElement>(null)
  const statsQuery = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: () => getUserStats(user!.id),
    enabled: open && user !== null,
    staleTime: 5 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (form.newPassword && form.newPassword !== form.confirmPassword) {
        throw new Error("Las contraseñas nuevas no coinciden.")
      }

      return updateUser(user!.id, {
        username: form.username.trim(),
        email: form.email.trim(),
        oldPassword: form.oldPassword || undefined,
        newPassword: form.newPassword || undefined,
        profileImage: form.profileImage,
      })
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["auth-user"], updatedUser)
      setIsEditing(false)
      setFormError(null)
      setAvatarVersion(Date.now())
      onProfileUpdated()
    },
    onError: (error) => {
      setFormError(
        error instanceof Error && !("status" in error)
          ? error.message
          : getApiErrorMessage(error),
      )
    },
  })

  if (!open || !user) {
    return null
  }

  const profileImageUrl = getUserProfilePicUrl(user.id, avatarVersion)

  const updateField = (field: keyof ProfileForm, value: string | File | undefined) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFormError(null)
  }

  const cancelProfileCrop = () => {
    if (profileCropSource) {
      URL.revokeObjectURL(profileCropSource)
    }
    setProfileCropSource(null)
  }

  const completeProfileCrop = (file: File) => {
    updateField("profileImage", file)
    cancelProfileCrop()
  }

  const handleProfileImageSelection = (file: File | undefined) => {
    if (file) {
      setProfileCropSource(URL.createObjectURL(file))
    }
  }

  const startEditing = () => {
    setForm(getProfileForm(user))
    setLogoutMessage(null)
    setFormError(null)
    setIsEditing(true)
  }

  return (
    <div
      className="profile-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !updateMutation.isPending) {
          onClose()
        }
      }}
    >
      <section
        className="profile-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-dialog-title"
      >
        <header className="profile-dialog-header">
          <div>
            <p className="eyebrow">Cuenta personal</p>
            <h2 id="profile-dialog-title">Tu perfil</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar perfil">
            <X size={18} />
          </button>
        </header>

        {!isEditing && (
          <div className="profile-dialog-content">
            <div className="profile-identity">
              <img src={profileImageUrl} alt={`Foto de ${user.username}`} />
              <div>
                <h3>{user.username}</h3>
                <p>{user.email}</p>
              </div>
            </div>

            <dl className="profile-details">
              <div>
                <dt>Nombre de usuario</dt>
                <dd>{user.username}</dd>
              </div>
              <div>
                <dt>Correo electrónico</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>

            {statsQuery.isPending && (
              <p className="profile-statistics-feedback">Cargando estadísticas...</p>
            )}
            {statsQuery.isError && (
              <div className="feedback feedback-error" role="alert">
                {getApiErrorMessage(statsQuery.error)}
              </div>
            )}
            {statsQuery.data && <ProfileStatistics stats={statsQuery.data} />}

            {logoutMessage && <p className="profile-dialog-message">{logoutMessage}</p>}

            <div className="profile-dialog-actions">
              <button type="button" className="primary-button" onClick={startEditing}>
                <Pencil size={16} />
                Editar perfil
              </button>
              <button
                type="button"
                className="secondary-button profile-logout-button"
                onClick={() => {
                  void logout()
                    .then(onClose)
                    .catch((error) => setLogoutMessage(getApiErrorMessage(error)))
                }}
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {isEditing && (
          <form
            className="profile-dialog-content profile-edit-form"
            onSubmit={(event) => {
              event.preventDefault()
              if (!form.username.trim() || !form.email.trim()) {
                setFormError("El nombre de usuario y el correo son obligatorios.")
                return
              }
              updateMutation.mutate()
            }}
          >
            <div className="profile-edit-photo">
              <img src={profileImageUrl} alt="Foto de perfil actual" />
              <div className="profile-photo-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => profileCameraInputRef.current?.click()}
                >
                  <Camera size={16} />
                  Hacer foto
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => profileGalleryInputRef.current?.click()}
                >
                  Galería
                </button>
                <input
                  ref={profileCameraInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  capture="environment"
                  onChange={(event) => {
                    handleProfileImageSelection(event.target.files?.[0])
                    event.target.value = ""
                  }}
                />
                <input
                  ref={profileGalleryInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(event) => {
                    handleProfileImageSelection(event.target.files?.[0])
                    event.target.value = ""
                  }}
                />
              </div>
              {form.profileImage && <small>{form.profileImage.name}</small>}
            </div>

            <label className="form-field">
              <span>Nombre de usuario</span>
              <input
                type="text"
                value={form.username}
                onChange={(event) => updateField("username", event.target.value)}
                maxLength={20}
                required
              />
            </label>
            <label className="form-field">
              <span>Correo electrónico</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
            </label>

            <fieldset className="profile-password-section">
              <legend><KeyRound size={15} /> Cambiar contraseña</legend>
              <label className="form-field">
                <span>Contraseña actual</span>
                <input
                  type="password"
                  value={form.oldPassword}
                  onChange={(event) => updateField("oldPassword", event.target.value)}
                  autoComplete="current-password"
                />
              </label>
              <label className="form-field">
                <span>Nueva contraseña</span>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(event) => updateField("newPassword", event.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <label className="form-field">
                <span>Repetir contraseña</span>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  autoComplete="new-password"
                />
              </label>
            </fieldset>

            {formError && <div className="feedback feedback-error" role="alert">{formError}</div>}

            <div className="profile-dialog-actions">
              <button type="button" className="secondary-button" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
              <button type="submit" className="primary-button" disabled={updateMutation.isPending}>
                <UserRound size={16} />
                {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </section>
      {profileCropSource && (
        <CropDialog
          key={profileCropSource}
          imageUrl={profileCropSource}
          title="Recorta tu foto de perfil"
          description="Ajusta la imagen en un formato cuadrado para tu perfil."
          aspect={1}
          allowRotation
          onCancel={cancelProfileCrop}
          onComplete={completeProfileCrop}
          onError={() => {
            cancelProfileCrop()
            setFormError("No se ha podido preparar la foto de perfil.")
          }}
        />
      )}
    </div>
  )
}

export default UserProfileDialog
