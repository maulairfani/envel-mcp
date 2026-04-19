import { AmountText } from "@/components/shared/AmountText"
import type { Account } from "@/hooks/useAccounts"

const TYPE_LABELS: Record<string, string> = {
  bank: "Bank",
  ewallet: "E-Wallet",
  cash: "Cash",
}

const TYPE_ICONS: Record<string, string> = {
  bank: "🏦",
  ewallet: "📱",
  cash: "💵",
}

interface AccountRowProps {
  account: Account
  showNominal: boolean
  onClick: () => void
}

export function AccountRow({ account, showNominal, onClick }: AccountRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3.5 border-b border-border-muted px-7 py-3 text-left transition-colors hover:bg-bg-muted"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-bg-muted text-lg leading-none">
        {TYPE_ICONS[account.type] ?? "💰"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          {account.name}
        </p>
        <p className="mt-0.5 text-[11.5px] text-text-muted">
          {TYPE_LABELS[account.type]}
        </p>
      </div>
      <AmountText
        amount={account.balance}
        showNominal={showNominal}
        size="md"
        tone={account.balance < 0 ? "auto" : "neutral"}
      />
    </button>
  )
}
