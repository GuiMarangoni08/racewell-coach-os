import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { OperationalNotice } from '@/components/shared/OperationalNotice'
import { WorkoutContentEditor, newSegment } from '@/components/shared/WorkoutContentEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { coachRepository } from '@/api/coachRepository'
import { ApiError } from '@/api/http'
import { contentTotals, isCalendarDate, weekStartFor } from '@/api/content'
import { workoutTypes } from '@/api/types'
import type { AthleteSummary, WorkoutContent, WorkoutContentBlock, WorkoutData } from '@/api/types'
import { addDays, startOfWeek, toISODate } from '@/lib/utils'

interface DraftBlock { id: string; value: WorkoutContentBlock }
interface WorkoutDraft { id?: string; rowVersion?: number; originalDate?: string; date: string; title: string; type: WorkoutContent['type']; notes: string; blocks: DraftBlock[] }
function fromWorkout(workout: WorkoutData): WorkoutDraft {
  return { id: workout.id, rowVersion: workout.rowVersion, originalDate: workout.date, date: workout.date, title: workout.content.title, type: workout.content.type, notes: workout.content.notes ?? '', blocks: workout.content.blocks.map((value) => ({ id: crypto.randomUUID(), value })) }
}
function contentFor(draft: WorkoutDraft): WorkoutContent {
  return { schemaVersion: 1, title: draft.title, type: draft.type, ...(draft.notes ? { notes: draft.notes } : {}), blocks: draft.blocks.map((block) => block.value) }
}
function SortableBlock({ block, disabled, onChange, onRemove }: { block: DraftBlock; disabled: boolean; onChange: (id: string, value: WorkoutContentBlock) => void; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id, disabled })
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }} className="flex items-start gap-2 rounded-md border bg-card p-2.5">
    <button type="button" {...attributes} {...listeners} disabled={disabled} aria-label="Reordenar bloco" className="mt-2 cursor-grab text-muted-foreground"><GripVertical className="h-4 w-4" /></button>
    <div className="min-w-0 flex-1"><WorkoutContentEditor block={block.value} disabled={disabled} onChange={(value) => onChange(block.id, value)} /></div>
    <button type="button" disabled={disabled} aria-label="Remover bloco" onClick={() => onRemove(block.id)} className="mt-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
  </div>
}
export default function WorkoutEditorPage() {
  const [searchParams] = useSearchParams()
  return <WorkoutEditor key={searchParams.toString()} searchParams={searchParams} />
}

