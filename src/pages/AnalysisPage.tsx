import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { athletes, completedWorkouts, plannedWorkouts } from '@/data/mock'

export default function AnalysisPage() {
  const { athleteId } = useParams()
  const athlete = athletes.find((a) => a.id === athleteId) ?? athletes[0]
  const planned = plannedWorkouts.find((w) => w.athleteId === athlete.id && w.status === 'publicado')
  const completed = completedWorkouts.find((w) => w.plannedWorkoutId === planned?.id)

  const splits = [
    { km: 1, previsto: 300, realizado: 296 },
    { km: 2, previsto: 300, realizado: 302 },
    { km: 3, previsto: 300, realizado: 298 },
    { km: 4, previsto: 300, realizado: 304 },
    { km: 5, previsto: 240, realizado: 246 },
  ]

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-015"
        title="Análise Previsto x Realizado"
        objective="Compara os mesmos quilômetros por pace, FC, potência e cadência, com confiança e limitações visíveis."
        scope="V0"
        actions={<Badge variant="outline">{athlete.name}</Badge>}
      />

      {planned && completed ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Splits — pace por km (segundos)</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={splits}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="km" tickFormatter={(v) => `${v}km`} fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="previsto" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" name="Previsto" />
                  <Line type="monotone" dataKey="realizado" stroke="hsl(var(--primary))" strokeWidth={2} name="Realizado" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Card>
              <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <Metric label="Distância" value={`${completed.distanceKm} km`} />
                <Metric label="Duração" value={`${completed.durationMin} min`} />
                <Metric label="Pace médio" value={`${completed.avgPace}/km`} />
                <Metric label="FC média" value={`${completed.avgHr} bpm`} />
                <Metric label="RPE" value={`${completed.rpe}/10`} />
                <Metric label="Confiança" value={`${Math.round(completed.confidence * 100)}%`} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Fonte e ambiente</CardTitle></CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Fonte: <span className="capitalize">{completed.source}</span> · Dados parciais sinalizados quando aplicável (RN-013). Pareamento pelo mesmo treino planejado ({planned.name}).
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">Sem treino publicado com realizado pareado para este atleta ainda.</CardContent></Card>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
