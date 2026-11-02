import { Badge } from '@/components/ui/badge'
import type { EntityState, Severity } from '@/types/domain'
import { cn } from '@/lib/utils'

const stateMap: Record<EntityState, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline' | 'muted' }> = {
  rascunho: { label: 'Rascunho', variant: 'muted' },
  pendente: { label: 'Pendente', variant: 'warning' },
  aprovado: { label: 'Aprovado', variant: 'success' },
  rejeitado: { label: 'Rejeitado', variant: 'destructive' },
  concluido: { label: 'Concluído', variant: 'success' },
  cancelado: { label: 'Cancelado', variant: 'muted' },
  arquivado: { label: 'Arquivado', variant: 'outline' },
  publicado: { label: 'Publicado', variant: 'default' },
}

export function StatePill({ state, className }: { state: EntityState; className?: string }) {
  const s = stateMap[state]
  return <Badge variant={s.variant} className={className}>{s.label}</Badge>
}

const severityMap: Record<Severity, { label: string; variant: 'destructive' | 'warning' | 'secondary' | 'muted'; dot: string }> = {
  critico: { label: 'Crítico', variant: 'destructive', dot: 'bg-destructive' },
  importante: { label: 'Importante', variant: 'warning', dot: 'bg-warning' },
  atencao: { label: 'Atenção', variant: 'secondary', dot: 'bg-warning' },
  informativo: { label: 'Informativo', variant: 'muted', dot: 'bg-muted-foreground' },
}

export function SeverityPill({ severity, className }: { severity: Severity; className?: string }) {
  const s = severityMap[severity]
  return (
    <Badge variant={s.variant} className={cn('gap-1.5', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </Badge>
  )
}
