import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAccounts } from "@/hooks/useAccounts"
import { PageHeader } from "@/components/shared/PageHeader"
import { AmountText } from "@/components/shared/AmountText"
import { AccountTypeGroup } from "@/components/accounts/AccountTypeGroup"
import { AccountDetailDialog } from "@/components/accounts/AccountDetailDialog"

export function AccountsPage({ showNominal }: { showNominal: boolean }) {
  const { accounts, groups, totalBalance, isLoading } = useAccounts()
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  )

  const accountCount = accounts.length

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title="Accounts"
        right={
          <span className="text-xs font-medium text-text-muted">
            {accountCount} account{accountCount !== 1 ? "s" : ""}
          </span>
        }
      />

      {/* Net worth strip */}
      <div className="flex-shrink-0 border-b border-border bg-card px-7 py-4">
        <p className="mb-1 text-[11.5px] font-medium text-text-muted">Net worth</p>
        <AmountText
          amount={totalBalance}
          showNominal={showNominal}
          size="2xl"
          tone={totalBalance < 0 ? "auto" : "neutral"}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-5 animate-spin text-text-muted" />
          </div>
        ) : accountCount === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-text-muted">
            No accounts yet
          </div>
        ) : (
          <>
            {groups.map((g) => (
              <AccountTypeGroup
                key={g.type}
                data={g}
                showNominal={showNominal}
                onAccountClick={setSelectedAccountId}
              />
            ))}
            <div className="h-10" />
          </>
        )}
      </div>

      <AccountDetailDialog
        account={selectedAccount}
        open={selectedAccountId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAccountId(null)
        }}
        showNominal={showNominal}
      />
    </div>
  )
}
