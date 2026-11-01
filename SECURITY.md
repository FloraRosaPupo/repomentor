# Segurança

## Relato de vulnerabilidades

Em 01/11/2026, a consulta à configuração do GitHub retornou relato privado de vulnerabilidades **desativado** neste repositório. Não há neste documento um e-mail de segurança confirmado ou SLA de atendimento.

Não publique segredos, dados pessoais, detalhes de exploração ou provas de conceito em issues abertas. Enquanto não houver canal privado publicado, abra somente uma solicitação genérica de contato com a mantenedora, sem descrever a vulnerabilidade, e aguarde a indicação de um canal privado verificado. Se o botão de relato privado passar a aparecer na aba Security do GitHub, use esse canal. A habilitação e o anúncio do canal dependem de decisão da mantenedora.

Em um canal privado confirmado, inclua versão/commit, componente afetado, impacto, passos mínimos de reprodução com dados fictícios e possíveis mitigadores. A divulgação pública deve ser coordenada após análise; não há promessa de prazo ou recompensa.

## Credenciais

Tokens ficam no backend: `.env` local ignorado pelo Git ou variáveis secretas do ambiente hospedado. Não envie chaves em issues, PRs, chats, capturas ou arquivos estáticos. Variáveis com prefixo `VITE_` podem chegar ao navegador e não devem conter segredos.

Se uma chave for exposta, revogue-a no emissor e substitua-a nos ambientes afetados. Remover o texto ou apagar um commit não invalida a credencial. A rotação no serviço hospedado exige aplicar a nova configuração ao processo/deploy e verificar o funcionamento sem imprimir a chave.

## Limites atuais

O backend consulta repositórios públicos, valida entradas, limita contexto e valida o JSON do modelo. Evidências são filtradas pelos caminhos coletados. Isso não garante a correção da interpretação da IA nem elimina riscos de prompt injection.

Autenticação de usuários e limites distribuídos contra abuso não estão implementados. Cache e bloqueio de concorrência são por processo. Não trate esses mecanismos como controle global de gastos. Quem hospeda uma instância com chave paga deve avaliar e configurar controles de acesso e consumo antes de oferecê-la publicamente.

Não há programa formal de versões de segurança suportadas. Ao relatar um problema, identifique o commit; não presuma que uma versão antiga recebe correções. Dependências e modelos têm seu próprio ciclo de atualização. Não há certificação de segurança declarada pelo projeto.

Referências internas: [configuração](docs/ENVIRONMENT.md), [API e limites](docs/API.md), [governança](GOVERNANCE.md).
