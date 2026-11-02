import { useLayoutEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Activity,
  Anchor,
  BedDouble,
  Bike,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  FileText,
  Flag,
  Footprints,
  GripVertical,
  Layers,
  Mountain,
  MoreHorizontal,
  Pencil,
  Plus,
  PersonStanding,
  Settings2,
  Shuffle,
  Snowflake,
  Target,
  Trash2,
  Trophy,
  Waves,
  X,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { plannedWorkouts, athletes, goals, zoneVersions } from '@/data/mock'
import { StatePill } from '@/components/shared/StatusPill'
import { addDays, cn, formatDateBR, isSameDay, parseISODate, startOfWeek, toISODate } from '@/lib/utils'
import type { PlannedWorkout } from '@/types/domain'

type ViewMode = 'semana' | 'quinzena' | 'mes'
type GoalDate = { date: string; name: string }
type BlockPhase = 'aquecimento' | 'ativo' | 'recuperacao' | 'desaquecimento'
type MetricType = 'duracao' | 'rpe' | 'fc' | 'potencia' | 'pace'
type BuildUnit = 'duracao' | 'distancia'
type AthleteZone = { name: string; paceMin: string; paceMax: string; hrMin: number; hrMax: number }

interface BuilderBlock {
  id: string
  phase: BlockPhase
  buildUnit: BuildUnit
  durationMin: number
  distanceM: number
  repetitions: number
  recovery: string
  metricType: MetricType
  min: string
  max: string
}

const weekdayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const today = new Date(2026, 6, 21)
const MAX_BLOCKS = 24
const SCROLL_EXTEND_THRESHOLD = 220

const disciplines = [
  { id: 'corrida', label: 'Corrida', icon: Footprints },
  { id: 'bike', label: 'Bike', icon: Bike },
  { id: 'natacao', label: 'Natação', icon: Waves },
  { id: 'brick', label: 'Brick', icon: Layers },
  { id: 'crosstrain', label: 'Crosstrain', icon: Shuffle },
  { id: 'folga', label: 'Folga', icon: BedDouble },
  { id: 'mtnbike', label: 'Mtn Bike', icon: Mountain },
  { id: 'forca', label: 'Força', icon: Dumbbell },
  { id: 'personalizado', label: 'Personalizado', icon: Settings2 },
  { id: 'xcski', label: 'XC-Ski', icon: Snowflake },
  { id: 'remo', label: 'Remo', icon: Anchor },
  { id: 'caminhada', label: 'Caminhada', icon: PersonStanding },
  { id: 'outro', label: 'Outro', icon: MoreHorizontal },
]

const otherItems = [
  { id: 'prova', label: 'Prova', icon: Trophy },
  { id: 'metas', label: 'Metas', icon: Target },
  { id: 'nota', label: 'Nota', icon: FileText },
  { id: 'metricas', label: 'Métricas', icon: Activity },
  { id: 'disponibilidade', label: 'Disponibilidade', icon: CalendarClock },
]

const phaseLabel: Record<BlockPhase, string> = {
  aquecimento: 'Aquecimento',
  ativo: 'Ativo',
  recuperacao: 'Recuperação',
  desaquecimento: 'Desaquecimento',
}
// Só tons derivados da paleta oficial (MIV v3: roxo + limão) — sem cores
// soltas do Tailwind. Aquecimento/Ativo usam o limão em intensidade
// crescente (mesma cor, "esquentando"); Recuperação usa o âmbar semântico
// já definido no tema; Desaquecimento volta ao neutro.
const phaseColor: Record<BlockPhase, string> = {
  aquecimento: 'bg-primary/35',
  ativo: 'bg-primary',
  recuperacao: 'bg-warning',
  desaquecimento: 'bg-muted-foreground/50',
}
const phaseTextColor: Record<BlockPhase, string> = {
  aquecimento: 'text-foreground',
  ativo: 'text-primary-foreground',
  recuperacao: 'text-warning-foreground',
  desaquecimento: 'text-foreground',
}

function describeMetric(b: Pick<BuilderBlock, 'metricType' | 'min' | 'max'>): string {
  switch (b.metricType) {
    case 'duracao':
      return 'Duração'
    case 'rpe':
      return `RPE ${b.min || '?'}-${b.max || '?'}`
    case 'fc':
      return `FC ${b.min || '?'}-${b.max || '?'} bpm`
    case 'potencia':
      return `${b.min || '?'}-${b.max || '?'} W`
    case 'pace':
      return `${b.min || '?'}-${b.max || '?'} /km`
  }
}

/** "5:00" → 300 (segundos por km). Retorna null se não for um pace mm:ss válido. */
function parsePaceToSeconds(pace: string): number | null {
  const m = pace.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

function avgPaceSecPerKm(b: Pick<BuilderBlock, 'metricType' | 'min' | 'max'>): number | null {
  if (b.metricType !== 'pace') return null
  const paces = [parsePaceToSeconds(b.min), parsePaceToSeconds(b.max)].filter((p): p is number => p !== null)
  if (paces.length === 0) return null
  return paces.reduce((s, p) => s + p, 0) / paces.length
}

/** Minutos de UMA repetição do bloco — se construído por distância, estima a partir do pace (quando disponível). */
function blockMinutesPerRep(b: BuilderBlock): number {
  if (b.buildUnit === 'duracao') return b.durationMin
  const sec = avgPaceSecPerKm(b)
  if (sec === null) return 0
  return (b.distanceM / 1000) * (sec / 60)
}

/** Km de UMA repetição do bloco — se construído por duração, estima a partir do pace (quando disponível). */
function blockKmPerRep(b: BuilderBlock): number {
  if (b.buildUnit === 'distancia') return b.distanceM / 1000
  const sec = avgPaceSecPerKm(b)
  if (sec === null) return 0
  return (b.durationMin * 60) / sec
}

function effectiveMinutes(b: BuilderBlock): number {
  return blockMinutesPerRep(b) * Math.max(1, b.repetitions)
}

function effectiveKm(b: BuilderBlock): number {
  return blockKmPerRep(b) * Math.max(1, b.repetitions)
}

function formatMeters(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(m % 1000 === 0 ? 0 : 1)}km` : `${m}m`
}

function blockAmountLabel(b: BuilderBlock): string {
  return b.buildUnit === 'distancia' ? formatMeters(b.distanceM) : `${b.durationMin}'`
}

function blockBarLabel(b: BuilderBlock): string {
  const amount = blockAmountLabel(b)
  return b.repetitions > 1 ? `${b.repetitions}x${amount}` : amount
}

function totalsFor(blocks: BuilderBlock[]) {
  const minutes = blocks.reduce((s, b) => s + effectiveMinutes(b), 0)
  const km = blocks.reduce((s, b) => s + effectiveKm(b), 0)
  return { minutes: Math.round(minutes), km: Math.round(km * 10) / 10, tss: Math.round(minutes * 0.9) }
}

function getMonthGridDates(monthStart: Date): Date[] {
  const lastOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = addDays(startOfWeek(lastOfMonth), 6)
  const dates: Date[] = []
  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 1)) dates.push(cursor)
  return dates
}

