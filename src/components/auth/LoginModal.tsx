
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  LockKeyhole,
  UserPlus,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { signup } from "@/lib/auth";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "signup";

export default function LoginModal({
  open,
  onClose,
}: LoginModalProps) {
  const {
    login,
    isLoading,
    isAuthenticated,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && isAuthenticated) {
      onClose();
    }
  }, [open, isAuthenticated, onClose]);

  if (!open) {
    return null;
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 12) {
        setError(
          "Password must contain at least 12 characters."
        );
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === "signup") {
        await signup({
          username: username.trim(),
          password,
        });

        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setSuccess(
          "Account created successfully. Please sign in."
        );
      } else {
        await login({
          username: username.trim(),
          password,
        });

        setPassword("");
        onClose();
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Authentication failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || isLoading;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !busy
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101827] p-7 shadow-2xl shadow-black/60"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              {mode === "login" ? (
                <LockKeyhole size={22} />
              ) : (
                <UserPlus size={22} />
              )}
            </div>

            <h2
              id="auth-modal-title"
              className="text-xl font-semibold text-white"
            >
              {mode === "login"
                ? "Welcome back"
                : "Create an account"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {mode === "login"
                ? "Sign in to continue to MCP Playground."
                : "Sign up to start using MCP Playground."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            aria-label="Close authentication modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-900/80 p-1">
          <button
            type="button"
            onClick={() => changeMode("login")}
            disabled={busy}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              mode === "login"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => changeMode("signup")}
            disabled={busy}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-username"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Username
            </label>
            <input
              id="auth-username"
              type="text"
              autoComplete="username"
              required
              maxLength={150}
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter username"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={
                mode === "signup"
                  ? "new-password"
                  : "current-password"
              }
              required
              minLength={mode === "signup" ? 12 : 1}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter password"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label
                htmlFor="auth-confirm-password"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Confirm Password
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm password"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500"
              />
            </div>
          )}

          {mode === "signup" && (
            <p className="text-xs text-slate-400">
              Password must be at least 12 characters.
              New accounts receive the User role.
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>
      </section>
    </div>
  );
}
