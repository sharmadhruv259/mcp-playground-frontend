
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080d18] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
            <span className="text-2xl font-bold text-cyan-400">
              M
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            MCP Playground
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Sign in to manage your agents and MCP capabilities.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#101827] p-7 shadow-2xl">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          MCP Playground · Secure Agent Workspace
        </p>
      </div>
    </main>
  );
}
