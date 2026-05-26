import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LigaContext = createContext(null)

// URL base del backend Flask — cámbiala si usas otro puerto
//const API = 'http://localhost:8000'
const API = 'http://104.197.141.245:8000'

// Helper: fetch con JSON
const api = async (path, method = 'GET', body = null) => {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${API}${path}`, opts)
  if (!res.ok) throw new Error(`Error ${res.status} en ${method} ${path}`)
  return res.json()
}

export function LigaProvider({ children }) {
  const [torneos,   setTorneos]   = useState([])
  const [equipos,   setEquipos]   = useState([])
  const [jugadores, setJugadores] = useState([])
  const [partidos,  setPartidos]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // ── Carga inicial desde la API ──
  const cargarDatos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [t, e, j, p] = await Promise.all([
        api('/torneos'),
        api('/equipos'),
        api('/jugadores'),
        api('/partidos'),
      ])
      setTorneos(t)
      setEquipos(e)
      setJugadores(j)
      setPartidos(p)
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError('No se pudo conectar al servidor. Verifica que el backend esté corriendo en puerto 5000.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // ── TORNEOS ──
  const agregarTorneo = async (t) => {
    const nuevo = await api('/torneos', 'POST', t)
    setTorneos(prev => [...prev, nuevo])
  }

  const editarTorneo = async (t) => {
    await api(`/torneos/${t.id}`, 'PUT', t)
    setTorneos(prev => prev.map(x => x.id === t.id ? t : x))
  }

  const eliminarTorneo = async (id) => {
    await api(`/torneos/${id}`, 'DELETE')
    setTorneos(prev => prev.filter(x => x.id !== id))
  }

  // ── EQUIPOS ──
  const agregarEquipo = async (e) => {
    const nuevo = await api('/equipos', 'POST', e)
    setEquipos(prev => [...prev, nuevo])
  }

  const editarEquipo = async (e) => {
    await api(`/equipos/${e.id}`, 'PUT', e)
    setEquipos(prev => prev.map(x => x.id === e.id ? e : x))
  }

  const eliminarEquipo = async (id) => {
    await api(`/equipos/${id}`, 'DELETE')
    setEquipos(prev => prev.filter(x => x.id !== id))
  }

  // ── JUGADORES ──
  const agregarJugador = async (j) => {
    const nuevo = await api('/jugadores', 'POST', j)
    setJugadores(prev => [...prev, nuevo])
  }

  const editarJugador = async (j) => {
    await api(`/jugadores/${j.id}`, 'PUT', j)
    setJugadores(prev => prev.map(x => x.id === j.id ? j : x))
  }

  const eliminarJugador = async (id) => {
    await api(`/jugadores/${id}`, 'DELETE')
    setJugadores(prev => prev.filter(x => x.id !== id))
  }

  // ── PARTIDOS ──
  const agregarPartido = async (p) => {
    const nuevo = await api('/partidos', 'POST', p)
    setPartidos(prev => [...prev, nuevo])
  }

  const editarPartido = async (p) => {
    await api(`/partidos/${p.id}`, 'PUT', p)
    setPartidos(prev => prev.map(x => x.id === p.id ? p : x))
  }

  // Registrar resultado (actualiza en backend y refresca estado local)
  const registrarResultado = async (id, gl, gv, anotadores = []) => {
    await api(`/partidos/${id}/resultado`, 'PUT', { golesLocal: gl, golesVisitante: gv, anotadores })

    // Actualizar partido en estado local
    setPartidos(prev => prev.map(x =>
      x.id === id ? { ...x, golesLocal: gl, golesVisitante: gv, estado: 'jugado', anotadores } : x
    ))

    // Recalcular estadísticas de jugadores localmente
    setJugadores(prev => {
      let updated = [...prev]
      anotadores.forEach(a => {
        const idx = updated.findIndex(j => j.id === a.jugadorId)
        if (idx === -1) return
        updated[idx] = {
          ...updated[idx],
          goles:     updated[idx].goles + (a.goles || 0),
          amarillas: updated[idx].amarillas + (a.amarillas || 0),
          rojas:     updated[idx].rojas + (a.rojas || 0),
        }
      })
      return updated
    })

    // Recalcular stats de equipos localmente
    const partido = partidos.find(p => p.id === id)
    if (!partido) return
    setEquipos(prev => prev.map(e => {
      if (e.id === partido.local) {
        const ganado = gl > gv, empate = gl === gv, perdido = gl < gv
        return {
          ...e,
          pj: e.pj + 1, pg: e.pg + (ganado?1:0), pe: e.pe + (empate?1:0), pp: e.pp + (perdido?1:0),
          golesFavor: e.golesFavor + gl, golesContra: e.golesContra + gv,
          pts: e.pts + (ganado ? 3 : empate ? 1 : 0),
        }
      }
      if (e.id === partido.visitante) {
        const ganado = gv > gl, empate = gv === gl, perdido = gv < gl
        return {
          ...e,
          pj: e.pj + 1, pg: e.pg + (ganado?1:0), pe: e.pe + (empate?1:0), pp: e.pp + (perdido?1:0),
          golesFavor: e.golesFavor + gv, golesContra: e.golesContra + gl,
          pts: e.pts + (ganado ? 3 : empate ? 1 : 0),
        }
      }
      return e
    }))
  }

  // Generar jornadas (round-robin) — solo en estado local, sin BD
  const generarJornadas = async (torneoId, fechaInicio) => {
    const equiposTorneo = equipos.filter(e => e.torneoId === torneoId)
    let lista = [...equiposTorneo]
    const impar = lista.length % 2 !== 0
    if (impar) lista.push({ id: null, nombre: 'Descansa' })
    const n = lista.length
    const rondas = n - 1
    let nuevosPartidos = []
    let date = new Date(fechaInicio)

    for (let r = 0; r < rondas; r++) {
      const jornada = r + 1
      for (let i = 0; i < n / 2; i++) {
        const local     = lista[i]
        const visitante = lista[n - 1 - i]
        const estado = local.id === null || visitante.id === null ? 'descansa' : 'pendiente'
        // Insertar en BD
        try {
          const nuevo = await api('/partidos', 'POST', {
            torneoId, jornada,
            local: local.id, visitante: visitante.id,
            fecha: date.toISOString().split('T')[0],
            tipo: 'regular',
            estado,
          })
          nuevosPartidos.push(nuevo)
        } catch (err) {
          console.error('Error creando partido en jornada', jornada, err)
        }
      }
      date.setDate(date.getDate() + 7)
      lista = [lista[0], lista[lista.length - 1], ...lista.slice(1, lista.length - 1)]
    }

    setPartidos(prev => {
      const sinTorneo = prev.filter(p => p.torneoId !== torneoId)
      return [...sinTorneo, ...nuevosPartidos]
    })
  }

  // ── HELPERS ──
  const equiposByTorneo   = (tid) => equipos.filter(e => e.torneoId === tid)
  const jugadoresByEquipo = (eid) => jugadores.filter(j => j.equipoId === eid)
  const partidosByTorneo  = (tid) => partidos.filter(p => p.torneoId === tid)
  const nombreEquipo      = (id)  => equipos.find(e => e.id === id)?.nombre ?? (id === null ? 'Descansa' : '—')
  const torneoDeEquipo    = (eid) => {
    const eq = equipos.find(e => e.id === eid)
    return eq ? torneos.find(t => t.id === eq.torneoId) : null
  }

  return (
    <LigaContext.Provider value={{
      torneos, equipos, jugadores, partidos,
      loading, error, cargarDatos,
      agregarTorneo, editarTorneo, eliminarTorneo,
      agregarEquipo, editarEquipo, eliminarEquipo,
      agregarJugador, editarJugador, eliminarJugador,
      agregarPartido, editarPartido, registrarResultado, generarJornadas,
      equiposByTorneo, jugadoresByEquipo, partidosByTorneo,
      nombreEquipo, torneoDeEquipo,
    }}>
      {children}
    </LigaContext.Provider>
  )
}

export const useLiga = () => useContext(LigaContext)
