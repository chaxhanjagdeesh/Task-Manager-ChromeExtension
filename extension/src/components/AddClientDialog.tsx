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
  const [billingCycle, setBillingCycle] =
    useState("Quarterly");

  async function handleCreate() {
    try {
      await createClient({
        name,
        email,
        phone,
        billingCycle,
      });

      await refreshClients();

      setName("");
      setEmail("");
      setPhone("");
      setBillingCycle("Quarterly");

      setOpen(false);
    } catch (err) {
      console.log(err);
      alert("Failed to create client");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        + Client
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>

          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">

            <Input
              placeholder="Client Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <Input
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <Input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />

            <select
              className="w-full rounded-md border p-2"
              value={billingCycle}
              onChange={(e) =>
                setBillingCycle(e.target.value)
              }
            >
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>

          </div>

          <div className="mt-5 flex justify-end gap-2">

            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleCreate}>
              Create
            </Button>

          </div>

        </DialogContent>
      </Dialog>
    </>
  );
}