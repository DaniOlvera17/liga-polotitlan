import { Outlet } from 'react-router-dom'
import Navbar  from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useState } from 'react'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar open={sidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
