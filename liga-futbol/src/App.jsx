import { BrowserRouter } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import { LigaProvider }  from './context/LigaContext'
import { ToastProvider } from './context/ToastContext'
import AppRouter         from './routes/AppRouter'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LigaProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </LigaProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
