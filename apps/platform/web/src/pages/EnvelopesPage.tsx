import { useCallback, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import {
  useEnvelopes,
  applyCover,
  type Envelope,
  type EnvelopeBudget,
  type EnvelopeGroupWithBudgets,
} from "@/hooks/useEnvelopes"
import { PeriodPicker, currentPeriod } from "@/components/shared/PeriodPicker"
import { PageHeader } from "@/components/shared/PageHeader"
import { AmountText } from "@/components/shared/AmountText"
import { EnvelopeGroupSection } from "@/components/envelopes/EnvelopeGroupSection"
import { EnvelopeDetailDialog } from "@/components/envelopes/EnvelopeDetailDialog"

export function EnvelopesPage({ showNominal }: { showNominal: boolean }) {
  const [period, setPeriod] = useState(currentPeriod)
  const { groups: initialGroups, allEnvelopes, isLoading } = useEnvelopes(period)

  const [overrides, setOverrides] = useState<Map<number, EnvelopeBudget>>(
    new Map()
  )
  const [targetOverrides, setTargetOverrides] = useState<
    Map<number, Envelope["target"]>
  >(new Map())
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<number | null>(
    null
  )

  const handlePeriodChange = useCallback((p: string) => {
    setPeriod(p)
    setOverrides(new Map())
  }, [])

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
        (i) => i.budget.available > 0 && i.envelope.id !== selectedEnvelopeId
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader title="Envelopes">
        <PeriodPicker period={period} onChange={handlePeriodChange} />
      </PageHeader>

      {/* Total available strip */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-7 py-3">
        <div>
          <p className="mb-0.5 text-[11px] font-medium text-text-muted">
            Total available
          </p>
          <AmountText
            amount={totalAvailable}
            showNominal={showNominal}
            size="xl"
            tone={totalAvailable < 0 ? "auto" : "neutral"}
          />
        </div>
      </div>

      {/* Scrollable groups area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-5 animate-spin text-text-muted" />
          </div>
        ) : (
          <>
            {groups.map((g) => (
              <EnvelopeGroupSection
                key={g.group.id}
                data={g}
                showNominal={showNominal}
                onEnvelopeClick={setSelectedEnvelopeId}
              />
            ))}
            <div className="h-10" />
          </>
        )}
      </div>

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
