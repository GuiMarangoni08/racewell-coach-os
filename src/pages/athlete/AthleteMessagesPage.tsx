import { useState } from 'react'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { teamMembers } from '@/data/mock'

export default function AthleteMessagesPage() {
  const [draft, setDraft] = useState('')
  const coach = teamMembers.find((t) => t.name === 'Marina Petrucci')

  function send() {
    if (!draft.trim()) return
    toast.success('Mensagem enviada ao seu treinador (simulado)')
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 border-b pb-2">
        <p className="text-sm font-semibold">{coach?.name}</p>
        <p className="text-[10px] text-muted-foreground">{coach?.role}</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        <div className="max-w-[80%] rounded-lg rounded-bl-none bg-muted p-2 text-xs">
          Bom treino ontem! Vi que o pace ficou um pouco acima do previsto nas séries — como você se sentiu?
        </div>
        <div className="ml-auto max-w-[80%] rounded-lg rounded-br-none bg-primary/10 p-2 text-xs">
          Consigo trocar o longão para sábado essa semana? Tenho um compromisso de família no domingo.
        </div>
        <div className="max-w-[80%] rounded-lg rounded-bl-none bg-muted p-2 text-xs">
          Recebi seu pedido, vou revisar o calendário e te respondo ainda hoje.
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Escrever mensagem…" className="h-8 text-xs" />
        <Button size="icon" className="h-8 w-8" onClick={send}><Send className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  )
}
