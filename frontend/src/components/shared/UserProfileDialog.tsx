import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Camera, KeyRound, LogOut, Pencil, UserRound, X } from "lucide-react"

import CropDialog from "@/components/add-postcard/CropDialog"
import {
  ADMIN_USER_ID,
  getApiErrorMessage,
  getUser,
  getUserProfilePicUrl,
  updateUser,
  type User,
} from "@/lib/api"

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

function UserProfileDialog({ open, onClose, onProfileUpdated }: UserProfileDialogProps) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null)
  const [avatarVersion, setAvatarVersion] = useState<number>()
  const [profileCropSource, setProfileCropSource] = useState<string | null>(null)
  const userQuery = useQuery({
    queryKey: ["user", ADMIN_USER_ID],
    queryFn: () => getUser(ADMIN_USER_ID),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (form.newPassword && form.newPassword !== form.confirmPassword) {
        throw new Error("Las contraseñas nuevas no coinciden.")
      }

      return updateUser(ADMIN_USER_ID, {
        username: form.username.trim(),
        email: form.email.trim(),
        oldPassword: form.oldPassword || undefined,
        newPassword: form.newPassword || undefined,
        profileImage: form.profileImage,
      })
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["user", ADMIN_USER_ID], updatedUser)
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

  if (!open) {
    return null
  }

  const user = userQuery.data
  const profileImageUrl = getUserProfilePicUrl(ADMIN_USER_ID, avatarVersion)

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

  const startEditing = () => {
    if (user) {
      setForm(getProfileForm(user))
    }
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

        {userQuery.isPending && <p className="profile-dialog-feedback">Cargando perfil...</p>}

        {userQuery.isError && (
          <div className="feedback feedback-error" role="alert">
            {getApiErrorMessage(userQuery.error)}
          </div>
        )}

        {user && !isEditing && (
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

            <section className="profile-statistics" aria-labelledby="profile-statistics-title">
              <div>
                <p className="eyebrow">Colección</p>
                <h3 id="profile-statistics-title">Estadísticas</h3>
              </div>
              <span>Próximamente</span>
              <p>Muy pronto podrás descubrir cómo crece tu colección.</p>
            </section>

            {logoutMessage && <p className="profile-dialog-message">{logoutMessage}</p>}

            <div className="profile-dialog-actions">
              <button type="button" className="primary-button" onClick={startEditing}>
                <Pencil size={16} />
                Editar perfil
              </button>
              <button
                type="button"
                className="secondary-button profile-logout-button"
                onClick={() => setLogoutMessage("El cierre de sesión estará disponible próximamente.")}
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {user && isEditing && (
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
              <label className="secondary-button">
                <Camera size={16} />
                Cambiar foto
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ""
                    if (file) {
                      setProfileCropSource(URL.createObjectURL(file))
                    }
                  }}
                />
              </label>
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
