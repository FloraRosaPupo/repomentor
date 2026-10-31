import { useState } from "react";

const STORAGE = "repomentor.repositories.v1";
const suggestions = [
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
];

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

export default function RepositoryPicker({ onLoad, busy }) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(readSaved);
  const [storageNotice, setStorageNotice] = useState("");

  function persist(next) {
    setSaved(next);
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next));
    } catch {
      setStorageNotice(
        "O navegador não permitiu salvar. Seus repositórios ficam disponíveis somente nesta sessão.",
      );
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
          <h3 id="choose-repository">Qual projeto você quer explorar?</h3>
          <p>
            Cole a URL de um repositório público ou digite
            organização/repositório.
          </p>
        </div>
        <span className="badge">GITHUB PÚBLICO</span>
      </div>
      <form
        className="repo-form"
        onSubmit={(event) => {
          event.preventDefault();
          void open(value);
        }}
      >
        <label htmlFor="repository-url">Repositório GitHub</label>
        <div>
          <input
            id="repository-url"
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="https://github.com/organização/repositório"
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
            {busy ? "Aguarde…" : "Cadastrar e explorar ↗"}
          </button>
        </div>
        <small id="repository-note">
          Exemplo: https://github.com/meteor/meteor ou meteor/meteor. Salvo
          somente neste navegador; apenas repositórios públicos.
        </small>
      </form>
      {storageNotice && (
        <p role="status" className="muted">
          {storageNotice}
        </p>
      )}
      {!!saved.length && (
        <div className="saved-repositories">
          <span>Seus repositórios</span>
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
        <summary>Não sabe por onde começar? Explore estas sugestões</summary>
        <p>
          Seleção por perfil de contribuição, não um ranking. Estrelas indicam
          popularidade; não garantem facilidade ou uma issue disponível.
        </p>
        <div className="suggestion-grid">
          {suggestions.map((repo) => (
            <article key={repo.name}>
              <span className="eyebrow">{repo.label}</span>
              <h4>{repo.name}</h4>
              <p>{repo.detail}</p>
              <div>
                <button disabled={busy} onClick={() => open(repo.name)}>
                  Explorar →
                </button>
                <a href={repo.source} target="_blank" rel="noreferrer">
                  Guia ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
