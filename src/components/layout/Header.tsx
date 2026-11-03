import { useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAuth } from '@/auth/AuthProvider'
import { useOrganization } from '@/org/OrganizationProvider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
}

export function Header() {
  const { user, logout } = useAuth()
  const { context, organization, selectOrganization, reload } = useOrganization()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      toast.error(error instanceof Error
        ? `Sessão local encerrada, mas o servidor não confirmou o logout: ${error.message}`
        : 'Sessão local encerrada, mas o servidor não confirmou o logout.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="gap-1.5 text-xs">{organization.name}<ChevronDown className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Organização · {organization.role}</DropdownMenuLabel>
            {context.organizations.map((org) => <DropdownMenuItem key={org.id} disabled={org.id === organization.id} onSelect={() => {
              if (window.confirm('Trocar de organização? Alterações locais não salvas serão descartadas.')) selectOrganization(org.id)
            }}>{org.name} · {org.role}</DropdownMenuItem>)}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={reload}>Revalidar vínculos</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent" aria-label="Menu da conta">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary">{initials(user?.name ?? '') || '—'}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-xs font-medium">{user?.name ?? 'Conta'}</p>
                <p className="text-[10px] text-muted-foreground">{user?.role ?? user?.email ?? ''}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email ?? user?.name ?? 'Conta'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={loggingOut} onSelect={(event) => { event.preventDefault(); void handleLogout() }}>
              <LogOut className="mr-2 h-4 w-4" />{loggingOut ? 'Saindo…' : 'Sair (apenas nesta aba)'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
