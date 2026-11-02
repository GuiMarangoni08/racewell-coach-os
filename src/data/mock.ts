// PROTÓTIPO — todos os dados abaixo são fictícios, gerados apenas para visualização
// das 26 telas do Coach OS antes da aprovação. Nada aqui é persistido ou real.
// RN-025 (produção sem mock) será respeitada na implementação real: esta camada
// inteira é substituída por chamadas à API do racewell-backend-bff.

import type {
  Athlete,
  InboxItem,
  Goal,
  ZoneVersion,
  TrainingCycle,
  PlannedWorkout,
  CompletedWorkout,
  CoachDecision,
  HealthAlert,
  MessageThread,
  TeamMember,
  IntegrationStatus,
  AgendaEvent,
  WorkoutLibraryItem,
  CaseLibraryItem,
  CoachMemoryItem,
  ChecklistStep,
  MultidisciplinaryTask,
  DayComplianceStatus,
  LoadPoint,
} from '@/types/domain'
import { computePmc } from '@/lib/loadMetrics'

export const currentOrg = {
  name: 'Assessoria Vértice Endurance',
  plan: 'Racewell Pro — Assessorias',
  coachesCount: 6,
  athletesCount: 84,
}

export const currentCoach = {
  id: 'coach-1',
  name: 'Marina Petrucci',
  level: 'Nível 2 — Coordenador Técnico' as const,
  initials: 'MP',
}

const C: DayComplianceStatus = 'completo'
const P: DayComplianceStatus = 'parcial'
const F: DayComplianceStatus = 'faltou'
const O: DayComplianceStatus = 'folga'

export const athletes: Athlete[] = [
  { id: 'ath-1', name: 'Rafael Nogueira', avatarInitials: 'RN', status: 'ativo', coachId: 'coach-1', goalRace: 'Maratona de São Paulo', goalDate: '2026-10-18', adherence7d: 92, adherence28d: 87, lastInteraction: 'há 3 horas', alerts: 1, tags: ['sub-3h', 'longão-domingo'], dataQuality: 96, rrs: 78, ira: 22, last7Days: [C, O, C, C, P, C, C] },
  { id: 'ath-2', name: 'Camila Duarte', avatarInitials: 'CD', status: 'ativo', coachId: 'coach-1', goalRace: 'Meia Maratona do Rio', goalDate: '2026-08-30', adherence7d: 64, adherence28d: 71, lastInteraction: 'há 1 dia', alerts: 2, tags: ['retorno-lesão'], dataQuality: 88, rrs: 54, ira: 61, last7Days: [F, O, P, F, C, O, P] },
  { id: 'ath-3', name: 'Bruno Salgado', avatarInitials: 'BS', status: 'ativo', coachId: 'coach-1', goalRace: 'Ironman 70.3 Floripa', goalDate: '2026-11-22', adherence7d: 100, adherence28d: 94, lastInteraction: 'há 40 min', alerts: 0, tags: ['triathlon', 'sub-5h'], dataQuality: 99, rrs: 84, ira: 18, last7Days: [C, C, O, C, C, C, O] },
  { id: 'ath-4', name: 'Larissa Bittencourt', avatarInitials: 'LB', status: 'pausado', coachId: 'coach-1', goalRace: '10km de Curitiba', goalDate: '2026-09-06', adherence7d: 0, adherence28d: 35, lastInteraction: 'há 6 dias', alerts: 1, tags: ['pausa-clínica'], dataQuality: 40, rrs: 0, ira: 0, last7Days: [O, O, O, O, O, O, O] },
  { id: 'ath-5', name: 'Thiago Menezes', avatarInitials: 'TM', status: 'ativo', coachId: 'coach-1', goalRace: 'Maratona de Berlim', goalDate: '2026-09-27', adherence7d: 88, adherence28d: 90, lastInteraction: 'há 2 horas', alerts: 0, tags: ['sub-2h50', 'internacional'], dataQuality: 93, rrs: 71, ira: 29, last7Days: [C, C, O, P, C, C, O] },
  { id: 'ath-6', name: 'Fernanda Rocha', avatarInitials: 'FR', status: 'ativo', coachId: 'coach-1', goalRace: 'Meia de São Silvestre', goalDate: '2026-12-31', adherence7d: 76, adherence28d: 80, lastInteraction: 'há 5 horas', alerts: 1, tags: ['primeira-meia'], dataQuality: 85, rrs: 62, ira: 45, last7Days: [C, O, P, C, F, C, O] },
  { id: 'ath-7', name: 'Diego Amaral', avatarInitials: 'DA', status: 'ativo', coachId: 'coach-1', goalRace: 'Ultra dos Cânions 50km', goalDate: '2026-08-15', adherence7d: 95, adherence28d: 89, lastInteraction: 'há 20 min', alerts: 0, tags: ['trail', 'ultra'], dataQuality: 91, rrs: 74, ira: 33, last7Days: [C, C, C, O, C, P, O] },
  { id: 'ath-8', name: 'Juliana Kruger', avatarInitials: 'JK', status: 'ativo', coachId: 'coach-1', goalRace: 'Maratona de São Paulo', goalDate: '2026-10-18', adherence7d: 58, adherence28d: 66, lastInteraction: 'há 2 dias', alerts: 2, tags: ['sono-irregular'], dataQuality: 79, rrs: 48, ira: 68, last7Days: [F, C, O, F, P, O, C] },
]

