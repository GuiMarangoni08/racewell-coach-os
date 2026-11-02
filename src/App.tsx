import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AthleteShell } from '@/components/athlete/AthleteShell'
import { SpecScreenPage } from '@/components/shared/SpecScreenPage'
import { screens } from '@/data/screens'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'

import HomePage from '@/pages/HomePage'
import InboxPage from '@/pages/InboxPage'
import AthletesPage from '@/pages/AthletesPage'
import AthleteProfilePage from '@/pages/AthleteProfilePage'
import WorkoutEditorPage from '@/pages/WorkoutEditorPage'
import CalendarPage from '@/pages/CalendarPage'
import AnalysisPage from '@/pages/AnalysisPage'
import DecisionEnginePage from '@/pages/DecisionEnginePage'
import CoachDashboardPage from '@/pages/CoachDashboardPage'
import TeamPermissionsPage from '@/pages/TeamPermissionsPage'
import OrgOnboardingPage from '@/pages/OrgOnboardingPage'
import ProfessionalOnboardingPage from '@/pages/ProfessionalOnboardingPage'
import InitialConfigPage from '@/pages/InitialConfigPage'
import AgendaPage from '@/pages/AgendaPage'
import AthleteOnboardingReviewPage from '@/pages/AthleteOnboardingReviewPage'
import GoalsZonesPage from '@/pages/GoalsZonesPage'
import PlanningCentralPage from '@/pages/PlanningCentralPage'
import CyclesPage from '@/pages/CyclesPage'
import WeekBuilderPage from '@/pages/WeekBuilderPage'
import WorkoutLibraryPage from '@/pages/WorkoutLibraryPage'
import MessagesPage from '@/pages/MessagesPage'
import HealthAlertsPage from '@/pages/HealthAlertsPage'
import MultidisciplinaryTeamPage from '@/pages/MultidisciplinaryTeamPage'
import CaseLibraryPage from '@/pages/CaseLibraryPage'
import CoachMemoryPage from '@/pages/CoachMemoryPage'
import InstitutionalDashboardPage from '@/pages/InstitutionalDashboardPage'
import IntegrationsPage from '@/pages/IntegrationsPage'
import OrgSettingsPage from '@/pages/OrgSettingsPage'

import AthleteHomePage from '@/pages/athlete/AthleteHomePage'
import AthleteWeekPage from '@/pages/athlete/AthleteWeekPage'
import AthleteTrainingDetailPage from '@/pages/athlete/AthleteTrainingDetailPage'
import AthleteMessagesPage from '@/pages/athlete/AthleteMessagesPage'
import AthleteHealthPage from '@/pages/athlete/AthleteHealthPage'
import AthleteSelfProfilePage from '@/pages/athlete/AthleteProfilePage'

const heroRoutes: Record<string, React.ComponentType> = {
  'RW-COACH-SCREEN-000A': OrgOnboardingPage,
  'RW-COACH-SCREEN-000B': ProfessionalOnboardingPage,
  'RW-COACH-SCREEN-001': InitialConfigPage,
  'RW-COACH-SCREEN-002': HomePage,
  'RW-COACH-SCREEN-003': InboxPage,
  'RW-COACH-SCREEN-004': AgendaPage,
  'RW-COACH-SCREEN-005': AthletesPage,
  'RW-COACH-SCREEN-006': AthleteProfilePage,
  'RW-COACH-SCREEN-007': AthleteOnboardingReviewPage,
  'RW-COACH-SCREEN-008': GoalsZonesPage,
  'RW-COACH-SCREEN-009': PlanningCentralPage,
  'RW-COACH-SCREEN-010': CyclesPage,
  'RW-COACH-SCREEN-011': WeekBuilderPage,
  'RW-COACH-SCREEN-012': WorkoutEditorPage,
  'RW-COACH-SCREEN-013': WorkoutLibraryPage,
  'RW-COACH-SCREEN-014': CalendarPage,
  'RW-COACH-SCREEN-015': AnalysisPage,
  'RW-COACH-SCREEN-016': MessagesPage,
  'RW-COACH-SCREEN-017': DecisionEnginePage,
  'RW-COACH-SCREEN-018': HealthAlertsPage,
  'RW-COACH-SCREEN-019': MultidisciplinaryTeamPage,
  'RW-COACH-SCREEN-020': CaseLibraryPage,
  'RW-COACH-SCREEN-021': CoachMemoryPage,
  'RW-COACH-SCREEN-022': CoachDashboardPage,
  'RW-COACH-SCREEN-023': InstitutionalDashboardPage,
  'RW-COACH-SCREEN-024': TeamPermissionsPage,
  'RW-COACH-SCREEN-025': IntegrationsPage,
  'RW-COACH-SCREEN-026': OrgSettingsPage,
}

export default function App() {
  return (
    <TooltipProvider>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<AppShell />}>
          {screens.map((s) => {
            const Hero = heroRoutes[s.code]
            const path = s.path === '/' ? '/' : s.path
            return (
              <Route
                key={s.code}
                path={path}
                element={Hero ? <Hero /> : <SpecScreenPage spec={s} />}
              />
            )
          })}
        </Route>

        <Route element={<AthleteShell />}>
          <Route path="/atleta" element={<AthleteHomePage />} />
          <Route path="/atleta/semana" element={<AthleteWeekPage />} />
          <Route path="/atleta/treino/:workoutId" element={<AthleteTrainingDetailPage />} />
          <Route path="/atleta/mensagens" element={<AthleteMessagesPage />} />
          <Route path="/atleta/saude" element={<AthleteHealthPage />} />
          <Route path="/atleta/perfil" element={<AthleteSelfProfilePage />} />
        </Route>
      </Routes>
    </TooltipProvider>
  )
}
