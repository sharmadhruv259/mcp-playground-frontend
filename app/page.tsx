
"use client";

import { useRef, useState } from "react";


import Sidebar from "@/components/layout/Sidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import ExecutionLog from "@/components/execution/ExecutionLog";
import CreateToolForm from "@/components/tools/CreateToolForm";
import { STARTER_PROMPTS, type StarterPrompt } from "@/constants/starters";


import { DEFAULT_TOOL_SELECTION } from "@/constants/defaults";
import { useTools } from "@/hooks/useTools";
import { sendChatMessage } from "@/lib/api";

import type { ChatMessage, ExecutionEvent } from "@/types/chat";
import type { ToolMode } from "@/types/tools";

/**
 * Render the MCP Playground application.
 *
 * Args:
 *     None: The page manages its own frontend state.
 *
 * Returns:
 *     JSX.Element: Three-panel MCP Playground interface.
 *
 * Raises:
 *     None: Backend errors are displayed in the chat.
 */
export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logCollapsed, setLogCollapsed] = useState(false);
  const [showCreateTool, setShowCreateTool] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  const [mode, setMode] = useState<ToolMode>(DEFAULT_TOOL_SELECTION.mode);

  const [selectedTool, setSelectedTool] = useState<string | null>(
    DEFAULT_TOOL_SELECTION.selectedTool
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<ExecutionEvent[]>([]);

  const requestIdRef = useRef(0);

  const { tools, addTool, removeTool } = useTools();

  /**
   * Submit a message to FastAPI and display the result.
   *
   * Args:
   *     message (string): User's question.
   *
   * Returns:
   *     Promise<void>: Updates the chat and execution log.
   *
   * Raises:
   *     None: Request errors are caught and displayed.
   */
  async function handleSendMessage(message: string): Promise<void> {
    if (loading) {
      return;
    }

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setEvents([]);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((previous) => [...previous, userMessage]);

    try {
      const result = await sendChatMessage(
        message,
        mode,
        selectedTool,
        tools
      );

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

      setEvents(result.events);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const description =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Backend error: ${description}`,
        },
      ]);

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
        setLoading(false);
      }
    }
  }

  /**
   * Start a fresh chat and reset all conversation state.
   *
   * Args:
   *     None: Uses the current page state setters.
   *
   * Returns:
   *     void: Clears messages, events, and tool selection.
   *
   * Raises:
   *     None: No exceptions are intentionally raised.
   */
  function handleNewChat(): void {
    requestIdRef.current += 1;

    setMessages([]);
    setEvents([]);
    setLoading(false);
    setMode(DEFAULT_TOOL_SELECTION.mode);
    setSelectedTool(DEFAULT_TOOL_SELECTION.selectedTool);
    setChatKey((previous) => previous + 1);
  }

  /**
   * Change the tool selection mode.
   *
   * Args:
   *     value (ToolMode): New tool selection mode.
   *
   * Returns:
   *     void: Updates mode and resets Auto mode selection.
   *
   * Raises:
   *     None: No exceptions are intentionally raised.
   */
  function handleModeChange(value: ToolMode): void {
    setMode(value);

    if (value === "auto") {
      setSelectedTool(null);
    }
  }

  /**
   * Delete a custom tool and clear its selection.
   *
   * Args:
   *     name (string): Name of the custom tool to delete.
   *
   * Returns:
   *     void: Updates tool registry and selection state.
   *
   * Raises:
   *     None: Built-in tools are protected by the registry hook.
   */
  function handleDeleteTool(name: string): void {
    removeTool(name);

    if (selectedTool === name) {
      setSelectedTool(null);
    }
  }

  return (
    <main className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        mode={mode}
        selectedTool={selectedTool}
        tools={tools}
        onToggle={() => setSidebarCollapsed((previous) => !previous)}
        onNewChat={handleNewChat}
        onModeChange={handleModeChange}
        onToolChange={setSelectedTool}
        onCreateTool={() => setShowCreateTool(true)}
        onDeleteTool={handleDeleteTool}
      />

      <ChatPanel
        key={chatKey}
        messages={messages}
        loading={loading}
        onSendMessage={handleSendMessage}
      />

      <ExecutionLog
        events={events}
        collapsed={logCollapsed}
        onToggle={() => setLogCollapsed((previous) => !previous)}
      />

      {showCreateTool && (
        <CreateToolForm
          onClose={() => setShowCreateTool(false)}
          onCreate={addTool}
        />
      )}
    </main>
  );
}