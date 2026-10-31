import { useState } from "react";
import { translations } from "./i18n";

const STORAGE = "repomentor.repositories.v1";

function readSaved() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE) ?? "[]");
    return Array.isArray(data)
      ? data
          .filter(
            (item) =>
              typeof item === "string" &&
              /^[a-z0-9-]+\/[a-z0-9_.-]+$/i.test(item),
          )
          .slice(0, 12)
      : [];
  } catch {
    return [];
  }
}

export default function RepositoryPicker({ onLoad, busy, t = translations.pt }) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(readSaved);
  const [storageNotice, setStorageNotice] = useState("");

  const suggestions = t.suggestions || translations.pt.suggestions;

  function persist(next) {
    setSaved(next);
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next));
    } catch {
      setStorageNotice(t.storageNotice);
    }
  }

  async function open(repository) {
    if (busy || !repository.trim()) return;
    setValue(repository);
    const data = await onLoad(repository.trim());
    if (data) {
      setValue(data.repository);
      persist(
        [
          data.repository,
          ...saved.filter((item) => item !== data.repository),
        ].slice(0, 12),
      );
    }
  }

  return (
    <section className="repository-picker" aria-labelledby="choose-repository">
      <div className="picker-title">
        <div>
          <h3 id="choose-repository">{t.pickerTitle}</h3>
          <p>{t.pickerSubtitle}</p>
        </div>
        <span className="badge">{t.badgePublicGithub}</span>
      </div>
      <form
        className="repo-form"
        onSubmit={(event) => {
          event.preventDefault();
          void open(value);
        }}
      >
        <label htmlFor="repository-url">{t.repoLabel}</label>
        <div>
          <input
            id="repository-url"
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={t.repoPlaceholder}
            maxLength={200}
            required
            disabled={busy}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="repository-note"
          />
          <button
            className="primary"
            disabled={busy || !value.trim()}
            type="submit"
          >
            {busy ? t.repoSubmitBusy : t.repoSubmit}
          </button>
        </div>
        <small id="repository-note">{t.repoNote}</small>
      </form>
      {storageNotice && (
        <p role="status" className="muted">
          {storageNotice}
        </p>
      )}
      {!!saved.length && (
        <div className="saved-repositories">
          <span>{t.savedReposTitle}</span>
          <div>
            {saved.map((name) => (
              <div className="saved-repo" key={name}>
                <button disabled={busy} onClick={() => open(name)}>
                  {name}
                </button>
                <button
                  disabled={busy}
                  aria-label={`Remover ${name} dos salvos`}
                  onClick={() => persist(saved.filter((item) => item !== name))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <details className="suggestions" open={!saved.length}>
        <summary>{t.suggestionsSummary}</summary>
        <p>{t.suggestionsIntro}</p>
        <div className="suggestion-grid">
          {suggestions.map((repo) => (
            <article key={repo.name}>
              <span className="eyebrow">{repo.label}</span>
              <h4>{repo.name}</h4>
              <p>{repo.detail}</p>
              <div>
                <button disabled={busy} onClick={() => open(repo.name)}>
                  {t.btnExplore}
                </button>
                <a href={repo.source} target="_blank" rel="noreferrer">
                  {t.guideLink}
                </a>
              </div>
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
