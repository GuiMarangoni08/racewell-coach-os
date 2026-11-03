import test from 'node:test'
import assert from 'node:assert/strict'
import { createHttpTransport, tokenStorage, ApiError } from '../src/api/http.ts'
import { organizationStorage, publicationKeyFor } from '../src/api/session.ts'
import { ids, content, workout, week } from './fixtures.mjs'

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

test('HTTP envia Bearer + X-Organization-Id + Idempotency-Key, JSON e não cookies', async () => {
  tokenStorage.set('fixture-bearer')
  organizationStorage.select(ids.user, ids.org)
  const calls = []
  const transport = createHttpTransport(() => 'http://localhost:8000/', async (url, options) => {
    calls.push({ url, options })
    return json({ data: { week, workouts: [workout] } })
  })
  await transport('/coach/v1/week?athleteId=x&weekStart=2026-11-02')
  await transport('/coach/v1/publish', { method: 'POST', body: { weekId: ids.week, rowVersion: 2 }, headers: { 'Idempotency-Key': 'test-http-key' } })
  assert.equal(calls[0].url, 'http://localhost:8000/coach/v1/week?athleteId=x&weekStart=2026-11-02')
  for (const call of calls) {
    assert.equal(call.options.headers.get('Authorization'), 'Bearer fixture-bearer')
    assert.equal(call.options.headers.get('X-Organization-Id'), ids.org)
    assert.equal(call.options.credentials, 'omit')
  }
  assert.equal(calls[1].options.headers.get('Idempotency-Key'), 'test-http-key')
  assert.equal(calls[1].options.headers.get('Content-Type'), 'application/json')
  assert.deepEqual(JSON.parse(calls[1].options.body), { weekId: ids.week, rowVersion: 2 })
  tokenStorage.clear(); organizationStorage.clearActive()
})

test('/context não exige seleção; operação sem organização é bloqueada antes de fetch', async () => {
  organizationStorage.clearActive()
  let calls = 0
  const transport = createHttpTransport(() => 'http://localhost:8000', async (_, options) => {
    calls++
    assert.equal(options.headers.has('X-Organization-Id'), false)
    return json({ data: {} })
  })
  await transport('/coach/v1/context')
  await assert.rejects(transport('/coach/v1/athletes?limit=100&offset=0'), (error) => error instanceof ApiError && error.code === 'organization_selection')
  assert.equal(calls, 1)
})

test('403/409 preservam token e retornam code/details; rede e falta de URL são erros honestos', async () => {
  tokenStorage.set('fixture-bearer')
  organizationStorage.select(ids.user, ids.org)
  for (const [status, code] of [[403, 'ATHLETE_ACCESS_DENIED'], [409, 'VERSION_CONFLICT'], [422, 'EMPTY_WEEK']]) {
    const transport = createHttpTransport(() => 'http://localhost:8000', async () => json({ code, message: code }, status))
    await assert.rejects(transport('/coach/v1/workouts', { method: 'POST', body: { athleteId: ids.athlete, date: workout.date, content } }), (error) => error.status === status && error.code === code && error.details.code === code)
    assert.equal(tokenStorage.get(), 'fixture-bearer')
  }
  const network = createHttpTransport(() => 'http://localhost:8000', async () => { throw new Error('fixture unavailable') })
  await assert.rejects(network('/coach/v1/context'), (error) => error.code === 'network')
  const missing = createHttpTransport(() => '', async () => { assert.fail('não deve fazer fetch') })
  await assert.rejects(missing('/auth/login'), (error) => error.code === 'configuration')
  tokenStorage.clear(); organizationStorage.clearActive()
})

test('401 invalida Bearer e seleção ativa; não inventa refresh/logout revogável', async () => {
  tokenStorage.set('fixture-expired')
  organizationStorage.select(ids.user, ids.org)
  const transport = createHttpTransport(() => 'http://localhost:8000', async () => json({ message: 'Unauthorized' }, 401))
  await assert.rejects(transport('/auth/me'), (error) => error.status === 401)
  assert.equal(tokenStorage.get(), null)
  assert.equal(organizationStorage.getActive(), null)
})

test('seleção explícita persiste por usuário; chave de publicação persiste por autor/tenant/semana/versão', () => {
  const savedWindow = globalThis.window
  const storage = new Map()
  globalThis.window = { sessionStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) } }
  try {
    organizationStorage.select(ids.user, ids.org)
    organizationStorage.clearActive()
    assert.equal(organizationStorage.getActive(), null)
    assert.equal(organizationStorage.getForUser(ids.user), ids.org)
    assert.equal(organizationStorage.getForUser('unselected-fixture-user'), null)
    assert.equal(storage.get(`racewell.coach.organization:${ids.user}`), ids.org)
    const first = publicationKeyFor(ids.user, ids.org, ids.week, 2)
    assert.match(first, /^[A-Za-z0-9._:-]{8,128}$/)
    assert.equal(publicationKeyFor(ids.user, ids.org, ids.week, 2), first)
    assert.equal(storage.get(`racewell.coach.publish:${ids.user}:${ids.org}:${ids.week}:2`), first)
    for (const changed of [[ids.user, ids.org, ids.week, 3], [ids.user, ids.otherOrg, ids.week, 2], [ids.athlete, ids.org, ids.week, 2]]) assert.notEqual(publicationKeyFor(...changed), first)
  } finally {
    globalThis.window = savedWindow
    organizationStorage.clearActive()
  }
})
