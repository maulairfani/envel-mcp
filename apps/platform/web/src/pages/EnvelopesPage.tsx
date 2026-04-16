import { useCallback, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { formatIDR } from "@/lib/format"
import {
  useEnvelopes,
  applyCover,
  type Envelope,
  type EnvelopeBudget,
  type EnvelopeGroupWithBudgets,
} from "@/hooks/useEnvelopes"
import { PeriodPicker, currentPeriod } from "@/components/shared/PeriodPicker"
import { EnvelopeGroupCard } from "@/components/envelopes/EnvelopeGroupCard"
import { EnvelopeDetailDialog } from "@/components/envelopes/EnvelopeDetailDialog"

export function EnvelopesPage({
  showNominal,
}: {
  showNominal: boolean
}) {
  const [period, setPeriod] = useState(currentPeriod)
  const { groups: initialGroups, allEnvelopes, isLoading } = useEnvelopes(period)

  // Local budget overrides for cover actions
  const [overrides, setOverrides] = useState<Map<number, EnvelopeBudget>>(
    new Map()
  )

  // Local target overrides
  const [targetOverrides, setTargetOverrides] = useState<
    Map<number, Envelope["target"]>
  >(new Map())

  // Dialog state
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<number | null>(
    null
  )

  // Reset overrides when period changes
  const handlePeriodChange = useCallback((p: string) => {
    setPeriod(p)
    setOverrides(new Map())
  }, [])

  // Merge initial budgets with overrides
  const groups: EnvelopeGroupWithBudgets[] = useMemo(() => {
    if (overrides.size === 0 && targetOverrides.size === 0) return initialGroups
    return initialGroups.map((g) => {
      const items = g.items.map((item) => ({
        envelope: targetOverrides.has(item.envelope.id)
          ? { ...item.envelope, target: targetOverrides.get(item.envelope.id)! }
          : item.envelope,
        budget: overrides.get(item.envelope.id) ?? item.budget,
      }))
      return {
        ...g,
        items,
        totalAssigned: items.reduce((s, i) => s + i.budget.assigned, 0),
        totalAvailable: items.reduce((s, i) => s + i.budget.available, 0),
      }
    })
  }, [initialGroups, overrides, targetOverrides])

  // Flat list with current budgets
  const currentItems = useMemo(
    () =>
      allEnvelopes.map((item) => ({
        envelope: targetOverrides.has(item.envelope.id)
          ? { ...item.envelope, target: targetOverrides.get(item.envelope.id)! }
          : item.envelope,
        budget: overrides.get(item.envelope.id) ?? item.budget,
      })),
    [allEnvelopes, overrides, targetOverrides]
  )

  const totalAvailable = useMemo(
    () => currentItems.reduce((s, i) => s + i.budget.available, 0),
    [currentItems]
  )

  const donors = useMemo(
    () =>
      currentItems.filter(
        (i) =>
          i.budget.available > 0 && i.envelope.id !== selectedEnvelopeId
      ),
    [currentItems, selectedEnvelopeId]
  )

  const selectedItem = useMemo(
    () => currentItems.find((i) => i.envelope.id === selectedEnvelopeId) ?? null,
    [currentItems, selectedEnvelopeId]
  )

  function handleCover(fromEnvelopeId: number, amount: number) {
    if (!selectedEnvelopeId) return
    const budgetMap = new Map<number, EnvelopeBudget>()
    for (const item of currentItems) {
      budgetMap.set(item.envelope.id, item.budget)
    }
    const updated = applyCover(budgetMap, {
      fromEnvelopeId,
      toEnvelopeId: selectedEnvelopeId,
      amount,
    })
    setOverrides(updated)
  }

  function handleTargetChange(envelopeId: number, target: Envelope["target"]) {
    setTargetOverrides((prev) => {
      const next = new Map(prev)
      next.set(envelopeId, target)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <PeriodPicker period={period} onChange={handlePeriodChange} />
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header: period + summary */}
      <div className="flex items-center justify-between">
        <PeriodPicker period={period} onChange={handlePeriodChange} />
        <div className="text-right">
          <p
            className={`text-lg font-heading font-semibold tabular-nums ${
              totalAvailable < 0
                ? "text-red-600 dark:text-red-400"
                : "text-foreground"
            }`}
          >
            {showNominal ? formatIDR(totalAvailable) : "••••••"}
          </p>
          <p className="text-[11px] text-muted-foreground">Total available</p>
        </div>
      </div>

      {/* Groups */}
      {groups.map((g) => (
        <EnvelopeGroupCard
          key={g.group.id}
          data={g}
          showNominal={showNominal}
          onEnvelopeClick={setSelectedEnvelopeId}
        />
      ))}

      {/* Detail dialog */}
      <EnvelopeDetailDialog
        envelope={selectedItem?.envelope ?? null}
        budget={selectedItem?.budget ?? null}
        open={selectedEnvelopeId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEnvelopeId(null)
        }}
        donors={donors}
        onCover={handleCover}
        onTargetChange={handleTargetChange}
      />
    </div>
  )
}
