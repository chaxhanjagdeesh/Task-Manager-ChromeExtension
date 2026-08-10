import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

import { getClients } from "@/api/client";
import { getEntries } from "@/api/entry";

import ProfileMenu from "@/components/ProfileMenu";
import AddClientDialog from "@/components/AddClientDialog";
import AddEntryDialog from "@/components/AddEntryDialog";
import EntryCard from "@/components/EntryCard";

interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  lastEntry?: {
    _id?: string;
    type?: string;
    title?: string;
    createdAt?: string;
  };
}

interface Entry {
  _id: string;
  type: "note" | "expense" | "payment" | "todo" | string;
  title?: string;
  description?: string;
  createdAt: string;
  [key: string]: any;
}

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [entries, setEntries] = useState<Entry[]>([]);

  const [clientSearch, setClientSearch] =
    useState("");

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [dateFilter, setDateFilter] =
    useState("all");

  const entriesContainerRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * =====================================================
   * LOAD CLIENTS
   * =====================================================
   */

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data: any = await getClients();

      console.log("Clients:", data);

      /*
       * Support both:
       *
       * [...]
       *
       * and:
       *
       * { clients: [...] }
       */
      const clientList = Array.isArray(data)
        ? data
        : data?.clients || [];

      setClients(clientList);

      /*
       * Keep selected client valid after refresh.
       */
      setSelectedClient((current) => {
        if (!current) return null;

        return (
          clientList.find(
            (client: Client) =>
              client._id === current._id
          ) || null
        );
      });
    } catch (error) {
      console.error(
        "Failed to load clients:",
        error
      );

      setClients([]);
    }
  }

  /*
   * =====================================================
   * LOAD ENTRIES
   * =====================================================
   */

  async function loadEntries(clientId: string) {
    try {
      const data: any =
        await getEntries(clientId);

      console.log("Entries:", data);

      const entryList = Array.isArray(data)
        ? data
        : data?.entries || [];

      setEntries(entryList);
    } catch (error) {
      console.error(
        "Failed to load entries:",
        error
      );

      setEntries([]);
    }
  }

  /*
   * =====================================================
   * SELECT CLIENT
   * =====================================================
   */

  function handleSelectClient(client: Client) {
    setSelectedClient(client);

    /*
     * Reset entry search/filter when switching
     * to another client.
     */
    setSearch("");
    setTypeFilter("all");
    setDateFilter("all");

    loadEntries(client._id);
  }

  /*
   * =====================================================
   * FILTER CLIENTS
   * =====================================================
   */

  const filteredClients = clients.filter(
    (client) => {
      const query =
        clientSearch.toLowerCase().trim();

      if (!query) return true;

      return (
        client.name
          ?.toLowerCase()
          .includes(query) ||
        client.email
          ?.toLowerCase()
          .includes(query) ||
        client.phone
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  /*
   * =====================================================
   * FILTER ENTRIES
   * =====================================================
   */

  const filteredEntries = entries.filter(
    (entry) => {
      /*
       * Type filter
       */
      const matchesType =
        typeFilter === "all" ||
        entry.type === typeFilter;

      /*
       * Search filter
       */
      const query =
        search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        entry.title
          ?.toLowerCase()
          .includes(query) ||
        entry.description
          ?.toLowerCase()
          .includes(query);

      /*
       * Date filter
       */
      const created = new Date(
        entry.createdAt
      );

      const now = new Date();

      let matchesDate = true;

      switch (dateFilter) {
        case "today":
          matchesDate =
            created.toDateString() ===
            now.toDateString();
          break;

        case "7":
          matchesDate =
            created.getTime() <= now.getTime() &&
            now.getTime() -
              created.getTime() <=
              7 *
                24 *
                60 *
                60 *
                1000;
          break;

        case "30":
          matchesDate =
            created.getTime() <= now.getTime() &&
            now.getTime() -
              created.getTime() <=
              30 *
                24 *
                60 *
                60 *
                1000;
          break;

        case "month":
          matchesDate =
            created.getMonth() ===
              now.getMonth() &&
            created.getFullYear() ===
              now.getFullYear();
          break;

        case "year":
          matchesDate =
            created.getFullYear() ===
            now.getFullYear();
          break;

        default:
          matchesDate = true;
      }

      return (
        matchesType &&
        matchesSearch &&
        matchesDate
      );
    }
  );

  /*
   * =====================================================
   * SCROLL TO NEWEST ENTRY
   * =====================================================
   */

  useEffect(() => {
    if (!entriesContainerRef.current) {
      return;
    }

    entriesContainerRef.current.scrollTop =
      entriesContainerRef.current.scrollHeight;
  }, [entries]);

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div className="box-border h-[580px] w-[760px] overflow-hidden bg-white">

      <div className="flex h-full">

        {/* =================================================
            LEFT SIDEBAR
        ================================================= */}

        <div className="flex w-[270px] shrink-0 flex-col border-r bg-white">

          {/* Sidebar Header */}
          <div className="border-b p-4">

            <div className="mb-3 flex items-center justify-between">

              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  Clients
                </h1>

                <p className="text-xs text-gray-500">
                  Manage your clients
                </p>
              </div>

              <ProfileMenu />

            </div>

            {/* Client Search */}
            <Input
              placeholder="🔍 Search Client..."
              value={clientSearch}
              onChange={(event) =>
                setClientSearch(
                  event.target.value
                )
              }
              className="h-9 text-sm"
            />

            {/* Add Client */}
            <div className="mt-3">
              <AddClientDialog
                refreshClients={loadClients}
              />
            </div>

          </div>

          {/* Client List */}
          <div className="flex-1 overflow-y-auto">

            {filteredClients.length === 0 ? (
              <div className="p-6 text-center">

                <p className="text-sm text-gray-500">
                  No clients found
                </p>

                {clientSearch && (
                  <p className="mt-1 text-xs text-gray-400">
                    Try a different search.
                  </p>
                )}

              </div>
            ) : (
              filteredClients.map(
                (client) => (
                  <button
                    key={client._id}
                    type="button"
                    onClick={() =>
                      handleSelectClient(
                        client
                      )
                    }
                    className={`w-full cursor-pointer border-b p-3 text-left transition hover:bg-gray-50 ${
                      selectedClient?._id ===
                      client._id
                        ? "bg-gray-100"
                        : ""
                    }`}
                  >

                    {/* Client name + date */}
                    <div className="flex items-center justify-between gap-2">

                      <h3 className="truncate text-sm font-semibold text-gray-900">
                        {client.name}
                      </h3>

                      {client.lastEntry
                        ?.createdAt && (
                        <span className="shrink-0 text-[10px] text-gray-400">
                          {new Date(
                            client.lastEntry.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </span>
                      )}

                    </div>

                    {/* Last activity */}
                    <p className="mt-1 truncate text-xs text-gray-500">

                      {client.lastEntry ? (
                        <>
                          {client.lastEntry.type ===
                            "note" &&
                            "📝 "}

                          {client.lastEntry.type ===
                            "expense" &&
                            "💰 "}

                          {client.lastEntry.type ===
                            "payment" &&
                            "💵 "}

                          {client.lastEntry.type ===
                            "todo" &&
                            "✅ "}

                          {client.lastEntry.title ||
                            "Untitled entry"}
                        </>
                      ) : (
                        "No activity yet"
                      )}

                    </p>

                  </button>
                )
              )
            )}

          </div>

        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="min-w-0 flex-1">

          {selectedClient ? (
            <div className="flex h-full min-w-0 flex-col">

              {/* ==========================================
                  CLIENT HEADER
              ========================================== */}

              <div className="border-b bg-white px-5 py-4">

                <div className="flex items-start justify-between gap-3">

                  {/* Client info */}
                  <div className="min-w-0">

                    <h2 className="truncate text-xl font-bold text-gray-900">
                      {selectedClient.name}
                    </h2>

                    <p className="mt-0.5 truncate text-sm text-gray-500">
                      {selectedClient.email ||
                        "Client Workspace"}
                    </p>

                  </div>

                  {/* Filters + Add Entry */}
                  <div className="flex shrink-0 items-center gap-2">

                    <select
                      value={typeFilter}
                      onChange={(event) =>
                        setTypeFilter(
                          event.target.value
                        )
                      }
                      className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs outline-none hover:bg-gray-50"
                    >
                      <option value="all">
                        All Entries
                      </option>

                      <option value="note">
                        Notes
                      </option>

                      <option value="expense">
                        Expenses
                      </option>

                      <option value="payment">
                        Payments
                      </option>

                      <option value="todo">
                        Todos
                      </option>
                    </select>

                    <select
                      value={dateFilter}
                      onChange={(event) =>
                        setDateFilter(
                          event.target.value
                        )
                      }
                      className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs outline-none hover:bg-gray-50"
                    >
                      <option value="all">
                        All Time
                      </option>

                      <option value="today">
                        Today
                      </option>

                      <option value="7">
                        Last 7 Days
                      </option>

                      <option value="30">
                        Last 30 Days
                      </option>

                      <option value="month">
                        This Month
                      </option>

                      <option value="year">
                        This Year
                      </option>
                    </select>

                    <AddEntryDialog
                      clientId={
                        selectedClient._id
                      }
                      refreshEntries={() =>
                        loadEntries(
                          selectedClient._id
                        )
                      }
                    />

                  </div>

                </div>

                {/* Entry search */}
                <div className="mt-3">

                  <Input
                    placeholder="🔍 Search entries..."
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    className="h-9 text-sm"
                  />

                </div>

              </div>

              {/* ==========================================
                  ENTRIES
              ========================================== */}

              <div
                ref={entriesContainerRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4"
              >

                {filteredEntries.length ===
                0 ? (
                  <div className="flex h-full items-center justify-center">

                    <div className="text-center">

                      <p className="text-sm text-gray-500">
                        No entries found
                      </p>

                      {search ||
                      typeFilter !== "all" ||
                      dateFilter !== "all" ? (
                        <p className="mt-1 text-xs text-gray-400">
                          Try changing your
                          filters.
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-400">
                          Add an entry to get
                          started.
                        </p>
                      )}

                    </div>

                  </div>
                ) : (
                  filteredEntries.map(
                    (entry) => (
                      <EntryCard
                        key={entry._id}
                        entry={entry}
                      />
                    )
                  )
                )}

              </div>

            </div>
          ) : (

            /* ============================================
               NO CLIENT SELECTED
            ============================================ */

            <div className="flex h-full items-center justify-center bg-gray-50">

              <div className="text-center">

                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                  👤
                </div>

                <p className="text-sm font-medium text-gray-700">
                  Select a client
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Choose a client from the
                  sidebar to view their
                  entries.
                </p>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}