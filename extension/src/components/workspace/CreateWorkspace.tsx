import { useState } from "react";
import { createWorkspace } from "../../api/workspace";

interface CreateWorkspaceProps {
  onClose: () => void;
  onCreated: (workspace: any) => void;
}

export default function CreateWorkspace({
  onClose,
  onCreated,
}: CreateWorkspaceProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Workspace name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const workspace = await createWorkspace({
        name: trimmedName,
        description:
          trimmedDescription || undefined,
      });

      console.log(
        "Workspace created successfully:",
        workspace
      );

      onCreated(workspace);
    } catch (error: any) {
      console.error(
        "Failed to create workspace:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create workspace"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create Workspace
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a workspace for your team.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Workspace name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="e.g. Development Team"
              maxLength={100}
              autoFocus
              disabled={loading}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
              <span className="ml-1 font-normal text-gray-400">
                (optional)
              </span>
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="What is this workspace for?"
              maxLength={500}
              rows={4}
              disabled={loading}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Workspace"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}