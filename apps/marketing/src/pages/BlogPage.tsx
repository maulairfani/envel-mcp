import { useState } from "react"
import { LogoMark } from "@/components/LogoMark"

interface BlogPost {
  id: number
  cat: "Tips & Guides" | "Product Updates" | "Stories"
  title: string
  excerpt: string
  date: string
  readTime: string
  color: string
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    cat: "Tips & Guides",
    title: "How to set up your first envelope budget in 10 minutes",
    excerpt:
      "Starting with envelope budgeting can feel daunting. Here's a simple, no-fluff guide to get your first month running.",
    date: "Apr 15, 2026",
    readTime: "5 min read",
    color: "#e85d8a",
  },
  {
    id: 2,
    cat: "Product Updates",
    title: "Envel now supports Gemini — here's how to connect",
    excerpt:
      "Google Gemini users can now use Envel directly from their AI chat. Setting it up takes less than two minutes.",
    date: "Apr 10, 2026",
    readTime: "3 min read",
    color: "#4285F4",
  },
  {
    id: 3,
    cat: "Stories",
    title: "\"I finally stopped living paycheck to paycheck\" — Rizky's story",
    excerpt:
      "Fresh grad, first job, zero savings strategy. Here's how Rizky got his finances under control in 90 days.",
    date: "Apr 5, 2026",
    readTime: "7 min read",
    color: "#10b981",
  },
  {
    id: 4,
    cat: "Tips & Guides",
    title: "The envelope method vs. zero-based budgeting: what's the difference?",
    excerpt:
      "Both methods are powerful. But they work differently — and one might be a better fit for how you think about money.",
    date: "Mar 28, 2026",
    readTime: "6 min read",
    color: "#f59e0b",
  },
  {
    id: 5,
    cat: "Product Updates",
    title: "Introducing Wish Farm: save for what you actually want",
    excerpt:
      "New feature alert. Plant a savings goal, fund it monthly, and harvest it when you're ready. Here's how Wish Farm works.",
    date: "Mar 20, 2026",
    readTime: "4 min read",
    color: "#8b5cf6",
  },
  {
    id: 6,
    cat: "Tips & Guides",
    title: "5 things to do with leftover money at the end of the month",
    excerpt:
      "End-of-month surplus? Here are five smart moves that your future self will thank you for.",
    date: "Mar 12, 2026",
    readTime: "4 min read",
    color: "#06b6d4",
  },
]

const CAT_COLOR_MAP: Record<string, string> = {
  "Tips & Guides": "#10b981",
  "Product Updates": "#4285F4",
  Stories: "#e85d8a",
}

type FilterOpt = "All" | BlogPost["cat"]

export function BlogPage() {
  const [filter, setFilter] = useState<FilterOpt>("All")
  const filtered =
    filter === "All"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.cat === filter)

  const cats: FilterOpt[] = ["All", "Tips & Guides", "Product Updates", "Stories"]

  return (
    <div>
      <div
        style={{
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          padding: "64px 0 48px",
        }}
      >
        <div className="container">
          <div className="label" style={{ marginBottom: 14 }}>
            Blog
          </div>
          <h1 className="h1" style={{ marginBottom: 12 }}>
            Learn, grow, and get
            <br />
            good at money.
          </h1>
          <p className="body-lg">Tips, updates, and stories from the Envel team.</p>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            {cats.map((c) => {
              const active = filter === c
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 99,
                    fontSize: 13.5,
                    fontWeight: 600,
                    background: active ? "var(--brand)" : "transparent",
                    color: active ? "#fff" : "var(--ink-2)",
                    border: `1.5px solid ${active ? "var(--brand)" : "var(--border)"}`,
                    cursor: "pointer",
                    transition: "all 160ms",
                  }}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "52px 32px 96px" }}>
        <div className="blog-grid">
          {filtered.map((post) => (
            <a
              key={post.id}
              href="#"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  height: 180,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${post.color}22 0%, ${post.color}44 100%)`,
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: post.color + "33",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LogoMark size={22} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 10px",
                    borderRadius: 99,
                    background: (CAT_COLOR_MAP[post.cat] ?? "#888") + "18",
                    color: CAT_COLOR_MAP[post.cat] ?? "#888",
                    alignSelf: "flex-start",
                  }}
                >
                  {post.cat}
                </span>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    color: "var(--ink)",
                  }}
                >
                  {post.title}
                </h3>
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: "var(--ink-2)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {post.excerpt}
                </p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    {post.date}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--ink-4)" }}>·</span>
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    {post.readTime}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
