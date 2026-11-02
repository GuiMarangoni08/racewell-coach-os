import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { caseLibrary } from '@/data/mock'

const outcomeVariant = { favoravel: 'success', neutro: 'muted', desfavoravel: 'destructive' } as const

export default function CaseLibraryPage() {
  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-020"
        title="Biblioteca de Casos"
        objective="Casos anonimizados com decisão e outcome — nunca prescreve automaticamente, apenas informa por similaridade."
        scope="V0"
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {caseLibrary.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{c.anonymizedProfile}</CardTitle>
              <Badge variant="outline" className="text-[10px]">{Math.round(c.similarity * 100)}% similar</Badge>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-xs text-muted-foreground">{c.contextSummary}</p>
              <p className="mb-1 text-xs"><span className="font-medium">Decisão:</span> {c.decision}</p>
              <div className="mb-2 flex flex-wrap gap-1">
                {c.factors.map((f) => <Badge key={f} variant="muted" className="text-[10px]">{f}</Badge>)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <Badge variant={outcomeVariant[c.outcome]} className="text-[10px] capitalize">{c.outcome}</Badge>
                <span>{c.evidence}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
