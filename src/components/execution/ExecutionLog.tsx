
// import {
//   Activity,
//   CheckCircle2,
//   CircleAlert,
//   Loader2,
// } from "lucide-react";

// import type { ExecutionEvent } from "@/types/chat";

// interface ExecutionLogProps {
//   events: ExecutionEvent[];
// }

// /**
//  * Display agent tool execution activity.
//  *
//  * Args:
//  *     props (ExecutionLogProps): Execution events containing
//  *         tool names, statuses, and descriptions.
//  *
//  * Returns:
//  *     JSX.Element: Panel showing tool execution history.
//  *
//  * Raises:
//  *     None: No exceptions are intentionally raised.
//  */
// export default function ExecutionLog({
//   events,
// }: ExecutionLogProps) {
//   return (
//     <section className="h-56 shrink-0 overflow-y-auto border-t border-slate-800 bg-slate-950 p-5">
//       <div className="mb-4 flex items-center gap-2">
//         <Activity
//           size={17}
//           className="text-indigo-400"
//         />

//         <h3 className="text-sm font-semibold text-white">
//           Agent Execution
//         </h3>
//       </div>

//       {events.length === 0 ? (
//         <p className="text-xs text-slate-500">
//           Tool execution activity will appear here.
//         </p>
//       ) : (
//         <div className="space-y-3">
//           {events.map((event) => (
//             <div
//               key={event.id}
//               className="flex items-start gap-3"
//             >
//               {event.status === "completed" ? (
//                 <CheckCircle2
//                   size={16}
//                   className="text-emerald-400"
//                 />
//               ) : event.status === "failed" ? (
//                 <CircleAlert
//                   size={16}
//                   className="text-red-400"
//                 />
//               ) : (
//                 <Loader2
//                   size={16}
//                   className="animate-spin text-indigo-400"
//                 />
//               )}

//               <div>
//                 <p className="text-xs font-medium text-slate-200">
//                   {event.tool}
//                 </p>

//                 <p className="mt-1 text-xs text-slate-500">
//                   {event.description}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </section>
//   );
// }



"use client";

import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

import type { ExecutionEvent } from "@/types/chat";

interface ExecutionLogProps {
  events: ExecutionEvent[];
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * Display agent tool execution activity in a collapsible right panel.
 *
 * Args:
 *     props (ExecutionLogProps): Execution events, collapsed state,
 *         and toggle callback.
 *
 * Returns:
 *     JSX.Element: Right panel showing tool execution history.
 *
 * Raises:
 *     None: No exceptions are intentionally raised.
 */
export default function ExecutionLog({
  events,
  collapsed,
  onToggle,
}: ExecutionLogProps) {
  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-l border-white/5 bg-slate-950 transition-[width] duration-200 ${
        collapsed ? "w-14" : "w-80"
      }`}
    >
      <div
        className={`flex h-14 shrink-0 items-center border-b border-white/5 px-3 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand log" : "Collapse log"}
          className="order-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          {collapsed ? (
            <PanelRightOpen size={18} />
          ) : (
            <PanelRightClose size={18} />
          )}
        </button>

        {!collapsed && (
          <div className="order-1 flex items-center gap-2 pl-1">
            <Activity size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Agent Execution
            </h3>
          </div>
        )}
      </div>

      {collapsed ? (
        <div className="flex flex-col items-center pt-4">
          {events.length > 0 && (
            <span
              title={`${events.length} tool events`}
              className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300"
            >
              {events.length}
            </span>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {events.length === 0 ? (
            <p className="text-xs text-slate-500">
              Tool execution activity will appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3"
                >
                  <div className="mt-0.5 shrink-0">
                    {event.status === "completed" ? (
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    ) : event.status === "failed" ? (
                      <CircleAlert size={15} className="text-red-400" />
                    ) : (
                      <Loader2
                        size={15}
                        className="animate-spin text-indigo-400"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="break-all text-xs font-medium text-slate-200">
                      {event.tool}
                    </p>

                    <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}