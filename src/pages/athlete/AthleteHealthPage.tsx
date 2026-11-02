import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { athletes, zoneVersions } from '@/data/mock'

export default function AthleteHealthPage() {
  const me = athletes[0]
  const zones = zoneVersions.find((z) => z.athleteId === me.id)

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-base font-semibold">Saúde e disponibilidade</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Recuperação (RRS)</p><p className="text-lg font-semibold text-success">{me.rrs}/100</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Risco (IRA)</p><p className="text-lg font-semibold">{me.ira}/100</p></CardContent></Card>
      </div>

      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-3 text-xs text-success-foreground/80">
          Sem alertas críticos abertos. Continue priorizando sono nos dias de treino intenso.
        </CardContent>
      </Card>

      {zones && (
        <Card>
          <CardContent className="p-3">
            <p className="mb-2 text-xs font-medium">Minhas zonas vigentes</p>
            <div className="grid grid-cols-2 gap-2">
              {zones.zones.map((z) => (
                <div key={z.name} className="rounded-md border p-2 text-[11px]">
                  <p className="font-medium">{z.name}</p>
                  <p className="text-muted-foreground">{z.paceMax}–{z.paceMin} /km</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-3">
          <p className="mb-1 text-xs font-medium">Consentimentos</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="success" className="text-[10px]">Dados compartilhados com meu treinador</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
