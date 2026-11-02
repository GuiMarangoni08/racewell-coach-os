import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CalendarClock, Flag, Inbox, TrendingUp, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { athletes, inboxItems, kpisHome, currentCoach } from '@/data/mock'
import { SeverityPill } from '@/components/shared/StatusPill'

const kpis = [
  { label: 'Atletas com pendência hoje', value: kpisHome.athletesToday, icon: Users, tone: 'text-foreground' },
  { label: 'Itens na Inbox', value: kpisHome.pendingInbox, icon: Inbox, tone: 'text-foreground' },
  { label: 'Alertas críticos abertos', value: kpisHome.criticalAlerts, icon: AlertTriangle, tone: 'text-destructive' },
  { label: 'Aderência da semana', value: `${kpisHome.adherenceWeek}%`, icon: TrendingUp, tone: 'text-success' },
  { label: 'Provas nos próximos 30 dias', value: kpisHome.upcomingRaces, icon: Flag, tone: 'text-foreground' },
]

const priorityAthletes = [...athletes].sort((a, b) => b.alerts - a.alerts || a.adherence7d - b.adherence7d).slice(0, 5)

export default function HomePage() {
  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-002"
        title={`Bom dia, ${currentCoach.name.split(' ')[0]}`}
        objective="Prioridades reais do dia — o que precisa da sua decisão agora, não um painel de vaidade."
        scope="V0"
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-md bg-primary/10 p-2">
                <k.icon className={`h-4 w-4 ${k.tone}`} />
              </div>
              <div>
                <p className="text-lg font-semibold leading-none">{k.value}</p>
                <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Atletas prioritários</CardTitle>
            <Link to="/atletas" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {priorityAthletes.map((a) => (
              <Link
                key={a.id}
                to={`/atletas/${a.id}`}
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">{a.avatarInitials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.goalRace} · aderência 7d {a.adherence7d}%</p>
                </div>
                {a.alerts > 0 && <Badge variant="destructive">{a.alerts} alerta{a.alerts > 1 ? 's' : ''}</Badge>}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Inbox — próximos por SLA</CardTitle>
            <Link to="/inbox" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Abrir <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {inboxItems
              .slice()
              .sort((a, b) => a.slaHoursLeft - b.slaHoursLeft)
              .slice(0, 4)
              .map((i) => (
                <div key={i.id} className="rounded-md border p-2.5">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <SeverityPill severity={i.priority} />
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <CalendarClock className="h-3 w-3" /> {i.slaHoursLeft}h
                    </span>
                  </div>
                  <p className="truncate text-xs font-medium">{i.athleteName}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{i.title}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
