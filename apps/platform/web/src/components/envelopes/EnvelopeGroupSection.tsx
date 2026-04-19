import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { AmountText } from "@/components/shared/AmountText"
import type { EnvelopeGroupWithBudgets } from "@/hooks/useEnvelopes"
import { EnvelopeRow } from "./EnvelopeRow"

interface EnvelopeGroupSectionProps {
  data: EnvelopeGroupWithBudgets
  showNominal: boolean
  onEnvelopeClick: (envelopeId: number) => void
}

export function EnvelopeGroupSection({
  data,
  showNominal,
  onEnvelopeClick,
}: EnvelopeGroupSectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between border-t border-border bg-bg-muted px-7 py-2.5 text-left transition-colors hover:brightness-[0.98]"
        style={{
          borderBottom: open ? "none" : "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`size-3 text-text-muted transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
          <span className="font-heading text-[13px] font-bold text-text-primary">
            {data.group.name}
          </span>
        </div>
        <AmountText
          amount={data.totalAvailable}
          showNominal={showNominal}
          size="sm"
        />
      </button>

      {open &&
        data.items.map((item) => (
          <EnvelopeRow
            key={item.envelope.id}
            envelope={item.envelope}
            budget={item.budget}
            showNominal={showNominal}
            onClick={() => onEnvelopeClick(item.envelope.id)}
          />
        ))}
    </div>
  )
}
