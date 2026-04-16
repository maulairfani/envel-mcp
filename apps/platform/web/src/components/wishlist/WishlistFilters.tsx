import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { WishlistFilter, WishlistSort } from "@/hooks/useWishlist"

interface WishlistFiltersProps {
  filter: WishlistFilter
  sort: WishlistSort
  search: string
  onFilterChange: (f: WishlistFilter) => void
  onSortChange: (s: WishlistSort) => void
  onSearchChange: (q: string) => void
  resultCount: number
}

const FILTER_OPTIONS: { value: WishlistFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "wanted", label: "Wanted" },
  { value: "bought", label: "Bought" },
]

const SORT_OPTIONS: { value: WishlistSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "priority", label: "Priority" },
  { value: "price_high", label: "Price ↓" },
  { value: "price_low", label: "Price ↑" },
]

export function WishlistFilters({
  filter,
  sort,
  search,
  onFilterChange,
  onSortChange,
  onSearchChange,
  resultCount,
}: WishlistFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        {/* Status filter */}
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as WishlistFilter)}
          className="h-8 rounded-lg border border-input bg-background px-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as WishlistSort)}
          className="h-8 rounded-lg border border-input bg-background px-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          {resultCount} item{resultCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search wishlist…"
          className="h-8 pl-8 text-[13px] w-full sm:w-48"
        />
      </div>
    </div>
  )
}
