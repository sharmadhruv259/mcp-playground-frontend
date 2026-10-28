
// "use client";

// import {
//   useState,
//   type FormEvent,
// } from "react";

// import {
//   Bot,
//   Send,
//   UserRound,
// } from "lucide-react";

// import type { ChatMessage } from "@/types/chat";

// interface ChatPanelProps {
//   messages: ChatMessage[];
//   onSendMessage: (message: string) => void;
// }

// /**
//  * Display the agent conversation and message input.
//  *
//  * Args:
//  *     props (ChatPanelProps): Conversation messages and
//  *         callback for submitting a user message.
//  *
//  * Returns:
//  *     JSX.Element: Chat interface with message history and input.
//  *
//  * Raises:
//  *     None: No exceptions are intentionally raised.
//  */
// export default function ChatPanel({
//   messages,
//   onSendMessage,
// }: ChatPanelProps) {
//   const [input, setInput] = useState("");

//   /**
//    * Submit a nonempty user message.
//    *
//    * Args:
//    *     event (FormEvent<HTMLFormElement>): Chat form submission event.
//    *
//    * Returns:
//    *     void: Sends the message through the supplied callback.
//    *
//    * Raises:
//    *     None: Empty messages are ignored.
//    */
//   function handleSubmit(
//     event: FormEvent<HTMLFormElement>
//   ): void {
//     event.preventDefault();

//     const message = input.trim();

//     if (!message) {
//       return;
//     }

//     onSendMessage(message);
//     setInput("");
//   }

//   return (
//     <section className="flex min-h-0 flex-1 flex-col bg-slate-900">
//       <header className="flex h-16 shrink-0 items-center border-b border-slate-800 px-6">
//         <div>
//           <h1 className="text-base font-semibold text-white">
//             Agent Playground
//           </h1>

//           <p className="text-xs text-slate-400">
//             Test your agent and tool selection.
//           </p>
//         </div>
//       </header>

//       <div className="flex-1 space-y-5 overflow-y-auto p-6">
//         {messages.length === 0 ? (
//           <div className="flex h-full flex-col items-center justify-center text-center">
//             <div className="mb-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
//               <Bot
//                 size={32}
//                 className="text-indigo-400"
//               />
//             </div>

//             <h2 className="text-lg font-semibold text-white">
//               MCP Agent Playground
//             </h2>

//             <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
//               Ask a question about your project to test
//               the chat interface.
//             </p>
//           </div>
//         ) : (
//           messages.map((message) => {
//             const isUser = message.role === "user";

//             return (
//               <div
//                 key={message.id}
//                 className={`flex items-start gap-3 ${
//                   isUser ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 {!isUser && (
//                   <div className="rounded-lg bg-indigo-500/10 p-2">
//                     <Bot
//                       size={17}
//                       className="text-indigo-400"
//                     />
//                   </div>
//                 )}

//                 <div
//                   className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
//                     isUser
//                       ? "bg-indigo-600 text-white"
//                       : "border border-slate-700 bg-slate-800 text-slate-200"
//                   }`}
//                 >
//                   {message.content}
//                 </div>

//                 {isUser && (
//                   <div className="rounded-lg bg-slate-800 p-2">
//                     <UserRound
//                       size={17}
//                       className="text-slate-300"
//                     />
//                   </div>
//                 )}
//               </div>
//             );
//           })
//         )}
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         className="shrink-0 border-t border-slate-800 p-5"
//       >
//         <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-2 focus-within:border-indigo-500">
//           <input
//             value={input}
//             onChange={(event) =>
//               setInput(event.target.value)
//             }
//             placeholder="Ask your agent a question..."
//             aria-label="Chat message"
//             className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
//           />

//           <button
//             type="submit"
//             disabled={!input.trim()}
//             aria-label="Send message"
//             className="rounded-lg bg-indigo-600 p-3 text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             <Send size={17} />
//           </button>
//         </div>
//       </form>
//     </section>
//   );
// }


"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { Bot, Send, UserRound } from "lucide-react";

import type { ChatMessage } from "@/types/chat";

interface ChatPanelProps {
  messages: ChatMessage[];
  loading?: boolean;
  onSendMessage: (message: string) => void;
}

/**
 * Display the agent conversation and message input.
 *
 * Args:
 *     props (ChatPanelProps): Conversation messages, loading state,
 *         and callback for submitting a user message.
 *
 * Returns:
 *     JSX.Element: Center chat panel with history and input.
 *
 * Raises:
 *     None: No exceptions are intentionally raised.
 */
export default function ChatPanel({
  messages,
  loading = false,
  onSendMessage,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /**
   * Submit a nonempty user message.
   *
   * Args:
   *     event (FormEvent<HTMLFormElement>): Chat form submission event.
   *
   * Returns:
   *     void: Sends the message through the supplied callback.
   *
   * Raises:
   *     None: Empty messages are ignored.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const message = input.trim();

    if (!message) {
      return;
    }

    onSendMessage(message);
    setInput("");
  }

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-slate-900">
      <header className="flex h-14 shrink-0 items-center border-b border-white/5 px-6">
        <div>
          <h1 className="text-sm font-semibold text-white">
            Agent Playground
          </h1>
          <p className="text-xs text-slate-400">
            Test your agent and tool selection.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-5 px-6 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                <Bot size={30} className="text-indigo-400" />
              </div>

              <h2 className="text-lg font-semibold text-white">
                MCP Agent Playground
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                Ask a question to test your agent and watch its tool
                calls appear in the log.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="rounded-lg bg-indigo-500/10 p-2">
                      <Bot size={16} className="text-indigo-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                      isUser
                        ? "bg-indigo-600 text-white"
                        : "border border-white/5 bg-white/[0.04] text-slate-200"
                    }`}
                  >
                    {message.content}
                  </div>

                  {isUser && (
                    <div className="rounded-lg bg-white/5 p-2">
                      <UserRound size={16} className="text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <Bot size={16} className="text-indigo-400" />
              </div>
              <span className="animate-pulse text-sm text-slate-400">
                Thinking...
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 px-6 pb-5 pt-2"
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2 transition-colors focus-within:border-indigo-500/60">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask your agent a question..."
            aria-label="Chat message"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="rounded-lg bg-indigo-600 p-2.5 text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </section>
  );
}