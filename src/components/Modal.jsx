export default function Modal({ title, onClose, children, width }) {
  return (
    <div className="modal-overlay no-print" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={width ? { maxWidth: width } : undefined}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