function WorkoutEditor({ searchParams }: { searchParams: URLSearchParams }) {
  const initialAthleteId = searchParams.get('athlete_id') ?? ''
  const initialWorkoutId = searchParams.get('id') ?? ''
  const requestedDate = searchParams.get('date') ?? ''
  const [athletes, setAthletes] = useState<AthleteSummary[]>([])
  const [athleteId, setAthleteId] = useState(initialAthleteId)
  const [weekStart, setWeekStart] = useState(() => isCalendarDate(requestedDate) ? weekStartFor(requestedDate) : toISODate(startOfWeek(new Date())))
  const [workouts, setWorkouts] = useState<WorkoutData[]>([])
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('')
  const [draft, setDraft] = useState<WorkoutDraft | null>(null)
  const [dirty, setDirty] = useState(false)
  const [athleteLoading, setAthleteLoading] = useState(true)
  const [athleteError, setAthleteError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveConflict, setSaveConflict] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const initialSelectionUsed = useRef(false)
  const reload = useCallback(() => setReloadKey((value) => value + 1), [])
  useEffect(() => {
    let active = true
    coachRepository.listAthletes().then((items) => { if (active) setAthletes(items) }).catch((cause: unknown) => { if (active) setAthleteError(cause instanceof Error ? cause.message : 'Falha ao carregar atletas.') }).finally(() => { if (active) setAthleteLoading(false) })
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!athleteId) { setWorkouts([]); return }
    let active = true
    setLoading(true); setError(null); setWorkouts([])
    coachRepository.getWeek(athleteId, weekStart).then(async (result) => {
      if (!active) return
      if (!initialSelectionUsed.current && initialWorkoutId && initialAthleteId === athleteId) {
        const selected = result.workouts.find((workout) => workout.id === initialWorkoutId) ?? await coachRepository.getWorkout(initialWorkoutId)
        if (!active) return
        if (selected.athleteId !== athleteId) throw new Error('O treino selecionado pertence a outro atleta.')
        initialSelectionUsed.current = true
        const correctWeek = weekStartFor(selected.date)
        if (correctWeek !== weekStart) { setWeekStart(correctWeek); setDraft(fromWorkout(selected)); setSelectedWorkoutId(selected.id); return }
        setDraft(fromWorkout(selected)); setSelectedWorkoutId(selected.id); setDirty(false)
      }
      setWorkouts(result.workouts)
    }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Falha ao carregar semana.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [athleteId, weekStart, reloadKey, initialAthleteId, initialWorkoutId])
  const totals = useMemo(() => draft ? contentTotals(contentFor(draft)) : {}, [draft])
  function canDiscard() { return !dirty || window.confirm('Descartar alterações locais não salvas?') }
  function clearDraft() { setSelectedWorkoutId(''); setDraft(null); setDirty(false); setSaveError(null); setSaveConflict(false); setMessage(null) }
  function newWorkout() {
    if (!canDiscard()) return
    setSelectedWorkoutId('')
    setDraft({ title: '', date: isCalendarDate(requestedDate) && weekStartFor(requestedDate) === weekStart ? requestedDate : weekStart, type: 'easy_run', notes: '', blocks: [{ id: crypto.randomUUID(), value: newSegment() }] })
    setDirty(true); setSaveError(null); setSaveConflict(false); setMessage(null)
  }
  function changeDraft(update: Partial<WorkoutDraft>) { setDraft((current) => current ? { ...current, ...update } : null); setDirty(true); setMessage(null) }
  function changeBlock(id: string, value: WorkoutContentBlock) { if (draft) changeDraft({ blocks: draft.blocks.map((block) => block.id === id ? { ...block, value } : block) }) }
  function dragEnd({ active, over }: DragEndEvent) {
    if (!draft || !over || active.id === over.id) return
    changeDraft({ blocks: arrayMove(draft.blocks, draft.blocks.findIndex((block) => block.id === active.id), draft.blocks.findIndex((block) => block.id === over.id)) })
  }
  async function saveWorkout() {
    if (!draft || !athleteId) return
    setSaving(true); setSaveError(null); setSaveConflict(false); setMessage(null)
    try {
      if (draft.originalDate && isCalendarDate(draft.date) && weekStartFor(draft.originalDate) !== weekStartFor(draft.date)) throw new Error('Mover entre semanas não é suportado na v1. Crie/copie outro treino no destino.')
      const result = await coachRepository.saveWorkout({ athleteId, date: draft.date, content: contentFor(draft) }, draft.id && draft.rowVersion ? { id: draft.id, rowVersion: draft.rowVersion } : undefined)
      setDraft(fromWorkout(result.workout)); setSelectedWorkoutId(result.workout.id); setDirty(false)
      setWorkouts((current) => [result.workout, ...current.filter((workout) => workout.id !== result.workout.id)])
      setWeekStart(result.week.weekStart)
      setMessage(`Rascunho salvo. Documento v${result.workout.rowVersion}; semana v${result.week.rowVersion}. Publique a semana para torná-lo visível ao atleta.`)
    } catch (cause) { setSaveError(cause instanceof Error ? cause.message : 'Falha ao salvar.'); setSaveConflict(cause instanceof ApiError && cause.isConflict) } finally { setSaving(false) }
  }
  async function saveAsTemplate() {
    if (!draft) return
    setSaving(true); setSaveError(null); setSaveConflict(false); setMessage(null)
    try { const template = await coachRepository.saveTemplate(contentFor(draft)); setMessage(`Template “${template.name}” criado na organização. A cópia não publica a semana.`) } catch (cause) { setSaveError(cause instanceof Error ? cause.message : 'Falha ao criar template.'); setSaveConflict(cause instanceof ApiError && cause.isConflict) } finally { setSaving(false) }
  }
  async function reloadSelected() {
    if (!draft?.id || !canDiscard()) return
    setSaving(true)
    try { const latest = await coachRepository.getWorkout(draft.id); setDraft(fromWorkout(latest)); setDirty(false); setSaveError(null); setSaveConflict(false); setWorkouts((current) => [latest, ...current.filter((item) => item.id !== latest.id)]) } catch (cause) { setSaveError(cause instanceof Error ? cause.message : 'Falha ao recarregar.') } finally { setSaving(false) }
  }
  const busy = saving || loading
  return <div>
    <PageHeader code="RW-COACH-SCREEN-012" title="Editor de Treino" objective="Conteúdo JSONB v1. Salvar altera o rascunho; somente a publicação da semana torna a revisão visível ao atleta." scope="V1 · API" actions={draft ? <><Button size="sm" variant="outline" disabled={busy} onClick={() => void saveAsTemplate()}>Salvar como template</Button><Button size="sm" disabled={busy || !dirty} onClick={() => void saveWorkout()}>{saving ? 'Salvando…' : 'Salvar rascunho'}</Button></> : undefined} />
    <div className="mb-4 grid gap-3 sm:grid-cols-3">
      <div className="space-y-1.5"><Label htmlFor="editor-athlete">Atleta</Label><Select value={athleteId} disabled={saving} onValueChange={(value) => { if (!canDiscard()) return; initialSelectionUsed.current = true; clearDraft(); setAthleteId(value) }}><SelectTrigger id="editor-athlete"><SelectValue placeholder={athleteLoading ? 'Carregando atletas…' : 'Selecione um atleta'} /></SelectTrigger><SelectContent>{athletes.map((athlete) => <SelectItem key={athlete.id} value={athlete.id}>{athlete.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1.5"><Label htmlFor="editor-week">Semana (segunda-feira)</Label><Input id="editor-week" type="date" disabled={saving} value={weekStart} onChange={(e) => { if (!isCalendarDate(e.target.value) || !canDiscard()) return; initialSelectionUsed.current = true; clearDraft(); setWeekStart(weekStartFor(e.target.value)) }} /></div>
      <div className="space-y-1.5"><Label htmlFor="editor-workout">Treino da semana</Label><div className="flex gap-2"><Select value={selectedWorkoutId} disabled={!athleteId || busy} onValueChange={(value) => { if (!canDiscard()) return; const selected = workouts.find((item) => item.id === value); if (selected) { clearDraft(); setDraft(fromWorkout(selected)); setSelectedWorkoutId(value) } }}><SelectTrigger id="editor-workout"><SelectValue placeholder={loading ? 'Carregando…' : 'Selecione um treino'} /></SelectTrigger><SelectContent>{workouts.map((workout) => <SelectItem key={workout.id} value={workout.id}>{workout.name}</SelectItem>)}</SelectContent></Select><Button variant="outline" disabled={!athleteId || busy || Boolean(error)} onClick={newWorkout}>Novo</Button></div></div>
    </div>
    {athleteError && <OperationalNotice kind="error" title="Falha ao carregar atletas" message={athleteError} onRetry={() => window.location.reload()} />}
    {error && <OperationalNotice kind="error" title="Falha ao carregar treinos da semana" message={error} onRetry={reload} />}
    {loading && <OperationalNotice kind="loading" title="Carregando semana…" />}
    {!athleteId && <OperationalNotice kind="empty" title="Selecione um atleta" message="Não há seleção automática de atleta." />}
    {athleteId && !draft && !loading && !error && <OperationalNotice kind="empty" title="Nenhum treino selecionado" message="Selecione um treino da semana ou inicie um novo rascunho." />}
    {draft && <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHeader><div className="flex flex-wrap items-center gap-2"><Input aria-label="Nome do treino" maxLength={160} disabled={saving} value={draft.title} onChange={(e) => changeDraft({ title: e.target.value })} className="h-8 w-64 font-medium" placeholder="Nome do treino" /><Badge variant="outline">Rascunho operacional</Badge>{draft.rowVersion && <Badge variant="outline">rowVersion {draft.rowVersion}</Badge>}{dirty && <Badge variant="warning">Não salvo</Badge>}</div></CardHeader><CardContent>
      <div className="mb-3 grid gap-2 sm:grid-cols-3"><div><Label htmlFor="workout-date" className="text-xs">Data</Label><Input id="workout-date" type="date" disabled={saving} min={draft.originalDate ? weekStartFor(draft.originalDate) : undefined} max={draft.originalDate ? toISODate(addDays(new Date(`${weekStartFor(draft.originalDate)}T12:00:00`), 6)) : undefined} value={draft.date} onChange={(e) => changeDraft({ date: e.target.value })} /></div><div><Label htmlFor="workout-type" className="text-xs">Tipo</Label><select id="workout-type" className="h-10 w-full rounded-md border bg-background px-2 text-sm" disabled={saving} value={draft.type} onChange={(e) => changeDraft({ type: e.target.value as WorkoutContent['type'] })}>{workoutTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></div><div><Label htmlFor="workout-notes" className="text-xs">Notas / objetivo</Label><Input id="workout-notes" maxLength={4000} disabled={saving} value={draft.notes} onChange={(e) => changeDraft({ notes: e.target.value })} /></div></div>
      <p className="mb-3 text-xs text-muted-foreground">Pace em segundos por km: 330 = 5:30/km. Distância em metros; duração em segundos. Cada bloco precisa de distância ou duração. Edição de data é limitada à mesma semana.</p>
      <DndContext collisionDetection={closestCenter} onDragEnd={dragEnd}><SortableContext items={draft.blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}><div className="space-y-2">{draft.blocks.map((block) => <SortableBlock key={block.id} block={block} disabled={saving} onChange={changeBlock} onRemove={(id) => changeDraft({ blocks: draft.blocks.filter((part) => part.id !== id) })} />)}</div></SortableContext></DndContext>
      <Button size="sm" variant="outline" className="mt-3" disabled={saving || draft.blocks.length >= 100} onClick={() => changeDraft({ blocks: [...draft.blocks, { id: crypto.randomUUID(), value: newSegment() }] })}><Plus className="h-4 w-4" /> Adicionar bloco</Button>
      {saveError && <div className="mt-3"><OperationalNotice kind={saveConflict ? 'conflict' : 'error'} title={saveConflict ? 'Conflito de versão — alterações locais preservadas' : 'Ação não concluída'} message={saveError} onRetry={draft.id ? () => void reloadSelected() : undefined} /></div>}
      {message && <p role="status" className="mt-3 text-xs text-success">{message}</p>}
    </CardContent></Card><Card><CardHeader><CardTitle>Totais derivados dos blocos</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>Distância: {totals.totalDistanceKm === undefined ? 'Parcial / não calculável' : `${totals.totalDistanceKm} km`}</p><p>Duração: {totals.totalDurationMin === undefined ? 'Parcial / não calculável' : `${Number(totals.totalDurationMin.toFixed(2))} min`}</p><p>Blocos: {draft.blocks.length}</p><p className="text-xs text-muted-foreground">A API não fornece TSS ou zonas. Totais só aparecem quando todos os segmentos informam a respectiva unidade.</p><Button asChild variant="outline"><Link to={`/planejamento/semana?athlete_id=${encodeURIComponent(athleteId)}&week_start=${encodeURIComponent(isCalendarDate(draft.date) ? weekStartFor(draft.date) : weekStart)}`}>Revisar / publicar semana</Link></Button></CardContent></Card></div>}
  </div>
}
