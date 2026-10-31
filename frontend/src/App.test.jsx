import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { api } from "./api";

vi.mock("./api", () => ({ api: vi.fn() }));
const health = {
  gemma: { configured: true, missing: [] },
  features: { analysis: true, guide: true, repository_overview: true },
};
const issues = [
  {
    number: 42,
    title: "Improve setup documentation",
    body: "Explain the setup.",
    labels: ["documentation"],
    url: "https://github.com/meteor/meteor/issues/42",
  },
  {
    number: 43,
    title: "Build issue",
    body: "",
    labels: [],
    url: "https://github.com/meteor/meteor/issues/43",
  },
];
const analysis = {
  result: {
    summary: "Investigue a documentação.",
    architecture: "Contexto do README.",
    difficulty: "unclear",
    reasoning: "Mais contexto é necessário.",
    required_knowledge: ["Markdown"],
    evidence: [],
    limitations: ["Revisão necessária."],
  },
  metadata: {
    model: "gemma-4-test",
    elapsed_ms: 1500,
    commit: "abc1234",
    cached: false,
  },
};

beforeEach(() => {
  localStorage.clear();
  api.mockReset();
  api.mockImplementation(async (path) =>
    path === "/health"
      ? health
      : path.startsWith("/issues?")
        ? { repository: "meteor/meteor", issues }
        : analysis,
  );
});

