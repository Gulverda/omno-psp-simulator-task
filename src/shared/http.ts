export async function postJson<TResponse>(
  url: string,
  body: unknown,
  opts?: { timeoutMs?: number },
): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 5000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} calling ${url}: ${text}`);
    }

    return (await res.json()) as TResponse;
  } finally {
    clearTimeout(timeout);
  }
}
