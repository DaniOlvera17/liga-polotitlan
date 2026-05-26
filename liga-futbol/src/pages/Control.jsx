import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLiga } from '../context/LigaContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import Tabla from '../components/Tabla'
import { Pencil, Trash2, Plus, Save, Search, UserCheck, UserX, ShieldCheck } from 'lucide-react'

const API = 'http://104.197.141.245:8000'  // ← cambia a tu IP de Google Cloud en producción

const VACIO = { nombre: '', email: '', password: '', rol: 'arbitro', equipoId: null }

const rolBadge = (rol) => {
  const map = {
    admin:    { cls: 'badge-primary',   label: 'Admin'    },
    delegado: { cls: 'badge-verde',     label: 'Delegado' },
    arbitro:  { cls: 'badge-amarillo',  label: 'Árbitro'  },
  }
  const m = map[rol] ?? { cls: 'badge-gris', label: rol }
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}

const activoBadge = (activo) =>
  activo
    ? <span className="badge badge-verde">● Activo</span>
    : <span className="badge badge-gris">Inactivo</span>

export default function Control() {
  const { isAdmin } = useAuth()
  const { equipos } = useLiga()
  const { addToast } = useToast()

  const [usuarios, setUsuarios]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filtroRol, setFiltroRol] = useState('todos')
  const [busqueda, setBusqueda]   = useState('')
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState(VACIO)
  const [editando, setEditando]   = useState(null)
  const [confirm, setConfirm]     = useState(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/usuarios`)
      setUsuarios(await res.json())
    } catch {
      addToast('Error al cargar usuarios', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  if (!isAdmin) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-sub)' }}>
      No tienes permiso para ver esta página.
    </div>
  )

  // ── Contadores ──
  const totalArbitros  = usuarios.filter(u => u.rol === 'arbitro').length
  const totalDelegados = usuarios.filter(u => u.rol === 'delegado').length
  const totalActivos   = usuarios.filter(u => u.activo).length

  // ── Filtrado ──
  const usuariosFiltrados = usuarios.filter(u => {
    const coincideRol = filtroRol === 'todos' || u.rol === filtroRol
    const coincideBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase())
    return coincideRol && coincideBusqueda
  })

  // ── Abrir modal ──
  const abrirNuevo = () => {
    setForm(VACIO)
    setEditando(null)
    setModal(true)
  }

  const abrirEditar = (u) => {
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol, equipoId: u.equipoId })
    setEditando(u.id)
    setModal(true)
  }

  // ── Guardar ──
  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.email.trim()) {
      addToast('Nombre y email son obligatorios', 'error'); return
    }
    if (!editando && !form.password.trim()) {
      addToast('La contraseña es obligatoria para usuarios nuevos', 'error'); return
    }
    if (form.rol === 'delegado' && !form.equipoId) {
      addToast('El delegado debe tener un equipo asignado', 'error'); return
    }

    const url    = editando ? `${API}/usuarios/${editando}` : `${API}/usuarios`
    const method = editando ? 'PUT' : 'POST'
    const body   = { ...form, equipoId: form.rol === 'delegado' ? Number(form.equipoId) : null }

    try {
      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) { addToast(data.error || 'Error al guardar', 'error'); return }
      addToast(editando ? 'Usuario actualizado' : 'Usuario creado', 'success')
      setModal(false)
      cargar()
    } catch {
      addToast('Error de conexión', 'error')
    }
  }

  // ── Toggle activo ──
  const toggleActivo = async (u) => {
    await fetch(`${API}/usuarios/${u.id}/toggle`, { method: 'PUT' })
    addToast(u.activo ? `${u.nombre} desactivado` : `${u.nombre} activado`, 'info')
    cargar()
  }

  // ── Eliminar ──
  const handleEliminar = async () => {
    await fetch(`${API}/usuarios/${confirm.id}`, { method: 'DELETE' })
    addToast('Usuario eliminado', 'info')
    setConfirm(null)
    cargar()
  }

  // ── Columnas de la tabla ──
  const columnas = [
    {
      label: 'Usuario', key: 'nombre',
      render: u => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: u.rol === 'arbitro' ? 'var(--verde)' : u.rol === 'delegado' ? 'var(--primary)' : 'var(--amarillo)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0,
            fontFamily: 'var(--font-display)',
          }}>
            {u.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{u.nombre}</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>{u.email}</div>
          </div>
        </div>
      )
    },
    {
      label: 'Rol', key: 'rol',
      render: u => rolBadge(u.rol)
    },
    {
      label: 'Equipo', key: 'equipoId',
      render: u => {
        const eq = equipos.find(e => e.id === u.equipoId)
        return eq ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: eq.color, display: 'inline-block' }} />
            {eq.nombre}
          </span>
        ) : <span style={{ color: 'var(--text-light)' }}>—</span>
      }
    },
    {
      label: 'Estado', key: 'activo',
      render: u => activoBadge(u.activo)
    },
    {
      label: 'Acciones', key: '_acc', align: 'right',
      render: u => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => abrirEditar(u)}>
            <Pencil size={12} /> Editar
          </button>
          <button
            className={`btn btn-sm ${u.activo ? 'btn-secondary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 4,
              color: u.activo ? 'var(--amarillo-dark, #9A7B20)' : 'var(--verde)' }}
            onClick={() => toggleActivo(u)}>
            {u.activo ? <><UserX size={12} /> Desactivar</> : <><UserCheck size={12} /> Activar</>}
          </button>
          {u.rol !== 'admin' && (
            <button className="btn btn-danger btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={() => setConfirm(u)}>
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <div>
      {/* ── Encabezado ── */}
      <div className="page-header">
        <div>
          <h1>Control de Usuarios</h1>
          <p className="page-header-sub">Gestión de árbitros y delegados del sistema</p>
        </div>
        <button className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={abrirNuevo}>
          <Plus size={14} /> Nuevo Usuario
        </button>
      </div>

      {/* ── Tarjetas resumen ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Árbitros',  value: totalArbitros,  icon: <ShieldCheck size={20} />, color: 'var(--verde)' },
          { label: 'Delegados', value: totalDelegados, icon: <UserCheck   size={20} />, color: 'var(--primary)' },
          { label: 'Activos',   value: totalActivos,   icon: <UserCheck   size={20} />, color: 'var(--amarillo)' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, margin: 0 }}>
            <span style={{ color: c.color }}>{c.icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: c.color, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div className="card">
        <div className="search-bar" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: 1 }}>
            <span className="icon" style={{ display: 'flex', alignItems: 'center' }}>
              <Search size={15} />
            </span>
            <input className="form-control" placeholder="Buscar por nombre o email..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { val: 'todos',    label: 'Todos'     },
              { val: 'arbitro',  label: 'Árbitros'  },
              { val: 'delegado', label: 'Delegados' },
            ].map(f => (
              <button key={f.val}
                className={`btn btn-sm ${filtroRol === f.val ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFiltroRol(f.val)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading
          ? <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: 40 }}>Cargando usuarios...</p>
          : <Tabla columnas={columnas} datos={usuariosFiltrados} emptyMsg="No se encontraron usuarios" />
        }
      </div>

      {/* ── Modal Crear/Editar ── */}
      <Modal
        open={modal} onClose={() => setModal(false)}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {editando ? <><Pencil size={16} /> Editar Usuario</> : <><Plus size={16} /> Nuevo Usuario</>}
          </span>
        }
        footer={
          <>
            <button className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={handleGuardar}>
              {editando ? <><Save size={14} /> Guardar</> : <><Plus size={14} /> Crear</>}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <input className="form-control" placeholder="Ej: Carlos López"
            value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" placeholder="correo@ejemplo.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">
            Contraseña {editando && <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(dejar vacío para no cambiar)</span>}
          </label>
          <input className="form-control" type="password"
            placeholder={editando ? '••••••' : 'Contraseña'}
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">Rol</label>
          <select className="form-control" value={form.rol}
            onChange={e => setForm(f => ({ ...f, rol: e.target.value, equipoId: null }))}>
            <option value="arbitro">Árbitro</option>
            <option value="delegado">Delegado</option>
          </select>
        </div>

        {form.rol === 'delegado' && (
          <div className="form-group">
            <label className="form-label">Equipo asignado</label>
            <select className="form-control"
              value={form.equipoId ?? ''}
              onChange={e => setForm(f => ({ ...f, equipoId: e.target.value ? Number(e.target.value) : null }))}>
              <option value="">Selecciona un equipo...</option>
              {equipos.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </Modal>

      {/* ── Confirmar eliminar ── */}
      <Modal
        open={!!confirm} onClose={() => setConfirm(null)}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--rojo)' }}>
            <Trash2 size={16} /> ¿Eliminar usuario?
          </span>
        }
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
            <button className="btn btn-danger"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={handleEliminar}>
              <Trash2 size={14} /> Eliminar
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-sub)' }}>
          Se eliminará permanentemente a <strong>{confirm?.nombre}</strong>. Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  )
}