export const inboxItems: InboxItem[] = [
  { id: 'inb-1', athleteId: 'ath-2', athleteName: 'Camila Duarte', kind: 'alerta', title: 'IRA elevado após retorno de lesão', summary: 'Índice de risco operacional em 61 — divergência entre carga planejada e resposta fisiológica recente.', aiSuggestion: 'Reduzir volume da semana em 20% e reavaliar em 3 dias.', aiConfidence: 0.74, priority: 'critico', slaHoursLeft: 1.5, status: 'pendente', createdAt: 'há 20 min' },
  { id: 'inb-2', athleteId: 'ath-8', athleteName: 'Juliana Kruger', kind: 'analise', title: 'Treino longo com RPE muito acima do previsto', summary: 'RPE relatado 9/10 em treino previsto como Z2. Sono irregular nos últimos 4 dias.', aiSuggestion: 'Investigar sono antes de ajustar carga; sugerir bloco de recuperação.', aiConfidence: 0.61, priority: 'importante', slaHoursLeft: 6, status: 'pendente', createdAt: 'há 1 hora' },
  { id: 'inb-3', athleteId: 'ath-6', athleteName: 'Fernanda Rocha', kind: 'feedback', title: 'Feedback de dor no joelho direito', summary: 'Atleta relatou dor leve pós-treino intervalado (RPE 3/10 de dor).', priority: 'atencao', slaHoursLeft: 20, status: 'pendente', createdAt: 'há 3 horas' },
  { id: 'inb-4', athleteId: 'ath-1', athleteName: 'Rafael Nogueira', kind: 'aprovacao', title: 'Solicitação de alteração técnica: mudar longão para sábado', summary: 'Atleta solicitou mover o longão de domingo para sábado por compromisso familiar.', priority: 'atencao', slaHoursLeft: 18, status: 'pendente', createdAt: 'há 4 horas' },
  { id: 'inb-5', athleteId: 'ath-5', athleteName: 'Thiago Menezes', kind: 'analise', title: 'Semana concluída com aderência de 88%', summary: 'Análise previsto x realizado pronta para revisão. Sem divergências relevantes.', aiConfidence: 0.9, priority: 'informativo', slaHoursLeft: 48, status: 'pendente', createdAt: 'há 6 horas' },
  { id: 'inb-6', athleteId: 'ath-3', athleteName: 'Bruno Salgado', kind: 'mensagem', title: 'Dúvida sobre nutrição pré-prova', summary: 'Atleta perguntou sobre estratégia de carboidrato para o 70.3.', priority: 'informativo', slaHoursLeft: 24, status: 'pendente', createdAt: 'há 8 horas' },
]

export const goals: Goal[] = [
  { id: 'goal-1', athleteId: 'ath-1', raceName: 'Maratona de São Paulo', raceDate: '2026-10-18', targetTime: '2:58:00', distanceKm: 42.195, status: 'aprovado', isPrimary: true, priority: 'A' },
  { id: 'goal-2', athleteId: 'ath-1', raceName: 'Meia de Ibiúna (teste)', raceDate: '2026-08-23', targetTime: '1:22:00', distanceKm: 21.1, status: 'aprovado', isPrimary: false, priority: 'C' },
]

