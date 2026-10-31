# Decisão: Google Cloud + Gemma 4

Decisão registrada em 31/10/2026 a pedido da autora. Substitui a proposta inicial de acesso pela Gemini API no documento de origem.

## Arquitetura planejada

Frontend React → backend FastAPI → endpoint Gemma 4 no Vertex AI.

O backend também consulta a API do GitHub para o repositório público selecionado, monta o contexto e valida as evidências. A implantação da aplicação web será definida na etapa de infraestrutura; Cloud Run é uma opção, ainda não provisionada.

A documentação oficial confirma a implantação de Gemma 4 em endpoints próprios do Vertex AI pelo Model Garden. Isso envolve provisionamento de recursos, e não deve ser confundido com acesso automático por uma chave da Gemini API.

Fonte: [Gemma 4 no Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/gemma-4-available-on-google-cloud).

## Configuração proposta

Ver `.env.example`. Os campos são consumidos pelo backend em `backend/app/config.py`.

- Projeto, região e endpoint precisam ser definidos na conta da autora.
- A variante candidata é 26B A4B; confirmar o identificador e suporte na região antes de implementar.
- Usar Application Default Credentials no desenvolvimento e identidade de serviço na implantação.
- Não versionar credenciais ou expor tokens no frontend.
- Medir latência e consumo; definir limites de requisição e orçamento antes do provisionamento.
- O adaptador usa `POST /v1beta1/projects/{project}/locations/{location}/endpoints/{endpoint}/chat/completions`, com token ADC e mensagem estruturada. Confirmar a compatibilidade do endpoint implantado em uma chamada real.

Referência do contrato: [Vertex AI Chat Completions](https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/rest/v1beta1/projects.locations.endpoints.chat/completions).

## Primeiro aceite de integração

- [ ] Projeto e região definidos.
- [ ] Acesso ao modelo, quotas e recursos confirmados.
- [ ] Endpoint implantado e autenticado.
- [ ] Uma chamada real retorna resposta do Gemma 4.
- [ ] Modelo, configuração, latência e resultado registrados.
- [ ] Resposta validada e erros de autenticação, timeout e indisponibilidade tratados.

Nenhum recurso do Google Cloud foi criado nesta etapa.
