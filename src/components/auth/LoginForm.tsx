
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, LoaderCircle, LogIn, UserRound } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await login({
        username: username.trim(),
        password,
      });

      router.replace("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-slate-300"
        >
          Username
        </label>

        <div className="relative">
          <UserRound
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            maxLength={150}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter your username"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-10 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-300"
        >
          Password
        </label>

        <div className="relative">
          <LockKeyhole
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-10 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn size={18} />
            Sign In
          </>
        )}
      </button>
    </form>
  );
}