// Larissa (ath-4, pausa clínica) e Juliana (ath-8, sono irregular) ficam
// deliberadamente sem versão de zona ainda — mostra o estado real de "sem
// teste registrado" em vez de forçar dado fictício pra todo mundo.
export const zoneVersions: ZoneVersion[] = [
  {
    id: 'zone-1', athleteId: 'ath-1', version: 3, source: 'teste', validated: true, validFrom: '2026-06-01',
    zones: [
      { name: 'Z1 — Regenerativo', paceMin: '6:10', paceMax: '5:50', hrMin: 118, hrMax: 135 },
      { name: 'Z2 — Base aeróbica', paceMin: '5:30', paceMax: '5:10', hrMin: 136, hrMax: 152 },
      { name: 'Z3 — Limiar', paceMin: '4:45', paceMax: '4:30', hrMin: 153, hrMax: 168 },
      { name: 'Z4 — VO2máx', paceMin: '4:05', paceMax: '3:50', hrMin: 169, hrMax: 182 },
    ],
  },
  {
    id: 'zone-2', athleteId: 'ath-2', version: 2, source: 'teste', validated: true, validFrom: '2026-07-05',
    zones: [
      { name: 'Z1 — Regenerativo', paceMin: '6:40', paceMax: '6:20', hrMin: 120, hrMax: 138 },
      { name: 'Z2 — Base aeróbica', paceMin: '6:00', paceMax: '5:40', hrMin: 139, hrMax: 155 },
      { name: 'Z3 — Limiar', paceMin: '5:10', paceMax: '4:55', hrMin: 156, hrMax: 170 },
      { name: 'Z4 — VO2máx', paceMin: '4:30', paceMax: '4:15', hrMin: 171, hrMax: 183 },
    ],
  },
  {
    id: 'zone-3', athleteId: 'ath-3', version: 1, source: 'teste', validated: true, validFrom: '2026-06-15',
    zones: [
      { name: 'Z1 — Regenerativo', paceMin: '6:00', paceMax: '5:40', hrMin: 115, hrMax: 132 },
      { name: 'Z2 — Base aeróbica', paceMin: '5:20', paceMax: '5:00', hrMin: 133, hrMax: 149 },
      { name: 'Z3 — Limiar', paceMin: '4:35', paceMax: '4:20', hrMin: 150, hrMax: 165 },
      { name: 'Z4 — VO2máx', paceMin: '3:55', paceMax: '3:40', hrMin: 166, hrMax: 180 },
    ],
  },
  {
    id: 'zone-4', athleteId: 'ath-5', version: 2, source: 'teste', validated: true, validFrom: '2026-06-20',
    zones: [
      { name: 'Z1 — Regenerativo', paceMin: '5:40', paceMax: '5:20', hrMin: 122, hrMax: 138 },
      { name: 'Z2 — Base aeróbica', paceMin: '5:00', paceMax: '4:40', hrMin: 139, hrMax: 154 },
      { name: 'Z3 — Limiar', paceMin: '4:10', paceMax: '3:55', hrMin: 155, hrMax: 169 },
      { name: 'Z4 — VO2máx', paceMin: '3:35', paceMax: '3:20', hrMin: 170, hrMax: 184 },
    ],
  },
  {
    id: 'zone-5', athleteId: 'ath-6', version: 1, source: 'estimativa_ia', validated: false, validFrom: '2026-07-10',
    zones: [
      { name: 'Z1 — Regenerativo', paceMin: '7:20', paceMax: '7:00', hrMin: 125, hrMax: 142 },
      { name: 'Z2 — Base aeróbica', paceMin: '6:40', paceMax: '6:15', hrMin: 143, hrMax: 158 },
      { name: 'Z3 — Limiar', paceMin: '5:40', paceMax: '5:20', hrMin: 159, hrMax: 172 },
      { name: 'Z4 — VO2máx', paceMin: '4:55', paceMax: '4:35', hrMin: 173, hrMax: 186 },
    ],
  },
  {
    id: 'zone-6', athleteId: 'ath-7', version: 1, source: 'manual', validated: true, validFrom: '2026-06-10',
    zones: [
      { name: 'Z1 — Regenerativo', paceMin: '6:50', paceMax: '6:30', hrMin: 118, hrMax: 135 },
      { name: 'Z2 — Base aeróbica', paceMin: '6:10', paceMax: '5:50', hrMin: 136, hrMax: 151 },
      { name: 'Z3 — Limiar', paceMin: '5:15', paceMax: '5:00', hrMin: 152, hrMax: 166 },
      { name: 'Z4 — VO2máx', paceMin: '4:35', paceMax: '4:20', hrMin: 167, hrMax: 180 },
    ],
  },
]

