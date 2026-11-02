import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormBlockCard } from '@/components/shared/FormBlockCard'
import { ChecklistCard } from '@/components/shared/ChecklistCard'
import { Button } from '@/components/ui/button'
import { orgOnboardingChecklist, currentOrg } from '@/data/mock'

export default function OrgOnboardingPage() {
  return (
    <div>
      <PageHeader
        code="RW-COACH-SCREEN-000A"
        title="Onboarding da Organização/Assessoria"
        objective="Criar o contêiner institucional de usuários, atletas, metodologia, dados, marca, integrações e permissões. Nenhum treinador pode ser convidado antes da organização válida (RN-026)."
        scope="V0"
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => toast.info('Rascunho salvo (simulado)')}>Salvar rascunho</Button>
            <Button size="sm" onClick={() => toast.success('Organização criada — organization_id gerado (simulado)')}>Criar organização</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <FormBlockCard
            title="Identificação"
            fields={[
              { label: 'Razão social', value: 'Vértice Endurance Assessoria Esportiva Ltda.' },
              { label: 'Nome fantasia', value: currentOrg.name },
              { label: 'CNPJ', value: '48.211.903/0001-07' },
              { label: 'E-mail institucional', value: 'contato@verticeendurance.com.br' },
              { label: 'Telefone', value: '(11) 99887-2201' },
              { label: 'Site', value: 'verticeendurance.com.br' },
            ]}
          />
          <FormBlockCard
            title="Estrutura"
            fields={[
              { label: 'Tipo de operação', value: 'Assessoria multi-modalidade' },
              { label: 'Unidades', value: 'São Paulo (matriz), Curitiba' },
              { label: 'Modalidades', value: 'Corrida de rua, Trail, Triathlon' },
              { label: 'Atletas estimados', value: `${currentOrg.athletesCount}` },
            ]}
          />
          <FormBlockCard
            title="Responsáveis"
            fields={[
              { label: 'Responsável legal', value: 'Otávio Ferraz' },
              { label: 'Diretor técnico', value: 'Otávio Ferraz' },
              { label: 'Administrador principal', value: 'Marina Petrucci' },
            ]}
          />
          <FormBlockCard
            title="Privacidade"
            fields={[
              { label: 'Base legal (LGPD)', value: 'Consentimento + execução de contrato' },
              { label: 'DPO / contato', value: 'privacidade@verticeendurance.com.br' },
              { label: 'Retenção', value: 'Exclusão lógica por padrão, conforme D-004' },
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <ChecklistCard title="Checklist institucional" steps={orgOnboardingChecklist} />
        </div>
      </div>
    </div>
  )
}
