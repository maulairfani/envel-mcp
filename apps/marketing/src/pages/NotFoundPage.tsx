import { useNavigate } from "react-router-dom"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
        textAlign: "center",
        padding: 40,
      }}
    >
      {/* Empty envelope illustration */}
      <svg
        width="120"
        height="80"
        viewBox="0 0 120 80"
        fill="none"
        style={{ marginBottom: 8 }}
      >
        <rect
          x="10"
          y="16"
          width="100"
          height="56"
          rx="8"
          fill="var(--brand-light)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <path
          d="M10 24 L60 50 L110 24 L110 16 Q110 8 102 8 L18 8 Q10 8 10 16 Z"
          fill="var(--brand)"
          opacity="0.15"
        />
        <path
          d="M10 68 L38 44 M110 68 L82 44"
          stroke="var(--ink-4)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <text
          x="60"
          y="58"
          textAnchor="middle"
          fontSize="16"
          fill="var(--ink-4)"
          fontFamily="var(--font)"
        >
          ∅
        </text>
      </svg>
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "var(--brand-light)",
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        404
      </div>
      <h1 className="h2">Oops. This page doesn't exist.</h1>
      <p className="body-lg" style={{ color: "var(--ink-3)" }}>
        Looks like this envelope is empty.
      </p>
      <button
        className="btn btn-primary btn-lg"
        onClick={() => navigate("/")}
        style={{ marginTop: 8 }}
      >
        Back to Home
      </button>
    </div>
  )
}
