export type Priority = "high" | "medium" | "low"
export type WishlistStatus = "wanted" | "bought"

export interface WishlistItem {
  id: number
  name: string
  price: number | null
  priority: Priority
  url: string | null
  notes: string | null
  status: WishlistStatus
  createdAt: string // ISO date
}

// ── Mock data ───────────────────────────────────────────

const ITEMS: WishlistItem[] = [
  {
    id: 1,
    name: "Sony WH-1000XM5",
    price: 4_299_000,
    priority: "high",
    url: "https://tokopedia.com",
    notes: "Noise cancelling headphones for WFH",
    status: "wanted",
    createdAt: "2026-02-10",
  },
  {
    id: 2,
    name: "Kindle Paperwhite",
    price: 2_199_000,
    priority: "medium",
    url: "https://amazon.com",
    notes: null,
    status: "wanted",
    createdAt: "2026-02-15",
  },
  {
    id: 3,
    name: "Ergonomic Chair",
    price: 3_500_000,
    priority: "high",
    url: null,
    notes: "Back pain getting worse, need a good chair",
    status: "wanted",
    createdAt: "2026-01-20",
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    price: 1_850_000,
    priority: "medium",
    url: "https://tokopedia.com",
    notes: "Keychron Q1 or similar",
    status: "bought",
    createdAt: "2026-01-05",
  },
  {
    id: 5,
    name: "Running Shoes",
    price: 1_200_000,
    priority: "low",
    url: null,
    notes: "Nike or Adidas, check Shopee sale",
    status: "wanted",
    createdAt: "2026-03-01",
  },
  {
    id: 6,
    name: "iPad Air",
    price: 9_999_000,
    priority: "low",
    url: null,
    notes: "For drawing, not urgent",
    status: "wanted",
    createdAt: "2026-03-10",
  },
  {
    id: 7,
    name: "Camping Tent",
    price: 850_000,
    priority: "medium",
    url: "https://shopee.co.id",
    notes: "2-person tent for weekend trips",
    status: "wanted",
    createdAt: "2026-03-20",
  },
  {
    id: 8,
    name: "USB-C Hub",
    price: 450_000,
    priority: "medium",
    url: "https://tokopedia.com",
    notes: null,
    status: "bought",
    createdAt: "2025-12-15",
  },
  {
    id: 9,
    name: "Monitor Light Bar",
    price: 350_000,
    priority: "low",
    url: null,
    notes: "Baseus or Xiaomi",
    status: "bought",
    createdAt: "2026-01-10",
  },
]

// ── Hook ────────────────────────────────────────────────

export type WishlistFilter = "all" | "wanted" | "bought"
export type WishlistSort = "newest" | "price_high" | "price_low" | "priority"

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function filterWishlist(
  items: WishlistItem[],
  filter: WishlistFilter,
  search: string
): WishlistItem[] {
  return items.filter((item) => {
    if (filter !== "all" && item.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      const haystack = [item.name, item.notes].filter(Boolean).join(" ").toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function sortWishlist(
  items: WishlistItem[],
  sort: WishlistSort
): WishlistItem[] {
  const sorted = [...items]
  switch (sort) {
    case "newest":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      break
    case "price_high":
      sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      break
    case "price_low":
      sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      break
    case "priority":
      sorted.sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      )
      break
  }
  return sorted
}

export function useWishlist() {
  const totalWanted = ITEMS.filter((i) => i.status === "wanted").reduce(
    (s, i) => s + (i.price ?? 0),
    0
  )
  const totalBought = ITEMS.filter((i) => i.status === "bought").reduce(
    (s, i) => s + (i.price ?? 0),
    0
  )
  const wantedCount = ITEMS.filter((i) => i.status === "wanted").length
  const boughtCount = ITEMS.filter((i) => i.status === "bought").length

  return {
    items: ITEMS,
    totalWanted,
    totalBought,
    wantedCount,
    boughtCount,
  }
}
