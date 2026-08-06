import { useState } from "react";

import { createEntry } from "@/api/entry";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Props = {
  clientId: string;
  refreshEntries: () => Promise<void>;
};

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

  async function handleCreate() {
    try {
      await createEntry(clientId, {
        type,
        title,
        description,
        amount: Number(amount),
        status,
        isBilled,
      });

      await refreshEntries();

      setOpen(false);

      setType("note");
      setTitle("");
      setDescription("");
      setAmount("");
      setStatus("pending");
      setIsBilled(false);
    } catch (err) {
      console.log(err);
      alert("Failed to create entry");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        + Entry
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-[450px] rounded-lg bg-white p-5 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-bold">
                Add Entry
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-xl"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border p-2"
              >
                <option value="note">Note</option>
                <option value="expense">Expense</option>
                <option value="payment">Payment</option>
                <option value="todo">Todo</option>
              </select>

              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {(type === "note" ||
                type === "expense" ||
                type === "todo") && (
                <textarea
                  className="w-full rounded-md border p-2"
                  rows={4}
                  placeholder="Description"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />
              )}

              {(type === "expense" ||
                type === "payment") && (
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                />
              )}

              {type === "todo" && (
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="w-full rounded-md border p-2"
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>
              )}

              {type === "expense" && (
                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={isBilled}
                    onChange={(e) =>
                      setIsBilled(e.target.checked)
                    }
                  />

                  Add to Quarterly Bill

                </label>
              )}

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleCreate}>
                Save
              </Button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}