export const trainingCycles: TrainingCycle[] = [
  {
    id: 'cycle-1', athleteId: 'ath-1', name: 'Ciclo Maratona SP 2026', startDate: '2026-06-01', endDate: '2026-10-18', status: 'publicado',
    phases: [
      { id: 'ph-1', name: 'Base', startDate: '2026-06-01', endDate: '2026-07-12', focus: 'Volume aeróbico e força', loadTrend: 'construcao' },
      { id: 'ph-2', name: 'Específica', startDate: '2026-07-13', endDate: '2026-09-06', focus: 'Ritmo de prova e limiar', loadTrend: 'construcao' },
      { id: 'ph-3', name: 'Pico', startDate: '2026-09-07', endDate: '2026-10-04', focus: 'Longões específicos', loadTrend: 'pico' },
      { id: 'ph-4', name: 'Polimento', startDate: '2026-10-05', endDate: '2026-10-17', focus: 'Redução de volume, manutenção de intensidade', loadTrend: 'polimento' },
    ],
  },
]

export const plannedWorkouts: PlannedWorkout[] = [
  {
    id: 'pw-1', athleteId: 'ath-1', date: '2026-07-21', name: 'Intervalado 6x1000m', type: 'Intervalado', status: 'publicado', version: 2,
    totalDistanceKm: 14, totalDurationMin: 70, plannedTss: 92,
    blocks: [
      { id: 'b1', label: 'Aquecimento', repetitions: 1, distanceOrDuration: '15 min', intensityZone: 'Z1', recovery: '—' },
      { id: 'b2', label: 'Séries', repetitions: 6, distanceOrDuration: '1000 m', intensityZone: 'Z4', recovery: '400m trote (2 min)' },
      { id: 'b3', label: 'Desaquecimento', repetitions: 1, distanceOrDuration: '10 min', intensityZone: 'Z1', recovery: '—' },
    ],
  },
  {
    id: 'pw-2', athleteId: 'ath-1', date: '2026-07-23', name: 'Rodagem regenerativa', type: 'Regenerativo', status: 'publicado', version: 1,
    totalDistanceKm: 8, totalDurationMin: 48, plannedTss: 38,
    blocks: [{ id: 'b4', label: 'Contínuo', repetitions: 1, distanceOrDuration: '8 km', intensityZone: 'Z1', recovery: '—' }],
  },
  {
    id: 'pw-3', athleteId: 'ath-1', date: '2026-07-26', name: 'Longão 28km com progressão', type: 'Longão', status: 'rascunho', version: 1,
    totalDistanceKm: 28, totalDurationMin: 150, plannedTss: 145,
    blocks: [
      { id: 'b5', label: 'Base', repetitions: 1, distanceOrDuration: '20 km', intensityZone: 'Z2', recovery: '—' },
      { id: 'b6', label: 'Progressão final', repetitions: 1, distanceOrDuration: '8 km', intensityZone: 'Z3', recovery: '—' },
    ],
  },
]

/**
 * Preenche o restante de julho/início de agosto de 2026 com o mesmo padrão
 * semanal do ciclo de Rafael Nogueira (ver ath1WeekPattern mais abaixo),
 * pulando os dias de folga e as datas já detalhadas manualmente acima
 * (21, 23 e 26/07) — necessário para as visões de quinzena e mês do
 * Calendário (tela 014) terem conteúdo real, não só uma semana isolada.
 */
const manualDates = new Set(plannedWorkouts.map((w) => w.date))
const weekdayTemplate: Record<number, { name: string; type: string; km: number; min: number; tss: number; zone: string }> = {
  0: { name: 'Longão', type: 'Longão', km: 24, min: 130, tss: 120, zone: 'Z2' },
  2: { name: 'Intervalado', type: 'Intervalado', km: 13, min: 65, tss: 85, zone: 'Z4' },
  3: { name: 'Rodagem leve', type: 'Regenerativo', km: 9, min: 52, tss: 40, zone: 'Z1' },
  4: { name: 'Força + rodagem', type: 'Força', km: 6, min: 45, tss: 48, zone: 'Z2' },
  6: { name: 'Rodagem moderada', type: 'Moderado', km: 12, min: 62, tss: 55, zone: 'Z2' },
}
let extraWorkoutSeq = 0
for (let i = -20; i < 20; i++) {
  const day = new Date(2026, 6, 21 + i)
  const template = weekdayTemplate[day.getDay()]
  const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
  if (!template || manualDates.has(iso)) continue
  extraWorkoutSeq += 1
  plannedWorkouts.push({
    id: `pw-auto-${extraWorkoutSeq}`,
    athleteId: 'ath-1',
    date: iso,
    name: template.name,
    type: template.type,
    status: day < new Date(2026, 6, 21) ? 'concluido' : 'publicado',
    version: 1,
    totalDistanceKm: template.km,
    totalDurationMin: template.min,
    plannedTss: template.tss,
    blocks: [{ id: `bx-${extraWorkoutSeq}`, label: 'Contínuo', repetitions: 1, distanceOrDuration: `${template.km} km`, intensityZone: template.zone, recovery: '—' }],
  })
}

