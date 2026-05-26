import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiga } from '../context/LigaContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import Tabla from '../components/Tabla'

const POSICIONES = ['Portero', 'Defensa', 'Mediocampo', 'Delantero']
const VACIO = { nombre: '', equipoId: '', posicion: 'Delantero', numero: '' }

const posicionColor = {
  Portero: '#F0C97A', Defensa: '#7EB5D6', Mediocampo: '#7DBF9C', Delantero: '#E8A598'
}

export default function Jugadores() {
  const { jugadores, equipos, torneos, agregarJugador, editarJugador, eliminarJugador } = useLiga()
  const { isAdmin, isDelegado, puedeEditarEquipo } = useAuth()
  const { addToast } = useToast()
  const [searchParams] = useSearchParams()

  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(VACIO)
  const [editando, setEditando] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEquipo, setFiltroEquipo] = useState('')
  const [filtroTorneo, setFiltroTorneo] = useState('')
  const [confirm, setConfirm]   = useState(null)

  useEffect(() => {
    const equipoParam = searchParams.get('equipo')
    if (equipoParam) setFiltroEquipo(equipoParam)
  }, [searchParams])

  const equiposFiltradosPorTorneo = filtroTorneo
    ? equipos.filter(e => e.torneoId === Number(filtroTorneo))
    : equipos

  const abrirNuevo = () => {
    setForm({ ...VACIO, equipoId: filtroEquipo || (equipos[0]?.id ?? '') })
    setEditando(null); setModal(true)
  }

  // Delegado solo puede editar nombre/posición/número — no goles/tarjetas
  const abrirEditar = (j) => {
    if (isDelegado) {
      // Solo abre modal con campos básicos (sin stats)
      setForm({ nombre: j.nombre, equipoId: j.equipoId, posicion: j.posicion, numero: j.numero })
    } else {
      setForm({ ...j })
    }
    setEditando(j.id); setModal(true)
  }

  const handleGuardar = () => {
    if (!form.nombre.trim()) { addToast('El nombre es requerido', 'error'); return }
    if (!form.equipoId)      { addToast('Selecciona un equipo', 'error'); return }
    const data = { ...form, equipoId: Number(form.equipoId), numero: Number(form.numero) || 0 }
    if (editando) {
      if (isDelegado) {
        // Delegado solo actualiza datos básicos — conserva stats
        const jugadorActual = jugadores.find(j => j.id === editando)
        editarJugador({ ...jugadorActual, nombre: data.nombre, posicion: data.posicion, numero: data.numero })
      } else {
        editarJugador({ ...data, id: editando })
      }
      addToast('Jugador actualizado', 'success')
    } else {
      agregarJugador(data)
      addToast('Jugador registrado', 'success')
    }
    setModal(false)
  }

  const nombreEquipo = (id) => equipos.find(e => e.id === id)?.nombre ?? '—'
  const colorEquipo  = (id) => equipos.find(e => e.id === id)?.color ?? '#888'

  const jugadoresFiltrados = jugadores.filter(j => {
    const matchBusq   = j.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchEquipo = filtroEquipo ? j.equipoId === Number(filtroEquipo) : true
    const matchTorneo = filtroTorneo
      ? equipos.find(e => e.id === j.equipoId)?.torneoId === Number(filtroTorneo)
      : true
    return matchBusq && matchEquipo && matchTorneo
  })

  const equipoFiltradoObj = filtroEquipo ? equipos.find(e => e.id === Number(filtroEquipo)) : null

  const columnas = [
    { label: '#', key: 'numero', align: 'center', render: j => (
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-sub)' }}>
        {j.numero || '—'}
      </span>
    )},
    { label: 'Jugador', key: 'nombre', render: j => (
      <div>
        <div style={{ fontWeight: 700 }}>{j.nombre}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: colorEquipo(j.equipoId) }} />
          <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{nombreEquipo(j.equipoId)}</span>
        </div>
      </div>
    )},
    { label: 'Posición', key: 'posicion', render: j => (
      <span style={{
        display: 'inline-block', padding: '2px 10px', borderRadius: 20,
        fontSize: 11, fontFamily: 'var(--font-cond)', fontWeight: 700,
        letterSpacing: 0.5, textTransform: 'uppercase',
        color: posicionColor[j.posicion] ?? 'var(--text-sub)',
        background: (posicionColor[j.posicion] ?? '#888') + '25',
        border: `1px solid ${(posicionColor[j.posicion] ?? '#888')}60`,
      }}>
        {j.posicion}
      </span>
    )},
    { label: 'Goles', key: 'goles', align: 'center', render: j => (
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: j.goles > 0 ? 'var(--verde-dark)' : 'var(--text-light)' }}>
        {j.goles}
      </span>
    )},
    { label: '🟨', key: 'amarillas', align: 'center', render: j => (
      <span style={{ color: j.amarillas > 0 ? '#9A7B20' : 'var(--text-light)', fontWeight: 700 }}>
        {j.amarillas}
      </span>
    )},
    { label: '🟥', key: 'rojas', align: 'center', render: j => (
      <span style={{ color: j.rojas > 0 ? 'var(--rojo)' : 'var(--text-light)', fontWeight: 700 }}>
        {j.rojas}
      </span>
    )},
    { label: 'Acciones', key: '_acc', align: 'right', render: j => {
      const puede = puedeEditarEquipo(j.equipoId)
      if (!puede) return null
      return (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => abrirEditar(j)}>✏️</button>
          {isAdmin && (
            <button className="btn btn-danger btn-sm" onClick={() => setConfirm(j.id)}>🗑️</button>
          )}
        </div>
      )
    }},
  ]

  const puedeAgregar = isAdmin || (isDelegado && filtroEquipo && puedeEditarEquipo(Number(filtroEquipo)))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Jugadores</h1>
          <p className="page-header-sub">
            {filtroEquipo && equipoFiltradoObj
              ? `Jugadores de: ${equipoFiltradoObj.nombre}`
              : `${jugadores.length} jugadores registrados`}
          </p>
        </div>
        {puedeAgregar && (
          <button className="btn btn-primary" onClick={abrirNuevo}>+ Registrar Jugador</button>
        )}
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap" style={{ flex: 2 }}>
            <span className="icon">🔍</span>
            <input className="form-control" placeholder="Buscar jugador..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <select className="form-control" style={{ maxWidth: 200 }}
            value={filtroTorneo}
            onChange={e => { setFiltroTorneo(e.target.value); setFiltroEquipo('') }}>
            <option value="">Todos los torneos</option>
            {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
          <select className="form-control" style={{ maxWidth: 200 }}
            value={filtroEquipo} onChange={e => setFiltroEquipo(e.target.value)}>
            <option value="">Todos los equipos</option>
            {equiposFiltradosPorTorneo.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {POSICIONES.map(pos => {
            const count = jugadoresFiltrados.filter(j => j.posicion === pos).length
            return (
              <div key={pos} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 12px',
                background: (posicionColor[pos] ?? '#888') + '18',
                border: `1px solid ${(posicionColor[pos] ?? '#888')}40`,
                borderRadius: 20, fontSize: 12,
                color: posicionColor[pos],
                fontFamily: 'var(--font-cond)', fontWeight: 700,
              }}>
                <span>{pos}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{count}</span>
              </div>
            )
          })}
        </div>

        <Tabla columnas={columnas} datos={jugadoresFiltrados} emptyMsg="No se encontraron jugadores" />
      </div>

      {/* Modal Form */}
      <Modal
        open={modal} onClose={() => setModal(false)}
        title={editando ? 'Editar Jugador' : 'Registrar Jugador'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleGuardar}>
              {editando ? '💾 Guardar' : '+ Registrar'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <input className="form-control" placeholder="Ej: Carlos Mendoza"
            value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Posición</label>
            <select className="form-control" value={form.posicion}
              onChange={e => setForm(f => ({ ...f, posicion: e.target.value }))}>
              {POSICIONES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Número de camiseta</label>
            <input className="form-control" type="number" min="1" max="99" placeholder="9"
              value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Equipo</label>
          <select className="form-control" value={form.equipoId}
            onChange={e => setForm(f => ({ ...f, equipoId: e.target.value }))}>
            <option value="">Seleccionar equipo...</option>
            {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>
        {/* Solo admin puede editar estadísticas */}
        {editando && isAdmin && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Goles</label>
              <input className="form-control" type="number" min="0"
                value={form.goles ?? 0} onChange={e => setForm(f => ({ ...f, goles: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">🟨 Amarillas</label>
              <input className="form-control" type="number" min="0"
                value={form.amarillas ?? 0} onChange={e => setForm(f => ({ ...f, amarillas: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">🟥 Rojas</label>
              <input className="form-control" type="number" min="0"
                value={form.rojas ?? 0} onChange={e => setForm(f => ({ ...f, rojas: Number(e.target.value) }))} />
            </div>
          </div>
        )}
        {editando && isDelegado && (
          <div style={{
            background: 'var(--bg-input)', borderRadius: 'var(--radius)',
            padding: '10px 14px', fontSize: 12, color: 'var(--text-sub)',
          }}>
            ℹ️ Como delegado solo puedes editar datos básicos del jugador. Las estadísticas las registra el árbitro del partido.
          </div>
        )}
      </Modal>

      {/* Confirmar eliminar */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="¿Eliminar Jugador?"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
            <button className="btn btn-danger" onClick={() => {
              eliminarJugador(confirm); addToast('Jugador eliminado', 'info'); setConfirm(null)
            }}>🗑️ Eliminar</button>
          </>
        }
      >
        <p style={{ color: 'var(--text-sub)' }}>¿Estás seguro? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  )
}
