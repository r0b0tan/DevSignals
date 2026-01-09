import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'http';
import https from 'https';
import http from 'http';

const MAX_REDIRECTS = 5;

function proxyRequest(
  targetUrl: URL,
  res: ServerResponse,
  redirectCount: number
): void {
  if (redirectCount > MAX_REDIRECTS) {
    res.statusCode = 502;
    res.end('Too many redirects');
    return;
  }

  const client = targetUrl.protocol === 'https:' ? https : http;

  const proxyReq = client.request(
    targetUrl,
    {
      method: 'GET',
      headers: {
        'Host': targetUrl.host,
        'User-Agent': 'DevSignals/1.0',
        Accept: 'text/html',
      },
    },
    (proxyRes) => {
      const status = proxyRes.statusCode || 200;

      // Handle redirects
      if (status >= 300 && status < 400 && proxyRes.headers.location) {
        const location = proxyRes.headers.location;
        let nextUrl: URL;
        try {
          nextUrl = new URL(location, targetUrl);
        } catch {
          res.statusCode = 502;
          res.end('Invalid redirect URL');
          return;
        }
        proxyRequest(nextUrl, res, redirectCount + 1);
        return;
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'text/html');
      res.statusCode = status;
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    res.statusCode = 502;
    res.end(`Proxy error: ${err.message}`);
  });

  proxyReq.end();
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cors-proxy',
      configureServer(server) {
        server.middlewares.use('/proxy', (req: IncomingMessage, res: ServerResponse) => {
          const urlParam = new URL(req.url!, 'http://localhost').searchParams.get('url');
          if (!urlParam) {
            res.statusCode = 400;
            res.end('Missing url parameter');
            return;
          }

          let targetUrl: URL;
          try {
            targetUrl = new URL(urlParam);
          } catch {
            res.statusCode = 400;
            res.end('Invalid URL');
            return;
          }

          proxyRequest(targetUrl, res, 0);
        });
      },
    },
  ],
});