export const completedWorkouts: CompletedWorkout[] = [
  { id: 'cw-1', plannedWorkoutId: 'pw-1', athleteId: 'ath-1', date: '2026-07-21', source: 'garmin', distanceKm: 14.2, durationMin: 72, avgPace: '5:04', avgHr: 161, rpe: 7, tss: 95, confidence: 0.95 },
  { id: 'cw-2', athleteId: 'ath-1', date: '2026-07-20', source: 'strava', distanceKm: 10.1, durationMin: 58, avgPace: '5:45', avgHr: 142, rpe: 4, tss: 52, confidence: 0.9 },
]

/**
 * Histórico diário sintético de carga (TSS) para Rafael Nogueira (ath-1),
 * cobrindo o início do ciclo Maratona SP (Base, ver trainingCycles) até a
 * data de hoje no protótipo. Padrão semanal fixo (longão domingo, folga
 * segunda, intervalado terça...) com progressão leve semana a semana —
 * gera o gráfico de condicionamento (Fitness/Fadiga/Forma) da tela 006/022.
 */
function generateDailyTss(startISO: string, days: number, weekPattern: number[], rampPerWeek: number) {
  const [y, m, d] = startISO.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const points: { date: string; tss: number }[] = []
  for (let i = 0; i < days; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    const week = Math.floor(i / 7)
    const base = weekPattern[day.getDay()]
    const tss = Math.max(0, Math.round(base + week * rampPerWeek))
    const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
    points.push({ date: iso, tss })
  }
  return points
}

// índice = getDay(): 0 dom (longão), 1 seg (folga), 2 ter (intervalado), 3 qua (leve), 4 qui (força+leve), 5 sex (folga/leve), 6 sáb (moderado)
const ath1WeekPattern = [70, 0, 55, 35, 45, 20, 40]
export const ath1DailyTss = generateDailyTss('2026-05-01', 82, ath1WeekPattern, 1.8)
export const ath1LoadHistory: LoadPoint[] = computePmc(ath1DailyTss)
export const loadHistoryByAthlete: Record<string, LoadPoint[]> = {
  'ath-1': ath1LoadHistory,
}

export const coachDecisions: CoachDecision[] = [
  {
    id: 'dec-1', athleteId: 'ath-2', athleteName: 'Camila Duarte', type: 'Ajuste de carga pós-lesão',
    aiSuggestion: 'Reduzir volume semanal em 20% e priorizar Z1/Z2 por 5 dias.', aiConfidence: 0.74,
    humanDecision: 'Reduzir volume em 15% e manter 1 sessão leve de força.', justification: 'Atleta relatou boa resposta subjetiva na última sessão; redução total pode desmotivar retorno.',
    author: 'Marina Petrucci', outcomeStatus: 'pendente', version: 1,
  },
  {
    id: 'dec-2', athleteId: 'ath-6', athleteName: 'Fernanda Rocha', type: 'Investigação de dor articular',
    aiSuggestion: 'Substituir intervalado por rodagem leve e encaminhar avaliação.', aiConfidence: 0.68,
    humanDecision: 'Substituído por rodagem leve; encaminhada para fisioterapeuta parceiro.', justification: 'Dor leve e localizada, sem histórico prévio — precaução.',
    author: 'Marina Petrucci', closedAt: '2026-07-18', outcomeStatus: 'favoravel', outcomeNotes: 'Dor cessou após 4 dias, retorno gradual iniciado.', version: 1,
  },
]

