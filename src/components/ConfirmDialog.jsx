import Modal from "./Modal";

export default function ConfirmDialog({ title, message, confirmLabel = "Confirmer", danger, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} width="420px">
      <p style={{ color: "var(--color-ink-soft)", fontSize: 14, lineHeight: 1.5 }}>{message}</p>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          Annuler
        </button>
        <button className={danger ? "btn btn-danger" : "btn btn-primary"} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
