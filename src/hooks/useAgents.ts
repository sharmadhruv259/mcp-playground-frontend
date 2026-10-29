
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
  updateAgent,
} from "@/lib/api";

import type { AgentConfig } from "@/types/agents";

export function useAgents() {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [selectedAgentId, setSelectedAgentId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAgents();

      setAgents(result);

      setSelectedAgentId((previous) => {
        if (
          previous &&
          result.some((agent) => agent.id === previous)
        ) {
          return previous;
        }

        return result[0]?.id ?? null;
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load agents."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAgents();
  }, [refreshAgents]);

  const selectedAgent =
    agents.find(
      (agent) => agent.id === selectedAgentId
    ) ?? null;

  const addAgent = useCallback(
    async (input: AgentConfig): Promise<AgentConfig> => {
      const saved = await createAgent(input);

      setAgents((previous) => [...previous, saved]);
      setSelectedAgentId(saved.id);

      return saved;
    },
    []
  );

  const editAgent = useCallback(
    async (input: AgentConfig): Promise<AgentConfig> => {
      const saved = await updateAgent(input.id, input);

      setAgents((previous) =>
        previous.map((agent) =>
          agent.id === saved.id ? saved : agent
        )
      );

      return saved;
    },
    []
  );

  const removeAgent = useCallback(
    async (agentId: string): Promise<void> => {
      await deleteAgent(agentId);

      setAgents((previous) => {
        const remaining = previous.filter(
          (agent) => agent.id !== agentId
        );

        setSelectedAgentId((selected) =>
          selected === agentId
            ? remaining[0]?.id ?? null
            : selected
        );

        return remaining;
      });
    },
    []
  );

  return {
    agents,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    loading,
    error,
    refreshAgents,
    addAgent,
    editAgent,
    removeAgent,
  };
}
