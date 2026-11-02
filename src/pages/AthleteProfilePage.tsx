import { useParams } from 'react-router-dom'
import { Activity, Flag, HeartPulse, MessageSquare, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { athletes, completedWorkouts, goals, healthAlerts, loadHistoryByAthlete, zoneVersions } from '@/data/mock'
import { SeverityPill } from '@/components/shared/StatusPill'
import { EmptyState } from '@/components/shared/EmptyState'
import { PmcChart, PmcStatePills } from '@/components/shared/PmcChart'
import { formatDateBR } from '@/lib/utils'

export default function AthleteProfilePage() {
  const { athleteId } = useParams()
  const athlete = athletes.find((a) => a.id === athleteId) ?? athletes[0]
  const athleteGoals = goals.filter((g) => g.athleteId === athlete.id)
  const athleteAlerts = healthAlerts.filter((h) => h.athleteId === athlete.id)
  const athleteWorkouts = completedWorkouts.filter((w) => w.athleteId === athlete.id)
  const zones = zoneVersions.find((z) => z.athleteId === athlete.id)
  const loadHistory = loadHistoryByAthlete[athlete.id]
  const latestLoad = loadHistory?.[loadHistory.length - 1]

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-lg text-primary">{athlete.avatarInitials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-xl font-semibold">{athlete.name}</h1>
              <Badge variant={athlete.status === 'ativo' ? 'success' : 'muted'} className="capitalize">{athlete.status}</Badge>
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flag className="h-3 w-3" /> {athlete.goalRace} · {formatDateBR(athlete.goalDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><MessageSquare className="h-4 w-4" /> Mensagem</Button>
          <Button size="sm">Registrar decisão</Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Aderência 7d</p><p className="text-lg font-semibold">{athlete.adherence7d}%</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">RRS (recuperação)</p><p className="text-lg font-semibold">{athlete.rrs}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">IRA (risco)</p><p className="text-lg font-semibold">{athlete.ira}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Qualidade de dados</p><p className="text-lg font-semibold">{athlete.dataQuality}/100</p></CardContent></Card>
      </div>

      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="metas">Metas e zonas</TabsTrigger>
          <TabsTrigger value="treinos">Treinos realizados</TabsTrigger>
          <TabsTrigger value="saude">Saúde</TabsTrigger>
          <TabsTrigger value="prontuario">Prontuário</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <Card className="mb-3">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Condicionamento (Fitness / Fadiga / Forma)</CardTitle>
              {latestLoad && <PmcStatePills latest={latestLoad} />}
            </CardHeader>
            <CardContent>
              {loadHistory ? (
                <PmcChart data={loadHistory} />
              ) : (
                <EmptyState title="Sem histórico de carga suficiente" description="Este atleta ainda não acumulou TSS diário registrado para calcular Fitness/Fadiga/Forma." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Linha do tempo</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <TimelineRow icon={Activity} text={`Treino realizado importado via ${athleteWorkouts[0]?.source ?? 'Garmin'}`} time="há 2 horas" />
              <TimelineRow icon={Sparkles} text="IA gerou análise previsto x realizado da semana" time="há 6 horas" />
              <TimelineRow icon={HeartPulse} text="Score de recuperação (RRS) recalculado" time="há 8 horas" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metas">
          <Card>
            <CardHeader><CardTitle>Metas e provas</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {athleteGoals.length === 0 && <EmptyState title="Sem meta cadastrada" description="Cadastre a meta ativa do atleta em Metas, Provas e Zonas." />}
              {athleteGoals.map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                  <div>
                    <p className="font-medium">{g.raceName} {g.isPrimary && <Badge className="ml-1 text-[10px]">Principal</Badge>}</p>
                    <p className="text-xs text-muted-foreground">{formatDateBR(g.raceDate)} · alvo {g.targetTime}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          {zones && (
            <Card className="mt-3">
              <CardHeader><CardTitle>Zonas vigentes (v{zones.version} · {zones.source})</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {zones.zones.map((z) => (
                    <div key={z.name} className="rounded-md border p-2 text-xs">
                      <p className="font-medium">{z.name}</p>
                      <p className="text-muted-foreground">{z.paceMax}–{z.paceMin} /km</p>
                      <p className="text-muted-foreground">{z.hrMin}–{z.hrMax} bpm</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="treinos">
          <Card>
            <CardHeader><CardTitle>Treinos realizados recentes</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {athleteWorkouts.length === 0 && <EmptyState title="Nenhum treino realizado ainda" />}
              {athleteWorkouts.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-md border p-2.5 text-xs">
                  <span>{formatDateBR(w.date)} · {w.distanceKm}km · {w.durationMin}min</span>
                  <Badge variant="outline" className="capitalize">{w.source}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saude">
          <Card>
            <CardHeader><CardTitle>Alertas de saúde e disponibilidade</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {athleteAlerts.length === 0 && <EmptyState title="Sem alertas abertos" />}
              {athleteAlerts.map((h) => (
                <div key={h.id} className="rounded-md border p-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-medium">{h.type}</p>
                    <SeverityPill severity={h.severity} />
                  </div>
                  <p className="text-xs text-muted-foreground">{h.message}</p>
                </div>
              ))}
              <p className="mt-1 text-[11px] text-muted-foreground">Dados clínicos e notas internas seguem consentimento e finalidade (RN-017) — segregação a implementar na P4.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prontuario">
          <EmptyState title="Ver Prontuário Técnico completo" description="Decisões, justificativas e outcomes deste atleta estão na tela dedicada." />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TimelineRow({ icon: Icon, text, time }: { icon: typeof Activity; text: string; time: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 rounded-full bg-primary/10 p-1.5"><Icon className="h-3.5 w-3.5 text-primary" /></div>
      <div>
        <p className="text-sm">{text}</p>
        <p className="text-[11px] text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}
