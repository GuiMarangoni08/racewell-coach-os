import type { ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { FuturePhasePage, LoginPage, RequireAuth } from '@/auth/AuthRoutes'
import { AuthProvider } from '@/auth/AuthProvider'
import { OrganizationProvider } from '@/org/OrganizationProvider'
import { screens } from '@/data/screens'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import AthletesPage from '@/pages/AthletesPage'
import WorkoutEditorPage from '@/pages/WorkoutEditorPage'
import CalendarPage from '@/pages/CalendarPage'
import WeekBuilderPage from '@/pages/WeekBuilderPage'
import WorkoutLibraryPage from '@/pages/WorkoutLibraryPage'

const operationalPages: Record<string, ComponentType> = {
  'RW-COACH-SCREEN-005': AthletesPage,
  'RW-COACH-SCREEN-011': WeekBuilderPage,
  'RW-COACH-SCREEN-012': WorkoutEditorPage,
  'RW-COACH-SCREEN-013': WorkoutLibraryPage,
  'RW-COACH-SCREEN-014': CalendarPage,
}

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<OrganizationProvider><AppShell /></OrganizationProvider>}>
              <Route path="/" element={<Navigate to="/atletas" replace />} />
              {screens.filter((screen) => screen.path !== '/').map((screen) => {
                const Page = operationalPages[screen.code]
                return (
                  <Route
                    key={screen.code}
                    path={screen.path}
                    element={Page
                      ? <Page />
                      : <FuturePhasePage title={screen.title} objective={screen.objective} code={screen.code} />}
                  />
                )
              })}
              <Route path="*" element={<FuturePhasePage title="Tela não encontrada" objective="Este endereço não faz parte do núcleo operacional disponível." />} />
            </Route>
          </Route>
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  )
}
