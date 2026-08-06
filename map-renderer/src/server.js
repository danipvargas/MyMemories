import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { chromium } from "playwright";
import sharp from "sharp";

const rendererDirectory = dirname(fileURLToPath(import.meta.url));
const maplibreScriptPath = join(
  rendererDirectory,
  "../node_modules/maplibre-gl/dist/maplibre-gl.js",
);
const style = JSON.parse(
  readFileSync(join(rendererDirectory, "assets/style.json"), "utf8"),
);

const config = {
  port: Number.parseInt(process.env.PORT ?? "8080", 10),
  style,
  defaultZoom: Number.parseFloat(process.env.MAP_DEFAULT_ZOOM ?? "10"),
  outputQuality: Number.parseInt(process.env.MAP_OUTPUT_QUALITY ?? "85", 10),
  markerPath:
    process.env.MAP_MARKER_PATH?.trim() ??
    join(rendererDirectory, "assets/map_marker.png"),
  headless: (process.env.HEADLESS ?? "true").toLowerCase() !== "false",
};

let browserPromise;

class BadRequestError extends Error {}

function getBrowser() {
  browserPromise ??= chromium.launch({
    headless: config.headless,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-angle=swiftshader"],
  });
  return browserPromise;
}

async function readJson(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) {
      throw new BadRequestError("Request body is too large.");
    }
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new BadRequestError("Request body must be valid JSON.");
  }
}

function validateRenderRequest(payload) {
  if (!payload || typeof payload !== "object") {
    throw new BadRequestError("Rendering request must be an object.");
  }

  const { center, zoom, width, height } = payload;
  const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

  if (
    !center ||
    !isNumber(center.latitude) ||
    center.latitude < -90 ||
    center.latitude > 90 ||
    !isNumber(center.longitude) ||
    center.longitude < -180 ||
    center.longitude > 180
  ) {
    throw new BadRequestError("center must contain valid latitude and longitude.");
  }

  if (!isNumber(zoom) || zoom < 0 || zoom > 24) {
    throw new BadRequestError("zoom must be between 0 and 24.");
  }

  if (
    !Number.isInteger(width) ||
    width < 1 ||
    width > 2000 ||
    !Number.isInteger(height) ||
    height < 1 ||
    height > 2000
  ) {
    throw new BadRequestError("width and height must be integers between 1 and 2000.");
  }

  return { center, zoom, width, height };
}

function renderPage(width, height) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      html, body, #map {
        width: ${width}px;
        height: ${height}px;
        margin: 0;
        overflow: hidden;
      }
    </style>
  </head>
  <body><div id="map"></div></body>
</html>`;
}

async function waitForMap(page, renderRequest) {
  await page.evaluate(
    ({ style, center, zoom }) => {
      window.__mapReady = new Promise((resolve, reject) => {
        const map = new maplibregl.Map({
          container: "map",
          style,
          center: [center.longitude, center.latitude],
          zoom,
          pitch: 0,
          bearing: 0,
          interactive: false,
          attributionControl: false,
          fadeDuration: 0,
          renderWorldCopies: false,
        });

        map.once("error", (event) => {
          reject(new Error(event?.error?.message ?? "Map rendering failed."));
        });
        map.once("idle", () => {
          requestAnimationFrame(resolve);
        });
      });
    },
    {
      style: config.style,
      center: renderRequest.center,
      zoom: renderRequest.zoom,
    },
  );

  await page.evaluate(() => window.__mapReady);
}

async function overlayMarker(image, width, height) {
  const marker = await sharp(config.markerPath)
    .resize({
      width: Math.max(16, Math.round(width * 0.08)),
      height,
      fit: "inside",
    })
    .png()
    .toBuffer({ resolveWithObject: true });

  const left = Math.round((width - marker.info.width) / 2);
  const top = Math.max(0, Math.round(height / 2 - marker.info.height));

  return sharp(image)
    .composite([{ input: marker.data, left, top }])
    .webp({ quality: Math.max(1, Math.min(config.outputQuality, 100)) })
    .toBuffer();
}

async function renderMap(renderRequest) {
  const browser = await getBrowser();
  const page = await browser.newPage({
    viewport: {
      width: renderRequest.width,
      height: renderRequest.height,
    },
    deviceScaleFactor: 1,
  });

  try {
    await page.setContent(renderPage(renderRequest.width, renderRequest.height));
    await page.addScriptTag({ path: maplibreScriptPath });
    await waitForMap(page, renderRequest);

    const screenshot = await page.screenshot({ type: "png" });
    return overlayMarker(
      screenshot,
      renderRequest.width,
      renderRequest.height,
    );
  } finally {
    await page.close();
  }
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method !== "POST" || request.url !== "/render") {
    sendJson(response, 404, { detail: "Not found." });
    return;
  }

  try {
    const renderRequest = validateRenderRequest(await readJson(request));
    const image = await renderMap(renderRequest);
    response.writeHead(200, { "Content-Type": "image/webp" });
    response.end(image);
  } catch (error) {
    if (error instanceof BadRequestError) {
      sendJson(response, 400, { detail: error.message });
      return;
    }

    console.error("Map rendering failed", error);
    sendJson(response, 500, { detail: "Unexpected rendering failure." });
  }
});

server.listen(config.port, "0.0.0.0", () => {
  console.log(`Map renderer listening on port ${config.port}`);
});

async function shutdown() {
  server.close();
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
  }
  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
