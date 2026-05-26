import { useState, useEffect } from 'react'
import {
  Trophy, Shield, Footprints, Zap,
  ClipboardList, Goal, CalendarDays,
  CheckCircle2, Clock, PauseCircle,
} from 'lucide-react'
import { useLiga } from '../context/LigaContext'

function MiniBar({ valor, max, color = 'var(--primary)' }) {
  const pct = max > 0 ? (valor / max) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-light)', minWidth: 20 }}>{valor}</span>
    </div>
  )
}

// Carousel de tablas
function Carousel({ slides }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 4000)
    return () => clearInterval(t)
  }, [slides.length])

  if (slides.length === 0) return null

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius)' }}>
      {/* Track */}
      <div style={{ display: 'flex', transition: 'transform 0.5s ease', transform: `translateX(-${idx * 100}%)` }}>
        {slides.map((slide, i) => (
          <div key={i} style={{ flexShrink: 0, width: '100%' }}>
            {slide}
          </div>
        ))}
      </div>
      {/* Dots */}
      {slides.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 20 : 8, height: 8,
                borderRadius: 4,
                background: i === idx ? 'var(--primary)' : 'var(--borde)',
                transition: 'all 0.3s', border: 'none', cursor: 'pointer', padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { torneos, equipos, jugadores, partidos } = useLiga()

  const torneosActivos = torneos.filter(t => t.estado === 'activo')
  const totalGoles     = partidos.filter(p => p.estado === 'jugado')
    .reduce((s, p) => s + (p.golesLocal ?? 0) + (p.golesVisitante ?? 0), 0)
  const partidosJugados    = partidos.filter(p => p.estado === 'jugado').length
  const partidosPendientes = partidos.filter(p => p.estado === 'pendiente').length
  const partidosPospuestos = partidos.filter(p => p.estado === 'pospuesto').length

  const stats = [
    { label: 'Torneos Activos',     valor: torneosActivos.length, icon: <Trophy    size={20} />, clase: 'primary'  },
    { label: 'Equipos Registrados', valor: equipos.length,        icon: <Shield    size={20} />, clase: 'azul'     },
    { label: 'Jugadores',           valor: jugadores.length,      icon: <Footprints size={20} />, clase: 'amarillo' },
    { label: 'Total de Goles',      valor: totalGoles,            icon: <Zap       size={20} />, clase: 'verde'    },
  ]

  // Slides de POSICIONES por torneo activo
  const slidesPos = torneosActivos.map(torneo => {
    const tabla = equipos
      .filter(e => e.torneoId === torneo.id)
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts
        return (b.golesFavor - b.golesContra) - (a.golesFavor - a.golesContra)
      })
      .slice(0, 6)
    const maxPts = tabla[0]?.pts ?? 1
    return (
      <div>
        <div style={{
          fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700,
          letterSpacing: 1, textTransform: 'uppercase',
          color: 'var(--text-sub)', marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Trophy size={12} color="var(--primary)" />
          {torneo.nombre}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tabla.map((e, i) => (
            <div key={e.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 16,
                    color: i < 3 ? 'var(--amarillo)' : 'var(--text-light)', minWidth: 20,
                  }}>{i + 1}</span>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{e.nombre}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-sub)', alignItems: 'center' }}>
                  <span>{e.pj} PJ</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' }}>{e.pts}</span>
                </div>
              </div>
              <MiniBar valor={e.pts} max={maxPts} color={e.color} />
            </div>
          ))}
        </div>
      </div>
    )
  })

  // Slides de GOLEADORES por torneo activo
  const slidesGol = torneosActivos.map(torneo => {
    const idsEquipos = equipos.filter(e => e.torneoId === torneo.id).map(e => e.id)
    const gols = jugadores
      .filter(j => idsEquipos.includes(j.equipoId) && j.goles > 0)
      .sort((a, b) => {
        if (b.goles !== a.goles) return b.goles - a.goles
        const pjA = equipos.find(e => e.id === a.equipoId)?.pj || 1
        const pjB = equipos.find(e => e.id === b.equipoId)?.pj || 1
        if (b.goles / pjB !== a.goles / pjA) return b.goles / pjB - a.goles / pjA
        return (a.nombre[0] ?? '').localeCompare(b.nombre[0] ?? '')
      })
      .slice(0, 5)
    const maxGoles = gols[0]?.goles ?? 1
    return (
      <div>
        <div style={{
          fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700,
          letterSpacing: 1, textTransform: 'uppercase',
          color: 'var(--text-sub)', marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Goal size={12} color="var(--verde)" />
          {torneo.nombre}
        </div>
        {gols.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontSize: 13 }}>Sin goles registrados aún</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {gols.map((j, i) => {
              const eq = equipos.find(e => e.id === j.equipoId)
              return (
                <div key={j.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: 16,
                        color: i < 3 ? 'var(--amarillo)' : 'var(--text-light)', minWidth: 20,
                      }}>{i + 1}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{j.nombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{eq?.nombre}</div>
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--verde-dark)' }}>{j.goles}</span>
                  </div>
                  <MiniBar valor={j.goles} max={maxGoles} color="var(--verde)" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  })

  // Slides de ESTADO DE PARTIDOS por torneo activo
  const slidesPartidos = torneosActivos.map(torneo => {
    const ps = partidos.filter(p => p.torneoId === torneo.id)
    const jug = ps.filter(p => p.estado === 'jugado').length
    const pen = ps.filter(p => p.estado === 'pendiente').length
    const pos = ps.filter(p => p.estado === 'pospuesto').length
    const total = ps.length
    return (
      <div>
        <div style={{
          fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700,
          letterSpacing: 1, textTransform: 'uppercase',
          color: 'var(--text-sub)', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <CalendarDays size={12} color="var(--accent)" />
          {torneo.nombre}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className="badge badge-verde" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} /> Jugados: {jug}
          </span>
          <span className="badge badge-amarillo" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} /> Pendientes: {pen}
          </span>
          {pos > 0 && (
            <span className="badge badge-rojo" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PauseCircle size={13} /> Pospuestos: {pos}
            </span>
          )}
          <span className="badge badge-gris">Total: {total}</span>
        </div>
        {total > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-sub)', marginBottom: 4 }}>
              <span>Progreso</span>
              <span>{Math.round((jug / total) * 100)}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${(jug / total) * 100}%`, height: '100%',
                background: 'linear-gradient(90deg, var(--verde-dark), var(--verde))',
                borderRadius: 4, transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        )}
      </div>
    )
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-header-sub">Resumen general de la Liga Municipal Polotitlán</p>
        </div>
        <span className="badge badge-verde" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Zap size={13} /> Temporada Activa
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.clase}`}>{s.icon}</div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.valor}</div>
            </div>
          </div>
        ))}
      </div>

      {/* DESTACADO — Carousel de posiciones + goleadores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Posiciones */}
        <div className="card">
          <h2 style={{
            fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--text)',
          }}>
            <ClipboardList size={16} /> Tabla de Posiciones
            <span className="badge badge-primary" style={{ fontSize: 10 }}>
              {torneosActivos.length} torneos
            </span>
          </h2>
          <Carousel slides={slidesPos} />
        </div>

        {/* Goleadores */}
        <div className="card">
          <h2 style={{
            fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--text)',
          }}>
            <Goal size={16} /> Goleadores
            <span className="badge badge-verde" style={{ fontSize: 10 }}>
              {torneosActivos.length} torneos
            </span>
          </h2>
          <Carousel slides={slidesGol} />
        </div>
      </div>

      {/* Estado de partidos */}
      <div className="card">
        <h2 style={{
          fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--text)',
        }}>
          <CalendarDays size={16} /> Estado de Partidos por Torneo
        </h2>
        <Carousel slides={slidesPartidos} />
      </div>
    </div>
  )
}