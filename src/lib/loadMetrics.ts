import type { LoadPoint } from '@/types/domain'
import { parseISODate } from '@/lib/utils'

/**
 * Modelo clássico de Performance Management (Coggan/TrainingPeaks), adaptado
 * para o vocabulário do Racewell: Fitness (CTL) é a média móvel exponencial
 * de 42 dias da carga diária (TSS), Fadiga (ATL) é a EMA de 7 dias, e Forma
 * (TSB) é a diferença entre as duas — positiva indica atleta "fresco",
 * negativa indica acúmulo de fadiga recente.
 */
export function computePmc(dailyTss: { date: string; tss: number }[]): LoadPoint[] {
  const sorted = [...dailyTss].sort((a, b) => parseISODate(a.date).getTime() - parseISODate(b.date).getTime())
  const ctlDecay = 1 - Math.exp(-1 / 42)
  const atlDecay = 1 - Math.exp(-1 / 7)

  let ctl = 0
  let atl = 0
  return sorted.map(({ date, tss }) => {
    ctl = ctl + ctlDecay * (tss - ctl)
    atl = atl + atlDecay * (tss - atl)
    return { date, tss, ctl: round1(ctl), atl: round1(atl), tsb: round1(ctl - atl) }
  })
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

export function weeksUntil(dateISO: string, fromISO = '2026-07-21'): number {
  const ms = parseISODate(dateISO).getTime() - parseISODate(fromISO).getTime()
  return Math.max(0, Math.ceil(ms / (7 * 24 * 60 * 60 * 1000)))
}
