
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Eye,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import {
  approveAgent,
  getAgentRecords,
  rejectAgent,
} from "@/lib/api";

import type {
  AgentRecord,
  ApprovalStatus,
} from "@/types/agents";

import { useAuth } from "@/context/AuthContext";

type ReviewAction = "approve" | "reject";
type ReviewFilter = "pending" | "all";

function getStatusColor(status: ApprovalStatus): string {
  switch (status) {
    case "approved":
      return "text-emerald-400";
    case "rejected":
      return "text-red-400";
    case "pending":
      return "text-amber-400";
    default:
      return "text-slate-400";
  }
}

export default function AgentReviews() {
  const { user } = useAuth();

  const [records, setRecords] = useState<AgentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ReviewFilter>("pending");

  const [selected, setSelected] =
    useState<AgentRecord | null>(null);

  const [action, setAction] =
    useState<ReviewAction | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] =
    useState<string | null>(null);
  const [success, setSuccess] =
    useState<string | null>(null);

  const isReviewer =
    user?.role === "admin" || user?.role === "manager";

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAgentRecords();
      setRecords(result);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load agent reviews."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isReviewer) {
      void loadRecords();
    }
  }, [isReviewer, loadRecords]);

  const pendingCount = records.filter(
    (record) => record.approval_status === "pending"
  ).length;

  const approvedCount = records.filter(
    (record) => record.approval_status === "approved"
  ).length;


/*
 * AGENT SEARCH AND STATUS FILTER
 *
 * Safely handle nullable agent fields to prevent
 * runtime errors when searching agent records.
 */
const normalizedSearch = search.trim().toLowerCase();

