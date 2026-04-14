// ── Types ────────────────────────────────────────────────

export type TargetType =
  | "monthly_spending"
  | "monthly_savings"
  | "savings_balance"
  | "needed_by_date"

export interface EnvelopeTarget {
  type: TargetType
  amount: number
  deadline?: string // ISO date for needed_by_date
}

export interface Envelope {
  id: number
  name: string
  icon: string
  type: "income" | "expense"
  groupId: number | null
  target: EnvelopeTarget | null
}

export interface EnvelopeGroup {
  id: number
  name: string
  sortOrder: number
}

/** Budget state for one envelope in one period */
export interface EnvelopeBudget {
  envelopeId: number
  assigned: number
  carryover: number
  activity: number // positive = spent
  available: number // carryover + assigned - activity
}

/** Full group with its envelopes and their budgets for a period */
export interface EnvelopeGroupWithBudgets {
  group: EnvelopeGroup
  items: {
    envelope: Envelope
    budget: EnvelopeBudget
  }[]
  /** Sum of assigned across envelopes in group */
  totalAssigned: number
  /** Sum of available across envelopes in group */
  totalAvailable: number
}

// ── Static data (matches schema.sql defaults) ───────────

const GROUPS: EnvelopeGroup[] = [
  { id: 1, name: "Fixed Expenses", sortOrder: 1 },
  { id: 2, name: "Daily Essentials", sortOrder: 2 },
  { id: 3, name: "Personal Spending", sortOrder: 3 },
  { id: 4, name: "Savings & Goals", sortOrder: 4 },
  { id: 5, name: "Unexpected", sortOrder: 5 },
]

const ENVELOPES: Envelope[] = [
  // Fixed Expenses
  { id: 5, name: "Rent", icon: "🏡", type: "expense", groupId: 1, target: { type: "monthly_spending", amount: 3_000_000 } },
  { id: 6, name: "Bills", icon: "📄", type: "expense", groupId: 1, target: { type: "monthly_spending", amount: 800_000 } },
  { id: 7, name: "Subscriptions", icon: "🔄", type: "expense", groupId: 1, target: { type: "monthly_spending", amount: 250_000 } },
  { id: 8, name: "Family Support", icon: "🏠", type: "expense", groupId: 1, target: { type: "monthly_spending", amount: 1_500_000 } },
  // Daily Essentials
  { id: 9, name: "Food", icon: "🍽️", type: "expense", groupId: 2, target: { type: "monthly_spending", amount: 2_000_000 } },
  { id: 10, name: "Transport", icon: "🚗", type: "expense", groupId: 2, target: { type: "monthly_spending", amount: 600_000 } },
  // Personal Spending
  { id: 11, name: "Shopping", icon: "🛍️", type: "expense", groupId: 3, target: { type: "monthly_spending", amount: 500_000 } },
  { id: 12, name: "Entertainment", icon: "🎮", type: "expense", groupId: 3, target: { type: "monthly_spending", amount: 300_000 } },
  { id: 13, name: "Health", icon: "🏥", type: "expense", groupId: 3, target: { type: "monthly_spending", amount: 400_000 } },
  { id: 14, name: "Education", icon: "📚", type: "expense", groupId: 3, target: { type: "monthly_spending", amount: 200_000 } },
  // Savings & Goals
  { id: 15, name: "Emergency Fund", icon: "🛡️", type: "expense", groupId: 4, target: { type: "monthly_savings", amount: 500_000 } },
  { id: 16, name: "Savings", icon: "💎", type: "expense", groupId: 4, target: { type: "savings_balance", amount: 15_000_000 } },
  // Unexpected
  { id: 17, name: "Miscellaneous", icon: "💸", type: "expense", groupId: 5, target: null },
]

// ── Mock budget data per period ─────────────────────────

// Seeded PRNG for deterministic mock
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildBudgetForPeriod(period: string): Map<number, EnvelopeBudget> {
  // Derive seed from period string so each month is stable
  const seed = period.split("").reduce((s, c) => s * 31 + c.charCodeAt(0), 0)
  const rand = mulberry32(seed)

  const budgets = new Map<number, EnvelopeBudget>()

  for (const env of ENVELOPES) {
    const target = env.target?.amount ?? 300_000
    // Assigned: 70-110% of target
    const assigned = Math.round((target * (0.7 + rand() * 0.4)) / 1000) * 1000
    // Carryover: 0-30% of target (some months have leftover)
    const carryover = Math.round((target * rand() * 0.3) / 1000) * 1000
    const funded = assigned + carryover
    // Activity: 50-130% of funded (allows overspending)
    const activity = Math.round((funded * (0.5 + rand() * 0.8)) / 1000) * 1000
    const available = funded - activity

    budgets.set(env.id, {
      envelopeId: env.id,
      assigned,
      carryover,
      activity,
      available,
    })
  }

  return budgets
}

// Cache budgets per period
const budgetCache = new Map<string, Map<number, EnvelopeBudget>>()

function getBudgets(period: string): Map<number, EnvelopeBudget> {
  let budgets = budgetCache.get(period)
  if (!budgets) {
    budgets = buildBudgetForPeriod(period)
    budgetCache.set(period, budgets)
  }
  return budgets
}

// ── Hook ─────────────────────────────────────────────────

export function useEnvelopes(period: string): {
  groups: EnvelopeGroupWithBudgets[]
  allEnvelopes: { envelope: Envelope; budget: EnvelopeBudget }[]
} {
  const budgets = getBudgets(period)

  const allEnvelopes = ENVELOPES.filter((e) => e.type === "expense").map(
    (envelope) => ({
      envelope,
      budget: budgets.get(envelope.id)!,
    })
  )

  const groups: EnvelopeGroupWithBudgets[] = GROUPS.map((group) => {
    const items = allEnvelopes.filter(
      (item) => item.envelope.groupId === group.id
    )
    return {
      group,
      items,
      totalAssigned: items.reduce((s, i) => s + i.budget.assigned, 0),
      totalAvailable: items.reduce((s, i) => s + i.budget.available, 0),
    }
  }).filter((g) => g.items.length > 0)

  return { groups, allEnvelopes }
}

// ── Cover overspent helper ───────────────────────────────

export interface CoverAction {
  fromEnvelopeId: number
  toEnvelopeId: number
  amount: number
}

/**
 * Apply a cover action: move `amount` from one envelope to another.
 * Returns a new budgets map (immutable update).
 */
export function applyCover(
  budgets: Map<number, EnvelopeBudget>,
  action: CoverAction
): Map<number, EnvelopeBudget> {
  const next = new Map(budgets)
  const from = { ...next.get(action.fromEnvelopeId)! }
  const to = { ...next.get(action.toEnvelopeId)! }

  from.assigned -= action.amount
  from.available -= action.amount
  to.assigned += action.amount
  to.available += action.amount

  next.set(from.envelopeId, from)
  next.set(to.envelopeId, to)
  return next
}
