import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
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
import type { AthleteSummary, WorkoutData } from '@/api/types'
import { addDays, formatDateBR, startOfWeek, toISODate } from '@/lib/utils'

const weekdayLabels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

function mondayToday(): Date {
  return startOfWeek(new Date())
}

export default function CalendarPage() {
  const [athletes, setAthletes] = useState<AthleteSummary[]>([])
  const [athleteId, setAthleteId] = useState('')
  const [athleteLoading, setAthleteLoading] = useState(true)
  const [athleteError, setAthleteError] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(mondayToday)
  const [workouts, setWorkouts] = useState<WorkoutData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conflict, setConflict] = useState(false)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [moveConflict, setMoveConflict] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [pendingDates, setPendingDates] = useState<Record<string, string>>({})

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const from = useMemo(() => toISODate(weekStart), [weekStart])
  const to = useMemo(() => toISODate(weekEnd), [weekEnd])
  const reload = useCallback(() => setReloadKey((value) => value + 1), [])

  useEffect(() => {
    let active = true
    coachRepository.listAthletes()
      .then((items) => { if (active) setAthletes(items) })
      .catch((cause: unknown) => { if (active) setAthleteError(cause instanceof Error ? cause.message : 'Falha ao carregar atletas.') })
      .finally(() => { if (active) setAthleteLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!athleteId) {
      setWorkouts([])
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    setWorkouts([])
    setError(null)
    setConflict(false)
    coachRepository.getWeek(athleteId, from)
      .then(({ workouts: items }) => {
        if (!active) return
        setWorkouts(items)
        setPendingDates({})
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Falha ao carregar calendário.')
        setConflict(cause instanceof ApiError && cause.isConflict)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [athleteId, from, to, reloadKey])

  const days = useMemo(() => weekdayLabels.map((label, index) => {
    const date = toISODate(addDays(weekStart, index))
    return { label, date, workouts: workouts.filter((workout) => workout.date === date) }
  }), [weekStart, workouts])

  function shiftWeek(direction: -1 | 1) {
    setWeekStart((current) => addDays(current, direction * 7))
    setMoveError(null)
    setMoveConflict(false)
  }

  async function saveMove(workout: WorkoutData, date: string) {
    if (!date || date === workout.date) return
    setSavingId(workout.id)
    setMoveError(null)
    setMoveConflict(false)
    try {
      const saved = await coachRepository.moveWorkout(workout, date)
      const updated = saved.workout
      setWorkouts((current) => current.map((item) => item.id === workout.id ? updated : item))
      setPendingDates((current) => { const next = { ...current }; delete next[workout.id]; return next })
    } catch (cause) {
      setMoveError(cause instanceof Error ? cause.message : 'Não foi possível mover o treino.')
      setMoveConflict(cause instanceof ApiError && cause.isConflict)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-014"
        title="Calendário de Treinos"
        objective="Treinos retornados dentro da semana. Alterar uma data salva o rascunho com content e rowVersion; não publica a semana."
        scope="V1 · API"
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex min-w-56 flex-col gap-1.5">
          <Label htmlFor="calendar-athlete">Atleta</Label>
          <Select value={athleteId} disabled={savingId !== null} onValueChange={(value) => { setAthleteId(value); setMoveError(null); setMoveConflict(false) }}>
            <SelectTrigger id="calendar-athlete"><SelectValue placeholder={athleteLoading ? 'Carregando atletas…' : 'Selecione um atleta'} /></SelectTrigger>
            <SelectContent>{athletes.map((athlete) => <SelectItem key={athlete.id} value={athlete.id}>{athlete.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" aria-label="Semana anterior" disabled={savingId !== null} onClick={() => shiftWeek(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Badge variant="outline" className="min-w-48 justify-center">{formatDateBR(from)} – {formatDateBR(to)}</Badge>
          <Button size="icon" variant="outline" aria-label="Próxima semana" disabled={savingId !== null} onClick={() => shiftWeek(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">Drag/movimentação entre semanas não é suportado na v1. Só é possível alterar a data dentro da mesma semana. Para outra semana, arquive e crie/copie no destino. Publique a semana separadamente para atualizar a visão do atleta.</p>
      {athleteError && <OperationalNotice kind="error" title="Falha ao carregar atletas" message={athleteError} onRetry={() => window.location.reload()} />}
      {!athleteId && !athleteError && <OperationalNotice kind="empty" title="Selecione um atleta" message="O calendário não escolhe automaticamente um atleta da carteira." />}
      {loading && <OperationalNotice kind="loading" title="Carregando treinos do período…" />}
      {error && <OperationalNotice kind={conflict ? 'conflict' : 'error'} title={conflict ? 'Conflito ao consultar calendário' : 'Falha ao carregar calendário'} message={error} onRetry={reload} />}
      {moveError && <div className="mb-3"><OperationalNotice kind={moveConflict ? 'conflict' : 'error'} title={moveConflict ? 'Conflito ao mover treino' : 'Falha ao mover treino'} message={moveError} onRetry={moveConflict ? reload : undefined} /></div>}
      {!loading && !error && athleteId && workouts.length === 0 && <OperationalNotice kind="empty" title="Nenhum treino neste período" message="A API não retornou sessões para o atleta e intervalo selecionados." />}
      {!loading && !error && athleteId && workouts.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {days.map((day) => (
            <Card key={day.date} className="min-h-[190px]">
              <CardHeader className="pb-1"><CardTitle className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{day.label} · {formatDateBR(day.date)}</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-2 p-2 pt-0">
                {day.workouts.length === 0 && <p className="text-[10px] text-muted-foreground">Sem treino planejado</p>}
                {day.workouts.map((workout) => (
                  <div key={workout.id} className="rounded-md border p-2 text-[11px]">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="font-medium">{workout.name}</p>
                      <Badge variant="outline" className="text-[9px]">Rascunho v{workout.rowVersion}</Badge>
                    </div>
                    <p className="text-muted-foreground">{workout.totalDistanceKm === undefined ? 'Distância não informada' : `${workout.totalDistanceKm} km`}{workout.type ? ` · ${workout.type}` : ''}</p>
                    <div className="mt-2 flex items-end gap-2">
                      <div className="min-w-0 flex-1"><Label className="text-[10px]">Mover para</Label><Input aria-label={`Nova data para ${workout.name}`} type="date" min={from} max={to} disabled={savingId !== null} value={pendingDates[workout.id] ?? workout.date ?? ''} onChange={(event) => setPendingDates((current) => ({ ...current, [workout.id]: event.target.value }))} /></div>
                      <Button size="sm" variant="outline" disabled={!pendingDates[workout.id] || pendingDates[workout.id] === workout.date || savingId !== null} onClick={() => void saveMove(workout, pendingDates[workout.id] ?? '')}>{savingId === workout.id ? 'Salvando…' : 'Salvar'}</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
