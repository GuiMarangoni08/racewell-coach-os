import type { ReactNode } from 'react'
import { AlertTriangle, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type NoticeKind = 'loading' | 'error' | 'conflict' | 'empty'

export function OperationalNotice({
  kind,
  title,
  message,
  onRetry,
  action,
}: {
  kind: NoticeKind
  title: string
  message?: string
  onRetry?: () => void
  action?: ReactNode
}) {
  const isLoading = kind === 'loading'
  const Icon = isLoading ? LoaderCircle : AlertTriangle
  return (
    <section
      role={isLoading ? 'status' : kind === 'empty' ? 'status' : 'alert'}
      aria-live="polite"
      className={`flex flex-col items-start gap-2 rounded-lg border p-4 ${
        kind === 'conflict' ? 'border-warning/50 bg-warning/10' :
          kind === 'error' ? 'border-destructive/50 bg-destructive/10' :
            kind === 'empty' ? 'border-dashed bg-card' : 'bg-card'
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {kind !== 'empty' && <Icon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
        <span>{title}</span>
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
      {(onRetry || action) && (
        <div className="mt-1 flex gap-2">
          {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Tentar novamente</Button>}
          {action}
        </div>
      )}
    </section>
  )
}
