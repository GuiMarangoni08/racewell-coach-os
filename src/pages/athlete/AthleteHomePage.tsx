import { Link } from 'react-router-dom'
import { CalendarClock, ChevronRight, Flag, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { athletes, plannedWorkouts, currentOrg, teamMembers } from '@/data/mock'
import { formatDateBR, parseISODate } from '@/lib/utils'

export default function AthleteHomePage() {
  const me = athletes[0]
  const coach = teamMembers.find((t) => t.name === 'Marina Petrucci')
  const todayWorkout = plannedWorkouts.find((w) => w.athleteId === me.id && w.date === '2026-07-21')

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-muted-foreground">Boa tarde,</p>
        <h1 className="text-lg font-semibold">{me.name.split(' ')[0]} 👋</h1>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-primary">
            <Flag className="h-3.5 w-3.5" /> Meta principal
          </div>
          <p className="text-sm font-semibold">{me.goalRace}</p>
          <p className="text-xs text-muted-foreground">{formatDateBR(me.goalDate)} · faltam {Math.round((parseISODate(me.goalDate).getTime() - parseISODate('2026-07-21').getTime()) / 86400000)} dias</p>
        </CardContent>
      </Card>

      {todayWorkout ? (
        <Link to={`/atleta/treino/${todayWorkout.id}`}>
          <Card className="transition-colors hover:border-primary">
            <CardContent className="p-3">
              <div className="mb-1 flex items-center justify-between">
                <Badge>Treino de hoje</Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">{todayWorkout.name}</p>
              <p className="text-xs text-muted-foreground">{todayWorkout.totalDistanceKm} km · ~{todayWorkout.totalDurationMin} min</p>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <Card><CardContent className="p-3 text-xs text-muted-foreground">Sem treino publicado para hoje — dia de descanso ou aguardando plano.</CardContent></Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Aderência 7 dias</p><p className="text-lg font-semibold">{me.adherence7d}%</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Recuperação (RRS)</p><p className="text-lg font-semibold">{me.rrs}/100</p></CardContent></Card>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-3">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-primary"><Sparkles className="h-3.5 w-3.5" /> AI Coach</p>
          <p className="text-xs text-muted-foreground">Sua recuperação está boa. Mantenha o pace de Z2 no treino de amanhã e priorize o sono após o intervalado de hoje.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">MP</div>
          <div className="flex-1">
            <p className="text-xs font-medium">Seu treinador: {coach?.name}</p>
            <p className="text-[10px] text-muted-foreground">{currentOrg.name}</p>
          </div>
          <Link to="/atleta/mensagens">
            <Button size="sm" variant="outline" className="h-7 text-[11px]">Mensagem</Button>
          </Link>
        </CardContent>
      </Card>

      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <CalendarClock className="h-3 w-3" /> Plano publicado e sincronizado com seu treinador em tempo real.
      </p>
    </div>
  )
}
