import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * new Date('YYYY-MM-DD') parses as UTC midnight, which shifts a day back
 * in negative-UTC-offset timezones once rendered locally. Parse the parts
 * explicitly so "2026-07-20" always means local July 20th, not July 19th.
 */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateBR(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  return parseISODate(dateStr).toLocaleDateString('pt-BR', opts)
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Segunda-feira da semana da data informada (calendário começa na segunda, não no domingo). */
export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const dow = d.getDay()
  const diffToMonday = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diffToMonday)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
