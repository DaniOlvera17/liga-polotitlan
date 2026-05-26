import { useState } from 'react'
import { useLiga } from '../context/LigaContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import {
  Clock, CheckCircle, PauseCircle, Moon, AlertTriangle,
  ClipboardList, Save, X, Plus, RefreshCw, Square,
  CalendarPlus, Pencil, RotateCw
} from 'lucide-react'

const ESTADOS_COLORES = {
  jugado:    { cls: 'badge-verde',    label: 'Final',     icon: <CheckCircle size={11} /> },
  pendiente: { cls: 'badge-amarillo', label: 'Pendiente', icon: <Clock size={11} /> },
  pospuesto: { cls: 'badge-rojo',     label: 'Pospuesto', icon: <PauseCircle size={11} /> },
  descansa:  { cls: 'badge-gris',     label: 'Descansa',  icon: <Moon size={11} /> },
}

export default function Partidos() {
  const { partidos, torneos, equipos, jugadores, agregarPartido, editarPartido, registrarResultado, generarJornadas, nombreEquipo } = useLiga()
  const { isAdmin, puedeRegistrarPartido, getArbitroDePartido } = useAuth()
  const { addToast } = useToast()

  const [modalNuevo, setModalNuevo]         = useState(false)
  const [modalResultado, setModalResultado] = useState(null)
  const [modalEditar, setModalEditar]       = useState(null)
  const [modalGenerar, setModalGenerar]     = useState(false)
  const [filtroTorneo, setFiltroTorneo]     = useState(torneos[0]?.id ?? '')
  const [filtroJornada, setFiltroJornada]   = useState('')
  const [filtroEstado, setFiltroEstado]     = useState('')

  const [formNuevo, setFormNuevo] = useState({ torneoId: '', local: '', visitante: '', jornada: 1, fecha: '', tipo: 'regular' })
  const [formGenerar, setFormGenerar] = useState({ torneoId: torneos[0]?.id ?? '', fechaInicio: '' })

  const [marcador, setMarcador] = useState({ gl: '', gv: '' })
  const [anotadores, setAnotadores] = useState([])

  const equiposPorTorneo = (tid) => equipos.filter(e => e.torneoId === Number(tid))

  const handleGuardarPartido = () => {
    const { torneoId, local, visitante, jornada, fecha } = formNuevo
    if (!torneoId || !local || !fecha) { addToast('Completa los campos requeridos', 'error'); return }
    if (local && visitante && Number(local) === Number(visitante)) { addToast('Local y visitante deben ser diferentes', 'error'); return }
    agregarPartido({
      ...formNuevo,
      torneoId:  Number(torneoId),
      local:     local     ? Number(local)     : null,
      visitante: visitante ? Number(visitante) : null,
      jornada:   Number(jornada),
      tipo:      formNuevo.tipo,
    })
    addToast('Partido programado', 'success')
    setModalNuevo(false)
  }

  const handleGuardarResultado = () => {
    const gl = Number(marcador.gl), gv = Number(marcador.gv)
    if (marcador.gl === '' || marcador.gv === '') { addToast('Ingresa ambos marcadores', 'error'); return }
    if (gl < 0 || gv < 0) { addToast('Los goles no pueden ser negativos', 'error'); return }

    const golLocal     = anotadores.filter(a => a.equipo === 'local' && !a.autogol).reduce((s, a) => s + (a.goles || 0), 0)
    const golVisitante = anotadores.filter(a => a.equipo === 'visitante' && !a.autogol).reduce((s, a) => s + (a.goles || 0), 0)
    const autogolLocal = anotadores.filter(a => a.equipo === 'visitante' && a.autogol).reduce((s, a) => s + (a.goles || 0), 0)
    const autogolVis   = anotadores.filter(a => a.equipo === 'local' && a.autogol).reduce((s, a) => s + (a.goles || 0), 0)
    const totalLocal   = golLocal + autogolLocal
    const totalVis     = golVisitante + autogolVis

    if (totalLocal > gl) { addToast(`Los goles del local (${totalLocal}) superan al marcador (${gl})`, 'error'); return }
    if (totalVis  > gv)  { addToast(`Los goles del visitante (${totalVis}) superan al marcador (${gv})`, 'error'); return }

    registrarResultado(modalResultado.id, gl, gv, anotadores)
    addToast('Resultado registrado', 'success')
    setModalResultado(null)
    setAnotadores([])
    setMarcador({ gl: '', gv: '' })
  }

  const handleGuardarEdicion = () => {
    editarPartido({ ...modalEditar })
    addToast('Partido actualizado', 'success')
    setModalEditar(null)
  }

  const handleGenerarJornadas = () => {
    if (!formGenerar.torneoId || !formGenerar.fechaInicio) { addToast('Completa los campos', 'error'); return }
    generarJornadas(Number(formGenerar.torneoId), formGenerar.fechaInicio)
    addToast('Jornadas generadas automáticamente', 'success')
    setModalGenerar(false)
  }

  const agregarAnotador = (equipo) => {
    setAnotadores(prev => [...prev, { id: Date.now(), jugadorId: '', equipo, goles: 1, amarillas: 0, rojas: 0, autogol: false }])
  }

  const editarAnotador = (id, campo, valor) => {
    setAnotadores(prev => prev.map(a => a.id === id ? { ...a, [campo]: valor } : a))
  }

  const jornadasUnicas = [...new Set(
    partidos.filter(p => !filtroTorneo || p.torneoId === Number(filtroTorneo)).map(p => p.jornada)
  )].sort((a, b) => a - b)

  const partidosFiltrados = partidos.filter(p => {
    const matchT = filtroTorneo  ? p.torneoId === Number(filtroTorneo) : true
    const matchJ = filtroJornada ? p.jornada  === Number(filtroJornada) : true
    const matchE = filtroEstado  ? p.estado   === filtroEstado : true
    return matchT && matchJ && matchE
  }).sort((a, b) => a.jornada - b.jornada)

  const jugadoresPorEquipo = (eid) => jugadores.filter(j => j.equipoId === eid)

  // ── Tarjeta partido ──
  const PartidoCard = ({ partido }) => {
    const eq1    = equipos.find(e => e.id === partido.local)
    const eq2    = equipos.find(e => e.id === partido.visitante)
    const jugado = partido.estado === 'jugado'
    const badge  = ESTADOS_COLORES[partido.estado] ?? { cls: 'badge-gris', label: partido.estado, icon: null }

    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--bg-card)', border: '1px solid var(--borde)',
        borderRadius: 'var(--radius)', padding: '14px 16px',
        boxShadow: 'var(--shadow)', transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--borde)'}
      >
        {/* Jornada */}
        <div style={{
          minWidth: 54, textAlign: 'center',
          background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '6px 8px',
        }}>
          <div style={{ fontSize: 9, color: 'var(--text-light)', fontFamily: 'var(--font-cond)', letterSpacing: 1, textTransform: 'uppercase' }}>
            {partido.tipo === 'amistoso' ? 'AMI' : 'J'}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, color: 'var(--text)' }}>
            {partido.tipo === 'amistoso'
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 6.32 2.27L14 8H10L5.68 4.27A10 10 0 0 1 12 2z"/><path d="M10 8l-2 4 2 4h4l2-4-2-4h-4z"/></svg>
              : partido.jornada
            }
          </div>
        </div>

        {/* Local */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
              {eq1?.nombre ?? (partido.local === null ? 'Descansa' : '—')}
            </span>
            {eq1 && <div style={{ width: 10, height: 10, borderRadius: '50%', background: eq1.color }} />}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-light)' }}>Local</div>
        </div>

        {/* Marcador */}
        <div style={{ minWidth: 100, textAlign: 'center' }}>
          {jugado ? (
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 2,
              background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '4px 14px',
              display: 'inline-block', color: 'var(--text)',
            }}>
              <span style={{ color: partido.golesLocal > partido.golesVisitante ? 'var(--verde-dark)' : 'var(--text)' }}>
                {partido.golesLocal}
              </span>
              <span style={{ color: 'var(--text-light)', margin: '0 6px' }}>-</span>
              <span style={{ color: partido.golesVisitante > partido.golesLocal ? 'var(--verde-dark)' : 'var(--text)' }}>
                {partido.golesVisitante}
              </span>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
              <div style={{ color: 'var(--accent)', fontSize: 18, marginBottom: 2 }}>VS</div>
              <div>{partido.fecha || 'Sin fecha'}</div>
            </div>
          )}
        </div>

        {/* Visitante */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {eq2 && <div style={{ width: 10, height: 10, borderRadius: '50%', background: eq2.color }} />}
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
              {eq2?.nombre ?? (partido.visitante === null ? 'Descansa' : '—')}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-light)' }}>Visitante</div>
        </div>

        {/* Estado + Acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <span className={`badge ${badge.cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {badge.icon} {badge.label}
          </span>
          {partido.estado !== 'descansa' && (
            <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
              {(partido.estado === 'pendiente' || partido.estado === 'pospuesto') && puedeRegistrarPartido(partido.id) && (
                <button className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => {
                    setModalResultado(partido)
                    setMarcador({ gl: '', gv: '' })
                    setAnotadores([])
                  }}>
                  <ClipboardList size={12} /> Resultado
                </button>
              )}
              {isAdmin && (
                <button className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => setModalEditar({ ...partido })}>
                  <Pencil size={12} />
                </button>
              )}
              {(() => {
                const arb = getArbitroDePartido(partido.id)
                return arb ? (
                  <span style={{ fontSize: 10, color: '#7B5EA7', fontFamily: 'var(--font-cond)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Square size={9} fill="var(--amarillo)" stroke="none" /> {arb.nombre}
                  </span>
                ) : null
              })()}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Partidos</h1>
          <p className="page-header-sub">{partidos.length} partidos en total</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setModalGenerar(true)}>
              <RotateCw size={14} /> Generar Jornadas
            </button>
            <button className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => {
                setFormNuevo({ torneoId: torneos[0]?.id ?? '', local: '', visitante: '', jornada: 1, fecha: '', tipo: 'amistoso' })
                setModalNuevo(true)
              }}>
              <CalendarPlus size={14} /> Programar Partido
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="search-bar" style={{ marginBottom: 20 }}>
        <select className="form-control" style={{ maxWidth: 280 }}
          value={filtroTorneo} onChange={e => { setFiltroTorneo(e.target.value); setFiltroJornada('') }}>
          <option value="">Todos los torneos</option>
          {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
        <select className="form-control" style={{ maxWidth: 160 }}
          value={filtroJornada} onChange={e => setFiltroJornada(e.target.value)}>
          <option value="">Todas las jornadas</option>
          {jornadasUnicas.map(j => <option key={j} value={j}>Jornada {j}</option>)}
        </select>
        <select className="form-control" style={{ maxWidth: 160 }}
          value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="jugado">Jugado</option>
          <option value="pospuesto">Pospuesto</option>
          <option value="descansa">Descansa</option>
        </select>
      </div>

      {/* Lista de partidos agrupados */}
      {partidosFiltrados.length === 0 ? (
        <div className="empty-state card">
          <div className="icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-light)' }}>
            <AlertTriangle size={48} />
          </div>
          <p>No hay partidos para los filtros seleccionados</p>
        </div>
      ) : (
        [...new Set(partidosFiltrados.map(p => p.jornada))].sort((a, b) => a - b).map(jornada => {
          const ps = partidosFiltrados.filter(p => p.jornada === jornada)
          return (
            <div key={jornada} style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700,
                letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-sub)',
                marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ width: 4, height: 16, background: 'var(--primary)', borderRadius: 2 }} />
                Jornada {jornada}
                <span style={{ fontSize: 11 }}>({ps.length} {ps.length === 1 ? 'partido' : 'partidos'})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ps.map(p => <PartidoCard key={p.id} partido={p} />)}
              </div>
            </div>
          )
        })
      )}

      {/* ── Modal Nuevo Partido ── */}
      <Modal open={modalNuevo} onClose={() => setModalNuevo(false)}
        title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CalendarPlus size={16} /> Programar Partido</span>}
        footer={
          <>
            <button className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setModalNuevo(false)}>
              <X size={14} /> Cancelar
            </button>
            <button className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={handleGuardarPartido}>
              <CalendarPlus size={14} /> Programar
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Torneo</label>
          <select className="form-control" value={formNuevo.torneoId}
            onChange={e => setFormNuevo(f => ({ ...f, torneoId: e.target.value, local: '', visitante: '' }))}>
            <option value="">Seleccionar torneo...</option>
            {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Local</label>
            <select className="form-control" value={formNuevo.local}
              onChange={e => setFormNuevo(f => ({ ...f, local: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {equiposPorTorneo(formNuevo.torneoId).map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Visitante</label>
            <select className="form-control" value={formNuevo.visitante}
              onChange={e => setFormNuevo(f => ({ ...f, visitante: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {equiposPorTorneo(formNuevo.torneoId).map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Jornada</label>
            <input className="form-control" type="number" min="1"
              value={formNuevo.jornada} onChange={e => setFormNuevo(f => ({ ...f, jornada: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input className="form-control" type="date" value={formNuevo.fecha}
              onChange={e => setFormNuevo(f => ({ ...f, fecha: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select className="form-control" value={formNuevo.tipo}
              onChange={e => setFormNuevo(f => ({ ...f, tipo: e.target.value }))}>
              <option value="regular">Regular</option>
              <option value="amistoso">Amistoso</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* ── Modal Generar Jornadas ── */}
      <Modal open={modalGenerar} onClose={() => setModalGenerar(false)}
        title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><RotateCw size={16} /> Generar Jornadas Automáticamente</span>}
        footer={
          <>
            <button className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setModalGenerar(false)}>
              <X size={14} /> Cancelar
            </button>
            <button className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={handleGenerarJornadas}>
              <RotateCw size={14} /> Generar
            </button>
          </>
        }
      >
        <div style={{
          background: 'var(--amarillo-glow)', border: '1px solid var(--amarillo)',
          borderRadius: 'var(--radius)', padding: '10px 14px',
          fontSize: 13, color: '#9A7B20', marginBottom: 4,
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <AlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
          Esto reemplazará todos los partidos existentes del torneo seleccionado.
          Los equipos impares recibirán jornada de descanso automáticamente.
        </div>
        <div className="form-group">
          <label className="form-label">Torneo</label>
          <select className="form-control" value={formGenerar.torneoId}
            onChange={e => setFormGenerar(f => ({ ...f, torneoId: e.target.value }))}>
            {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de inicio (Jornada 1)</label>
          <input className="form-control" type="date" value={formGenerar.fechaInicio}
            onChange={e => setFormGenerar(f => ({ ...f, fechaInicio: e.target.value }))} />
        </div>
      </Modal>

      {/* ── Modal Editar Partido ── */}
      {modalEditar && (
        <Modal open={!!modalEditar} onClose={() => setModalEditar(null)}
          title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Pencil size={16} /> Editar Partido</span>}
          footer={
            <>
              <button className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => setModalEditar(null)}>
                <X size={14} /> Cancelar
              </button>
              <button className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={handleGuardarEdicion}>
                <Save size={14} /> Guardar
              </button>
            </>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input className="form-control" type="date" value={modalEditar.fecha ?? ''}
                onChange={e => setModalEditar(p => ({ ...p, fecha: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="form-control" value={modalEditar.estado}
                onChange={e => setModalEditar(p => ({ ...p, estado: e.target.value }))}>
                <option value="pendiente">Pendiente</option>
                <option value="pospuesto">Pospuesto</option>
                <option value="jugado">Jugado</option>
              </select>
            </div>
          </div>
          {modalEditar.estado === 'jugado' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end' }}>
              <div className="form-group">
                <label className="form-label">Goles Local</label>
                <input className="form-control" type="number" min="0"
                  style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 24 }}
                  value={modalEditar.golesLocal ?? ''}
                  onChange={e => setModalEditar(p => ({ ...p, golesLocal: Number(e.target.value) }))} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-light)', paddingBottom: 8 }}>—</div>
              <div className="form-group">
                <label className="form-label">Goles Visitante</label>
                <input className="form-control" type="number" min="0"
                  style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 24 }}
                  value={modalEditar.golesVisitante ?? ''}
                  onChange={e => setModalEditar(p => ({ ...p, golesVisitante: Number(e.target.value) }))} />
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ── Modal Resultado con Anotadores ── */}
      {modalResultado && (
        <Modal
          open={!!modalResultado}
          onClose={() => { setModalResultado(null); setAnotadores([]) }}
          title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={16} /> Registrar Resultado</span>}
          maxWidth={600}
          footer={
            <>
              <button className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => { setModalResultado(null); setAnotadores([]) }}>
                <X size={14} /> Cancelar
              </button>
              <button className="btn btn-success"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={handleGuardarResultado}>
                <Save size={14} /> Guardar Resultado
              </button>
            </>
          }
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 16, fontFamily: 'var(--font-cond)', fontWeight: 700, fontSize: 16,
            marginBottom: 4,
          }}>
            <span>{nombreEquipo(modalResultado.local)}</span>
            <span style={{ color: 'var(--text-light)' }}>vs</span>
            <span>{nombreEquipo(modalResultado.visitante)}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end', marginBottom: 4 }}>
            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center' }}>
                Goles {nombreEquipo(modalResultado.local)}
              </label>
              <input className="form-control" type="number" min="0" placeholder="0"
                value={marcador.gl}
                onChange={e => setMarcador(m => ({ ...m, gl: e.target.value }))}
                style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 28 }}
                autoFocus />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text-light)', paddingBottom: 8 }}>—</div>
            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center' }}>
                Goles {nombreEquipo(modalResultado.visitante)}
              </label>
              <input className="form-control" type="number" min="0" placeholder="0"
                value={marcador.gv}
                onChange={e => setMarcador(m => ({ ...m, gv: e.target.value }))}
                style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 28 }} />
            </div>
          </div>

          {/* Anotadores */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 700, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: 8 }}>
              Anotadores / Tarjetas
            </div>
            {anotadores.map(a => {
              const esLocal   = a.equipo === 'local'
              const equipoId  = esLocal ? modalResultado.local : modalResultado.visitante
              const jugEquipo = jugadoresPorEquipo(equipoId)
              return (
                <div key={a.id} style={{
                  background: 'var(--bg)', borderRadius: 'var(--radius)',
                  padding: '10px 12px', marginBottom: 8,
                  border: '1px solid var(--borde)',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 50px 50px 50px 30px', gap: 8, alignItems: 'end' }}>
                    <div className="form-group" style={{ gap: 4 }}>
                      <label className="form-label" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {a.autogol && <><RefreshCw size={10} /> Autogol —</>}
                        {esLocal ? nombreEquipo(modalResultado.local) : nombreEquipo(modalResultado.visitante)}
                      </label>
                      <select className="form-control" style={{ fontSize: 13, padding: '6px 8px' }}
                        value={a.jugadorId} onChange={e => editarAnotador(a.id, 'jugadorId', Number(e.target.value))}>
                        <option value="">Jugador...</option>
                        {jugEquipo.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ gap: 4 }}>
                      <label className="form-label" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 6.32 2.27L14 8H10L5.68 4.27A10 10 0 0 1 12 2z"/><path d="M10 8l-2 4 2 4h4l2-4-2-4h-4z"/></svg>
                        Goles
                      </label>
                      <input className="form-control" type="number" min="0" style={{ padding: '6px 8px', fontSize: 13 }}
                        value={a.goles} onChange={e => editarAnotador(a.id, 'goles', Number(e.target.value))} />
                    </div>
                    <div className="form-group" style={{ gap: 4 }}>
                      <label className="form-label" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Square size={10} fill="var(--amarillo)" stroke="none" /> Amar.
                      </label>
                      <input className="form-control" type="number" min="0" style={{ padding: '6px 8px', fontSize: 13 }}
                        value={a.amarillas} onChange={e => editarAnotador(a.id, 'amarillas', Number(e.target.value))} />
                    </div>
                    <div className="form-group" style={{ gap: 4 }}>
                      <label className="form-label" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Square size={10} fill="var(--rojo)" stroke="none" /> Rojas
                      </label>
                      <input className="form-control" type="number" min="0" style={{ padding: '6px 8px', fontSize: 13 }}
                        value={a.rojas} onChange={e => editarAnotador(a.id, 'rojas', Number(e.target.value))} />
                    </div>
                    <div className="form-group" style={{ gap: 4 }}>
                      <label className="form-label" style={{ fontSize: 10 }}>AG</label>
                      <input type="checkbox" checked={a.autogol} style={{ width: 18, height: 18, cursor: 'pointer' }}
                        onChange={e => editarAnotador(a.id, 'autogol', e.target.checked)} />
                    </div>
                    <button
                      onClick={() => setAnotadores(prev => prev.filter(x => x.id !== a.id))}
                      style={{ color: 'var(--rojo)', padding: 0, paddingBottom: 6, display: 'flex', alignItems: 'center' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => agregarAnotador('local')}>
                <Plus size={12} /> Local
              </button>
              <button className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => agregarAnotador('visitante')}>
                <Plus size={12} /> Visitante
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}