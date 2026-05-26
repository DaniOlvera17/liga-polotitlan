import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Trophy,
  Shield,
  Users,
  CalendarDays,
  TableProperties,
  Target,
  ClipboardList,
  Settings,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',  label: 'Dashboard',  icon: (c) => <LayoutDashboard size={18} color={c} /> },
  { to: '/torneos',    label: 'Torneos',     icon: (c) => <Trophy          size={18} color={c} /> },
  { to: '/equipos',    label: 'Equipos',     icon: (c) => <Shield          size={18} color={c} /> },
  { to: '/jugadores',  label: 'Jugadores',   icon: (c) => <Users           size={18} color={c} /> },
  { to: '/partidos',   label: 'Partidos',    icon: (c) => <CalendarDays    size={18} color={c} /> },
  { to: '/posiciones', label: 'Posiciones',  icon: (c) => <TableProperties size={18} color={c} /> },
  { to: '/goleadores', label: 'Goleadores',  icon: (c) => <Target          size={18} color={c} /> },
]

export default function Sidebar({ open }) {
  const { isAdmin, isArbitro } = useAuth()

  const linkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px', borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700,
    letterSpacing: 0.3, textTransform: 'uppercase', whiteSpace: 'nowrap',
    color:      isActive ? 'var(--primary-dark)' : 'var(--text-sub)',
    background: isActive ? 'var(--primary-glow)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
    transition: 'all 0.15s',
  })

  return (
    <aside style={{
      width: open ? 224 : 66,
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-borde)',
      transition: 'width 0.25s ease',
      overflow: 'hidden',
      flexShrink: 0,
      paddingTop: 14,
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => linkStyle(isActive)}
          >
            {({ isActive }) => (
              <>
                <span style={{ flexShrink: 0, display: 'flex' }}>
                  {item.icon(isActive ? 'var(--primary-dark)' : 'var(--text-sub)')}
                </span>
                {open && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {/* Árbitro: mis partidos */}
        {isArbitro && (
          <>
            <div style={{ height: 1, background: 'var(--sidebar-borde)', margin: '10px 0' }} />
            {open && (
              <div style={{
                padding: '4px 12px',
                fontFamily: 'var(--font-cond)', fontSize: 10,
                letterSpacing: 1, color: 'var(--text-light)',
                textTransform: 'uppercase',
              }}>
                Árbitro
              </div>
            )}
            <NavLink
              to="/mis-partidos"
              style={({ isActive }) => ({
                ...linkStyle(isActive),
                color:      isActive ? '#7B5EA7' : 'var(--text-sub)',
                background: isActive ? '#7B5EA720' : 'transparent',
                borderLeft: isActive ? '3px solid #7B5EA7' : '3px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ flexShrink: 0, display: 'flex' }}>
                    <ClipboardList size={18} color={isActive ? '#7B5EA7' : 'var(--text-sub)'} />
                  </span>
                  {open && <span>Mis Partidos</span>}
                </>
              )}
            </NavLink>
          </>
        )}

        {/* Admin */}
        {isAdmin && (
          <>
            <div style={{ height: 1, background: 'var(--sidebar-borde)', margin: '10px 0' }} />
            {open && (
              <div style={{
                padding: '4px 12px',
                fontFamily: 'var(--font-cond)', fontSize: 10,
                letterSpacing: 1, color: 'var(--text-light)',
                textTransform: 'uppercase',
              }}>
                Administración
              </div>
            )}
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                ...linkStyle(isActive),
                color:      isActive ? '#9A7B20' : 'var(--text-sub)',
                background: isActive ? 'var(--amarillo-glow)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--amarillo)' : '3px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ flexShrink: 0, display: 'flex' }}>
                    <Settings size={18} color={isActive ? '#9A7B20' : 'var(--text-sub)'} />
                  </span>
                  {open && <span>Admin</span>}
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  )
}