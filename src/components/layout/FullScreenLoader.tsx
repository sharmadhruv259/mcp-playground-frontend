
"use client";

import { Loader2, Bot, Server } from "lucide-react";

export default function FullScreenLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-slate-950 px-6"
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-3xl bg-indigo-500/20 blur-3xl" />

          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-indigo-400/20 bg-slate-900 shadow-xl">
            <Bot className="h-12 w-12 text-indigo-400" />
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold tracking-tight text-white">
          MCP Playground
        </h1>

        <p className="mb-8 text-base text-slate-400">
          Preparing your AI workspace...
        </p>

        <Loader2 className="mb-6 h-9 w-9 animate-spin text-indigo-400" />

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Server className="h-4 w-4 text-indigo-400" />
          <span>Connecting to MCP backend</span>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Loading agents, tools, resources and prompts
        </p>
      </div>
    </div>
  );
}
