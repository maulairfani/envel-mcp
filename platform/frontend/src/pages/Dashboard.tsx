import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Layout from '../components/Layout'

interface Account { id: number; name: string; type: string; balance: number }
interface Transaction { id: number; amount: number; type: string; payee: string | null; memo: string | null; transaction_date: string }
interface Summary { period: string; income: number; expense: number; net: number }

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function Dashboard({ user, onLogout }: { user: { login: string }; onLogout: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getAccounts(), api.getTransactions(20), api.getSummary()])
      .then(([acc, txn, sum]) => { setAccounts(acc); setTransactions(txn); setSummary(sum) })
      .catch(e => setError(e.message))
  }, [])

  if (error)
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          {error === 'Database not configured. Go to Settings.' ? (
            <>Database belum dikonfigurasi. <Link to="/settings" className="underline font-medium">Buka Settings</Link> untuk mengatur.</>
          ) : error}
        </div>
      </Layout>
    )

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">

        {summary && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Income', value: summary.income, color: 'text-green-600' },
              { label: 'Expense', value: summary.expense, color: 'text-red-600' },
              { label: 'Net', value: summary.net, color: summary.net >= 0 ? 'text-green-600' : 'text-red-600' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400 mb-1">{item.label} — {summary.period}</p>
                <p className={`text-lg font-semibold ${item.color}`}>{fmt(item.value)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Rekening</h2>
          </div>
          {accounts.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">Belum ada rekening.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {accounts.map(a => (
                <div key={a.id} className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{a.type}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{fmt(a.balance)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Transaksi Terakhir</h2>
          </div>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">Belum ada transaksi.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map(t => (
                <div key={t.id} className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-900">{t.payee || t.memo || '—'}</p>
                    <p className="text-xs text-gray-400">{t.transaction_date}</p>
                  </div>
                  <p className={`text-sm font-medium ${t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-600' : 'text-gray-600'}`}>
                    {t.type === 'expense' ? '-' : ''}{fmt(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}
