export interface AuthUser { id: string; email?: string; name: string; role?: string }
export interface Organization { id: string; name: string; role: 'owner' | 'admin' | 'coach' }
export interface OrganizationContext {
  userId: string
  organizations: Organization[]
  athleteOrganizations: Array<{ id: string; name: string }>
  apiVersion: 1
  contentSchemaVersion: 1
}

// Optional display fields remain absent: the operational API only returns id/name.
export interface AthleteSummary {
  id: string; name: string; tags: string[]
  status?: string; goalRace?: string; goalDate?: string; adherence7d?: number
  adherence28d?: number; lastInteraction?: string; alerts?: number; dataQuality?: number
}

export const workoutTypes = ['long_run', 'interval', 'tempo', 'recovery', 'strength', 'cycling', 'swimming', 'triathlon', 'easy_run'] as const
export type WorkoutType = typeof workoutTypes[number]
export const segmentKinds = ['warmup', 'run', 'recovery', 'cooldown', 'strength', 'rest'] as const
export type SegmentKind = typeof segmentKinds[number]
export interface WorkoutEffort {
  paceSecondsPerKm?: number
  heartRateMin?: number
  heartRateMax?: number
  rpe?: number
}
export interface WorkoutSegment {
  kind: SegmentKind
  durationSeconds?: number
  distanceMeters?: number
  effort?: WorkoutEffort
  notes?: string
}
export interface WorkoutRepeat { kind: 'repeat'; repetitions: number; blocks: WorkoutSegment[] }
export type WorkoutContentBlock = WorkoutSegment | WorkoutRepeat
export interface WorkoutContent {
  schemaVersion: 1
  title: string
  type: WorkoutType
  notes?: string
  blocks: WorkoutContentBlock[]
}
// Exact service DTO. There is deliberately no document-level publication status.
export interface WorkoutDocument {
  id: string
  athleteId: string | null
  weekId: string | null
  kind: 'workout' | 'template'
  date: string | null
  content: WorkoutContent
  rowVersion: number
}
export interface WorkoutData extends WorkoutDocument {
  kind: 'workout'
  athleteId: string
  weekId: string
  date: string
  name: string
  type: WorkoutType
  objective?: string
  totalDistanceKm?: number
  totalDurationMin?: number
}
export interface WorkoutTemplate extends WorkoutDocument {
  kind: 'template'
  athleteId: null
  weekId: null
  date: null
  name: string
  category: WorkoutType
  objective?: string
}
export interface TrainingWeek {
  id: string
  athleteId: string
  weekStart: string
  rowVersion: number
  publishedVersion: number | null
}
export interface WeekResult { week: TrainingWeek | null; workouts: WorkoutData[] }
export interface WorkoutMutationResult { workout: WorkoutData; week: TrainingWeek }
export interface WorkoutWritePayload { athleteId: string; date: string; content: WorkoutContent }
export interface WorkoutUpdatePayload { rowVersion: number; content: WorkoutContent; date?: string }
export interface WeekWriteInput { athleteId: string; weekStart: string }
export interface PublishedSnapshot { schemaVersion: 1; workoutId: string; rowVersion: number; date: string; content: WorkoutContent }
export interface Publication {
  id: string; weekId: string; sourceRowVersion: number; publishedAt: string
  workouts: Array<{ revisionId: string; snapshot: PublishedSnapshot }>
}
export interface PublishResult { publication: Publication; replayed: boolean }
export interface CoachTransportOptions {
  method?: 'GET' | 'POST' | 'PUT'
  body?: unknown
  headers?: Record<string, string>
}
export type CoachTransport = (path: string, options?: CoachTransportOptions) => Promise<unknown>
