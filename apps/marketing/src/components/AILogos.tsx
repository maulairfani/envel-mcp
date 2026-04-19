const LOGOS = [
  { name: "Claude", color: "#D97757", letter: "C" },
  { name: "ChatGPT", color: "#10a37f", letter: "G" },
  { name: "Gemini", color: "#4285F4", letter: "G" },
]

export function AILogos() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 500 }}>
        Works with
      </span>
      {LOGOS.map((l) => (
        <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: l.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            {l.letter}
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>
            {l.name}
          </span>
        </div>
      ))}
      <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 500 }}>
        · and more
      </span>
    </div>
  )
}
