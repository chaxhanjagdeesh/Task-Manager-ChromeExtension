import { useEffect, useState } from "react";
import { createWorkspaceTask } from "@/api/workspaceTask";
// import type { WorkspaceMember } from "@/types/workspace";

interface WorkspaceMember {
  _id: string;
  user: {
    _id: string;
    name?: string;
    email?: string;
  };
  role?: "admin" | "user";
}

interface CreateWorkspaceTaskProps {
  workspaceId: string;
  members: WorkspaceMember[];
  onClose: () => void;
  onCreated: (task: any) => void;
}

interface StoredUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
}

export default function CreateWorkspaceTask({
  workspaceId,
  members,
  onClose,
  onCreated,
}: CreateWorkspaceTaskProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [priority, setPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [dueDate, setDueDate] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    chrome.storage.local.get(["user"], (result) => {
  const user =
    result.user as StoredUser | undefined;

  if (user?._id) {
    setCurrentUserId(user._id);
  }
});
  }, []);

  /*
   * Automatically include yourself.
   */
  useEffect(() => {
    if (!currentUserId) return;

    setSelectedMembers((current) => {
      if (current.includes(currentUserId)) {
        return current;
      }

      return [...current, currentUserId];
    });
  }, [currentUserId]);

  function toggleMember(userId: string) {
    setSelectedMembers((current) => {
      if (current.includes(userId)) {
        // Creator cannot remove themselves.
        if (userId === currentUserId) {
          return current;
        }

        return current.filter((id) => id !== userId);
      }

      return [...current, userId];
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Give your task a title.");
      return;
    }

    if (selectedMembers.length === 0) {
      setError("Select at least one person.");
      return;
    }

    try {
      setLoading(true);

      const task = await createWorkspaceTask(workspaceId, {
        title: title.trim(),
        description: description.trim(),
        participants: selectedMembers,
        priority,
        dueDate: dueDate || null,
      });

      onCreated(task);
    } catch (error: any) {
      console.error(
        "Failed to create workspace task:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Unable to create task."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedPeople = members.filter((member) => {
    const userId = member.user?._id || member._id;
    return selectedMembers.includes(userId);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">

      {/* Modal */}
      <div className="flex max-h-[550px] w-full max-w-[510px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="shrink-0 border-b border-gray-100 px-5 py-4">

          <div className="flex items-start justify-between">

            <div className="flex items-center gap-3">

              {/* Task icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-lg text-white shadow-sm">
                ✓
              </div>

              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">
                  Create a task
                </h2>

                <p className="mt-0.5 text-[11px] text-gray-500">
                  Turn an idea into something actionable.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              ×
            </button>

          </div>

        </div>

        {/* ================================================= */}
        {/* SCROLLABLE CONTENT */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-4 px-5 py-4">

            {/* ================================================= */}
            {/* TITLE */}
            {/* ================================================= */}

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Task
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="What needs to be done?"
                maxLength={150}
                autoFocus
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
              />
            </div>

            {/* ================================================= */}
            {/* DESCRIPTION */}
            {/* ================================================= */}

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </label>

                <span className="text-[10px] text-gray-400">
                  {description.length}/1000
                </span>
              </div>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Add some details about this task..."
                rows={3}
                maxLength={1000}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
              />
            </div>

            {/* ================================================= */}
            {/* ASSIGNEES */}
            {/* ================================================= */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Assign to
                  </label>

                  <p className="mt-0.5 text-[10px] text-gray-400">
                    Choose who should work on it
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
                  {selectedMembers.length} selected
                </span>

              </div>

              {/* Selected people */}
              {selectedPeople.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">

                  {selectedPeople.map((member) => {
                    const userId =
                      member.user?._id || member._id;

                    const name =
                      member.user?.name ||
                      member.user?.email ||
                      "User";

                    const isSelf =
                      userId === currentUserId;

                    return (
                      <div
                        key={userId}
                        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2 py-1"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[8px] font-semibold text-white">
                          {name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span className="max-w-[100px] truncate text-[10px] font-medium text-gray-700">
                          {isSelf
                            ? "You"
                            : name}
                        </span>
                      </div>
                    );
                  })}

                </div>
              )}

              {/* Members */}
              <div className="max-h-[125px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5">

                {members.map((member) => {
                  const userId =
                    member.user?._id || member._id;

                  const name =
                    member.user?.name ||
                    member.user?.email ||
                    "Unknown user";

                  const email =
                    member.user?.email || "";

                  const isSelected =
                    selectedMembers.includes(userId);

                  const isSelf =
                    userId === currentUserId;

                  return (
                    <button
                      key={userId}
                      type="button"
                      onClick={() =>
                        toggleMember(userId)
                      }
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                        isSelected
                          ? "bg-gray-50"
                          : "hover:bg-gray-50"
                      }`}
                    >

                      {/* Checkbox */}
                      <div
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition ${
                          isSelected
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600">
                        {name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-xs font-semibold text-gray-800">
                            {name}
                          </p>

                          {isSelf && (
                            <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[8px] font-semibold text-gray-600">
                              YOU
                            </span>
                          )}
                        </div>

                        <p className="truncate text-[10px] text-gray-400">
                          {email}
                        </p>

                      </div>

                      <span className="text-[9px] capitalize text-gray-400">
                        {member.role}
                      </span>

                    </button>
                  );
                })}

              </div>

            </div>

            {/* ================================================= */}
            {/* PRIORITY */}
            {/* ================================================= */}

            <div>

              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Priority
              </label>

              <div className="grid grid-cols-3 gap-2">

                {/* Low */}
                <button
                  type="button"
                  onClick={() =>
                    setPriority("low")
                  }
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    priority === "low"
                      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-xs font-semibold">
                    Low
                  </div>

                  <div
                    className={`mt-0.5 text-[9px] ${
                      priority === "low"
                        ? "text-gray-300"
                        : "text-gray-400"
                    }`}
                  >
                    Can wait
                  </div>
                </button>

                {/* Medium */}
                <button
                  type="button"
                  onClick={() =>
                    setPriority("medium")
                  }
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    priority === "medium"
                      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-xs font-semibold">
                    Medium
                  </div>

                  <div
                    className={`mt-0.5 text-[9px] ${
                      priority === "medium"
                        ? "text-gray-300"
                        : "text-gray-400"
                    }`}
                  >
                    Normal
                  </div>
                </button>

                {/* High */}
                <button
                  type="button"
                  onClick={() =>
                    setPriority("high")
                  }
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    priority === "high"
                      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-xs font-semibold">
                    High
                  </div>

                  <div
                    className={`mt-0.5 text-[9px] ${
                      priority === "high"
                        ? "text-gray-300"
                        : "text-gray-400"
                    }`}
                  >
                    Important
                  </div>
                </button>

              </div>
            </div>

            {/* ================================================= */}
            {/* DUE DATE */}
            {/* ================================================= */}

            <div>

              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Due date
              </label>

              <div className="relative">

                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  ◷
                </div>

                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-xs text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
                />

              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
                <span className="text-xs">!</span>

                <p className="text-[11px] font-medium text-red-600">
                  {error}
                </p>
              </div>
            )}

          </div>

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3">

            <div className="text-[10px] text-gray-400">
              {selectedMembers.length > 0
                ? `Assigned to ${selectedMembers.length} ${
                    selectedMembers.length === 1
                      ? "person"
                      : "people"
                  }`
                : "No assignee selected"}
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating
                  </>
                ) : (
                  <>
                    Create task
                    <span>→</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </form>

      </div>
    </div>
  );
}