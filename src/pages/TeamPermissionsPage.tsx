import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { teamMembers } from '@/data/mock'
import { formatDateBR } from '@/lib/utils'

const levels = [
  { level: 'Nível 1 — Treinador', can: 'Cadastrar/acompanhar atletas vinculados; montar, publicar e ajustar treinos dentro da metodologia', cannot: 'Acessar outras carteiras; alterar metodologia institucional' },
  { level: 'Nível 2 — Coordenador Técnico', can: 'Tudo do N1 na própria carteira; revisar casos; aprovar exceções; redistribuir atletas', cannot: 'Alterar governança geral; publicar metodologia institucional definitiva' },
  { level: 'Nível 3 — Diretor Técnico', can: 'Definir metodologia, templates, limites, alçadas e protocolos institucionais', cannot: 'Ações administrativas legais/financeiras reservadas ao administrador' },
  { level: 'Administrador', can: 'Usuários, convites, plano, integrações, unidades e segurança', cannot: 'Tomar decisão técnica ou acessar notas/dados de saúde sem finalidade' },
]

const statusVariant = { ativo: 'success', pendente: 'warning', desligado: 'muted' } as const

export default function TeamPermissionsPage() {
  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-024"
        title="Equipe, Hierarquia e Permissões"
        objective="Menor privilégio, efeito imediato de mudança de nível e autoria sempre preservada (RN-021/RN-028)."
        scope="V0"
        actions={<Button size="sm">Convidar treinador</Button>}
      />

      <Card className="mb-4">
        <CardHeader><CardTitle>Usuários da organização</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Atletas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vínculo desde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-xs">{m.role}</TableCell>
                  <TableCell className="text-xs">{m.athletesCount || '—'}</TableCell>
                  <TableCell><Badge variant={statusVariant[m.status]} className="capitalize">{m.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateBR(m.since)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Matriz de alçadas por nível</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {levels.map((l) => (
            <div key={l.level} className="rounded-lg border p-3">
              <p className="mb-1 text-sm font-medium">{l.level}</p>
              <p className="text-xs text-success-foreground/80"><span className="font-medium text-success">Pode:</span> {l.can}</p>
              <p className="text-xs text-muted-foreground"><span className="font-medium text-destructive">Não pode sem alçada superior:</span> {l.cannot}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
