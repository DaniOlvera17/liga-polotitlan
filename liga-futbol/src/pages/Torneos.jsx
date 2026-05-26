import { useState } from 'react'
import { useLiga } from '../context/LigaContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import Tabla from '../components/Tabla'
import { Pencil, Trash2, Plus, Save, PauseCircle, Search } from 'lucide-react'

const VACIO = { nombre: '', categoria: 'Primera Fuerza', temporada: 'Apertura', estado: 'activo', año: new Date().getFullYear() }
const CATEGORIAS = ['Primera Fuerza', 'Segunda Fuerza', 'Femenil', 'Veteranos', 'Sub-20']
const TEMPORADAS = ['Apertura', 'Clausura']

const estadoBadge = (estado) => {
  const map = {
    activo:     { cls: 'badge-verde',    label: '● Activo'   },
    finalizado: { cls: 'badge-gris',     label: 'Finalizado' },
    pausado:    { cls: 'badge-amarillo', label: <span style={{ display:'flex', alignItems:'center', gap:4 }}><PauseCircle size={11}/>Pausado</span> },
  }
  const m = map[estado] ?? { cls: 'badge-gris', label: estado }
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}

export default function Torneos() {
  const { torneos, agregarTorneo, editarTorneo, eliminarTorneo, equiposByTorneo } = useLiga()
  const { isAdmin } = useAuth()
  const { addToast } = useToast()
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(VACIO)
  const [editando, setEditando] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [confirm, setConfirm]   = useState(null)

  const abrirNuevo  = () => { setForm(VACIO); setEditando(null); setModal(true) }
  const abrirEditar = (t) => { setForm({ ...t }); setEditando(t.id); setModal(true) }

  const handleGuardar = () => {
    if (!form.nombre.trim()) { addToast('El nombre es requerido', 'error'); return }
    if (editando) {
      editarTorneo({ ...form, id: editando })
      addToast('Torneo actualizado', 'success')
    } else {
      agregarTorneo(form)
      addToast('Torneo creado', 'success')
    }
    setModal(false)
  }

  const torneosFiltrados = torneos.filter(t =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.categoria.toLowerCase().includes(busqueda.toLowerCase())
  )

  const columnas = [
    { label: 'Torneo', key: 'nombre', render: t => (
      <div>
        <div style={{ fontWeight: 700 }}>{t.nombre}</div>
        <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
          {t.categoria} · {t.temporada} {t.año}
        </div>
      </div>
    )},
    { label: 'Categoría', key: 'categoria', render: t => (
      <span className="badge badge-primary">{t.categoria}</span>
    )},
    { label: 'Estado', key: 'estado', render: t => estadoBadge(t.estado) },
    { label: 'Equipos', key: 'equipos', align: 'center', render: t => (
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)' }}>
        {equiposByTorneo(t.id).length}
      </span>
    )},
    ...(isAdmin ? [{
      label: 'Acciones', key: '_acc', align: 'right', render: t => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={() => abrirEditar(t)}>
            <Pencil size={12} /> Editar
          </button>
          <button className="btn btn-danger btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={() => setConfirm(t.id)}>
            <Trash2 size={12} />
          </button>
        </div>
      )
    }] : []),
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Torneos</h1>
          <p className="page-header-sub">{torneos.length} torneos registrados</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={abrirNuevo}>
            <Plus size={14} /> Nuevo Torneo
          </button>
        )}
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="icon" style={{ display: 'flex', alignItems: 'center' }}>
              <Search size={15} />
            </span>
            <input className="form-control" placeholder="Buscar torneo..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
        </div>
        <Tabla columnas={columnas} datos={torneosFiltrados} emptyMsg="No se encontraron torneos" />
      </div>

      {/* Modal Form */}
      <Modal
        open={modal} onClose={() => setModal(false)}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {editando ? <><Pencil size={16} /> Editar Torneo</> : <><Plus size={16} /> Nuevo Torneo</>}
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
          <label className="form-label">Nombre del Torneo</label>
          <input className="form-control" placeholder="Ej: Varonil 1ra Fuerza — Apertura 2026"
            value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select className="form-control" value={form.categoria}
            onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Temporada</label>
            <select className="form-control" value={form.temporada}
              onChange={e => setForm(f => ({ ...f, temporada: e.target.value }))}>
              {TEMPORADAS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Año</label>
            <input className="form-control" type="number" min="2020" max="2030"
              value={form.año} onChange={e => setForm(f => ({ ...f, año: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-control" value={form.estado}
              onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
              <option value="activo">Activo</option>
              <option value="pausado">Pausado</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Confirmar eliminar */}
      <Modal
        open={!!confirm} onClose={() => setConfirm(null)}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--rojo)' }}>
            <Trash2 size={16} /> ¿Eliminar Torneo?
          </span>
        }
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
            <button className="btn btn-danger"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => {
                eliminarTorneo(confirm); addToast('Torneo eliminado', 'info'); setConfirm(null)
              }}>
              <Trash2 size={14} /> Eliminar
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-sub)' }}>Esta acción eliminará el torneo y no se puede deshacer.</p>
      </Modal>
    </div>
  )
}