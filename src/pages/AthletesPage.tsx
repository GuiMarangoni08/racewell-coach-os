import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { athletes } from '@/data/mock'
import { formatDateBR } from '@/lib/utils'
import { AdherenceDots } from '@/components/shared/AdherenceDots'

const statusVariant = { ativo: 'success', pausado: 'warning', encerrado: 'muted' } as const

export default function AthletesPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => athletes.filter((a) => a.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-005"
        title="Todos os Atletas"
        objective="Localizar, segmentar e administrar a carteira completa."
        scope="V0"
        actions={<Button size="sm">Adicionar / convidar atleta</Button>}
      />

      <div className="mb-3 flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome…" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Badge variant="outline">{filtered.length} atletas</Badge>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Atleta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Meta / prova</TableHead>
              <TableHead>Aderência (7d / 28d)</TableHead>
              <TableHead>Últimos 7 dias</TableHead>
              <TableHead>Qualidade de dados</TableHead>
              <TableHead>Última interação</TableHead>
              <TableHead>Alertas</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id} className="cursor-pointer">
                <TableCell>
                  <Link to={`/atletas/${a.id}`} className="flex items-center gap-2.5 hover:underline">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">{a.avatarInitials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{a.name}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[a.status]} className="capitalize">{a.status}</Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {a.goalRace}
                  <div className="text-muted-foreground">{formatDateBR(a.goalDate)}</div>
                </TableCell>
                <TableCell className="text-xs">{a.adherence7d}% / {a.adherence28d}%</TableCell>
                <TableCell><AdherenceDots days={a.last7Days} /></TableCell>
                <TableCell className="text-xs">{a.dataQuality}/100</TableCell>
                <TableCell className="text-xs text-muted-foreground">{a.lastInteraction}</TableCell>
                <TableCell>
                  {a.alerts > 0 ? <Badge variant="destructive">{a.alerts}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {a.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
