import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

const DEFAULT_HOST = "www.javajub.com";
const DEFAULT_ENDPOINT = "https://yandex.com/indexnow";
const DEFAULT_KEY = "e83be258c353fa1282249ebe3e69ab3595ad9667f969b329449721fdcaab3b8b";
const EXCLUDED_PATHS = new Set(["/404/", "/404.html"]);

const { values } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    endpoint: { type: "string", default: DEFAULT_ENDPOINT },
    host: { type: "string", default: process.env.INDEXNOW_HOST || DEFAULT_HOST },
    key: { type: "string", default: process.env.INDEXNOW_KEY || DEFAULT_KEY },
    "key-location": { type: "string" },
    limit: { type: "string" },
    sitemap: { type: "string" },
  },
});

const host = values.host.replace(/^https?:\/\//, "").replace(/\/$/, "");
const siteUrl = `https://${host}`;
const key = values.key;
const keyLocation = values["key-location"] || `${siteUrl}/${key}.txt`;
const sitemapLocation = values.sitemap || `${siteUrl}/sitemap.xml`;
const limit = values.limit ? Number.parseInt(values.limit, 10) : undefined;

if (!/^[a-z0-9_-]{8,128}$/i.test(key)) {
  throw new Error("IndexNow key must be 8-128 URL-safe characters.");
}

if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
  throw new Error("--limit must be a positive integer.");
}

async function readText(location) {
  if (/^https?:\/\//i.test(location)) {
    const response = await fetch(location, {
      headers: {
        "User-Agent": "JavaJub-IndexNow/1.0",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${location}: ${response.status} ${response.statusText}`);
    }
    return response.text();
  }

  return fs.readFile(path.resolve(location), "utf8");
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function extractUrls(sitemapXml) {
  const urls = [...sitemapXml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => decodeXml(match[1].trim()))
    .filter((url) => {
      try {
        const parsedUrl = new URL(url);
        return parsedUrl.host === host && !EXCLUDED_PATHS.has(parsedUrl.pathname);
      } catch {
        return false;
      }
    });

  return [...new Set(urls)].slice(0, limit);
}

async function submit(urlList) {
  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  if (values["dry-run"]) {
    console.log(`IndexNow dry-run: ${urlList.length} URL(s) would be sent to ${values.endpoint}`);
    console.log(`Key location: ${keyLocation}`);
    console.log(urlList.slice(0, 20).join("\n"));
    if (urlList.length > 20) console.log(`...and ${urlList.length - 20} more`);
    return;
  }

  const response = await fetch(values.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "JavaJub-IndexNow/1.0",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`IndexNow request failed: ${response.status} ${response.statusText}\n${body}`);
  }

  console.log(`IndexNow submitted ${urlList.length} URL(s) to ${values.endpoint}`);
  if (body.trim()) console.log(body.trim());
}

const sitemapXml = await readText(sitemapLocation);
const urls = extractUrls(sitemapXml);

if (urls.length === 0) {
  throw new Error(`No ${host} URLs found in ${sitemapLocation}`);
}

await submit(urls);
