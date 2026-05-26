import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertTriangle, Lock, Eye, Loader2, ArrowLeft } from 'lucide-react'
import logoLP from '../img/logoLP.jpg'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const result = login(form.email, form.password)
    if (result.ok) navigate('/dashboard')
    else setError(result.error)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F5F0EB 0%, #EDE4D8 50%, #E8DDD2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Decoración de fondo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(ellipse 60% 50% at 30% 20%, #7C9FBF18 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 80% 80%, #E8A59820 0%, transparent 60%)
        `,
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300,
        borderRadius: '50%', border: '2px solid #7C9FBF18',
        top: -100, right: -100, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 200, height: 200,
        borderRadius: '50%', border: '2px solid #E8A59820',
        bottom: 50, left: -60, pointerEvents: 'none',
      }} />

      {/* Botón regresar */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute', top: 20, left: 20,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-card)', border: '1px solid var(--borde)',
          borderRadius: 'var(--radius)', padding: '8px 14px',
          color: 'var(--text-sub)', fontSize: 13, cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(100,70,40,0.1)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--text)'
          e.currentTarget.style.borderColor = 'var(--primary)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(100,70,40,0.2)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--text-sub)'
          e.currentTarget.style.borderColor = 'var(--borde)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(100,70,40,0.1)'
        }}
      >
        <ArrowLeft size={15} />
        Regresar
      </button>

      {/* Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--borde)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 36px',
        width: '100%', maxWidth: 400,
        position: 'relative',
        boxShadow: '0 20px 60px rgba(100,70,40,0.15)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'var(--primary-glow)',
            border: '3px solid var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px var(--primary-glow)',
          }}>
            <img
              src={logoLP}
              alt="Liga Polotitlán"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setLogoError(true)}
            />
            <div style={{
              display: 'none', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '100%', color: 'var(--primary)',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a10 10 0 0 1 6.32 2.27L14 8H10L5.68 4.27A10 10 0 0 1 12 2z"/>
                <path d="M2.05 12H7l2 4-2.5 3.5A10 10 0 0 1 2.05 12z"/>
                <path d="M21.95 12a10 10 0 0 1-4.45 7.5L15 16l2-4h4.95z"/>
                <path d="M10 8l-2 4 2 4h4l2-4-2-4h-4z"/>
              </svg>
            </div>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 26,
            letterSpacing: 2, color: 'var(--text)', lineHeight: 1,
          }}>LIGA POLOTITLÁN</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 13, marginTop: 5 }}>
            Liga Municipal y Regional de Fútbol
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--rojo-glow)', border: '1px solid var(--rojo)',
            borderRadius: 'var(--radius)', padding: '10px 14px',
            fontSize: 13, color: 'var(--rojo)', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <AlertTriangle size={15} strokeWidth={2} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              className="form-control" type="email" name="email"
              placeholder="tu@correo.com"
              value={form.email} onChange={handleChange}
              required autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-control" type="password" name="password"
              placeholder="••••••••"
              value={form.password} onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit" className="btn btn-primary"
            disabled={loading}
            style={{ justifyContent: 'center', padding: '12px 20px', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {loading
              ? <><Loader2 size={16} className="spin" /> Ingresando...</>
              : <><Lock size={16} /> Ingresar</>
            }
          </button>
        </form>

        <div style={{
          marginTop: 20, padding: '12px 14px',
          background: 'var(--bg-input)', borderRadius: 'var(--radius)',
          fontSize: 12, color: 'var(--text-sub)', textAlign: 'center', lineHeight: 1.6,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={13} /> El público puede ver la información sin iniciar sesión.
          </span>
          <span>Para gestión, contacta al administrador de la liga.</span>
        </div>
      </div>
    </div>
  )
}