export const healthAlerts: HealthAlert[] = [
  { id: 'ha-1', athleteId: 'ath-2', athleteName: 'Camila Duarte', type: 'IRA elevado', severity: 'critico', message: 'Índice de risco operacional acima do limite por 2 dias consecutivos.', evidence: ['HRV -18% vs. baseline', 'Sono médio 5h40 (7 dias)', 'Carga aguda/crônica 1.6'], status: 'aberto', createdAt: 'há 20 min' },
  { id: 'ha-2', athleteId: 'ath-8', athleteName: 'Juliana Kruger', type: 'RRS baixo', severity: 'importante', message: 'Score de recuperação abaixo do esperado há 3 dias.', evidence: ['FC repouso +6 bpm', 'Body battery médio 32'], status: 'reconhecido', createdAt: 'há 1 dia' },
  { id: 'ha-3', athleteId: 'ath-6', athleteName: 'Fernanda Rocha', type: 'Dor articular declarada', severity: 'atencao', message: 'Dor leve no joelho direito relatada após treino intervalado.', evidence: ['Feedback do atleta (RPE dor 3/10)'], status: 'aberto', createdAt: 'há 3 horas' },
]

export const messageThreads: MessageThread[] = [
  { id: 'th-1', athleteId: 'ath-1', athleteName: 'Rafael Nogueira', lastMessage: 'Consigo trocar o longão para sábado essa semana?', lastAt: 'há 4 horas', unread: 1, slaStatus: 'proximo' },
  { id: 'th-2', athleteId: 'ath-3', athleteName: 'Bruno Salgado', lastMessage: 'Perfeito, vou seguir a estratégia de gel a cada 40min.', lastAt: 'há 8 horas', unread: 0, slaStatus: 'dentro' },
  { id: 'th-3', athleteId: 'ath-2', athleteName: 'Camila Duarte', lastMessage: 'Senti um pouco de desconforto ontem no joelho de novo.', lastAt: 'há 1 dia', unread: 1, slaStatus: 'estourado' },
]

export const teamMembers: TeamMember[] = [
  { id: 'tm-1', name: 'Marina Petrucci', role: 'Nível 2 — Coordenador Técnico', athletesCount: 14, status: 'ativo', since: '2025-02-10' },
  { id: 'tm-2', name: 'André Salviano', role: 'Nível 1 — Treinador', athletesCount: 22, status: 'ativo', since: '2025-08-01' },
  { id: 'tm-3', name: 'Patrícia Lemos', role: 'Nível 1 — Treinador', athletesCount: 18, status: 'ativo', since: '2026-01-15' },
  { id: 'tm-4', name: 'Otávio Ferraz', role: 'Nível 3 — Diretor Técnico', athletesCount: 0, status: 'ativo', since: '2024-11-03' },
  { id: 'tm-5', name: 'Renata Coutinho', role: 'Nível 1 — Treinador', athletesCount: 9, status: 'pendente', since: '2026-07-15' },
]

export const integrationStatuses: IntegrationStatus[] = [
  { provider: 'Garmin', connectedAthletes: 41, lastSync: 'há 12 min', health: 'ok', duplicatesFound: 3 },
  { provider: 'Strava', connectedAthletes: 52, lastSync: 'há 8 min', health: 'ok', duplicatesFound: 3 },
  { provider: 'Apple Health', connectedAthletes: 6, lastSync: 'há 2 dias', health: 'atencao', duplicatesFound: 0 },
  { provider: 'CSV/FIT', connectedAthletes: 12, lastSync: 'há 5 horas', health: 'ok', duplicatesFound: 0 },
  { provider: 'Imagem/PDF', connectedAthletes: 4, lastSync: 'há 3 dias', health: 'ok', duplicatesFound: 0 },
]

export const kpisHome = {
  athletesToday: 8,
  pendingInbox: inboxItems.filter((i) => i.status === 'pendente').length,
  criticalAlerts: healthAlerts.filter((a) => a.severity === 'critico' && a.status !== 'resolvido').length,
  adherenceWeek: 82,
  upcomingRaces: 3,
}

