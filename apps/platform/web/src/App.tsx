import { useState } from "react"
import { Route, Routes } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { AppSidebar } from "@/components/sidebar-08/app-sidebar"
import { useTheme } from "@/hooks/useTheme"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DashboardPage } from "@/pages/DashboardPage"

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
}

export default function App() {
  const title = BREADCRUMBS[window.location.pathname] ?? "Dashboard"
  const [showNominal, setShowNominal] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <SidebarProvider>
      <AppSidebar theme={theme} setTheme={setTheme} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="flex flex-1 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <button
            onClick={() => setShowNominal((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showNominal ? "Hide amounts" : "Show amounts"}
          >
            {showNominal ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {showNominal ? "Hide amounts" : "Show amounts"}
          </button>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage showNominal={showNominal} />} />
            <Route path="*" element={<DashboardPage showNominal={showNominal} />} />
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
