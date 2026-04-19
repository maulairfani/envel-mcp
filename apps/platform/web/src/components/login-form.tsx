import { useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { LogoMark } from "@/components/shared/LogoMark"
import { useAuth } from "@/hooks/useAuth"

export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await login(username, password)
    if (!result.ok) setError(result.error ?? "Login failed")
    setLoading(false)
  }

  return (
    <div className="flex w-[380px] max-w-full flex-col items-center">
      {/* Logo + title */}
      <div className="mb-7 flex flex-col items-center gap-3">
        <div
          className="flex size-[52px] items-center justify-center rounded-2xl text-xl font-extrabold text-white"
          style={{
            background: "var(--brand)",
            boxShadow: "0 8px 24px oklch(50% 0.16 145 / 0.35)",
          }}
        >
          <LogoMark size={52} className="rounded-2xl" />
        </div>
        <div className="text-center">
          <div className="font-heading text-[22px] font-extrabold text-text-primary">
            Welcome back
          </div>
          <div className="mt-1 text-[13.5px] text-text-muted">
            Sign in to your Envel account
          </div>
        </div>
      </div>

      {/* Form card */}
      <div
        className="w-full rounded-[18px] border border-border bg-card p-7 pb-6"
        style={{ boxShadow: "var(--shadow-md, 0 4px 16px rgb(0 0 0 / 0.1))" }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-[12.5px] font-semibold text-text-secondary"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Your username"
              className="w-full rounded-[10px] border-[1.5px] border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder transition-colors focus:border-brand focus:outline-none disabled:opacity-60"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[12.5px] font-semibold text-text-secondary"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              className="w-full rounded-[10px] border-[1.5px] border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder transition-colors focus:border-brand focus:outline-none disabled:opacity-60"
            />
          </div>

          {error && (
            <p className="text-[12.5px] font-medium text-[color:var(--danger)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[10px] py-2.5 text-[14.5px] font-bold text-white transition-all disabled:cursor-wait"
            style={{
              background: loading ? "var(--brand-hover)" : "var(--brand)",
              boxShadow: "0 2px 8px oklch(50% 0.16 145 / 0.3)",
            }}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}
