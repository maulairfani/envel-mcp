import { HardDrive, RefreshCw, Unlink } from "lucide-react"
import { useBackupStatus, useTriggerBackup } from "@/hooks/useBackup"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function formatDate(iso: string | null | undefined) {
  if (!iso) return "Never"
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function SettingsPage() {
  const { data: status, isLoading } = useBackupStatus()
  const triggerBackup = useTriggerBackup()
  const queryClient = useQueryClient()

  const disconnect = useMutation({
    mutationFn: () => api("/api/backup/google/disconnect", { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backup-status"] }),
  })

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h2 className="text-base font-semibold">Settings</h2>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Manage your account preferences
        </p>
      </div>

      {/* Google Drive Backup */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HardDrive className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Google Drive Backup</p>
              <p className="text-[12px] text-muted-foreground">
                Automatically back up your database daily
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading ? (
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          ) : status?.connected ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                    Connected
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {status.google_email}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"
                >
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Last backup</span>
                <span className="font-medium">{formatDate(status.last_backup_at)}</span>
              </div>

              <p className="text-[12px] text-muted-foreground">
                Backups run daily at 02:00 UTC. Last 7 backups are kept.
              </p>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => triggerBackup.mutate()}
                  disabled={triggerBackup.isPending}
                >
                  <RefreshCw className={`size-3.5 ${triggerBackup.isPending ? "animate-spin" : ""}`} />
                  {triggerBackup.isPending ? "Backing up…" : "Back up now"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => disconnect.mutate()}
                  disabled={disconnect.isPending}
                >
                  <Unlink className="size-3.5" />
                  Disconnect
                </Button>
              </div>

              {triggerBackup.isSuccess && (
                <p className="text-[12px] text-emerald-600 dark:text-emerald-400">
                  Backup completed successfully.
                </p>
              )}
              {triggerBackup.isError && (
                <p className="text-[12px] text-destructive">
                  {triggerBackup.error?.message ?? "Backup failed."}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-[13px] text-muted-foreground">
                Connect your Google account to enable automatic daily backups to Google Drive.
                Backups are stored in an <strong>Envel Backup</strong> folder, keeping the last 7 copies.
              </p>
              <Button
                size="sm"
                className="w-fit gap-2"
                onClick={() => {
                  window.location.href = "/api/backup/google/connect"
                }}
              >
                <svg width="15" height="15" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Connect Google Drive
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
