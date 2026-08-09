type Props = {
  entry: any;
};

export default function EntryCard({ entry }: Props) {
  const created = new Date(entry.createdAt);

  const formattedDate = created.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  const icon = {
    note: "📝",
    expense: "💰",
    payment: "💵",
    todo: "✅",
  };

  const badgeColor = {
    note: "bg-blue-100 text-blue-700",
    expense: "bg-orange-100 text-orange-700",
    payment: "bg-green-100 text-green-700",
    todo: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">

      {/* Header */}
      <div className="flex items-start justify-between">

        <div className="flex items-center gap-2">

          {/* <span className="text-xl">
            {icon[entry.type]}
          </span> */}

          {/* <div> */}

            <h3 className="font-semibold text-sm text-gray-800">
              {entry.title}
            </h3>

            <span
              className={`mt-1 inline-block rounded-lg px-2 py-0.5 text-xs font-medium ${badgeColor[entry.type]}`}
            >
              {entry.type}
            </span>

          {/* </div> */}

        </div>

        <div className="text-right">

          <p className="text-xs text-gray-400">
            {formattedDate}
          {/* <button className="mt-2 rounded p-1 hover:bg-gray-100">
            ⋮
          </button> */}
          </p>


        </div>

      </div>

      {/* Description */}

      {entry.description && (
        <p className="mt-4 whitespace-pre-wrap text-sm text-gray-600">
          {entry.description}
        </p>
      )}

      {/* Amount */}

      {entry.amount > 0 && (
        <div className="mt-4">

          <span className="rounded-lg bg-green-50 px-5 py-1 text-lg font-bold text-green-700">

            ₹ {entry.amount}

          </span>

        </div>
      )}

      {/* Status */}

      <div className="mt-4 flex flex-wrap gap-2">


        {entry.type === "todo" && (
          <span
            className={`rounded-lg px-5 py-1 text-xs font-medium ${
              entry.status === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {entry.status.toUpperCase()}
          </span>
        )}

      </div>

    </div>
  );
}