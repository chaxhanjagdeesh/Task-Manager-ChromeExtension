import { useState } from "react";

import { createEntry } from "@/api/entry";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Props = {
  clientId: string;
  refreshEntries: () => Promise<void>;
};

const entryTypes = [
  {
    value: "note",
    label: "Note",
    icon: "✎",
    description: "Add information or notes",
  },
  {
    value: "expense",
    label: "Expense",
    icon: "₹",
    description: "Record a client expense",
  },
  {
    value: "payment",
    label: "Payment",
    icon: "↗",
    description: "Record a payment received",
  },
  {
    value: "todo",
    label: "Todo",
    icon: "✓",
    description: "Create something to complete",
  },
];

export default function AddEntryDialog({
  clientId,
  refreshEntries,
}: Props) {
  const [open, setOpen] = useState(false);

  const [type, setType] = useState("note");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("pending");
  const [isBilled, setIsBilled] = useState(false);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setType("note");
    setTitle("");
    setDescription("");
    setAmount("");
    setStatus("pending");
    setIsBilled(false);
  }

  function handleClose() {
    if (saving) return;

    setOpen(false);
    resetForm();
  }

  async function handleCreate() {
    if (!title.trim()) return;

    try {
      setSaving(true);

      await createEntry(clientId, {
        type,
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount) || 0,
        status,
        isBilled,
      });

      await refreshEntries();

      setOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to create entry:", err);
      alert("Failed to create entry");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Trigger */}
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-9 rounded-lg bg-gray-900 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-gray-800"
      >
        + Entry
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-[2px]"
          onClick={handleClose}
        >
          {/* 
            IMPORTANT:
            Do not center this vertically.

            The extension viewport is only around 580px high,
            so we explicitly keep the modal inside the viewport.
          */}
          <div
            className="absolute left-1/2 top-3 flex w-[430px] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            style={{
              height: "calc(100vh - 24px)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Top accent */}
            <div className="h-1 shrink-0 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-300" />

            {/* Header */}
            <div className="shrink-0 border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm text-white shadow-sm">
                    +
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight text-gray-900">
                      Add Entry
                    </h2>

                    <p className="mt-0.5 text-[10px] text-gray-500">
                      Add an entry to this client
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            </div>

            {/* 
              SCROLLABLE CONTENT

              This is the only section that scrolls.
            */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {/* Entry Type */}
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                  Entry type
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {entryTypes.map((entryType) => {
                    const selected =
                      type === entryType.value;

                    return (
                      <button
                        key={entryType.value}
                        type="button"
                        onClick={() =>
                          setType(entryType.value)
                        }
                        className={`rounded-xl border p-2.5 text-left transition-all ${
                          selected
                            ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                              selected
                                ? "bg-white/15 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {entryType.icon}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-[11px] font-semibold ${
                                selected
                                  ? "text-white"
                                  : "text-gray-800"
                              }`}
                            >
                              {entryType.label}
                            </p>

                            <p
                              className={`mt-0.5 truncate text-[8px] ${
                                selected
                                  ? "text-gray-300"
                                  : "text-gray-400"
                              }`}
                            >
                              {entryType.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="mt-4">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                  Title
                </label>

                <Input
                  placeholder={
                    type === "note"
                      ? "e.g. Client meeting notes"
                      : type === "expense"
                        ? "e.g. Design software"
                        : type === "payment"
                          ? "e.g. Invoice payment"
                          : "e.g. Send project proposal"
                  }
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  className="h-9 rounded-xl border-gray-200 bg-gray-50/50 text-xs focus:bg-white"
                />
              </div>

              {/* Description */}
              {(type === "note" ||
                type === "expense" ||
                type === "todo") && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    placeholder={
                      type === "todo"
                        ? "Add details about this task..."
                        : "Add any additional details..."
                    }
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value,
                      )
                    }
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  />
                </div>
              )}

              {/* Amount */}
              {(type === "expense" ||
                type === "payment") && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Amount
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                      ₹
                    </span>

                    <Input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(event) =>
                        setAmount(event.target.value)
                      }
                      className="h-9 rounded-xl border-gray-200 bg-gray-50/50 pl-8 text-xs focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Todo Status */}
              {type === "todo" && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Status
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setStatus("pending")
                      }
                      className={`rounded-xl border px-3 py-2 text-[11px] font-medium transition ${
                        status === "pending"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      ○ Pending
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setStatus("completed")
                      }
                      className={`rounded-xl border px-3 py-2 text-[11px] font-medium transition ${
                        status === "completed"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      ✓ Completed
                    </button>
                  </div>
                </div>
              )}

              {/* Billing */}
              {/* {type === "expense" && (
                <button
                  type="button"
                  onClick={() =>
                    setIsBilled(!isBilled)
                  }
                  className={`mt-4 flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                    isBilled
                      ? "border-gray-300 bg-gray-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-medium text-gray-800">
                      Bill this expense
                    </p>

                    <p className="mt-0.5 text-[9px] text-gray-400">
                      Include this expense in billing.
                    </p>
                  </div>

                  <div
                    className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                      isBilled
                        ? "bg-gray-900"
                        : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        isBilled
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
              )} */}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-100 bg-gray-50/70 px-5 py-3">
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={saving}
                  className="h-8 rounded-lg px-3 text-[11px]"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleCreate}
                  disabled={
                    saving || !title.trim()
                  }
                  className="h-8 rounded-lg bg-gray-900 px-4 text-[11px] font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}