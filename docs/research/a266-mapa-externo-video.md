Com base na análise detalhada do vídeo que demonstra a plataforma "Groov" (apresentada por Ryan Glick), aqui está a extração das informações solicitadas e as recomendações para a gestão de mapas de lotes.

### (A) Dados que aparecem em uma visualização externa (Pública)
A interface pública, embutida no site do loteador (demonstrada através do site fictício "Copper Creek"), exibe os seguintes dados para os visitantes:
*   **Status de Disponibilidade:** Indicado por cores no mapa e rótulos de texto (ex: *For Sale* / À venda, *Pending* / Pendente, *Sold* / Vendido, *Reserved* / Reservado).
*   **Identificação do Lote:** Número da propriedade, Bloco e Fase (ex: "Property 1, Block 1, Copper Creek - Plat 1").
*   **Preço:** Valor de tabela do lote (ex: "$92,000").
*   **Mídia:** Fotos reais ou projeções do lote específico.
*   **Detalhes da Propriedade (Property Details):**
    *   Tamanho (ex: 0.21 acres).
    *   Grau/Topografia (ex: *Daylight*, *Standard*).
    *   Infraestrutura (ex: Água da cidade, Esgoto da cidade).
    *   Características (ex: *Cul-de-sac* / Rua sem saída).
    *   Localização (Condado, Cidade, Distrito Escolar).
*   **Documentos:** PDFs para download (ex: Diretrizes de Design do Loteamento).

*Formulação do vídeo:* *"Um comprador chega na página da sua comunidade, vê cada lote, clica no que gosta e obtém o preço, o status, as fotos, os detalhes e, em seguida, entra em contato."*

### (B) Ações: Consulta vs. Reserva, Venda ou Captação
A interface pública atua estritamente como uma ferramenta de **consulta** e **captação de leads qualificados**.
*   **Consulta:** O usuário pode navegar, filtrar e visualizar todas as informações públicas de forma autônoma.
*   **Captação:** Não há botão de "Comprar agora" ou "Pagar reserva" no mapa. O objetivo é fazer com que o cliente entre em contato com a equipe de vendas já sabendo o que quer.
*   **Venda/Reserva:** Estas ações ocorrem exclusivamente no *backend* (sistema interno), operado pela equipe do loteador.

*Formulação do vídeo:* *"Você não está tentando receber menos ligações, você quer ligações melhores. Um comprador que aparece já sabendo que quer o lote 14 é uma conversa completamente diferente de 'Ei, o que ainda está disponível?'. É o mesmo telefone tocando, mas é um lead muito melhor."*

### (C) Elementos de mapa, filtros e páginas de detalhe
*   **Elementos do Mapa:** Utiliza uma base de mapa interativa (aparentemente Mapbox/OpenStreetMap) com polígonos coloridos sobrepostos representando os lotes. Os lotes possuem marcadores circulares com cores correspondentes ao status (Verde = Disponível, Roxo = Pendente, Vermelho = Vendido).
*   **Filtros (Widget lateral):** Os usuários podem refinar a busca usando os seguintes parâmetros:
    *   *Status* (Qualquer, À venda, Pendente, Vendido, Reservado).
    *   *Grade* (Topografia/Tipo).
    *   *Min / Max Acres* (Tamanho).
    *   *Min / Max Price* (Preço).
*   **Páginas de Detalhe:** Ao clicar em um lote, um painel lateral ou *pop-up* se abre mostrando a foto em destaque (que pode ser ampliada), o preço em fonte grande, abas para "Detalhes da Propriedade" e "Documentos", e uma lista estruturada de características.

### (D) Indicação de segurança, atualização ou sincronização
O grande apelo da ferramenta é a **sincronização em tempo real** entre o banco de dados interno e o site público, eliminando a necessidade de atualizar planilhas ou PDFs manualmente.
*   **Atualização:** O apresentador demonstra a mudança do Lote 6 de "For Sale" para "Pending" no painel de controle interno. Ao salvar, ele imediatamente recarrega a página pública e o lote já aparece como "Pending".
*   **Analytics:** O sistema rastreia silenciosamente a interação do usuário público (impressões, cliques, lotes mais populares) e envia esses dados para o painel de relatórios interno do loteador.

*Formulação do vídeo:* *"Você pode atualizar seu site sem nunca tocar em uma planilha ou atualizar manualmente um PDF... Você faz a alteração no back-end e ela é atualizada instantaneamente no seu site através do mapa."*

### (E) Riscos de expor dados internos, preço, estados ou informações de clientes
Embora o vídeo mostre um sistema que divide bem o *frontend* do *backend*, a má configuração de plataformas desse tipo apresenta riscos graves:
*   **Exposição de PII (Informações Pessoais Identificáveis):** No minuto 02:50, o vídeo mostra a aba interna "Sales" com nomes reais de compradores (ex: Ashley Anderson, Marcus Bell). Se a API que alimenta o mapa público enviar o objeto de dados completo (mesmo que oculto na interface visual), hackers podem inspecionar o código da página e roubar dados de clientes.
*   **Preço Negociado vs. Preço de Tabela:** O sistema interno pode conter o valor real pelo qual o lote foi fechado, que muitas vezes é diferente do preço público. Expor isso destrói o poder de negociação do loteador.
*   **Estratégia de Negócios:** O painel interno mostra "Takedown Schedules" (cronogramas de aquisição por construtoras) e o valor total do funil de vendas. O vazamento desses dados expõe a saúde financeira e a estratégia do loteamento para concorrentes.

---

### Recomendações para separar a projeção externa do estoque interno

Para garantir que um sistema interativo de lotes seja seguro e eficiente, recomenda-se a seguinte arquitetura e governança:

1.  **Desacoplamento de Dados (API Segura):**
    *   A comunicação entre o banco de dados interno e o mapa do site deve ser feita via uma API estrita. A API **só deve retornar os campos estritamente necessários para a renderização pública** (ID do lote, coordenadas geométricas, preço de tabela, status público, fotos).
    *   Nunca envie o "Objeto Lote" completo do banco de dados para o navegador do usuário. Dados como *Nome do Comprador*, *Preço Negociado*, *Data do Contrato* e *Notas Internas* devem ser filtrados no servidor antes de chegar à internet.
2.  **Mapeamento de Status Seguro (Camuflagem de Estoque):**
    *   Crie uma camada de tradução de status. Por exemplo, internamente um lote pode estar "Aguardando Assinatura", "Em Análise de Crédito" ou "Distratado". Para o público, o sistema deve traduzir isso apenas para macros-status simples: "Disponível" ou "Pendente".
    *   *Estratégia de Escassez:* Em grandes loteamentos, pode não ser estratégico mostrar 500 lotes verdes (disponíveis) de uma vez, pois isso tira o senso de urgência. O sistema interno deve permitir liberar "Fases" (Plats) para o mapa público gradativamente, mantendo o resto como estoque oculto.
3.  **Proteção contra Raspagem de Dados (Web Scraping):**
    *   Como os preços e disponibilidades estão públicos, concorrentes podem criar robôs para monitorar sua velocidade de vendas diariamente. Implemente *Rate Limiting* (limite de requisições) e ofuscação de código no *widget* do mapa para dificultar a extração automatizada de dados em massa.
4.  **Governança de Acessos (RBAC):**
    *   No painel interno, garanta que apenas gerentes ou diretores tenham permissão para alterar o preço de tabela que reflete no site. Corretores devem ter permissão apenas para solicitar a mudança de status para "Pendente" ao iniciar um processo de venda, sujeito a aprovação.