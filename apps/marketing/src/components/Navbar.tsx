import { Link, useNavigate } from "react-router-dom"
import { LogoMark } from "./LogoMark"

export function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className="nav">
      <div className="container">
        <div className="nav-inner">
          <Link
            to="/"
            className="nav-logo"
            onClick={(e) => {
              e.preventDefault()
              navigate("/")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          >
            <LogoMark size={28} />
            <span>Envel</span>
          </Link>

          <div className="nav-links">
            <div className="dropdown-trigger">
              <button className="btn btn-ghost" style={{ fontSize: 14, fontWeight: 600 }}>
                What is Envel? <span className="chevron">▾</span>
              </button>
              <div className="dropdown">
                <a href="/#method">The Method</a>
                <a href="/#features">Features</a>
                <a
                  href="/docs"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate("/docs")
                  }}
                >
                  Docs
                </a>
              </div>
            </div>
            <div className="dropdown-trigger">
              <button className="btn btn-ghost" style={{ fontSize: 14, fontWeight: 600 }}>
                Learn <span className="chevron">▾</span>
              </button>
              <div className="dropdown">
                <a
                  href="/blog"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate("/blog")
                  }}
                >
                  Blog
                </a>
                <a href="#">Tips & Guides</a>
                <a href="#">Product Updates</a>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ fontSize: 13.5, padding: "9px 20px" }}
            onClick={() => {
              window.location.href = "/app"
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}
