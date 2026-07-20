import type { ApiEntry } from "../types";

/** Substring > word-prefix > subsequence scoring for a single token. */
function scoreToken(token: string, text: string, allowSubsequence: boolean): number {
  const idx = text.indexOf(token);
  if (idx === 0) return 100;
  if (idx > 0) return text[idx - 1] === " " || text[idx - 1] === "-" ? 90 : 70;
  if (!allowSubsequence) return 0;
  let ti = 0;
  for (let i = 0; i < text.length && ti < token.length; i++) {
    if (text[i] === token[ti]) ti++;
  }
  return ti === token.length ? 30 : 0;
}

/**
 * Scores an entry against a query. 0 = no match (every token must match
 * somewhere). Name matches outweigh category, which outweighs description.
 * Subsequence ("wthr" -> "weather") only applies to name/category — on long
 * descriptions it produces too many false positives.
 */
export function fuzzyScore(query: string, entry: ApiEntry): number {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 1;

  const name = entry.name.toLowerCase();
  const category = entry.category.toLowerCase();
  const description = entry.description.toLowerCase();

  let total = 0;
  for (const token of tokens) {
    const s = Math.max(
      scoreToken(token, name, true) * 3,
      scoreToken(token, category, true) * 2,
      scoreToken(token, description, false),
    );
    if (s === 0) return 0;
    total += s;
  }
  return total;
}
