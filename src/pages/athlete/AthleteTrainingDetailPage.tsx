import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { plannedWorkouts } from '@/data/mock'

const feelOptions = [
  { value: 1, label: 'Muito fraco' },
  { value: 2, label: 'Fraco' },
  { value: 3, label: 'Normal' },
  { value: 4, label: 'Forte' },
  { value: 5, label: 'Muito forte' },
]

export default function AthleteTrainingDetailPage() {
  const { workoutId } = useParams()
  const workout = plannedWorkouts.find((w) => w.id === workoutId) ?? plannedWorkouts[0]
  const [rpe, setRpe] = useState<number | null>(null)
  const [feel, setFeel] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Badge variant="outline" className="mb-1 text-[10px]">{workout.type}</Badge>
        <h1 className="text-base font-semibold">{workout.name}</h1>
        <p className="text-xs text-muted-foreground">{workout.totalDistanceKm} km · ~{workout.totalDurationMin} min</p>
      </div>

      <div className="flex flex-col gap-2">
        {workout.blocks.map((b, i) => (
          <Card key={b.id}>
            <CardContent className="p-3 text-xs">
              <p className="mb-0.5 font-medium">{i + 1}. {b.label}</p>
              <p className="text-muted-foreground">{b.repetitions}x {b.distanceOrDuration} · {b.intensityZone} {b.recovery !== '—' && `· recuperação ${b.recovery}`}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-3">
          <p className="mb-2 text-xs font-medium">Sensação geral</p>
          <div className="mb-3 flex gap-1.5">
            {feelOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setFeel(f.value)}
                title={f.label}
                className={`flex-1 rounded py-1.5 text-center text-[10px] leading-tight ${feel === f.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="mb-2 text-xs font-medium">Como foi o esforço percebido (RPE)?</p>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => setRpe(n)}
                className={`flex h-6 w-6 items-center justify-center rounded text-[10px] ${rpe === n ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={() => toast.success('Treino marcado como realizado — enviado ao seu treinador (simulado)')}
          >
            <CheckCircle2 className="h-4 w-4" /> Marcar como realizado
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
