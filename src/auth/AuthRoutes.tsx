import { useState, type FormEvent } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { OperationalNotice } from '@/components/shared/OperationalNotice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from './AuthProvider'

export function RequireAuth() {
  const { status, error, retryRestore } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <div className="grid min-h-screen place-items-center p-6"><OperationalNotice kind="loading" title="Validando sessão em /auth/me…" /></div>
  }
  if (status === 'error') {
    return <div className="grid min-h-screen place-items-center p-6"><div className="w-full max-w-md"><OperationalNotice kind="error" title="Não foi possível restaurar a sessão" message={error ?? undefined} onRetry={() => void retryRestore()} /></div></div>
  }
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

export function LoginPage() {
  const { status, error, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/atletas'

  if (status === 'authenticated') return <Navigate to={from} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch {
      // O erro da API é exposto pelo AuthProvider e exibido abaixo.
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="font-display text-sm font-semibold tracking-wide text-primary">RACEWELL Coach OS</p>
          <CardTitle>Entrar na sua conta</CardTitle>
          <p className="text-sm text-muted-foreground">Use seu email e senha de treinador.</p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <OperationalNotice kind="error" title="Falha no acesso" message={error} />}
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-password">Senha</Label>
              <Input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            <Button type="submit" disabled={submitting || status === 'loading'}>
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

export function FuturePhasePage({ title, objective, code }: { title: string; objective?: string; code?: string }) {
  return (
    <div>
      <PageHeader code={code} title={title} objective={objective} scope="Fase futura" />
      <OperationalNotice
        kind="empty"
        title="Disponível em fase futura"
        message="Esta tela ainda não está conectada ao backend. Nenhum dado de demonstração ou mock é exibido como informação real."
      />
    </div>
  )
}
