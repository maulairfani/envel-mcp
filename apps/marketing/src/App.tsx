import { Route, Routes, useLocation } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { HomePage } from "@/pages/HomePage"
import { BlogPage } from "@/pages/BlogPage"
import { DocsPage } from "@/pages/DocsPage"
import { NotFoundPage } from "@/pages/NotFoundPage"

export default function App() {
  const { pathname } = useLocation()
  const hideFooter = pathname.startsWith("/docs")

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  )
}
