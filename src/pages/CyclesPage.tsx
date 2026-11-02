import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trainingCycles, athletes } from '@/data/mock'
import { formatDateBR } from '@/lib/utils'
import { StatePill } from '@/components/shared/StatusPill'

const trendColor = { construcao: 'bg-primary', pico: 'bg-destructive', polimento: 'bg-success', transicao: 'bg-muted-foreground' } as const

export default function CyclesPage() {
  const cycle = trainingCycles[0]
  const athlete = athletes.find((a) => a.id === cycle.athleteId)

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-010"
        title="Ciclos e Periodização"
        objective="Fases sem sobreposição injustificada, respeitando limites metodológicos e versionamento (RN-003)."
        scope="V0"
        actions={<Button size="sm" onClick={() => toast.success('Nova versão do ciclo criada (simulado)')}>Nova versão</Button>}
      />

      <Card className="mb-4">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{cycle.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{athlete?.name} · {formatDateBR(cycle.startDate)} – {formatDateBR(cycle.endDate)}</p>
          </div>
          <StatePill state={cycle.status} />
        </CardHeader>
      </Card>

      <div className="relative flex flex-col gap-3 border-l-2 border-dashed pl-5">
        {cycle.phases.map((p) => (
          <Card key={p.id} className="relative">
            <span className={`absolute -left-[26px] top-4 h-3 w-3 rounded-full ${trendColor[p.loadTrend]}`} />
            <CardContent className="p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium">{p.name}</p>
                <Badge variant="outline" className="text-[10px] capitalize">{p.loadTrend}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDateBR(p.startDate)} – {formatDateBR(p.endDate)} · {p.focus}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
