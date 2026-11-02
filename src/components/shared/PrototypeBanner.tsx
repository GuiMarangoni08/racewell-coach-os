import { AlertTriangle } from 'lucide-react'

export function PrototypeBanner() {
  return (
    <div className="flex items-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-1.5 text-xs text-warning-foreground/90">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
      <span className="text-foreground/80">
        <strong className="font-semibold text-foreground">Protótipo para aprovação</strong> — dados fictícios, sem persistência real e sem conexão com produção (RN-025). Nenhuma ação aqui grava no backend.
      </span>
    </div>
  )
}
