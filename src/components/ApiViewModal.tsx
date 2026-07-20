import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  Wifi,
  Clock,
  FileCode,
  Globe,
  ShieldOff,
} from "lucide-react";
import type { ApiEntry } from "../types";

// Free CORS proxy — used as automatic fallback when direct fetch is blocked
const CORS_PROXY = "https://corsproxy.io/?url=";

interface ApiViewModalProps {
  entry: ApiEntry | null;
  onClose: () => void;
}

type FetchState =
  | { status: "idle" }
  | { status: "loading"; via?: "proxy" }
  | { status: "success"; data: unknown; time: number; code: number; via?: "proxy" }
  | { status: "html"; time: number; code: number }
  | { status: "raw-text"; text: string; time: number; code: number }
  | { status: "cors"; proxyTried: boolean }
  | { status: "error"; message: string };

/* ------------------------------------------------------------------ */
/* JSON syntax renderer                                                 */
/* ------------------------------------------------------------------ */
function JsonNode({ data, depth = 0 }: { data: unknown; depth?: number }) {
  const indent = Math.min(depth, 6) * 14;

  if (data === null) return <span className="json-null">null</span>;
  if (typeof data === "boolean") return <span className="json-bool">{String(data)}</span>;
  if (typeof data === "number") return <span className="json-num">{data}</span>;
  if (typeof data === "string") return <span className="json-str">"{data}"</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="json-punct">[]</span>;
    return (
      <>
        <span className="json-punct">{"["}</span>
        <div style={{ paddingLeft: indent + 14 }}>
          {data.slice(0, 60).map((item, i) => (
            <div key={i}>
              <JsonNode data={item} depth={depth + 1} />
              {i < data.length - 1 && <span className="json-punct">,</span>}
            </div>
          ))}
          {data.length > 60 && (
            <div className="json-ellipsis">…{data.length - 60} more items</div>
          )}
        </div>
        <span className="json-punct">{"]"}</span>
      </>
    );
  }

  if (typeof data === "object") {
    const keys = Object.keys(data as object);
    if (keys.length === 0) return <span className="json-punct">{"{}"}</span>;
    return (
      <>
        <span className="json-punct">{"{"}</span>
        <div style={{ paddingLeft: indent + 14 }}>
          {keys.slice(0, 50).map((key, i) => (
            <div key={key}>
              <span className="json-key">"{key}"</span>
              <span className="json-punct">: </span>
              <JsonNode data={(data as Record<string, unknown>)[key]} depth={depth + 1} />
              {i < keys.length - 1 && <span className="json-punct">,</span>}
            </div>
          ))}
          {keys.length > 50 && (
            <div className="json-ellipsis">…{keys.length - 50} more keys</div>
          )}
        </div>
        <span className="json-punct">{"}"}</span>
      </>
    );
  }

  return <span>{String(data)}</span>;
}

