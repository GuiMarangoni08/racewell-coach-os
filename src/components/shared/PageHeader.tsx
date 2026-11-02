import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

export function PageHeader({
  code,
  title,
  objective,
  scope,
  actions,
}: {
  code?: string
  title: string
  objective?: string
  scope?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="mb-1 flex items-center gap-2">
          {code && <span className="font-mono text-[11px] text-muted-foreground">{code}</span>}
          {scope && <Badge variant="outline" className="text-[10px]">{scope}</Badge>}
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {objective && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{objective}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
