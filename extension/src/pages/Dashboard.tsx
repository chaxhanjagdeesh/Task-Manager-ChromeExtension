import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddEntryDialog from "@/components/AddEntryDialog";
import { getClients } from "@/api/client";
import { getEntries } from "@/api/entry";
import EntryCard from "@/components/EntryCard";
import AddClientDialog from "../components/AddClientDialog";

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data: any = await getClients();
      setClients(data);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadEntries(clientId: string) {
    try {
      const data: any = await getEntries(clientId);
      setEntries(data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="w-[760px] h-[580px] flex flex-col">

      <div className="flex items-center gap-3 border-b p-3">

        <AddClientDialog refreshClients={loadClients} />

        <Input placeholder="Search Client..." />

      </div>

      <div className="flex flex-1 overflow-hidden">

        <div className="w-60 border-r overflow-y-auto">

          {clients.map((client) => (
            <div
              key={client._id}
              onClick={() => {
                setSelectedClient(client);
                loadEntries(client._id);
              }}
              className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                selectedClient?._id === client._id
                  ? "bg-gray-200"
                  : ""
              }`}
            >
              <h3 className="font-semibold">
                {client.name}
              </h3>
            </div>
          ))}

        </div>

        <div className="flex-1">

          {selectedClient ? (

            <div className="h-full flex flex-col">

              <div className="flex justify-between items-center border-b p-3">

                <h2 className="text-xl font-bold">
                  {selectedClient.name}
                </h2>

               <AddEntryDialog
  clientId={selectedClient._id}
  refreshEntries={() =>
    loadEntries(selectedClient._id)
  }
/>

              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">

                {entries.map((entry) => (
  <EntryCard
    key={entry._id}
    entry={entry}
  />
))}

              </div>

            </div>

          ) : (

            <div className="flex h-full items-center justify-center text-gray-500">
              Select a Client
            </div>

          )}

        </div>

      </div>

    </div>
  );
}