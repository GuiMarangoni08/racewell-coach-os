import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { athletes, coachDecisions, currentOrg, weeklyAdherenceTrend, loadHistoryByAthlete } from '@/data/mock'
import { PmcChart, PmcStatePills } from '@/components/shared/PmcChart'

export default function CoachDashboardPage() {
  const activeAthletes = athletes.filter((a) => a.status === 'ativo').length
  const avgAdherence = Math.round(athletes.reduce((s, a) => s + a.adherence28d, 0) / athletes.length)
  const decisionsWithOutcome = coachDecisions.filter((d) => d.outcomeStatus !== 'pendente').length
  const featuredAthlete = athletes[0]
  const featuredLoad = loadHistoryByAthlete[featuredAthlete.id]
  const latestLoad = featuredLoad?.[featuredLoad.length - 1]

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-022"
        title="Dashboard do Treinador"
        objective="Indicadores auditáveis da carteira própria — sem punição automática, com complexidade ponderada."
        scope="V0"
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Carteira ativa" value={`${activeAthletes} / ${athletes.length}`} />
        <Metric label="Aderência média (28d)" value={`${avgAdherence}%`} />
        <Metric label="Cobertura de decisão" value={`${decisionsWithOutcome}/${coachDecisions.length}`} />
        <Metric label="Organização" value={currentOrg.name} small />
      </div>

      <Card className="mb-4">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Condicionamento em destaque — {featuredAthlete.name}</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Fitness (CTL) / Fadiga (ATL) / Forma (TSB), a partir da carga diária (TSS)</p>
          </div>
          <div className="flex items-center gap-2">
            {latestLoad && <PmcStatePills latest={latestLoad} />}
            <Link to={`/atletas/${featuredAthlete.id}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
              Ver perfil <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>{featuredLoad && <PmcChart data={featuredLoad} />}</CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Aderência semanal — previsto x realizado</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAdherenceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="previsto" fill="hsl(var(--muted-foreground))" radius={4} name="Previsto (%)" />
                <Bar dataKey="realizado" fill="hsl(var(--primary))" radius={4} name="Realizado (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Distribuição de risco (IRA) da carteira</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {athletes
              .slice()
              .sort((a, b) => b.ira - a.ira)
              .map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  <span className="w-32 truncate text-xs">{a.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${a.ira > 55 ? 'bg-destructive' : a.ira > 35 ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${a.ira}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-muted-foreground">{a.ira}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Metric({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={small ? 'truncate text-sm font-semibold' : 'text-lg font-semibold'}>{value}</p>
      </CardContent>
    </Card>
  )
}
