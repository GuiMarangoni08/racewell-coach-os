export type EntityState =
  | 'rascunho'
  | 'pendente'
  | 'aprovado'
  | 'rejeitado'
  | 'concluido'
  | 'cancelado'
  | 'arquivado'
  | 'publicado'

export type Severity = 'critico' | 'importante' | 'atencao' | 'informativo'

export type DayComplianceStatus = 'completo' | 'parcial' | 'faltou' | 'folga'

export interface Athlete {
  id: string
  name: string
  avatarInitials: string
  status: 'ativo' | 'pausado' | 'encerrado'
  coachId: string
  goalRace: string
  goalDate: string
  adherence7d: number
  adherence28d: number
  lastInteraction: string
  alerts: number
  tags: string[]
  dataQuality: number
  rrs: number
  ira: number
  /** Últimos 7 dias, do mais antigo ao mais recente — para o indicador de aderência em bolinhas (referência: coluna de dias do Home do TrainingPeaks). */
  last7Days: DayComplianceStatus[]
}

export interface InboxItem {
  id: string
  athleteId: string
  athleteName: string
  kind: 'analise' | 'feedback' | 'alerta' | 'mensagem' | 'aprovacao'
  title: string
  summary: string
  aiSuggestion?: string
  aiConfidence?: number
  priority: Severity
  slaHoursLeft: number
  status: EntityState
  createdAt: string
}

export interface Goal {
  id: string
  athleteId: string
  raceName: string
  raceDate: string
  targetTime: string
  distanceKm: number
  status: EntityState
  isPrimary: boolean
  /** A = foco total do ciclo, B = objetivo secundário, C = treino-prova/teste (referência: ATP do TrainingPeaks). */
  priority: 'A' | 'B' | 'C'
}

/**
 * Ponto diário do gráfico de condicionamento estilo PMC (Performance
 * Management Chart): Fitness (CTL, média móvel exponencial de 42 dias
 * da carga diária), Fadiga (ATL, EMA de 7 dias) e Forma (TSB = CTL - ATL).
 * Ver src/lib/loadMetrics.ts para o cálculo.
 */
export interface LoadPoint {
  date: string
  tss: number
  ctl: number
  atl: number
  tsb: number
}

export interface ZoneVersion {
  id: string
  athleteId: string
  version: number
  source: 'teste' | 'estimativa_ia' | 'manual'
  validated: boolean
  validFrom: string
  zones: { name: string; paceMin: string; paceMax: string; hrMin: number; hrMax: number }[]
}

export interface TrainingCycle {
  id: string
  athleteId: string
  name: string
  startDate: string
  endDate: string
  status: EntityState
  phases: TrainingPhase[]
}

export interface TrainingPhase {
  id: string
  name: string
  startDate: string
  endDate: string
  focus: string
  loadTrend: 'construcao' | 'pico' | 'polimento' | 'transicao'
}

export interface WorkoutBlock {
  id: string
  label: string
  repetitions: number
  distanceOrDuration: string
  intensityZone: string
  recovery: string
}

export interface PlannedWorkout {
  id: string
  athleteId: string
  date: string
  name: string
  type: string
  status: EntityState
  version: number
  blocks: WorkoutBlock[]
  totalDistanceKm: number
  totalDurationMin: number
  plannedTss: number
}

export interface CompletedWorkout {
  id: string
  plannedWorkoutId?: string
  athleteId: string
  date: string
  source: 'garmin' | 'strava' | 'manual' | 'csv' | 'imagem'
  distanceKm: number
  durationMin: number
  avgPace: string
  avgHr: number
  avgPower?: number
  rpe?: number
  tss: number
  confidence: number
}

export interface CoachDecision {
  id: string
  athleteId: string
  athleteName: string
  type: string
  aiSuggestion: string
  aiConfidence: number
  humanDecision: string
  justification: string
  author: string
  closedAt?: string
  outcomeStatus: 'pendente' | 'favoravel' | 'neutro' | 'desfavoravel'
  outcomeNotes?: string
  version: number
}

export interface HealthAlert {
  id: string
  athleteId: string
  athleteName: string
  type: string
  severity: Severity
  message: string
  evidence: string[]
  status: 'aberto' | 'reconhecido' | 'resolvido'
  createdAt: string
}

export interface MessageThread {
  id: string
  athleteId: string
  athleteName: string
  lastMessage: string
  lastAt: string
  unread: number
  slaStatus: 'dentro' | 'proximo' | 'estourado'
}

export interface TeamMember {
  id: string
  name: string
  role: 'Nível 1 — Treinador' | 'Nível 2 — Coordenador Técnico' | 'Nível 3 — Diretor Técnico' | 'Administrador'
  athletesCount: number
  status: 'ativo' | 'pendente' | 'desligado'
  since: string
}

export interface IntegrationStatus {
  provider: 'Garmin' | 'Strava' | 'Apple Health' | 'CSV/FIT' | 'Imagem/PDF'
  connectedAthletes: number
  lastSync: string
  health: 'ok' | 'atencao' | 'falha'
  duplicatesFound: number
}

export interface AgendaEvent {
  id: string
  date: string
  time: string
  type: 'revisao_tecnica' | 'chamada_atleta' | 'reuniao_equipe' | 'prova' | 'avaliacao'
  title: string
  athleteName?: string
  responsible: string
  recurring: boolean
  status: EntityState
}

export interface WorkoutLibraryItem {
  id: string
  name: string
  category: string
  objective: string
  level: 'iniciante' | 'intermediario' | 'avancado'
  phase: string
  author: string
  version: number
  tags: string[]
  contraindications: string[]
  outcomesTracked: number
  scope: 'pessoal' | 'institucional'
  hasDemoVideo: boolean
}

export interface CaseLibraryItem {
  id: string
  contextSummary: string
  anonymizedProfile: string
  decision: string
  outcome: 'favoravel' | 'neutro' | 'desfavoravel'
  factors: string[]
  evidence: string
  similarity: number
}

export interface CoachMemoryItem {
  id: string
  pattern: string
  origin: string
  owner: string
  confidence: number
  impact: 'alto' | 'medio' | 'baixo'
  status: 'proposto' | 'aprovado' | 'rejeitado'
}

export interface ChecklistStep {
  id: string
  label: string
  done: boolean
  blocking: boolean
}

export interface MultidisciplinaryTask {
  id: string
  athleteName: string
  professional: string
  module: 'Fisioterapia' | 'Nutrição' | 'Psicologia esportiva' | 'Medicina esportiva'
  task: string
  status: EntityState
  consentGranted: boolean
}
