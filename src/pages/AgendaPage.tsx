import { useState } from 'react'
import { CalendarClock, MapPin, Repeat, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { agendaEvents } from '@/data/mock'
import { StatePill } from '@/components/shared/StatusPill'
import { formatDateBR } from '@/lib/utils'
import type { AgendaEvent } from '@/types/domain'

const typeLabel: Record<AgendaEvent['type'], string> = {
  revisao_tecnica: 'Revisão técnica',
  chamada_atleta: 'Chamada com atleta',
  reuniao_equipe: 'Reunião de equipe',
  prova: 'Prova',
  avaliacao: 'Avaliação',
}

export default function AgendaPage() {
  const [view, setView] = useState('semanal')

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-004"
        title="Agenda do Treinador"
        objective="Compromissos técnicos e revisões, com fuso consistente e histórico de mudança (V1)."
        scope="V1"
        actions={<Button size="sm">Criar compromisso</Button>}
      />

      <Tabs value={view} onValueChange={setView} className="mb-4">
        <TabsList>
          <TabsTrigger value="diaria">Diária</TabsTrigger>
          <TabsTrigger value="semanal">Semanal</TabsTrigger>
          <TabsTrigger value="mensal">Mensal</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2">
        {agendaEvents.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex flex-wrap items-center gap-3 p-3">
              <div className="flex w-20 flex-col items-center rounded-md bg-primary/10 py-1.5 text-primary">
                <span className="text-xs font-semibold">{formatDateBR(e.date, { day: '2-digit', month: 'short' })}</span>
                <span className="text-[11px]">{e.time}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{typeLabel[e.type]}</Badge>
                  {e.recurring && <Repeat className="h-3 w-3 text-muted-foreground" />}
                </div>
                <p className="truncate text-sm font-medium">{e.title}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  {e.athleteName && <><Users className="h-3 w-3" /> {e.athleteName} · </>}
                  <MapPin className="h-3 w-3" /> {e.responsible}
                </p>
              </div>
              <StatePill state={e.status} />
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
