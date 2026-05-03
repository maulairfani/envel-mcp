import { useEffect, useState } from "react"
import {
  Check,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { formatIDR } from "@/lib/format"
import {
  useDeleteWishlistItem,
  useEditWishlistItem,
  useMarkWishlistBought,
  type Priority,
  type WishlistItem,
} from "@/hooks/useWishlist"
import { useCreateEnvelope, useSetEnvelopeTarget } from "@/hooks/useEnvelopes"
import { currentPeriod } from "@/components/shared/PeriodPicker"

const PRIORITIES: { value: Priority; label: string; chip: string }[] = [
  {
    value: "high",
    label: "High",
    chip: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  {
    value: "medium",
    label: "Medium",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    value: "low",
    label: "Low",
    chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
]

interface WishlistDetailPanelProps {
  item: WishlistItem | null
  onClose: () => void
  onDeleted: () => void
  showNominal: boolean
  totalWanted: number
  wantedCount: number
  boughtCount: number
}

export function WishlistDetailPanel({
  item,
  onClose,
  onDeleted,
  showNominal,
  totalWanted,
  wantedCount,
  boughtCount,
}: WishlistDetailPanelProps) {
  if (!item) {
    return (
      <EmptyState
        showNominal={showNominal}
        totalWanted={totalWanted}
        wantedCount={wantedCount}
        boughtCount={boughtCount}
      />
    )
  }

  const isBought = item.status === "bought"
  const priority = PRIORITIES.find((p) => p.value === item.priority)!

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-border px-4 py-3.5">
        <span className="text-lg leading-none">{item.icon}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-text-primary">
          {item.name}
        </span>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-muted hover:text-text-secondary"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Price + meta */}
        <div className="px-4 py-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Price
          </p>
          <p className="font-heading text-2xl font-semibold tabular-nums text-text-primary">
            {item.price
              ? showNominal
                ? formatIDR(item.price)
                : "••••••"
              : "—"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${priority.chip}`}
            >
              {priority.label} priority
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isBought
                  ? "bg-[color:var(--success-light)] text-[color:var(--success)]"
                  : "bg-bg-muted text-text-secondary"
              }`}
            >
              {isBought ? "Bought" : "Wanted"}
            </span>
          </div>

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-text hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Open link
            </a>
          )}

          {item.notes && (
            <div className="mt-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Notes
              </p>
              <p className="text-[12.5px] text-text-secondary">{item.notes}</p>
            </div>
          )}

          <p className="mt-4 text-[11px] text-text-muted">
            Added{" "}
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Edit form */}
        <EditForm key={`edit-${item.id}`} item={item} />

        {/* Mark as bought */}
        {!isBought && <MarkBoughtAction item={item} />}

        {/* Save up for this — create envelope */}
        {!isBought && item.price && item.price > 0 && (
          <SaveForThisAction item={item} />
        )}

        {/* Delete */}
        <DeleteAction item={item} onDeleted={onDeleted} />
      </div>
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  showNominal,
  totalWanted,
  wantedCount,
  boughtCount,
}: {
  showNominal: boolean
  totalWanted: number
  wantedCount: number
  boughtCount: number
}) {
  const isEmpty = wantedCount === 0 && boughtCount === 0

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 border-b border-border px-4 py-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Total wanted
        </p>
        <p className="font-heading text-2xl font-semibold tabular-nums text-text-primary">
          {showNominal ? formatIDR(totalWanted) : "••••••"}
        </p>
        <p className="mt-1 text-[11.5px] text-text-muted">
          {wantedCount === 0
            ? "Nothing on your wishlist yet."
            : `${wantedCount} item${wantedCount === 1 ? "" : "s"} you're saving for.`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <Sparkles className="size-8 text-text-muted" />
            <p className="text-[13px] font-semibold text-text-primary">
              Wishlist empty
            </p>
            <p className="max-w-[220px] text-[12px] text-text-muted">
              Add things you'd like to save up for — books, gear, trips.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Activity
            </p>
            <div className="flex flex-col gap-2">
              <StatRow label="Wanted" value={wantedCount} />
              <StatRow label="Bought" value={boughtCount} />
            </div>
            <p className="mt-4 text-[11.5px] text-text-muted">
              Click an item to view details, edit, or save up for it.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-bg-muted/40 px-3 py-2">
      <span className="text-[12.5px] text-text-secondary">{label}</span>
      <span className="text-[13px] font-semibold tabular-nums text-text-primary">
        {value}
      </span>
    </div>
  )
}

