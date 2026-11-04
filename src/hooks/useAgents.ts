
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createAgent,
  deleteAgent,
  getAgents,
  getAgentRecords,
  submitAgent,
  updateAgent,
} from "@/lib/api";

import { useAuth } from "@/context/AuthContext";

import type {
  AgentConfig,
  AgentRecord,
} from "@/types/agents";

export function useAgents() {
  const {
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  // Only approved agents are available for execution.
  const [agents, setAgents] = useState<AgentConfig[]>([]);

  // All agent records, including approval statuses.
  const [agentRecords, setAgentRecords] = useState<AgentRecord[]>([]);

  const [selectedAgentId, setSelectedAgentId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refresh agent configurations and approval records.
   *
   * Only approved agents are included in the executable list.
   */
  const refreshAgents = useCallback(async (): Promise<void> => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setAgents([]);
      setAgentRecords([]);
      setSelectedAgentId(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [configs, records] = await Promise.all([
        getAgents(),
        getAgentRecords(),
      ]);

      // Identify agents that have been approved.
      const approvedIds = new Set(
        records
          .filter(
            (record) =>
              record.approval_status === "approved"
          )
          .map((record) => record.configuration.id)
      );

      // Saved Agents should contain approved agents only.
      const approvedAgents = configs.filter((agent) =>
        approvedIds.has(agent.id)
      );

      setAgents(approvedAgents);
      setAgentRecords(records);

      // Keep selection only if the agent remains approved.
      setSelectedAgentId((previous) => {
        if (
          previous &&
          approvedAgents.some(
            (agent) => agent.id === previous
          )
        ) {
          return previous;
        }

        return approvedAgents[0]?.id ?? null;
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load agents."
      );
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    void refreshAgents();
  }, [refreshAgents]);

  // Selected executable agent.
  const selectedAgent =
    agents.find(
      (agent) => agent.id === selectedAgentId
    ) ?? null;

  // Approval record for the selected agent.
  const selectedAgentRecord =
    agentRecords.find(
      (record) =>
        record.configuration.id === selectedAgentId
    ) ?? null;

  // Group records by approval status.
  const draftAgents = agentRecords.filter(
    (record) => record.approval_status === "draft"
  );

  const pendingAgents = agentRecords.filter(
    (record) => record.approval_status === "pending"
  );

  const approvedAgentRecords = agentRecords.filter(
    (record) => record.approval_status === "approved"
  );

  const rejectedAgents = agentRecords.filter(
    (record) => record.approval_status === "rejected"
  );

  /**
   * Create a new agent.
   *
   * Newly created agents are not added to Saved Agents
   * until their approval status becomes approved.
   */
  const addAgent = useCallback(
    async (input: AgentConfig): Promise<AgentConfig> => {
      const saved = await createAgent(input);

      await refreshAgents();

      return saved;
    },
    [refreshAgents]
  );

  /**
   * Update an existing agent using version validation.
   *
   * Refreshes approval status after updating.
   */
  const editAgent = useCallback(
    async (input: AgentConfig): Promise<AgentConfig> => {
      const records = await getAgentRecords();

      const record = records.find(
        (item) => item.configuration.id === input.id
      );

      if (!record) {
        throw new Error(
          "Agent record not found. Please refresh and try again."
        );
      }

      const saved = await updateAgent(input.id, {
        agent: input,
        expected_version: record.version,
      });

      await refreshAgents();

      return saved;
    },
    [refreshAgents]
  );

  /**
   * Delete an agent and refresh all agent lists.
   */
  const removeAgent = useCallback(
    async (agentId: string): Promise<void> => {
      await deleteAgent(agentId);

      setAgents((previous) =>
        previous.filter((agent) => agent.id !== agentId)
      );

      setAgentRecords((previous) =>
        previous.filter(
          (record) =>
            record.configuration.id !== agentId
        )
      );

      setSelectedAgentId((previous) =>
        previous === agentId ? null : previous
      );

      await refreshAgents();
    },
    [refreshAgents]
  );

  /**
   * Submit a draft agent for Admin or Manager approval.
   *
   * Only draft agents can be submitted.
   */
  const submitForApproval = useCallback(
    async (agentId: string): Promise<void> => {
      const records = await getAgentRecords();

      const record = records.find(
        (item) => item.configuration.id === agentId
      );

      if (!record) {
        throw new Error(
          "Agent record not found. Please refresh and try again."
        );
      }

      if (record.approval_status !== "draft") {
        throw new Error(
          `Cannot submit an agent with status "${record.approval_status}". Only draft agents can be submitted.`
        );
      }

      await submitAgent(agentId, record.version);

      await refreshAgents();
    },
    [refreshAgents]
  );

  return {
    // Approved agents only.
    agents,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,

    // All agent records.
    agentRecords,
    selectedAgentRecord,

    // Approval-status groups.
    draftAgents,
    pendingAgents,
    approvedAgentRecords,
    rejectedAgents,

    // Loading and errors.
    loading,
    error,

    // CRUD operations.
    refreshAgents,
    addAgent,
    editAgent,
    removeAgent,

    // Approval workflow.
    submitForApproval,
  };
}
