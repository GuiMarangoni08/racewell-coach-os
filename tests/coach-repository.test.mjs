import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CoachRepository } from '../src/api/coachRepository.ts'
import { adaptWorkoutDocument, ApiContractError } from '../src/api/adapters.ts'
import { ApiError } from '../src/api/http.ts'
import { content, context, ids, publishResult, template, week, workout } from './fixtures.mjs'

function scripted(steps) {
  const calls = []
  const repository = new CoachRepository(async (path, options = {}) => {
    calls.push({ path, ...options })
    const step = steps.shift()
    assert.ok(step, `Requisição inesperada ${path}`)
    assert.equal(path, step.path)
    assert.equal(options.method ?? 'GET', step.method ?? 'GET')
    assert.deepEqual(options.body, step.body)
    assert.deepEqual(options.headers, step.headers)
    if (step.error) throw step.error
    return structuredClone(step.result)
  })
  return { repository, calls, assertDone: () => assert.equal(steps.length, 0) }
}

test('fluxo mínimo do repository: login → contexto → atleta → week → criar/editar → publicar → listar/copiar template', async () => {
  const editedContent = { ...content, title: 'Rodagem revisada', notes: 'Notas de fixture' }
  const editedWorkout = { ...workout, content: editedContent, rowVersion: 2 }
  const editedWeek = { ...week, rowVersion: 3 }
  const copy = { ...workout, id: '00000000-0000-4000-8000-000000000010', date: '2026-11-04' }
  const script = scripted([
    { path: '/auth/login', method: 'POST', body: { email: 'fixture@example.test', password: 'fixture-only' }, result: { message: 'Login successful', token: 'fixture-token', userId: ids.user } },
    { path: '/auth/me', result: { user: { id: ids.user, name: 'Fictício', email: 'fixture@example.test' } } },
    { path: '/coach/v1/context', result: { data: context } },
    { path: '/coach/v1/athletes?limit=100&offset=0', result: { data: { items: [{ id: ids.athlete, name: 'Atleta fictício' }], limit: 100, offset: 0 } } },
    { path: `/coach/v1/week?athleteId=${ids.athlete}&weekStart=2026-11-02`, result: { data: { week: null, workouts: [] } } },
    { path: '/coach/v1/week', method: 'POST', body: { athleteId: ids.athlete, weekStart: '2026-11-02' }, result: { data: { week: { ...week, rowVersion: 1 }, workouts: [] } } },
    { path: '/coach/v1/workouts', method: 'POST', body: { athleteId: ids.athlete, date: workout.date, content }, result: { data: { workout, week } } },
    { path: `/coach/v1/workouts/${ids.workout}`, method: 'PUT', body: { rowVersion: 1, content: editedContent, date: workout.date }, result: { data: { workout: editedWorkout, week: editedWeek } } },
    { path: `/coach/v1/week?athleteId=${ids.athlete}&weekStart=2026-11-02`, result: { data: { week: editedWeek, workouts: [editedWorkout] } } },
    { path: '/coach/v1/publish', method: 'POST', body: { weekId: ids.week, rowVersion: 3 }, headers: { 'Idempotency-Key': 'test-publish-v3' }, result: { data: { ...publishResult(3).data, publication: { ...publishResult(3).data.publication, workouts: [{ revisionId: ids.revision, snapshot: { schemaVersion: 1, workoutId: ids.workout, rowVersion: 2, date: editedWorkout.date, content: editedContent } }] } } } },
    { path: '/coach/v1/templates?limit=100&offset=0', result: { data: { items: [template], limit: 100, offset: 0 } } },
    { path: `/coach/v1/templates/${ids.template}/copy`, method: 'POST', body: { athleteId: ids.athlete, date: copy.date }, result: { data: { workout: copy, week: { ...editedWeek, rowVersion: 4, publishedVersion: 3 } } } },
  ])
  const repo = script.repository
  assert.equal((await repo.login('fixture@example.test', 'fixture-only')).token, 'fixture-token')
  assert.equal((await repo.currentUser()).id, ids.user)
  assert.equal((await repo.organizationContext()).organizations.length, 2)
  assert.equal((await repo.listAthletes())[0].id, ids.athlete)
  assert.equal((await repo.getWeek(ids.athlete, '2026-11-02')).week, null)
  assert.equal((await repo.createWeek({ athleteId: ids.athlete, weekStart: '2026-11-02' })).week.rowVersion, 1)
  const created = await repo.saveWorkout({ athleteId: ids.athlete, date: workout.date, content })
  assert.equal(created.week.rowVersion, 2)
  const edited = await repo.saveWorkout({ athleteId: ids.athlete, date: workout.date, content: editedContent }, { id: created.workout.id, rowVersion: created.workout.rowVersion })
  assert.equal(edited.workout.rowVersion, 2)
  assert.equal(edited.week.rowVersion, 3)
  const loaded = await repo.getWeek(ids.athlete, '2026-11-02')
  assert.equal(loaded.workouts[0].name, editedContent.title)
  assert.equal((await repo.publishWeek(loaded.week, 'test-publish-v3')).publication.sourceRowVersion, 3)
  assert.equal((await repo.listTemplates())[0].content.schemaVersion, 1)
  const copied = await repo.createWorkoutFromTemplate(ids.template, ids.athlete, copy.date)
  assert.equal(copied.workout.date, copy.date)
  assert.equal(copied.week.publishedVersion, 3)
  script.assertDone()
})

