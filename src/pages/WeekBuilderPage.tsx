import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { plannedWorkouts, athletes } from '@/data/mock'
import { StatePill } from '@/components/shared/StatusPill'

const weekDays = [
  { label: 'Segunda', date: '2026-07-20' },
  { label: 'Terça', date: '2026-07-21' },
  { label: 'Quarta', date: '2026-07-22' },
  { label: 'Quinta', date: '2026-07-23' },
  { label: 'Sexta', date: '2026-07-24' },
  { label: 'Sábado', date: '2026-07-25' },
  { label: 'Domingo', date: '2026-07-26' },
]

export default function WeekBuilderPage() {
  const athlete = athletes[0]
  const totalKm = plannedWorkouts.reduce((s, w) => s + w.totalDistanceKm, 0)
  const zoneDistribution = [
    { zone: 'Z1/Z2', pct: 68 },
    { zone: 'Z3', pct: 12 },
    { zone: 'Z4/Z5', pct: 20 },
  ]

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-011"
        title="Semana de Treino"
        objective={`Microprogramação de ${athlete.name}. Publicação congela versão; mudança notifica o atleta; totais são sempre recalculados (RN-011).`}
        scope="V0"
        actions={<Button size="sm" onClick={() => toast.success('Semana publicada (simulado)')}>Publicar semana</Button>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Volume total</p><p className="text-lg font-semibold">{totalKm} km</p></CardContent></Card>
        {zoneDistribution.map((z) => (
          <Card key={z.zone}><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">{z.zone}</p><p className="text-lg font-semibold">{z.pct}%</p></CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
        {weekDays.map((d) => {
          const dayWorkouts = plannedWorkouts.filter((w) => w.date === d.date)
          return (
            <Card key={d.date} className="min-h-[170px]">
              <CardHeader className="pb-1"><CardTitle className="text-[11px] font-medium text-muted-foreground">{d.label}</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-1.5 p-2 pt-0">
                {dayWorkouts.length === 0 && <p className="text-[10px] text-muted-foreground">Descanso / livre</p>}
                {dayWorkouts.map((w) => (
                  <div key={w.id} className="rounded-md border p-1.5 text-[11px]">
                    <p className="font-medium">{w.name}</p>
                    <p className="text-muted-foreground">{w.totalDistanceKm}km</p>
                    <StatePill state={w.status} className="mt-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-3">
        <Badge variant="outline">Treinos-chave: Intervalado 6x1000m · Longão 28km com progressão</Badge>
      </div>
    </div>
  )
}
