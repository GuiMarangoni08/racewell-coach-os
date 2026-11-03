# Coach OS — operação local do frontend

Primeira camada operacional React/Vite conectada ao contrato real `/coach/v1` do backend Racewell. As páginas conectadas não usam `src/data/mock.ts`: ausência de dados, erro, conflito e operação futura são estados explícitos.

## Executar localmente

`VITE_API_URL` deve ser a origem HTTP da API, sem `/auth` ou `/coach/v1`. Nunca coloque segredos em variáveis `VITE_*`, pois elas entram no bundle.

```bash
export VITE_API_URL=http://127.0.0.1:3333
npm run dev -- --host 127.0.0.1
npm test
npm run build
```

A aplicação usa `HashRouter`; as rotas aparecem como `/#/login`, `/#/atletas` e similares.

Fixtures locais fornecidas pelo backend Docker:

- treinador Aurora: `coach-os-2@example.test`
- atleta Aurora: `coach-os-3@example.test`
- senha pública exclusiva das fixtures: `CoachOsLocal!2026`

Não reutilize essas credenciais fora do banco local descartável.

## Autenticação e organização

- `POST /auth/login` segue o contrato legado `{message,token,userId}`.
- `GET /auth/me` valida a sessão e fornece a identidade atual.
- O bearer token fica em memória e em `sessionStorage`; não existe refresh token ativo nesta versão.
- `GET /coach/v1/context` retorna `organizations[]` e `athleteOrganizations[]`.
- A UI nunca escolhe silenciosamente a primeira organização. O usuário seleciona um contexto disponível; a seleção fica em `sessionStorage` e é revalidada a cada carregamento.
- Chamadas operacionais enviam `X-Organization-Id`; o backend continua sendo a autoridade e valida membership, matrícula e vínculo coach–atleta.

## Contrato operacional consumido

Todas as respostas Coach OS usam `{data: ...}` e nomes camelCase.

| Método e caminho | Uso |
|---|---|
| `GET /coach/v1/context` | Organizações acessíveis ao usuário |
| `GET /coach/v1/athletes?limit=&offset=` | Carteira autorizada |
| `GET /coach/v1/week?athleteId=&weekStart=` | Semana e documentos atuais |
| `POST /coach/v1/week` | Cria ou obtém uma semana |
| `GET /coach/v1/workouts/:id` | Documento de treino atual |
| `POST /coach/v1/workouts` | `{athleteId,date,content}` |
| `PUT /coach/v1/workouts/:id` | `{rowVersion,content,date?}` com CAS |
| `POST /coach/v1/workouts/:id/archive` | Arquiva com `{rowVersion}` |
| `GET /coach/v1/templates?limit=&offset=` | Biblioteca da organização |
| `POST /coach/v1/templates` | Cria `{content}` |
| `PUT /coach/v1/templates/:id` | Atualiza `{rowVersion,content}` |
| `POST /coach/v1/templates/:id/copy` | Copia com `{athleteId,date}` |
| `POST /coach/v1/publish` | Publica `{weekId,rowVersion}` com `Idempotency-Key` |

Não existe `GET /workouts`, `/weeks`, `PATCH /workouts`, publicação de documento individual ou cópia via `template_id`. Treinos são listados dentro da resposta de `/week`. Mover para outra semana é desabilitado com aviso; o contrato exige arquivar e criar/copiar no destino.

## Conteúdo e versionamento

O editor envia JSONB v1: `schemaVersion:1`, título, tipo e blocos estritos. Pace é inteiro em segundos por quilômetro; distâncias são metros e durações são segundos. O cliente rejeita conteúdo incompatível antes da requisição, mas o backend revalida tudo.

Documento e semana têm `rowVersion` independentes. Conflitos 409 não são sobrescritos nem repetidos automaticamente. Publicação acontece somente no nível da semana e cria snapshot imutável para o atleta.

## Telas

- Login e restauração da sessão.
- Seleção explícita de organização.
- Carteira de atletas autorizados.
- Editor de treino com blocos JSONB v1 e optimistic concurrency.
- Planejamento semanal e publicação imutável da semana.
- Biblioteca real de templates e cópia dedicada.
- Calendário carregado por semana; movimento na mesma semana usa o `PUT` integral e movimento entre semanas é bloqueado honestamente.
- Demais telas do protótipo são marcadas como futuras e não se apresentam como operacionais.

## Gates verificados em 2 de novembro de 2026

- `npm test`: **23/23** testes aprovados.
- `npm run build`: TypeScript e bundle Vite aprovados; 1.699 módulos transformados.
- Os testes cobrem adapters estritos, conteúdo JSONB, unidades, contexto sem seleção implícita, contrato completo do repository, CAS/conflitos, publicação idempotente e ausência de endpoints inventados.
- A API e PostgreSQL locais estão disponíveis em `127.0.0.1:3333` e `127.0.0.1:55432` para o gate E2E de navegador.

## Limitações antes de Preview/produção

Ainda faltam validação de navegador do fluxo completo, refresh/logout revogável, gestão de organizações/invites, integração Expo com `/athletes/me/week`, OAuth e integrações externas. CORS/HTTPS/cookies entre domínios e variáveis de homologação só podem ser validados no Preview. Nenhuma dessas limitações deve ser mascarada por mocks.
