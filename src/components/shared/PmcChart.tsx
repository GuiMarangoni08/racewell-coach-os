import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { LoadPoint } from '@/types/domain'
import { formatDateBR } from '@/lib/utils'
import { cn } from '@/lib/utils'

/**
 * Gráfico de condicionamento estilo PMC (TrainingPeaks): TSS diário em
 * barras, Fitness (CTL) e Fadiga (ATL) em linha, Forma (TSB) plotada no
 * mesmo eixo das linhas. É a peça central que faltava para o treinador
 * ter um sinal objetivo e único de "empurrar carga ou recuperar".
 */
export function PmcChart({ data, height = 260 }: { data: LoadPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          fontSize={10}
          tickFormatter={(d: string) => formatDateBR(d, { day: '2-digit', month: '2-digit' })}
          minTickGap={30}
        />
        <YAxis fontSize={10} />
        <Tooltip
          labelFormatter={(d: string) => formatDateBR(d)}
          contentStyle={{ fontSize: 12, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="tss" name="Carga do dia (TSS)" fill="hsl(var(--muted-foreground))" opacity={0.35} radius={2} />
        <Line type="monotone" dataKey="ctl" name="Fitness (CTL)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="atl" name="Fadiga (ATL)" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="tsb" name="Forma (TSB)" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} strokeDasharray="4 3" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

/** Trio de pills "Fitness / Fadiga / Forma" fixo no topo — mesma referência do badge do TrainingPeaks em todo treino/tela. */
export function PmcStatePills({ latest }: { latest: LoadPoint | undefined }) {
  if (!latest) return null
  const tsbTone = latest.tsb >= 5 ? 'success' : latest.tsb <= -15 ? 'destructive' : 'warning'
  return (
    <div className="flex flex-wrap gap-2">
      <Pill label="Fitness" value={latest.ctl} tone="primary" />
      <Pill label="Fadiga" value={latest.atl} tone="destructive" />
      <Pill label="Forma" value={latest.tsb} tone={tsbTone} />
    </div>
  )
}

function Pill({ label, value, tone }: { label: string; value: number; tone: 'primary' | 'destructive' | 'success' | 'warning' }) {
  const toneClass = {
    primary: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
  }[tone]
  return (
    <div className={cn('rounded-md px-3 py-1.5 text-xs font-semibold', toneClass)}>
      {label} <span className="font-bold">{Math.round(value)}</span>
    </div>
  )
}
