import { useState } from "react";

import { createClient } from "@/api/client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type Props = {
  refreshClients: () => Promise<void>;
};

export default function AddClientDialog({
  refreshClients,
}: Props) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);

      await createClient({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      await refreshClients();

      setName("");
      setEmail("");
      setPhone("");

      setOpen(false);
    } catch (err) {
      console.error("Failed to create client:", err);
      alert("Failed to create client");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(value: boolean) {
    if (loading) return;

    setOpen(value);

    if (!value) {
      setName("");
      setEmail("");
      setPhone("");
    }
  }

  return (
    <>
      {/* Add Client Button */}
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 rounded-lg bg-gray-900 px-3 text-xs font-medium text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.97]"
      >
        <span className="mr-1 text-sm leading-none">+</span>
        Client
      </Button>

      {/* Dialog */}
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="w-[420px] overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl">

          {/* Header */}
          <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white px-6 pb-5 pt-6">
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-lg text-white shadow-sm">
                  +
                </div>

                <div>
                  <DialogTitle className="text-base font-semibold tracking-tight text-gray-900">
                    Add a client
                  </DialogTitle>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Add a new client to your workspace.
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Form */}
          <div className="space-y-4 px-6 py-5">

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                Client name
                <span className="ml-1 text-red-400">*</span>
              </label>

              <Input
                autoFocus
                placeholder="e.g. Acme Corporation"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="h-10 rounded-lg border-gray-200 bg-gray-50/50 text-sm transition focus:bg-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                Email
                <span className="ml-1 text-gray-400">
                  Optional
                </span>
              </label>

              <Input
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="h-10 rounded-lg border-gray-200 bg-gray-50/50 text-sm transition focus:bg-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                Phone
                <span className="ml-1 text-gray-400">
                  Optional
                </span>
              </label>

              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="h-10 rounded-lg border-gray-200 bg-gray-50/50 text-sm transition focus:bg-white"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">

            <p className="text-[10px] text-gray-400">
              You can edit client details later.
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="h-9 rounded-lg border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={
                  loading || !name.trim()
                }
                onClick={handleCreate}
                className="h-9 rounded-lg bg-gray-900 px-4 text-xs font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                  </>
                ) : (
                  "Create client"
                )}
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}