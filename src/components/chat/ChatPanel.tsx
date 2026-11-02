"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  BookOpen,
  Bot,
  Lightbulb,
  MessageSquareText,
  Send,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { StarterPrompt } from "@/constants/starters";
import type { ChatMessage } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatPanelProps {
  messages?: ChatMessage[];
  loading?: boolean;
  starters?: StarterPrompt[];
  onSelectStarter?: (starter: StarterPrompt) => void;
  onSendMessage: (message: string) => void | Promise<void>;
}

const STARTER_ICONS: Record<string, LucideIcon> = {
  "read-docs": BookOpen,
  "get-prompt": MessageSquareText,
  "project-insights": Lightbulb,
  "auto-overview": Sparkles,
};

/**
 * Display the agent conversation, starter prompts, and input.
 *
 * Args:
 *     props (ChatPanelProps): Messages, loading state,
 *         starter prompts, and event callbacks.
 *
 * Returns:
 *     JSX.Element: Chat panel with starter cards,
 *         conversation history, and message input.
 *
 * Raises:
 *     None: Missing arrays are handled safely.
 */
export default function ChatPanel({
  messages = [],
  loading = false,
  starters = [],
  onSelectStarter,
  onSendMessage,
}: ChatPanelProps) {
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const safeMessages = Array.isArray(messages)
    ? messages
    : [];

  const safeStarters = Array.isArray(starters)
    ? starters
    : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /**
   * Submit a nonempty message to the agent.
   *
   * Args:
   *     event (FormEvent<HTMLFormElement>): Form
   *         submission event.
   *
   * Returns:
   *     void: Submits the message and clears the input.
   *
   * Raises:
   *     None: Empty messages and submissions while
   *         loading are ignored.
   */
  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    void onSendMessage(message);

    setInput("");
  }

  /**
   * Execute a selected starter prompt.
   *
   * Args:
   *     starter (StarterPrompt): Selected starter card.
   *
   * Returns:
   *     void: Invokes the parent's starter callback.
   *
   * Raises:
   *     None: Missing callbacks and loading are ignored.
   */
  function handleStarterClick(
    starter: StarterPrompt
  ): void {
    if (loading || !onSelectStarter) {
      return;
    }

    onSelectStarter(starter);
  }

  return (
    <section className="relative flex h-full min-w-0 flex-1 flex-col bg-[#0a1024]">
      {/* Chat header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 px-6">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-white">
            Agent Playground
          </h1>

          <p className="text-xs text-slate-400">
            Test your agent and tool selection.
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors ${
            loading
              ? "border-indigo-400/30 bg-indigo-500/10 text-indigo-200"
              : "border-white/10 bg-white/[0.03] text-slate-400"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            {loading && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                loading ? "bg-indigo-400" : "bg-emerald-400"
              }`}
            />
          </span>
          {loading ? "Agent is working" : "Ready"}
        </div>
      </header>

      {/* Chat messages */}
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:#334155_transparent] [scrollbar-width:thin]">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-5 px-6 py-6">
          {safeMessages.length === 0 ? (
            <div className="relative flex flex-1 flex-col items-center justify-center text-center">
              {/* Soft glow behind the empty state */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/15 blur-[90px]"
              />

              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-3xl bg-indigo-500/30 blur-2xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-300/25 bg-gradient-to-b from-slate-800 to-slate-950 shadow-[0_0_40px_-8px_rgba(99,102,241,0.7)]">
                  <Bot
                    size={32}
                    className="text-indigo-300"
                  />
                </div>
              </div>

              <h2 className="relative text-xl font-semibold tracking-tight text-white">
                MCP Agent Playground
              </h2>

              <p className="relative mt-2 max-w-sm text-sm leading-6 text-slate-400">
                Ask a question, or try a starter below
                to see your agent&apos;s tool calls
                appear in the execution log.
              </p>

              {/* Starter prompt cards */}
              {safeStarters.length > 0 &&
                onSelectStarter && (
                  <div className="relative mt-9 grid w-full max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
                    {safeStarters.map((starter) => {
                      const Icon =
                        STARTER_ICONS[starter.id] ??
                        Sparkles;

                      const isAuto = !starter.tool;

                      return (
                        <button
                          key={starter.id}
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleStarterClick(starter)
                          }
                          className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-indigo-500/[0.07] hover:shadow-[0_8px_30px_-12px_rgba(99,102,241,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300 transition-colors group-hover:bg-indigo-500/20">
                              <Icon size={16} />
                            </span>

                            <span
                              className={`max-w-[70%] truncate rounded-md px-2 py-0.5 text-[10px] transition-colors ${
                                isAuto
                                  ? "bg-emerald-500/10 text-emerald-300"
                                  : "bg-white/5 font-mono text-slate-400 group-hover:text-indigo-300"
                              }`}
                            >
                              {starter.tool ?? "Auto"}
                            </span>
                          </div>

                          <p className="mt-3 text-sm font-medium text-white">
                            {starter.title}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                            {starter.prompt}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
            </div>
          ) : (
            safeMessages.map((message) => {
              const isUser =
                message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-400/20 bg-gradient-to-b from-indigo-500/20 to-indigo-500/5">
                      <Bot
                        size={16}
                        className="text-indigo-300"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] break-words rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                      isUser
                        ? "whitespace-pre-wrap rounded-tr-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                        : "rounded-tl-md border border-white/[0.07] bg-white/[0.04] text-slate-200"
                    }`}
                  >
                    {isUser ? (
                      message.content
                    ) : (
                      <div className="space-y-3">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <p className="leading-6">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-white">
                                {children}
                              </strong>
                            ),
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-300 underline decoration-indigo-400/40 underline-offset-2 hover:text-indigo-200"
                              >
                                {children}
                              </a>
                            ),
                            h1: ({ children }) => (
                              <h3 className="text-base font-semibold text-white">
                                {children}
                              </h3>
                            ),
                            h2: ({ children }) => (
                              <h3 className="text-base font-semibold text-white">
                                {children}
                              </h3>
                            ),
                            h3: ({ children }) => (
                              <h4 className="text-sm font-semibold text-white">
                                {children}
                              </h4>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc space-y-1 pl-5 marker:text-indigo-400/70">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal space-y-1 pl-5 marker:text-indigo-400/70">
                                {children}
                              </ol>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-indigo-400/40 pl-3 text-slate-300">
                                {children}
                              </blockquote>
                            ),
                            pre: ({ children }) => (
                              <pre className="overflow-x-auto rounded-lg border border-white/[0.07] bg-slate-950/80 p-3 font-mono text-xs leading-5 text-slate-200">
                                {children}
                              </pre>
                            ),
                            code: ({ children, className }) =>
                              className ? (
                                <code className={className}>
                                  {children}
                                </code>
                              ) : (
                                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-indigo-200">
                                  {children}
                                </code>
                              ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto rounded-lg border border-white/[0.07]">
                                <table className="w-full border-collapse text-xs">
                                  {children}
                                </table>
                              </div>
                            ),
                            th: ({ children }) => (
                              <th className="border-b border-white/10 bg-white/[0.05] px-3 py-2 text-left font-semibold text-white">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border-b border-white/5 px-3 py-2 text-left">
                                {children}
                              </td>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      <UserRound
                        size={16}
                        className="text-slate-300"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-400/20 bg-gradient-to-b from-indigo-500/20 to-indigo-500/5">
                <Bot
                  size={16}
                  className="text-indigo-300"
                />
              </div>

              <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/[0.07] bg-white/[0.04] px-4 py-2.5">
                <span className="flex items-center gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-300 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-300 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-300" />
                </span>
                <span className="text-sm text-slate-400">
                  Thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 px-6 pb-4 pt-2"
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-2 shadow-lg shadow-black/20 backdrop-blur transition-all focus-within:border-indigo-400/60 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]">
          <input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            disabled={loading}
            placeholder="Ask your agent a question..."
            aria-label="Chat message"
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 text-white shadow-md shadow-indigo-900/40 transition-all hover:from-indigo-400 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <Send size={16} />
          </button>
        </div>

        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-500">
          Press Enter to send. Tool calls appear in the
          execution log.
        </p>
      </form>
    </section>
  );
}