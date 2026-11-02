import { useState } from 'react'
import { CheckCircle2, Clock, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { coachDecisions } from '@/data/mock'
import type { CoachDecision } from '@/types/domain'

const outcomeLabel: Record<CoachDecision['outcomeStatus'], { label: string; variant: 'success' | 'warning' | 'muted' | 'destructive' }> = {
  favoravel: { label: 'Outcome favorável', variant: 'success' },
  neutro: { label: 'Outcome neutro', variant: 'muted' },
  desfavoravel: { label: 'Outcome desfavorável', variant: 'destructive' },
  pendente: { label: 'Outcome pendente', variant: 'warning' },
}

export default function DecisionEnginePage() {
  const [selected, setSelected] = useState<CoachDecision>(coachDecisions[0])

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-017"
        title="Prontuário Técnico e Decision Engine"
        objective="Toda decisão tem outcome registrado ou pendente com data de revisão. Fechamento é imutável — correções viram adendo (RN-015/RN-016)."
        scope="V0"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-2 lg:col-span-2">
          {coachDecisions.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className={`rounded-lg border p-3 text-left transition-colors ${selected.id === d.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
            >
              <p className="text-sm font-medium">{d.athleteName}</p>
              <p className="text-xs text-muted-foreground">{d.type}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <Badge variant={outcomeLabel[d.outcomeStatus].variant} className="text-[10px]">{outcomeLabel[d.outcomeStatus].label}</Badge>
                <Badge variant="outline" className="text-[10px]">v{d.version}</Badge>
              </div>
            </button>
          ))}
        </div>

        <Card className="lg:col-span-3">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">{selected.athleteName}</h2>
                <p className="text-xs text-muted-foreground">{selected.type}</p>
              </div>
              <Badge variant={outcomeLabel[selected.outcomeStatus].variant}>{outcomeLabel[selected.outcomeStatus].label}</Badge>
            </div>

            <div className="mb-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Sugestão da IA · confiança {Math.round(selected.aiConfidence * 100)}%
              </p>
              <p className="text-sm">{selected.aiSuggestion}</p>
            </div>

            <div className="mb-3">
              <p className="mb-1 text-xs font-medium">Decisão humana</p>
              <p className="text-sm">{selected.humanDecision}</p>
            </div>

            <div className="mb-3">
              <p className="mb-1 text-xs font-medium">Justificativa</p>
              <p className="text-sm text-muted-foreground">{selected.justification}</p>
            </div>

            {selected.outcomeNotes && (
              <div className="mb-3 rounded-lg border border-success/30 bg-success/5 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-success-foreground/90">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Outcome registrado
                </p>
                <p className="text-sm">{selected.outcomeNotes}</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>Autor: {selected.author}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {selected.closedAt ? `Fechado em ${selected.closedAt}` : 'Em aberto'}</span>
            </div>

            <div className="mt-4 flex gap-2">
              {!selected.closedAt && <Button size="sm">Fechar prontuário</Button>}
              <Button size="sm" variant="outline">Registrar outcome</Button>
              <Button size="sm" variant="ghost">Ver histórico de versões</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
