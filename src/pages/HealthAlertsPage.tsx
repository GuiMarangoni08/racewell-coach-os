import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Eye } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { healthAlerts as initial } from '@/data/mock'
import { SeverityPill } from '@/components/shared/StatusPill'

const statusVariant = { aberto: 'destructive', reconhecido: 'warning', resolvido: 'success' } as const

export default function HealthAlertsPage() {
  const [alerts, setAlerts] = useState(initial)

  function updateStatus(id: string, status: 'reconhecido' | 'resolvido') {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    toast.success(`Alerta marcado como ${status} — ação registrada (simulado)`)
  }

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-018"
        title="Alertas, Saúde e Disponibilidade"
        objective="A IA nunca diagnostica — apenas sinaliza risco com evidências. Dados médicos seguem segregação por consentimento e finalidade."
        scope="V0 simplificado"
      />

      <div className="flex flex-col gap-3">
        {alerts.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <SeverityPill severity={a.severity} />
                    <Badge variant={statusVariant[a.status]} className="capitalize">{a.status}</Badge>
                  </div>
                  <p className="font-medium">{a.athleteName} — {a.type}</p>
                  <p className="text-sm text-muted-foreground">{a.message}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{a.createdAt}</span>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {a.evidence.map((e) => (
                  <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>
                ))}
              </div>

              <div className="flex gap-2">
                {a.status === 'aberto' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'reconhecido')}>
                    <Eye className="h-3.5 w-3.5" /> Reconhecer
                  </Button>
                )}
                {a.status !== 'resolvido' && (
                  <Button size="sm" onClick={() => updateStatus(a.id, 'resolvido')}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Marcar resolvido
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
