import { useState } from 'react'
import { useLiga } from '../context/LigaContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import {
  Trophy, Shield, Users, Target, Medal,
  CalendarDays, Handshake, ClipboardList,
  Settings, AlertTriangle, Plus, X,
} from 'lucide-react'

function StatCard({ icon, label, valor, color = 'var(--primary)' }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
      <div style={{ fontSize: 30, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color, lineHeight: 1 }}>{valor}</div>
      <div style={{ fontFamily: 'var(--font-cond)', fontSize: 12, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
        {label}
      </div>
    </div>
  )
}

const medalIcon = (i) => {
  const colors = ['#D4A017', '#A0A0A0', '#CD7F32']
  return <Medal size={16} color={colors[i] ?? 'var(--text-light)'} fill={colors[i] ?? 'transparent'} />
}

export default function Admin() {
  const { torneos, equipos, jugadores, partidos } = useLiga()
  const { usuario, arbitros, asignarPartidoArbitro, desasignarPartidoArbitro } = useAuth()
  const { addToast } = useToast()

  const [modalArbitro, setModalArbitro] = useState(null)
  const [torneoFiltro, setTorneoFiltro] = useState(torneos[0]?.id ?? '')

  const totalGoles = partidos
    .filter(p => p.estado === 'jugado')
    .reduce((s, p) => s + (p.golesLocal ?? 0) + (p.golesVisitante ?? 0), 0)

  const golesPorEquipo = equipos
    .map(e => ({ nombre: e.nombre, color: e.color, goles: e.golesFavor }))
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 8)
  const maxGoles = golesPorEquipo[0]?.goles ?? 1

  const topPorTorneo = torneos.map(t => {
    const tabla = equipos
      .filter(e => e.torneoId === t.id)
      .sort((a, b) => b.pts - a.pts)
      .slice(0, 3)
    return { torneo: t, tabla }
  })

  const topGoleadores = [...jugadores].sort((a, b) => b.goles - a.goles).slice(0, 5)

  const topPorterosPorTorneo = torneos.map(t => {
    const porteros = jugadores
      .filter(j => j.posicion === 'Portero')
      .map(j => {
        const equipo = equipos.find(e => e.id === j.equipoId)
        if (!equipo || equipo.torneoId !== t.id) return null
        return { ...j, equipo, golesRecibidos: equipo.golesContra }
      })
      .filter(Boolean)
      .sort((a, b) => a.golesRecibidos - b.golesRecibidos)
      .slice(0, 3)
    return { torneo: t, porteros }
  })

  const fairPlayPorTorneo = torneos.map(t => {
    const equiposConTarjetas = equipos
      .filter(e => e.torneoId === t.id)
      .map(e => {
        const jug = jugadores.filter(j => j.equipoId === e.id)
        const amarillas = jug.reduce((s, j) => s + (j.amarillas || 0), 0)
        const rojas     = jug.reduce((s, j) => s + (j.rojas || 0), 0)
        const puntos = amarillas + rojas * 3
        return { ...e, amarillas, rojas, puntos }
      })
      .sort((a, b) => a.puntos - b.puntos)
      .slice(0, 3)
    return { torneo: t, equipos: equiposConTarjetas }
  })

  const partidosAsignables = partidos.filter(p =>
    p.estado === 'pendiente' || p.estado === 'pospuesto'
  )

  const nombreEquipo = (id) => equipos.find(e => e.id === id)?.nombre ?? '—'
  const nombreTorneo = (id) => torneos.find(t => t.id === id)?.categoria ?? '—'

  const partidosFiltradosParaAsignar = partidosAsignables.filter(p =>
    torneoFiltro ? p.torneoId === Number(torneoFiltro) : true
  ).sort((a, b) => a.jornada - b.jornada)

  const getArbitroDePartido = (pid) => arbitros.find(a => a.partidosAsignados.includes(pid))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Panel de Administración</h1>
          <p className="page-header-sub">Control total del sistema — Liga Municipal Polotitlán</p>
        </div>
        <span className="badge badge-amarillo" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Settings size={13} color="#9A7B20" /> {usuario?.nombre}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard icon={<Trophy  size={28} color="var(--primary-dark)" />} label="Torneos"   valor={torneos.length}   color="var(--primary-dark)" />
        <StatCard icon={<Shield  size={28} color="var(--azul)"         />} label="Equipos"   valor={equipos.length}   color="var(--azul)"         />
        <StatCard icon={<Users   size={28} color="#9A7B20"             />} label="Jugadores" valor={jugadores.length} color="#9A7B20"             />
        <StatCard icon={<CalendarDays size={28} color="var(--verde-dark)" />} label="Partidos" valor={partidos.length} color="var(--verde-dark)"  />
        <StatCard icon={<Target  size={28} color="var(--rojo)"         />} label="Goles"     valor={totalGoles}       color="var(--rojo)"         />
      </div>

      {/* Goles por equipo */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 20, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={16} color="var(--verde-dark)" /> Goles por Equipo (Top 8)
        </h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 150 }}>
          {golesPorEquipo.map(e => (
            <div key={e.nombre} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: e.color }}>{e.goles}</span>
              <div style={{
                width: '100%',
                height: `${(e.goles / maxGoles) * 110}px`,
                background: `linear-gradient(to top, ${e.color}dd, ${e.color}55)`,
                borderRadius: '6px 6px 0 0',
                minHeight: 4, border: `1px solid ${e.color}60`, borderBottom: 'none',
              }} />
              <span style={{
                fontSize: 10, color: 'var(--text-sub)', fontFamily: 'var(--font-cond)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                width: '100%', textAlign: 'center',
              }}>{e.nombre.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Estado torneos + partidos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={15} color="var(--primary)" /> Estado de Torneos
          </h2>
          {[
            { label: 'Activos',     count: torneos.filter(t => t.estado === 'activo').length,     color: 'var(--verde-dark)' },
            { label: 'Pausados',    count: torneos.filter(t => t.estado === 'pausado').length,    color: '#9A7B20'           },
            { label: 'Finalizados', count: torneos.filter(t => t.estado === 'finalizado').length, color: 'var(--text-sub)'   },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: 'var(--text-sub)', fontSize: 14 }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: s.color }}>{s.count}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={15} color="var(--primary)" /> Estado de Partidos
          </h2>
          {[
            { label: 'Jugados',    count: partidos.filter(p => p.estado === 'jugado').length,    color: 'var(--verde-dark)' },
            { label: 'Pendientes', count: partidos.filter(p => p.estado === 'pendiente').length, color: '#9A7B20'           },
            { label: 'Pospuestos', count: partidos.filter(p => p.estado === 'pospuesto').length, color: 'var(--rojo)'      },
            { label: 'Descanso',   count: partidos.filter(p => p.estado === 'descansa').length,  color: 'var(--text-sub)'  },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-sub)', fontSize: 14 }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: s.color }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Líderes por torneo */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Medal size={15} color="#D4A017" /> Líderes por Torneo
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {topPorTorneo.map(({ torneo, tabla }) => (
            <div key={torneo.id} style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '14px 16px', border: '1px solid var(--borde)' }}>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                {torneo.categoria}
              </div>
              {tabla.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-light)' }}>Sin equipos</p>
              ) : tabla.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {medalIcon(i)}
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{e.nombre}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--primary-dark)' }}>{e.pts}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 Goleadores */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={15} color="var(--verde-dark)" /> Top 5 Goleadores (Global)
        </h2>
        {topGoleadores.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontSize: 13 }}>Sin goles registrados aún</p>
        ) : topGoleadores.map((j, i) => {
          const eq = equipos.find(e => e.id === j.equipoId)
          return (
            <div key={j.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: i < topGoleadores.length - 1 ? '1px solid var(--borde)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: i < 3 ? '#D4A017' : 'var(--text-light)', minWidth: 28 }}>
                  {i + 1}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{j.nombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {eq && <div style={{ width: 8, height: 8, borderRadius: '50%', background: eq.color }} />}
                    <span>{eq?.nombre ?? '—'}</span>
                  </div>
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--verde-dark)' }}>{j.goles}</span>
            </div>
          )
        })}
      </div>

      {/* TOP 3 Porteros */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={15} color="var(--primary)" /> Top 3 Porteros — Menos Goles Recibidos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {topPorterosPorTorneo.map(({ torneo, porteros }) => (
            <div key={torneo.id} style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '14px 16px', border: '1px solid var(--borde)' }}>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                {torneo.categoria}
              </div>
              {porteros.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-light)' }}>Sin porteros registrados</p>
              ) : porteros.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {medalIcon(i)}
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.equipo.color }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>{p.equipo.nombre}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: p.golesRecibidos === 0 ? 'var(--verde-dark)' : 'var(--text)' }}>
                      {p.golesRecibidos}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-light)', fontFamily: 'var(--font-cond)' }}>GC</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Fair Play */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Handshake size={15} color="var(--verde-dark)" /> Fair Play — Top 3 Equipos con Menos Tarjetas
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {fairPlayPorTorneo.map(({ torneo, equipos: eqs }) => (
            <div key={torneo.id} style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '14px 16px', border: '1px solid var(--borde)' }}>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                {torneo.categoria}
              </div>
              {eqs.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-light)' }}>Sin equipos</p>
              ) : eqs.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {medalIcon(i)}
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{e.nombre}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <span style={{ color: '#9A7B20', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 10, height: 13, background: '#9A7B20', borderRadius: 2 }} /> {e.amarillas}
                    </span>
                    <span style={{ color: 'var(--rojo)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 10, height: 13, background: 'var(--rojo)', borderRadius: 2 }} /> {e.rojas}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-light)', fontStyle: 'italic' }}>
          * Ordenado por puntos de fair play: amarilla = 1 pt, roja = 3 pts. Menos puntos = mejor disciplina.
        </div>
      </div>

      {/* Asignación de Árbitros */}
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClipboardList size={15} color="#7B5EA7" /> Asignación de Árbitros a Partidos
        </h2>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {arbitros.map(a => (
            <button key={a.id}
              onClick={() => setModalArbitro(a)}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius)',
                background: modalArbitro?.id === a.id ? '#7B5EA7' : 'var(--bg-input)',
                color: modalArbitro?.id === a.id ? '#fff' : 'var(--text)',
                border: '1px solid',
                borderColor: modalArbitro?.id === a.id ? '#7B5EA7' : 'var(--borde)',
                fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <ClipboardList size={13} color={modalArbitro?.id === a.id ? '#fff' : '#7B5EA7'} />
              {a.nombre}
              <span style={{
                marginLeft: 4, background: '#7B5EA730', borderRadius: 20,
                padding: '2px 8px', fontSize: 11,
                color: modalArbitro?.id === a.id ? '#fff' : '#7B5EA7',
              }}>
                {a.partidosAsignados.length} partidos
              </span>
            </button>
          ))}
        </div>

        {modalArbitro && (
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: 16, border: '1px solid var(--borde)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700, color: '#7B5EA7', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ClipboardList size={14} color="#7B5EA7" /> {modalArbitro.nombre} — Partidos asignados
              </div>
              <button onClick={() => setModalArbitro(null)} style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <select className="form-control" style={{ maxWidth: 300, marginBottom: 12 }}
              value={torneoFiltro}
              onChange={e => setTorneoFiltro(e.target.value)}>
              <option value="">Todos los torneos</option>
              {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>

            {partidosFiltradosParaAsignar.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-light)' }}>No hay partidos pendientes para asignar.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {partidosFiltradosParaAsignar.map(p => {
                  const asignado = modalArbitro.partidosAsignados.includes(p.id)
                  const arbitroActual = getArbitroDePartido(p.id)
                  const asignadoAOtro = arbitroActual && arbitroActual.id !== modalArbitro.id

                  return (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: asignado ? '#7B5EA715' : 'var(--bg-card)',
                      border: '1px solid',
                      borderColor: asignado ? '#7B5EA760' : 'var(--borde)',
                      borderRadius: 'var(--radius)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: 'var(--font-cond)', fontSize: 12, color: 'var(--text-sub)', minWidth: 50 }}>
                          J{p.jornada} · {nombreTorneo(p.torneoId).split(' ')[0]}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                          {nombreEquipo(p.local)} <span style={{ color: 'var(--text-light)' }}>vs</span> {nombreEquipo(p.visitante)}
                        </span>
                        {p.fecha && <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{p.fecha}</span>}
                        {asignadoAOtro && (
                          <span style={{ fontSize: 11, color: '#9A7B20', fontFamily: 'var(--font-cond)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={12} color="#9A7B20" /> Asignado a {arbitroActual.nombre}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (asignado) {
                            desasignarPartidoArbitro(modalArbitro.id, p.id)
                            setModalArbitro(prev => ({ ...prev, partidosAsignados: prev.partidosAsignados.filter(id => id !== p.id) }))
                            addToast('Partido desasignado', 'info')
                          } else {
                            asignarPartidoArbitro(modalArbitro.id, p.id)
                            setModalArbitro(prev => ({ ...prev, partidosAsignados: [...prev.partidosAsignados, p.id] }))
                            addToast('Partido asignado', 'success')
                          }
                        }}
                        className={`btn btn-sm ${asignado ? 'btn-danger' : 'btn-primary'}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {asignado
                          ? <><X size={12} /> Desasignar</>
                          : <><Plus size={12} /> Asignar</>
                        }
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}