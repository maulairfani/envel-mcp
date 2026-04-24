import { ExternalLink } from "lucide-react"
import { Badge, type BadgeColor } from "@/components/shared/Badge"
import { AmountText } from "@/components/shared/AmountText"
import type { WishlistItem } from "@/hooks/useWishlist"

const PRIORITY_COLOR: Record<string, BadgeColor> = {
  high: "danger",
  medium: "warning",
  low: "muted",
}
const PRIORITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

interface WishlistRowProps {
  item: WishlistItem
  showNominal: boolean
  onClick: () => void
}

export function WishlistRow({ item, showNominal, onClick }: WishlistRowProps) {
  const isBought = item.status === "bought"

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-border-muted px-7 py-2.5 text-left transition-colors hover:bg-bg-muted ${
        isBought ? "opacity-50" : ""
      }`}
    >
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-[15px] leading-none ${
          isBought ? "bg-success-light" : "bg-bg-muted"
        }`}
      >
        {item.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`truncate text-[13.5px] font-medium ${
              isBought ? "text-text-muted line-through" : "text-text-primary"
            }`}
          >
            {item.name}
          </span>
          <Badge color={PRIORITY_COLOR[item.priority] ?? "muted"} size="xs">
            {PRIORITY_LABEL[item.priority] ?? item.priority}
          </Badge>
          {item.url && (
            <ExternalLink className="size-3 shrink-0 text-text-muted" />
          )}
          {item.notes && (
            <span className="truncate text-[11.5px] text-text-muted">
              · {item.notes}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0">
        {item.price ? (
          <AmountText
            amount={item.price}
            showNominal={showNominal}
            size="sm"
            tone="neutral"
          />
        ) : (
          <span className="text-xs text-text-muted">—</span>
        )}
      </div>
    </button>
  )
}
