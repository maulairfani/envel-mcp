import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface BackupStatus {
  connected: boolean
  google_email?: string
  last_backup_at?: string | null
}

export function useBackupStatus() {
  return useQuery({
    queryKey: ["backup-status"],
    queryFn: () => api<BackupStatus>("/api/backup/status"),
  })
}

export function useTriggerBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api<{ ok: boolean; file_id?: string }>("/api/backup/trigger", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-status"] })
    },
  })
}
