export default function Modal({ open, onClose, title, children, footer, maxWidth = 500 }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            onClick={onClose}
            style={{
              fontSize: 20, color: 'var(--text-light)',
              lineHeight: 1, padding: '0 4px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--rojo)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-light)'}
          >
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
