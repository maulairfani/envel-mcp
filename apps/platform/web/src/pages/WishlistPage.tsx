import { useMemo, useState } from "react"
import { Heart } from "lucide-react"
import { formatIDR } from "@/lib/format"
import {
  useWishlist,
  filterWishlist,
  sortWishlist,
  type WishlistFilter,
  type WishlistSort,
} from "@/hooks/useWishlist"
import { Card, CardContent } from "@/components/ui/card"
import { WishlistRow } from "@/components/wishlist/WishlistRow"
import { WishlistFilters } from "@/components/wishlist/WishlistFilters"
import { WishlistDetailDialog } from "@/components/wishlist/WishlistDetailDialog"

export function WishlistPage({
  showNominal,
}: {
  showNominal: boolean
}) {
  const { items, totalWanted, wantedCount, boughtCount } = useWishlist()

  const [filter, setFilter] = useState<WishlistFilter>("all")
  const [sort, setSort] = useState<WishlistSort>("newest")
  const [search, setSearch] = useState("")
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)

  const filtered = useMemo(
    () => sortWishlist(filterWishlist(items, filter, search), sort),
    [items, filter, search, sort]
  )

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) ?? null,
    [items, selectedItemId]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Heart className="size-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">
              Total wanted
            </p>
            <p className="text-lg font-heading font-semibold tabular-nums text-foreground">
              {showNominal ? formatIDR(totalWanted) : "••••••"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{wantedCount} wanted</span>
          <span>{boughtCount} bought</span>
        </div>
      </div>

      {/* Filters */}
      <WishlistFilters
        filter={filter}
        sort={sort}
        search={search}
        onFilterChange={setFilter}
        onSortChange={setSort}
        onSearchChange={setSearch}
        resultCount={filtered.length}
      />

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              No items found
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((item) => (
                <WishlistRow
                  key={item.id}
                  item={item}
                  showNominal={showNominal}
                  onClick={() => setSelectedItemId(item.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <WishlistDetailDialog
        item={selectedItem}
        open={selectedItemId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedItemId(null)
        }}
        showNominal={showNominal}
      />
    </div>
  )
}
