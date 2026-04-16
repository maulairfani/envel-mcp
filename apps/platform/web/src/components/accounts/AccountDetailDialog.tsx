import { formatIDR } from "@/lib/format"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Account } from "@/hooks/useAccounts"

const TYPE_LABELS: Record<string, string> = {
  bank: "Bank Account",
  ewallet: "E-Wallet",
  cash: "Cash",
}

interface AccountDetailDialogProps {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
  showNominal: boolean
}

export function AccountDetailDialog({
  account,
  open,
  onOpenChange,
  showNominal,
}: AccountDetailDialogProps) {
  if (!account) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{account.name}</DialogTitle>
          <DialogDescription>{TYPE_LABELS[account.type]}</DialogDescription>
        </DialogHeader>

        {/* Balance */}
        <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">Balance</span>
          <span
            className={`text-lg font-heading font-semibold tabular-nums ${
              account.balance < 0
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {showNominal ? formatIDR(account.balance) : "••••••"}
          </span>
        </div>

        {/* Account info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-[13px] text-muted-foreground">Type</span>
          <span className="text-right text-[13px] font-medium capitalize">
            {account.type}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
