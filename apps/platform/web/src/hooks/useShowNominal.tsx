import { createContext, useCallback, useContext, useState, type ReactNode } from "react"

interface ShowNominalContextValue {
  showNominal: boolean
  toggle: () => void
  setShowNominal: (v: boolean) => void
}

const ShowNominalContext = createContext<ShowNominalContextValue | null>(null)

export function ShowNominalProvider({ children }: { children: ReactNode }) {
  const [showNominal, setShowNominalState] = useState(
    () => localStorage.getItem("envel-show-nominal") === "true"
  )

  const setShowNominal = useCallback((v: boolean) => {
    setShowNominalState(v)
    localStorage.setItem("envel-show-nominal", String(v))
  }, [])

  const toggle = useCallback(() => {
    setShowNominalState((v) => {
      const next = !v
      localStorage.setItem("envel-show-nominal", String(next))
      return next
    })
  }, [])

  return (
    <ShowNominalContext.Provider value={{ showNominal, toggle, setShowNominal }}>
      {children}
    </ShowNominalContext.Provider>
  )
}

export function useShowNominal(): ShowNominalContextValue {
  const ctx = useContext(ShowNominalContext)
  if (!ctx) throw new Error("useShowNominal must be used inside ShowNominalProvider")
  return ctx
}
