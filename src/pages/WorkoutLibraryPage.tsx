import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PlayCircle, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { workoutLibrary } from '@/data/mock'

type ScopeTab = 'todos' | 'institucional' | 'pessoal'

export default function WorkoutLibraryPage() {
  const [query, setQuery] = useState('')
  const [scopeTab, setScopeTab] = useState<ScopeTab>('todos')
  const [category, setCategory] = useState<string | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(workoutLibrary.map((w) => w.category))).sort(),
    [],
  )

  const counts = useMemo(
    () => ({
      todos: workoutLibrary.length,
      institucional: workoutLibrary.filter((w) => w.scope === 'institucional').length,
      pessoal: workoutLibrary.filter((w) => w.scope === 'pessoal').length,
    }),
    [],
  )

  const filtered = useMemo(() => {
    return workoutLibrary.filter((w) => {
      if (scopeTab !== 'todos' && w.scope !== scopeTab) return false
      if (category && w.category !== category) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        const haystack = `${w.name} ${w.category} ${w.tags.join(' ')}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [scopeTab, category, query])

  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-013"
        title="Biblioteca de Treinos e Protocolos"
        objective="Aplicar um modelo sempre cria uma cópia vinculada à versão original — o modelo institucional nunca é alterado diretamente (RN-019)."
        scope="V0"
        actions={<Button size="sm" variant="outline">Novo modelo</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={scopeTab} onValueChange={(v) => setScopeTab(v as ScopeTab)}>
          <TabsList>
            <TabsTrigger value="todos">Todos ({counts.todos})</TabsTrigger>
            <TabsTrigger value="institucional">Institucional ({counts.institucional})</TabsTrigger>
            <TabsTrigger value="pessoal">Meus ({counts.pessoal})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar treino, categoria, tag..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Badge
          variant={category === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setCategory(null)}
        >
          Todas as categorias
        </Badge>
        {categories.map((c) => (
          <Badge
            key={c}
            variant={category === c ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategory(category === c ? null : c)}
          >
            {c}
          </Badge>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhum treino encontrado" description="Ajuste a busca ou os filtros de categoria/escopo." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <Card key={w.id}>
              <CardHeader className="pb-2">
                <div className="mb-1 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{w.category}</Badge>
                  <Badge variant={w.scope === 'institucional' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                    {w.scope === 'institucional' ? 'Institucional' : 'Pessoal'}
                  </Badge>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{w.name}</CardTitle>
                  {w.hasDemoVideo && (
                    <PlayCircle
                      className="h-5 w-5 shrink-0 text-primary"
                      aria-label="Possui vídeo demonstrativo"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xs text-muted-foreground">{w.objective}</p>
                <div className="mb-2 flex flex-wrap gap-1">
                  <Badge variant="muted" className="text-[10px] capitalize">{w.level}</Badge>
                  <Badge variant="muted" className="text-[10px]">{w.phase}</Badge>
                  {w.tags.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                </div>
                {w.contraindications.length > 0 && (
                  <p className="mb-2 text-[11px] text-destructive">Contraindicações: {w.contraindications.join(', ')}</p>
                )}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>v{w.version} · {w.author}</span>
                  <span>{w.outcomesTracked} outcomes</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {w.hasDemoVideo && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info(`Reproduzindo vídeo demonstrativo de "${w.name}" (simulado)`)}
                    >
                      <PlayCircle className="h-4 w-4" /> Ver vídeo
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => toast.success(`Cópia de "${w.name}" criada no Editor (simulado)`)}
                  >
                    Aplicar ao editor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
