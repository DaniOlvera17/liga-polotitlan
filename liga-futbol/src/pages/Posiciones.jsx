import { useState } from 'react'
import { useLiga } from '../context/LigaContext'
import { Medal, ClipboardList } from 'lucide-react'

export default function Posiciones() {
  const { torneos, equipos, partidos } = useLiga()
  const [torneoId, setTorneoId] = useState(torneos[0]?.id ?? null)

  const tabla = equipos
    .filter(e => e.torneoId === torneoId)
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      const difB = b.golesFavor - b.golesContra
      const difA = a.golesFavor - a.golesContra
      if (difB !== difA) return difB - difA
      return b.golesFavor - a.golesFavor
    })

  const torneoActual = torneos.find(t => t.id === torneoId)

  const ultimos5 = (equipoId) => {
    const jugados = partidos
      .filter(p =>
        p.estado === 'jugado' &&
        p.torneoId === torneoId &&
        (p.local === equipoId || p.visitante === equipoId)
      )
      .sort((a, b) => {
        if (a.jornada !== b.jornada) return a.jornada - b.jornada
        return (a.fecha ?? '').localeCompare(b.fecha ?? '')
      })

    const ultimos = jugados.slice(-5)

    return ultimos.map(p => {
      const esLocal = p.local === equipoId
      const gf = esLocal ? p.golesLocal : p.golesVisitante
      const gc = esLocal ? p.golesVisitante : p.golesLocal
      if (gf > gc) return 'G'
      if (gf === gc) return 'E'
      return 'P'
    })
  }

  const colorForma = { G: 'var(--verde)', E: 'var(--amarillo)', P: 'var(--rojo)' }
  const labelForma = { G: 'G', E: 'E', P: 'P' }

  // Medallas con color por posición usando lucide Medal
  const PosIcon = ({ idx }) => {
    if (idx === 0) return <Medal size={20} color="#F0C97A" fill="#F0C97A" />
    if (idx === 1) return <Medal size={20} color="#C0C0C0" fill="#C0C0C0" />
    if (idx === 2) return <Medal size={20} color="#CD7F32" fill="#CD7F32" />
    return <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-light)' }}>{idx + 1}</span>
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Posiciones</h1>
          <p className="page-header-sub">Tabla de clasificación general</p>
        </div>
      </div>

      {/* Selector de torneo */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {torneos.map(t => (
          <button key={t.id} onClick={() => setTorneoId(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700,
              letterSpacing: 0.3, textTransform: 'uppercase',
              background: t.id === torneoId ? 'var(--primary)' : 'var(--bg-card)',
              color:      t.id === torneoId ? '#fff' : 'var(--text-sub)',
              border: '1px solid',
              borderColor: t.id === torneoId ? 'var(--primary)' : 'var(--borde)',
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: t.id === torneoId ? '0 2px 8px var(--primary-glow)' : 'none',
            }}
          >
            {t.categoria} — {t.temporada}
          </button>
        ))}
      </div>

      {torneoActual && (
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 0.5, color: 'var(--text)' }}>
            {torneoActual.nombre}
          </span>
          <span className={`badge ${torneoActual.estado === 'activo' ? 'badge-verde' : 'badge-gris'}`}>
            {torneoActual.estado === 'activo' ? '● Activo' : 'Finalizado'}
          </span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr 50px 50px 50px 50px 60px 60px 60px 80px 120px',
          background: 'var(--bg-input)', padding: '10px 16px',
          borderBottom: '2px solid var(--borde)',
        }}>
          {['#', 'Equipo', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'PTS', 'Últimos 5'].map((h, i) => (
            <div key={h} style={{
              fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 700,
              letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-sub)',
              textAlign: i <= 1 ? 'left' : 'center',
            }}>{h}</div>
          ))}
        </div>

        {tabla.length === 0 ? (
          <div className="empty-state">
            <div className="icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-light)' }}>
              <ClipboardList size={48} />
            </div>
            <p>No hay equipos en este torneo</p>
          </div>
        ) : (
          tabla.map((equipo, idx) => {
            const dg    = equipo.golesFavor - equipo.golesContra
            const isTop = idx < 3
            const posColor = idx === 0 ? '#F0C97A' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--text-light)'
            const forma = ultimos5(equipo.id)

            return (
              <div key={equipo.id} style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 50px 50px 50px 50px 60px 60px 60px 80px 120px',
                padding: '12px 16px',
                borderBottom: '1px solid var(--borde)',
                borderLeft: isTop ? `3px solid ${posColor}` : '3px solid transparent',
                background: idx % 2 === 0 ? 'transparent' : 'var(--bg)',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'var(--bg)'}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PosIcon idx={idx} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: equipo.color, flexShrink: 0, border: '2px solid var(--borde)' }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{equipo.nombre}</span>
                </div>
                {[equipo.pj, equipo.pg, equipo.pe, equipo.pp, equipo.golesFavor, equipo.golesContra].map((v, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {v}
                  </div>
                ))}
                <div style={{
                  textAlign: 'center', fontSize: 14, fontWeight: 700,
                  color: dg > 0 ? 'var(--verde-dark)' : dg < 0 ? 'var(--rojo)' : 'var(--text-sub)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {dg > 0 ? '+' : ''}{dg}
                </div>
                <div style={{
                  textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 24,
                  color: isTop ? 'var(--primary-dark)' : 'var(--text)',
                }}>
                  {equipo.pts}
                </div>

                {/* Últimos 5 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                  {forma.length === 0 ? (
                    <span style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: 'var(--font-cond)' }}>—</span>
                  ) : (
                    forma.map((r, i) => (
                      <div
                        key={i}
                        title={r === 'G' ? 'Ganado' : r === 'E' ? 'Empate' : 'Perdido'}
                        style={{
                          width: 18, height: 18, borderRadius: 4,
                          background: colorForma[r],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 900, color: '#fff',
                          fontFamily: 'var(--font-cond)', letterSpacing: 0,
                          boxShadow: `0 1px 4px ${colorForma[r]}88`,
                        }}
                      >
                        {labelForma[r]}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-sub)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 3, height: 16, background: '#F0C97A', borderRadius: 2 }} /> Campeón
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--verde)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 900 }}>G</div> Ganado
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--amarillo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 900 }}>E</div> Empate
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--rojo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 900 }}>P</div> Perdido
        </span>
        <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>
          Columna "Últimos 5" muestra los últimos 5 partidos disputados en orden cronológico (más antiguo → más reciente)
        </span>
      </div>
    </div>
  )
}