test('PUT movimento envia content integral + rowVersion; mudança entre semanas não faz requisição', async () => {
  const moved = { ...workout, date: '2026-11-08', rowVersion: 2 }
  const script = scripted([{ path: `/coach/v1/workouts/${ids.workout}`, method: 'PUT', body: { rowVersion: 1, content, date: '2026-11-08' }, result: { data: { workout: moved, week: { ...week, rowVersion: 3 } } } }])
  const adapted = adaptWorkoutDocument(workout)
  assert.equal((await script.repository.moveWorkout(adapted, '2026-11-08')).workout.rowVersion, 2)
  await assert.rejects(script.repository.moveWorkout(adapted, '2026-11-09'), /Mover entre semanas/)
  assert.equal(script.calls.length, 1)
  script.assertDone()
})

test('archive usa POST com versão de documento, templates POST/PUT usam content e CAS', async () => {
  const script = scripted([
    { path: `/coach/v1/workouts/${ids.workout}/archive`, method: 'POST', body: { rowVersion: 1 }, result: { data: { week: { ...week, rowVersion: 3 } } } },
    { path: '/coach/v1/templates', method: 'POST', body: { content }, result: { data: template } },
    { path: `/coach/v1/templates/${ids.template}`, method: 'PUT', body: { content, rowVersion: 1 }, result: { data: { ...template, rowVersion: 2 } } },
  ])
  assert.equal((await script.repository.archiveWorkout(adaptWorkoutDocument(workout))).rowVersion, 3)
  assert.equal((await script.repository.saveTemplate(content)).kind, 'template')
  assert.equal((await script.repository.saveTemplate(content, { id: ids.template, rowVersion: 1 })).rowVersion, 2)
  script.assertDone()
})

test('409 é propagado sem retry automático/overwrite e nenhuma resposta vazia é confirmada', async () => {
  const conflict = new ApiError('VERSION_CONFLICT', 409, 'VERSION_CONFLICT')
  const script = scripted([{ path: `/coach/v1/workouts/${ids.workout}`, method: 'PUT', body: { rowVersion: 1, content, date: workout.date }, error: conflict }])
  await assert.rejects(script.repository.saveWorkout({ athleteId: ids.athlete, date: workout.date, content }, { id: ids.workout, rowVersion: 1 }), (error) => error === conflict && error.isConflict)
  assert.equal(script.calls.length, 1)
  const empty = new CoachRepository(async () => null)
  await assert.rejects(empty.saveWorkout({ athleteId: ids.athlete, date: workout.date, content }), ApiContractError)
  await assert.rejects(empty.createWorkoutFromTemplate(ids.template, ids.athlete, workout.date), ApiContractError)
})

test('publicação sempre POST /publish; mesmo pedido/chave permite replay e valida versão da semana', async () => {
  const script = scripted([
    { path: '/coach/v1/publish', method: 'POST', body: { weekId: ids.week, rowVersion: 2 }, headers: { 'Idempotency-Key': 'retry-same-key' }, result: publishResult() },
    { path: '/coach/v1/publish', method: 'POST', body: { weekId: ids.week, rowVersion: 2 }, headers: { 'Idempotency-Key': 'retry-same-key' }, result: publishResult(2, true) },
  ])
  assert.equal((await script.repository.publishWeek(week, 'retry-same-key')).replayed, false)
  assert.equal((await script.repository.publishWeek(week, 'retry-same-key')).replayed, true)
  await assert.rejects(script.repository.publishWeek(week, 'bad key!'), ApiContractError)
  script.assertDone()
  const mismatch = new CoachRepository(async () => publishResult(1))
  await assert.rejects(mismatch.publishWeek(week, 'retry-same-key'), /não corresponde/)
})

test('listas usam páginas limit/offset do router, sem search/from/to/athlete_id', async () => {
  const page = Array.from({ length: 100 }, (_, i) => ({ id: `fixture-${i}`, name: `Atleta fictício ${i}` }))
  const script = scripted([
    { path: '/coach/v1/athletes?limit=100&offset=0', result: { data: { items: page, limit: 100, offset: 0 } } },
    { path: '/coach/v1/athletes?limit=100&offset=100', result: { data: { items: [], limit: 100, offset: 100 } } },
  ])
  assert.equal((await script.repository.listAthletes()).length, 100)
  script.assertDone()
})

test('fonte real do backend confirma rotas/enums; implementação não usa métodos/rotas inexistentes', () => {
  const router = readFileSync(new URL('../../backend/src/http/routes/coach-os-router.ts', import.meta.url), 'utf8')
  for (const [method, route] of [['get', '/context'], ['get', '/athletes'], ['get', '/week'], ['post', '/week'], ['get', '/workouts/:id'], ['post', '/workouts'], ['put', '/workouts/:id'], ['post', '/workouts/:id/archive'], ['get', '/templates'], ['post', '/templates'], ['put', '/templates/:id'], ['post', '/templates/:id/copy'], ['post', '/publish']]) assert.ok(router.includes(`router.${method}('${route}'`), `${method} ${route}`)
  const source = readFileSync(new URL('../src/api/coachRepository.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /method:\s*['"]PATCH['"]|\/weeks\b|template_id|athlete_id|week_start|status:\s*['"]published['"]/)
  const weekSource = readFileSync(new URL('../src/pages/WeekBuilderPage.tsx', import.meta.url), 'utf8')
  assert.match(weekSource, /publicationKeyFor\(context.userId, organization.id, week.id, week.rowVersion\)/)
  assert.match(weekSource, /window.confirm\(/)
  const provider = readFileSync(new URL('../src/org/OrganizationProvider.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(provider, /organizations\[0\]/)
  assert.match(provider, /organizations.some/)
  assert.match(provider, /key=\{organization!\.id\}/)
})
