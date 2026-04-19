import { LogoMark } from "./LogoMark"

export interface ChatCardRow {
  name: string
  pct: number
  amount: string
  over?: boolean
}

export interface ChatMessage {
  role: "user" | "bot"
  text?: string
  card?: ChatCardRow[]
}

interface ChatMockupProps {
  dark?: boolean
  messages: ChatMessage[]
}

export function ChatMockup({ dark, messages }: ChatMockupProps) {
  const borderColor = dark ? "var(--border-dark)" : "oklch(87% 0.014 75)"
  return (
    <div
      style={{
        background: dark ? "var(--bg-dark)" : "oklch(95% 0.013 75)",
        borderRadius: 20,
        padding: "20px 18px",
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
          paddingBottom: 14,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <LogoMark size={22} />
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: dark ? "oklch(88% 0.01 75)" : "var(--ink)",
            }}
          >
            Envel
          </div>
          <div
            style={{
              fontSize: 10,
              color: dark ? "oklch(60% 0.01 65)" : "var(--ink-3)",
            }}
          >
            AI Finance Assistant · Online
          </div>
        </div>
      </div>

      <div className="chat-wrap">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            {m.role === "bot" && (
              <div
                className="chat-avatar"
                style={{
                  background: "var(--brand-light)",
                  color: "var(--brand-text)",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                E
              </div>
            )}
            {m.role === "user" && (
              <div
                className="chat-avatar"
                style={{
                  background: dark ? "oklch(28% 0.018 55)" : "oklch(88% 0.01 65)",
                  color: dark ? "oklch(70% 0.01 65)" : "var(--ink-2)",
                  fontSize: 10,
                }}
              >
                M
              </div>
            )}
            {m.card ? (
              <div
                style={{
                  background: dark ? "var(--bg-dark-card)" : "#fff",
                  border: `1px solid ${borderColor}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  minWidth: 240,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: dark ? "oklch(55% 0.01 65)" : "var(--ink-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 12,
                  }}
                >
                  Budget Summary
                </div>
                {m.card.map((row, ri) => (
                  <div
                    key={ri}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "7px 0",
                      borderBottom:
                        ri < (m.card?.length ?? 0) - 1
                          ? `1px solid ${borderColor}`
                          : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: dark ? "oklch(80% 0.01 75)" : "var(--ink)",
                      }}
                    >
                      {row.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 60,
                          height: 4,
                          borderRadius: 4,
                          background: dark
                            ? "oklch(24% 0.018 55)"
                            : "oklch(93% 0.012 75)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, row.pct)}%`,
                            height: "100%",
                            borderRadius: 4,
                            background: row.over
                              ? "oklch(52% 0.19 25)"
                              : "var(--brand)",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: row.over
                            ? "oklch(52% 0.19 25)"
                            : dark
                              ? "oklch(72% 0.14 145)"
                              : "var(--brand)",
                          minWidth: 70,
                          textAlign: "right",
                        }}
                      >
                        {row.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`bubble ${
                  m.role === "user"
                    ? "bubble-user"
                    : dark
                      ? "bubble-bot-dark"
                      : "bubble-bot"
                }`}
              >
                {m.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
