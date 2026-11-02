import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { athletes, goals, zoneVersions as baseZoneVersions } from '@/data/mock'
import { formatDateBR } from '@/lib/utils'
import { weeksUntil } from '@/lib/loadMetrics'
import type { ZoneVersion } from '@/types/domain'

const priorityVariant = { A: 'destructive', B: 'warning', C: 'outline' } as const
const priorityLabel = { A: 'Prioridade A — foco total', B: 'Prioridade B — secundária', C: 'Prioridade C — treino-prova' } as const

const sourceLabel: Record<ZoneVersion['source'], string> = {
  teste: 'teste',
  estimativa_ia: 'estimativa de IA',
  manual: 'ajuste manual',
}

const zoneTemplate = ['Z1 — Regenerativo', 'Z2 — Base aeróbica', 'Z3 — Limiar', 'Z4 — VO2máx']

function latestZoneFor(athleteId: string, extra: ZoneVersion[]) {
  return [...baseZoneVersions, ...extra]
    .filter((z) => z.athleteId === athleteId)
    .sort((a, b) => b.version - a.version)[0]
}

export default function GoalsZonesPage() {
  const [athleteId, setAthleteId] = useState(athletes[0].id)
  const [extraZoneVersions, setExtraZoneVersions] = useState<ZoneVersion[]>([])
  const [testDialogOpen, setTestDialogOpen] = useState(false)

  const athlete = athletes.find((a) => a.id === athleteId) ?? athletes[0]
  const athleteGoals = goals.filter((g) => g.athleteId === athlete.id)
  const zones = latestZoneFor(athlete.id, extraZoneVersions)

  function registerZoneTest(newZones: ZoneVersion['zones'], source: ZoneVersion['source']) {
    const nextVersion = (zones?.version ?? 0) + 1
    const created: ZoneVersion = {
      id: `zone-custom-${Date.now()}`,
      athleteId: athlete.id,
      version: nextVersion,
      source,
      validated: source === 'teste',
      validFrom: '2026-07-21',
      zones: newZones,
    }
    setExtraZoneVersions((prev) => [...prev, created])
    toast.success(`Zonas de ${athlete.name} atualizadas — versão ${nextVersion} (${zones ? 'histórico anterior preservado' : 'primeiro teste'})`)
    setTestDialogOpen(false)
  }

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-008"
        title="Metas, Provas e Zonas"
        objective="Meta declarada nunca é confundida com projeção calculada (RN-009). Análise sempre usa as zonas vigentes na data da execução (RN-010)."
        scope="V0"
        actions={
          <Select value={athleteId} onValueChange={setAthleteId}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {athletes.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Metas e provas</CardTitle>
            <Button size="sm" variant="outline" onClick={() => toast.info('Nova prova adicionada (simulado)')}>Adicionar prova</Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {athleteGoals.length === 0 && <EmptyState title="Sem meta cadastrada" description="Cadastre a meta ativa deste atleta." />}
            {athleteGoals.map((g) => (
              <div key={g.id} className="rounded-lg border p-3">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-medium">{g.raceName}</p>
                  {g.isPrimary && <Badge className="text-[10px]">Meta principal</Badge>}
                  <Badge variant={priorityVariant[g.priority]} className="text-[10px]" title={priorityLabel[g.priority]}>
                    Prioridade {g.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDateBR(g.raceDate)} · {g.distanceKm}km · alvo {g.targetTime}
                </p>
                <p className="mt-1 text-[11px] font-medium text-primary">{weeksUntil(g.raceDate)} semanas para a prova</p>
              </div>
            ))}
            <p className="mt-1 text-[11px] text-muted-foreground">Apenas uma meta principal por modalidade/período é permitida.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Zonas vigentes</CardTitle>
            {zones && <Badge variant={zones.validated ? 'success' : 'warning'}>{zones.validated ? 'Validada' : 'Aguardando validação'}</Badge>}
          </CardHeader>
          <CardContent>
            {zones ? (
              <>
                <p className="mb-2 text-xs text-muted-foreground">
                  Versão {zones.version} · fonte: {sourceLabel[zones.source]} · vigente desde {formatDateBR(zones.validFrom)}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {zones.zones.map((z) => (
                    <div key={z.name} className="rounded-md border p-2 text-xs">
                      <p className="font-medium">{z.name}</p>
                      <p className="text-muted-foreground">{z.paceMax}–{z.paceMin} /km</p>
                      <p className="text-muted-foreground">{z.hrMin}–{z.hrMax} bpm</p>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setTestDialogOpen(true)}>
                  Registrar novo teste de zonas
                </Button>
              </>
            ) : (
              <EmptyState
                title="Nenhuma zona registrada ainda"
                description={`${athlete.name} ainda não tem um teste de zona vigente. Sem isso, o construtor de treino não consegue sugerir pace/FC automaticamente.`}
                action={<Button size="sm" onClick={() => setTestDialogOpen(true)}>Registrar primeiro teste de zonas</Button>}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ZoneTestDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        athleteName={athlete.name}
        current={zones}
        onSave={registerZoneTest}
      />
    </div>
  )
}

function ZoneTestDialog({
  open,
  onOpenChange,
  athleteName,
  current,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  athleteName: string
  current: ZoneVersion | undefined
  onSave: (zones: ZoneVersion['zones'], source: ZoneVersion['source']) => void
}) {
  const [source, setSource] = useState<ZoneVersion['source']>('teste')
  const [rows, setRows] = useState(() =>
    zoneTemplate.map((name, i) => ({
      name,
      paceMin: current?.zones[i]?.paceMin ?? '',
      paceMax: current?.zones[i]?.paceMax ?? '',
      hrMin: current?.zones[i]?.hrMin ? String(current.zones[i].hrMin) : '',
      hrMax: current?.zones[i]?.hrMax ? String(current.zones[i].hrMax) : '',
    })),
  )

  function updateRow(i: number, field: 'paceMin' | 'paceMax' | 'hrMin' | 'hrMax', value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  function submit() {
    const zones = rows.map((r) => ({
      name: r.name,
      paceMin: r.paceMin,
      paceMax: r.paceMax,
      hrMin: Number(r.hrMin) || 0,
      hrMax: Number(r.hrMax) || 0,
    }))
    onSave(zones, source)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar teste de zonas — {athleteName}</DialogTitle>
          <DialogDescription>
            {current
              ? `Cria a versão ${current.version + 1}. A versão ${current.version} atual fica preservada no histórico (RN: zonas nunca são sobrescritas).`
              : 'Primeiro teste deste atleta — vira a versão 1.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-3">
          <Label className="text-[10px]">Origem</Label>
          <Select value={source} onValueChange={(v) => setSource(v as ZoneVersion['source'])}>
            <SelectTrigger className="h-8 w-56 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="teste">Teste de campo/laboratório</SelectItem>
              <SelectItem value="estimativa_ia">Estimativa de IA</SelectItem>
              <SelectItem value="manual">Ajuste manual do treinador</SelectItem>
            </SelectContent>
          </Select>
          {source !== 'teste' && (
            <p className="mt-1 text-[10px] text-muted-foreground">Só zonas de teste entram como "Validada" automaticamente — as demais ficam "Aguardando validação".</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((r, i) => (
            <div key={r.name} className="grid grid-cols-5 items-end gap-2 rounded-md border p-2">
              <p className="col-span-5 text-xs font-medium sm:col-span-1 sm:self-center">{r.name}</p>
              <div>
                <Label className="text-[10px]">Pace máx (mm:ss)</Label>
                <Input className="h-8 text-xs" value={r.paceMax} onChange={(e) => updateRow(i, 'paceMax', e.target.value)} placeholder="4:30" />
              </div>
              <div>
                <Label className="text-[10px]">Pace mín (mm:ss)</Label>
                <Input className="h-8 text-xs" value={r.paceMin} onChange={(e) => updateRow(i, 'paceMin', e.target.value)} placeholder="4:50" />
              </div>
              <div>
                <Label className="text-[10px]">FC mín (bpm)</Label>
                <Input className="h-8 text-xs" value={r.hrMin} onChange={(e) => updateRow(i, 'hrMin', e.target.value)} type="number" />
              </div>
              <div>
                <Label className="text-[10px]">FC máx (bpm)</Label>
                <Input className="h-8 text-xs" value={r.hrMax} onChange={(e) => updateRow(i, 'hrMax', e.target.value)} type="number" />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}>Salvar nova versão</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
