import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { OperationalNotice } from '@/components/shared/OperationalNotice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { coachRepository } from '@/api/coachRepository'
import { ApiError } from '@/api/http'
import { organizationStorage } from '@/api/session'
import { useOrganization } from '@/org/OrganizationProvider'
import { contentTotals } from '@/api/content'
import type { AthleteSummary, WorkoutTemplate } from '@/api/types'
export default function WorkoutLibraryPage() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [athletes, setAthletes] = useState<AthleteSummary[]>([])
  const [athleteId, setAthleteId] = useState('')
  const [date, setDate] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [athleteLoading, setAthleteLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conflict, setConflict] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const reload = useCallback(() => setReloadKey((value) => value + 1), [])
  useEffect(() => {
    let active = true
    setLoading(true); setError(null); setConflict(false)
    coachRepository.listTemplates().then((items) => { if (active) setTemplates(items) }).catch((cause: unknown) => { if (active) { setError(cause instanceof Error ? cause.message : 'Falha ao carregar biblioteca.'); setConflict(cause instanceof ApiError && cause.isConflict) } }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [reloadKey])
  useEffect(() => {
    let active = true
    coachRepository.listAthletes().then((items) => { if (active) setAthletes(items) }).catch((cause: unknown) => { if (active) setApplyError(cause instanceof Error ? cause.message : 'Falha ao carregar atletas.') }).finally(() => { if (active) setAthleteLoading(false) })
    return () => { active = false }
  }, [])
  const categories = useMemo(() => Array.from(new Set(templates.map((template) => template.category))).sort(), [templates])
  const filtered = useMemo(() => templates.filter((template) => {
    if (category && template.category !== category) return false
    const normalized = query.trim().toLocaleLowerCase('pt-BR')
    return !normalized || `${template.name} ${template.category} ${template.objective ?? ''}`.toLocaleLowerCase('pt-BR').includes(normalized)
  }), [templates, category, query])
  async function applyTemplate(templateId: string) {
    if (!athleteId || !date) { setApplyError('Selecione explicitamente um atleta e a data antes de copiar o template.'); return }
    setApplyingId(templateId); setApplyError(null)
    try {
      const result = await coachRepository.createWorkoutFromTemplate(templateId, athleteId, date)
      // An in-flight response from the old organization must never navigate the new organization.
      if (organizationStorage.getActive() !== organization.id) return
      navigate(`/planejamento/editor?athlete_id=${encodeURIComponent(athleteId)}&id=${encodeURIComponent(result.workout.id)}&date=${result.workout.date}`)
    } catch (cause) { setApplyError(cause instanceof Error ? cause.message : 'Falha ao criar cópia.') } finally { setApplyingId(null) }
  }
  return <div>
    <PageHeader code="RW-COACH-SCREEN-013" title="Biblioteca de Treinos e Protocolos" objective="Templates content JSONB compartilhados na organização. Copiar cria um rascunho independente no atleta e data escolhidos." scope="V1 · API" />
    <div className="mb-4 grid gap-3 lg:grid-cols-3"><div className="space-y-2"><Badge variant="outline">Organização · {templates.length} templates</Badge><div className="relative"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar título, tipo, notas…" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} /></div></div><div className="space-y-1.5"><Label htmlFor="template-athlete">Copiar para atleta</Label><Select value={athleteId} disabled={applyingId !== null} onValueChange={setAthleteId}><SelectTrigger id="template-athlete"><SelectValue placeholder={athleteLoading ? 'Carregando atletas…' : 'Selecione um atleta'} /></SelectTrigger><SelectContent>{athletes.map((athlete) => <SelectItem key={athlete.id} value={athlete.id}>{athlete.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label htmlFor="template-date">Data da cópia</Label><Input id="template-date" type="date" disabled={applyingId !== null} value={date} onChange={(e) => setDate(e.target.value)} /></div></div>
    <p className="mb-3 text-xs text-muted-foreground">Não há escopo pessoal, tags ou autor no DTO v1. Para criar um template, use “Salvar como template” no editor. A cópia não publica a semana.</p>
    <div className="mb-4 flex flex-wrap gap-1.5"><Badge variant={category === null ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCategory(null)}>Todos os tipos</Badge>{categories.map((value) => <Badge key={value} variant={category === value ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCategory(category === value ? null : value)}>{value}</Badge>)}</div>
    {error && <OperationalNotice kind={conflict ? 'conflict' : 'error'} title="Falha ao carregar biblioteca" message={error} onRetry={reload} />}
    {applyError && <div className="mb-3"><OperationalNotice kind="error" title="Cópia não concluída" message={applyError} /></div>}
    {loading && <OperationalNotice kind="loading" title="Carregando templates…" />}
    {!loading && !error && !templates.length && <OperationalNotice kind="empty" title="Biblioteca vazia" message="A API não retornou templates para esta organização." />}
    {!loading && !error && templates.length > 0 && !filtered.length && <OperationalNotice kind="empty" title="Nenhum template encontrado" message="Ajuste a busca ou os filtros." />}
    {!loading && !error && filtered.length > 0 && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((template) => {
      const totals = contentTotals(template.content)
      return <Card key={template.id}><CardHeader className="pb-2"><div className="mb-1 flex justify-between gap-2"><Badge variant="outline" className="text-[10px]">{template.category}</Badge><Badge variant="secondary" className="text-[10px]">Compartilhado na organização</Badge></div><CardTitle>{template.name}</CardTitle></CardHeader><CardContent><p className="mb-2 text-xs text-muted-foreground">{template.objective ?? 'Sem notas.'}</p><div className="mb-3 text-[11px] text-muted-foreground">rowVersion {template.rowVersion} · schema v{template.content.schemaVersion} · {template.content.blocks.length} blocos{totals.totalDistanceKm !== undefined ? ` · ${totals.totalDistanceKm} km` : ''}</div><details className="mb-3 text-xs"><summary className="cursor-pointer">Ver conteúdo JSONB v1</summary><pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded border p-2 text-[10px]">{JSON.stringify(template.content, null, 2)}</pre></details><Button size="sm" className="w-full" disabled={!athleteId || !date || applyingId !== null} onClick={() => void applyTemplate(template.id)}>{applyingId === template.id ? 'Criando cópia…' : 'Aplicar como cópia'}</Button></CardContent></Card>
    })}</div>}
  </div>
}
