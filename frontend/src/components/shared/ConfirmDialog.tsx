import { AlertTriangle, X } from "lucide-react"

type ConfirmDialogProps = {
  title: string
  message: string
  confirmLabel: string
  isPending?: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  isPending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="confirm-dialog-backdrop" role="presentation">
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <button
          type="button"
          className="icon-button confirm-dialog-close"
          onClick={onCancel}
          aria-label="Cerrar confirmación"
        >
          <X size={18} />
        </button>
        <span className="confirm-dialog-icon" aria-hidden="true">
          <AlertTriangle size={22} />
        </span>
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="delete-confirm-button"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Eliminando..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmDialog
