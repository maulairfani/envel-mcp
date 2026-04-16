import { useMemo, useState } from "react"
import { Loader2, Wallet } from "lucide-react"
import { formatIDR } from "@/lib/format"
import { useAccounts } from "@/hooks/useAccounts"
import { AccountTypeGroup } from "@/components/accounts/AccountTypeGroup"
import { AccountDetailDialog } from "@/components/accounts/AccountDetailDialog"

export function AccountsPage({
  showNominal,
}: {
  showNominal: boolean
}) {
  const { accounts, groups, totalBalance, isLoading } = useAccounts()

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  )

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header: net worth summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="size-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Net worth</p>
            <p
              className={`text-lg font-heading font-semibold tabular-nums ${
                totalBalance < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-foreground"
              }`}
            >
              {showNominal ? formatIDR(totalBalance) : "••••••"}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {accounts.length} account{accounts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Account groups by type */}
      {groups.map((g) => (
        <AccountTypeGroup
          key={g.type}
          data={g}
          showNominal={showNominal}
          onAccountClick={setSelectedAccountId}
        />
      ))}

      {accounts.length === 0 && (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          No accounts yet
        </div>
      )}

      {/* Detail dialog */}
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
