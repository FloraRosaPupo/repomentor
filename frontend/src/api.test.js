import { afterEach, expect, it, vi } from "vitest";
import { api } from "./api";

afterEach(() => vi.unstubAllGlobals());

it("shows repository-specific validation guidance", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({
          detail: [
            {
              loc: ["query", "repository"],
              msg: "Value error, Falta o nome do repositório.",
            },
          ],
        }),
      }),
  );
  await expect(api("/issues?repository=meteor")).rejects.toThrow(
    "Falta o nome do repositório.",
  );
});

it("preserves the private-repository explanation instead of replacing it with a format error", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({
          error: {
            code: "private_repository",
            message: "Somente repositórios públicos.",
          },
        }),
      }),
  );
  await expect(api("/issues?repository=owner/private")).rejects.toThrow(
    "Somente repositórios públicos.",
  );
});
