const states = {
  empty: {
    title: "Sem issues abertas. O projeto continua disponível.",
    text: "Este repositório não tem issues abertas no momento. Você ainda pode entender seu propósito, conhecer a arquitetura e estudar os arquivos antes de contribuir.",
  },
  disabled: {
    title: "As issues estão desativadas neste projeto.",
    text: "Os mantenedores podem usar outro canal para acompanhar tarefas. Explore a documentação para conhecer o processo de contribuição; a análise do repositório continua disponível.",
  },
  limited: {
    title: "Nenhuma issue apareceu nesta amostra.",
    text: "A consulta tem um limite de páginas e pode ter encontrado apenas pull requests. Isso não significa que o projeto não tenha issues. Confira a lista completa no GitHub ou explore sua arquitetura.",
  },
};

export default function RepositoryEmptyState({
  repository,
  state,
  configured,
}) {
  const content = states[state] ?? states.empty;
  return (
    <div className="empty-detail repository-empty">
      <div className="compass" aria-hidden="true">
        ↗
      </div>
      <p className="eyebrow">REPOSITÓRIO CARREGADO</p>
      <h3>{content.title}</h3>
      <p>{content.text}</p>
      <div className="empty-chips">
        <span>Documentação</span>
        <span>Tecnologias</span>
        <span>Arquitetura</span>
      </div>
      <p>
        {configured
          ? "Use “Conhecer o repositório com Gemma” para receber um roteiro de aprendizado sem precisar selecionar uma issue."
          : "Você já pode explorar os arquivos no GitHub. O roteiro por IA ficará disponível quando o Gemma estiver configurado."}
      </p>
      <div className="empty-actions">
        <a
          className="secondary"
          href={`https://github.com/${repository}`}
          target="_blank"
          rel="noreferrer"
        >
          Explorar os arquivos ↗
        </a>
        {state !== "disabled" && (
          <a
            href={`https://github.com/${repository}/issues`}
            target="_blank"
            rel="noreferrer"
          >
            Ver issues no GitHub ↗
          </a>
        )}
        <a href="#repository-url">Escolher outro repositório ↑</a>
      </div>
      <small>
        A ausência de issues não é um erro. O RepoMentor não inventa tarefas
        para preencher a lista.
      </small>
    </div>
  );
}
