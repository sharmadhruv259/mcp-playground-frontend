
"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";

import type { AgentConfig } from "@/types/agents";

interface AgentFormProps {
  agent?: AgentConfig | null;
  onClose: () => void;
  onSave: (agent: AgentConfig) => Promise<void>;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500";

export default function AgentForm({
  agent,
  onClose,
  onSave,
}: AgentFormProps) {
  const [form, setForm] = useState<AgentConfig>(
    agent ?? {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      system_prompt:
        "You are a helpful AI assistant. Use available MCP capabilities when relevant.",
      tool_access: "all",
      allowed_tools: [],
      cache: {
        enabled: false,
        ttl_seconds: 300,
      },
      metadata: {},
    }
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (!form.name.trim() || !form.system_prompt.trim()) {
      setError("Agent name and system prompt are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        system_prompt: form.system_prompt.trim(),
      });

      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save agent."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-form-title"
        className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <h2
            id="agent-form-title"
            className="text-lg font-semibold text-white"
          >
            {agent ? "Edit Agent" : "Create Agent"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] space-y-5 overflow-y-auto p-5"
        >
          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Agent Name
            </label>

            <input
              value={form.name}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
              placeholder="Project Assistant"
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              rows={2}
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              System Prompt
            </label>

            <textarea
              value={form.system_prompt}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  system_prompt: event.target.value,
                }))
              }
              rows={5}
              className={INPUT_CLASS}
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.cache.enabled}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  cache: {
                    ...previous.cache,
                    enabled: event.target.checked,
                  },
                }))
              }
              className="accent-indigo-500"
            />
            Enable MCP resource and prompt caching
          </label>

          {form.cache.enabled && (
            <div className="space-y-2">
              <label className="text-sm text-slate-300">
                Cache TTL (seconds)
              </label>

              <input
                type="number"
                min={1}
                value={form.cache.ttl_seconds}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    cache: {
                      ...previous.cache,
                      ttl_seconds: Number(event.target.value),
                    },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : agent
                  ? "Save Changes"
                  : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
