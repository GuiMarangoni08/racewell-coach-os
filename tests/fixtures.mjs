// Public, fictitious contract fixtures. These are not real API/account records.
export const ids = {
  user: '00000000-0000-4000-8000-000000000001',
  org: '00000000-0000-4000-8000-000000000002',
  otherOrg: '00000000-0000-4000-8000-000000000003',
  athlete: '00000000-0000-4000-8000-000000000004',
  workout: '00000000-0000-4000-8000-000000000005',
  week: '00000000-0000-4000-8000-000000000006',
  template: '00000000-0000-4000-8000-000000000007',
  publication: '00000000-0000-4000-8000-000000000008',
  revision: '00000000-0000-4000-8000-000000000009',
}
export const content = {
  schemaVersion: 1, title: 'Rodagem fácil', type: 'easy_run',
  blocks: [{ kind: 'run', distanceMeters: 5000, effort: { paceSecondsPerKm: 330 } }],
}
export const workout = { id: ids.workout, athleteId: ids.athlete, weekId: ids.week, kind: 'workout', date: '2026-11-02', rowVersion: 1, content }
export const week = { id: ids.week, athleteId: ids.athlete, weekStart: '2026-11-02', rowVersion: 2, publishedVersion: null }
export const template = { id: ids.template, athleteId: null, weekId: null, kind: 'template', date: null, rowVersion: 1, content }
export const context = {
  userId: ids.user, organizations: [{ id: ids.org, name: 'Equipe fictícia', role: 'coach' }, { id: ids.otherOrg, name: 'Outra equipe fictícia', role: 'admin' }],
  athleteOrganizations: [], apiVersion: 1, contentSchemaVersion: 1,
}
export function publishResult(version = 2, replayed = false) {
  return { data: { publication: {
    id: ids.publication, weekId: ids.week, sourceRowVersion: version, publishedAt: '2026-11-02T23:30:00.000Z',
    workouts: [{ revisionId: ids.revision, snapshot: { schemaVersion: 1, workoutId: ids.workout, rowVersion: 1, date: workout.date, content } }],
  }, replayed } }
}
