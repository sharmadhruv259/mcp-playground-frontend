
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
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

import {
  createManager,
  deleteManager,
  getAdminUsers,
  getManager,
  resetManagerPassword,
  updateManager,
} from "@/lib/api";
import type { AuthUser } from "@/types/auth";

type ModalMode =
  | "create"
  | "view"
  | "edit"
  | "password"
  | "delete";

export default function ManagerManagement() {
  const [managers, setManagers] = useState<AuthUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mode, setMode] = useState<ModalMode | null>(null);
  const [selected, setSelected] = useState<AuthUser | null>(null);

  const [username, setUsername] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadManagers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const accounts = await getAdminUsers("manager");
      setManagers(accounts);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load Managers."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadManagers();
  }, [loadManagers]);

  function closeModal() {
    if (saving) return;

    setMode(null);
    setSelected(null);
    setModalError(null);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setIsActive(true);
  }

  async function openModal(
    nextMode: ModalMode,
    manager?: AuthUser
  ) {
    setModalError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
    setSelected(manager ?? null);
    setUsername(manager?.username ?? "");
    setIsActive(manager?.is_active ?? true);
    setMode(nextMode);

    if (manager && nextMode !== "create") {
      try {
        const latest = await getManager(manager.id);
        setSelected(latest);
        setUsername(latest.username);
        setIsActive(latest.is_active);
      } catch (caught) {
        setModalError(
          caught instanceof Error
            ? caught.message
            : "Unable to load Manager details."
        );
      }
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!mode || saving) return;

    setModalError(null);

    if (
      (mode === "create" || mode === "password") &&
      password.length < 12
    ) {
      setModalError(
        "Password must contain at least 12 characters."
      );
      return;
    }

    if (
      (mode === "create" || mode === "password") &&
      password !== confirmPassword
    ) {
      setModalError("Passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      if (mode === "create") {
        const created = await createManager({
          username: username.trim(),
          password,
        });

        setSuccess(
          `Manager "${created.username}" created successfully.`
        );
      }

      if (mode === "edit" && selected) {
        await updateManager(selected.id, {
          username: username.trim(),
          is_active: isActive,
        });

        setSuccess("Manager updated successfully.");
      }

      if (mode === "password" && selected) {
        await resetManagerPassword(selected.id, password);
        setSuccess("Manager password reset successfully.");
      }

      if (mode === "delete" && selected) {
        await deleteManager(selected.id);
        setSuccess("Manager deleted successfully.");
      }

      await loadManagers();

      setMode(null);
      setSelected(null);
      setPassword("");
      setConfirmPassword("");
    } catch (caught) {
      setModalError(
        caught instanceof Error
          ? caught.message
          : "Unable to complete the operation."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredManagers = managers.filter((manager) =>
    manager.username
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const modalTitle: Record<ModalMode, string> = {
    create: "Create Manager",
    view: "Manager Details",
    edit: "Edit Manager",
    password: "Reset Manager Password",
    delete: "Delete Manager",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Manager Management
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Create and manage Manager accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void openModal("create")}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <Plus size={17} />
          Create Manager
        </button>
      </div>

      {success && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          {success}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101827]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Users size={19} className="text-indigo-400" />
              Registered Managers
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {managers.length} accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950 px-3">
              <Search size={16} className="text-slate-500" />
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search username..."
                className="w-44 bg-transparent py-2.5 text-sm text-white outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => void loadManagers()}
              disabled={loading}
              aria-label="Refresh Managers"
              className="rounded-lg border border-white/10 p-2.5 text-slate-300 hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="p-5 text-sm text-red-400">
            {error}
          </p>
        )}

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
              {!loading &&
                filteredManagers.map((manager) => (
                  <tr
                    key={manager.id}
                    className="hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4 font-medium text-white">
                      {manager.username}
                    </td>

                    <td className="px-5 py-4 capitalize text-slate-300">
                      {manager.role}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          manager.is_active
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {manager.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          title="View Manager"
                          aria-label={`View ${manager.username}`}
                          onClick={() =>
                            void openModal("view", manager)
                          }
                          className="text-slate-400 hover:text-white"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          title="Edit Manager"
                          aria-label={`Edit ${manager.username}`}
                          onClick={() =>
                            void openModal("edit", manager)
                          }
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          title="Reset Password"
                          aria-label={`Reset password for ${manager.username}`}
                          onClick={() =>
                            void openModal("password", manager)
                          }
                          className="text-amber-400 hover:text-amber-300"
                        >
                          <KeyRound size={17} />
                        </button>

                        <button
                          type="button"
                          title="Delete Manager"
                          aria-label={`Delete ${manager.username}`}
                          onClick={() =>
                            void openModal("delete", manager)
                          }
                          className="text-red-400 hover:text-red-300"
                        >
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
              Loading Managers...
            </p>
          )}

          {!loading &&
            !error &&
            filteredManagers.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-400">
                No Managers found.
              </p>
            )}
        </div>
      </section>

      {mode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={modalTitle[mode]}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101827] p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {modalTitle[mode]}
              </h3>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {mode === "view" ? (
              selected && (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-slate-400">
                      Username
                    </p>
                    <p className="mt-1 text-white">
                      {selected.username}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Role</p>
                    <p className="mt-1 capitalize text-white">
                      {selected.role}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Status</p>
                    <p className="mt-1 text-white">
                      {selected.is_active
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">
                      Account ID
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-slate-300">
                      {selected.id}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full rounded-lg border border-white/10 py-2.5 text-slate-200 hover:bg-white/5"
                  >
                    Close
                  </button>
                </div>
              )
            ) : (
              <form
                onSubmit={(event) =>
                  void handleSubmit(event)
                }
                className="space-y-4"
              >
                {(mode === "create" || mode === "edit") && (
                  <div>
                    <label
                      htmlFor="manager-name"
                      className="mb-1.5 block text-sm text-slate-300"
                    >
                      Username
                    </label>
                    <input
                      id="manager-name"
                      required
                      maxLength={150}
                      value={username}
                      onChange={(event) =>
                        setUsername(event.target.value)
                      }
                      className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {mode === "edit" && (
                  <label className="flex items-center gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(event) =>
                        setIsActive(event.target.checked)
                      }
                      className="h-4 w-4 accent-indigo-500"
                    />
                    Account Active
                  </label>
                )}

                {(mode === "create" ||
                  mode === "password") && (
                  <>
                    <div>
                      <label
                        htmlFor="manager-password"
                        className="mb-1.5 block text-sm text-slate-300"
                      >
                        New Password
                      </label>
                      <input
                        id="manager-password"
                        type="password"
                        required
                        minLength={12}
                        maxLength={1024}
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="manager-confirm"
                        className="mb-1.5 block text-sm text-slate-300"
                      >
                        Confirm Password
                      </label>
                      <input
                        id="manager-confirm"
                        type="password"
                        required
                        minLength={12}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}

                {mode === "delete" && (
                  <p className="text-sm leading-6 text-slate-300">
                    Are you sure you want to delete Manager{" "}
                    <strong className="text-white">
                      {selected?.username}
                    </strong>
                    ? This action cannot be undone.
                  </p>
                )}

                {modalError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
                  >
                    {modalError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || (mode !== "create" && !selected)}
                    className={
                      mode === "delete"
                        ? "rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                        : "rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                    }
                  >
                    {saving
                      ? "Processing..."
                      : mode === "create"
                        ? "Create Manager"
                        : mode === "edit"
                          ? "Save Changes"
                          : mode === "password"
                            ? "Reset Password"
                            : "Delete Manager"}
                  </button>
                </div>
              </form>
            )}

            {mode === "view" && modalError && (
              <p role="alert" className="mt-4 text-sm text-red-400">
                {modalError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
