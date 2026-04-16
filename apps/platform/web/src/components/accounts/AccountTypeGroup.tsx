import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { formatIDR } from "@/lib/format"
import { Card } from "@/components/ui/card"
import type { AccountTypeGroup as AccountTypeGroupData } from "@/hooks/useAccounts"
import { AccountRow } from "./AccountRow"

interface AccountTypeGroupProps {
  data: AccountTypeGroupData
  showNominal: boolean
  onAccountClick: (accountId: number) => void
}

export function AccountTypeGroup({
  data,
  showNominal,
  onAccountClick,
}: AccountTypeGroupProps) {
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
          {data.label}
        </span>

        <span className="shrink-0 text-right text-[12px] font-semibold tabular-nums text-foreground">
          {showNominal ? formatIDR(data.totalBalance) : "•••••"}
        </span>
      </button>

      {/* Account rows */}
      {open && (
        <div className="border-t border-border">
          {data.accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              showNominal={showNominal}
              onClick={() => onAccountClick(account.id)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
