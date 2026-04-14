import { useState } from "react"
import { formatIDR } from "@/lib/format"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Envelope, EnvelopeBudget, TargetType } from "@/hooks/useEnvelopes"

const TARGET_TYPE_LABELS: Record<TargetType, string> = {
  monthly_spending: "Monthly spending limit",
  monthly_savings: "Save per month",
  savings_balance: "Savings goal",
  needed_by_date: "Needed by date",
}

const TARGET_TYPE_OPTIONS: { value: TargetType | "none"; label: string }[] = [
  { value: "none", label: "No target" },
  { value: "monthly_spending", label: "Monthly spending limit" },
  { value: "monthly_savings", label: "Save per month" },
  { value: "savings_balance", label: "Savings goal" },
  { value: "needed_by_date", label: "Needed by date" },
]

interface EnvelopeDetailDialogProps {
  envelope: Envelope | null
  budget: EnvelopeBudget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Donors with positive available */
  donors: { envelope: Envelope; budget: EnvelopeBudget }[]
  onCover: (fromEnvelopeId: number, amount: number) => void
  onTargetChange: (
    envelopeId: number,
    target: Envelope["target"]
  ) => void
}

export function EnvelopeDetailDialog({
  envelope,
  budget,
  open,
  onOpenChange,
  donors,
  onCover,
  onTargetChange,
}: EnvelopeDetailDialogProps) {
  if (!envelope || !budget) return null

  const funded = budget.carryover + budget.assigned
  const overspent = budget.available < 0
  const deficit = Math.abs(budget.available)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <span className="mr-2">{envelope.icon}</span>
            {envelope.name}
          </DialogTitle>
          <DialogDescription>
            Budget details for this period
          </DialogDescription>
        </DialogHeader>

        {/* Budget breakdown */}
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <BudgetLine label="Carryover" value={budget.carryover} />
            <BudgetLine label="Assigned" value={budget.assigned} />
            <BudgetLine label="Funded" value={funded} muted />
            <BudgetLine
              label="Activity"
              value={-budget.activity}
              color="text-red-600 dark:text-red-400"
            />
          </div>

          <div className="border-t pt-3 flex items-center justify-between">
            <span className="text-sm font-medium">Available</span>
            <span
              className={`text-lg font-heading font-semibold tabular-nums ${
                overspent
                  ? "text-red-600 dark:text-red-400"
                  : budget.available > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
              }`}
            >
              {formatIDR(budget.available)}
            </span>
          </div>
        </div>

        {/* Cover overspent */}
        {overspent && (
          <div className="border-t pt-3">
            <p className="text-[13px] font-medium text-red-600 dark:text-red-400 mb-2">
              {formatIDR(deficit)} overspent — cover from:
            </p>
            {donors.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No envelopes with available balance.
              </p>
            ) : (
              <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto">
                {donors.map((donor) => {
                  const canCover = Math.min(donor.budget.available, deficit)
                  return (
                    <button
                      key={donor.envelope.id}
                      onClick={() => onCover(donor.envelope.id, canCover)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted"
                    >
                      <span className="text-sm">{donor.envelope.icon}</span>
                      <span className="flex-1 min-w-0 truncate text-[12px] font-medium">
                        {donor.envelope.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatIDR(donor.budget.available)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Target (editable) */}
        <div className="border-t pt-3">
          <TargetEditor
            envelope={envelope}
            onChange={(target) => onTargetChange(envelope.id, target)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Helpers ──────────────────────────────────────────────

function BudgetLine({
  label,
  value,
  color,
  muted,
}: {
  label: string
  value: number
  color?: string
  muted?: boolean
}) {
  return (
    <>
      <span className={`text-[13px] ${muted ? "text-muted-foreground" : ""}`}>
        {label}
      </span>
      <span
        className={`text-right text-[13px] font-medium tabular-nums ${
          color ?? (muted ? "text-muted-foreground" : "")
        }`}
      >
        {formatIDR(value)}
      </span>
    </>
  )
}

function TargetEditor({
  envelope,
  onChange,
}: {
  envelope: Envelope
  onChange: (target: Envelope["target"]) => void
}) {
  const [targetType, setTargetType] = useState<TargetType | "none">(
    envelope.target?.type ?? "none"
  )
  const [amount, setAmount] = useState(
    envelope.target?.amount?.toString() ?? ""
  )
  const [deadline, setDeadline] = useState(
    envelope.target?.deadline ?? ""
  )

  function handleTypeChange(value: string) {
    const t = value as TargetType | "none"
    setTargetType(t)
    if (t === "none") {
      onChange(null)
    } else {
      onChange({
        type: t,
        amount: Number(amount) || 0,
        deadline: t === "needed_by_date" ? deadline : undefined,
      })
    }
  }

  function handleAmountBlur() {
    if (targetType === "none") return
    onChange({
      type: targetType,
      amount: Number(amount) || 0,
      deadline: targetType === "needed_by_date" ? deadline : undefined,
    })
  }

  function handleDeadlineBlur() {
    if (targetType !== "needed_by_date") return
    onChange({
      type: targetType,
      amount: Number(amount) || 0,
      deadline,
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium">Target</label>
      <select
        value={targetType}
        onChange={(e) => handleTypeChange(e.target.value)}
        className="h-8 rounded-lg border border-input bg-background px-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {TARGET_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {targetType !== "none" && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[11px] text-muted-foreground">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={handleAmountBlur}
              placeholder="0"
              className="mt-0.5 h-8 w-full rounded-lg border border-input bg-background px-2 text-[13px] tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
          {targetType === "needed_by_date" && (
            <div className="flex-1">
              <label className="text-[11px] text-muted-foreground">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                onBlur={handleDeadlineBlur}
                className="mt-0.5 h-8 w-full rounded-lg border border-input bg-background px-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
