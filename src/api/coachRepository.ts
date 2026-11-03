import { adaptArchivedWeek, adaptAthlete, adaptAthleteResponse, adaptAuthUser, adaptList, adaptOrganizationContext, adaptPublication, adaptTemplateResponse, adaptTrainingWeek, adaptWorkout, adaptWorkoutMutation, adaptWorkoutTemplate, ApiContractError, toWeekWritePayload, toWorkoutWritePayload, validateContent } from './adapters.ts'
import { calendarDate, integer, weekStartFor } from './content.ts'
import { buildQuery, httpTransport } from './http.ts'
import type { AthleteSummary, AuthUser, CoachTransport, OrganizationContext, PublishResult, TrainingWeek, WeekResult, WeekWriteInput, WorkoutContent, WorkoutData, WorkoutMutationResult, WorkoutTemplate, WorkoutWritePayload } from './types.ts'
const API_ROOT = '/coach/v1'

export class CoachRepository {
  private readonly transport: CoachTransport
  constructor(transport: CoachTransport = httpTransport) { this.transport = transport }
  async login(email: string, password: string): Promise<unknown> { return this.transport('/auth/login', { method: 'POST', body: { email, password } }) }
  async currentUser(): Promise<AuthUser> { return adaptAuthUser(await this.transport('/auth/me')) }
  async logout(): Promise<void> { await this.transport('/auth/logout', { method: 'POST' }) }
  async organizationContext(): Promise<OrganizationContext> { return adaptOrganizationContext(await this.transport(`${API_ROOT}/context`)) }

  // The router accepts only limit/offset (no server search). Bound pages instead of unbounded requests.
  private async listAll<T>(path: string, adapter: (value: unknown) => T): Promise<T[]> {
    const items: T[] = []
    for (let offset = 0; offset <= 10000; offset += 100) {
      const page = adaptList(await this.transport(`${API_ROOT}${path}${buildQuery({ limit: 100, offset })}`), adapter)
      if (page.limit !== 100 || page.offset !== offset || page.items.length > page.limit) throw new ApiContractError('Paginação retornada não corresponde à consulta.')
      items.push(...page.items)
      if (page.items.length < page.limit) return items
    }
    throw new ApiContractError('Lista excede o limite de paginação suportado. Nenhum resultado parcial será exibido como completo.')
  }
  async listAthletes(): Promise<AthleteSummary[]> { return this.listAll('/athletes', adaptAthlete) }
  async getAthlete(athleteId: string): Promise<AthleteSummary> {
    const payload = await this.transport(`${API_ROOT}/athletes/${encodeURIComponent(athleteId)}`)
    return adaptAthleteResponse(payload)
  }
  async getWorkout(workoutId: string): Promise<WorkoutData> { return adaptWorkout(await this.transport(`${API_ROOT}/workouts/${encodeURIComponent(workoutId)}`)) }
  async saveWorkout(input: WorkoutWritePayload, existing?: { id: string; rowVersion: number }): Promise<WorkoutMutationResult> {
    const create = toWorkoutWritePayload(input)
    const result = adaptWorkoutMutation(await this.transport(`${API_ROOT}/workouts${existing ? `/${encodeURIComponent(existing.id)}` : ''}`, {
      method: existing ? 'PUT' : 'POST',
      body: existing ? { rowVersion: integer(existing.rowVersion, 1, 2147483646, 'rowVersion'), content: create.content, date: create.date } : create,
    }))
    if (result.workout.athleteId !== create.athleteId || result.workout.date !== create.date || (existing && result.workout.id !== existing.id)) throw new ApiContractError('Treino retornado não corresponde à mutação solicitada.')
    return result
  }
  async archiveWorkout(workout: WorkoutData): Promise<TrainingWeek> {
    return adaptArchivedWeek(await this.transport(`${API_ROOT}/workouts/${encodeURIComponent(workout.id)}/archive`, { method: 'POST', body: { rowVersion: workout.rowVersion } }))
  }
  async moveWorkout(workout: WorkoutData, date: string): Promise<WorkoutMutationResult> {
    if (weekStartFor(calendarDate(date)) !== weekStartFor(workout.date)) throw new ApiContractError('Mover entre semanas não é suportado na v1. Arquive e crie/copie um treino no destino.')
    const result = adaptWorkoutMutation(await this.transport(`${API_ROOT}/workouts/${encodeURIComponent(workout.id)}`, {
      method: 'PUT', body: { rowVersion: workout.rowVersion, content: validateContent(workout.content), date },
    }))
    if (result.workout.id !== workout.id || result.workout.athleteId !== workout.athleteId || result.workout.date !== date) throw new ApiContractError('Treino retornado não corresponde à data solicitada.')
    return result
  }
  async listTemplates(): Promise<WorkoutTemplate[]> { return this.listAll('/templates', adaptWorkoutTemplate) }
  async saveTemplate(content: WorkoutContent, existing?: { id: string; rowVersion: number }): Promise<WorkoutTemplate> {
    const body = { content: validateContent(content), ...(existing ? { rowVersion: integer(existing.rowVersion, 1, 2147483646, 'rowVersion') } : {}) }
    return adaptTemplateResponse(await this.transport(`${API_ROOT}/templates${existing ? `/${encodeURIComponent(existing.id)}` : ''}`, { method: existing ? 'PUT' : 'POST', body }))
  }
  async createWorkoutFromTemplate(templateId: string, athleteId: string, date: string): Promise<WorkoutMutationResult> {
    const result = adaptWorkoutMutation(await this.transport(`${API_ROOT}/templates/${encodeURIComponent(templateId)}/copy`, { method: 'POST', body: { athleteId, date: calendarDate(date) } }))
    if (result.workout.athleteId !== athleteId || result.workout.date !== date) throw new ApiContractError('Cópia retornada não corresponde ao atleta/data solicitados.')
    return result
  }
  async getWeek(athleteId: string, weekStart: string): Promise<WeekResult> {
    const input = toWeekWritePayload({ athleteId, weekStart })
    const result = adaptTrainingWeek(await this.transport(`${API_ROOT}/week${buildQuery({ athleteId: input.athleteId, weekStart: input.weekStart })}`))
    if (result.week && (result.week.athleteId !== athleteId || result.week.weekStart !== weekStart)) throw new ApiContractError('A API retornou outra semana ou atleta.')
    return result
  }
  async createWeek(input: WeekWriteInput): Promise<WeekResult> {
    const body = toWeekWritePayload(input)
    const result = adaptTrainingWeek(await this.transport(`${API_ROOT}/week`, { method: 'POST', body }))
    if (!result.week || result.week.athleteId !== body.athleteId || result.week.weekStart !== body.weekStart) throw new ApiContractError('A API não confirmou a semana solicitada.')
    return result
  }
  async publishWeek(week: TrainingWeek, idempotencyKey: string): Promise<PublishResult> {
    if (!/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) throw new ApiContractError('Idempotency-Key inválida.')
    const result = adaptPublication(await this.transport(`${API_ROOT}/publish`, {
      method: 'POST', body: { weekId: week.id, rowVersion: week.rowVersion }, headers: { 'Idempotency-Key': idempotencyKey },
    }))
    if (result.publication.weekId !== week.id || result.publication.sourceRowVersion !== week.rowVersion) throw new ApiContractError('Publicação retornada não corresponde à semana/versão solicitada.')
    return result
  }
}
export const coachRepository = new CoachRepository()
