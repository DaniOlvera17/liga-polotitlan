import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  const icon = {
    success: <CheckCircle2  size={16} color="var(--verde-dark)" />,
    error:   <XCircle       size={16} color="var(--rojo)"       />,
    info:    <Info          size={16} color="var(--primary)"    />,
    warn:    <AlertTriangle size={16} color="var(--amarillo)"   />,
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {icon[t.type] ?? <Info size={16} color="var(--primary)" />}
            </span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
