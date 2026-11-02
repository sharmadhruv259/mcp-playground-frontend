"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Sparkles,
  Wrench,
  FileText,
  MessageSquare,
  Server,
  Clock3,
} from "lucide-react";

interface FullScreenLoaderProps {
  estimatedRemainingSeconds?: number | null;
  predictedTotalSeconds?: number | null;
  isOverEstimate?: boolean;
}

/**
 * Keeps the loader visible for at least `minMs` (default 2s), even if the
 * backend responds faster, so the animation doesn't flash and vanish.
 */
export function useMinimumLoadingTime(isLoading: boolean, minMs = 2000) {
  const [show, setShow] = useState(isLoading);
  const startedAt = useRef<number | null>(isLoading ? Date.now() : null);

  useEffect(() => {
    if (isLoading) {
      startedAt.current = startedAt.current ?? Date.now();
      setShow(true);
      return;
    }

    if (startedAt.current === null) {
      setShow(false);
      return;
    }

    const remaining = Math.max(0, minMs - (Date.now() - startedAt.current));
    const timer = setTimeout(() => {
      startedAt.current = null;
      setShow(false);
    }, remaining);

    return () => clearTimeout(timer);
  }, [isLoading, minMs]);

  return show;
}

const ORBIT_RADIUS = 104;

const NODES = [
  { label: "Agents", icon: Sparkles, angle: 0 },
  { label: "Tools", icon: Wrench, angle: 90 },
  { label: "Resources", icon: FileText, angle: 180 },
  { label: "Prompts", icon: MessageSquare, angle: 270 },
];

export default function FullScreenLoader({
  estimatedRemainingSeconds = null,
  predictedTotalSeconds = null,
  isOverEstimate = false,
}: FullScreenLoaderProps) {
  const showEstimate =
    estimatedRemainingSeconds !== null && predictedTotalSeconds !== null;

  const progress =
    showEstimate && predictedTotalSeconds! > 0
      ? Math.min(
          100,
          Math.max(
            4,
            ((predictedTotalSeconds! - estimatedRemainingSeconds!) /
              predictedTotalSeconds!) *
              100
          )
        )
      : 0;

  const indeterminate = isOverEstimate || !showEstimate;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6"
    >
      <style>{`
        @keyframes mcp-spin { to { transform: rotate(360deg); } }
        @keyframes mcp-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes mcp-pulse-ring {
          0% { transform: scale(0.85); opacity: 0.55; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes mcp-node-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(129,140,248,0); border-color: rgba(148,163,184,0.18); color: #94a3b8; }
          12%, 28% { box-shadow: 0 0 22px 2px rgba(129,140,248,0.55); border-color: rgba(165,180,252,0.8); color: #e0e7ff; }
        }
        @keyframes mcp-chip-glow {
          0%, 100% { color: #64748b; border-color: rgba(148,163,184,0.12); background: rgba(15,23,42,0.5); }
          12%, 28% { color: #e0e7ff; border-color: rgba(129,140,248,0.55); background: rgba(99,102,241,0.14); }
        }
        @keyframes mcp-slide {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
        @keyframes mcp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mcp-anim, .mcp-anim * { animation: none !important; }
        }
      `}</style>

      {/* Ambient background: faded grid + two soft glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 55% 55% at 50% 45%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 55% at 50% 45%, black 20%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[62%] top-[55%] h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/15 blur-[110px]"
      />

      <div className="mcp-anim relative flex w-full max-w-md flex-col items-center text-center">
        {/* Orbit scene */}
        <div
          className="relative mb-10 h-[260px] w-[260px]"
          style={{ animation: "mcp-float 6s ease-in-out infinite" }}
        >
          {/* Rings */}
          <div className="absolute inset-[26px] rounded-full border border-dashed border-indigo-400/25" />
          <div className="absolute inset-[64px] rounded-full border border-slate-600/20" />

          {/* Pulse behind the core */}
          <div
            className="absolute left-1/2 top-1/2 h-20 w-20 -ml-10 -mt-10 rounded-3xl border border-indigo-400/40"
            style={{ animation: "mcp-pulse-ring 2.4s ease-out infinite" }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-20 w-20 -ml-10 -mt-10 rounded-3xl border border-indigo-400/40"
            style={{ animation: "mcp-pulse-ring 2.4s ease-out 1.2s infinite" }}
          />

          {/* Rotating orbit with four nodes */}
          <div
            className="absolute inset-0"
            style={{ animation: "mcp-spin 28s linear infinite" }}
          >
            {NODES.map(({ label, icon: Icon, angle }, i) => (
              <div
                key={label}
                className="absolute left-1/2 top-1/2 -ml-[19px] -mt-[19px]"
                style={{
                  transform: `rotate(${angle}deg) translateY(-${ORBIT_RADIUS}px) rotate(-${angle}deg)`,
                }}
              >
                <div style={{ animation: "mcp-spin-rev 28s linear infinite" }}>
                  <div
                    title={label}
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-xl border bg-slate-900/90 backdrop-blur"
                    style={{
                      animation: `mcp-node-glow 4s ease-in-out ${i}s infinite`,
                    }}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Core */}
          <div className="absolute left-1/2 top-1/2 -ml-10 -mt-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-300/30 bg-gradient-to-b from-slate-800 to-slate-950 shadow-[0_0_50px_-8px_rgba(99,102,241,0.7)]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400/20 via-transparent to-cyan-300/10" />
            <Bot className="relative h-10 w-10 text-indigo-300" />
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">
          MCP Playground
        </h1>
        <p className="mb-8 text-base text-slate-400">
          Preparing your AI workspace
        </p>

        {/* Progress */}
        <div className="mb-3 w-full max-w-xs">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
            {indeterminate ? (
              <div
                className={`absolute inset-y-0 w-1/3 rounded-full ${
                  isOverEstimate
                    ? "bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                    : "bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
                }`}
                style={{ animation: "mcp-slide 1.6s ease-in-out infinite" }}
              />
            ) : (
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-300 transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        </div>

        {/* Estimate / status copy */}
        <div className="mb-8 flex min-h-[44px] flex-col items-center gap-1">
          {showEstimate && !isOverEstimate ? (
            <>
              <div className="flex items-center gap-2 text-indigo-300">
                <Clock3 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  About {estimatedRemainingSeconds}s remaining
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Based on previous successful loads
              </p>
            </>
          ) : isOverEstimate ? (
            <>
              <p className="text-sm font-medium text-amber-300">
                Taking longer than usual
              </p>
              <p className="text-xs text-slate-500">
                Still waiting for the backend to respond
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              Initializing your workspace...
            </p>
          )}
        </div>

        {/* Backend status + what is loading */}
        <div className="flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/60 px-4 py-2 text-sm text-slate-300 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${
                isOverEstimate ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isOverEstimate ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
          </span>
          <Server className="h-4 w-4 text-indigo-400" />
          <span>Connecting to MCP backend</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {NODES.map(({ label, icon: Icon }, i) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
              style={{
                animation: `mcp-chip-glow 4s ease-in-out ${i}s infinite`,
              }}
            >
              <Icon className="h-3 w-3" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}