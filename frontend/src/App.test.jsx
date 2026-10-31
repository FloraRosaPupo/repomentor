import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { api } from "./api";

vi.mock("./api", () => ({ api: vi.fn() }));
const health = {
  gemma: { configured: true, missing: [] },
  features: { analysis: true, guide: true },
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
        body: JSON.stringify({ repository: "meteor/meteor", issue_number: 42 }),
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
    const themeBtn = screen.getByRole("button", { name: "Alternar tema claro/escuro" });
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
    const langBtn = screen.getByRole("button", { name: "Alternar idioma português/inglês" });
    expect(document.documentElement.getAttribute("lang")).toBe("pt-BR");
    expect(screen.getByText("SEU PRIMEIRO PASSO NO OPEN SOURCE")).toBeInTheDocument();

    // Click to switch to English
    fireEvent.click(langBtn);
    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(localStorage.getItem("repomentor.lang.v1")).toBe("en");
    expect(screen.getByText("YOUR FIRST STEP INTO OPEN SOURCE")).toBeInTheDocument();

    // Click to switch back to Portuguese
    fireEvent.click(langBtn);
    expect(document.documentElement.getAttribute("lang")).toBe("pt-BR");
    expect(localStorage.getItem("repomentor.lang.v1")).toBe("pt");
    expect(screen.getByText("SEU PRIMEIRO PASSO NO OPEN SOURCE")).toBeInTheDocument();
  });
});
