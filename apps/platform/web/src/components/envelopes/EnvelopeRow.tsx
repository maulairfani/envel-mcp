import { formatIDR } from "@/lib/format"
import type { Envelope, EnvelopeBudget } from "@/hooks/useEnvelopes"

function targetLabel(envelope: Envelope): string | null {
  const t = envelope.target
  if (!t) return null
  switch (t.type) {
    case "monthly_spending":
      return `${formatIDR(t.amount)}/mo`
    case "monthly_savings":
      return `Save ${formatIDR(t.amount)}/mo`
    case "savings_balance":
      return `Goal: ${formatIDR(t.amount)}`
    case "needed_by_date": {
      const d = t.deadline
        ? new Date(t.deadline).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "?"
      return `${formatIDR(t.amount)} by ${d}`
    }
  }
}

function barColor(available: number, funded: number): string {
  if (available <= 0) return "bg-red-500 dark:bg-red-400"
  const ratio = available / funded
  if (ratio < 0.1) return "bg-red-500 dark:bg-red-400"
  if (ratio < 0.5) return "bg-amber-500 dark:bg-amber-400"
  return "bg-emerald-500 dark:bg-emerald-400"
}

interface EnvelopeRowProps {
  envelope: Envelope
  budget: EnvelopeBudget
  showNominal: boolean
  onClick: () => void
}

export function EnvelopeRow({
  envelope,
  budget,
  showNominal,
  onClick,
}: EnvelopeRowProps) {
  const funded = budget.carryover + budget.assigned
  const ratio = funded > 0 ? Math.max(0, budget.available / funded) : 0
  const overspent = budget.available < 0
  const target = targetLabel(envelope)

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 w-full text-left transition-colors hover:bg-muted/50 cursor-pointer"
    >
      {/* Icon */}
      <span className="text-base shrink-0 leading-none">{envelope.icon}</span>

      {/* Name + target + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-medium truncate">
            {envelope.name}
          </span>
          {target && (
            <span className="text-[11px] text-muted-foreground shrink-0">
              {target}
            </span>
          )}
        </div>

        {/* Budget bar */}
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${barColor(budget.available, funded)}`}
            style={{ width: `${Math.min(ratio * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Available */}
      <div className="shrink-0 text-right">
        <p
          className={`text-[13px] font-medium tabular-nums ${
            overspent
              ? "text-red-600 dark:text-red-400"
              : budget.available > 0
                ? "text-foreground"
                : "text-muted-foreground"
          }`}
        >
          {showNominal ? formatIDR(budget.available) : "•••••"}
        </p>
      </div>
    </button>
  )
}