async function choose() {
  render(<App />);
  fireEvent.change(screen.getByLabelText("Repositório GitHub"), {
    target: { value: "meteor/meteor" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Cadastrar e explorar ↗" }),
  );
  fireEvent.click(
    await screen.findByRole("button", { name: /Improve setup documentation/ }),
  );
}

describe("RepoMentor flow", () => {
  it("sends the selected language and clears prior results", async () => {
    await choose();
    fireEvent.click(
      screen.getByRole("button", { name: "Analisar com Gemma ↗" }),
    );
    await screen.findByText("Investigue a documentação.");
    fireEvent.click(
      screen.getByRole("button", { name: "Alternar idioma português/inglês" }),
    );
    expect(
      screen.queryByText("Investigue a documentação."),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Analisar com Gemma ↗" }),
    );
    await screen.findByText("Investigue a documentação.");
    expect(api).toHaveBeenLastCalledWith(
      "/analyze",
      expect.objectContaining({
        body: JSON.stringify({
          repository: "meteor/meteor",
          issue_number: 42,
          language: "en",
        }),
      }),
    );
  });
  it.each([
    ["empty", "Sem issues abertas. O projeto continua disponível."],
    ["disabled", "As issues estão desativadas neste projeto."],
    ["limited", "Nenhuma issue apareceu nesta amostra."],
  ])(
    "explains %s lists without blocking repository onboarding",
    async (state, title) => {
      api.mockImplementation(async (path) =>
        path === "/health"
          ? health
          : { repository: "owner/repo", issues: [], issues_state: state },
      );
      render(<App />);
      fireEvent.change(screen.getByLabelText("Repositório GitHub"), {
        target: { value: "owner/repo" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "Cadastrar e explorar ↗" }),
      );
      expect(
        await screen.findByRole("heading", { name: title }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: "Conhecer o repositório com Gemma",
        }),
      ).toBeEnabled();
      expect(
        screen.getByRole("link", { name: "Explorar os arquivos ↗" }),
      ).toHaveAttribute("href", "https://github.com/owner/repo");
      expect(screen.getByRole("searchbox")).toBeDisabled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );

  it("generates a repository overview without selecting or inventing an issue", async () => {
    api.mockImplementation(async (path) => {
      if (path === "/health") return health;
      if (path.startsWith("/issues?"))
        return { repository: "owner/repo", issues: [], issues_state: "empty" };
      return {
        repository: "owner/repo",
        metadata: analysis.metadata,
        result: {
          summary: "Conheça este projeto.",
          architecture: "README e módulos.",
          technologies: ["Python"],
          next_steps: ["Leia a documentação."],
          evidence: [],
          limitations: ["Sem revisão humana."],
        },
      };
    });
    render(<App />);
    fireEvent.change(screen.getByLabelText("Repositório GitHub"), {
      target: { value: "owner/repo" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Cadastrar e explorar ↗" }),
    );
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Conhecer o repositório com Gemma",
      }),
    );
    expect(
      await screen.findByText("Conheça este projeto."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/roteiro de aprendizado, não uma lista de issues/),
    ).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith(
      "/repository/analyze",
      expect.objectContaining({
        body: JSON.stringify({ repository: "owner/repo", language: "pt" }),
      }),
    );
    expect(
      screen.queryByRole("button", { name: "Analisar com Gemma ↗" }),
    ).not.toBeInTheDocument();
  });

  it("allows clearing an unmatched search without claiming the repository is empty", async () => {
    await choose();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "no-match" },
    });
    expect(
      screen.getByText("Nenhuma issue corresponde à busca."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Nenhuma issue aberta no momento."),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(
      screen.getByRole("button", { name: /Build issue/ }),
    ).toBeInTheDocument();
  });
  it("saves a chosen repository locally and removes it from saved entries", async () => {
    await choose();
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem("repomentor.repositories.v1")),
      ).toEqual(["meteor/meteor"]),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Remover meteor/meteor dos salvos" }),
    );
    expect(
      JSON.parse(localStorage.getItem("repomentor.repositories.v1")),
    ).toEqual([]);
  });

  it("queries the repository chosen from suggestions", async () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Explorar →" })[0]);
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith(
        "/issues?repository=firstcontributions%2Ffirst-contributions",
        expect.anything(),
      ),
    );
    await screen.findByRole("button", { name: /Improve setup documentation/ });
  });

  it("clears results when another repository fails to load", async () => {
    await choose();
    fireEvent.click(
      screen.getByRole("button", { name: "Analisar com Gemma ↗" }),
    );
    await screen.findByText("Investigue a documentação.");
    api.mockImplementation(async (path) => {
      if (path === "/health") return health;
      throw new Error("Repositório não encontrado.");
    });
    fireEvent.change(screen.getByLabelText("Repositório GitHub"), {
      target: { value: "owner/missing" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Cadastrar e explorar ↗" }),
    );
    await screen.findByRole("alert");
    expect(
      screen.queryByText("Investigue a documentação."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Improve setup documentation/ }),
    ).not.toBeInTheDocument();
  });
  it("loads actual API records, selects an issue and displays validated analysis", async () => {
    await choose();
    fireEvent.click(
      screen.getByRole("button", { name: "Analisar com Gemma ↗" }),
    );
    expect(
      await screen.findByText("Investigue a documentação."),
    ).toBeInTheDocument();
    expect(screen.getByText("Ainda incerta")).toBeInTheDocument();
    expect(
      screen.getByText(/Nenhum código ou teste do repositório foi executado/),
    ).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith(
      "/analyze",
      expect.objectContaining({
        body: JSON.stringify({
          repository: "meteor/meteor",
          issue_number: 42,
          language: "pt",
        }),
      }),
    );
  });

  it("keeps browsing available while Gemma configuration is missing", async () => {
    api.mockImplementation(async (path) =>
      path === "/health"
        ? {
            ...health,
            gemma: { configured: false, missing: ["GEMMA_MODEL_ID"] },
          }
        : { repository: "meteor/meteor", issues },
    );
    await choose();
    expect(
      screen.getByRole("button", { name: "Analisar com Gemma ↗" }),
    ).toBeDisabled();
    expect(screen.getByText(/aguarda a configuração/)).toBeInTheDocument();
  });

  it("filters the list and clears the prior analysis when selecting another issue", async () => {
    await choose();
    fireEvent.click(
      screen.getByRole("button", { name: "Analisar com Gemma ↗" }),
    );
    await screen.findByText("Investigue a documentação.");
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "43" },
    });
    expect(
      screen.queryByRole("button", { name: /Improve setup documentation/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Build issue/ }));
    expect(
      screen.queryByText("Investigue a documentação."),
    ).not.toBeInTheDocument();
  });

  it("shows errors without losing the selected issue and permits retry", async () => {
    await choose();
    api.mockRejectedValueOnce(new Error("Quota atingida."));
    fireEvent.click(
      screen.getByRole("button", { name: "Analisar com Gemma ↗" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Quota atingida.",
    );
    expect(
      screen.getByRole("heading", { name: "Improve setup documentation" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Analisar com Gemma ↗" }),
      ).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Fechar notificação" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Improve setup documentation" }),
    ).toBeInTheDocument();
  });

  it("blocks a second request and selection while inference is pending", async () => {
    await choose();
    let resolve;
    api.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Analisar com Gemma ↗" }),
    );
    expect(
      screen.getByRole("button", { name: /Gemma está analisando/ }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /Build issue/ })).toBeDisabled();
    resolve(analysis);
    await screen.findByText("Investigue a documentação.");
  });

  it("toggles theme between light and dark and persists to localStorage", async () => {
    render(<App />);
    const themeBtn = screen.getByRole("button", {
      name: "Alternar tema claro/escuro",
    });
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    // Click to switch to dark
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("repomentor.theme.v1")).toBe("dark");

    // Click to switch back to light
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("repomentor.theme.v1")).toBe("light");
  });

  it("toggles language between Portuguese and English and persists to localStorage", async () => {
    render(<App />);
    const langBtn = screen.getByRole("button", {
      name: "Alternar idioma português/inglês",
    });
    expect(document.documentElement.getAttribute("lang")).toBe("pt-BR");
    expect(
      screen.getByText("SEU PRIMEIRO PASSO NO OPEN SOURCE"),
    ).toBeInTheDocument();

    // Click to switch to English
    fireEvent.click(langBtn);
    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(localStorage.getItem("repomentor.lang.v1")).toBe("en");
    expect(
      screen.getByText("YOUR FIRST STEP INTO OPEN SOURCE"),
    ).toBeInTheDocument();

    // Click to switch back to Portuguese
    fireEvent.click(langBtn);
    expect(document.documentElement.getAttribute("lang")).toBe("pt-BR");
    expect(localStorage.getItem("repomentor.lang.v1")).toBe("pt");
    expect(
      screen.getByText("SEU PRIMEIRO PASSO NO OPEN SOURCE"),
    ).toBeInTheDocument();
  });
});
