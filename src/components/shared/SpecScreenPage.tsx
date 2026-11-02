import { CheckCircle2, LayoutPanelTop } from 'lucide-react'
import type { ScreenSpec } from '@/data/screens'
import { PageHeader } from './PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const canonicalStates = ['Carregando', 'Vazio orientado', 'Preenchido', 'Parcial', 'Erro', 'Sem permissão']

export function SpecScreenPage({ spec, actions }: { spec: ScreenSpec; actions?: { label: string; primary?: boolean }[] }) {
  return (
    <div>
      <PageHeader
        code={spec.code}
        title={spec.title}
        objective={spec.objective}
        scope={spec.scope}
        actions={
          <TooltipProvider>
            {(actions ?? [{ label: 'Ação principal', primary: true }]).map((a) => (
              <Tooltip key={a.label}>
                <TooltipTrigger asChild>
                  <Button size="sm" variant={a.primary ? 'default' : 'outline'} disabled>
                    {a.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ação simulada no protótipo — sem persistência real</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {canonicalStates.map((s) => (
          <Badge key={s} variant="outline" className="text-[10px] text-muted-foreground">
            {s}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {spec.components.map((c) => (
          <Card key={c}>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
              <LayoutPanelTop className="h-4 w-4 text-primary" />
              <CardTitle>{c}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Componente previsto na especificação V2.3. Nesta versão de protótipo, exibe estrutura e
                estado-alvo; dado real virá da API de {spec.code.toLowerCase().includes('screen') ? 'racewell-backend-bff' : 'origem correspondente'} na implementação.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-success/30 bg-success/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-success-foreground/90">Validações específicas desta tela (V2.3)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          {spec.validations.map((v) => (
            <div key={v} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
              <span>{v}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
