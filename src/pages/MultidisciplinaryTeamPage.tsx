import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { multidisciplinaryTasks } from '@/data/mock'
import { StatePill } from '@/components/shared/StatusPill'

const professionals = [
  { name: 'Dra. Renata Souza', module: 'Fisioterapia', athletesCount: 3 },
  { name: 'Dr. Paulo Vieira', module: 'Medicina esportiva', athletesCount: 2 },
  { name: 'Camila Fontes', module: 'Psicologia esportiva', athletesCount: 1 },
]

export default function MultidisciplinaryTeamPage() {
  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-019"
        title="Equipe Multidisciplinar"
        objective="Cada profissional decide apenas na sua área; consentimento é granular e divergências ficam rastreáveis (V1)."
        scope="V1"
        actions={<Button size="sm" variant="outline">Convidar profissional</Button>}
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {professionals.map((p) => (
          <Card key={p.name}>
            <CardContent className="p-3">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.module}</p>
              <Badge variant="outline" className="mt-2 text-[10px]">{p.athletesCount} atletas autorizados</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Tarefas por módulo</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {multidisciplinaryTasks.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
              <Badge variant="outline" className="text-[10px]">{t.module}</Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.athleteName}</p>
                <p className="text-xs text-muted-foreground">{t.task} · {t.professional}</p>
              </div>
              {t.consentGranted ? (
                <Badge variant="success" className="text-[10px]">Consentimento concedido</Badge>
              ) : (
                <Badge variant="warning" className="text-[10px]">Consentimento pendente</Badge>
              )}
              <StatePill state={t.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
