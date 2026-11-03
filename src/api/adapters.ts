import { ApiContractError, calendarDate, contentTotals, integer, monday, record, requiredText, validateContent } from './content.ts'
import type { AthleteSummary, AuthUser, Organization, OrganizationContext, Publication, PublishResult, TrainingWeek, WeekResult, WeekWriteInput, WorkoutData, WorkoutDocument, WorkoutMutationResult, WorkoutTemplate, WorkoutWritePayload } from './types.ts'
export { ApiContractError, validateContent } from './content.ts'

function data(value: unknown): unknown {
  const envelope = record(value, 'resposta operacional')
  if (!('data' in envelope)) throw new ApiContractError('Resposta operacional sem envelope data.')
  return envelope.data
}
function rowVersion(value: unknown): number { return integer(value, 1, 2147483646, 'rowVersion') }
export function readAccessToken(payload: unknown): string | undefined {
  const source = record(payload, 'auth/login')
  return typeof source.token === 'string' && source.token.trim() ? source.token : undefined
}
export function adaptAuthUser(payload: unknown): AuthUser {
  const source = record(record(payload, 'auth/me').user, 'auth/me.user')
  const email = typeof source.email === 'string' && source.email.trim() ? source.email.trim() : undefined
  const name = typeof source.name === 'string' && source.name.trim() ? source.name.trim() : email ?? 'Conta'
  return { id: requiredText(source.id, 'id'), ...(email ? { email } : {}), name, ...(typeof source.role === 'string' ? { role: source.role } : {}) }
}
export function adaptOrganizationContext(payload: unknown): OrganizationContext {
  const source = record(data(payload), 'context')
  if (source.apiVersion !== 1 || source.contentSchemaVersion !== 1) throw new ApiContractError('Versão da API ou do conteúdo não suportada.')
  if (!Array.isArray(source.organizations) || !Array.isArray(source.athleteOrganizations)) throw new ApiContractError('Contexto sem listas de organizações válidas.')
  return {
    userId: requiredText(source.userId, 'userId'), apiVersion: 1, contentSchemaVersion: 1,
    organizations: source.organizations.map((value) => {
      const org = record(value, 'organizations[]')
      if (!['owner', 'admin', 'coach'].includes(String(org.role))) throw new ApiContractError('Papel de organização inválido.')
      return { id: requiredText(org.id, 'id'), name: requiredText(org.name, 'name'), role: org.role as Organization['role'] }
    }),
    athleteOrganizations: source.athleteOrganizations.map((value) => {
      const org = record(value, 'athleteOrganizations[]')
      return { id: requiredText(org.id, 'id'), name: requiredText(org.name, 'name') }
    }),
  }
}
export function adaptAthlete(value: unknown): AthleteSummary {
  const source = record(value, 'atleta')
  return { id: requiredText(source.id, 'id'), name: requiredText(source.name, 'name'), tags: [] }
}
export function adaptAthleteResponse(payload: unknown): AthleteSummary { return adaptAthlete(data(payload)) }
function document(value: unknown): WorkoutDocument {
  const source = record(value, 'documento')
  if (source.kind !== 'workout' && source.kind !== 'template') throw new ApiContractError('Tipo de documento inválido.')
  return {
    id: requiredText(source.id, 'id'), kind: source.kind, rowVersion: rowVersion(source.rowVersion), content: validateContent(source.content),
    athleteId: source.athleteId === null ? null : requiredText(source.athleteId, 'athleteId'),
    weekId: source.weekId === null ? null : requiredText(source.weekId, 'weekId'),
    date: source.date === null ? null : calendarDate(source.date),
  }
}
export function adaptWorkoutDocument(value: unknown): WorkoutData {
  const doc = document(value)
  if (doc.kind !== 'workout' || !doc.athleteId || !doc.weekId || !doc.date) throw new ApiContractError('Workout sem atleta, semana ou data.')
  return { ...doc, kind: 'workout', athleteId: doc.athleteId, weekId: doc.weekId, date: doc.date, name: doc.content.title, type: doc.content.type, objective: doc.content.notes, ...contentTotals(doc.content) }
}
export function adaptWorkout(payload: unknown): WorkoutData { return adaptWorkoutDocument(data(payload)) }
export function adaptWorkoutTemplate(value: unknown): WorkoutTemplate {
  const doc = document(value)
  if (doc.kind !== 'template' || doc.athleteId !== null || doc.weekId !== null || doc.date !== null) throw new ApiContractError('Template com campos de workout.')
  return { ...doc, kind: 'template', athleteId: null, weekId: null, date: null, name: doc.content.title, category: doc.content.type, objective: doc.content.notes }
}
function week(value: unknown): TrainingWeek {
  const source = record(value, 'week')
  return { id: requiredText(source.id, 'id'), athleteId: requiredText(source.athleteId, 'athleteId'), weekStart: monday(source.weekStart), rowVersion: rowVersion(source.rowVersion), publishedVersion: source.publishedVersion === null ? null : rowVersion(source.publishedVersion) }
}
export function adaptTrainingWeek(payload: unknown): WeekResult {
  const source = record(data(payload), 'semana')
  if (!Array.isArray(source.workouts)) throw new ApiContractError('Semana sem workouts[].')
  const result = { week: source.week === null ? null : week(source.week), workouts: source.workouts.map(adaptWorkoutDocument) }
  if (!result.week && result.workouts.length) throw new ApiContractError('Workouts retornados sem semana.')
  if (result.week && result.workouts.some((doc) => doc.weekId !== result.week!.id || doc.athleteId !== result.week!.athleteId || doc.date < result.week!.weekStart || new Date(`${doc.date}T00:00:00Z`).getTime() - new Date(`${result.week!.weekStart}T00:00:00Z`).getTime() >= 7 * 86400000)) throw new ApiContractError('Workout fora da semana/atleta consultado.')
  return result
}
export function adaptWorkoutMutation(payload: unknown): WorkoutMutationResult {
  const source = record(data(payload), 'mutação de workout')
  const result = adaptTrainingWeek({ data: { week: source.week, workouts: [source.workout] } })
  if (!result.week) throw new ApiContractError('Mutação sem semana atualizada.')
  return { workout: result.workouts[0], week: result.week }
}
export function adaptArchivedWeek(payload: unknown): TrainingWeek { return week(record(data(payload), 'arquivo').week) }
export function adaptList<T>(payload: unknown, adapter: (value: unknown) => T): { items: T[]; limit: number; offset: number } {
  const source = record(data(payload), 'lista')
  if (!Array.isArray(source.items)) throw new ApiContractError('Lista sem items[].')
  return { items: source.items.map(adapter), limit: integer(source.limit, 1, 100, 'limit'), offset: integer(source.offset, 0, 10000, 'offset') }
}
export function adaptTemplateResponse(payload: unknown): WorkoutTemplate { return adaptWorkoutTemplate(data(payload)) }
export function adaptPublication(payload: unknown): PublishResult {
  const source = record(data(payload), 'publicação')
  const pub = record(source.publication, 'publication')
  if (typeof source.replayed !== 'boolean' || !Array.isArray(pub.workouts)) throw new ApiContractError('Recibo de publicação inválido.')
  const publication: Publication = {
    id: requiredText(pub.id, 'id'), weekId: requiredText(pub.weekId, 'weekId'), sourceRowVersion: rowVersion(pub.sourceRowVersion), publishedAt: requiredText(pub.publishedAt, 'publishedAt'),
    workouts: pub.workouts.map((value) => {
      const revision = record(value, 'revisão')
      const snapshot = record(revision.snapshot, 'snapshot')
      if (snapshot.schemaVersion !== 1) throw new ApiContractError('Snapshot de versão não suportada.')
      return { revisionId: requiredText(revision.revisionId, 'revisionId'), snapshot: { schemaVersion: 1 as const, workoutId: requiredText(snapshot.workoutId, 'workoutId'), rowVersion: rowVersion(snapshot.rowVersion), date: calendarDate(snapshot.date), content: validateContent(snapshot.content) } }
    }),
  }
  return { publication, replayed: source.replayed }
}
export function toWeekWritePayload(input: WeekWriteInput): WeekWriteInput {
  return { athleteId: requiredText(input.athleteId, 'athleteId'), weekStart: monday(input.weekStart) }
}
export function toWorkoutWritePayload(input: WorkoutWritePayload): WorkoutWritePayload {
  return { athleteId: requiredText(input.athleteId, 'athleteId'), date: calendarDate(input.date), content: validateContent(input.content) }
}
