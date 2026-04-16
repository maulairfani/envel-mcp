import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import {
  useTransactions,
  filterTransactions,
  groupByDay,
} from "@/hooks/useTransactions"
import {
  TransactionFilters,
  type FilterState,
} from "@/components/transactions/TransactionFilters"
import {
  PeriodPicker,
  currentPeriod,
} from "@/components/shared/PeriodPicker"
import { TransactionDayGroup } from "@/components/transactions/TransactionDayGroup"
import { Card, CardContent } from "@/components/ui/card"

const DEFAULT_FILTERS: FilterState = {
  type: "all",
  search: "",
  account: "all",
  envelope: "all",
}

export function TransactionsPage({
  showNominal,
}: {
  showNominal: boolean
}) {
  const [period, setPeriod] = useState(currentPeriod)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const { transactions, accounts, envelopes, isLoading } =
    useTransactions(period)

  const filtered = useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters]
  )

  const days = useMemo(() => groupByDay(filtered), [filtered])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <PeriodPicker period={period} onChange={setPeriod} />
      </div>
      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        accounts={accounts}
        envelopes={envelopes}
        resultCount={filtered.length}
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : days.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="divide-y divide-border">
              {days.map((group) => (
                <TransactionDayGroup
                  key={group.date}
                  group={group}
                  showNominal={showNominal}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
