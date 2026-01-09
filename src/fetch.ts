import { config } from './config';

const BLOCKED_PATTERN =
  /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|0\.0\.0\.0|\[::1\])/i;

export function validateUrl(
  input: string
): { ok: true; url: string } | { ok: false; error: string } {
  let url: URL;
  try {
    url = new URL(input.includes('://') ? input : `https://${input}`);
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return { ok: false, error: 'HTTP(S) only' };
  }

  if (BLOCKED_PATTERN.test(url.hostname)) {
    return { ok: false, error: 'Cannot analyze local/private addresses' };
  }

  return { ok: true, url: url.href };
}

export async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'text/html' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.text();
  } catch (e) {
    if (e instanceof TypeError) {
      if (config.proxyUrl) {
        return fetchViaProxy(url);
      }
      throw new Error(
        'Request blocked by browser (CORS). The target server does not allow cross-origin requests.'
      );
    }
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchViaProxy(url: string): Promise<string> {
  const proxyUrl = `${config.proxyUrl}?url=${encodeURIComponent(url)}`;

  try {
    const res = await fetch(proxyUrl, {
      headers: { Accept: 'text/html' },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Proxy error: ${res.status}`);
    }

    return res.text();
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error('Unable to reach proxy server');
    }
    throw e;
  }
}
