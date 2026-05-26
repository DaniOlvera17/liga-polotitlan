import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children, soloAdmin = false, soloArbitro = false }) {
  const { usuario, isAdmin, isArbitro } = useAuth()

  if (!usuario) return <Navigate to="/login" replace />
  if (soloAdmin && !isAdmin) return <Navigate to="/dashboard" replace />
  if (soloArbitro && !isArbitro) return <Navigate to="/dashboard" replace />
  return children
}
