import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { athletes, teamMembers, coachDecisions, currentOrg } from '@/data/mock'

export default function InstitutionalDashboardPage() {
  const byCoachLoad = teamMembers.filter((m) => m.athletesCount > 0).map((m) => ({ name: m.name.split(' ')[0], atletas: m.athletesCount }))
  const criticalCases = athletes.filter((a) => a.ira > 55)
  const outcomesCoverage = Math.round((coachDecisions.filter((d) => d.outcomeStatus !== 'pendente').length / coachDecisions.length) * 100)

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-023"
        title="Dashboard do Coordenador e Diretor"
        objective="Visão institucional consolidada — sem ranking raso, com denominadores explicados e drill-down por permissão."
        scope="V0"
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Atletas na organização" value={`${currentOrg.athletesCount}`} />
        <Metric label="Treinadores ativos" value={`${teamMembers.filter((m) => m.status === 'ativo').length}`} />
        <Metric label="Casos críticos abertos" value={`${criticalCases.length}`} tone="text-destructive" />
        <Metric label="Cobertura de decisão" value={`${outcomesCoverage}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Carga por treinador (capacidade)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCoachLoad}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="atletas" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Casos críticos por risco (IRA)</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {criticalCases.length === 0 && <p className="text-xs text-muted-foreground">Nenhum caso crítico no momento.</p>}
            {criticalCases.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-md border p-2 text-xs">
                <span>{a.name}</span>
                <Badge variant="destructive">IRA {a.ira}</Badge>
              </div>
            ))}
            <p className="mt-1 text-[11px] text-muted-foreground">Drill-down completo disponível apenas para diretor técnico e coordenação responsável, conforme alçada (RN-021).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`text-lg font-semibold ${tone ?? ''}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
