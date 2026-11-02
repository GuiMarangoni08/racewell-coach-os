import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowLeft, Bell, CalendarDays, Home, MessageCircle, User, Watch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { athletes } from '@/data/mock'

const tabs = [
  { to: '/atleta', label: 'Home', icon: Home, end: true },
  { to: '/atleta/semana', label: 'Semana', icon: CalendarDays },
  { to: '/atleta/mensagens', label: 'Treinador', icon: MessageCircle },
  { to: '/atleta/saude', label: 'Saúde', icon: Watch },
  { to: '/atleta/perfil', label: 'Perfil', icon: User },
]

export function AthleteShell() {
  const me = athletes[0]

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 md:p-8">
      <div className="mb-4 flex w-full max-w-sm items-center justify-between text-xs text-muted-foreground">
        <Link to="/" className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Coach OS
        </Link>
        <span>App Racewell · visão do atleta ({me.name.split(' ')[0]})</span>
      </div>

      {/* "phone" frame */}
      <div className="flex h-[780px] w-full max-w-sm flex-col overflow-hidden rounded-[2.5rem] border-8 border-sidebar-background bg-background shadow-2xl">
        <div className="flex items-center justify-between bg-background px-5 py-1.5 text-[10px] text-foreground/70">
          <span>9:41</span>
          <span className="flex items-center gap-1"><Bell className="h-2.5 w-2.5 text-primary" /> Racewell</span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
          <Outlet />
        </div>

        <nav className="grid grid-cols-5 border-t bg-background py-1.5">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-1 text-[9px]',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
