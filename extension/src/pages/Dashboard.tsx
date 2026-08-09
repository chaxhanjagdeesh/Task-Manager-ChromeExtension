import { useEffect, useState, useRef } from "react";

import { Input } from "@/components/ui/input";
import { getClients } from "@/api/client";
import { getEntries } from "@/api/entry";
import ProfileMenu from "@/components/ProfileMenu";
import AddClientDialog from "@/components/AddClientDialog";
import AddEntryDialog from "@/components/AddEntryDialog";
import EntryCard from "@/components/EntryCard";

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const entriesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data: any = await getClients();

      console.log("Clients:", data);

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

  const filteredEntries = entries.filter((entry) => {
    // Type filter
    const matchesType = typeFilter === "all" || entry.type === typeFilter;

    // Search filter
    const matchesSearch =
      entry.title?.toLowerCase().includes(search.toLowerCase()) ||
      entry.description?.toLowerCase().includes(search.toLowerCase());

    // Date filter
    const created = new Date(entry.createdAt);
    const now = new Date();

    let matchesDate = true;

    switch (dateFilter) {
      case "today":
        matchesDate = created.toDateString() === now.toDateString();
        break;

      case "7":
        matchesDate =
          now.getTime() - created.getTime() <= 7 * 24 * 60 * 60 * 1000;
        break;

      case "30":
        matchesDate =
          now.getTime() - created.getTime() <= 30 * 24 * 60 * 60 * 1000;
        break;

      case "month":
        matchesDate =
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear();
        break;

      case "year":
        matchesDate = created.getFullYear() === now.getFullYear();
        break;

      default:
        matchesDate = true;
    }

    return matchesType && matchesSearch && matchesDate;
  });

  const filteredClients = clients.filter((client) => {
    return (
      client.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.phone?.toLowerCase().includes(clientSearch.toLowerCase())
    );
  });

  useEffect(() => {
    if (entriesContainerRef.current) {
      entriesContainerRef.current.scrollTop =
        entriesContainerRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="w-[760px] h-[580px] flex flex-col">
      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r flex flex-col">
          <div className="border-b p-3 space-y-3">
            <Input
              placeholder="🔍 Search Client..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
            />

            <div className="flex justify-between gap-2">
              <AddClientDialog refreshClients={loadClients} />

              <ProfileMenu />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No clients found
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client._id}
                  onClick={() => {
                    setSelectedClient(client);
                    loadEntries(client._id);
                  }}
                  className={`cursor-pointer border-b p-3 transition hover:bg-gray-100 ${
                    selectedClient?._id === client._id ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{client.name}</h3>

                    {client.lastEntry && (
                      <span className="text-[10px] text-gray-400">
                        {new Date(
                          client.lastEntry.createdAt,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {client.lastEntry ? (
                      <>
                        {client.lastEntry.type === "note" && "📝 "}
                        {client.lastEntry.type === "expense" && "💰 "}
                        {client.lastEntry.type === "payment" && "💵 "}
                        {client.lastEntry.type === "todo" && "✅ "}

                        {client.lastEntry.title}
                      </>
                    ) : (
                      "No activity yet"
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1">
          {selectedClient ? (
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedClient.name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {selectedClient.email || "Client Workspace"}
                    </p>
                  </div>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-lg border px-3 py-2"
                  >
                    <option value="all">All Entries</option>
                    <option value="note">Notes</option>
                    <option value="expense">Expenses</option>
                    <option value="payment">Payments</option>
                    <option value="todo">Todos</option>
                  </select>

                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="rounded-lg border px-3 py-2"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>

                  <AddEntryDialog
                    clientId={selectedClient._id}
                    refreshEntries={() => loadEntries(selectedClient._id)}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    placeholder="🔍 Search entries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

              </div>

              <div
                ref={entriesContainerRef}
                className="flex-1 space-y-3 overflow-y-auto p-3"
              >
                {filteredEntries.length === 0 ? (
                  <div className="pt-10 text-center text-gray-500">
                    No entries found
                  </div>
                ) : (
                  filteredEntries.map((entry) => (
                    <EntryCard key={entry._id} entry={entry} />
                  ))
                )}
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
