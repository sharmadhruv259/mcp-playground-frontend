
"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  X,
  Send,
  Save,
} from "lucide-react";

import type { AgentConfig } from "@/types/agents";

interface AgentFormProps {
  agent?: AgentConfig | null;
  onClose: () => void;
  onSave: (agent: AgentConfig) => Promise<void>;
  onSaveAndSubmit?: (agent: AgentConfig) => Promise<void>;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 disabled:opacity-50";

export default function AgentForm({
  agent,
  onClose,
  onSave,
  onSaveAndSubmit,
}: AgentFormProps) {
  const [form, setForm] = useState<AgentConfig>(
    () =>
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
  const [savingAction, setSavingAction] = useState<
    "draft" | "submit" | null
  >(null);

  const [error, setError] = useState<string | null>(null);

  // Prevent repeated submissions before React updates state.
  const busyRef = useRef(false);

  // If creation succeeded but submission failed, the agent
  // already exists. Retrying must not create it again.
  const createdRef = useRef(false);

  // Preserve the last successfully saved configuration.
  const savedConfigRef = useRef<AgentConfig | null>(null);

  const [retrySubmissionOnly, setRetrySubmissionOnly] =
    useState(false);

  function updateForm(
    changes: Partial<AgentConfig>
  ): void {
    setForm((previous) => ({
      ...previous,
      ...changes,
    }));

    // Any modification requires saving the draft again.
    setRetrySubmissionOnly(false);
  }

  async function saveAgent(
    submitForReview: boolean
  ): Promise<void> {
    if (busyRef.current) {
      return;
    }

    if (!form.name.trim()) {
      setError("Agent name is required.");
      return;
    }

    if (!form.system_prompt.trim()) {
      setError("System prompt is required.");
      return;
    }

    if (
      form.cache.enabled &&
      (!Number.isInteger(form.cache.ttl_seconds) ||
        form.cache.ttl_seconds < 1)
    ) {
      setError(
        "Cache TTL must be a positive integer."
      );
      return;
    }

    const payload: AgentConfig = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      system_prompt: form.system_prompt.trim(),
    };

    busyRef.current = true;
    setSaving(true);
    setSavingAction(
      submitForReview ? "submit" : "draft"
    );
    setError(null);

    try {
      if (submitForReview) {
        if (!onSaveAndSubmit) {
          throw new Error(
            "Agent submission is not configured."
          );
        }

        if (
          retrySubmissionOnly &&
          savedConfigRef.current
        ) {
          // Retry with the existing saved agent.
          await onSaveAndSubmit(
            savedConfigRef.current
          );
        } else {
          await onSaveAndSubmit(payload);
        }

        onClose();
        return;
      }

      await onSave(payload);
      onClose();
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Unable to save agent.";

      setError(message);

      // The parent integration should explicitly track whether
      // the save succeeded before submission failed.
      // Do not assume a failed callback means an agent was saved.
    } finally {
      busyRef.current = false;
      setSaving(false);
      setSavingAction(null);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    await saveAgent(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-form-title"
        className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
      >
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <h2
              id="agent-form-title"
              className="text-lg font-semibold text-white"
            >
              {agent
                ? "Edit Agent"
                : "Create Agent"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Save as a draft or submit for review.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] space-y-5 overflow-y-auto p-5"
        >
          {/* NAME */}

          <div className="space-y-2">
            <label
              htmlFor="agent-name"
              className="text-sm text-slate-300"
            >
              Agent Name
            </label>

            <input
              id="agent-name"
              value={form.name}
              onChange={(event) =>
                updateForm({
                  name: event.target.value,
                })
              }
              placeholder="Project Assistant"
              disabled={saving}
              required
              className={INPUT_CLASS}
            />
          </div>

          {/* DESCRIPTION */}

          <div className="space-y-2">
            <label
              htmlFor="agent-description"
              className="text-sm text-slate-300"
            >
              Description
            </label>

            <textarea
              id="agent-description"
              value={form.description}
              onChange={(event) =>
                updateForm({
                  description: event.target.value,
                })
              }
              placeholder="Describe what this agent does..."
              rows={2}
              disabled={saving}
              className={INPUT_CLASS}
            />
          </div>

          {/* SYSTEM PROMPT */}

          <div className="space-y-2">
            <label
              htmlFor="agent-system-prompt"
              className="text-sm text-slate-300"
            >
              System Prompt
            </label>

            <textarea
              id="agent-system-prompt"
              value={form.system_prompt}
              onChange={(event) =>
                updateForm({
                  system_prompt: event.target.value,
                })
              }
              rows={5}
              disabled={saving}
              required
              className={INPUT_CLASS}
            />
          </div>

          {/* CACHE */}

          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.cache.enabled}
              disabled={saving}
              onChange={(event) => {
                setForm((previous) => ({
                  ...previous,
                  cache: {
                    ...previous.cache,
                    enabled: event.target.checked,
                  },
                }));
                setRetrySubmissionOnly(false);
              }}
              className="accent-indigo-500"
            />

            Enable MCP resource and prompt caching
          </label>

          {form.cache.enabled && (
            <div className="space-y-2">
              <label
                htmlFor="agent-cache-ttl"
                className="text-sm text-slate-300"
              >
                Cache TTL (seconds)
              </label>

              <input
                id="agent-cache-ttl"
                type="number"
                min={1}
                step={1}
                value={form.cache.ttl_seconds}
                disabled={saving}
                onChange={(event) => {
                  setForm((previous) => ({
                    ...previous,
                    cache: {
                      ...previous.cache,
                      ttl_seconds: Number(
                        event.target.value
                      ),
                    },
                  }));
                  setRetrySubmissionOnly(false);
                }}
                className={INPUT_CLASS}
              />
            </div>
          )}

          {/* INFORMATION */}

          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs leading-5 text-slate-300">
            <p className="font-medium text-indigo-300">
              Agent Approval Workflow
            </p>

            <p className="mt-1">
              Save Draft stores the agent without
              submitting it for approval.
            </p>

            <p className="mt-1">
              Save & Submit for Approval requests
              review by an Admin or Manager.
              The agent must be approved before
              execution.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {/* ACTIONS */}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <Save size={16} />

              {savingAction === "draft"
                ? "Saving..."
                : agent
                  ? "Save Changes"
                  : "Save Draft"}
            </button>

            {onSaveAndSubmit && (
              <button
                type="button"
                onClick={() => {
                  void saveAgent(true);
                }}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                <Send size={16} />

                {savingAction === "submit"
                  ? "Submitting..."
                  : "Save & Submit for Approval"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
