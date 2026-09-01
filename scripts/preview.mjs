import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../out/", import.meta.url));
const portArg = process.argv.find(arg => arg.startsWith("--port="));
const port = Number(portArg?.slice(7) || process.env.PORT || 4317);
const mime = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".pdf": "application/pdf" };

try { await stat(resolve(root, "index.html")); }
catch { console.error("Static output is missing. Run npm run build first."); process.exit(1); }

createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; media-src 'self' blob:; connect-src 'self'; frame-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'");
  if (request.method !== "GET" && request.method !== "HEAD") { response.writeHead(405, { Allow: "GET, HEAD" }); response.end(); return; }
  try {
    const url = new URL(request.url || "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    let path = resolve(root, `.${pathname}`);
    if ((path !== resolve(root) && !path.startsWith(resolve(root) + sep)) || pathname.includes("\0")) { response.writeHead(403); response.end(); return; }
    let info = await stat(path).catch(() => null);
    if (info?.isDirectory()) {
      if (!url.pathname.endsWith("/")) { response.writeHead(308, { Location: `${url.pathname}/${url.search}` }); response.end(); return; }
      path = resolve(path, "index.html");
      info = await stat(path).catch(() => null);
    }
    let status = 200;
    if (!info?.isFile()) { status = 404; path = resolve(root, "404.html"); info = await stat(path); }
    response.setHeader("Content-Type", mime[extname(path)] || "application/octet-stream");
    response.setHeader("Cache-Control", pathname.startsWith("/_next/static/") ? "public, max-age=31536000, immutable" : "no-cache");
    response.setHeader("Accept-Ranges", "bytes");
    let start = 0, end = info.size - 1;
    if (request.headers.range && status === 200) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      if (range) {
        start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
        end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
      }
      if (!range || start > end || start >= info.size) { response.writeHead(416, { "Content-Range": `bytes */${info.size}` }); response.end(); return; }
      status = 206;
      response.setHeader("Content-Range", `bytes ${start}-${end}/${info.size}`);
    }
    response.setHeader("Content-Length", end - start + 1);
    response.writeHead(status);
    if (request.method === "HEAD") response.end();
    else createReadStream(path, { start, end }).on("error", () => response.destroy()).pipe(response);
  } catch {
    if (!response.headersSent) response.writeHead(400);
    response.end("Bad request");
  }
}).listen(port, "127.0.0.1", () => console.log(`Hanzis static preview: http://127.0.0.1:${port}`));