// ── Edit form ────────────────────────────────────────────────────────────────

function EditForm({ item }: { item: WishlistItem }) {
  const editMutation = useEditWishlistItem()

  const [name, setName] = useState(item.name)
  const [icon, setIcon] = useState(item.icon)
  const [priceRaw, setPriceRaw] = useState(item.price?.toString() ?? "")
  const [priority, setPriority] = useState<Priority>(item.priority)
  const [url, setUrl] = useState(item.url ?? "")
  const [notes, setNotes] = useState(item.notes ?? "")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  useEffect(() => {
    setName(item.name)
    setIcon(item.icon)
    setPriceRaw(item.price?.toString() ?? "")
    setPriority(item.priority)
    setUrl(item.url ?? "")
    setNotes(item.notes ?? "")
    setStatus("idle")
  }, [item.id])

  const isPending = status === "loading"

  async function handleSave() {
    if (isPending || !name.trim()) return
    setStatus("loading")
    try {
      await editMutation.mutateAsync({
        id: item.id,
        name: name.trim(),
        icon: icon.trim() || "🎁",
        price: priceRaw ? Number(priceRaw) : null,
        priority,
        url: url.trim() || null,
        notes: notes.trim() || null,
      })
      setStatus("success")
      setTimeout(() => setStatus("idle"), 1500)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  return (
    <div className="border-t border-border px-4 py-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        Edit
      </p>
      <div className="flex flex-col gap-2.5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          placeholder="Name"
          className="h-8 rounded-lg border border-border bg-bg-muted px-2 text-[12.5px] text-text-primary disabled:opacity-50"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            disabled={isPending}
            maxLength={4}
            className="h-8 w-14 rounded-lg border border-border bg-bg-muted px-2 text-center text-[14px] disabled:opacity-50"
          />
          <input
            type="number"
            value={priceRaw}
            onChange={(e) => setPriceRaw(e.target.value)}
            disabled={isPending}
            placeholder="Price"
            className="h-8 flex-1 rounded-lg border border-border bg-bg-muted px-2 text-[12.5px] tabular-nums disabled:opacity-50"
          />
        </div>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          disabled={isPending}
          className="h-8 rounded-lg border border-border bg-bg-muted px-2 text-[12.5px] text-text-primary disabled:opacity-50"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label} priority
            </option>
          ))}
        </select>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isPending}
          placeholder="URL"
          className="h-8 rounded-lg border border-border bg-bg-muted px-2 text-[12.5px] text-text-primary disabled:opacity-50"
        />
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isPending}
          placeholder="Notes"
          className="h-8 rounded-lg border border-border bg-bg-muted px-2 text-[12.5px] text-text-primary disabled:opacity-50"
        />
        <button
          onClick={handleSave}
          disabled={isPending || !name.trim()}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition-colors ${
            status === "success"
              ? "bg-[color:var(--success-light)] text-[color:var(--success)]"
              : status === "error"
                ? "bg-danger-light text-[color:var(--danger)]"
                : isPending
                  ? "cursor-not-allowed bg-bg-muted text-text-muted"
                  : "bg-brand-light text-brand-text hover:brightness-95"
          }`}
        >
          {status === "loading" ? (
            <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
          ) : status === "success" ? (
            <><Check className="size-3.5" /> Saved</>
          ) : status === "error" ? (
            "Failed — try again"
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  )
}

// ── Mark as bought ────────────────────────────────────────────────────────────

function MarkBoughtAction({ item }: { item: WishlistItem }) {
  const mutation = useMarkWishlistBought()
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleClick() {
    if (status === "loading") return
    setStatus("loading")
    try {
      await mutation.mutateAsync(item.id)
      setStatus("success")
      setTimeout(() => setStatus("idle"), 1500)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  return (
    <div className="border-t border-border px-4 py-4">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition-colors ${
          status === "success"
            ? "bg-[color:var(--success-light)] text-[color:var(--success)]"
            : status === "error"
              ? "bg-danger-light text-[color:var(--danger)]"
              : "bg-bg-muted text-text-secondary hover:brightness-95"
        }`}
      >
        {status === "loading" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : status === "success" ? (
          <><CheckCircle2 className="size-3.5" /> Marked bought</>
        ) : (
          <><ShoppingBag className="size-3.5" /> Mark as bought</>
        )}
      </button>
    </div>
  )
}

