import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { coachMemoryItems } from '@/data/mock'

const statusVariant = { proposto: 'warning', aprovado: 'success', rejeitado: 'muted' } as const
const impactVariant = { alto: 'destructive', medio: 'warning', baixo: 'muted' } as const

export default function CoachMemoryPage() {
  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-021"
        title="Memória do Treinador e da Assessoria"
        objective="Nenhum padrão aprendido influencia sugestões sem origem, confiança e governança explícitas. Memória rejeitada não influencia (V1)."
        scope="V1"
      />

      <div className="flex flex-col gap-3">
        {coachMemoryItems.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="font-medium">{m.pattern}</p>
                <Badge variant={statusVariant[m.status]} className="shrink-0 capitalize">{m.status}</Badge>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">Origem: {m.origin} · Proprietário: {m.owner}</p>
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">Confiança {Math.round(m.confidence * 100)}%</Badge>
                <Badge variant={impactVariant[m.impact]} className="text-[10px] capitalize">Impacto {m.impact}</Badge>
              </div>
              {m.status === 'proposto' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => toast.success('Padrão aprovado pela governança (simulado)')}>Aprovar</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info('Padrão rejeitado — não influenciará sugestões (simulado)')}>Rejeitar</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
