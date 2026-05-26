import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout   from '../layouts/MainLayout'
import PrivateRoute from '../components/PrivateRoute'
import Login        from '../pages/Login'
import Dashboard    from '../pages/Dashboard'
import Torneos      from '../pages/Torneos'
import Equipos      from '../pages/Equipos'
import Jugadores    from '../pages/Jugadores'
import Partidos     from '../pages/Partidos'
import Posiciones   from '../pages/Posiciones'
import Goleadores   from '../pages/Goleadores'
import Admin        from '../pages/Admin'
import MisPartidos  from '../pages/MisPartidos'

export default function AppRouter() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas con layout — accesibles sin login (público) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="torneos"    element={<Torneos />} />
        <Route path="equipos"    element={<Equipos />} />
        <Route path="jugadores"  element={<Jugadores />} />
        <Route path="partidos"   element={<Partidos />} />
        <Route path="posiciones" element={<Posiciones />} />
        <Route path="goleadores" element={<Goleadores />} />

        {/* Solo árbitro: mis partidos asignados */}
        <Route path="mis-partidos" element={
          <PrivateRoute soloArbitro>
            <MisPartidos />
          </PrivateRoute>
        } />

        {/* Solo admin */}
        <Route path="admin" element={
          <PrivateRoute soloAdmin>
            <Admin />
          </PrivateRoute>
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
