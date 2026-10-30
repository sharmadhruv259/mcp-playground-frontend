
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Sidebar from "@/components/layout/Sidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import ExecutionLog from "@/components/execution/ExecutionLog";
import AgentForm from "@/components/agents/AgentForm";
import FullScreenLoader from "@/components/layout/FullScreenLoader";

import {
  STARTER_PROMPTS,
  type StarterPrompt,
} from "@/constants/starters";

import { useAgents } from "@/hooks/useAgents";
import { useMCPCapabilities } from "@/hooks/useMCPCapabilities";
import { sendChatMessage } from "@/lib/api";

import type { AgentConfig } from "@/types/agents";
import type {
  ChatMessage,
  ExecutionEvent,
} from "@/types/chat";
import type {
  ToolDefinition,
  ToolMode,
} from "@/types/tools";

const MCP_TOOL_PREFIX = "mcp_tool__";

const RESOURCE_FUNCTION = "read_mcp_resource";
const PROMPT_FUNCTION = "get_mcp_prompt";

/**
 * Convert a frontend MCP tool name into its native name.
 *
 * Args:
 *     toolName (string | null): Frontend tool name.
 *
 * Returns:
 *     string | null: Native MCP tool name.
 */
function getNativeMCPToolName(
  toolName: string | null
): string | null {
  if (!toolName) {
    return null;
  }

  if (!toolName.startsWith(MCP_TOOL_PREFIX)) {
    return null;
  }

  const nativeName = toolName.slice(
    MCP_TOOL_PREFIX.length
  );

  return nativeName || null;
}

/**
 * Convert a native MCP tool name into its frontend name.
 *
 * Args:
 *     nativeName (string | null): Native MCP tool name.
 *
 * Returns:
 *     string | null: Frontend MCP tool name.
 */