function periodStart(date: Date, view: ViewMode): Date {
  return view === 'mes' ? new Date(date.getFullYear(), date.getMonth(), 1) : startOfWeek(date)
}

function shiftPeriod(date: Date, view: ViewMode, steps: number): Date {
  if (view === 'mes') return new Date(date.getFullYear(), date.getMonth() + steps, 1)
  const size = view === 'quinzena' ? 14 : 7
  return addDays(date, size * steps)
}

function periodDates(start: Date, view: ViewMode): Date[] {
  if (view === 'mes') return getMonthGridDates(start)
  const length = view === 'quinzena' ? 14 : 7
  return Array.from({ length }, (_, i) => addDays(start, i))
}

/** Janela inicial de blocos ao redor do período focado — dá margem pra rolar pra cima/baixo sem esperar o fetch/extend disparar. */
function buildWindow(center: Date, view: ViewMode): Date[] {
  const before = view === 'mes' ? 1 : 2
  const after = view === 'mes' ? 2 : 3
  const start = periodStart(center, view)
  return Array.from({ length: before + after + 1 }, (_, i) => shiftPeriod(start, view, i - before))
}

function blockLabel(start: Date, view: ViewMode): string {
  if (view === 'mes') {
    const label = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }
  const end = addDays(start, (view === 'quinzena' ? 14 : 7) - 1)
  return `${view === 'quinzena' ? 'Quinzena' : 'Semana'} de ${formatDateBR(toISODate(start))} a ${formatDateBR(toISODate(end))}`
}

