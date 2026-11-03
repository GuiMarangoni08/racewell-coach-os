import { segmentKinds, workoutTypes } from './types.ts'
import type { WorkoutContent, WorkoutContentBlock, WorkoutEffort, WorkoutSegment } from './types.ts'

export class ApiContractError extends Error {
  constructor(message: string) { super(message); this.name = 'ApiContractError' }
}
export function record(value: unknown, label: string): Record<string, unknown> {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  throw new ApiContractError(`Esperado objeto em ${label}.`)
}
export function requiredText(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new ApiContractError(`Campo obrigatório inválido: ${label}.`)
  return value
}
export function integer(value: unknown, min: number, max: number, label: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new ApiContractError(`${label}: use um inteiro entre ${min} e ${max}.`)
  }
  return value
}
function keys(source: Record<string, unknown>, allowed: string[], label: string) {
  if (Object.keys(source).some((key) => !allowed.includes(key))) throw new ApiContractError(`Campo não suportado em ${label}.`)
}
function optionalText(value: unknown, max: number, label: string): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || value.length > max) throw new ApiContractError(`${label}: limite de ${max} caracteres.`)
  return value
}
export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
export function calendarDate(value: unknown): string {
  if (typeof value !== 'string' || !isCalendarDate(value)) throw new ApiContractError('Use uma data de calendário válida YYYY-MM-DD.')
  return value
}
export function weekStartFor(value: string): string {
  const date = new Date(`${calendarDate(value)}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7))
  return date.toISOString().slice(0, 10)
}
export function monday(value: unknown): string {
  const date = calendarDate(value)
  if (weekStartFor(date) !== date) throw new ApiContractError('O início da semana deve ser uma segunda-feira.')
  return date
}
function effort(value: unknown): WorkoutEffort {
  const source = record(value, 'esforço')
  keys(source, ['paceSecondsPerKm', 'heartRateMin', 'heartRateMax', 'rpe'], 'esforço')
  const result: WorkoutEffort = {}
  if (source.paceSecondsPerKm !== undefined) result.paceSecondsPerKm = integer(source.paceSecondsPerKm, 60, 3600, 'Pace (segundos/km)')
  if (source.heartRateMin !== undefined) result.heartRateMin = integer(source.heartRateMin, 30, 250, 'FC mínima')
  if (source.heartRateMax !== undefined) result.heartRateMax = integer(source.heartRateMax, 30, 250, 'FC máxima')
  if (source.rpe !== undefined) result.rpe = integer(source.rpe, 1, 10, 'RPE')
  if (result.heartRateMin !== undefined && result.heartRateMax !== undefined && result.heartRateMin > result.heartRateMax) throw new ApiContractError('FC mínima deve ser menor ou igual à máxima.')
  return result
}
function segment(value: unknown): WorkoutSegment {
  const source = record(value, 'bloco')
  keys(source, ['kind', 'durationSeconds', 'distanceMeters', 'effort', 'notes'], 'bloco')
  if (!segmentKinds.includes(source.kind as WorkoutSegment['kind'])) throw new ApiContractError('Tipo de bloco inválido.')
  const result: WorkoutSegment = { kind: source.kind as WorkoutSegment['kind'] }
  if (source.durationSeconds !== undefined) result.durationSeconds = integer(source.durationSeconds, 1, 86400, 'Duração (segundos)')
  if (source.distanceMeters !== undefined) result.distanceMeters = integer(source.distanceMeters, 1, 500000, 'Distância (metros)')
  if (result.durationSeconds === undefined && result.distanceMeters === undefined) throw new ApiContractError('Cada bloco precisa de duração em segundos ou distância em metros.')
  if (source.effort !== undefined) result.effort = effort(source.effort)
  if (source.notes !== undefined) result.notes = optionalText(source.notes, 1000, 'Notas do bloco')
  return result
}
export function validateContent(value: unknown): WorkoutContent {
  const source = record(value, 'content')
  keys(source, ['schemaVersion', 'title', 'type', 'notes', 'blocks'], 'content')
  if (source.schemaVersion !== 1) throw new ApiContractError('Versão de conteúdo não suportada; esperado schemaVersion: 1.')
  const title = requiredText(source.title, 'Título').trim()
  if (title.length > 160) throw new ApiContractError('Título: limite de 160 caracteres.')
  if (!workoutTypes.includes(source.type as WorkoutContent['type'])) throw new ApiContractError('Tipo de treino inválido.')
  if (!Array.isArray(source.blocks) || source.blocks.length < 1 || source.blocks.length > 100) throw new ApiContractError('Use de 1 a 100 blocos.')
  const blocks: WorkoutContentBlock[] = source.blocks.map((value) => {
    const block = record(value, 'bloco')
    if (block.kind !== 'repeat') return segment(block)
    keys(block, ['kind', 'repetitions', 'blocks'], 'repetição')
    if (!Array.isArray(block.blocks) || block.blocks.length < 1 || block.blocks.length > 20) throw new ApiContractError('Uma repetição precisa de 1 a 20 blocos simples internos.')
    return { kind: 'repeat', repetitions: integer(block.repetitions, 2, 100, 'Repetições'), blocks: block.blocks.map(segment) }
  })
  const result: WorkoutContent = { schemaVersion: 1, title, type: source.type as WorkoutContent['type'], blocks }
  if (source.notes !== undefined) result.notes = optionalText(source.notes, 4000, 'Notas do treino')
  if (new TextEncoder().encode(JSON.stringify(result)).byteLength > 65536) throw new ApiContractError('Conteúdo excede 64 KiB.')
  return result
}
export function contentTotals(content: WorkoutContent): { totalDistanceKm?: number; totalDurationMin?: number } {
  const parts = content.blocks.flatMap((block) => block.kind === 'repeat'
    ? block.blocks.map((part) => ({ ...part, count: block.repetitions }))
    : [{ ...block, count: 1 }])
  return {
    totalDistanceKm: parts.every((part) => part.distanceMeters !== undefined) ? parts.reduce((sum, part) => sum + part.distanceMeters! * part.count, 0) / 1000 : undefined,
    totalDurationMin: parts.every((part) => part.durationSeconds !== undefined) ? parts.reduce((sum, part) => sum + part.durationSeconds! * part.count, 0) / 60 : undefined,
  }
}
