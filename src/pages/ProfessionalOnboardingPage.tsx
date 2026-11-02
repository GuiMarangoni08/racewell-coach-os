import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormBlockCard } from '@/components/shared/FormBlockCard'
import { ChecklistCard } from '@/components/shared/ChecklistCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { professionalOnboardingChecklist } from '@/data/mock'

export default function ProfessionalOnboardingPage() {
  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-000B"
        title="Onboarding do Treinador/Profissional"
        objective="Cadastrar o profissional, validar identidade, experiência, modalidades e vínculo institucional. O vínculo fica pendente até validação e aprovação (RN-027/RN-028)."
        scope="V0"
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => toast.info('Rascunho salvo (simulado)')}>Salvar rascunho</Button>
            <Button size="sm" onClick={() => toast.success('Enviado para validação administrativa (simulado)')}>Enviar para validação</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <FormBlockCard
            title="Identidade"
            fields={[
              { label: 'Nome completo', value: 'Renata Coutinho' },
              { label: 'E-mail', value: 'renata.coutinho@email.com' },
              { label: 'Telefone', value: '(41) 98765-1122' },
            ]}
          />
          <FormBlockCard
            title="Registro profissional"
            fields={[
              { label: 'CREF', value: '032145-G/PR' },
              { label: 'Validade', value: '2028-03-01' },
            ]}
          />
          <FormBlockCard
            title="Experiência"
            fields={[
              { label: 'Anos de experiência', value: '6' },
              { label: 'Modalidades', value: 'Corrida de rua, Trail' },
              { label: 'Nível de atletas atendidos', value: 'Iniciante a intermediário' },
            ]}
          />
          <FormBlockCard
            title="Capacidade e vínculo"
            fields={[
              { label: 'Capacidade máxima de atletas', value: '25' },
              { label: 'Organização', value: 'Assessoria Vértice Endurance' },
              { label: 'Superior responsável', value: 'Otávio Ferraz (Diretor Técnico)' },
              { label: 'Nível proposto', value: 'Nível 1 — Treinador' },
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <ChecklistCard title="Checklist do profissional" steps={professionalOnboardingChecklist} />
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground/80">
            <Badge variant="warning" className="mb-2">Regra RN-028</Badge>
            <p>Indicadores e IA podem recomendar revisão de nível, mas nunca alteram permissões automaticamente — a nomeação é sempre institucional.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
