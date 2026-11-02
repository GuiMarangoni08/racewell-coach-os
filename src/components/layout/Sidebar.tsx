import { NavLink } from 'react-router-dom'
import {
  Home, Inbox, Calendar, Users, UserRound, Target, LayoutGrid, Repeat, CalendarRange,
  ListChecks, Library, CalendarDays, LineChart, MessageSquare, FileHeart, ShieldAlert,
  Stethoscope, BookOpen, Brain, Gauge, Building2, UsersRound, Plug, Settings, Sparkles,
} from 'lucide-react'
import { screens, screenGroups } from '@/data/screens'
import { cn } from '@/lib/utils'
import { currentOrg } from '@/data/mock'

const iconByCode: Record<string, React.ComponentType<{ className?: string }>> = {
  'RW-COACH-SCREEN-000A': Building2,
  'RW-COACH-SCREEN-000B': UserRound,
  'RW-COACH-SCREEN-001': Settings,
  'RW-COACH-SCREEN-002': Home,
  'RW-COACH-SCREEN-003': Inbox,
  'RW-COACH-SCREEN-004': Calendar,
  'RW-COACH-SCREEN-005': Users,
  'RW-COACH-SCREEN-006': UserRound,
  'RW-COACH-SCREEN-007': ListChecks,
  'RW-COACH-SCREEN-008': Target,
  'RW-COACH-SCREEN-009': LayoutGrid,
  'RW-COACH-SCREEN-010': Repeat,
  'RW-COACH-SCREEN-011': CalendarRange,
  'RW-COACH-SCREEN-012': Sparkles,
  'RW-COACH-SCREEN-013': Library,
  'RW-COACH-SCREEN-014': CalendarDays,
  'RW-COACH-SCREEN-015': LineChart,
  'RW-COACH-SCREEN-016': MessageSquare,
  'RW-COACH-SCREEN-017': FileHeart,
  'RW-COACH-SCREEN-018': ShieldAlert,
  'RW-COACH-SCREEN-019': Stethoscope,
  'RW-COACH-SCREEN-020': BookOpen,
  'RW-COACH-SCREEN-021': Brain,
  'RW-COACH-SCREEN-022': Gauge,
  'RW-COACH-SCREEN-023': Gauge,
  'RW-COACH-SCREEN-024': UsersRound,
  'RW-COACH-SCREEN-025': Plug,
  'RW-COACH-SCREEN-026': Settings,
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15">
          <span className="font-display text-lg font-bold italic leading-none text-primary">R</span>
        </div>
        <div className="leading-tight">
          <p className="font-display text-base font-semibold tracking-wide">RACEWELL <span className="text-primary">Coach OS</span></p>
          <p className="text-[11px] text-sidebar-foreground/60">{currentOrg.name}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 no-scrollbar">
        {screenGroups.map((group) => (
          <div key={group} className="mb-3">
            <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {group}
            </p>
            <div className="flex flex-col gap-0.5">
              {screens
                .filter((s) => s.group === group)
                .map((s) => {
                  const Icon = iconByCode[s.code] ?? LayoutGrid
                  const to = s.path.includes(':') ? s.path.split('/:')[0] || '/' : s.path
                  return (
                    <NavLink
                      key={s.code}
                      to={to}
                      end={to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                        )
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{s.title}</span>
                      {s.scope.includes('V1') && (
                        <span className="ml-auto rounded bg-sidebar-accent px-1 text-[9px] text-sidebar-foreground/50">V1</span>
                      )}
                    </NavLink>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
