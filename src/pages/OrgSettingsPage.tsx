import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormBlockCard } from '@/components/shared/FormBlockCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function OrgSettingsPage() {
  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-026"
        title="Configurações da Assessoria e Metodologia"
        objective="Toda mudança preserva histórico, explicita impactos e deixa a versão vigente inequívoca."
        scope="V0"
        actions={<Button size="sm" onClick={() => toast.success('Nova versão da configuração publicada (simulado)')}>Publicar alterações</Button>}
      />

      <Tabs defaultValue="identidade">
        <TabsList>
          <TabsTrigger value="identidade">Identidade</TabsTrigger>
          <TabsTrigger value="zonas">Zonas e limites</TabsTrigger>
          <TabsTrigger value="sla">SLAs</TabsTrigger>
          <TabsTrigger value="alcadas">Alçadas</TabsTrigger>
        </TabsList>

        <TabsContent value="identidade">
          <FormBlockCard
            title="Identidade da assessoria"
            fields={[
              { label: 'Nome público', value: 'Vértice Endurance' },
              { label: 'Cor primária', value: '#E85D2A' },
              { label: 'White label', value: 'Não contratado' },
            ]}
          />
        </TabsContent>

        <TabsContent value="zonas">
          <Card>
            <CardHeader><CardTitle>Metodologia de carga</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <p className="mb-2">Métrica institucional padrão: <Badge>TRIMP</Badge> (D-007) — a assessoria pode definir política própria versionada.</p>
              <p className="text-xs text-muted-foreground">Nomenclatura de zonas: Z1 Regenerativo · Z2 Base aeróbica · Z3 Limiar · Z4 VO2máx · Z5 Anaeróbico.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla">
          <Card>
            <CardHeader><CardTitle>SLA padrão (D-002)</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div><p className="text-[11px] text-muted-foreground">Crítico</p><p className="font-semibold">2h</p></div>
              <div><p className="text-[11px] text-muted-foreground">Importante</p><p className="font-semibold">8h úteis</p></div>
              <div><p className="text-[11px] text-muted-foreground">Atenção</p><p className="font-semibold">24h</p></div>
              <div><p className="text-[11px] text-muted-foreground">Informativo</p><p className="font-semibold">Sem SLA rígido</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alcadas">
          <Card>
            <CardHeader><CardTitle>Alçada para exceções ao protocolo (D-001)</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Desvio moderado → aprovação do Coordenador Técnico. Desvio crítico → aprovação do Diretor Técnico.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
