type Props = {
  entry: any;
};

export default function EntryCard({ entry }: Props) {
  const icons: Record<string, string> = {
    note: "📝",
    expense: "💰",
    payment: "💵",
    todo: "✅",
  };

  const colors: Record<string, string> = {
    note: "border-blue-300 bg-blue-50",
    expense: "border-orange-300 bg-orange-50",
    payment: "border-green-300 bg-green-50",
    todo: "border-purple-300 bg-purple-50",
  };

  return (
    <div
      className={`rounded-lg border p-3 ${colors[entry.type]}`}
    >
      <div className="flex justify-between">

        <div className="font-semibold">
          {icons[entry.type]} {entry.title}
        </div>

        <span className="capitalize text-xs">
          {entry.type}
        </span>

      </div>

      {entry.description && (
        <p className="mt-2 text-sm text-gray-600">
          {entry.description}
        </p>
      )}

      {entry.amount > 0 && (
        <p className="mt-3 text-lg font-bold">
          ₹ {entry.amount}
        </p>
      )}

      {entry.type === "expense" &&
        !entry.isBilled && (
          <span className="mt-2 inline-block rounded bg-yellow-100 px-2 py-1 text-xs">
            Pending Billing
          </span>
        )}

      {entry.type === "todo" && (
        <span
          className={`mt-2 inline-block rounded px-2 py-1 text-xs ${
            entry.status === "completed"
              ? "bg-green-100"
              : "bg-red-100"
          }`}
        >
          {entry.status}
        </span>
      )}
    </div>
  );
}