export default function CalendarPage() {
  const [athleteId, setAthleteId] = useState(athletes[0].id)
  const [view, setView] = useState<ViewMode>('semana')
  const [anchor, setAnchor] = useState(today)
  const [blocks, setBlocks] = useState<Date[]>(() => buildWindow(today, 'semana'))
  const [customWorkouts, setCustomWorkouts] = useState<PlannedWorkout[]>([])

  const [pickerDate, setPickerDate] = useState<string | null>(null)
  const [builder, setBuilder] = useState<{ date: string; disciplineLabel: string } | null>(null)
  const [builderName, setBuilderName] = useState('')
  const [builderBlocks, setBuilderBlocks] = useState<BuilderBlock[]>([])
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [addMode, setAddMode] = useState<'bloco' | 'serie'>('serie')

  const scrollRef = useRef<HTMLDivElement>(null)
  const blockRefs = useRef(new Map<string, HTMLDivElement>())
  // jumpTarget só é setado por navegação explícita (jumpTo/changeView) — nunca
  // pelo estado inicial, senão colide com a extensão por scroll (o primeiro
  // prepend/append dispara este mesmo effect e reconsumiria um jumpTarget
  // "de montagem" esquecido, duplicando o ajuste de posição).
  const jumpTarget = useRef<string | null>(null)
  const compensateScrollHeight = useRef<number | null>(null)
  const isExtending = useRef(false)

  const athlete = athletes.find((a) => a.id === athleteId) ?? athletes[0]
  const athleteWorkouts = [...plannedWorkouts, ...customWorkouts].filter((w) => w.athleteId === athlete.id)
  const athleteGoalDates: GoalDate[] = goals.filter((g) => g.athleteId === athlete.id).map((g) => ({ date: g.raceDate, name: g.raceName }))
  const athleteZones: AthleteZone[] = zoneVersions.find((z) => z.athleteId === athlete.id)?.zones ?? []

  // Posição inicial: traz o bloco de hoje para o topo da área visível, uma
  // única vez na montagem — independente do ciclo de prepend/append abaixo.
  useLayoutEffect(() => {
    blockRefs.current.get(toISODate(periodStart(today, 'semana')))?.scrollIntoView({ block: 'start' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (compensateScrollHeight.current !== null) {
      el.scrollTop += el.scrollHeight - compensateScrollHeight.current
      compensateScrollHeight.current = null
    }
    if (jumpTarget.current) {
      blockRefs.current.get(jumpTarget.current)?.scrollIntoView({ block: 'start' })
      jumpTarget.current = null
    }
    isExtending.current = false
  }, [blocks])

  function jumpTo(newAnchor: Date) {
    setAnchor(newAnchor)
    setBlocks(buildWindow(newAnchor, view))
    jumpTarget.current = toISODate(periodStart(newAnchor, view))
  }

  function changeView(next: ViewMode) {
    setView(next)
    setBlocks(buildWindow(anchor, next))
    jumpTarget.current = toISODate(periodStart(anchor, next))
  }

  function navigate(direction: 1 | -1) {
    jumpTo(shiftPeriod(periodStart(anchor, view), view, direction))
  }

  function handleScroll() {
    const el = scrollRef.current
    // isExtending evita reentrância caso mais de um evento de scroll dispare
    // antes da compensação de scrollTop do primeiro rodar.
    if (!el || blocks.length >= MAX_BLOCKS || isExtending.current) return
    if (el.scrollTop < SCROLL_EXTEND_THRESHOLD) {
      isExtending.current = true
      compensateScrollHeight.current = el.scrollHeight
      setBlocks((prev) => [shiftPeriod(prev[0], view, -1), ...prev])
    } else if (el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_EXTEND_THRESHOLD) {
      isExtending.current = true
      setBlocks((prev) => [...prev, shiftPeriod(prev[prev.length - 1], view, 1)])
    }
  }

  function chooseDiscipline(label: string) {
    if (!pickerDate) return
    setBuilder({ date: pickerDate, disciplineLabel: label })
    setBuilderName(label)
    setBuilderBlocks([])
    setEditingBlockId(null)
    setAddMode('serie')
    setPickerDate(null)
  }

  function addBuilderBlock(block: Omit<BuilderBlock, 'id'>) {
    setBuilderBlocks((prev) => [...prev, { ...block, id: `blk-${Date.now()}-${prev.length}` }])
  }

  function addBuilderBlockPair(pair: [Omit<BuilderBlock, 'id'>, Omit<BuilderBlock, 'id'>]) {
    setBuilderBlocks((prev) => [
      ...prev,
      { ...pair[0], id: `blk-${Date.now()}-a` },
      { ...pair[1], id: `blk-${Date.now()}-b` },
    ])
  }

  function updateBuilderBlock(id: string, block: Omit<BuilderBlock, 'id'>) {
    setBuilderBlocks((prev) => prev.map((b) => (b.id === id ? { ...block, id } : b)))
    setEditingBlockId(null)
  }

  function removeBuilderBlock(id: string) {
    setBuilderBlocks((prev) => prev.filter((b) => b.id !== id))
    if (editingBlockId === id) setEditingBlockId(null)
  }

  function reorderBuilderBlocks(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setBuilderBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id)
      const newIndex = prev.findIndex((b) => b.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function saveBuilderWorkout() {
    if (!builder) return
    const totals = totalsFor(builderBlocks)
    const workout: PlannedWorkout = {
      id: `pw-custom-${Date.now()}`,
      athleteId: athlete.id,
      date: builder.date,
      name: builderName || builder.disciplineLabel,
      type: builder.disciplineLabel,
      status: 'rascunho',
      version: 1,
      totalDistanceKm: totals.km,
      totalDurationMin: totals.minutes,
      plannedTss: totals.tss,
      blocks: builderBlocks.map((b, i) => ({
        id: `wb-${Date.now()}-${i}`,
        label: phaseLabel[b.phase],
        repetitions: b.repetitions,
        distanceOrDuration: blockAmountLabel(b),
        intensityZone: describeMetric(b),
        recovery: b.repetitions > 1 && b.recovery ? b.recovery : '—',
      })),
    }
    setCustomWorkouts((prev) => [...prev, workout])
    toast.success(`Treino "${workout.name}" criado em ${formatDateBR(workout.date)} (rascunho)`)
    setBuilder(null)
  }

  const editingBlock = builderBlocks.find((b) => b.id === editingBlockId) ?? null
  const liveTotals = totalsFor(builderBlocks)

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-014"
        title="Calendário de Treinos e Provas"
        objective="Mover treino publicado gera nova versão; treino realizado nunca é movido como se não tivesse ocorrido (RN-012)."
        scope="V0"
        actions={
          <Select value={athleteId} onValueChange={setAthleteId}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {athletes.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Tabs value={view} onValueChange={(v) => changeView(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="quinzena">Quinzena</TabsTrigger>
            <TabsTrigger value="mes">Mês</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1">
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => jumpTo(today)}>Hoje</Button>
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="mb-2 text-[11px] text-muted-foreground">Role para cima ou para baixo dentro do calendário para ver períodos anteriores ou futuros sem precisar clicar nas setas. Clique no + de um dia para montar um treino novo.</p>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        // overflow-anchor: none — o navegador tem "scroll anchoring" nativo
        // que também tenta compensar conteúdo inserido acima da viewport;
        // sem desligar isso, ele soma com a compensação manual abaixo e
        // dobra o deslocamento visual ao prependar um bloco.
        style={{ overflowAnchor: 'none' }}
        className="flex max-h-[70vh] flex-col divide-y overflow-y-auto rounded-lg border"
      >
        {blocks.map((blockStart) => {
          const key = toISODate(blockStart)
          const isTodayBlock = key === toISODate(periodStart(today, view))
          const dates = periodDates(blockStart, view)
          const blockWorkouts = athleteWorkouts.filter((w) => dates.some((d) => isSameDay(d, parseISODate(w.date))))
          const summaryKm = blockWorkouts.reduce((s, w) => s + w.totalDistanceKm, 0)
          return (
            <div
              key={key}
              ref={(el) => {
                if (el) blockRefs.current.set(key, el)
                else blockRefs.current.delete(key)
              }}
              className="p-3"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold">{blockLabel(blockStart, view)}</p>
                {isTodayBlock && <Badge className="text-[10px]">Hoje</Badge>}
                <Badge variant="secondary" className="text-[10px]">{blockWorkouts.length} sessões · {summaryKm} km previstos</Badge>
              </div>
              {view === 'mes' ? (
                <MonthGrid dates={dates} anchor={blockStart} workouts={athleteWorkouts} goalDates={athleteGoalDates} onAddClick={setPickerDate} />
              ) : (
                <DayCardsGrid dates={dates} workouts={athleteWorkouts} goalDates={athleteGoalDates} onAddClick={setPickerDate} />
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={!!pickerDate} onOpenChange={(open) => !open && setPickerDate(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{pickerDate && formatDateBR(pickerDate, { weekday: 'long', day: '2-digit', month: 'long' })}</DialogTitle>
            <DialogDescription>Escolha a modalidade para montar o treino de {athlete.name}.</DialogDescription>
          </DialogHeader>

          <p className="mb-2 text-xs font-medium text-muted-foreground">Adicionar um treino</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {disciplines.map((d) => (
              <button
                key={d.id}
                onClick={() => chooseDiscipline(d.label)}
                className="flex flex-col items-center gap-1.5 rounded-md border p-3 text-xs hover:border-primary hover:bg-primary/5"
              >
                <d.icon className="h-5 w-5" />
                {d.label}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">Adicionar outro</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {otherItems.map((d) => (
              <button
                key={d.id}
                onClick={() => { toast.info(`${d.label} — em breve`); setPickerDate(null) }}
                className="flex flex-col items-center gap-1.5 rounded-md border p-3 text-xs hover:border-primary hover:bg-primary/5"
              >
                <d.icon className="h-5 w-5" />
                {d.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!builder} onOpenChange={(open) => !open && setBuilder(null)}>
        <DialogContent className="max-w-2xl">
          {builder && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Input value={builderName} onChange={(e) => setBuilderName(e.target.value)} className="h-8 font-medium" />
                  <Badge variant="outline" className="shrink-0 text-[10px]">{builder.disciplineLabel}</Badge>
                </div>
                <DialogDescription>{formatDateBR(builder.date)} · Clique num bloco da barra para editá-lo, ou arraste a lista para reordenar.</DialogDescription>
              </DialogHeader>

              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">Montar treino</p>
                {builderBlocks.length > 0 && (
                  <div className="flex gap-1.5 text-[11px] text-muted-foreground">
                    <span>{liveTotals.minutes} min</span>·<span>{liveTotals.km} km</span>·<span>{liveTotals.tss} TSS</span>
                  </div>
                )}
              </div>
              <WorkoutBuildBar blocks={builderBlocks} onEdit={setEditingBlockId} />

              {builderBlocks.length > 0 && (
                <DndContext collisionDetection={closestCenter} onDragEnd={reorderBuilderBlocks}>
                  <SortableContext items={builderBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="mt-3 flex flex-col gap-1.5">
                      {builderBlocks.map((b) => (
                        <SortableBlockRow
                          key={b.id}
                          block={b}
                          onEdit={() => setEditingBlockId(b.id)}
                          onRemove={() => removeBuilderBlock(b.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              <div className="mt-3">
                {editingBlock ? (
                  <BlockForm
                    key={editingBlock.id}
                    initial={editingBlock}
                    zones={athleteZones}
                    submitLabel="Salvar alteração"
                    onSubmit={(data) => updateBuilderBlock(editingBlock.id, data)}
                    onCancel={() => setEditingBlockId(null)}
                  />
                ) : (
                  <>
                    <Tabs value={addMode} onValueChange={(v) => setAddMode(v as 'bloco' | 'serie')} className="mb-2">
                      <TabsList>
                        <TabsTrigger value="serie"><Zap className="mr-1 h-3.5 w-3.5" />Série (intervalado)</TabsTrigger>
                        <TabsTrigger value="bloco">Bloco simples</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    {addMode === 'serie' ? (
                      <IntervalQuickForm zones={athleteZones} onSubmit={addBuilderBlockPair} />
                    ) : (
                      <BlockForm zones={athleteZones} submitLabel="Adicionar bloco" onSubmit={addBuilderBlock} />
                    )}
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBuilder(null)}>Cancelar</Button>
                <Button onClick={saveBuilderWorkout} disabled={builderBlocks.length === 0}>Salvar rascunho</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WorkoutBuildBar({ blocks, onEdit }: { blocks: BuilderBlock[]; onEdit: (id: string) => void }) {
  const total = blocks.reduce((s, b) => s + effectiveMinutes(b), 0) || 1
  return (
    <div className="flex h-9 w-full overflow-hidden rounded-md border bg-muted/30">
      {blocks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-[11px] text-muted-foreground">Adicione blocos abaixo para montar o treino</div>
      ) : (
        blocks.map((b) => (
          <button
            key={b.id}
            onClick={() => onEdit(b.id)}
            className={cn('flex items-center justify-center text-[10px] font-medium transition-opacity hover:opacity-80', phaseColor[b.phase], phaseTextColor[b.phase])}
            style={{ width: `${(effectiveMinutes(b) / total) * 100}%` }}
            title={`${phaseLabel[b.phase]} · ${blockBarLabel(b)} — clique para editar`}
          >
            {blockBarLabel(b)}
          </button>
        ))
      )}
    </div>
  )
}

function SortableBlockRow({ block, onEdit, onRemove }: { block: BuilderBlock; onEdit: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between rounded-md border bg-card p-2 text-xs">
      <span className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground active:cursor-grabbing">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <span className={cn('inline-block h-2 w-2 rounded-full', phaseColor[block.phase])} />
        {phaseLabel[block.phase]} · {block.repetitions > 1 ? `${block.repetitions}x ` : ''}{blockAmountLabel(block)}
        {block.repetitions > 1 && block.recovery && ` · recuperação ${block.recovery}`}
        {' · '}{describeMetric(block)}
      </span>
      <span className="flex items-center gap-1">
        <button onClick={onEdit} className="text-muted-foreground hover:text-primary">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </span>
    </div>
  )
}

/** Quick-pick de zona vigente do atleta — evita o treinador ter que digitar pace/FC de cabeça (RW-COACH-SCREEN-008). */
function ZoneQuickPicks({ zones, metricType, onPick }: { zones: AthleteZone[]; metricType: MetricType; onPick: (min: string, max: string) => void }) {
  if (zones.length === 0 || (metricType !== 'pace' && metricType !== 'fc')) return null
  return (
    <div className="col-span-2 flex flex-wrap gap-1 sm:col-span-5">
      <span className="text-[10px] text-muted-foreground">Zona:</span>
      {zones.map((z) => (
        <button
          key={z.name}
          type="button"
          onClick={() => onPick(metricType === 'pace' ? z.paceMin : String(z.hrMin), metricType === 'pace' ? z.paceMax : String(z.hrMax))}
          className="rounded border px-1.5 py-0.5 text-[10px] hover:border-primary hover:bg-primary/5"
        >
          {z.name.split(' — ')[0]}
        </button>
      ))}
    </div>
  )
}

function BlockForm({
  initial,
  zones,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: BuilderBlock
  zones: AthleteZone[]
  submitLabel: string
  onSubmit: (b: Omit<BuilderBlock, 'id'>) => void
  onCancel?: () => void
}) {
  const [phase, setPhase] = useState<BlockPhase>(initial?.phase ?? 'aquecimento')
  const [buildUnit, setBuildUnit] = useState<BuildUnit>(initial?.buildUnit ?? 'duracao')
  const [duration, setDuration] = useState(String(initial?.durationMin ?? 10))
  const [distanceM, setDistanceM] = useState(String(initial?.distanceM ?? 1000))
  const [repetitions, setRepetitions] = useState(String(initial?.repetitions ?? 1))
  const [recovery, setRecovery] = useState(initial?.recovery ?? '')
  const [metricType, setMetricType] = useState<MetricType>(initial?.metricType ?? 'rpe')
  const [min, setMin] = useState(initial?.min ?? '')
  const [max, setMax] = useState(initial?.max ?? '')

  const repsNum = Math.max(1, Number(repetitions) || 1)

  function submit() {
    onSubmit({
      phase,
      buildUnit,
      durationMin: Number(duration) || 0,
      distanceM: Number(distanceM) || 0,
      repetitions: repsNum,
      recovery,
      metricType,
      min,
      max,
    })
    if (!initial) {
      setDuration('10')
      setDistanceM('1000')
      setRepetitions('1')
      setRecovery('')
      setMin('')
      setMax('')
    }
  }

  return (
    <div className={cn('rounded-md border p-2.5', initial && 'border-primary/50 bg-primary/5')}>
      {initial && (
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-medium text-primary">Editando bloco</p>
          {onCancel && (
            <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <div>
          <Label className="text-[10px]">Bloco</Label>
          <Select value={phase} onValueChange={(v) => setPhase(v as BlockPhase)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="aquecimento">Aquecimento</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="recuperacao">Recuperação</SelectItem>
              <SelectItem value="desaquecimento">Desaquecimento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px]">Repetições</Label>
          <Input className="h-8 text-xs" value={repetitions} onChange={(e) => setRepetitions(e.target.value)} type="number" min={1} />
        </div>
        <div>
          <Label className="text-[10px]">Construir por</Label>
          <Select value={buildUnit} onValueChange={(v) => setBuildUnit(v as BuildUnit)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="duracao">Duração</SelectItem>
              <SelectItem value="distancia">Distância</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {buildUnit === 'duracao' ? (
          <div>
            <Label className="text-[10px]">Duração/rep (min)</Label>
            <Input className="h-8 text-xs" value={duration} onChange={(e) => setDuration(e.target.value)} type="number" min={1} />
          </div>
        ) : (
          <div>
            <Label className="text-[10px]">Distância/rep (m)</Label>
            <Input className="h-8 text-xs" value={distanceM} onChange={(e) => setDistanceM(e.target.value)} type="number" min={1} step={50} />
          </div>
        )}
        <div>
          <Label className="text-[10px]">Métrica</Label>
          <Select value={metricType} onValueChange={(v) => setMetricType(v as MetricType)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="duracao">Só duração</SelectItem>
              <SelectItem value="rpe">RPE</SelectItem>
              <SelectItem value="fc">Frequência cardíaca</SelectItem>
              <SelectItem value="potencia">Potência</SelectItem>
              <SelectItem value="pace">Pace (mm:ss)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {metricType !== 'duracao' && (
          <div className="flex gap-1">
            <div className="flex-1">
              <Label className="text-[10px]">Mín</Label>
              <Input className="h-8 text-xs" value={min} onChange={(e) => setMin(e.target.value)} placeholder={metricType === 'pace' ? '5:00' : ''} />
            </div>
            <div className="flex-1">
              <Label className="text-[10px]">Máx</Label>
              <Input className="h-8 text-xs" value={max} onChange={(e) => setMax(e.target.value)} placeholder={metricType === 'pace' ? '4:40' : ''} />
            </div>
          </div>
        )}
        <ZoneQuickPicks zones={zones} metricType={metricType} onPick={(mn, mx) => { setMin(mn); setMax(mx) }} />
        {repsNum > 1 && (
          <div className="col-span-2">
            <Label className="text-[10px]">Recuperação entre séries</Label>
            <Input className="h-8 text-xs" value={recovery} onChange={(e) => setRecovery(e.target.value)} placeholder="ex.: 400m trote (2 min)" />
          </div>
        )}
      </div>
      {(buildUnit === 'distancia' && metricType !== 'pace') && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">Sem pace informado, a duração deste bloco não entra no total — só a distância.</p>
      )}
      {(buildUnit === 'duracao' && metricType === 'pace') && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">Distância do bloco estimada a partir do pace × duração — não é GPS real.</p>
      )}
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant={initial ? 'default' : 'outline'} onClick={submit}>
          <Plus className="h-4 w-4" /> {submitLabel}
        </Button>
        {initial && onCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar edição</Button>
        )}
      </div>
    </div>
  )
}

/**
 * Atalho pra montar uma série de intervalos (ativo + recuperação repetidos)
 * numa tacada só — o mesmo resultado que TrainingPeaks só entrega depois de
 * vários cliques em telas separadas. Gera dois BuilderBlock com o mesmo
 * número de repetições, que a barra desenha lado a lado.
 */
function IntervalQuickForm({ zones, onSubmit }: { zones: AthleteZone[]; onSubmit: (pair: [Omit<BuilderBlock, 'id'>, Omit<BuilderBlock, 'id'>]) => void }) {
  const [repetitions, setRepetitions] = useState('6')
  const [activeUnit, setActiveUnit] = useState<BuildUnit>('distancia')
  const [activeAmount, setActiveAmount] = useState('1000')
  const [activeMin, setActiveMin] = useState('')
  const [activeMax, setActiveMax] = useState('')
  const [recoveryMin, setRecoveryMin] = useState('2')
  const [recoveryNote, setRecoveryNote] = useState('trote leve')

  function submit() {
    const reps = Math.max(1, Number(repetitions) || 1)
    const active: Omit<BuilderBlock, 'id'> = {
      phase: 'ativo',
      buildUnit: activeUnit,
      durationMin: activeUnit === 'duracao' ? Number(activeAmount) || 0 : 0,
      distanceM: activeUnit === 'distancia' ? Number(activeAmount) || 0 : 0,
      repetitions: reps,
      recovery: recoveryNote,
      metricType: 'pace',
      min: activeMin,
      max: activeMax,
    }
    const recovery: Omit<BuilderBlock, 'id'> = {
      phase: 'recuperacao',
      buildUnit: 'duracao',
      durationMin: Number(recoveryMin) || 0,
      distanceM: 0,
      repetitions: reps,
      recovery: recoveryNote,
      metricType: 'duracao',
      min: '',
      max: '',
    }
    onSubmit([active, recovery])
    setActiveAmount(activeUnit === 'distancia' ? '1000' : '3')
  }

  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5">
      <p className="mb-2 text-[11px] text-muted-foreground">Monta a série ativa + recuperação de uma vez — o padrão mais comum de intervalado.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div>
          <Label className="text-[10px]">Repetições</Label>
          <Input className="h-8 text-xs" value={repetitions} onChange={(e) => setRepetitions(e.target.value)} type="number" min={1} />
        </div>
        <div>
          <Label className="text-[10px]">Ativo — construir por</Label>
          <Select value={activeUnit} onValueChange={(v) => setActiveUnit(v as BuildUnit)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="distancia">Distância (m)</SelectItem>
              <SelectItem value="duracao">Duração (min)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px]">{activeUnit === 'distancia' ? 'Distância/rep (m)' : 'Duração/rep (min)'}</Label>
          <Input className="h-8 text-xs" value={activeAmount} onChange={(e) => setActiveAmount(e.target.value)} type="number" min={1} step={activeUnit === 'distancia' ? 50 : 1} />
        </div>
        <div className="flex gap-1">
          <div className="flex-1">
            <Label className="text-[10px]">Pace mín</Label>
            <Input className="h-8 text-xs" value={activeMin} onChange={(e) => setActiveMin(e.target.value)} placeholder="4:30" />
          </div>
          <div className="flex-1">
            <Label className="text-[10px]">Pace máx</Label>
            <Input className="h-8 text-xs" value={activeMax} onChange={(e) => setActiveMax(e.target.value)} placeholder="4:10" />
          </div>
        </div>
        <ZoneQuickPicks zones={zones} metricType="pace" onPick={(mn, mx) => { setActiveMin(mn); setActiveMax(mx) }} />
        <div>
          <Label className="text-[10px]">Recuperação (min)</Label>
          <Input className="h-8 text-xs" value={recoveryMin} onChange={(e) => setRecoveryMin(e.target.value)} type="number" min={0} />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <Label className="text-[10px]">Descrição da recuperação</Label>
          <Input className="h-8 text-xs" value={recoveryNote} onChange={(e) => setRecoveryNote(e.target.value)} placeholder="ex.: trote leve" />
        </div>
      </div>
      <Button size="sm" className="mt-2" onClick={submit}>
        <Zap className="h-4 w-4" /> Criar série
      </Button>
    </div>
  )
}

function DayCardsGrid({ dates, workouts, goalDates, onAddClick }: { dates: Date[]; workouts: PlannedWorkout[]; goalDates: GoalDate[]; onAddClick: (dateIso: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {dates.map((date) => {
        const iso = toISODate(date)
        const dayWorkouts = workouts.filter((w) => w.date === iso)
        const race = goalDates.find((g) => g.date === iso)
        const isToday = isSameDay(date, today)
        return (
          <Card key={iso} className={isToday ? 'min-h-[160px] border-primary' : 'min-h-[160px]'}>
            <CardContent className="p-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground">
                  {weekdayLabels[(date.getDay() + 6) % 7]} · {formatDateBR(iso, { day: '2-digit', month: '2-digit' })}
                </p>
                <button
                  onClick={() => onAddClick(iso)}
                  className="flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                  title="Adicionar treino"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {race && (
                  <div className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 p-2 text-[11px] font-medium text-primary">
                    <Flag className="h-3 w-3" /> {race.name}
                  </div>
                )}
                {dayWorkouts.map((w) => (
                  <div key={w.id} className="rounded-md border p-2 text-[11px]">
                    <p className="font-medium">{w.name}</p>
                    <p className="text-muted-foreground">{w.totalDistanceKm} km · {w.plannedTss} TSS</p>
                    <StatePill state={w.status} className="mt-1" />
                  </div>
                ))}
                {dayWorkouts.length === 0 && !race && <p className="text-[11px] text-muted-foreground">Folga</p>}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function MonthGrid({ dates, anchor, workouts, goalDates, onAddClick }: { dates: Date[]; anchor: Date; workouts: PlannedWorkout[]; goalDates: GoalDate[]; onAddClick: (dateIso: string) => void }) {
  return (
    <div className="rounded-lg border">
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekdayLabels.map((d) => (
          <div key={d} className="p-2 text-center text-[11px] font-medium text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dates.map((date) => {
          const iso = toISODate(date)
          const dayWorkouts = workouts.filter((w) => w.date === iso)
          const race = goalDates.find((g) => g.date === iso)
          const isToday = isSameDay(date, today)
          const outOfMonth = date.getMonth() !== anchor.getMonth()
          const visible = dayWorkouts.slice(0, 2)
          const overflow = dayWorkouts.length - visible.length
          return (
            <div
              key={iso}
              className={cn('group min-h-[92px] border-b border-r p-1.5 last:border-r-0', outOfMonth && 'bg-muted/20', isToday && 'bg-primary/5')}
            >
              <div className="mb-1 flex items-center justify-between">
                <p className={cn('text-[11px]', outOfMonth ? 'text-muted-foreground/50' : isToday ? 'font-semibold text-primary' : 'text-muted-foreground')}>
                  {date.getDate()}
                </p>
                <button
                  onClick={() => onAddClick(iso)}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded text-muted-foreground opacity-0 hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
                  title="Adicionar treino"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {race && (
                  <span className="flex items-center gap-1 truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary">
                    <Flag className="h-2.5 w-2.5 shrink-0" /> {race.name}
                  </span>
                )}
                {visible.map((w) => (
                  <span key={w.id} className="truncate rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground" title={`${w.name} · ${w.totalDistanceKm}km`}>
                    {w.name}
                  </span>
                ))}
                {overflow > 0 && <span className="text-[10px] text-muted-foreground">+{overflow} mais</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
