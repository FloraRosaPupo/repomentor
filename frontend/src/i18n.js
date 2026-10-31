export const translations = {
  pt: {
    // Top Skip Link & Navigation
    skipLink: "Ir para as issues",
    brandPreview: "PRÉVIA",
    projectLink: "O projeto ↗",
    provider: "GEMMA 4 × GOOGLE CLOUD",
    themeToggleDark: "🌙 Modo Escuro",
    themeToggleLight: "☀️ Modo Claro",
    themeToggleAria: "Alternar tema claro/escuro",
    langToggleAria: "Alternar idioma português/inglês",

    // Hero Section
    heroEyebrow: "SEU PRIMEIRO PASSO NO OPEN SOURCE",
    heroTitle1: "Grandes projetos.",
    heroTitle2: "Um começo ",
    heroTitleEm: "possível.",
    heroIntro:
      "Entenda uma issue, descubra onde investigar e encontre seu caminho para contribuir. Com contexto, não só uma lista de tarefas.",
    heroExploreLink: "Explore as oportunidades",

    // Hero Map Card
    mapTitle: "SEU MAPA DE CONTRIBUIÇÃO",
    mapDefaultRepo: "seu próximo projeto",
    mapUniverse: "Um universo para explorar",
    mapStep1Title: "Entenda o contexto",
    mapStep1Sub: "Arquitetura + documentação",
    mapStep2Title: "Encontre uma issue",
    mapStep2Sub: "Dificuldade + evidências",
    mapStep3Title: "Construa seu caminho",
    mapStep3Sub: "Um guia para começar",
    mapNote: "Menos “por onde começo?”. Mais contribuição.",

    // Principles
    principle1: "Dados reais do GitHub",
    principle2: "Evidências verificáveis",
    principle3: "Você no controle",

    // Workspace Heading
    workspaceEyebrow: "REPOSITÓRIO EM FOCO",
    workspaceTitle: "Encontre seu projeto",
    workspaceSubtitle:
      "Até 30 issues abertas, ordenadas por atualização. A análise acontece quando você escolher.",
    btnFetching: "Buscando no GitHub…",
    btnRefreshIssues: "Atualizar issues ↻",
    btnLoadIssues: "Carregar issues ↗",

    // Connection status
    connectingBackend: "Conectando ao backend…",
    gemmaConfigured: "Gemma configurado · conexão será verificada ao analisar",
    gemmaWaiting:
      "Explore as issues agora. A análise por IA aguarda a configuração do Gemma.",
    howToEnable: "Como habilitar",
    howToEnableDesc:
      "Preencha no arquivo .env do backend: {missing}. Configure a autenticação Google Cloud e reinicie o backend. Nenhum segredo deve ir para o frontend.",

    // Repository Picker
    pickerTitle: "Qual projeto você quer explorar?",
    pickerSubtitle:
      "Cole a URL de um repositório público ou digite organização/repositório.",
    badgePublicGithub: "GITHUB PÚBLICO",
    repoLabel: "Repositório GitHub",
    repoPlaceholder: "https://github.com/organização/repositório",
    repoSubmitBusy: "Aguarde…",
    repoSubmit: "Cadastrar e explorar ↗",
    repoNote:
      "Exemplo: https://github.com/meteor/meteor ou meteor/meteor. Salvo somente neste navegador; apenas repositórios públicos.",
    storageNotice:
      "O navegador não permitiu salvar. Seus repositórios ficam disponíveis somente nesta sessão.",
    savedReposTitle: "Seus repositórios",
    removeRepoAria: "Remover {name} dos salvos",
    suggestionsSummary: "Não sabe por onde começar? Explore estas sugestões",
    suggestionsIntro:
      "Seleção por perfil de contribuição, não um ranking. Estrelas indicam popularidade; não garantem facilidade ou uma issue disponível.",
    btnExplore: "Explorar →",
    guideLink: "Guia ↗",

    // Repo suggestions
    suggestions: [
      {
        name: "firstcontributions/first-contributions",
        label: "Sua primeira contribuição",
        detail:
          "Pratique o fluxo de fork, commit e pull request com um tutorial dedicado a iniciantes.",
        source: "https://github.com/firstcontributions/first-contributions",
      },
      {
        name: "freeCodeCamp/freeCodeCamp",
        label: "Educação e desenvolvimento web",
        detail:
          "Explore currículo, plataforma e documentação. Consulte o guia de contribuição antes de escolher uma issue.",
        source: "https://contribute.freecodecamp.org/getting-started/",
      },
      {
        name: "microsoft/vscode",
        label: "Ferramentas para desenvolvedores",
        detail:
          "Projeto amplo com oportunidades sinalizadas como good first issue. O setup pode exigir mais experiência.",
        source: "https://github.com/microsoft/vscode/contribute",
      },
    ],

    // Active Repository Stats
    stars: "estrelas",
    archived: "Arquivado",

    // Issue List
    opportunities: "Oportunidades",
    searchLabel: "Buscar por título, número ou label",
    searchPlaceholder: "Busque seu próximo desafio…",
    emptyListTitle: "Uma contribuição começa\ncom uma boa pergunta.",
    emptyListDesc:
      "Cadastre um repositório ou escolha uma sugestão para carregar as issues.",
    emptySearch: "Nenhuma issue corresponde à busca.",
    emptyNoIssues: "Nenhuma issue aberta foi encontrada nesta consulta.",
    exploreIssueAction: "Explorar issue",

    // Detail Panel
    emptyDetailEyebrow: "DO CONTEXTO À CONTRIBUIÇÃO",
    emptyDetailTitle: "Seu próximo passo\nfica mais claro aqui.",
    emptyDetailDesc:
      "Escolha uma issue ao lado para conhecer o problema. O Gemma ajuda a conectar os pontos e sugere por onde começar.",
    chipTechContext: "Contexto técnico",
    chipRelatedFiles: "Arquivos relacionados",
    chipContributionGuide: "Guia de contribuição",
    emptyDetailDisclaimer:
      "Recomendações são hipóteses para revisar, não soluções garantidas.",

    // Selected Issue Details
    issueNumberEyebrow: "ISSUE #{number}",
    viewOnGithub: "Ver no GitHub ↗",
    originalDescription: "Descrição original",
    noDescription: "Esta issue não tem descrição.",
    btnAnalyzing: "Gemma está analisando…",
    btnReanalyze: "Analisar novamente ↗",
    btnAnalyze: "Analisar com Gemma ↗",
    btnPreparingGuide: "Preparando seu guia…",
    btnCreateGuide: "Criar guia de contribuição",
    progressMessage:
      "Coletando contexto e consultando o Gemma no Google Cloud. Isso pode levar alguns minutos.",

    // Result & Evidence
    ariaGuide: "Guia de contribuição",
    ariaAnalysis: "Análise da issue",
    guideHeading: "Seu caminho para contribuir",
    analysisHeading: "O que o Gemma encontrou",
    suggestedSteps: "Passos sugeridos",
    howToVerify: "Como verificar",
    maintainerQuestions: "Perguntas para os mantenedores",
    projectContext: "Contexto do projeto",
    whyDifficulty: "Por que essa dificuldade?",
    filesToInvestigate: "Arquivos para investigar",
    noEvidence: "Nenhum caminho foi comprovado no contexto consultado.",
    verifiedPath: "Caminho verificado · relação com a issue é uma hipótese",
    limitationsHeading: "Limitações e revisão",
    limitationsDisclaimer:
      "Orientação por IA, ainda sem revisão humana. Nenhum código ou teste do repositório foi executado.",
    cachedResult: "resultado em cache",
    contextCommit: "Contexto: {hash} ↗",

    // Difficulties
    difficulty: {
      beginner: "Iniciante",
      intermediate: "Intermediária",
      advanced: "Avançada",
      unclear: "Ainda incerta",
    },

    // Errors & Toast
    toastErrorTitle: "Não foi possível continuar",
    toastCloseAria: "Fechar notificação",
    errBackend: "Não foi possível acessar o backend.",
    errIssues: "Não foi possível carregar as issues.",
    errTimeout: "A análise demorou além do limite. Tente novamente.",

    // Footer
    footerSlogan: "Feito para quem quer dar o primeiro passo.",
    footerNote: "GitHub somente leitura · IA no Google Cloud",
  },
  en: {
    // Top Skip Link & Navigation
    skipLink: "Skip to issues",
    brandPreview: "PREVIEW",
    projectLink: "The project ↗",
    provider: "GEMMA 4 × GOOGLE CLOUD",
    themeToggleDark: "🌙 Dark Mode",
    themeToggleLight: "☀️ Light Mode",
    themeToggleAria: "Toggle light/dark theme",
    langToggleAria: "Toggle Portuguese/English language",

    // Hero Section
    heroEyebrow: "YOUR FIRST STEP INTO OPEN SOURCE",
    heroTitle1: "Great projects.",
    heroTitle2: "A feasible ",
    heroTitleEm: "start.",
    heroIntro:
      "Understand an issue, discover where to investigate, and find your path to contribute. With context, not just a task list.",
    heroExploreLink: "Explore opportunities",

    // Hero Map Card
    mapTitle: "YOUR CONTRIBUTION MAP",
    mapDefaultRepo: "your next project",
    mapUniverse: "A universe to explore",
    mapStep1Title: "Understand context",
    mapStep1Sub: "Architecture + docs",
    mapStep2Title: "Find an issue",
    mapStep2Sub: "Difficulty + evidence",
    mapStep3Title: "Build your path",
    mapStep3Sub: "A guide to get started",
    mapNote: "Less “where do I start?”. More contribution.",

    // Principles
    principle1: "Real GitHub data",
    principle2: "Verifiable evidence",
    principle3: "You in control",

    // Workspace Heading
    workspaceEyebrow: "REPOSITORY IN FOCUS",
    workspaceTitle: "Find your project",
    workspaceSubtitle:
      "Up to 30 open issues, sorted by recent activity. Analysis runs whenever you choose.",
    btnFetching: "Fetching from GitHub…",
    btnRefreshIssues: "Refresh issues ↻",
    btnLoadIssues: "Load issues ↗",

    // Connection status
    connectingBackend: "Connecting to backend…",
    gemmaConfigured: "Gemma configured · connection will be verified upon analysis",
    gemmaWaiting:
      "Explore issues now. AI analysis awaits Gemma configuration.",
    howToEnable: "How to enable",
    howToEnableDesc:
      "Set in backend .env file: {missing}. Configure Google Cloud authentication and restart the backend. No secrets should be sent to the frontend.",

    // Repository Picker
    pickerTitle: "Which project would you like to explore?",
    pickerSubtitle:
      "Paste the URL of a public repository or type organization/repository.",
    badgePublicGithub: "PUBLIC GITHUB",
    repoLabel: "Repositório GitHub",
    repoPlaceholder: "https://github.com/organization/repository",
    repoSubmitBusy: "Please wait…",
    repoSubmit: "Cadastrar e explorar ↗",
    repoNote:
      "Example: https://github.com/meteor/meteor or meteor/meteor. Saved only in this browser; public repositories only.",
    storageNotice:
      "The browser did not allow storage. Your repositories remain available only for this session.",
    savedReposTitle: "Your repositories",
    removeRepoAria: "Remover {name} dos salvos",
    suggestionsSummary: "Don't know where to start? Explore these suggestions",
    suggestionsIntro:
      "Curated by contribution profile, not a popularity rank. Stars show popularity; they don't guarantee ease or available issues.",
    btnExplore: "Explorar →",
    guideLink: "Guide ↗",

    // Repo suggestions
    suggestions: [
      {
        name: "firstcontributions/first-contributions",
        label: "Your first contribution",
        detail:
          "Practice fork, commit, and pull request workflows with a dedicated beginner tutorial.",
        source: "https://github.com/firstcontributions/first-contributions",
      },
      {
        name: "freeCodeCamp/freeCodeCamp",
        label: "Education & web development",
        detail:
          "Explore curriculum, platform, and docs. Review the contribution guidelines before picking an issue.",
        source: "https://contribute.freecodecamp.org/getting-started/",
      },
      {
        name: "microsoft/vscode",
        label: "Developer tools",
        detail:
          "Broad project with good first issue opportunities. Setup may require more experience.",
        source: "https://github.com/microsoft/vscode/contribute",
      },
    ],

    // Active Repository Stats
    stars: "stars",
    archived: "Archived",

    // Issue List
    opportunities: "Opportunities",
    searchLabel: "Search by title, number or label",
    searchPlaceholder: "Search for your next challenge…",
    emptyListTitle: "A contribution starts\nwith a good question.",
    emptyListDesc: "Add a repository or pick a suggestion to load issues.",
    emptySearch: "No issues match your search.",
    emptyNoIssues: "No open issues found in this query.",
    exploreIssueAction: "Explore issue",

    // Detail Panel
    emptyDetailEyebrow: "FROM CONTEXT TO CONTRIBUTION",
    emptyDetailTitle: "Your next step\nbecomes clearer here.",
    emptyDetailDesc:
      "Select an issue on the left to learn about the problem. Gemma helps connect the dots and suggests where to begin.",
    chipTechContext: "Technical context",
    chipRelatedFiles: "Related files",
    chipContributionGuide: "Contribution guide",
    emptyDetailDisclaimer:
      "Recommendations are hypotheses to review, not guaranteed solutions.",

    // Selected Issue Details
    issueNumberEyebrow: "ISSUE #{number}",
    viewOnGithub: "View on GitHub ↗",
    originalDescription: "Original description",
    noDescription: "This issue has no description.",
    btnAnalyzing: "Gemma está analisando…",
    btnReanalyze: "Analyze again ↗",
    btnAnalyze: "Analisar com Gemma ↗",
    btnPreparingGuide: "Preparing your guide…",
    btnCreateGuide: "Create contribution guide",
    progressMessage:
      "Collecting context and consulting Gemma on Google Cloud. This might take a few minutes.",

    // Result & Evidence
    ariaGuide: "Contribution guide",
    ariaAnalysis: "Issue analysis",
    guideHeading: "Your path to contribute",
    analysisHeading: "What Gemma found",
    suggestedSteps: "Suggested steps",
    howToVerify: "How to verify",
    maintainerQuestions: "Questions for maintainers",
    projectContext: "Project context",
    whyDifficulty: "Why this difficulty?",
    filesToInvestigate: "Files to investigate",
    noEvidence: "No paths were proven in the consulted context.",
    verifiedPath: "Verified path · relationship with issue is a hypothesis",
    limitationsHeading: "Limitations and review",
    limitationsDisclaimer:
      "AI-guided assistance, pending human review. No repository code or test was executed.",
    cachedResult: "cached result",
    contextCommit: "Context: {hash} ↗",

    // Difficulties
    difficulty: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      unclear: "Still unclear",
    },

    // Errors & Toast
    toastErrorTitle: "Unable to continue",
    toastCloseAria: "Fechar notificação",
    errBackend: "Could not connect to backend.",
    errIssues: "Could not load issues.",
    errTimeout: "Analysis timed out. Please try again.",

    // Footer
    footerSlogan: "Built for those ready to take their first step.",
    footerNote: "Read-only GitHub · AI on Google Cloud",
  },
};
