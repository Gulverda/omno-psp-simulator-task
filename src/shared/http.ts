export async function postJson<TResponse>(
  url: string,
  body: unknown,
  opts?: { timeoutMs?: number; retries?: number },
): Promise<TResponse> {
  const retries = opts?.retries ?? 2;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        opts?.timeoutMs ?? 5000,
      );

      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return (await res.json()) as TResponse;
    } catch (err) {
      if (attempt === retries) throw err;
    }
  }

  throw new Error("Unreachable");
}
