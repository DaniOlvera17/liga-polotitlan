import { useState } from 'react'
import { useLiga } from '../context/LigaContext'
import { 
  Search, Info, Shield, Goal, Trophy, Medal, Square,
  SquareDashed, Zap, UserRound,
} from 'lucide-react'

export default function Goleadores() {
  const { jugadores, equipos, torneos } = useLiga()
  const [filtroTorneo, setFiltroTorneo] = useState('')
  const [busqueda, setBusqueda]         = useState('')

  const equipoById = (id) => equipos.find(e => e.id === id)
  const torneoDeEquipo = (eid) => {
    const eq = equipoById(eid)
    return eq ? torneos.find(t => t.id === eq.torneoId) : null
  }

  const goleadoresFiltrados = jugadores
    .filter(j => {
      const torneo    = torneoDeEquipo(j.equipoId)
      const matchT    = filtroTorneo ? torneo?.id === Number(filtroTorneo) : true
      const matchBusq = j.nombre.toLowerCase().includes(busqueda.toLowerCase())
      return matchT && matchBusq && j.goles > 0
    })
    .sort((a, b) => {
      // 1. Mayor número de goles
      if (b.goles !== a.goles) return b.goles - a.goles
      // 2. Promedio (goles / PJ del equipo)
      const pjA = equipos.find(e => e.id === a.equipoId)?.pj || 1
      const pjB = equipos.find(e => e.id === b.equipoId)?.pj || 1
      const promA = a.goles / pjA, promB = b.goles / pjB
      if (Math.abs(promB - promA) > 0.001) return promB - promA
      // 3. Inicial del nombre (orden alfabético)
      return (a.nombre[0] ?? '').localeCompare(b.nombre[0] ?? '')
    })

  const maxGoles = goleadoresFiltrados[0]?.goles ?? 1
  const posicionIcon = {
  Portero: <Shield size={16} />,
  Defensa: <Shield size={16} />,
  Mediocampo: <UserRound size={16} />,
  Delantero: <Zap size={16} />,
}

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Goleadores</h1>
          <p className="page-header-sub">Tabla de goleo — clasificación individual</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="search-bar" style={{ marginBottom: 20 }}>
        <div className="search-input-wrap">
          <Search size={18} className="icon" />
          <input className="form-control" placeholder="Buscar jugador..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <select className="form-control" style={{ maxWidth: 280 }}
          value={filtroTorneo} onChange={e => setFiltroTorneo(e.target.value)}>
          <option value="">Todos los torneos</option>
          {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
      </div>

      {/* Criterio de desempate */}
      <div style={{
        background: 'var(--primary-glow)', border: '1px solid var(--primary)',
        borderRadius: 'var(--radius)', padding: '10px 14px',
        fontSize: 12, color: 'var(--primary-dark)', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Info size={16} />
        <span>
          <strong>Criterio FMF (Amateur):</strong> 1º Mayor número de goles · 2º Promedio goles/partido · 3º Inicial del nombre
        </span>
      </div>

      {/* Podio top 3 */}
      {goleadoresFiltrados.length >= 3 && !busqueda && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
          {[goleadoresFiltrados[1], goleadoresFiltrados[0], goleadoresFiltrados[2]].map((j, idx) => {
            const realPos = idx === 0 ? 2 : idx === 1 ? 1 : 3
            const medals = {
              1: { color: '#D4A017', bg: '#F0C97A22', label: <Trophy size={28} />, shadow: '#F0C97A40' },
              2: { color: '#A0A0A0', bg: '#C0C0C020', label: <Medal size={24} />,       shadow: '#C0C0C040' },
              3: { color: '#CD7F32', bg: '#CD7F3220', label: <Medal size={24} />,       shadow: '#CD7F3240' },
            }
            const m  = medals[realPos]
            const eq = equipoById(j.equipoId)
            const pj = eq?.pj || 1
            const prom = (j.goles / pj).toFixed(2)
            return (
              <div key={j.id} style={{
                background: m.bg, border: `1.5px solid ${m.color}60`,
                borderRadius: 'var(--radius-lg)', padding: '20px 16px', textAlign: 'center',
                boxShadow: `0 4px 20px ${m.shadow}`,
                order: idx === 1 ? -1 : 0,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: m.color, lineHeight: 1, marginBottom: 4 }}>
                  {j.goles}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-light)', fontFamily: 'var(--font-cond)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                  Goles · Prom {prom}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text)' }}>{j.nombre}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: 'var(--text-sub)' }}>
                  {eq && <div style={{ width: 8, height: 8, borderRadius: '50%', background: eq.color }} />}
                  <span>{eq?.nombre ?? '—'}</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-sub)' }}>
                  {posicionIcon[j.posicion]} {j.posicion}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lista completa */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '52px 1fr 160px 80px 60px 60px 60px 70px',
          padding: '10px 16px',
          background: 'var(--bg-input)', borderBottom: '2px solid var(--borde)',
        }}>
          {['#', 'Jugador', 'Equipo', 'Goles', 'Prom.', <Square size={14} color="#9A7B20" />, <Square size={14} color="red" />, 'Pos.'].map((h, i) => (
            <div key={h} style={{
              fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 700,
              letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-sub)',
              textAlign: i <= 1 ? 'left' : 'center',
            }}>{h}</div>
          ))}
        </div>

        {goleadoresFiltrados.length === 0 ? (
          <div className="empty-state"><Goal size={40} /><p>No hay goleadores registrados</p></div>
        ) : (
          goleadoresFiltrados.map((j, idx) => {
            const eq   = equipoById(j.equipoId)
            const isTop = idx < 3
            const pj   = eq?.pj || 1
            const prom = (j.goles / pj).toFixed(2)
            return (
              <div key={j.id} style={{
                display: 'grid',
                gridTemplateColumns: '52px 1fr 160px 80px 60px 60px 60px 70px',
                padding: '11px 16px', borderBottom: '1px solid var(--borde)',
                background: idx % 2 === 0 ? 'transparent' : 'var(--bg)',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'var(--bg)'}
              >
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 20,
                  color: isTop ? '#D4A017' : 'var(--text-light)',
                  display: 'flex', alignItems: 'center',
                }}>{idx + 1}</div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{j.nombre}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
                    {j.numero ? `#${j.numero} · ` : ''}{j.posicion}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {eq && <div style={{ width: 8, height: 8, borderRadius: '50%', background: eq.color, flexShrink: 0 }} />}
                  <span style={{ fontSize: 13, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {eq?.nombre ?? '—'}
                  </span>
                </div>
                {/* Goles con barra */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <div style={{
                    width: `${Math.round((j.goles / maxGoles) * 30)}px`, height: 6,
                    background: isTop ? 'var(--verde)' : 'var(--borde)',
                    borderRadius: 3, minWidth: 4,
                  }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: isTop ? 'var(--verde-dark)' : 'var(--text)' }}>
                    {j.goles}
                  </span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {prom}
                </div>
                <div style={{ textAlign: 'center', color: j.amarillas > 0 ? '#9A7B20' : 'var(--text-light)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {j.amarillas}
                </div>
                <div style={{ textAlign: 'center', color: j.rojas > 0 ? 'var(--rojo)' : 'var(--text-light)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {j.rojas}
                </div>
                <div style={{ textAlign: 'center', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {posicionIcon[j.posicion] ?? '—'}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
