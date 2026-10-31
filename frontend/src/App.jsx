import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import RepositoryPicker from "./RepositoryPicker";
import Toast from "./Toast";
import { translations } from "./i18n";
import RepositoryEmptyState from "./RepositoryEmptyState";

const THEME_STORAGE = "repomentor.theme.v1";
const LANG_STORAGE = "repomentor.lang.v1";

function Evidence({ items, t }) {
  return (
    <div className="evidence-list">
      {items.length ? (
        items.map((item) => (
          <div className="evidence" key={item.path}>
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.path} ↗
            </a>
            <p>{item.reason}</p>
            <small>{t.verifiedPath}</small>
          </div>
        ))
      ) : (
        <p className="muted">{t.noEvidence}</p>
      )}
    </div>
  );
}

function Result({ value, guide = false, overview = false, t }) {
  const result = value.result;
  const difficultyLabel = t.difficulty[result.difficulty] || result.difficulty;

  return (
    <article
      className="result"
      aria-label={
        overview ? t.ariaOverview : guide ? t.ariaGuide : t.ariaAnalysis
      }
    >
      <div className="section-heading">
        <h3>
          {overview
            ? t.overviewHeading
            : guide
              ? t.guideHeading
              : t.analysisHeading}
        </h3>
        {!guide && !overview && (
          <span className="badge">{difficultyLabel}</span>
        )}
      </div>
      <p>{result.summary}</p>
      {overview ? (
        <>
          <h4>{t.overviewArchitecture}</h4>
          <p>{result.architecture}</p>
          <div className="tags">
            {result.technologies.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
          <h4>{t.overviewSteps}</h4>
          <ol className="steps">
            {result.next_steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <p className="muted">{t.overviewDisclaimer}</p>
        </>
      ) : guide ? (
        <>
          <h4>{t.suggestedSteps}</h4>
          <ol className="steps">
            {result.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <h4>{t.howToVerify}</h4>
          <ul>
            {result.testing_strategy.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
          {!!result.questions_for_maintainers.length && (
            <>
              <h4>{t.maintainerQuestions}</h4>
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
          <h4>{t.projectContext}</h4>
          <p>{result.architecture}</p>
          <h4>{t.whyDifficulty}</h4>
          <p>{result.reasoning}</p>
          <div className="tags">
            {result.required_knowledge.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </>
      )}
      <h4>{t.filesToInvestigate}</h4>
      <Evidence items={result.evidence} t={t} />
      <details className="limitations" open>
        <summary>{t.limitationsHeading}</summary>
        <ul>
          {result.limitations.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p>{t.limitationsDisclaimer}</p>
      </details>
      <div className="result-meta">
        {value.metadata.model} · {(value.metadata.elapsed_ms / 1000).toFixed(1)}{" "}
        s {value.metadata.cached ? `· ${t.cachedResult}` : ""}
        <a
          href={`https://github.com/${value.repository}/commit/${value.metadata.commit}`}
          target="_blank"
          rel="noreferrer"
        >
          {t.contextCommit.replace("{hash}", value.metadata.commit.slice(0, 7))}
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

  // Theme state: "light" or "dark"
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE);
      if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
      if (
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }
    } catch {
      // ignore storage errors
    }
    return "light";
  });

  // Language state: "pt" or "en"
  const [lang, setLang] = useState(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE);
      if (savedLang === "pt" || savedLang === "en") return savedLang;
    } catch {
      // ignore storage errors
    }
    return "pt";
  });

  const [issuesState, setIssuesState] = useState(null);
  const [overview, setOverview] = useState(null);
  const request = useRef(null);
  const t = translations[lang] || translations.pt;

  // Apply data-theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  // Apply html lang attribute and persist
  useEffect(() => {
    document.documentElement.setAttribute(
      "lang",
      lang === "en" ? "en" : "pt-BR",
    );
    try {
      localStorage.setItem(LANG_STORAGE, lang);
    } catch {
      // ignore storage errors
    }
  }, [lang]);

  useEffect(() => {
    const controller = new AbortController();
    api("/health", { signal: controller.signal })
      .then(setHealth)
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message || t.errBackend);
      });
    return () => {
      controller.abort();
      request.current?.abort();
    };
  }, [t.errBackend]);

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
    setIssuesState(null);
    setOverview(null);
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
      setIssuesState(
        data.issues_state ?? (data.issues.length ? "available" : "empty"),
      );
      return data;
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message || t.errIssues);
    } finally {
      request.current = null;
      setBusy("");
    }
  }

  async function generate(kind) {
    if (!repository || (kind !== "repository" && !selected) || request.current)
      return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(kind);
    setError("");
    if (kind === "repository") {
      setSelected(null);
      setAnalysis(null);
      setGuide(null);
    }
    try {
      const data = await api(
        kind === "repository"
          ? "/repository/analyze"
          : kind === "guide"
            ? `/issues/${selected.number}/guide`
            : "/analyze",
        {
          method: "POST",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(250_000),
          ]),
          body: JSON.stringify(
            kind !== "analysis"
              ? { repository, language: lang }
              : { repository, issue_number: selected.number, language: lang },
          ),
        },
      );
      if (!controller.signal.aborted) {
        if (kind === "repository") setOverview(data);
        else if (kind === "guide") setGuide(data);
        else setAnalysis(data);
      }
    } catch (err) {
      if (!controller.signal.aborted)
        setError(err.name === "TimeoutError" ? t.errTimeout : err.message);
    } finally {
      request.current = null;
      setBusy("");
    }
  }

  function select(issue) {
    setOverview(null);
    setSelected(issue);
    setAnalysis(null);
    setGuide(null);
    setError("");
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function toggleLang() {
    if (busy) return;
    setAnalysis(null);
    setGuide(null);
    setOverview(null);
    setLang((prev) => (prev === "pt" ? "en" : "pt"));
  }

  const filtered = issues.filter((issue) =>
    `${issue.title} ${issue.number} ${issue.labels.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const configured = health?.gemma.configured;

  return (
    <>
      <Toast
        message={error}
        onClose={() => setError("")}
        title={t.toastErrorTitle}
        closeAria={t.toastCloseAria}
      />
      <a className="skip" href="#workspace">
        {t.skipLink}
      </a>
      <header className="header">
        <a className="brand" href="/" aria-label="RepoMentor início">
          <span className="brand-mark">
            r<span>m</span>
          </span>
          RepoMentor<span className="preview">{t.brandPreview}</span>
        </a>
        <nav aria-label="Principal">
          <div className="header-controls">
            <button
              type="button"
              className="lang-toggle-btn"
              disabled={!!busy}
              onClick={toggleLang}
              aria-label={t.langToggleAria}
              title={
                lang === "pt" ? "Switch to English" : "Mudar para Português"
              }
            >
              {lang === "pt" ? "🇧🇷 PT" : "🇺🇸 EN"}
            </button>
          </div>
          <a
            href="https://github.com/FloraRosaPupo/repomentor"
            target="_blank"
            rel="noreferrer"
          >
            {t.projectLink}
          </a>
          <span className="provider">{t.provider}</span>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> {t.heroEyebrow}
            </p>
            <h1>
              {t.heroTitle1}
              <br />
              {t.heroTitle2}
              <em>{t.heroTitleEm}</em>
            </h1>
            <p className="intro">{t.heroIntro}</p>
            <a className="hero-link" href="#workspace">
              {t.heroExploreLink} <span>↓</span>
            </a>
          </div>
          <div className="map-card" aria-hidden="true">
            <div className="map-top">
              <span className="tiny-dots">● ● ●</span>
              <span>{t.mapTitle}</span>
            </div>
            <div className="map-repo">
              <span className="meteor-icon">↗</span>
              <div>
                <strong>{repository || t.mapDefaultRepo}</strong>
                <small>{t.mapUniverse}</small>
              </div>
              <span className="map-star">✦</span>
            </div>
            <div className="map-path">
              <div>
                <b>01</b>
                <span>
                  {t.mapStep1Title}
                  <small>{t.mapStep1Sub}</small>
                </span>
                <span>✓</span>
              </div>
              <div>
                <b>02</b>
                <span>
                  {t.mapStep2Title}
                  <small>{t.mapStep2Sub}</small>
                </span>
                <span>✓</span>
              </div>
              <div className="map-last">
                <b>03</b>
                <span>
                  {t.mapStep3Title}
                  <small>{t.mapStep3Sub}</small>
                </span>
                <span>↗</span>
              </div>
            </div>
            <p className="map-note">{t.mapNote}</p>
          </div>
        </section>
        <div className="principles">
          <span>
            <b>01</b> {t.principle1}
          </span>
          <span>
            <b>02</b> {t.principle2}
          </span>
          <span>
            <b>03</b> {t.principle3}
          </span>
        </div>
        <section
          id="workspace"
          className="workspace"
          aria-labelledby="workspace-title"
        >
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">{t.workspaceEyebrow}</p>
              <h2 id="workspace-title">
                {t.workspaceTitle}
                <span>.</span>
              </h2>
              <p className="muted">{t.workspaceSubtitle}</p>
            </div>
            {loaded && (
              <button
                className="primary"
                onClick={() => load(repository)}
                disabled={!!busy}
              >
                {busy === "issues"
                  ? t.btnFetching
                  : loaded
                    ? t.btnRefreshIssues
                    : t.btnLoadIssues}
              </button>
            )}
          </div>
          <RepositoryPicker onLoad={load} busy={!!busy} t={t} />
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
                  {new Intl.NumberFormat(
                    lang === "pt" ? "pt-BR" : "en-US",
                  ).format(repositoryInfo?.stars ?? 0)}{" "}
                  {t.stars}
                </span>
                {repositoryInfo?.language && (
                  <span>{repositoryInfo.language}</span>
                )}
                {repositoryInfo?.license && (
                  <span>{repositoryInfo.license}</span>
                )}
                {repositoryInfo?.archived && <span>{t.archived}</span>}
              </div>
            </div>
          )}
          {repository && (
            <div className="repository-actions">
              <button
                className="primary"
                onClick={() => generate("repository")}
                disabled={
                  !!busy || !configured || !health?.features.repository_overview
                }
              >
                {busy === "repository" ? t.overviewBusy : t.btnOverview}
              </button>
              <span>{t.overviewHint}</span>
            </div>
          )}
          <div className="connection">
            <span className={`status-dot ${configured ? "ready" : ""}`} />
            <span>
              {!health
                ? t.connectingBackend
                : configured
                  ? t.gemmaConfigured
                  : t.gemmaWaiting}
            </span>
            {health && !configured && (
              <details>
                <summary>{t.howToEnable}</summary>
                <p>
                  {t.howToEnableDesc.replace(
                    "{missing}",
                    health.gemma.missing.join(", "),
                  )}
                </p>
              </details>
            )}
          </div>
          <div className="work-grid">
            <aside className="issue-panel" aria-label={t.openIssues}>
              <div className="panel-heading">
                <h3>{t.opportunities}</h3>
                <span className="count">{loaded ? filtered.length : "—"}</span>
              </div>
              <label className="search">
                <span>{t.searchLabel}</span>
                <input
                  type="search"
                  placeholder={t.searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={!loaded || !issues.length}
                />
              </label>
              <div className="issue-list">
                {busy === "issues" ? (
                  <p className="empty-message" role="status">
                    {t.loadingRepository}
                  </p>
                ) : !loaded ? (
                  <div className="empty-list">
                    <span>⌘</span>
                    <h4>
                      {t.emptyListTitle.split("\n").map((line, i) => (
                        <span key={i}>
                          {line}
                          {i === 0 && <br />}
                        </span>
                      ))}
                    </h4>
                    <p>{t.emptyListDesc}</p>
                  </div>
                ) : !filtered.length ? (
                  <div className="empty-message">
                    {issues.length ? (
                      <>
                        <p>{t.emptySearch}</p>
                        <button
                          className="secondary"
                          onClick={() => setQuery("")}
                        >
                          {t.clearSearch}
                        </button>
                      </>
                    ) : (
                      <p>
                        {issuesState === "disabled"
                          ? t.issuesDisabled
                          : issuesState === "limited"
                            ? t.issuesLimited
                            : t.issuesEmpty}
                      </p>
                    )}
                  </div>
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
                        {t.exploreIssueAction} <span>→</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </aside>
            <div
              className="detail-panel"
              aria-live="polite"
              aria-busy={!!busy && busy !== "issues"}
            >
              {busy === "repository" && (
                <p className="progress" role="status">
                  {t.overviewProgress}
                </p>
              )}
              {overview ? (
                <Result value={overview} overview t={t} />
              ) : !selected && loaded && !issues.length ? (
                <RepositoryEmptyState
                  t={t}
                  repository={repository}
                  state={issuesState}
                  configured={configured}
                />
              ) : !selected ? (
                <div className="empty-detail">
                  <div className="compass">✧</div>
                  <p className="eyebrow">{t.emptyDetailEyebrow}</p>
                  <h3>
                    {t.emptyDetailTitle.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i === 0 && <br />}
                      </span>
                    ))}
                  </h3>
                  <p>{t.emptyDetailDesc}</p>
                  <div className="empty-chips">
                    <span>{t.chipTechContext}</span>
                    <span>{t.chipRelatedFiles}</span>
                    <span>{t.chipContributionGuide}</span>
                  </div>
                  <small>{t.emptyDetailDisclaimer}</small>
                </div>
              ) : (
                <>
                  <div className="selected-heading">
                    <span className="eyebrow">
                      {t.issueNumberEyebrow.replace(
                        "{number}",
                        selected.number,
                      )}
                    </span>
                    <a href={selected.url} target="_blank" rel="noreferrer">
                      {t.viewOnGithub}
                    </a>
                  </div>
                  <h3 className="issue-title">{selected.title}</h3>
                  <details className="description">
                    <summary>{t.originalDescription}</summary>
                    <p>{selected.body || t.noDescription}</p>
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
                        ? t.btnAnalyzing
                        : analysis
                          ? t.btnReanalyze
                          : t.btnAnalyze}
                    </button>
                    <button
                      className="secondary"
                      disabled={
                        !!busy || !configured || !health?.features.guide
                      }
                      onClick={() => generate("guide")}
                    >
                      {busy === "guide"
                        ? t.btnPreparingGuide
                        : t.btnCreateGuide}
                    </button>
                  </div>
                  {!!busy && busy !== "issues" && (
                    <p className="progress" role="status">
                      {t.progressMessage}
                    </p>
                  )}
                  {analysis && <Result value={analysis} t={t} />}
                  {guide && <Result value={guide} guide t={t} />}
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
        <p>{t.footerSlogan}</p>
        <span>{t.footerNote}</span>
      </footer>
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={t.themeToggleAria}
        title={theme === "dark" ? t.themeToggleLight : t.themeToggleDark}
      >
        <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
      </button>
    </>
  );
}
