import { useState } from 'react'
import { toast } from 'sonner'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Sparkles, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { plannedWorkouts } from '@/data/mock'
import type { WorkoutBlock } from '@/types/domain'
import { StatePill } from '@/components/shared/StatusPill'

function SortableBlock({ block, onRemove }: { block: WorkoutBlock; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-md border bg-card p-2.5">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
        <Field label="Bloco" value={block.label} />
        <Field label="Repetições" value={String(block.repetitions)} />
        <Field label="Distância/Duração" value={block.distanceOrDuration} />
        <Field label="Zona" value={block.intensityZone} />
        <Field label="Recuperação" value={block.recovery} />
      </div>
      <button onClick={() => onRemove(block.id)} className="text-muted-foreground hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input defaultValue={value} className="h-8 text-xs" />
    </div>
  )
}

export default function WorkoutEditorPage() {
  const [workout, setWorkout] = useState(plannedWorkouts[2] ?? plannedWorkouts[0])
  const [blocks, setBlocks] = useState(workout.blocks)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id)
      const newIndex = prev.findIndex((b) => b.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function addBlock() {
    setBlocks((prev) => [
      ...prev,
      { id: `b-${Date.now()}`, label: 'Novo bloco', repetitions: 1, distanceOrDuration: '—', intensityZone: 'Z1', recovery: '—' },
    ])
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-012"
        title="Editor de Treino"
        objective="Montagem por blocos, repetições e critérios. Rascunho exige só nome; publicação exige estrutura mínima válida (RN-008)."
        scope="V0"
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => toast.info('Rascunho salvo (simulado)')}>Salvar rascunho</Button>
            <Button size="sm" onClick={() => toast.success('Treino publicado — nova versão criada (simulado)')}>Publicar</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Input
                value={workout.name}
                onChange={(e) => setWorkout({ ...workout, name: e.target.value })}
                className="h-8 w-64 font-medium"
              />
              <StatePill state={workout.status} />
              <Badge variant="outline" className="text-[10px]">versão {workout.version}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {blocks.map((b) => (
                    <SortableBlock key={b.id} block={b} onRemove={removeBlock} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button variant="outline" size="sm" className="mt-3" onClick={addBlock}>
              <Plus className="h-4 w-4" /> Adicionar bloco
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader><CardTitle>Totais reconciliados</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[11px] text-muted-foreground">Distância total</p><p className="font-semibold">{workout.totalDistanceKm} km</p></div>
              <div><p className="text-[11px] text-muted-foreground">Duração estimada</p><p className="font-semibold">{workout.totalDurationMin} min</p></div>
              <div><p className="text-[11px] text-muted-foreground">Blocos</p><p className="font-semibold">{blocks.length}</p></div>
              <div><p className="text-[11px] text-muted-foreground">RPE alvo</p><p className="font-semibold">—</p></div>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-primary"><Sparkles className="h-4 w-4" /> IA explica</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              A estrutura proposta mantém a progressão de fase (Específica) e respeita o volume semanal
              planejado. Nenhuma alteração é aplicada sem publicação humana.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
