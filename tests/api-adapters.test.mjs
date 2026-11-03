import test from 'node:test'
import assert from 'node:assert/strict'
import { adaptAthlete, adaptAuthUser, adaptList, adaptOrganizationContext, adaptTrainingWeek, adaptWorkout, adaptWorkoutDocument, adaptWorkoutMutation, adaptWorkoutTemplate, adaptPublication, readAccessToken, toWeekWritePayload, toWorkoutWritePayload, ApiContractError, validateContent } from '../src/api/adapters.ts'
import { contentTotals, isCalendarDate, weekStartFor } from '../src/api/content.ts'
import { ApiError, buildQuery } from '../src/api/http.ts'
import { content, context, ids, publishResult, template, week, workout } from './fixtures.mjs'

test('login/me usam o contrato legado exato, sem presumir cookies ou refresh', () => {
  assert.equal(readAccessToken({ message: 'Login successful', token: 'fixture-token', userId: ids.user }), 'fixture-token')
  assert.equal(readAccessToken({ access_token: 'not-supported' }), undefined)
  assert.deepEqual(adaptAuthUser({ message: 'User profile', user: { id: ids.user, name: 'Coach fictício', role: 'COACH', password: 'must-not-leak' } }), {
    id: ids.user, name: 'Coach fictício', role: 'COACH',
  })
  assert.deepEqual(adaptAuthUser({ message: 'User profile', user: { id: ids.user, email: 'fixture@example.test' } }), {
    id: ids.user, name: 'fixture@example.test', email: 'fixture@example.test',
  })
  assert.throws(() => adaptAuthUser({ user: { name: 'Sem id' } }), ApiContractError)
})

test('contexto preserva organizations[] sem seleção implícita e distingue matrícula de staff', () => {
  assert.deepEqual(adaptOrganizationContext({ data: context }), context)
  assert.equal('organization' in adaptOrganizationContext({ data: context }), false)
  assert.deepEqual(adaptOrganizationContext({ data: { ...context, organizations: [], athleteOrganizations: [{ id: ids.org, name: 'Matrícula fictícia' }] } }).organizations, [])
  assert.throws(() => adaptOrganizationContext({ data: { organization: context.organizations[0] } }), ApiContractError)
  assert.throws(() => adaptOrganizationContext({ data: { ...context, apiVersion: 2 } }), ApiContractError)
})

test('atletas têm somente id/name; não inventa métricas nem conserva dados pessoais extras', () => {
  assert.deepEqual(adaptAthlete({ id: ids.athlete, name: 'Atleta fictício', email: 'hidden@example.test', adherence7d: 99 }), { id: ids.athlete, name: 'Atleta fictício', tags: [] })
})

test('JSONB v1 exige título, tipo e blocos válidos; pace é inteiro em segundos/km', () => {
  assert.deepEqual(validateContent(content), content)
  assert.throws(() => validateContent({ ...content, blocks: [] }), ApiContractError)
  assert.throws(() => validateContent({ ...content, type: 'corrida' }), ApiContractError)
  assert.throws(() => validateContent({ ...content, schemaVersion: 2 }), ApiContractError)
  assert.throws(() => validateContent({ ...content, title: ' ' }), ApiContractError)
  assert.throws(() => validateContent({ ...content, blocks: [{ kind: 'run' }] }), ApiContractError)
  for (const pace of ['5:30', 330.5, 59, 3601]) assert.throws(() => validateContent({ ...content, blocks: [{ kind: 'run', distanceMeters: 1000, effort: { paceSecondsPerKm: pace } }] }), ApiContractError)
})

test('blocos estritos validam FC/RPE/unidades e rejeitam campos antigos ou tenant injection', () => {
  for (const block of [
    { kind: 'run', distanceMeters: 0 }, { kind: 'run', durationSeconds: 86401 }, { kind: 'run', distanceMeters: 1.5 },
    { kind: 'run', durationSeconds: 10, effort: { heartRateMin: 180, heartRateMax: 160 } },
    { kind: 'run', durationSeconds: 10, effort: { rpe: 11 } },
    { kind: 'run', durationSeconds: 10, intensity_zone: 'Z2' },
  ]) assert.throws(() => validateContent({ ...content, blocks: [block] }), ApiContractError)
  assert.throws(() => validateContent({ ...content, status: 'published' }), ApiContractError)
  assert.throws(() => validateContent({ ...content, organizationId: ids.org }), ApiContractError)
})

test('repetições preservam blocos internos/recuperação/FC e não aceitam repeat recursivo', () => {
  const interval = { ...content, type: 'interval', blocks: [{ kind: 'repeat', repetitions: 4, blocks: [
    { kind: 'run', distanceMeters: 400, durationSeconds: 100, effort: { paceSecondsPerKm: 250, heartRateMin: 160, heartRateMax: 180, rpe: 8 }, notes: 'Ritmo controlado' },
    { kind: 'recovery', distanceMeters: 100, durationSeconds: 60 },
  ] }] }
  assert.deepEqual(validateContent(interval), interval)
  assert.deepEqual(contentTotals(interval), { totalDistanceKm: 2, totalDurationMin: 640 / 60 })
  assert.throws(() => validateContent({ ...content, blocks: [{ kind: 'repeat', repetitions: 1, blocks: content.blocks }] }), ApiContractError)
  assert.throws(() => validateContent({ ...content, blocks: [{ kind: 'repeat', repetitions: 2, blocks: interval.blocks }] }), ApiContractError)
})

