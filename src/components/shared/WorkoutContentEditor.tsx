import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { segmentKinds } from '@/api/types'
import type { WorkoutContentBlock, WorkoutSegment } from '@/api/types'

const labels: Record<string, string> = { warmup: 'Aquecimento', run: 'Corrida', recovery: 'Recuperação', cooldown: 'Volta à calma', strength: 'Força', rest: 'Descanso' }
export const newSegment = (): WorkoutSegment => ({ kind: 'run', distanceMeters: 1000 })
function optionalNumber(value: string): number | undefined { return value === '' ? undefined : Number(value) }
function SegmentFields({ segment, onChange, disabled }: { segment: WorkoutSegment; onChange: (value: WorkoutSegment) => void; disabled?: boolean }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
    <div><Label className="text-[10px]">Tipo de bloco</Label><select aria-label="Tipo de bloco" className="h-8 w-full rounded-md border bg-background px-2 text-xs" value={segment.kind} disabled={disabled} onChange={(e) => onChange({ ...segment, kind: e.target.value as WorkoutSegment['kind'] })}>{segmentKinds.map((kind) => <option key={kind} value={kind}>{labels[kind]}</option>)}</select></div>
    {[{ field: 'distanceMeters' as const, label: 'Distância (m)', min: 1, max: 500000 }, { field: 'durationSeconds' as const, label: 'Duração (s)', min: 1, max: 86400 }].map(({ field, label, min, max }) => <div key={field}><Label className="text-[10px]">{label}</Label><Input aria-label={label} className="h-8 text-xs" type="number" step="1" min={min} max={max} disabled={disabled} value={segment[field] ?? ''} onChange={(e) => onChange({ ...segment, [field]: optionalNumber(e.target.value) })} /></div>)}
    {[{ field: 'paceSecondsPerKm' as const, label: 'Pace (s/km)', min: 60, max: 3600 }, { field: 'heartRateMin' as const, label: 'FC mínima', min: 30, max: 250 }, { field: 'heartRateMax' as const, label: 'FC máxima', min: 30, max: 250 }, { field: 'rpe' as const, label: 'RPE', min: 1, max: 10 }].map(({ field, label, min, max }) => <div key={field}><Label className="text-[10px]">{label}</Label><Input aria-label={label} className="h-8 text-xs" type="number" step="1" min={min} max={max} disabled={disabled} value={segment.effort?.[field] ?? ''} onChange={(e) => onChange({ ...segment, effort: { ...segment.effort, [field]: optionalNumber(e.target.value) } })} /></div>)}
    <div><Label className="text-[10px]">Notas do bloco</Label><Input aria-label="Notas do bloco" className="h-8 text-xs" maxLength={1000} disabled={disabled} value={segment.notes ?? ''} onChange={(e) => onChange({ ...segment, notes: e.target.value })} /></div>
  </div>
}
export function WorkoutContentEditor({ block, onChange, disabled }: { block: WorkoutContentBlock; onChange: (value: WorkoutContentBlock) => void; disabled?: boolean }) {
  if (block.kind !== 'repeat') return <div className="space-y-2"><SegmentFields segment={block} onChange={onChange} disabled={disabled} /><Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => onChange({ kind: 'repeat', repetitions: 2, blocks: [block] })}>Transformar em repetição</Button></div>
  return <div className="space-y-2">
    <div className="flex items-center gap-2"><Label className="text-xs">Repetições (2–100)</Label><Input aria-label="Repetições" className="h-8 w-24 text-xs" type="number" step="1" min={2} max={100} disabled={disabled} value={block.repetitions} onChange={(e) => onChange({ ...block, repetitions: Number(e.target.value) })} /></div>
    {block.blocks.map((segment, index) => <div key={index} className="rounded-md border p-2"><SegmentFields segment={segment} disabled={disabled} onChange={(value) => onChange({ ...block, blocks: block.blocks.map((part, i) => i === index ? value : part) })} /><Button type="button" size="sm" variant="ghost" aria-label="Remover bloco interno" disabled={disabled || block.blocks.length === 1} onClick={() => onChange({ ...block, blocks: block.blocks.filter((_, i) => i !== index) })}><Trash2 className="h-3 w-3" /> Remover bloco interno</Button></div>)}
    <Button type="button" size="sm" variant="outline" disabled={disabled || block.blocks.length >= 20} onClick={() => onChange({ ...block, blocks: [...block.blocks, newSegment()] })}><Plus className="h-3 w-3" /> Bloco interno</Button>
    <p className="text-[10px] text-muted-foreground">Sem repetição recursiva. A recuperação é um bloco interno próprio.</p>
  </div>
}
