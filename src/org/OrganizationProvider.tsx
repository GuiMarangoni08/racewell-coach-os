import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { coachRepository } from '@/api/coachRepository'
import { organizationStorage } from '@/api/session'
import { useAuth } from '@/auth/AuthProvider'
import type { Organization, OrganizationContext as OrganizationContextData } from '@/api/types'
import { OperationalNotice } from '@/components/shared/OperationalNotice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface OrganizationContextValue {
  context: OrganizationContextData
  organization: Organization
  selectOrganization: (id: string) => void
  reload: () => void
}
const OrganizationContext = createContext<OrganizationContextValue | null>(null)
export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const [context, setContext] = useState<OrganizationContextData | null>(null)
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    organizationStorage.clearActive()
    setLoading(true)
    setSelectedId('')
    setError(null)
    coachRepository.organizationContext().then((value) => {
      if (!active) return
      if (value.userId !== user?.id) throw new Error('O contexto retornado pertence a outra conta.')
      setContext(value)
      // Only restore an explicit prior choice when it still appears in current staff memberships.
      const previous = organizationStorage.getForUser(value.userId)
      if (previous && value.organizations.some((org) => org.id === previous)) {
        organizationStorage.select(value.userId, previous)
        setSelectedId(previous)
      }
    }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Falha ao carregar contexto.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false; organizationStorage.clearActive() }
  }, [attempt, user?.id])
  const reload = useCallback(() => { organizationStorage.clearActive(); setContext(null); setAttempt((value) => value + 1) }, [])
  const selectOrganization = useCallback((id: string) => {
    if (!context?.organizations.some((org) => org.id === id)) throw new Error('Organização não disponível no contexto de staff.')
    organizationStorage.select(context.userId, id)
    setSelectedId(id)
  }, [context])
  const organization = context?.organizations.find((org) => org.id === selectedId)
  const value = useMemo(() => context && organization ? { context, organization, reload, selectOrganization } : null, [context, organization, reload, selectOrganization])
  const exit = <Button variant="outline" onClick={() => void logout().catch(() => { /* local logout is authoritative for the browser */ })}>Sair da sessão local</Button>
  if (loading) return <div className="grid min-h-screen place-items-center p-6"><OperationalNotice kind="loading" title="Carregando organizações disponíveis…" /></div>
  if (error || !context) return <div className="grid min-h-screen place-items-center p-6"><div className="w-full max-w-xl"><OperationalNotice kind="error" title="Não foi possível carregar o contexto" message={error ?? 'Resposta inválida.'} onRetry={reload} />{exit}</div></div>
  if (!value) return <div className="grid min-h-screen place-items-center p-6"><Card className="w-full max-w-lg"><CardHeader><CardTitle>Selecionar organização</CardTitle></CardHeader><CardContent className="space-y-4">
    {context.organizations.length ? <><Label htmlFor="organization-selection">Organização de trabalho</Label><Select onValueChange={selectOrganization}><SelectTrigger id="organization-selection"><SelectValue placeholder="Escolha explicitamente a organização" /></SelectTrigger><SelectContent>{context.organizations.map((org) => <SelectItem key={org.id} value={org.id}>{org.name} · {org.role}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">Sua escolha será mantida nesta aba e revalidada com a API. Nenhuma organização é selecionada automaticamente.</p></> : <OperationalNotice kind="empty" title="Sem vínculo de staff ativo" message="A API não disponibilizou organizações de trabalho. Matrícula de atleta não concede acesso de treinador. Solicite o vínculo ao administrador." />}
    <div className="flex gap-2"><Button variant="outline" onClick={reload}>Recarregar contexto</Button>{exit}</div>
  </CardContent></Card></div>
  // Remount operational state on tenant changes; no previous athlete/draft survives a switch.
  return <OrganizationContext.Provider value={value}><div key={organization!.id} className="contents">{children}</div></OrganizationContext.Provider>
}
export function useOrganization(): OrganizationContextValue {
  const value = useContext(OrganizationContext)
  if (!value) throw new Error('useOrganization deve ser usado dentro de OrganizationProvider.')
  return value
}
