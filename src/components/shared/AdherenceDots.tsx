import { cn } from '@/lib/utils'
import type { DayComplianceStatus } from '@/types/domain'

const toneClass: Record<DayComplianceStatus, string> = {
  completo: 'bg-success',
  parcial: 'bg-warning',
  faltou: 'bg-destructive',
  folga: 'bg-muted-foreground/30',
}

const label: Record<DayComplianceStatus, string> = {
  completo: 'Treino completo',
  parcial: 'Treino parcial',
  faltou: 'Treino perdido',
  folga: 'Dia de folga',
}

/** Visão de aderência em bolinhas por dia — referência: coluna de dias do Home do TrainingPeaks, para ver a carteira inteira sem abrir nenhum atleta. */
export function AdherenceDots({ days }: { days: DayComplianceStatus[] }) {
  return (
    <div className="flex items-center gap-1">
      {days.map((status, i) => (
        <span
          key={i}
          title={label[status]}
          className={cn('h-2.5 w-2.5 rounded-full', toneClass[status])}
        />
      ))}
    </div>
  )
}
