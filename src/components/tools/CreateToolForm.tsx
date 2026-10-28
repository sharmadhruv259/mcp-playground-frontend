
"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";

import type {
  CreateToolInput,
  ToolParameter,
} from "@/types/tools";

interface CreateToolFormProps {
  onClose: () => void;
  onCreate: (input: CreateToolInput) => string | null;
}

const MCP_RESOURCES = [
  "project://requirements",
  "project://architecture",
];

const MCP_PROMPTS = [
  "summarize_project",
  "explain_technical",
];

const EMPTY_TOOL: CreateToolInput = {
  name: "",
  description: "",
  parameters: [],
  prompt_instructions: "",
  action: {
    type: "mcp_context",
    resource_uris: [],
  },
};

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500";

/**
 * Display the MCP-backed custom tool creation form.
 *
 * Args:
 *     props (CreateToolFormProps): Callbacks for closing the
 *         form and registering a custom tool.
 *
 * Returns:
 *     JSX.Element: Modal containing the tool configuration form.
 *
 * Raises:
 *     None: Validation errors are displayed in the form.
 */
export default function CreateToolForm({
  onClose,
  onCreate,
}: CreateToolFormProps) {
  const [form, setForm] = useState<CreateToolInput>(
    EMPTY_TOOL
  );
  const [error, setError] = useState<string | null>(null);

  /**
   * Add an empty tool parameter.
   *
   * Args:
   *     None: Uses the current form state.
   *
   * Returns:
   *     void: Updates the parameter list.
   *
   * Raises:
   *     None: No exceptions are intentionally raised.
   */
  function addParameter(): void {
    setForm((previous) => ({
      ...previous,
      parameters: [
        ...previous.parameters,
        {
          name: "",
          description: "",
          type: "string",
          required: false,
        },
      ],
    }));
  }

  /**
   * Update a tool parameter.
   *
   * Args:
   *     index (number): Parameter index.
   *     updates (Partial<ToolParameter>): Fields to update.
   *
   * Returns:
   *     void: Updates the parameter.
   *
   * Raises:
   *     None: No exceptions are intentionally raised.
   */
  function updateParameter(
    index: number,
    updates: Partial<ToolParameter>
  ): void {
    setForm((previous) => ({
      ...previous,
      parameters: previous.parameters.map(
        (parameter, position) =>
          position === index
            ? { ...parameter, ...updates }
            : parameter
      ),
    }));
  }

  /**
   * Remove a tool parameter.
   *
   * Args:
   *     index (number): Parameter index to remove.
   *
   * Returns:
   *     void: Removes the selected parameter.
   *
   * Raises:
   *     None: No exceptions are intentionally raised.
   */
  function removeParameter(index: number): void {
    setForm((previous) => ({
      ...previous,
      parameters: previous.parameters.filter(
        (_, position) => position !== index
      ),
    }));
  }

  /**
   * Toggle an MCP resource for the custom tool.
   *
   * Args:
   *     uri (string): MCP resource URI.
   *
   * Returns:
   *     void: Updates the selected resource URIs.
   *
   * Raises:
   *     None: No exceptions are intentionally raised.
   */
  function toggleResource(uri: string): void {
    setForm((previous) => {
      const selected = previous.action.resource_uris;

      const resource_uris = selected.includes(uri)
        ? selected.filter((item) => item !== uri)
        : [...selected, uri];

      return {
        ...previous,
        action: {
          ...previous.action,
          resource_uris,
        },
      };
    });
  }

  /**
   * Update the selected reusable MCP prompt.
   *
   * Args:
   *     promptName (string): Selected prompt name.
   *
   * Returns:
   *     void: Updates the MCP prompt configuration.
   *
   * Raises:
   *     None: No exceptions are intentionally raised.
   */
  function updateMCPPrompt(promptName: string): void {
    setForm((previous) => ({
      ...previous,
      action: {
        ...previous.action,
        prompt_name: promptName || undefined,
        prompt_arguments: promptName
          ? { audience: "developer" }
          : undefined,
      },
    }));
  }

  /**
   * Validate and submit the custom tool.
   *
   * Args:
   *     event (FormEvent<HTMLFormElement>): Submit event.
   *
   * Returns:
   *     void: Registers the tool or displays an error.
   *
   * Raises:
   *     None: Validation errors are returned by onCreate.
   */
  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();
    setError(null);

    const validationError = onCreate(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-tool-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <h2
              id="create-tool-title"
              className="text-lg font-semibold text-white"
            >
              Create New Tool
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Create a Groq tool powered by MCP context.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto p-5"
        >
          {/* Tool Name */}
          <div className="space-y-2">
            <label
              htmlFor="tool-name"
              className="text-sm font-medium text-slate-300"
            >
              Tool Name
            </label>

            <input
              id="tool-name"
              value={form.name}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
              placeholder="get_project_insights"
              className={INPUT_CLASS}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="tool-description"
              className="text-sm font-medium text-slate-300"
            >
              Description
            </label>

            <textarea
              id="tool-description"
              value={form.description}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              placeholder="Describe when Groq should use this tool."
              rows={3}
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

          {/* Input Parameters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Input Parameters
              </h3>

              <button
                type="button"
                onClick={addParameter}
                className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                <Plus size={15} />
                Add Parameter
              </button>
            </div>

            {form.parameters.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-700 p-4 text-xs text-slate-500">
                No parameters configured. This tool will
                accept no additional inputs.
              </p>
            )}

            {form.parameters.map((parameter, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4"
              >
                <div className="flex items-center gap-2">
                  <input
                    aria-label={`Parameter ${index + 1} name`}
                    value={parameter.name}
                    onChange={(event) =>
                      updateParameter(index, {
                        name: event.target.value,
                      })
                    }
                    placeholder="Parameter name"
                    className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                  />

                  <select
                    aria-label={`Parameter ${index + 1} type`}
                    value={parameter.type}
                    onChange={(event) =>
                      updateParameter(index, {
                        type: event.target
                          .value as ToolParameter["type"],
                      })
                    }
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-white"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => removeParameter(index)}
                    aria-label={`Remove parameter ${index + 1}`}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <input
                  aria-label={`Parameter ${index + 1} description`}
                  value={parameter.description}
                  onChange={(event) =>
                    updateParameter(index, {
                      description: event.target.value,
                    })
                  }
                  placeholder="Parameter description"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                />

                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={parameter.required}
                    onChange={(event) =>
                      updateParameter(index, {
                        required: event.target.checked,
                      })
                    }
                    className="accent-indigo-500"
                  />
                  Required parameter
                </label>
              </div>
            ))}
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <label
              htmlFor="custom-prompt"
              className="text-sm font-medium text-slate-300"
            >
              Custom Prompt
            </label>

            <p className="text-xs leading-5 text-slate-400">
              These instructions will be saved with the tool
              and used by Groq when generating answers.
            </p>

            <textarea
              id="custom-prompt"
              value={form.prompt_instructions}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  prompt_instructions: event.target.value,
                }))
              }
              placeholder="You are a technical assistant. Answer the user's question using MCP resources. Do not invent missing information."
              rows={5}
              className={`${INPUT_CLASS} resize-y`}
            />
          </div>

          {/* MCP Resources */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">
              MCP Resources
            </h3>

            <p className="text-xs text-slate-400">
              Select the MCP resources this tool should use.
            </p>

            <div className="space-y-2">
              {MCP_RESOURCES.map((uri) => (
                <label
                  key={uri}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-3"
                >
                  <input
                    type="checkbox"
                    checked={form.action.resource_uris.includes(
                      uri
                    )}
                    onChange={() => toggleResource(uri)}
                    className="accent-indigo-500"
                  />

                  <span className="text-sm text-slate-300">
                    {uri}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* MCP Prompt */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">
              MCP Prompt
            </h3>

            <p className="text-xs text-slate-400">
              Optionally retrieve a reusable prompt from
              the MCP server.
            </p>

            <select
              aria-label="MCP Prompt"
              value={form.action.prompt_name ?? ""}
              onChange={(event) =>
                updateMCPPrompt(event.target.value)
              }
              className={INPUT_CLASS}
            >
              <option value="">No MCP prompt</option>

              {MCP_PROMPTS.map((prompt) => (
                <option key={prompt} value={prompt}>
                  {prompt}
                </option>
              ))}
            </select>

            {form.action.prompt_name && (
              <div className="space-y-2">
                <label
                  htmlFor="prompt-audience"
                  className="text-xs font-medium text-slate-300"
                >
                  Prompt Audience
                </label>

                <select
                  id="prompt-audience"
                  value={
                    form.action.prompt_arguments
                      ?.audience ?? "developer"
                  }
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      action: {
                        ...previous.action,
                        prompt_arguments: {
                          audience: event.target.value,
                        },
                      },
                    }))
                  }
                  className={INPUT_CLASS}
                >
                  <option value="developer">
                    Developer
                  </option>
                  <option value="manager">
                    Manager
                  </option>
                </select>
              </div>
            )}
          </div>

          {/* Action Summary */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <h3 className="text-sm font-semibold text-indigo-300">
              Tool Execution
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Action: MCP Context + Groq Response.
              The backend will retrieve the selected MCP
              context and use your custom prompt to generate
              an answer for the user's question.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Create Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
