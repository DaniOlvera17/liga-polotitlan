import { useState } from 'react'
import { useLiga } from '../context/LigaContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import {
  Clock, CheckCircle, PauseCircle, Moon, AlertTriangle,
  ClipboardList, Save, X, Plus, RefreshCw, Square
} from 'lucide-react'

const ESTADOS_COLORES = {
  jugado:    { cls: 'badge-verde',    label: 'Final',     icon: <CheckCircle size={11} /> },
  pendiente: { cls: 'badge-amarillo', label: 'Pendiente', icon: <Clock size={11} /> },
  pospuesto: { cls: 'badge-rojo',     label: 'Pospuesto', icon: <PauseCircle size={11} /> },
  descansa:  { cls: 'badge-gris',     label: 'Descansa',  icon: <Moon size={11} /> },
}

export default function MisPartidos() {
  const { partidos, equipos, jugadores, torneos, registrarResultado, nombreEquipo } = useLiga()
  const { usuario, arbitros } = useAuth()
  const { addToast } = useToast()

  const [modalResultado, setModalResultado] = useState(null)
  const [marcador, setMarcador] = useState({ gl: '', gv: '' })
  const [anotadores, setAnotadores] = useState([])
  const [filtro, setFiltro] = useState('todos')

  const arbitroActual = arbitros.find(a => a.id === usuario?.id)
  const idsAsignados = arbitroActual?.partidosAsignados ?? []

  const misPartidos = partidos
    .filter(p => idsAsignados.includes(p.id))
    .filter(p => filtro === 'todos' ? true : p.estado === filtro)
    .sort((a, b) => a.jornada - b.jornada)

  const jugadoresPorEquipo = (eid) => jugadores.filter(j => j.equipoId === eid)

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

    if (totalLocal > gl)  { addToast(`Los goles del local (${totalLocal}) superan al marcador (${gl})`, 'error'); return }
    if (totalVis  > gv)   { addToast(`Los goles del visitante (${totalVis}) superan al marcador (${gv})`, 'error'); return }

    registrarResultado(modalResultado.id, gl, gv, anotadores)
    addToast('Resultado registrado', 'success')
    setModalResultado(null)
    setAnotadores([])
    setMarcador({ gl: '', gv: '' })
  }

  const agregarAnotador = (equipo) => {
    setAnotadores(prev => [...prev, { id: Date.now(), jugadorId: '', equipo, goles: 1, amarillas: 0, rojas: 0, autogol: false }])
  }
  const editarAnotador = (id, campo, valor) => {
    setAnotadores(prev => prev.map(a => a.id === id ? { ...a, [campo]: valor } : a))
  }

  const pendientes = misPartidos.filter(p => p.estado === 'pendiente' || p.estado === 'pospuesto').length
  const jugados    = misPartidos.filter(p => p.estado === 'jugado').length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mis Partidos</h1>
          <p className="page-header-sub">Partidos asignados para arbitrar — {usuario?.nombre}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-amarillo" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {pendientes} pendientes
          </span>
          <span className="badge badge-verde" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={11} /> {jugados} arbitrados
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'todos',     label: 'Todos',      icon: null },
          { key: 'pendiente', label: 'Pendientes', icon: <Clock size={11} /> },
          { key: 'jugado',    label: 'Jugados',    icon: <CheckCircle size={11} /> },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            style={{
              padding: '7px 16px', borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700,
              letterSpacing: 0.3, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 5,
              background: filtro === f.key ? 'var(--primary)' : 'var(--bg-card)',
              color:      filtro === f.key ? '#fff' : 'var(--text-sub)',
              border: '1px solid',
              borderColor: filtro === f.key ? 'var(--primary)' : 'var(--borde)',
              cursor: 'pointer',
            }}
          >
            {f.icon}{f.label}
          </button>
        ))}
      </div>

      {misPartidos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--amarillo)' }}>
            <AlertTriangle size={48} />
          </div>
          <p style={{ color: 'var(--text-sub)', fontSize: 15 }}>
            {idsAsignados.length === 0
              ? 'No tienes partidos asignados aún. El administrador te asignará partidos.'
              : 'No hay partidos con ese filtro.'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {misPartidos.map(partido => {
            const eq1    = equipos.find(e => e.id === partido.local)
            const eq2    = equipos.find(e => e.id === partido.visitante)
            const jugado = partido.estado === 'jugado'
            const badge  = ESTADOS_COLORES[partido.estado] ?? { cls: 'badge-gris', label: partido.estado, icon: null }
            const torneo = torneos.find(t => t.id === partido.torneoId)
            const puedePitar = partido.estado === 'pendiente' || partido.estado === 'pospuesto'

            return (
              <div key={partido.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg-card)', border: '1px solid var(--borde)',
                borderRadius: 'var(--radius)', padding: '14px 18px',
                boxShadow: 'var(--shadow)',
                borderLeft: jugado ? '3px solid var(--verde-dark)' : puedePitar ? '3px solid var(--amarillo)' : '3px solid var(--borde)',
              }}>
                {/* Jornada + Torneo */}
                <div style={{ minWidth: 64, textAlign: 'center', background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '6px 8px' }}>
                  <div style={{ fontSize: 9, color: 'var(--text-light)', fontFamily: 'var(--font-cond)', letterSpacing: 1, textTransform: 'uppercase' }}>J</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1, color: 'var(--text)' }}>{partido.jornada}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-light)', marginTop: 2 }}>{torneo?.categoria?.split(' ')[0]}</div>
                </div>

                {/* Local */}
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{eq1?.nombre ?? '—'}</span>
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
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{eq2?.nombre ?? (partido.visitante === null ? 'Descansa' : '—')}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>Visitante</div>
                </div>

                {/* Estado + Acción */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', minWidth: 140 }}>
                  <span className={`badge ${badge.cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {badge.icon} {badge.label}
                  </span>
                  {puedePitar && (
                    <button className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => {
                        setModalResultado(partido)
                        setMarcador({ gl: '', gv: '' })
                        setAnotadores([])
                      }}>
                      <ClipboardList size={13} /> Registrar Resultado
                    </button>
                  )}
                  {jugado && (
                    <span style={{ fontSize: 11, color: 'var(--verde-dark)', fontFamily: 'var(--font-cond)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={12} /> Resultado registrado
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Resultado */}
      {modalResultado && (
        <Modal
          open={!!modalResultado}
          onClose={() => { setModalResultado(null); setAnotadores([]) }}
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardList size={16} /> Registrar Resultado
            </span>
          }
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