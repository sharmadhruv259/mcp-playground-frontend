
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import type { AuthUser } from "@/types/auth";
import {
  createManagedUser,
  deleteManagedUser,
  getManagedUsers,
  resetManagedUserPassword,
  updateManagedUser,
} from "@/lib/api";

type Action = "view" | "create" | "edit" | "password" | "delete";

export default function UserManagement() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [action, setAction] = useState<Action | null>(null);
  const [selected, setSelected] = useState<AuthUser | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setUsers(await getManagedUsers());
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function openAction(
    nextAction: Action,
    user: AuthUser | null = null
  ) {
    setAction(nextAction);
    setSelected(user);
    setUsername(user?.username ?? "");
    setIsActive(user?.is_active ?? true);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
  }

  function closeAction() {
    if (saving) return;

    setAction(null);
    setSelected(null);
    setPassword("");
    setConfirmPassword("");
    setError("");
  }

  async function handleSave() {
    if (!action || saving) return;

    setSaving(true);
    setError("");

    try {
      if (action === "create") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        await createManagedUser({ username, password });
        setMessage("User created successfully.");
      }

      if (action === "edit" && selected) {
        await updateManagedUser(selected.id, {
          username,
          is_active: isActive,
        });
        setMessage("User updated successfully.");
      }

      if (action === "password" && selected) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        await resetManagedUserPassword(selected.id, password);
        setMessage("Password reset successfully.");
      }

      if (action === "delete" && selected) {
        await deleteManagedUser(selected.id);
        setMessage("User deleted successfully.");
      }

      setAction(null);
      setSelected(null);
      setPassword("");
      setConfirmPassword("");

      await loadUsers();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Operation failed."
      );
    } finally {
      setSaving(false);
    }
  }

  const filtered = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#0b1222] px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            User Management
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Create and manage regular User accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAction("create")}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <Plus size={17} />
          Create User
        </button>
      </div>

      {message && (
        <div role="status" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {error && !action && (
        <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101827]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Users size={19} className="text-indigo-400" />
              Registered Users
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {users.length} accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0b1222] px-3">
              <Search size={16} className="text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search username..."
                className="w-40 bg-transparent py-2.5 text-sm text-white outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => void loadUsers()}
              disabled={loading}
              className="rounded-lg border border-white/10 p-2.5 text-slate-300 hover:bg-white/5 disabled:opacity-50"
              aria-label="Refresh users"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-4">Username</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">
                    {user.username}
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-300">
                    {user.role}
                  </td>
                  <td className="px-5 py-4">
                    <span className={user.is_active ? "text-emerald-400" : "text-red-400"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button type="button" title="View" aria-label={`View ${user.username}`} onClick={() => openAction("view", user)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
                        <Eye size={17} />
                      </button>
                      <button type="button" title="Edit" aria-label={`Edit ${user.username}`} onClick={() => openAction("edit", user)} className="rounded-lg p-2 text-indigo-400 hover:bg-indigo-500/10">
                        <Pencil size={17} />
                      </button>
                      <button type="button" title="Reset Password" aria-label={`Reset password for ${user.username}`} onClick={() => openAction("password", user)} className="rounded-lg p-2 text-amber-400 hover:bg-amber-500/10">
                        <KeyRound size={17} />
                      </button>
                      <button type="button" title="Delete" aria-label={`Delete ${user.username}`} onClick={() => openAction("delete", user)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <p className="p-8 text-center text-sm text-slate-400">
              Loading users...
            </p>
          )}

          {!loading && filtered.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-400">
              No users found.
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="User management"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111a2a] p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {action === "create" && "Create User"}
                {action === "view" && "User Details"}
                {action === "edit" && "Edit User"}
                {action === "password" && "Reset Password"}
                {action === "delete" && "Delete User"}
              </h3>

              <button
                type="button"
                onClick={closeAction}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {action === "view" && selected && (
              <div className="space-y-3 text-sm">
                {[
                  ["Username", selected.username],
                  ["Role", selected.role],
                  ["Status", selected.is_active ? "Active" : "Inactive"],
                  ["Account ID", selected.id],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-1">
                    <p className="text-slate-400">{label}</p>
                    <p className="break-all text-white">{value}</p>
                  </div>
                ))}
                <p className="rounded-lg bg-white/5 p-3 text-xs text-slate-400">
                  Existing passwords cannot be viewed. Use Reset Password to assign a new password.
                </p>
              </div>
            )}

            {(action === "create" || action === "edit") && (
              <div className="space-y-4">
                <label className="block text-sm text-slate-300">
                  Username
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    maxLength={150}
                    className={`mt-2 ${inputClass}`}
                  />
                </label>

                {action === "edit" && (
                  <label className="flex items-center gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(event) => setIsActive(event.target.checked)}
                    />
                    Account Active
                  </label>
                )}
              </div>
            )}

            {(action === "create" || action === "password") && (
              <div className="mt-4 space-y-4">
                <label className="block text-sm text-slate-300">
                  {action === "create" ? "Password" : "New Password"}
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={12}
                    maxLength={1024}
                    className={`mt-2 ${inputClass}`}
                  />
                </label>

                <label className="block text-sm text-slate-300">
                  Confirm Password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={`mt-2 ${inputClass}`}
                  />
                </label>
              </div>
            )}

            {action === "delete" && selected && (
              <p className="text-sm leading-6 text-slate-300">
                Are you sure you want to permanently delete{" "}
                <strong className="text-white">
                  {selected.username}
                </strong>
                ? This action cannot be undone.
              </p>
            )}

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeAction}
                disabled={saving}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                {action === "view" ? "Close" : "Cancel"}
              </button>

              {action !== "view" && (
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                    action === "delete"
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                >
                  {saving
                    ? "Saving..."
                    : action === "delete"
                      ? "Delete User"
                      : action === "password"
                        ? "Reset Password"
                        : action === "create"
                          ? "Create User"
                          : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
