
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  Pencil,
  RefreshCw,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  getAdminTools,
  setAdminToolEnabled,
  updateAdminTool,
} from "@/lib/api";

import type { ManagedTool } from "@/types/tool-management";

export default function ToolManagement() {
  const [tools, setTools] = useState<ManagedTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyTool, setBusyTool] = useState<string | null>(null);
  const [editingTool, setEditingTool] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTools = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminTools();
      setTools(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load MCP tools."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTools();
  }, [loadTools]);

  const replaceTool = (updated: ManagedTool) => {
    setTools((current) =>
      current.map((tool) =>
        tool.name === updated.name ? updated : tool
      )
    );
  };

  const toggleTool = async (tool: ManagedTool) => {
    if (busyTool) return;

    setBusyTool(tool.name);
    setError(null);
    setSuccess(null);

    try {
      const updated = await setAdminToolEnabled(
        tool.name,
        !tool.enabled
      );

      replaceTool(updated);

      setSuccess(
        `${tool.name} ${updated.enabled ? "enabled" : "disabled"} successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update tool status."
      );
    } finally {
      setBusyTool(null);
    }
  };

  const startEditing = (tool: ManagedTool) => {
    setEditingTool(tool.name);
    setDescription(tool.description);
    setError(null);
    setSuccess(null);
  };

  const saveDescription = async (toolName: string) => {
    if (busyTool) return;

    const updatedDescription = description.trim();

    if (!updatedDescription) {
      setError("Tool description cannot be empty.");
      return;
    }

    setBusyTool(toolName);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateAdminTool(
        toolName,
        { description: updatedDescription }
      );

      replaceTool(updated);
      setEditingTool(null);
      setSuccess("Tool description updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update tool description."
      );
    } finally {
      setBusyTool(null);
    }
  };

  const totalTools = tools.length;
  const enabledTools = tools.filter((tool) => tool.enabled).length;
  const disabledTools = totalTools - enabledTools;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            MCP Tool Registry
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage tool availability and configuration.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadTools()}
          disabled={loading || busyTool !== null}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Tools", value: totalTools },
          { label: "Enabled", value: enabledTools },
          { label: "Disabled", value: disabledTools },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-[#101827] p-5"
          >
            <p className="text-sm text-slate-400">
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300"
        >
          <Check size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101827]">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <ShieldCheck size={20} className="text-indigo-400" />
          <h3 className="font-semibold text-white">
            Registered MCP Operations
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            Loading tools...
          </div>
        ) : tools.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No tools found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">
                    Tool
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Type
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Description
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {tools.map((tool) => {
                  const isBusy = busyTool === tool.name;
                  const isEditing = editingTool === tool.name;

                  return (
                    <tr key={tool.name} className="align-top">
                      <td className="px-5 py-5">
                        <p className="break-all font-medium text-white">
                          {tool.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {tool.built_in ? "System operation" : "Custom operation"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                            tool.kind === "write"
                              ? "bg-amber-500/10 text-amber-300"
                              : "bg-indigo-500/10 text-indigo-300"
                          }`}
                        >
                          {tool.kind === "write" ? "Write" : "Read"}
                        </span>
                      </td>

                      <td className="max-w-sm px-5 py-5">
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={description}
                              onChange={(event) =>
                                setDescription(event.target.value)
                              }
                              rows={3}
                              disabled={isBusy}
                              className="w-full resize-y rounded-lg border border-white/10 bg-[#0d1422] p-3 text-sm text-white outline-none focus:border-indigo-500"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void saveDescription(tool.name)
                                }
                                disabled={isBusy}
                                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
                              >
                                <Save size={13} />
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTool(null)}
                                disabled={isBusy}
                                className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 disabled:opacity-50"
                              >
                                <X size={13} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400">
                            {tool.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${
                            tool.enabled
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-slate-500/10 text-slate-400"
                          }`}
                        >
                          {tool.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void toggleTool(tool)}
                            disabled={busyTool !== null}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${
                              tool.enabled
                                ? "border-red-500/20 text-red-300 hover:bg-red-500/10"
                                : "border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10"
                            }`}
                          >
                            {isBusy
                              ? "Updating..."
                              : tool.enabled
                                ? "Disable"
                                : "Enable"}
                          </button>

                          <button
                            type="button"
                            onClick={() => startEditing(tool)}
                            disabled={
                              busyTool !== null ||
                              editingTool !== null
                            }
                            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        Disabling an MCP operation removes it from the available
        agent capabilities and prevents execution through the
        dispatcher. Existing agent configurations are not deleted.
      </p>
    </div>
  );
}
