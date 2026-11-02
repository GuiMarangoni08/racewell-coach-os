import { useState } from 'react'
import { toast } from 'sonner'
import { CalendarClock, CheckCircle2, MessageSquare, Sparkles, User } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { SeverityPill } from '@/components/shared/StatusPill'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { inboxItems as initialItems } from '@/data/mock'
import type { InboxItem } from '@/types/domain'
import { cn } from '@/lib/utils'

const kindLabel: Record<InboxItem['kind'], string> = {
  analise: 'Análise pronta',
  feedback: 'Feedback do atleta',
  alerta: 'Alerta de saúde',
  mensagem: 'Mensagem',
  aprovacao: 'Aprovação pendente',
}

export default function InboxPage() {
  const [items, setItems] = useState(initialItems)
  const [selected, setSelected] = useState<InboxItem | null>(initialItems[0] ?? null)

  function resolve(item: InboxItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'concluido' } : i)))
    toast.success(`Item de ${item.athleteName} marcado como concluído (simulado)`)
  }

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-003"
        title="Inbox Inteligente"
        objective="Fila priorizada de tudo que exige leitura ou decisão. Nenhum item some sem desfecho."
        scope="V0"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-2 lg:col-span-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className={cn(
                'rounded-lg border p-3 text-left transition-colors',
                selected?.id === item.id ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                item.status === 'concluido' && 'opacity-50',
              )}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-[10px]">{kindLabel[item.kind]}</Badge>
                <SeverityPill severity={item.priority} />
              </div>
              <p className="text-sm font-medium">{item.athleteName}</p>
              <p className="truncate text-xs text-muted-foreground">{item.title}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" /> SLA: {item.slaHoursLeft}h restantes</span>
                <span>{item.createdAt}</span>
              </div>
            </button>
          ))}
        </div>

        <Card className="lg:col-span-3">
          {selected ? (
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline">{kindLabel[selected.kind]}</Badge>
                    <SeverityPill severity={selected.priority} />
                  </div>
                  <h2 className="text-base font-semibold">{selected.title}</h2>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" /> {selected.athleteName} · origem e responsável rastreados
                  </p>
                </div>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">{selected.summary}</p>

              {selected.aiSuggestion && (
                <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Sugestão da IA · confiança {Math.round((selected.aiConfidence ?? 0) * 100)}%
                  </p>
                  <p className="text-sm">{selected.aiSuggestion}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    A IA nunca decide ou publica sozinha — a decisão final é sempre humana e fica registrada no prontuário técnico.
                  </p>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => resolve(selected)}>
                  <CheckCircle2 className="h-4 w-4" /> Aprovar / concluir
                </Button>
                <Button size="sm" variant="outline">Ajustar treino</Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4" /> Responder atleta
                </Button>
                <Button size="sm" variant="ghost">Encaminhar</Button>
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-10 text-center text-sm text-muted-foreground">Selecione um item da fila</CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
