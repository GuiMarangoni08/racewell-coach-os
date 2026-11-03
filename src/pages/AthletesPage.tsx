import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { OperationalNotice } from '@/components/shared/OperationalNotice'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { coachRepository } from '@/api/coachRepository'
import { ApiError } from '@/api/http'
import type { AthleteSummary } from '@/api/types'
import { formatDateBR } from '@/lib/utils'

const statusVariant: Record<string, 'success' | 'warning' | 'muted'> = {
  ativo: 'success', active: 'success',
  pausado: 'warning', paused: 'warning',
  encerrado: 'muted', ended: 'muted', inactive: 'muted',
}

function displayDate(value?: string): string {
  if (!value) return '—'
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? formatDateBR(value) : value
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function percent(value?: number): string {
  return value === undefined ? '—' : `${value}%`
}

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<AthleteSummary[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conflict, setConflict] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((value) => value + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setConflict(false)
    coachRepository.listAthletes()
      .then((items) => { if (active) setAthletes(items) })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Não foi possível carregar a carteira.')
        setConflict(cause instanceof ApiError && cause.isConflict)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [reloadKey])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR')
    return athletes.filter((athlete) => !normalized || athlete.name.toLocaleLowerCase('pt-BR').includes(normalized))
  }, [athletes, query])

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-005"
        title="Todos os Atletas"
        objective="Carteira carregada da organização autenticada. Métricas ausentes no backend aparecem como não informadas."
        scope="V0 · API"
      />

      <div className="mb-3 flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome…" className="pl-8" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        {!loading && !error && <Badge variant="outline">{filtered.length} atletas</Badge>}
      </div>

      {loading && <OperationalNotice kind="loading" title="Carregando carteira…" />}
      {error && <OperationalNotice kind={conflict ? 'conflict' : 'error'} title={conflict ? 'Conflito ao consultar a carteira' : 'Falha ao carregar atletas'} message={error} onRetry={reload} />}
      {!loading && !error && athletes.length === 0 && (
        <OperationalNotice kind="empty" title="Carteira vazia" message="A API não retornou atletas para esta organização." />
      )}
      {!loading && !error && athletes.length > 0 && filtered.length === 0 && (
        <OperationalNotice kind="empty" title="Nenhum atleta encontrado" message="Ajuste o termo de busca." />
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atleta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Meta / prova</TableHead>
                <TableHead>Aderência (7d / 28d)</TableHead>
                <TableHead>Qualidade dos dados</TableHead>
                <TableHead>Última interação</TableHead>
                <TableHead>Alertas</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((athlete) => (
                <TableRow key={athlete.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(athlete.name) || '—'}</AvatarFallback></Avatar>
                      <span className="font-medium">{athlete.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {athlete.status
                      ? <Badge variant={statusVariant[athlete.status.toLocaleLowerCase()] ?? 'outline'} className="capitalize">{athlete.status}</Badge>
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-xs">
                    {athlete.goalRace ?? '—'}
                    <div className="text-muted-foreground">{displayDate(athlete.goalDate)}</div>
                  </TableCell>
                  <TableCell className="text-xs">{percent(athlete.adherence7d)} / {percent(athlete.adherence28d)}</TableCell>
                  <TableCell className="text-xs">{athlete.dataQuality === undefined ? '—' : `${athlete.dataQuality}/100`}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{athlete.lastInteraction ?? '—'}</TableCell>
                  <TableCell>{athlete.alerts === undefined ? '—' : athlete.alerts > 0 ? <Badge variant="destructive">{athlete.alerts}</Badge> : '0'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {athlete.tags.length ? athlete.tags.map((tag) => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>) : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
