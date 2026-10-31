import { translations } from "./i18n";

export default function RepositoryEmptyState({
  repository,
  state,
  configured,
  t = translations.pt,
}) {
  const content = t.emptyStates[state] ?? t.emptyStates.empty;
  return (
    <div className="empty-detail repository-empty">
      <div className="compass" aria-hidden="true">
        ↗
      </div>
      <p className="eyebrow">{t.repositoryLoaded}</p>
      <h3>{content.title}</h3>
      <p>{content.text}</p>
      <div className="empty-chips">
        <span>{t.documentation}</span>
        <span>{t.technologies}</span>
        <span>{t.architecture}</span>
      </div>
      <p>{configured ? t.noIssuesReady : t.noIssuesWaiting}</p>
      <div className="empty-actions">
        <a
          className="secondary"
          href={`https://github.com/${repository}`}
          target="_blank"
          rel="noreferrer"
        >
          {t.exploreFiles}
        </a>
        {state !== "disabled" && (
          <a
            href={`https://github.com/${repository}/issues`}
            target="_blank"
            rel="noreferrer"
          >
            {t.viewIssues}
          </a>
        )}
        <a href="#repository-url">{t.chooseRepository}</a>
      </div>
      <small>{t.noIssuesDisclaimer}</small>
    </div>
  );
}
