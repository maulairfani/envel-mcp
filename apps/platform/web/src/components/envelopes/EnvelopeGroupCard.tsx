import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { formatIDR } from "@/lib/format"
import { Card } from "@/components/ui/card"
import type { EnvelopeGroupWithBudgets } from "@/hooks/useEnvelopes"
import { EnvelopeRow } from "./EnvelopeRow"

interface EnvelopeGroupCardProps {
  data: EnvelopeGroupWithBudgets
  showNominal: boolean
  onEnvelopeClick: (envelopeId: number) => void
}

export function EnvelopeGroupCard({
  data,
  showNominal,
  onEnvelopeClick,
}: EnvelopeGroupCardProps) {
  const [open, setOpen] = useState(true)

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full px-4 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${
            open ? "" : "-rotate-90"
          }`}
        />
        <span className="flex-1 text-[13px] font-heading font-semibold">
          {data.group.name}
        </span>

        <span
          className={`shrink-0 text-right text-[12px] font-semibold tabular-nums ${
            data.totalAvailable < 0
              ? "text-red-600 dark:text-red-400"
              : "text-foreground"
          }`}
        >
          {showNominal ? formatIDR(data.totalAvailable) : "•••••"}
        </span>
      </button>

      {/* Envelope rows */}
      {open && (
        <div className="border-t border-border">
          {data.items.map((item) => (
            <EnvelopeRow
              key={item.envelope.id}
              envelope={item.envelope}
              budget={item.budget}
              showNominal={showNominal}
              onClick={() => onEnvelopeClick(item.envelope.id)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
