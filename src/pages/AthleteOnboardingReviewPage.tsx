import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormBlockCard } from '@/components/shared/FormBlockCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

export default function AthleteOnboardingReviewPage() {
  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-007"
        title="Onboarding e Avaliação do Atleta"
        objective="Revisão do cadastro enviado por Juliana Kruger. Autosave ativo; toda edição gera auditoria; IA não diagnostica (RN validações desta tela)."
        scope="V0"
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => toast.info('Devolvido para complementação (simulado)')}>Devolver para complementar</Button>
            <Button size="sm" onClick={() => toast.success('Onboarding aprovado — perfil técnico liberado (simulado)')}>Aprovar cadastro</Button>
          </>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground/80">
        <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
        Lesão declarada recente — revisar antes de aprovar estrutura de treino inicial.
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <FormBlockCard
          title="Dados pessoais"
          fields={[
            { label: 'Nome', value: 'Juliana Kruger' },
            { label: 'Data de nascimento', value: '14/03/1994' },
            { label: 'Cidade', value: 'São Paulo, SP' },
          ]}
        />
        <FormBlockCard
          title="Histórico esportivo"
          fields={[
            { label: 'Tempo correndo', value: '2 anos' },
            { label: 'Melhor tempo 21km', value: '1:58:40' },
            { label: 'Provas concluídas', value: '4' },
          ]}
        />
        <FormBlockCard
          title="Disponibilidade"
          fields={[
            { label: 'Dias disponíveis', value: 'Seg, Ter, Qui, Sáb, Dom' },
            { label: 'Horário preferido', value: 'Manhã (05:30–07:00)' },
          ]}
        />
        <FormBlockCard
          title="Objetivos"
          fields={[
            { label: 'Meta principal', value: 'Maratona de São Paulo — sub-4h30' },
            { label: 'Motivação declarada', value: 'Primeira maratona' },
          ]}
        />
        <Card className="border-warning/40">
          <CardHeader className="pb-2"><CardTitle className="text-warning-foreground/90">Lesões declaradas</CardTitle></CardHeader>
          <CardContent>
            <Badge variant="warning" className="mb-2">Atenção — revisar</Badge>
            <p className="text-xs text-muted-foreground">Relatou episódio de canelite há 4 meses, sem acompanhamento profissional recente. Sono irregular nos últimos dias (ver Perfil 360°).</p>
          </CardContent>
        </Card>
        <FormBlockCard
          title="Rotina e equipamentos"
          fields={[
            { label: 'Rotina de sono', value: 'Irregular (5–7h)' },
            { label: 'Tênis principal', value: 'Trocado há 2 meses' },
          ]}
        />
      </div>

      <Card className="mt-3">
        <CardHeader className="pb-2"><CardTitle>Consentimentos</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-xs">
          <Badge variant="success">Termos de uso aceitos</Badge>
          <Badge variant="success">Compartilhamento com treinador autorizado</Badge>
          <Badge variant="muted">Compartilhamento com equipe multidisciplinar — não solicitado</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