export const agendaEvents: AgendaEvent[] = [
  { id: 'ag-1', date: '2026-07-21', time: '07:00', type: 'chamada_atleta', title: 'Revisão de retorno pós-lesão', athleteName: 'Camila Duarte', responsible: 'Marina Petrucci', recurring: false, status: 'pendente' },
  { id: 'ag-2', date: '2026-07-21', time: '12:30', type: 'reuniao_equipe', title: 'Alinhamento semanal da equipe técnica', responsible: 'Marina Petrucci', recurring: true, status: 'pendente' },
  { id: 'ag-3', date: '2026-07-22', time: '18:00', type: 'avaliacao', title: 'Reavaliação de zonas (teste de limiar)', athleteName: 'Thiago Menezes', responsible: 'André Salviano', recurring: false, status: 'pendente' },
  { id: 'ag-4', date: '2026-07-23', time: '08:00', type: 'revisao_tecnica', title: 'Revisão de ciclo — Maratona SP', athleteName: 'Rafael Nogueira', responsible: 'Marina Petrucci', recurring: false, status: 'pendente' },
  { id: 'ag-5', date: '2026-08-15', time: '06:00', type: 'prova', title: 'Ultra dos Cânions 50km', athleteName: 'Diego Amaral', responsible: 'Marina Petrucci', recurring: false, status: 'aprovado' },
  { id: 'ag-6', date: '2026-08-23', time: '07:00', type: 'prova', title: 'Meia de Ibiúna (teste de ritmo)', athleteName: 'Rafael Nogueira', responsible: 'Marina Petrucci', recurring: false, status: 'aprovado' },
]

export const workoutLibrary: WorkoutLibraryItem[] = [
  { id: 'lib-1', name: 'Intervalado 5-6x1000m em Z4', category: 'Intervalado', objective: 'Desenvolver VO2máx', level: 'intermediario', phase: 'Específica', author: 'Marina Petrucci', version: 4, tags: ['limiar', 'pista'], contraindications: ['dor articular ativa'], outcomesTracked: 18, scope: 'institucional', hasDemoVideo: true },
  { id: 'lib-2', name: 'Longão progressivo 26-30km', category: 'Longão', objective: 'Resistência específica de maratona', level: 'avancado', phase: 'Pico', author: 'Otávio Ferraz', version: 6, tags: ['maratona', 'progressão'], contraindications: [], outcomesTracked: 41, scope: 'institucional', hasDemoVideo: false },
  { id: 'lib-3', name: 'Fartlek 8x3min forte/2min leve', category: 'Fartlek', objective: 'Transição base → específica', level: 'iniciante', phase: 'Base', author: 'André Salviano', version: 2, tags: ['iniciante', 'transição'], contraindications: [], outcomesTracked: 6, scope: 'pessoal', hasDemoVideo: false },
  { id: 'lib-4', name: 'Bloco de força para corredores', category: 'Força', objective: 'Prevenção de lesão e economia de corrida', level: 'intermediario', phase: 'Base', author: 'Marina Petrucci', version: 3, tags: ['força', 'prevenção'], contraindications: ['lesão recente de joelho'], outcomesTracked: 12, scope: 'institucional', hasDemoVideo: true },
  { id: 'lib-5', name: 'Agachamento búlgaro + prancha lateral', category: 'Força', objective: 'Estabilidade de quadril e core para corredores', level: 'iniciante', phase: 'Base', author: 'Marina Petrucci', version: 2, tags: ['unilateral', 'core'], contraindications: [], outcomesTracked: 9, scope: 'institucional', hasDemoVideo: true },
  { id: 'lib-6', name: 'Nado contínuo 2000m Z2', category: 'Natação', objective: 'Base aeróbica no nado para triatletas', level: 'intermediario', phase: 'Base', author: 'Bruno Salgado', version: 1, tags: ['triathlon', 'aeróbico'], contraindications: [], outcomesTracked: 4, scope: 'pessoal', hasDemoVideo: false },
  { id: 'lib-7', name: 'Mobilidade de tornozelo e quadril (pré-treino)', category: 'Mobilidade', objective: 'Preparação articular e prevenção de lesão', level: 'iniciante', phase: 'Base', author: 'Marina Petrucci', version: 5, tags: ['aquecimento', 'prevenção'], contraindications: [], outcomesTracked: 22, scope: 'institucional', hasDemoVideo: true },
]

export const caseLibrary: CaseLibraryItem[] = [
  { id: 'case-1', contextSummary: 'Atleta amador, retorno de lesão de canela, meta de meia maratona em 8 semanas', anonymizedProfile: 'M, 34 anos, sub-elite, histórico de 3 meias anteriores', decision: 'Redução de 25% do volume por 2 semanas com transição gradual para Z2', outcome: 'favoravel', factors: ['boa aderência ao protocolo de fortalecimento', 'sono regular'], evidence: 'Outcome observado 6 semanas após decisão', similarity: 0.81 },
  { id: 'case-2', contextSummary: 'Atleta com IRA cronicamente elevado por acúmulo de estresse extra-treino', anonymizedProfile: 'F, 41 anos, intermediária, rotina de trabalho intensa', decision: 'Congelamento de progressão de carga por 1 ciclo completo', outcome: 'favoravel', factors: ['redução de HRV persistente antes da decisão', 'fator externo declarado: estresse no trabalho'], evidence: 'RRS normalizado após 3 semanas', similarity: 0.68 },
  { id: 'case-3', contextSummary: 'Atleta sub-3h com plateau de performance em ciclo de pico', anonymizedProfile: 'M, 29 anos, avançado, alta aderência histórica', decision: 'Inserção de bloco de recuperação não planejado antes do polimento', outcome: 'neutro', factors: ['sem sinais fisiológicos claros, decisão por padrão histórico similar'], evidence: 'Outcome parcialmente conclusivo — prova adiada por fator externo', similarity: 0.54 },
]

