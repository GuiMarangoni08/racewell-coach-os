import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { athletes, currentOrg, teamMembers, integrationStatuses, goals } from '@/data/mock'

export default function AthleteProfilePage() {
  const me = athletes[0]
  const coach = teamMembers.find((t) => t.name === 'Marina Petrucci')
  const myGoals = goals.filter((g) => g.athleteId === me.id)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary/10 text-primary">{me.avatarInitials}</AvatarFallback></Avatar>
        <div>
          <p className="text-sm font-semibold">{me.name}</p>
          <p className="text-[11px] text-muted-foreground">{currentOrg.name}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-3">
          <p className="mb-1 text-[11px] font-medium text-muted-foreground">Meu treinador</p>
          <p className="text-sm font-medium">{coach?.name}</p>
          <p className="text-[11px] text-muted-foreground">{coach?.role}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Minhas metas</p>
          {myGoals.map((g) => (
            <div key={g.id} className="mb-1 flex items-center justify-between text-xs">
              <span>{g.raceName}</span>
              {g.isPrimary && <Badge className="text-[9px]">Principal</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Integrações conectadas</p>
          <div className="flex flex-wrap gap-1.5">
            {integrationStatuses.slice(0, 2).map((i) => (
              <Badge key={i.provider} variant="outline" className="text-[10px]">{i.provider} · sync {i.lastSync}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
