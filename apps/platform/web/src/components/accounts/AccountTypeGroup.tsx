import { AmountText } from "@/components/shared/AmountText"
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
  return (
    <div>
      <div className="flex items-center justify-between border-t border-border bg-bg-muted px-7 py-2.5">
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-text-secondary">
          {data.label}
        </span>
        <AmountText
          amount={data.totalBalance}
          showNominal={showNominal}
          size="sm"
          tone="neutral"
        />
      </div>

      {data.accounts.map((account) => (
        <AccountRow
          key={account.id}
          account={account}
          showNominal={showNominal}
          onClick={() => onAccountClick(account.id)}
        />
      ))}
    </div>
  )
}
