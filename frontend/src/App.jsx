import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import RepositoryPicker from "./RepositoryPicker";
import Toast from "./Toast";

const difficulty = {
  beginner: "Iniciante",
  intermediate: "Intermediária",
  advanced: "Avançada",
  unclear: "Ainda incerta",
};

function Evidence({ items }) {
  return (
    <div className="evidence-list">
      {items.length ? (
        items.map((item) => (
          <div className="evidence" key={item.path}>
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.path} ↗
            </a>
            <p>{item.reason}</p>
            <small>
              Caminho verificado · relação com a issue é uma hipótese
            </small>
          </div>
        ))
      ) : (
        <p className="muted">
          Nenhum caminho foi comprovado no contexto consultado.
        </p>
      )}
    </div>
  );
}

function Result({ value, guide = false }) {
  const result = value.result;
  return (
    <article
      className="result"
      aria-label={guide ? "Guia de contribuição" : "Análise da issue"}
    >
      <div className="section-heading">
        <h3>
          {guide ? "Seu caminho para contribuir" : "O que o Gemma encontrou"}
        </h3>
        {!guide && (
          <span className="badge">{difficulty[result.difficulty]}</span>
        )}
      </div>
      <p>{result.summary}</p>
      {guide ? (
        <>
          <h4>Passos sugeridos</h4>
          <ol className="steps">
            {result.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <h4>Como verificar</h4>
          <ul>
            {result.testing_strategy.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
          {!!result.questions_for_maintainers.length && (
            <>
              <h4>Perguntas para os mantenedores</h4>
              <ul>
                {result.questions_for_maintainers.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <>
          <h4>Contexto do projeto</h4>
          <p>{result.architecture}</p>
          <h4>Por que essa dificuldade?</h4>
          <p>{result.reasoning}</p>
          <div className="tags">
            {result.required_knowledge.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </>
      )}
      <h4>Arquivos para investigar</h4>
      <Evidence items={result.evidence} />
      <details className="limitations" open>
        <summary>Limitações e revisão</summary>
        <ul>
          {result.limitations.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p>
          Orientação por IA, ainda sem revisão humana. Nenhum código ou teste do
          repositório foi executado.
        </p>
      </details>
      <div className="result-meta">
        {value.metadata.model} · {(value.metadata.elapsed_ms / 1000).toFixed(1)}{" "}
        s {value.metadata.cached ? "· resultado em cache" : ""}
        <a
          href={`https://github.com/${value.repository}/commit/${value.metadata.commit}`}
          target="_blank"
          rel="noreferrer"
        >
          Contexto: {value.metadata.commit.slice(0, 7)} ↗
        </a>
      </div>
    </article>
  );
}

export default function App() {
  const [health, setHealth] = useState(null);
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [guide, setGuide] = useState(null);
  const [repository, setRepository] = useState(null);
  const [repositoryInfo, setRepositoryInfo] = useState(null);
  const request = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    api("/health", { signal: controller.signal })
      .then(setHealth)
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(err.message || "Não foi possível acessar o backend.");
      });
    return () => {
      controller.abort();
      request.current?.abort();
    };
  }, []);

  async function load(name = repository) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy("issues");
    setError("");
    setSelected(null);
    setAnalysis(null);
    setGuide(null);
    setIssues([]);
    setLoaded(false);
    setRepository(null);
    setRepositoryInfo(null);
    setQuery("");
    try {
      const [status, data] = await Promise.all([
        api("/health", { signal: controller.signal }),
        api(`/issues?repository=${encodeURIComponent(name)}`, {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(90_000),
          ]),
        }),
      ]);
      setHealth(status);
      setIssues(data.issues);
      setLoaded(true);
      setSelected(null);
      setAnalysis(null);
      setGuide(null);
      setRepository(data.repository);
      setRepositoryInfo(data.info);
      return data;
    } catch (err) {
      if (!controller.signal.aborted)
        setError(err.message || "Não foi possível carregar as issues.");
    } finally {
      request.current = null;
      setBusy("");
    }
  }

  async function generate(kind) {
    if (!selected || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(kind);
    setError("");
    try {
      const data = await api(
        kind === "guide" ? `/issues/${selected.number}/guide` : "/analyze",
        {
          method: "POST",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(250_000),
          ]),
          body: JSON.stringify(
            kind === "guide"
              ? { repository }
              : { repository, issue_number: selected.number },
          ),
        },
      );
      if (!controller.signal.aborted) {
        if (kind === "guide") setGuide(data);
        else setAnalysis(data);
      }
    } catch (err) {
      if (!controller.signal.aborted)
        setError(
          err.name === "TimeoutError"
            ? "A análise demorou além do limite. Tente novamente."
            : err.message,
        );
    } finally {
      request.current = null;
      setBusy("");
    }
  }

  function select(issue) {
    setSelected(issue);
    setAnalysis(null);
    setGuide(null);
    setError("");
  }

  const filtered = issues.filter((issue) =>
    `${issue.title} ${issue.number} ${issue.labels.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const configured = health?.gemma.configured;
  return (
    <>
      <Toast message={error} onClose={() => setError("")} />
      <a className="skip" href="#workspace">
        Ir para as issues
      </a>
      <header className="header">
        <a className="brand" href="/" aria-label="RepoMentor início">
          <span className="brand-mark">
            r<span>m</span>
          </span>
          RepoMentor<span className="preview">PRÉVIA</span>
        </a>
        <nav aria-label="Principal">
          <a
            href="https://github.com/FloraRosaPupo/repomentor"
            target="_blank"
            rel="noreferrer"
          >
            O projeto ↗
          </a>
          <span className="provider">
            GEMMA 4 <span>×</span> GOOGLE CLOUD
          </span>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> SEU PRIMEIRO PASSO NO OPEN SOURCE
            </p>
            <h1>
              Grandes projetos.
              <br />
              Um começo <em>possível.</em>
            </h1>
            <p className="intro">
              Entenda uma issue, descubra onde investigar e encontre seu caminho
              para contribuir. Com contexto, não só uma lista de tarefas.
            </p>
            <a className="hero-link" href="#workspace">
              Explore as oportunidades <span>↓</span>
            </a>
          </div>
          <div className="map-card" aria-hidden="true">
            <div className="map-top">
              <span className="tiny-dots">● ● ●</span>
              <span>SEU MAPA DE CONTRIBUIÇÃO</span>
            </div>
            <div className="map-repo">
              <span className="meteor-icon">↗</span>
              <div>
                <strong>{repository || "seu próximo projeto"}</strong>
                <small>Um universo para explorar</small>
              </div>
              <span className="map-star">✦</span>
            </div>
            <div className="map-path">
              <div>
                <b>01</b>
                <span>
                  Entenda o contexto<small>Arquitetura + documentação</small>
                </span>
                <span>✓</span>
              </div>
              <div>
                <b>02</b>
                <span>
                  Encontre uma issue<small>Dificuldade + evidências</small>
                </span>
                <span>✓</span>
              </div>
              <div className="map-last">
                <b>03</b>
                <span>
                  Construa seu caminho<small>Um guia para começar</small>
                </span>
                <span>↗</span>
              </div>
            </div>
            <p className="map-note">
              Menos “por onde começo?”. Mais contribuição.
            </p>
          </div>
        </section>
        <div className="principles">
          <span>
            <b>01</b> Dados reais do GitHub
          </span>
          <span>
            <b>02</b> Evidências verificáveis
          </span>
          <span>
            <b>03</b> Você no controle
          </span>
        </div>
        <section
          id="workspace"
          className="workspace"
          aria-labelledby="workspace-title"
        >
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">REPOSITÓRIO EM FOCO</p>
              <h2 id="workspace-title">
                Encontre seu projeto<span>.</span>
              </h2>
              <p className="muted">
                Até 30 issues abertas, ordenadas por atualização. A análise
                acontece quando você escolher.
              </p>
            </div>
            {loaded && (
              <button
                className="primary"
                onClick={() => load(repository)}
                disabled={!!busy}
              >
                {busy === "issues"
                  ? "Buscando no GitHub…"
                  : loaded
                    ? "Atualizar issues ↻"
                    : "Carregar issues ↗"}
              </button>
            )}
          </div>
          <RepositoryPicker onLoad={load} busy={!!busy} />
          {repository && (
            <div className="active-repository">
              <div>
                <a
                  href={`https://github.com/${repository}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {repository} ↗
                </a>
                <p>{repositoryInfo?.description}</p>
              </div>
              <div className="repo-stats">
                <span>
                  ☆{" "}
                  {new Intl.NumberFormat("pt-BR").format(
                    repositoryInfo?.stars ?? 0,
                  )}{" "}
                  estrelas
                </span>
                {repositoryInfo?.language && (
                  <span>{repositoryInfo.language}</span>
                )}
                {repositoryInfo?.license && (
                  <span>{repositoryInfo.license}</span>
                )}
                {repositoryInfo?.archived && <span>Arquivado</span>}
              </div>
            </div>
          )}
          <div className="connection">
            <span className={`status-dot ${configured ? "ready" : ""}`} />
            <span>
              {!health
                ? "Conectando ao backend…"
                : configured
                  ? "Gemma configurado · conexão será verificada ao analisar"
                  : "Explore as issues agora. A análise por IA aguarda a configuração do Gemma."}
            </span>
            {health && !configured && (
              <details>
                <summary>Como habilitar</summary>
                <p>
                  Preencha no arquivo .env do backend:{" "}
                  {health.gemma.missing.join(", ")}. Configure a autenticação
                  Google Cloud e reinicie o backend. Nenhum segredo deve ir para
                  o frontend.
                </p>
              </details>
            )}
          </div>
          <div className="work-grid">
            <aside className="issue-panel" aria-label="Issues abertas">
              <div className="panel-heading">
                <h3>Oportunidades</h3>
                <span className="count">{loaded ? filtered.length : "—"}</span>
              </div>
              <label className="search">
                <span>Buscar por título, número ou label</span>
                <input
                  type="search"
                  placeholder="Busque seu próximo desafio…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={!loaded}
                />
              </label>
              <div className="issue-list">
                {!loaded ? (
                  <div className="empty-list">
                    <span>⌘</span>
                    <h4>
                      Uma contribuição começa
                      <br />
                      com uma boa pergunta.
                    </h4>
                    <p>
                      Cadastre um repositório ou escolha uma sugestão para
                      carregar as issues.
                    </p>
                  </div>
                ) : !filtered.length ? (
                  <p className="empty-message">
                    {issues.length
                      ? "Nenhuma issue corresponde à busca."
                      : "Nenhuma issue aberta foi encontrada nesta consulta."}
                  </p>
                ) : (
                  filtered.map((issue) => (
                    <button
                      className={`issue-card ${selected?.number === issue.number ? "selected" : ""}`}
                      key={issue.number}
                      disabled={!!busy}
                      aria-pressed={selected?.number === issue.number}
                      onClick={() => select(issue)}
                    >
                      <span className="issue-number">○ #{issue.number}</span>
                      <strong>{issue.title}</strong>
                      <span className="tags">
                        {issue.labels.slice(0, 3).map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </span>
                      <span className="issue-action">
                        Explorar issue <span>→</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </aside>
            <div
              className="detail-panel"
              aria-live="polite"
              aria-busy={busy === "analysis" || busy === "guide"}
            >
              {!selected ? (
                <div className="empty-detail">
                  <div className="compass">✧</div>
                  <p className="eyebrow">DO CONTEXTO À CONTRIBUIÇÃO</p>
                  <h3>
                    Seu próximo passo
                    <br />
                    fica mais claro aqui.
                  </h3>
                  <p>
                    Escolha uma issue ao lado para conhecer o problema. O Gemma
                    ajuda a conectar os pontos e sugere por onde começar.
                  </p>
                  <div className="empty-chips">
                    <span>Contexto técnico</span>
                    <span>Arquivos relacionados</span>
                    <span>Guia de contribuição</span>
                  </div>
                  <small>
                    Recomendações são hipóteses para revisar, não soluções
                    garantidas.
                  </small>
                </div>
              ) : (
                <>
                  <div className="selected-heading">
                    <span className="eyebrow">ISSUE #{selected.number}</span>
                    <a href={selected.url} target="_blank" rel="noreferrer">
                      Ver no GitHub ↗
                    </a>
                  </div>
                  <h3 className="issue-title">{selected.title}</h3>
                  <details className="description">
                    <summary>Descrição original</summary>
                    <p>{selected.body || "Esta issue não tem descrição."}</p>
                  </details>
                  <div className="actions">
                    <button
                      className="primary"
                      disabled={
                        !!busy || !configured || !health?.features.analysis
                      }
                      onClick={() => generate("analysis")}
                    >
                      {busy === "analysis"
                        ? "Gemma está analisando…"
                        : analysis
                          ? "Analisar novamente ↗"
                          : "Analisar com Gemma ↗"}
                    </button>
                    <button
                      className="secondary"
                      disabled={
                        !!busy || !configured || !health?.features.guide
                      }
                      onClick={() => generate("guide")}
                    >
                      {busy === "guide"
                        ? "Preparando seu guia…"
                        : "Criar guia de contribuição"}
                    </button>
                  </div>
                  {!!busy && busy !== "issues" && (
                    <p className="progress" role="status">
                      Coletando contexto e consultando o Gemma no Google Cloud.
                      Isso pode levar alguns minutos.
                    </p>
                  )}
                  {analysis && <Result value={analysis} />}
                  {guide && <Result value={guide} guide />}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer>
        <span className="brand">
          RepoMentor<span className="footer-dot">✦</span>
        </span>
        <p>Feito para quem quer dar o primeiro passo.</p>
        <span>GitHub somente leitura · IA no Google Cloud</span>
      </footer>
    </>
  );
}
