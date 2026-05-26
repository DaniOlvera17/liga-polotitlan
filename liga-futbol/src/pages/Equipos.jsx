import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiga } from '../context/LigaContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import {
  Search, Shield, Trophy, Footprints,
  Users, Pencil, Trash2, Save, Plus,
} from 'lucide-react'

const VACIO = { nombre: '', torneoId: '', color: '#7C9FBF', delegadoId: null }

export default function Equipos() {
  const { equipos, torneos, jugadores, agregarEquipo, editarEquipo, eliminarEquipo } = useLiga()
  const { isAdmin, isDelegado, puedeEditarEquipo, usuario } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(VACIO)
  const [editando, setEditando] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTorneo, setFiltroTorneo] = useState('')
  const [confirm, setConfirm]   = useState(null)

  const abrirNuevo  = () => { setForm({ ...VACIO, torneoId: torneos[0]?.id ?? '' }); setEditando(null); setModal(true) }
  const abrirEditar = (e) => { setForm({ ...e }); setEditando(e.id); setModal(true) }

  const handleGuardar = () => {
    if (!form.nombre.trim()) { addToast('El nombre es requerido', 'error'); return }
    if (!form.torneoId) { addToast('Selecciona un torneo', 'error'); return }
    const data = { ...form, torneoId: Number(form.torneoId) }
    if (editando) { editarEquipo({ ...data, id: editando }); addToast('Equipo actualizado', 'success') }
    else { agregarEquipo(data); addToast('Equipo registrado', 'success') }
    setModal(false)
  }

  const torneoNombre = (id) => torneos.find(t => t.id === id)?.nombre ?? '—'

  const equiposFiltrados = equipos.filter(e => {
    const matchBusq   = e.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchTorneo = filtroTorneo ? e.torneoId === Number(filtroTorneo) : true
    return matchBusq && matchTorneo
  })

  const jugadoresPorEquipo = (eid) => jugadores.filter(j => j.equipoId === eid).length

  const torneoIds = [...new Set(equiposFiltrados.map(e => e.torneoId))]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Equipos</h1>
          <p className="page-header-sub">{equipos.length} equipos registrados</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={abrirNuevo}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Registrar Equipo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="search-bar" style={{ marginBottom: 24 }}>
        <div className="search-input-wrap">
          <span className="icon"><Search size={16} /></span>
          <input className="form-control" placeholder="Buscar equipo..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <select className="form-control" style={{ maxWidth: 260 }}
          value={filtroTorneo} onChange={e => setFiltroTorneo(e.target.value)}>
          <option value="">Todos los torneos</option>
          {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
      </div>

      {/* Cards agrupadas por torneo */}
      {equiposFiltrados.length === 0 ? (
        <div className="empty-state">
          <div className="icon"><Shield size={40} /></div>
          <p>No se encontraron equipos</p>
        </div>
      ) : (
        torneoIds.map(tid => {
          const tor = torneos.find(t => t.id === tid)
          const eqs = equiposFiltrados.filter(e => e.torneoId === tid)
          return (
            <div key={tid} style={{ marginBottom: 28 }}>
              {/* Encabezado de torneo */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 14,
                paddingBottom: 8,
                borderBottom: '2px solid var(--primary)',
              }}>
                <Trophy size={20} color="var(--primary)" />
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 20,
                  letterSpacing: 0.5, color: 'var(--text)',
                }}>{tor?.nombre ?? 'Sin torneo'}</h2>
                <span className="badge badge-gris">{eqs.length} equipos</span>
              </div>

              {/* Grid de cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: 16,
              }}>
                {eqs.map(equipo => {
                  const puedeEditar = puedeEditarEquipo(equipo.id)
                  const jugCount    = jugadoresPorEquipo(equipo.id)
                  return (
                    <div key={equipo.id} className="equipo-card">
                      {/* Color + nombre */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: `${equipo.color}22`,
                          border: `2px solid ${equipo.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Shield size={22} color={equipo.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                            {equipo.nombre}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                            {tor?.categoria ?? '—'}
                          </div>
                        </div>
                      </div>

                      {/* Estadísticas rápidas */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 4, textAlign: 'center',
                        background: 'var(--bg)', borderRadius: 'var(--radius)',
                        padding: '8px 4px',
                      }}>
                        {[
                          { label: 'PJ', val: equipo.pj },
                          { label: 'PG', val: equipo.pg },
                          { label: 'GF', val: equipo.golesFavor },
                          { label: 'PTS', val: equipo.pts },
                        ].map(s => (
                          <div key={s.label}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: s.label === 'PTS' ? 'var(--primary-dark)' : 'var(--text)' }}>
                              {s.val}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                              {s.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Jugadores count */}
                      <div style={{ fontSize: 13, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Footprints size={14} />
                        <span>{jugCount} jugador{jugCount !== 1 ? 'es' : ''} inscrito{jugCount !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Botones */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}
                          onClick={() => navigate(`/jugadores?equipo=${equipo.id}`)}
                        >
                          <Users size={14} /> Ver Jugadores
                        </button>
                        {puedeEditar && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => abrirEditar(equipo)}
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setConfirm(equipo.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}

      {/* Modal */}
      <Modal
        open={modal} onClose={() => setModal(false)}
        title={editando ? 'Editar Equipo' : 'Registrar Equipo'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleGuardar}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {editando
                ? <><Save size={15} /> Guardar</>
                : <><Plus size={15} /> Registrar</>
              }
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nombre del Equipo</label>
          <input className="form-control" placeholder="Ej: Chivas"
            value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Torneo</label>
          <select className="form-control" value={form.torneoId}
            onChange={e => setForm(f => ({ ...f, torneoId: e.target.value }))}>
            <option value="">Seleccionar torneo...</option>
            {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Color del equipo</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="color" value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              style={{ width: 48, height: 40, cursor: 'pointer', borderRadius: 'var(--radius)', border: '1px solid var(--borde)', background: 'none' }} />
            <input className="form-control" value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              style={{ fontFamily: 'monospace' }} />
          </div>
        </div>
      </Modal>

      {/* Confirmar eliminar */}
      <Modal
        open={!!confirm} onClose={() => setConfirm(null)} title="¿Eliminar Equipo?"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
            <button className="btn btn-danger"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => {
                eliminarEquipo(confirm); addToast('Equipo eliminado', 'info'); setConfirm(null)
              }}>
              <Trash2 size={15} /> Eliminar
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-sub)' }}>¿Estás seguro? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  )
}