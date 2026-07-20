import type { ApiEntry, AuthType, TriState } from "../types";

const LINK_RE = /\[([^\]]+)\]\((\S+?)\)/;
const SEPARATOR_RE = /^:?-{2,}:?$/;

function normalizeAuth(raw: string): AuthType {
  const v = raw.replace(/`/g, "").trim().toLowerCase();
  if (v === "" || v === "no" || v === "none") return "none";
  if (v.includes("apikey") || v.includes("api key")) return "apiKey";
  if (v.includes("oauth")) return "OAuth";
  return "other";
}

function normalizeTri(raw: string): TriState {
  const v = raw.replace(/`/g, "").trim().toLowerCase();
  if (v === "yes") return "yes";
  if (v === "no") return "no";
  return "unknown";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripMarkdown(value: string): string {
  return value
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
}

/**
 * Parses the public-apis README into structured entries.
 * Only content after the "## Index" heading is considered (skips the
 * sponsored/promo sections at the top). Malformed rows are skipped, never throw.
 */
export function parseReadme(markdown: string): ApiEntry[] {
  const lines = markdown.split(/\r?\n/);
  const indexAt = lines.findIndex((l) => l.trim().startsWith("## Index"));
  const body = indexAt === -1 ? lines : lines.slice(indexAt + 1);

  const entries: ApiEntry[] = [];
  const seenIds = new Set<string>();
  let category = "";

  for (const line of body) {
    const heading = line.match(/^###\s+(.+)/);
    if (heading) {
      category = stripMarkdown(heading[1]);
      continue;
    }

    const trimmed = line.trim();
    if (!category || !trimmed.startsWith("|")) continue;

    try {
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.length < 5) continue;
      if (SEPARATOR_RE.test(cells[0].replace(/\s/g, ""))) continue;
      if (cells[0].toLowerCase() === "api") continue;

      const link = cells[0].match(LINK_RE);
      if (!link) continue;
      const name = stripMarkdown(link[1]);
      const url = link[2].trim();
      if (!name || !/^https?:\/\//i.test(url)) continue;

      let id = slugify(`${category}-${name}`) || `api-${entries.length}`;
      while (seenIds.has(id)) id += "-x";
      seenIds.add(id);

      entries.push({
        id,
        name,
        url,
        description: stripMarkdown(cells[1]),
        auth: normalizeAuth(cells[2]),
        https: normalizeTri(cells[3]),
        cors: normalizeTri(cells[4]),
        category,
      });
    } catch {
      // Defensive: a malformed row must never break the whole parse.
    }
  }

  return entries;
}
