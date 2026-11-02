import { AlertCircle, CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ChecklistStep } from '@/types/domain'

export function ChecklistCard({ title, steps }: { title: string; steps: ChecklistStep[] }) {
  const done = steps.filter((s) => s.done).length
  const blockingLeft = steps.filter((s) => s.blocking && !s.done).length

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <Badge variant={blockingLeft > 0 ? 'warning' : 'success'}>
          {done}/{steps.length} concluídos
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {steps.map((s) => (
          <div key={s.id} className="flex items-start gap-2 text-sm">
            {s.done ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            ) : s.blocking ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className={s.done ? 'text-muted-foreground line-through' : ''}>{s.label}</span>
            {s.blocking && !s.done && <Badge variant="outline" className="ml-auto text-[9px]">bloqueante</Badge>}
          </div>
        ))}
        {blockingLeft > 0 && (
          <p className="mt-2 rounded-md bg-warning/10 p-2 text-xs text-warning-foreground/80">
            {blockingLeft} pendência{blockingLeft > 1 ? 's' : ''} bloqueante{blockingLeft > 1 ? 's' : ''} — a conclusão do onboarding fica retida até serem resolvidas.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
