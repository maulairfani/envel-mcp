import { useState } from "react"

interface DocsNavSection {
  label: string
  items: string[]
}

const DOCS_NAV: DocsNavSection[] = [
  { label: "Getting Started", items: ["What is Envel?", "How MCP works"] },
  {
    label: "Connect Your AI",
    items: [
      "Connect to Claude",
      "Connect to ChatGPT",
      "Connect to Gemini",
      "Use Envel's built-in chat",
    ],
  },
  {
    label: "Using Envel",
    items: [
      "Set up your envelopes",
      "Log your first transaction",
      "Move money between envelopes",
      "Track multiple accounts",
      "Set up Wish Farm",
    ],
  },
  { label: "FAQ", items: [] },
]

export function DocsPage() {
  const [active, setActive] = useState<string>("What is Envel?")

  return (
    <div className="docs-layout">
      {/* Sidebar */}
      <div className="docs-sidebar">
        {DOCS_NAV.map((section) => (
          <div className="docs-nav-section" key={section.label}>
            <div className="docs-nav-label">{section.label}</div>
            {section.items.length > 0 ? (
              section.items.map((item) => (
                <a
                  key={item}
                  className={`docs-nav-link ${active === item ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault()
                    setActive(item)
                  }}
                >
                  {item}
                </a>
              ))
            ) : (
              <a
                className={`docs-nav-link ${active === "FAQ" ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActive("FAQ")
                }}
              >
                FAQ
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="docs-content">
        <div className="label" style={{ marginBottom: 10 }}>
          Getting Started
        </div>
        <h1 className="h1" style={{ marginBottom: 24 }}>
          What is Envel?
        </h1>

        <p className="body-lg" style={{ marginBottom: 20 }}>
          Envel is an AI-first personal finance app built on the{" "}
          <strong>Model Context Protocol (MCP)</strong>. Instead of logging into a
          separate app, you manage your finances directly inside the AI assistant
          you already use every day — Claude, ChatGPT, Gemini, or Envel's own
          built-in chat.
        </p>
        <p className="body-lg" style={{ marginBottom: 20 }}>
          Envel uses the <strong>envelope budgeting method</strong>: before you
          spend, you assign your money to categories (envelopes) like food, rent,
          and transport. When you spend, you tell your AI — and Envel updates your
          envelopes automatically.
        </p>
        <p className="body-lg" style={{ marginBottom: 40 }}>
          No spreadsheets. No complicated dashboards. Just a conversation.
        </p>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "28px 28px 20px",
            marginBottom: 40,
          }}
        >
          <div className="label" style={{ marginBottom: 20 }}>
            Get started in 4 steps
          </div>
          {[
            {
              n: 1,
              title: "Create your Envel account",
              desc: "Sign up free — no credit card required.",
            },
            {
              n: 2,
              title: "Connect to your AI assistant",
              desc: "Add Envel as an MCP tool in Claude, ChatGPT, or Gemini.",
            },
            {
              n: 3,
              title: "Set up your envelopes",
              desc: "Assign your monthly income to categories that matter to you.",
            },
            {
              n: 4,
              title: "Start chatting",
              desc: "Tell your AI what you spent, and Envel handles the rest.",
            },
          ].map((step) => (
            <div
              key={step.n}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "var(--brand-light)",
                  color: "var(--brand-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {step.n}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: "var(--ink)",
                    marginBottom: 3,
                  }}
                >
                  {step.title}
                </div>
                <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <a
          href="#"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 700,
            color: "var(--brand)",
            fontSize: 15,
            borderBottom: "2px solid var(--brand-light)",
            paddingBottom: 2,
          }}
        >
          Ready? Let's get started →
        </a>
      </div>
    </div>
  )
}