export const coachMemoryItems: CoachMemoryItem[] = [
  { id: 'mem-1', pattern: 'Atletas com IRA > 55 por 2+ dias respondem melhor a redução de volume do que de intensidade', origin: '14 decisões com outcome favorável na assessoria', owner: 'Assessoria Vértice Endurance', confidence: 0.77, impact: 'alto', status: 'aprovado' },
  { id: 'mem-2', pattern: 'Retorno de lesão de canela responde melhor com transição de 3 semanas do que 2', origin: '6 decisões com outcome registrado', owner: 'Marina Petrucci', confidence: 0.58, impact: 'medio', status: 'proposto' },
  { id: 'mem-3', pattern: 'Longões acima de 30km sem teste prévio de nutrição têm mais abandono de bloco', origin: 'Correlação observada, ainda sem outcome suficiente', owner: 'Assessoria Vértice Endurance', confidence: 0.31, impact: 'baixo', status: 'proposto' },
]

export const orgOnboardingChecklist: ChecklistStep[] = [
  { id: 'org-1', label: 'Identificação institucional (razão social, CNPJ, contatos)', done: true, blocking: true },
  { id: 'org-2', label: 'Estrutura (unidades, grupos, modalidades)', done: true, blocking: true },
  { id: 'org-3', label: 'Responsável legal e diretor técnico vinculados', done: true, blocking: true },
  { id: 'org-4', label: 'Metodologia inicial (zonas, nomenclatura, templates)', done: false, blocking: false },
  { id: 'org-5', label: 'Política de privacidade e LGPD aceita', done: true, blocking: true },
  { id: 'org-6', label: 'Plano contratado e limites definidos', done: true, blocking: false },
  { id: 'org-7', label: 'Integrações institucionais habilitadas', done: false, blocking: false },
]

export const professionalOnboardingChecklist: ChecklistStep[] = [
  { id: 'prof-1', label: 'Identidade validada (nome, CPF, contato)', done: true, blocking: true },
  { id: 'prof-2', label: 'Registro profissional (CREF) enviado', done: true, blocking: true },
  { id: 'prof-3', label: 'Formação e certificações cadastradas', done: true, blocking: false },
  { id: 'prof-4', label: 'Nível e alçada propostos pela coordenação', done: false, blocking: true },
  { id: 'prof-5', label: 'Vínculo institucional aprovado pelo diretor técnico', done: false, blocking: true },
  { id: 'prof-6', label: 'Termos e consentimentos aceitos', done: true, blocking: true },
]

export const multidisciplinaryTasks: MultidisciplinaryTask[] = [
  { id: 'md-1', athleteName: 'Camila Duarte', professional: 'Dra. Renata Souza', module: 'Fisioterapia', task: 'Avaliação de retorno pós-lesão de canela', status: 'pendente', consentGranted: true },
  { id: 'md-2', athleteName: 'Fernanda Rocha', professional: 'Dr. Paulo Vieira', module: 'Medicina esportiva', task: 'Investigar dor articular recorrente', status: 'pendente', consentGranted: true },
  { id: 'md-3', athleteName: 'Juliana Kruger', professional: 'Camila Fontes (Psic.)', module: 'Psicologia esportiva', task: 'Acompanhar padrão de sono irregular', status: 'rascunho', consentGranted: false },
]

export const weeklyAdherenceTrend = [
  { week: 'Sem 1', previsto: 100, realizado: 88 },
  { week: 'Sem 2', previsto: 100, realizado: 94 },
  { week: 'Sem 3', previsto: 100, realizado: 79 },
  { week: 'Sem 4', previsto: 100, realizado: 91 },
  { week: 'Sem 5', previsto: 100, realizado: 82 },
  { week: 'Sem 6', previsto: 100, realizado: 87 },
]
