import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
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
import { isCalendarDate, weekStartFor } from '@/api/content'
import { publicationKeyFor } from '@/api/session'
import { useOrganization } from '@/org/OrganizationProvider'
import type { AthleteSummary, TrainingWeek, WorkoutData } from '@/api/types'
import { addDays, formatDateBR, startOfWeek, toISODate } from '@/lib/utils'
const weekdays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
export default function WeekBuilderPage() {
  const [params] = useSearchParams()
  const { context, organization } = useOrganization()
  const [athletes, setAthletes] = useState<AthleteSummary[]>([])
  const [athleteId, setAthleteId] = useState(params.get('athlete_id') ?? '')
  const [weekStart, setWeekStart] = useState(() => {
    const requested = params.get('week_start') ?? ''
    return isCalendarDate(requested) ? weekStartFor(requested) : toISODate(startOfWeek(new Date()))
  })
  const [week, setWeek] = useState<TrainingWeek | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutData[]>([])
  const [athleteLoading, setAthleteLoading] = useState(true)
  const [athleteError, setAthleteError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveConflict, setSaveConflict] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [pendingDates, setPendingDates] = useState<Record<string, string>>({})
  const [reloadKey, setReloadKey] = useState(0)
  const reload = useCallback(() => setReloadKey((value) => value + 1), [])
  useEffect(() => {
    let active = true
    coachRepository.listAthletes().then((items) => { if (active) setAthletes(items) }).catch((cause: unknown) => { if (active) setAthleteError(cause instanceof Error ? cause.message : 'Falha ao carregar atletas.') }).finally(() => { if (active) setAthleteLoading(false) })
    return () => { active = false }
  }, [])
  useEffect(() => {
    setWeek(null); setWorkouts([]); setPendingDates({})
    if (!athleteId) return
    let active = true
    setLoading(true); setError(null)
    coachRepository.getWeek(athleteId, weekStart).then((result) => {
      if (!active) return
      setWeek(result.week); setWorkouts(result.workouts); setSaveError(null); setSaveConflict(false)
    }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Falha ao carregar semana.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [athleteId, weekStart, reloadKey])
  const days = useMemo(() => weekdays.map((label, index) => {
    const date = toISODate(addDays(new Date(`${weekStart}T12:00:00`), index))
    return { label, date, workouts: workouts.filter((workout) => workout.date === date) }
  }), [weekStart, workouts])
  const weekEnd = days[6].date
  const plannedDistance = workouts.length && workouts.every((workout) => workout.totalDistanceKm !== undefined) ? workouts.reduce((sum, workout) => sum + workout.totalDistanceKm!, 0) : undefined
  function clearMessages() { setSaveError(null); setSaveConflict(false); setMessage(null) }
  async function mutate(action: () => Promise<void>) {
    setSaving(true); clearMessages()
    try { await action() } catch (cause) { setSaveError(cause instanceof Error ? cause.message : 'Ação não concluída.'); setSaveConflict(cause instanceof ApiError && cause.isConflict) } finally { setSaving(false) }
  }
  const busy = saving || loading
  const hasPendingDates = Object.values(pendingDates).some(Boolean)
  async function publish() {
    if (!week) return
    await mutate(async () => {
      const key = publicationKeyFor(context.userId, organization.id, week.id, week.rowVersion)
      const result = await coachRepository.publishWeek(week, key)
      setWeek({ ...week, publishedVersion: result.publication.sourceRowVersion })
      setMessage(`Semana v${result.publication.sourceRowVersion} publicada. ${result.publication.workouts.length} treinos no snapshot. ${result.replayed ? 'Replay da tentativa original confirmado.' : 'Publicação confirmada pela API.'}`)
    })
  }
  return <div>
    <PageHeader code="RW-COACH-SCREEN-011" title="Semana de Treino" objective="A semana contém os rascunhos atuais. Somente Publicar semana cria o snapshot imutável visível ao atleta." scope="V1 · API" actions={<><Button size="sm" variant="outline" disabled={!athleteId || busy || Boolean(error) || Boolean(week)} onClick={() => void mutate(async () => { const result = await coachRepository.createWeek({ athleteId, weekStart }); setWeek(result.week); setWorkouts(result.workouts); setMessage('Semana criada/obtida pela API. Ainda não publicada.') })}>Criar semana</Button><Button size="sm" disabled={!week || busy || Boolean(error) || hasPendingDates || week.publishedVersion === week.rowVersion || (!workouts.length && week.publishedVersion === null)} onClick={() => void publish()}>{saving ? 'Processando…' : 'Publicar semana'}</Button></>} />
    <div className="mb-4 grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="week-athlete">Atleta</Label><Select value={athleteId} disabled={saving} onValueChange={(value) => { setAthleteId(value); clearMessages() }}><SelectTrigger id="week-athlete"><SelectValue placeholder={athleteLoading ? 'Carregando atletas…' : 'Selecione um atleta'} /></SelectTrigger><SelectContent>{athletes.map((athlete) => <SelectItem key={athlete.id} value={athlete.id}>{athlete.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label htmlFor="week-start">Início (segunda-feira)</Label><Input id="week-start" type="date" disabled={saving} value={weekStart} onChange={(e) => { if (isCalendarDate(e.target.value)) { setWeekStart(weekStartFor(e.target.value)); clearMessages() } }} /></div></div>
    <p className="mb-3 text-xs text-muted-foreground">Não existe gravação em lote do calendário. Criação/edição/arquivamento de treino altera a semana no servidor. Mover entre semanas está desabilitado na v1; crie/copie no destino. O rascunho editado não modifica a publicação anterior.</p>
    {athleteError && <OperationalNotice kind="error" title="Falha ao carregar atletas" message={athleteError} onRetry={() => window.location.reload()} />}
    {error && <OperationalNotice kind="error" title="Falha ao carregar semana" message={error} onRetry={reload} />}
    {!athleteId && <OperationalNotice kind="empty" title="Selecione um atleta" message="Não há seleção automática de atleta." />}
    {loading && <OperationalNotice kind="loading" title="Carregando semana e seus treinos…" />}
    {athleteId && !loading && !error && <>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3"><Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Volume derivado dos blocos</p><p className="text-lg font-semibold">{plannedDistance === undefined ? 'Parcial / não calculável' : `${plannedDistance} km`}</p></CardContent></Card><Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Sessões</p><p className="text-lg font-semibold">{workouts.length}</p></CardContent></Card><Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Versões da semana</p><p className="text-sm">Rascunho {week?.rowVersion ?? '—'} · Publicada {week?.publishedVersion ?? 'nenhuma'}</p>{week && <Badge variant={week.rowVersion === week.publishedVersion ? 'success' : 'warning'}>{week.rowVersion === week.publishedVersion ? 'Versão atual publicada' : 'Rascunho não publicado'}</Badge>}</CardContent></Card></div>
      {!week && <p className="mb-3 text-xs text-muted-foreground">Semana ainda inexistente. Criar um treino também cria a semana automaticamente.</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">{days.map((day) => <Card key={day.date} className="min-h-[190px]"><CardHeader className="pb-1"><CardTitle className="text-[11px] text-muted-foreground">{day.label} · {formatDateBR(day.date)}</CardTitle></CardHeader><CardContent className="flex flex-col gap-2 p-2 pt-0">{!day.workouts.length && <p className="text-[10px] text-muted-foreground">Sem sessão cadastrada</p>}{day.workouts.map((workout) => <div key={workout.id} className="rounded-md border p-2 text-[11px]"><Link className="font-medium underline" to={`/planejamento/editor?athlete_id=${encodeURIComponent(athleteId)}&id=${encodeURIComponent(workout.id)}`}>{workout.name}</Link><p className="text-muted-foreground">Documento v{workout.rowVersion} · {workout.totalDistanceKm === undefined ? 'Distância parcial' : `${workout.totalDistanceKm} km`}</p><div className="mt-2 space-y-2"><Label className="text-[10px]">Data (mesma semana)</Label><Input aria-label={`Data de ${workout.name}`} type="date" min={weekStart} max={weekEnd} disabled={busy} value={pendingDates[workout.id] ?? workout.date} onChange={(e) => setPendingDates((current) => { const next = { ...current }; if (e.target.value === workout.date) delete next[workout.id]; else next[workout.id] = e.target.value; return next })} /><div className="flex gap-1"><Button size="sm" variant="outline" disabled={busy || !pendingDates[workout.id]} onClick={() => void mutate(async () => { const result = await coachRepository.moveWorkout(workout, pendingDates[workout.id]); setWeek(result.week); setWorkouts((current) => current.map((item) => item.id === workout.id ? result.workout : item)); setPendingDates((current) => { const next = { ...current }; delete next[workout.id]; return next }); setMessage('Data salva no rascunho. Publique a semana para atualizar o atleta.') })}>Salvar data</Button><Button size="icon" variant="ghost" disabled={busy} aria-label="Arquivar treino" onClick={() => { if (window.confirm(`Arquivar o rascunho “${workout.name}”? Ele só sairá da visão do atleta após nova publicação.`)) void mutate(async () => { const updated = await coachRepository.archiveWorkout(workout); setWeek(updated); setWorkouts((current) => current.filter((item) => item.id !== workout.id)); setPendingDates((current) => { const next = { ...current }; delete next[workout.id]; return next }); setMessage('Rascunho arquivado. Publique novamente para atualizar o atleta.') }) }}><Trash2 className="h-4 w-4" /></Button></div></div></div>)}<Button asChild size="sm" variant="outline"><Link to={`/planejamento/editor?athlete_id=${encodeURIComponent(athleteId)}&date=${day.date}`}><Plus className="h-3.5 w-3.5" /> Criar treino</Link></Button></CardContent></Card>)}</div>
    </>}
    {saveError && <div className="mt-3"><OperationalNotice kind={saveConflict ? 'conflict' : 'error'} title={saveConflict ? 'Conflito — recarregue a versão da API' : 'Ação não concluída'} message={`${saveError}${!saveConflict ? ' Se houve falha de rede ao publicar, tente novamente: a mesma chave será reaproveitada para esta versão.' : ''}`} onRetry={reload} /></div>}
    {message && <p role="status" className="mt-3 text-xs text-success">{message}</p>}
    {hasPendingDates && <p className="mt-3 text-xs text-warning">Salve as datas pendentes antes de publicar. Elas ainda não fazem parte da semana na API.</p>}
  </div>
}
