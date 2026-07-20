export type AuthType = "none" | "apiKey" | "OAuth" | "other";
export type TriState = "yes" | "no" | "unknown";

export interface ApiEntry {
  /** Stable slug of category + name, used as favorites key. */
  id: string;
  name: string;
  url: string;
  description: string;
  auth: AuthType;
  https: TriState;
  cors: TriState;
  category: string;
}

export type AuthFilter = AuthType | "all";
export type TriFilter = TriState | "all";
export type SortMode = "az" | "category" | "easiest";

export interface FilterState {
  auth: AuthFilter;
  cors: TriFilter;
  https: TriFilter;
}
