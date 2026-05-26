import { useAuth } from '../context/AuthContext'
import { useLiga } from '../context/LigaContext'
import { useNavigate } from 'react-router-dom'
import { Menu, Circle, LogIn, Power } from 'lucide-react'

const rolLabel = { admin: 'Admin', delegado: 'Delegado', arbitro: 'Árbitro' }
const rolColor = { admin: 'var(--amarillo)', delegado: 'var(--primary)', arbitro: '#7B5EA7' }

export default function Navbar({ onToggleSidebar }) {
  const { usuario, logout } = useAuth()
  const { torneos } = useLiga()
  const navigate = useNavigate()
  const activos = torneos.filter(t => t.estado === 'activo').length

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header style={{
      height: 62,
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--borde)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 8px rgba(100,70,40,0.06)',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onToggleSidebar}
          style={{ color: 'var(--text-sub)', padding: 6, display: 'flex', alignItems: 'center' }}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} color="var(--text-sub)" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--primary-glow)',
            border: '2px solid var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src="/logoLP.jpg"
              alt="Liga Polotitlán"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <Circle
              size={18}
              color="var(--primary)"
              fill="var(--primary)"
              style={{ display: 'none' }}
            />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18, letterSpacing: 1,
              color: 'var(--primary-dark)', lineHeight: 1,
            }}>LIGA POLOTITLÁN</div>
            <div style={{ fontSize: 10, color: 'var(--text-light)', letterSpacing: 0.5 }}>
              Sistema de Gestión
            </div>
          </div>
        </div>
      </div>

      {/* Center */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--verde-glow)',
        border: '1px solid var(--verde-dark)',
        borderRadius: 20, padding: '4px 14px',
        fontSize: 12, color: 'var(--verde-dark)',
        fontFamily: 'var(--font-cond)', fontWeight: 700,
      }}>
        <Circle size={8} fill="var(--verde-dark)" color="var(--verde-dark)" />
        <span>{activos} Torneo{activos !== 1 ? 's' : ''} Activo{activos !== 1 ? 's' : ''}</span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {usuario ? (
          <>
            <div style={{ textAlign: 'right', lineHeight: 1.4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{usuario.nombre}</div>
              <div style={{
                fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5,
                color: rolColor[usuario.rol] ?? 'var(--text-sub)',
                fontWeight: 700,
              }}>
                {rolLabel[usuario.rol] ?? usuario.rol}
              </div>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
            }}>
              {usuario.nombre?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{ color: 'var(--text-light)', padding: 6, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--rojo)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-light)'}
            >
              <Power size={18} color="currentColor" />
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LogIn size={15} color="currentColor" /> Iniciar Sesión
          </button>
        )}
      </div>
    </header>
  )
}