/* ------------------------------------------------------------------ */
/* Main modal                                                           */
/* ------------------------------------------------------------------ */
export function ApiViewModal({ entry, onClose }: ApiViewModalProps) {
  const [state, setState] = useState<FetchState>({ status: "idle" });
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const doFetch = async (url: string, isProxy: boolean, signal: AbortSignal) => {
    const start = Date.now();
    const res = await fetch(url, { signal });
    const time = Date.now() - start;
    const ct = res.headers.get("content-type") ?? "";

    // HTML page — not a real API endpoint
    if (ct.includes("text/html")) {
      setState({ status: "html", time, code: res.status });
      return;
    }

    const text = await res.text();

    // Try JSON parse
    try {
      const data = JSON.parse(text);
      setState({ status: "success", data, time, code: res.status, via: isProxy ? "proxy" : undefined });
    } catch {
      // Plain text / XML / etc.
      setState({ status: "raw-text", text: text.slice(0, 4000), time, code: res.status });
    }
  };

  const fetchData = (forceProxy = false) => {
    if (!entry) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const useProxy = forceProxy;
    setState({ status: "loading", via: useProxy ? "proxy" : undefined });

    const url = useProxy ? `${CORS_PROXY}${encodeURIComponent(entry.url)}` : entry.url;

    doFetch(url, useProxy, ctrl.signal).catch((err) => {
      if (err.name === "AbortError") return;

      // Network/CORS error on direct fetch → auto-retry via proxy
      if (!useProxy && (err instanceof TypeError)) {
        setState({ status: "loading", via: "proxy" });
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(entry.url)}`;
        doFetch(proxyUrl, true, ctrl.signal).catch((err2) => {
          if (err2.name === "AbortError") return;
          setState({ status: "cors", proxyTried: true });
        });
        return;
      }

      // Proxy also failed
      if (useProxy) {
        setState({ status: "cors", proxyTried: true });
        return;
      }

      setState({ status: "error", message: err.message ?? "Unknown error" });
    });
  };

  useEffect(() => {
    if (entry) fetchData();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copyResponse = () => {
    if (state.status !== "success") return;
    navigator.clipboard.writeText(JSON.stringify(state.data, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  const isLoading = state.status === "loading";
  const hasSuccess = state.status === "success";

  return (
    <AnimatePresence>
      {entry && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`API preview: ${entry.name}`}
            className="modal-panel"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="modal-glow" aria-hidden="true" />

            {/* ── Header ── */}
            <div className="modal-header">
              <div className="modal-title-row">
                <div className="modal-icon-wrap"><Wifi size={14} /></div>
                <div className="min-w-0">
                  <h2 className="modal-title">{entry.name}</h2>
                  <p className="modal-subtitle">{entry.category}</p>
                </div>
              </div>

              <div className="modal-actions">
                {state.status === "success" && (
                  <>
                    <div className="modal-status-badge ok">
                      <CheckCircle size={11} />
                      <span>{state.code}</span>
                    </div>
                    <div className="modal-status-badge time">
                      <Clock size={11} />
                      <span>{state.time}ms</span>
                    </div>
                    {state.via === "proxy" && (
                      <div className="modal-status-badge proxy" title="Response fetched via CORS proxy">
                        <ShieldOff size={11} />
                        <span>proxy</span>
                      </div>
                    )}
                  </>
                )}
                {state.status === "html" && (
                  <div className="modal-status-badge html">
                    <FileCode size={11} />
                    <span>HTML</span>
                  </div>
                )}
                {(state.status === "cors" || state.status === "error") && (
                  <div className="modal-status-badge error">
                    <AlertTriangle size={11} />
                    <span>blocked</span>
                  </div>
                )}

                <button type="button" onClick={() => fetchData()} disabled={isLoading}
                  className="modal-icon-btn" title="Refresh" aria-label="Refresh">
                  <RefreshCw size={14} className={isLoading ? "spin" : ""} />
                </button>
                {hasSuccess && (
                  <button type="button" onClick={copyResponse} className="modal-icon-btn"
                    title="Copy JSON" aria-label="Copy response JSON">
                    {copied ? <Check size={14} className="text-ok" /> : <Copy size={14} />}
                  </button>
                )}
                <a href={entry.url} target="_blank" rel="noopener noreferrer"
                  className="modal-icon-btn" title="Open in browser" aria-label="Open in new tab">
                  <ExternalLink size={14} />
                </a>
                <button type="button" onClick={onClose} className="modal-icon-btn modal-close"
                  aria-label="Close preview">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* ── URL bar ── */}
            <div className="modal-url-bar">
              <span className="modal-method">GET</span>
              <span className="modal-url">{entry.url}</span>
            </div>

            {/* ── Body ── */}
            <div className="modal-body">

              {/* Loading */}
              {isLoading && (
                <div className="modal-loading">
                  <div className="modal-spinner" />
                  <p>
                    {state.via === "proxy"
                      ? "Direct fetch blocked — retrying via CORS proxy…"
                      : "Fetching response…"}
                  </p>
                </div>
              )}

              {/* ✅ JSON success */}
              {state.status === "success" && (
                <motion.pre className="modal-json"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                  <JsonNode data={state.data} />
                </motion.pre>
              )}

              {/* Plain text / XML */}
              {state.status === "raw-text" && (
                <motion.pre className="modal-raw-text"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                  {state.text}
                </motion.pre>
              )}

              {/* HTML page returned */}
              {state.status === "html" && (
                <div className="modal-info-box">
                  <div className="modal-info-icon html-icon">
                    <Globe size={28} />
                  </div>
                  <h3 className="modal-info-title">This URL returns an HTML page</h3>
                  <p className="modal-info-desc">
                    The server responded with a <strong>web page</strong> (status {state.time > 0 ? `${state.code}, ${state.time}ms` : state.code}) rather than a JSON API response.
                    This usually means the base URL is the site homepage — the actual API endpoint may require a path or query parameters.
                  </p>
                  <div className="modal-info-actions">
                    <a href={entry.url} target="_blank" rel="noopener noreferrer"
                      className="modal-open-btn primary">
                      <ExternalLink size={14} /> Open in Browser
                    </a>
                    <a href={`https://google.com/search?q=${encodeURIComponent(entry.name + " API documentation")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="modal-open-btn secondary">
                      Search Docs
                    </a>
                  </div>
                </div>
              )}

              {/* CORS / network blocked */}
              {state.status === "cors" && (
                <div className="modal-info-box">
                  <div className="modal-info-icon cors-icon">
                    <ShieldOff size={28} />
                  </div>
                  <h3 className="modal-info-title">Request blocked by CORS policy</h3>
                  <p className="modal-info-desc">
                    The browser blocked this request because the API server does not allow
                    cross-origin requests from web apps. This is a browser security rule —
                    it does not mean the API is broken.
                  </p>
                  {entry.cors === "no" && (
                    <div className="modal-cors-tag">
                      ⚠ This API is marked <strong>CORS: No</strong> in the registry
                    </div>
                  )}
                  <div className="modal-info-actions">
                    <a href={entry.url} target="_blank" rel="noopener noreferrer"
                      className="modal-open-btn primary">
                      <ExternalLink size={14} /> Open Directly in Browser
                    </a>
                    <button type="button" onClick={() => fetchData(true)}
                      className="modal-open-btn secondary">
                      <RefreshCw size={13} /> Retry via Proxy
                    </button>
                  </div>
                </div>
              )}

              {/* Generic error */}
              {state.status === "error" && (
                <div className="modal-info-box">
                  <div className="modal-info-icon error-icon">
                    <AlertTriangle size={28} />
                  </div>
                  <h3 className="modal-info-title">Request failed</h3>
                  <p className="modal-info-desc">{state.message}</p>
                  <div className="modal-info-actions">
                    <button type="button" onClick={() => fetchData()}
                      className="modal-open-btn primary">
                      <RefreshCw size={13} /> Try Again
                    </button>
                    <a href={entry.url} target="_blank" rel="noopener noreferrer"
                      className="modal-open-btn secondary">
                      <ExternalLink size={14} /> Open in Browser
                    </a>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