// ── Save up for this — create envelope from item ─────────────────────────────

function SaveForThisAction({ item }: { item: WishlistItem }) {
  const period = currentPeriod()
  const createEnvelope = useCreateEnvelope(period)
  const setTarget = useSetEnvelopeTarget(period)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleClick() {
    if (status === "loading" || !item.price) return
    setStatus("loading")
    setErrorMsg(null)
    try {
      const created = (await createEnvelope.mutateAsync({
        name: item.name,
        icon: item.icon || "🎁",
        type: "expense",
        group_id: null,
      })) as { id: number }
      await setTarget.mutateAsync({
        envelopeId: created.id,
        targetType: "savings_balance",
        targetAmount: item.price,
        targetDeadline: null,
      })
      setStatus("success")
      setTimeout(() => setStatus("idle"), 2000)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to create envelope")
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <div className="border-t border-border px-4 py-4">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition-colors ${
          status === "success"
            ? "bg-[color:var(--success-light)] text-[color:var(--success)]"
            : status === "error"
              ? "bg-danger-light text-[color:var(--danger)]"
              : "bg-brand-light text-brand-text hover:brightness-95"
        }`}
      >
        {status === "loading" ? (
          <><Loader2 className="size-3.5 animate-spin" /> Creating…</>
        ) : status === "success" ? (
          <><Check className="size-3.5" /> Envelope created</>
        ) : status === "error" ? (
          "Failed — try again"
        ) : (
          <><Sparkles className="size-3.5" /> Save up for this</>
        )}
      </button>
      <p className="mt-2 text-[11px] text-text-muted">
        Creates an envelope with a {item.price ? formatIDR(item.price) : ""} savings goal.
      </p>
      {errorMsg && (
        <p className="mt-1 text-[11px] text-[color:var(--danger)]">{errorMsg}</p>
      )}
    </div>
  )
}

// ── Delete ───────────────────────────────────────────────────────────────────

function DeleteAction({
  item,
  onDeleted,
}: {
  item: WishlistItem
  onDeleted: () => void
}) {
  const mutation = useDeleteWishlistItem()
  const [confirm, setConfirm] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

  useEffect(() => {
    setConfirm(false)
    setStatus("idle")
  }, [item.id])

  async function handleDelete() {
    if (status === "loading") return
    setStatus("loading")
    try {
      await mutation.mutateAsync(item.id)
      onDeleted()
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  return (
    <div className="border-t border-border px-4 py-4">
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold text-[color:var(--danger)] transition-colors hover:bg-danger-light"
        >
          <Trash2 className="size-3.5" /> Delete
        </button>
      ) : (
        <div className="flex flex-col gap-2 rounded-lg border border-[color:var(--danger)]/30 bg-danger-light p-2.5">
          <p className="text-[12px] text-text-secondary">
            Delete <span className="font-semibold">{item.name}</span>?
          </p>
          <p className="text-[11.5px] font-semibold text-[color:var(--danger)]">
            This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm(false)}
              disabled={status === "loading"}
              className="flex-1 rounded-md bg-bg-muted py-1.5 text-[11.5px] font-semibold text-text-secondary hover:brightness-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={status === "loading"}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-[color:var(--danger)] py-1.5 text-[11.5px] font-semibold text-white hover:brightness-95 disabled:opacity-50"
            >
              {status === "loading" ? <Loader2 className="size-3.5 animate-spin" /> : "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
