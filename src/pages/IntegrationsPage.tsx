import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { integrationStatuses } from '@/data/mock'

const healthVariant = { ok: 'success', atencao: 'warning', falha: 'destructive' } as const

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-025"
        title="Integrações e Qualidade dos Dados"
        objective="Fonte principal por tipo de dado, nunca uma fonte global única. Desconectar não apaga histórico já autorizado (RN-022)."
        scope="V0"
      />

      <div className="flex flex-col gap-2">
        {integrationStatuses.map((i) => (
          <Card key={i.provider}>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <div className="w-32 font-medium">{i.provider}</div>
              <Badge variant={healthVariant[i.health]} className="capitalize">{i.health}</Badge>
              <span className="text-xs text-muted-foreground">{i.connectedAthletes} atletas conectados</span>
              <span className="text-xs text-muted-foreground">Última sync: {i.lastSync}</span>
              {i.duplicatesFound > 0 && (
                <Badge variant="warning" className="text-[10px]">{i.duplicatesFound} duplicados a reconciliar</Badge>
              )}
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.info(`Reprocessando ${i.provider} (simulado)`)}>Reprocessar</Button>
                <Button size="sm" variant="ghost">Ver logs</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardContent className="p-4 text-xs text-muted-foreground">
          Prioridade de fonte por tipo de dado (exemplo): frequência cardíaca → Garmin &gt; Strava &gt; manual · pace/distância →
          Strava &gt; Garmin &gt; CSV · qualidade acompanha o dado em todas as telas onde ele é usado (RN aplicável desta tela).
        </CardContent>
      </Card>
    </div>
  )
}
