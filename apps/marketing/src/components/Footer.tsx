import { useNavigate } from "react-router-dom"
import { LogoMark } from "./LogoMark"

export function Footer() {
  const navigate = useNavigate()
  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(path)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 14,
              }}
            >
              <LogoMark size={28} />
              <span style={{ fontWeight: 800, fontSize: 16 }}>Envel</span>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "oklch(70% 0.01 65)",
                lineHeight: 1.6,
                maxWidth: 240,
              }}
            >
              Ask. Budget. Done.
            </p>
          </div>
          <div className="footer-col">
            <div className="footer-col-label">Product</div>
            <a href="/#method">The Method</a>
            <a href="/#features">Features</a>
            <a href="/docs" onClick={go("/docs")}>
              Docs
            </a>
          </div>
          <div className="footer-col">
            <div className="footer-col-label">Learn</div>
            <a href="/blog" onClick={go("/blog")}>
              Blog
            </a>
            <a href="#">Tips & Guides</a>
            <a href="#">Product Updates</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span style={{ fontSize: 13, color: "oklch(55% 0.01 65)" }}>
            © {new Date().getFullYear()} Envel. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}
