import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import DashboardLayout from './components/DashboardLayout'
import FieldApp from './components/FieldApp'
import OwnersPage from './components/OwnersPage'

function App() {
  return (
    <div className="app-shell">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/field" element={<FieldApp />} />
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/owners" element={<OwnersPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
