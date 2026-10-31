export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    signal: options.signal ?? AbortSignal.timeout(250_000),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "O backend retornou uma resposta inválida. Verifique se ele está rodando.",
    );
  }
  if (response.status === 422) {
    const repositoryError = data.detail?.find?.((item) =>
      item.loc?.includes("repository"),
    );
    throw new Error(
      data.error?.message ??
        repositoryError?.msg?.replace(/^Value error, /, "") ??
        "Confira os dados: informe organização/repositório ou sua URL pública no GitHub.",
    );
  }
  if (!response.ok)
    throw new Error(
      data.error?.message ??
        "Não foi possível concluir a solicitação. Tente novamente.",
    );
  return data;
}
