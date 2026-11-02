import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { athletes, plannedWorkouts, inboxItems } from '@/data/mock'
import { formatDateBR } from '@/lib/utils'

const days = [
  { label: 'Segunda', date: '2026-07-20' },
  { label: 'Terça', date: '2026-07-21' },
  { label: 'Quarta', date: '2026-07-22' },
  { label: 'Quinta', date: '2026-07-23' },
  { label: 'Sexta', date: '2026-07-24' },
  { label: 'Sábado', date: '2026-07-25' },
  { label: 'Domingo', date: '2026-07-26' },
]

export default function AthleteWeekPage() {
  const me = athletes[0]
  const pendingRequest = inboxItems.find((i) => i.athleteId === me.id && i.kind === 'aprovacao')

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-base font-semibold">Minha semana</h1>

      {pendingRequest && (
        <Card className="border-warning/40 bg-warning/10">
          <CardContent className="p-3 text-xs text-warning-foreground/80">
            Sua solicitação — "{pendingRequest.title}" — está com {pendingRequest.slaHoursLeft}h de prazo de resposta do treinador.
          </CardContent>
        </Card>
      )}

      {days.map((d) => {
        const workout = plannedWorkouts.find((w) => w.athleteId === me.id && w.date === d.date)
        return (
          <div key={d.date}>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{d.label} · {formatDateBR(d.date, { day: '2-digit', month: '2-digit' })}</p>
            {workout ? (
              <Link to={`/atleta/treino/${workout.id}`}>
                <Card className="transition-colors hover:border-primary">
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">{workout.name}</p>
                      <p className="text-xs text-muted-foreground">{workout.totalDistanceKm} km</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={workout.status === 'publicado' ? 'default' : 'muted'} className="text-[10px]">{workout.status}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card><CardContent className="p-2.5 text-xs text-muted-foreground">Descanso</CardContent></Card>
            )}
          </div>
        )
      })}
    </div>
  )
}
