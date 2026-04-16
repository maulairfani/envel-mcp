import { ExternalLink } from "lucide-react"
import { formatIDR } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { WishlistItem } from "@/hooks/useWishlist"

const PRIORITY_STYLE: Record<
  string,
  { label: string; class: string }
> = {
  high: {
    label: "High priority",
    class:
      "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20",
  },
  medium: {
    label: "Medium priority",
    class:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
  },
  low: {
    label: "Low priority",
    class:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
  },
}

interface WishlistDetailDialogProps {
  item: WishlistItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  showNominal: boolean
}

export function WishlistDetailDialog({
  item,
  open,
  onOpenChange,
  showNominal,
}: WishlistDetailDialogProps) {
  if (!item) return null

  const priority = PRIORITY_STYLE[item.priority]
  const isBought = item.status === "bought"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <span className="mr-2">{isBought ? "✅" : "🎯"}</span>
            {item.name}
          </DialogTitle>
          <DialogDescription>
            {isBought ? "Purchased" : "On your wishlist"}
          </DialogDescription>
        </DialogHeader>

        {/* Price */}
        <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">Price</span>
          <span className="text-lg font-heading font-semibold tabular-nums text-foreground">
            {item.price
              ? showNominal
                ? formatIDR(item.price)
                : "••••••"
              : "—"}
          </span>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-[13px] text-muted-foreground">Priority</span>
          <div className="text-right">
            <Badge
              variant="secondary"
              className={`text-[11px] px-2 py-0 h-5 font-medium border-0 ${priority.class}`}
            >
              {priority.label}
            </Badge>
          </div>

          <span className="text-[13px] text-muted-foreground">Status</span>
          <span className="text-right text-[13px] font-medium">
            {isBought ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                Bought
              </span>
            ) : (
              "Wanted"
            )}
          </span>

          <span className="text-[13px] text-muted-foreground">Added</span>
          <span className="text-right text-[13px] font-medium">
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Notes */}
        {item.notes && (
          <div className="border-t pt-3">
            <p className="text-[13px] font-medium mb-1">Notes</p>
            <p className="text-[13px] text-muted-foreground">{item.notes}</p>
          </div>
        )}

        {/* URL */}
        {item.url && (
          <div className="border-t pt-3">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Open link
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
