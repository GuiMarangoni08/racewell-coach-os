import { Link } from 'react-router-dom'
import { Bell, Building2, CheckCircle2, Layers, ShieldCheck, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { currentCoach, currentOrg } from '@/data/mock'

const blocks = [
  { icon: Users, title: 'Identidade profissional', summary: `${currentCoach.name} · ${currentCoach.level}`, done: true },
  { icon: Building2, title: 'Papel e organização', summary: currentOrg.name, done: true },
  { icon: Layers, title: 'Metodologia e unidades', summary: 'TRIMP como métrica padrão · zonas por pace/FC', done: true },
  { icon: Users, title: 'Equipe / unidade / grupos', summary: 'Vinculado à unidade São Paulo (matriz)', done: true },
  { icon: Bell, title: 'Preferências e canais', summary: 'In-app + push ativos · e-mail para eventos formais', done: false },
  { icon: ShieldCheck, title: 'Termos e consentimentos', summary: 'Aceite registrado em 15/07/2026', done: true },
]

export default function InitialConfigPage() {
  const doneCount = blocks.filter((b) => b.done).length

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-001"
        title="Configuração Inicial"
        objective="Última etapa antes da Home operacional — confirma papel, metodologia, vínculo, preferências e consentimentos."
        scope="V0"
        actions={<Link to="/"><Button size="sm">Ir para Home</Button></Link>}
      />

      <div className="mb-4">
        <Badge variant={doneCount === blocks.length ? 'success' : 'warning'}>
          {doneCount}/{blocks.length} blocos concluídos
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((b) => (
          <Card key={b.title}>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
              <b.icon className="h-4 w-4 text-primary" />
              <CardTitle>{b.title}</CardTitle>
              {b.done && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{b.summary}</p>
              {!b.done && <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">Completar</Button>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
