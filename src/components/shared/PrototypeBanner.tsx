import { AlertTriangle } from 'lucide-react'

export function PrototypeBanner() {
  return (
    <div className="flex items-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-1.5 text-xs text-warning-foreground/90">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
      <span className="text-foreground/80">
        <strong className="font-semibold text-foreground">Coach OS operacional v1</strong> — carteira e planejamento usam a API; telas ainda não conectadas estão identificadas como fase futura.
      </span>
    </div>
  )
}
