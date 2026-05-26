import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API = 'http://104.197.141.245:8000'  // ← cambia a tu IP de Google Cloud en producción

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('liga_user')
    return saved ? JSON.parse(saved) : null
  })

  const [arbitros, setArbitros] = useState([])
  const [usuarios, setUsuarios] = useState([])

  // Cargar árbitros y delegados desde la BD al iniciar
  useEffect(() => {
    fetch(`${API}/usuarios`)
      .then(r => r.json())
      .then(data => {
        setUsuarios(data)
        // Combinar árbitros de BD con partidos asignados del localStorage
        const savedArbitros = localStorage.getItem('liga_arbitros')
        const partidosMap = savedArbitros ? JSON.parse(savedArbitros) : []
        const arbitrosBD = data.filter(u => u.rol === 'arbitro' && u.activo).map(a => {
          const saved = partidosMap.find(s => s.id === a.id)
          return { ...a, partidosAsignados: saved?.partidosAsignados ?? [] }
        })
        setArbitros(arbitrosBD)
      })
      .catch(() => {
        // Fallback a localStorage si el backend no responde
        const saved = localStorage.getItem('liga_arbitros')
        if (saved) setArbitros(JSON.parse(saved))
      })
  }, [])

  // ── LOGIN ── consulta la BD vía el endpoint /login
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error }

      // Si es árbitro, agregar sus partidos asignados
      let userData = { ...data }
      if (data.rol === 'arbitro') {
        const arbitroActual = arbitros.find(a => a.id === data.id)
        userData.partidosAsignados = arbitroActual?.partidosAsignados ?? []
      }

      localStorage.setItem('liga_user', JSON.stringify(userData))
      setUsuario(userData)
      return { ok: true }
    } catch {
      return { ok: false, error: 'No se pudo conectar al servidor' }
    }
  }

  const logout = () => {
    localStorage.removeItem('liga_user')
    setUsuario(null)
  }

  // ── ASIGNACIÓN DE ÁRBITROS ──
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
      arbitros, usuarios,
      asignarPartidoArbitro, desasignarPartidoArbitro, getArbitroDePartido,
      puedeEditarEquipo, puedeRegistrarPartido,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
