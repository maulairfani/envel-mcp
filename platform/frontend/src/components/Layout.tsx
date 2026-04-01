import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

interface Props {
  user: { login: string }
  onLogout: () => void
  children: React.ReactNode
}

export default function Layout({ user, onLogout, children }: Props) {
  const navigate = useNavigate()

  const logout = async () => {
    await api.logout()
    onLogout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-900">Rejeki</span>
            <nav className="flex gap-4 text-sm">
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-900">Dashboard</Link>
              <Link to="/settings" className="text-gray-500 hover:text-gray-900">Settings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>@{user.login}</span>
            <button onClick={logout} className="hover:text-gray-900">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
