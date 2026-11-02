import { useState } from 'react'
import { toast } from 'sonner'
import { Lock, Paperclip, Send } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { messageThreads } from '@/data/mock'
import { cn } from '@/lib/utils'

const slaVariant = { dentro: 'success', proximo: 'warning', estourado: 'destructive' } as const

export default function MessagesPage() {
  const [selected, setSelected] = useState(messageThreads[0])
  const [draft, setDraft] = useState('')
  const [isNote, setIsNote] = useState(false)

  function send() {
    if (!draft.trim()) return
    toast.success(isNote ? 'Nota interna registrada (simulado, atleta não vê)' : 'Mensagem enviada (simulado)')
    setDraft('')
  }

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-016"
        title="Feedbacks e Mensagens"
        objective="Mensagens e notas internas são canais distintos. Envio é sempre humano."
        scope="V0"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-2 lg:col-span-2">
          {messageThreads.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={cn('rounded-lg border p-3 text-left', selected.id === t.id ? 'border-primary bg-primary/5' : 'hover:bg-accent')}
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium">{t.athleteName}</p>
                {t.unread > 0 && <Badge>{t.unread}</Badge>}
              </div>
              <p className="truncate text-xs text-muted-foreground">{t.lastMessage}</p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{t.lastAt}</span>
                <Badge variant={slaVariant[t.slaStatus]} className="text-[9px]">SLA {t.slaStatus}</Badge>
              </div>
            </button>
          ))}
        </div>

        <Card className="flex flex-col lg:col-span-3">
          <CardContent className="flex flex-1 flex-col p-4">
            <div className="mb-3 border-b pb-2">
              <p className="text-sm font-semibold">{selected.athleteName}</p>
              <p className="text-xs text-muted-foreground">Templates disponíveis · anexos permitidos · leitura rastreada</p>
            </div>

            <div className="flex-1 space-y-2 py-2">
              <div className="max-w-[75%] rounded-lg rounded-bl-none bg-muted p-2 text-xs">{selected.lastMessage}</div>
              <div className="ml-auto max-w-[75%] rounded-lg rounded-br-none bg-primary/10 p-2 text-xs">Entendido, vamos revisar isso na próxima análise. Consegue enviar um vídeo curto da corrida?</div>
              <div className="mx-auto flex max-w-[85%] items-center gap-1.5 rounded-md border border-dashed p-2 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Nota interna (não visível ao atleta): acompanhar evolução na próxima semana antes de qualquer ajuste de carga.
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Button size="sm" variant={isNote ? 'default' : 'outline'} onClick={() => setIsNote((v) => !v)} className="shrink-0">
                <Lock className="h-3.5 w-3.5" /> {isNote ? 'Nota interna' : 'Mensagem'}
              </Button>
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={isNote ? 'Escrever nota interna…' : 'Escrever mensagem…'} />
              <Button size="icon" variant="ghost"><Paperclip className="h-4 w-4" /></Button>
              <Button size="icon" onClick={send}><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
