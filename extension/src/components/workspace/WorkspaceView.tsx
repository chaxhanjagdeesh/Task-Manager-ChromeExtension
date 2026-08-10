interface WorkspaceViewProps {
  workspace: any;
  onBack: () => void;
}

export default function WorkspaceView({
  workspace,
  onBack,
}: WorkspaceViewProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-md px-2 py-1 text-sm hover:bg-gray-100"
          >
            ←
          </button>

          <div>
            <h2 className="text-sm font-semibold">
              {workspace.name}
            </h2>

            {workspace.description && (
              <p className="text-xs text-gray-500">
                {workspace.description}
              </p>
            )}
          </div>
        </div>

        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
          {workspace.role}
        </span>
      </div>

      {/* Workspace navigation */}
      <div className="flex border-b">
        <button className="flex-1 border-b-2 px-4 py-2 text-sm font-medium">
          Tasks
        </button>

        <button className="flex-1 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
          Notes
        </button>

        <button className="flex-1 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
          Members
        </button>
      </div>

      {/* Content placeholder */}
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h3 className="text-sm font-medium">
            {workspace.name}
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Workspace tasks will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}