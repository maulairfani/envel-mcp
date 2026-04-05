import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, authenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  if (!authenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
