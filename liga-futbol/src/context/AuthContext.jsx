import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// rol: 'admin' | 'delegado' | 'arbitro'
// equipoId: solo para delegado — el equipo que gestiona
// partidosAsignados: solo para arbitro — array de IDs de partidos
const USUARIOS = [
  { id: 1, nombre: 'Admin Liga',     email: 'admin@liga.com',    password: '1234', rol: 'admin',    equipoId: null, partidosAsignados: [] },
  { id: 2, nombre: 'Juan Delegado',  email: 'juan@liga.com',     password: '1234', rol: 'delegado', equipoId: 2,   partidosAsignados: [] },
  { id: 4, nombre: 'Ana Delegada',   email: 'ana@liga.com',      password: '1234', rol: 'delegado', equipoId: 6,   partidosAsignados: [] },
  { id: 5, nombre: 'Carlos Árbitro', email: 'carlos@liga.com',   password: '1234', rol: 'arbitro',  equipoId: null, partidosAsignados: [1, 2, 3] },
  { id: 6, nombre: 'María Árbitro',  email: 'maria@liga.com',    password: '1234', rol: 'arbitro',  equipoId: null, partidosAsignados: [12, 13, 14] },
]

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('liga_user')
    return saved ? JSON.parse(saved) : null
  })

  // Árbitros en estado (para que el admin pueda asignar partidos)
  const [arbitros, setArbitros] = useState(() => {
    const saved = localStorage.getItem('liga_arbitros')
    return saved ? JSON.parse(saved) : USUARIOS.filter(u => u.rol === 'arbitro')
  })

  const login = (email, password) => {
    const found = USUARIOS.find(u => u.email === email && u.password === password)
    if (found) {
      // Si es árbitro, tomar partidosAsignados del estado actualizado
      let userData = { ...found }
      if (found.rol === 'arbitro') {
        const arbitroActual = arbitros.find(a => a.id === found.id)
        if (arbitroActual) userData.partidosAsignados = arbitroActual.partidosAsignados
      }
      delete userData.password
      localStorage.setItem('liga_user', JSON.stringify(userData))
      setUsuario(userData)
      return { ok: true }
    }
    return { ok: false, error: 'Correo o contraseña incorrectos' }
  }

  const logout = () => {
    localStorage.removeItem('liga_user')
    setUsuario(null)
  }

  // Asignar partido a árbitro
  const asignarPartidoArbitro = (arbitroId, partidoId) => {
    setArbitros(prev => {
      const updated = prev.map(a => {
        if (a.id !== arbitroId) return a
        const ya = a.partidosAsignados.includes(partidoId)
        return { ...a, partidosAsignados: ya ? a.partidosAsignados : [...a.partidosAsignados, partidoId] }
      })
      localStorage.setItem('liga_arbitros', JSON.stringify(updated))
      return updated
    })
  }

  const desasignarPartidoArbitro = (arbitroId, partidoId) => {
    setArbitros(prev => {
      const updated = prev.map(a =>
        a.id !== arbitroId ? a : { ...a, partidosAsignados: a.partidosAsignados.filter(id => id !== partidoId) }
      )
      localStorage.setItem('liga_arbitros', JSON.stringify(updated))
      return updated
    })
  }

  const getArbitroDePartido = (partidoId) => {
    return arbitros.find(a => a.partidosAsignados.includes(partidoId)) ?? null
  }

  const isAdmin    = usuario?.rol === 'admin'
  const isDelegado = usuario?.rol === 'delegado'
  const isArbitro  = usuario?.rol === 'arbitro'

  const puedeEditarEquipo = (equipoId) => {
    if (isAdmin) return true
    if (isDelegado) return usuario.equipoId === equipoId
    return false
  }

  const puedeRegistrarPartido = (partidoId) => {
    if (isAdmin) return true
    if (isArbitro) {
      const arbitroActual = arbitros.find(a => a.id === usuario.id)
      return arbitroActual?.partidosAsignados.includes(partidoId) ?? false
    }
    return false
  }

  return (
    <AuthContext.Provider value={{
      usuario, login, logout,
      isAdmin, isDelegado, isArbitro,
      arbitros, asignarPartidoArbitro, desasignarPartidoArbitro, getArbitroDePartido,
      puedeEditarEquipo, puedeRegistrarPartido,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
