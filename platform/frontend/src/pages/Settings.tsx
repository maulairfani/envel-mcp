import { useEffect, useState } from 'react'
import { api } from '../api'
import Layout from '../components/Layout'

export default function Settings({ user, onLogout }: { user: { login: string }; onLogout: () => void }) {
  const [tursoUrl, setTursoUrl] = useState('')
  const [tursoToken, setTursoToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.getSettings().then(d => { setTursoUrl(d.turso_url || ''); setTursoToken(d.turso_token || '') })
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMessage(''); setError('')
    try {
      await api.saveSettings({ turso_url: tursoUrl, turso_token: tursoToken })
      setMessage('Tersimpan.')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="max-w-lg">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Settings</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Database (Turso)</h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Database URL</label>
              <input
                type="text"
                value={tursoUrl}
                onChange={e => setTursoUrl(e.target.value)}
                placeholder="libsql://your-db.turso.io"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Auth Token</label>
              <input
                type="password"
                value={tursoToken}
                onChange={e => setTursoToken(e.target.value)}
                placeholder="eyJ..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
