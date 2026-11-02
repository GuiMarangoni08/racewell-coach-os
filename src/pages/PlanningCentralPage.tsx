import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { athletes, trainingCycles, goals } from '@/data/mock'
import { parseISODate } from '@/lib/utils'

export default function PlanningCentralPage() {
  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-009"
        title="Central de Planejamento"
        objective="Visão consolidada de atleta/grupo, meta, ciclo/fase, semanas, carga e pendências, com links contextuais para cada etapa."
        scope="V0"
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {athletes.filter((a) => a.status === 'ativo').slice(0, 6).map((a) => {
          const cycle = trainingCycles.find((c) => c.athleteId === a.id)
          const goal = goals.find((g) => g.athleteId === a.id && g.isPrimary)
          const currentPhase = cycle?.phases.find((p) => parseISODate(p.startDate) <= parseISODate('2026-07-20') && parseISODate(p.endDate) >= parseISODate('2026-07-20'))
          return (
            <Card key={a.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{a.name}</CardTitle>
                <Link to={`/atletas/${a.id}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  Perfil <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {cycle ? (
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Meta</span>
                      <span className="font-medium">{goal?.raceName ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ciclo</span>
                      <span className="font-medium">{cycle.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fase atual</span>
                      <Badge variant="outline">{currentPhase?.name ?? '—'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Aderência 28d</span>
                      <span className="font-medium">{a.adherence28d}%</span>
                    </div>
                    {a.alerts > 0 && (
                      <div className="mt-1 flex items-center gap-1.5 rounded-md bg-warning/10 p-1.5 text-warning-foreground/80">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                        {a.alerts} pendência{a.alerts > 1 ? 's' : ''} de dados/alerta
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Sem ciclo ativo — planejamento pendente.</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