function getFrontendMCPToolName(
  nativeName: string | null
): string | null {
  if (!nativeName) {
    return null;
  }

  if (nativeName.startsWith(MCP_TOOL_PREFIX)) {
    return nativeName;
  }

  return `${MCP_TOOL_PREFIX}${nativeName}`;
}

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [logCollapsed, setLogCollapsed] =
    useState(false);

  const [showAgentForm, setShowAgentForm] =
    useState(false);

  const [editingAgent, setEditingAgent] =
    useState<AgentConfig | null>(null);

  // Chat state.
  const [loading, setLoading] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  // MCP tool selection state.
  const [mode, setMode] =
    useState<ToolMode>("auto");

  const [selectedTool, setSelectedTool] =
    useState<string | null>(null);

  // Conversation and execution logs.
  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [events, setEvents] =
    useState<ExecutionEvent[]>([]);

  // Track active requests to prevent stale responses.
  const requestIdRef = useRef(0);
  const loadingRef = useRef(false);

  // Load saved agents from the backend.
  const {
    agents,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    loading: agentsLoading,
    error: agentsError,
    addAgent,
    editAgent,
    removeAgent,
  } = useAgents();

  // Discover available MCP capabilities.
  const {
    capabilities,
    loading: capabilitiesLoading,
    error: capabilitiesError,
  } = useMCPCapabilities();

  /*
   * Display the full-screen loader while initial
   * backend requests are running.
   */
  const isInitializing =
    agentsLoading || capabilitiesLoading;

  /*
   * When no custom agent is selected,
   * use the built-in Default Assistant.
   */
  const isDefaultAssistant = !selectedAgent;

  /*
   * Convert discovered MCP capabilities into
   * frontend tool definitions.
   */
  const availableTools = useMemo<ToolDefinition[]>(() => {
    const tools: ToolDefinition[] = [];

    // Native MCP tools.
    for (const tool of capabilities.tools) {
      tools.push({
        name: `${MCP_TOOL_PREFIX}${tool.name}`,
        description:
          tool.description ?? "MCP server tool.",
        source: "builtin",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      });
    }

    // MCP resources.
    if (capabilities.resources.length > 0) {
      tools.push({
        name: RESOURCE_FUNCTION,
        description:
          "Read documentation and resources from the MCP server.",
        source: "builtin",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      });
    }

    // MCP prompts.
    if (capabilities.prompts.length > 0) {
      tools.push({
        name: PROMPT_FUNCTION,
        description:
          "Retrieve reusable instructions from the MCP server.",
        source: "builtin",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      });
    }

    return tools;
  }, [capabilities]);

  /*
   * Restore saved tool permissions when switching
   * between custom agents.
   */
  useEffect(() => {
    if (!selectedAgent) {
      setMode("auto");
      setSelectedTool(null);
      return;
    }

    if (
      selectedAgent.tool_access === "selected" &&
      selectedAgent.allowed_tools.length > 0
    ) {
      setMode("manual");

      setSelectedTool(
        getFrontendMCPToolName(
          selectedAgent.allowed_tools[0]
        )
      );
    } else {
      setMode("auto");
      setSelectedTool(null);
    }
  }, [selectedAgentId, selectedAgent]);

  /**
   * Reset the active conversation.
   *
   * Returns:
   *     void: Clears messages and execution logs.
   */
  function resetConversation(): void {
    requestIdRef.current += 1;
    loadingRef.current = false;

    setLoading(false);
    setMessages([]);
    setEvents([]);

    setChatKey((previous) => previous + 1);
  }

  /**
   * Start a new conversation.
   */
  function handleNewChat(): void {
    resetConversation();
  }

  /**
   * Switch between the Default Assistant and custom agents.
   *
   * Args:
   *     agentId (string): Selected agent ID or empty string.
   */
  function handleAgentChange(agentId: string): void {
    resetConversation();

    setSelectedAgentId(agentId || null);
  }

  /**
   * Change MCP tool selection mode.
   *
   * Args:
   *     value (ToolMode): Auto or manual mode.
   */
  function handleModeChange(value: ToolMode): void {
    setMode(value);

    if (value === "auto") {
      setSelectedTool(null);
    }
  }

  /**
   * Create or update a saved custom agent.
   *
   * Args:
   *     input (AgentConfig): Agent configuration.
   *
   * Returns:
   *     Promise<void>: Completes after saving.
   *
   * Raises:
   *     Error: If the backend request fails.
   */
  async function handleSaveAgent(
    input: AgentConfig
  ): Promise<void> {
    if (editingAgent) {
      await editAgent(input);
    } else {
      await addAgent(input);
    }

    resetConversation();
  }

  /**
   * Delete the currently selected custom agent.
   *
   * Returns:
   *     Promise<void>: Completes after deletion.
   */
  async function handleDeleteAgent(): Promise<void> {
    if (!selectedAgent) {
      return;
    }

    const confirmed = window.confirm(
      `Delete agent "${selectedAgent.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeAgent(selectedAgent.id);

      resetConversation();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete agent."
      );
    }
  }

  /**
   * Send a message to the Default Assistant or custom agent.
   *
   * Args:
   *     message (string): User's message.
   *     override (object): Optional MCP tool selection override.
   *
   * Returns:
   *     Promise<void>: Updates the chat and execution logs.
   *
   * Raises:
   *     Error: Backend failures are handled in the chat UI.
   */
  async function handleSendMessage(
    message: string,
    override?: {
      mode: ToolMode;
      selectedTool: string | null;
    }
  ): Promise<void> {
    const trimmed = message.trim();

    if (!trimmed || loadingRef.current) {
      return;
    }

    loadingRef.current = true;

    const requestId = ++requestIdRef.current;

    const activeMode = override?.mode ?? mode;

    const activeTool = override
      ? override.selectedTool
      : selectedTool;

    setLoading(true);
    setEvents([]);

    // Display the user's message immediately.
    setMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      },
    ]);

    try {
      /*
       * DEFAULT ASSISTANT
       *
       * No custom agent is selected.
       *
       * Send only the user message.
       * The backend handles general chat through Groq.
       *
       * No MCP tools are executed.
       */
      if (!selectedAgent) {
        const result = await sendChatMessage(
          trimmed,
          null
        );

        // Ignore responses from previous conversations.
        if (requestId !== requestIdRef.current) {
          return;
        }

        setMessages((previous) => [
          ...previous,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.answer,
          },
        ]);

        // Default Assistant normally returns no MCP events.
        setEvents(result.events ?? []);

        return;
      }

      /*
       * CUSTOM MCP AGENT
       *
       * Preserve the original Auto/Manual tool
       * selection and permission behavior.
       */
      if (
        activeMode === "manual" &&
        (!activeTool ||
          !availableTools.some(
            (tool) => tool.name === activeTool
          ))
      ) {
        throw new Error(
          "Choose an available MCP operation in Manual mode."
        );
      }

      // Convert frontend tool names to native MCP names.
      const nativeToolName =
        activeMode === "manual"
          ? getNativeMCPToolName(activeTool)
          : null;

      /*
       * Backend allowed_tools stores native MCP
       * tool names without the Groq prefix.
       *
       * Resources and prompts are separate
       * MCP operations.
       */
      const updatedConfig: AgentConfig = {
        ...selectedAgent,

        tool_access:
          nativeToolName ? "selected" : "all",

        allowed_tools:
          nativeToolName
            ? [nativeToolName]
            : [],
      };

      /*
       * Save permission changes before invoking
       * the selected custom agent.
       */
      if (
        updatedConfig.tool_access !==
          selectedAgent.tool_access ||
        JSON.stringify(updatedConfig.allowed_tools) !==
          JSON.stringify(selectedAgent.allowed_tools)
      ) {
        await editAgent(updatedConfig);
      }

      /*
       * Send the message using the selected
       * custom agent's saved ID.
       */
      const result = await sendChatMessage(
        trimmed,
        selectedAgent.id
      );

      // Ignore responses from previous conversations.
      if (requestId !== requestIdRef.current) {
        return;
      }

      // Display the assistant's answer.
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.answer,
        },
      ]);

      // Display MCP execution events.
      setEvents(result.events ?? []);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const description =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      // Display a readable error message.
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Request failed: ${description}`,
        },
      ]);

      // Record backend failures in the execution panel.
      setEvents([
        {
          id: crypto.randomUUID(),
          tool: "backend_request",
          status: "failed",
          description,
        },
      ]);
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }

  /**
   * Execute a predefined starter question.
   *
   * Args:
   *     starter (StarterPrompt): Selected starter question.
   *
   * Returns:
   *     void: Sends the predefined question.
   */
  function handleStarterSelect(
    starter: StarterPrompt
  ): void {
    if (loadingRef.current) {
      return;
    }

    const nextMode: ToolMode = starter.tool
      ? "manual"
      : "auto";

    /*
     * Default Assistant does not have MCP access.
     *
     * Preserve the starter question, but do not
     * activate MCP tool selection.
     */
    if (isDefaultAssistant) {
      void handleSendMessage(starter.prompt, {
        mode: "auto",
        selectedTool: null,
      });

      return;
    }

    // Custom agents use the original starter behavior.
    setMode(nextMode);
    setSelectedTool(starter.tool);

    void handleSendMessage(starter.prompt, {
      mode: nextMode,
      selectedTool: starter.tool,
    });
  }

  /*
   * RESTORE ORIGINAL PREDEFINED QUESTIONS
   *
   * Do not hide MCP starter questions when the
   * Default Assistant is selected.
   *
   * This restores the original starter cards
   * based on the STARTER_PROMPTS configuration.
   */
  const availableStarters = STARTER_PROMPTS.filter(
    (starter) =>
      starter.tool === null ||
      availableTools.some(
        (tool) => tool.name === starter.tool
      )
  );

  return (
    <main className="flex h-screen overflow-hidden bg-slate-950">
      {/* Full-screen initialization loader */}
      {isInitializing && <FullScreenLoader />}

      {/* Left sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mode={mode}
        selectedTool={selectedTool}
        tools={availableTools}
        agents={agents}
        selectedAgentId={selectedAgentId}
        agentLoading={agentsLoading}
        onSelectAgent={handleAgentChange}
        onCreateAgent={() => {
          setEditingAgent(null);
          setShowAgentForm(true);
        }}
        onEditAgent={() => {
          if (!selectedAgent) {
            return;
          }

          setEditingAgent(selectedAgent);
          setShowAgentForm(true);
        }}
        onDeleteAgent={() => {
          void handleDeleteAgent();
        }}
        onToggle={() =>
          setSidebarCollapsed(
            (previous) => !previous
          )
        }
        onNewChat={handleNewChat}
        onModeChange={handleModeChange}
        onToolChange={setSelectedTool}
      />

      {/* Center chat panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        {(agentsError || capabilitiesError) && (
          <div
            role="alert"
            className="border-b border-red-500/20 bg-red-500/10 px-5 py-2 text-xs text-red-300"
          >
            {agentsError ?? capabilitiesError}
          </div>
        )}

        <ChatPanel
          key={chatKey}
          messages={messages}
          loading={loading}
          starters={availableStarters}
          onSelectStarter={handleStarterSelect}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Right execution log panel */}
      <ExecutionLog
        events={events}
        collapsed={logCollapsed}
        onToggle={() =>
          setLogCollapsed(
            (previous) => !previous
          )
        }
      />

      {/* Agent creation/editing modal */}
      {showAgentForm && (
        <AgentForm
          agent={editingAgent}
          onClose={() => {
            setShowAgentForm(false);
            setEditingAgent(null);
          }}
          onSave={handleSaveAgent}
        />
      )}
    </main>
  );
}
