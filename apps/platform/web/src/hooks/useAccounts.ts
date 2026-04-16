import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export type AccountType = "bank" | "ewallet" | "cash"

export interface Account {
  id: number
  name: string
  type: AccountType
  balance: number
}

export interface AccountTypeGroup {
  type: AccountType
  label: string
  accounts: Account[]
  totalBalance: number
}

interface AccountsResponse {
  accounts: Account[]
  total: number
}

const TYPE_LABELS: Record<AccountType, string> = {
  bank: "Bank Accounts",
  ewallet: "E-Wallets",
  cash: "Cash",
}

export function useAccounts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api<AccountsResponse>("/api/accounts"),
  })

  const accounts = data?.accounts ?? []
  const totalBalance = data?.total ?? 0

  const groups: AccountTypeGroup[] = (
    ["bank", "ewallet", "cash"] as AccountType[]
  )
    .map((type) => {
      const accs = accounts.filter((a) => a.type === type)
      return {
        type,
        label: TYPE_LABELS[type],
        accounts: accs,
        totalBalance: accs.reduce((s, a) => s + a.balance, 0),
      }
    })
    .filter((g) => g.accounts.length > 0)

  return { accounts, groups, totalBalance, isLoading, error }
}