const filteredRecords = records.filter((record) => {
  // Filter by approval status.
  if (
    filter === "pending" &&
    record.approval_status !== "pending"
  ) {
    return false;
  }

  // Safely normalize searchable fields.
  const name = (
    record.configuration.name ?? ""
  ).toLowerCase();

  const description = (
    record.configuration.description ?? ""
  ).toLowerCase();

  const ownerId = (
    record.owner_id ?? ""
  ).toLowerCase();

  // Return matching agents.
  return (
    name.includes(normalizedSearch) ||
    description.includes(normalizedSearch) ||
    ownerId.includes(normalizedSearch)
  );
});


  function canReview(record: AgentRecord): boolean {
    return (
      record.approval_status === "pending" &&
      record.owner_id !== user?.id
    );
  }

  function openDetails(
    record: AgentRecord,
    reviewAction: ReviewAction | null = null
  ) {
    setSelected(record);
    setAction(reviewAction);
    setModalError(null);
  }

  function closeModal() {
    if (processing) return;

    setSelected(null);
    setAction(null);
    setModalError(null);
  }

  async function handleReview() {
    if (!selected || !action || processing) return;

    if (!canReview(selected)) {
      setModalError(
        "You cannot review this agent submission."
      );
      return;
    }

    setProcessing(true);
    setModalError(null);
    setSuccess(null);

    try {
      const agentId = selected.configuration.id;
      const expectedVersion = selected.version;

      if (action === "approve") {
        await approveAgent(agentId, expectedVersion);
      } else {
        await rejectAgent(agentId, expectedVersion);
      }

      setSuccess(
        `Agent "${selected.configuration.name}" ${
          action === "approve" ? "approved" : "rejected"
        } successfully.`
      );

      setSelected(null);
      setAction(null);

      await loadRecords();
    } catch (caught) {
      setModalError(
        caught instanceof Error
          ? caught.message
          : "Unable to complete agent review."
      );
    } finally {
      setProcessing(false);
    }
  }

  if (!isReviewer) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* HEADER */}

      <div>
        <h2 className="text-xl font-semibold text-white">
          Agent Reviews
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Review submitted MCP agents and manage approval
          decisions.
        </p>
      </div>

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Agents",
            value: records.length,
          },
          {
            label: "Pending Reviews",
            value: pendingCount,
          },
          {
            label: "Approved Agents",
            value: approvedCount,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-[#101827] p-5"
          >
            <p className="text-sm text-slate-400">
              {item.label}
            </p>

            <p className="mt-2 text-2xl font-semibold text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* SUCCESS MESSAGE */}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300"
        >
          {success}
        </div>
      )}

      {/* AGENT TABLE */}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101827]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <ClipboardCheck
                size={19}
                className="text-indigo-400"
              />
              Agent Submissions
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {filteredRecords.length} matching agents
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* STATUS FILTER */}

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value as ReviewFilter
                )
              }
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="pending">
                Pending
              </option>

              <option value="all">
                All Agents
              </option>
            </select>

            {/* SEARCH */}

            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950 px-3">
              <Search
                size={16}
                className="text-slate-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search agents..."
                className="w-40 bg-transparent py-2.5 text-sm text-white outline-none"
              />
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => void loadRecords()}
              disabled={loading || processing}
              aria-label="Refresh agent reviews"
              title="Refresh"
              className="rounded-lg border border-white/10 p-2.5 text-slate-300 hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="p-5 text-sm text-red-400"
          >
            {error}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-4">
                  Agent
                </th>

                <th className="px-5 py-4">
                  Owner ID
                </th>

                <th className="px-5 py-4">
                  Version
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {!loading &&
                filteredRecords.map((record) => (
                  <tr
                    key={record.configuration.id}
                    className="hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {record.configuration.name}
                      </p>

                      <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                        {record.configuration.description}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-400">
                      {record.owner_id}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      v{record.version}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`capitalize ${getStatusColor(
                          record.approval_status
                        )}`}
                      >
                        {record.approval_status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* VIEW */}

                        <button
                          type="button"
                          title="View agent"
                          aria-label={`View ${record.configuration.name}`}
                          onClick={() =>
                            openDetails(record)
                          }
                          className="text-slate-400 hover:text-white"
                        >
                          <Eye size={17} />
                        </button>

                        {/* APPROVE */}

                        {canReview(record) && (
                          <>
                            <button
                              type="button"
                              title="Approve agent"
                              aria-label={`Approve ${record.configuration.name}`}
                              onClick={() =>
                                openDetails(
                                  record,
                                  "approve"
                                )
                              }
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <CheckCircle2 size={17} />
                            </button>

                            {/* REJECT */}

                            <button
                              type="button"
                              title="Reject agent"
                              aria-label={`Reject ${record.configuration.name}`}
                              onClick={() =>
                                openDetails(
                                  record,
                                  "reject"
                                )
                              }
                              className="text-red-400 hover:text-red-300"
                            >
                              <XCircle size={17} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {loading && (
            <p className="p-8 text-center text-sm text-slate-400">
              Loading agent reviews...
            </p>
          )}

          {!loading &&
            !error &&
            filteredRecords.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-400">
                No matching agents found.
              </p>
            )}
        </div>
      </section>

      {/* DETAILS / CONFIRMATION MODAL */}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Agent review details"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101827] p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {action === "approve"
                  ? "Approve Agent"
                  : action === "reject"
                    ? "Reject Agent"
                    : "Agent Details"}
              </h3>

              <button
                type="button"
                onClick={closeModal}
                disabled={processing}
                aria-label="Close"
                className="text-slate-400 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* NAME */}

              <div>
                <p className="text-slate-400">
                  Name
                </p>

                <p className="mt-1 font-medium text-white">
                  {selected.configuration.name}
                </p>
              </div>

              {/* DESCRIPTION */}

              <div>
                <p className="text-slate-400">
                  Description
                </p>

                <p className="mt-1 whitespace-pre-wrap text-slate-200">
                  {selected.configuration.description}
                </p>
              </div>

              {/* OWNER / VERSION / STATUS */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-slate-400">
                    Owner ID
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-white">
                    {selected.owner_id}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">
                    Version
                  </p>

                  <p className="mt-1 text-white">
                    {selected.version}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">
                    Approval Status
                  </p>

                  <p
                    className={`mt-1 capitalize ${getStatusColor(
                      selected.approval_status
                    )}`}
                  >
                    {selected.approval_status}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">
                    Tool Access
                  </p>

                  <p className="mt-1 capitalize text-white">
                    {selected.configuration.tool_access}
                  </p>
                </div>
              </div>

              {/* ALLOWED TOOLS */}

              <div>
                <p className="text-slate-400">
                  Allowed Tools
                </p>

                <p className="mt-1 break-words text-slate-200">
                  {selected.configuration.tool_access === "all"
                    ? "All available tools"
                    : selected.configuration.allowed_tools.join(
                        ", "
                      ) || "None"}
                </p>
              </div>

              {/* SYSTEM PROMPT */}

              <div>
                <p className="mb-2 text-slate-400">
                  System Prompt
                </p>

                <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200">
                  {selected.configuration.system_prompt}
                </pre>
              </div>

              {/* CACHE CONFIGURATION */}

              <div>
                <p className="mb-2 text-slate-400">
                  Cache Configuration
                </p>

                <p className="text-slate-200">
                  {selected.configuration.cache.enabled
                    ? `Enabled (${selected.configuration.cache.ttl_seconds}s TTL)`
                    : "Disabled"}
                </p>
              </div>

              {/* METADATA */}

              <div>
                <p className="mb-2 text-slate-400">
                  Agent Metadata
                </p>

                <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-slate-950 p-4 font-mono text-xs text-slate-200">
                  {JSON.stringify(
                    selected.configuration.metadata,
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            {/* CONFIRMATION MESSAGE */}

            {action && (
              <p className="mt-5 rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-slate-300">
                {action === "approve"
                  ? "Confirm approval of this agent version. Once approved, the agent can be executed by authorized users."
                  : "Confirm rejection of this agent submission. The agent will not be executable."}
              </p>
            )}

            {/* MODAL ERROR */}

            {modalError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {modalError}
              </p>
            )}

            {/* MODAL ACTIONS */}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={processing}
                className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
              >
                {action ? "Cancel" : "Close"}
              </button>

              {action ? (
                <button
                  type="button"
                  onClick={() => void handleReview()}
                  disabled={processing}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
                    action === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-red-600 hover:bg-red-500"
                  }`}
                >
                  {processing
                    ? "Processing..."
                    : action === "approve"
                      ? "Confirm Approval"
                      : "Confirm Rejection"}
                </button>
              ) : (
                canReview(selected) && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setAction("reject")
                      }
                      className="rounded-lg bg-red-600 px-4 py-2.5 text-sm text-white hover:bg-red-500"
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAction("approve")
                      }
                      className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm text-white hover:bg-emerald-500"
                    >
                      Approve
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