test('valida limites de notas, blocos e UTF-8 64 KiB como no backend', () => {
  assert.throws(() => validateContent({ ...content, notes: 'a'.repeat(4001) }), ApiContractError)
  assert.throws(() => validateContent({ ...content, blocks: Array(101).fill(content.blocks[0]) }), ApiContractError)
  assert.throws(() => validateContent({ ...content, blocks: Array(40).fill({ kind: 'run', durationSeconds: 60, notes: 'é'.repeat(1000) }) }), ApiContractError)
})

test('treinos derivam campos visuais de content e não possuem status/version fictícios', () => {
  const result = adaptWorkout({ data: workout })
  assert.equal(result.name, content.title)
  assert.equal(result.rowVersion, 1)
  assert.deepEqual(result.content, content)
  assert.equal(result.totalDistanceKm, 5)
  assert.equal(result.totalDurationMin, undefined)
  assert.equal('status' in result, false)
  assert.equal('version' in result, false)
  assert.throws(() => adaptWorkout({ data: { id: ids.workout, name: 'Flat legacy' } }), ApiContractError)
  assert.throws(() => adaptWorkoutDocument(template), ApiContractError)
})

test('templates são documentos content com campos de atleta/semana/data nulos', () => {
  const result = adaptWorkoutTemplate(template)
  assert.equal(result.name, content.title)
  assert.equal(result.rowVersion, 1)
  assert.deepEqual(result.content, content)
  assert.throws(() => adaptWorkoutTemplate(workout), ApiContractError)
  assert.throws(() => adaptWorkoutTemplate({ ...template, athleteId: ids.athlete }), ApiContractError)
})

test('semana vazia tem week:null; workouts vêm no envelope e carregam conteúdo e versões', () => {
  assert.deepEqual(adaptTrainingWeek({ data: { week: null, workouts: [] } }), { week: null, workouts: [] })
  const result = adaptTrainingWeek({ data: { week, workouts: [workout] } })
  assert.deepEqual(result.week, week)
  assert.equal(result.workouts[0].content.title, content.title)
  assert.equal(result.week.rowVersion, 2)
  assert.equal(result.workouts[0].rowVersion, 1)
  assert.throws(() => adaptTrainingWeek({ data: [] }), ApiContractError)
  assert.throws(() => adaptTrainingWeek({ data: { week: null, workouts: [workout] } }), ApiContractError)
  assert.throws(() => adaptTrainingWeek({ data: { week, workouts: [{ ...workout, date: '2026-11-09' }] } }), ApiContractError)
  assert.throws(() => adaptTrainingWeek({ data: { week, workouts: [{ ...workout, athleteId: ids.user }] } }), ApiContractError)
})

test('mutação exige o documento E a semana atualizada, sem fabricar confirmação de resposta vazia', () => {
  const result = adaptWorkoutMutation({ data: { workout, week } })
  assert.equal(result.workout.rowVersion, 1)
  assert.equal(result.week.rowVersion, 2)
  assert.throws(() => adaptWorkoutMutation(null), ApiContractError)
  assert.throws(() => adaptWorkoutMutation({ data: { workout } }), ApiContractError)
})

test('listas aceitam apenas items e paginação real; formato legado incompatível falha', () => {
  assert.deepEqual(adaptList({ data: { items: [{ id: ids.athlete, name: 'Fictício' }], limit: 100, offset: 0 } }, adaptAthlete).items.map((item) => item.id), [ids.athlete])
  assert.throws(() => adaptList({ data: { results: [] } }, adaptAthlete), ApiContractError)
})

test('calendário valida datas reais e calcula segunda-feira sem timezone local', () => {
  assert.equal(isCalendarDate('2026-02-30'), false)
  assert.equal(isCalendarDate('2028-02-29'), true)
  assert.equal(weekStartFor('2026-11-08'), '2026-11-02')
  assert.deepEqual(toWeekWritePayload({ athleteId: ids.athlete, weekStart: '2026-11-02' }), { athleteId: ids.athlete, weekStart: '2026-11-02' })
  assert.throws(() => toWeekWritePayload({ athleteId: ids.athlete, weekStart: '2026-11-03' }), ApiContractError)
})

test('payload de criação é camelCase allowlist, content v1 e não status/blocos de UI', () => {
  assert.deepEqual(toWorkoutWritePayload({ athleteId: ids.athlete, date: workout.date, content, status: 'published', organizationId: ids.org, rowVersion: 100 }), { athleteId: ids.athlete, date: workout.date, content })
  assert.throws(() => toWorkoutWritePayload({ athleteId: ids.athlete, date: '2026-02-30', content }), ApiContractError)
})

test('publicação valida snapshot/replayed e conserva versões independentes', () => {
  const result = adaptPublication(publishResult(7, true))
  assert.equal(result.publication.sourceRowVersion, 7)
  assert.equal(result.publication.workouts[0].snapshot.rowVersion, 1)
  assert.equal(result.replayed, true)
  assert.throws(() => adaptPublication({ data: { publication: { id: ids.publication }, replayed: false } }), ApiContractError)
})

test('query camelCase paginada e erros operacionais uppercase', () => {
  assert.equal(buildQuery({ athleteId: 'a 1', weekStart: '2026-11-02', limit: 100, offset: 0 }), '?athleteId=a+1&weekStart=2026-11-02&limit=100&offset=0')
  for (const code of ['VERSION_CONFLICT', 'IDEMPOTENCY_CONFLICT', 'ALREADY_PUBLISHED']) assert.equal(new ApiError('Conflito', 409, code).isConflict, true)
  assert.equal(new ApiError('Forbidden', 403, 'ORGANIZATION_ACCESS_DENIED').isConflict, false)
})
