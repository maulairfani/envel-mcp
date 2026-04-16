import { ExternalLink } from "lucide-react"
import { formatIDR } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import type { WishlistItem } from "@/hooks/useWishlist"

const PRIORITY_STYLE: Record<
  string,
  { label: string; class: string }
> = {
  high: {
    label: "High",
    class:
      "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20",
  },
  medium: {
    label: "Medium",
    class:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
  },
  low: {
    label: "Low",
    class:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
  },
}

interface WishlistRowProps {
  item: WishlistItem
  showNominal: boolean
  onClick: () => void
}

export function WishlistRow({ item, showNominal, onClick }: WishlistRowProps) {
  const priority = PRIORITY_STYLE[item.priority]
  const isBought = item.status === "bought"

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors hover:bg-muted/50 cursor-pointer ${
        isBought ? "opacity-60" : ""
      }`}
    >
      {/* Status indicator */}
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-lg leading-none ${
          isBought ? "bg-emerald-500/10" : "bg-muted/60"
        }`}
      >
        {isBought ? "✅" : "🎯"}
      </div>

      {/* Name + notes */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-[13px] font-medium truncate ${
              isBought ? "line-through text-muted-foreground" : ""
            }`}
          >
            {item.name}
          </span>
          {item.url && (
            <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 h-4 font-medium border-0 ${priority.class}`}
          >
            {priority.label}
          </Badge>
          {item.notes && (
            <span className="text-[11px] text-muted-foreground truncate">
              {item.notes}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <p className="text-[13px] font-medium tabular-nums text-foreground">
          {item.price
            ? showNominal
              ? formatIDR(item.price)
              : "•••••"
            : "—"}
        </p>
      </div>
    </button>
  )
}
