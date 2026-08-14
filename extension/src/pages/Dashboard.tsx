import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { getClients } from "@/api/client";
import { getEntries } from "@/api/entry";
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
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [entries, setEntries] = useState<Entry[]>([]);

  const [clientSearch, setClientSearch] = useState("");
  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const entriesContainerRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data: any = await getClients();

      const clientList = Array.isArray(data)
        ? data
        : data?.clients || [];

      setClients(clientList);

      setSelectedClient((current) => {
        if (!current) return null;

        return (
          clientList.find(
            (client: Client) =>
              client._id === current._id,
          ) || null
        );
      });
    } catch (error) {
      console.error(
        "Failed to load clients:",
        error,
      );

      setClients([]);
    }
  }

  async function loadEntries(clientId: string) {
    try {
      const data: any = await getEntries(clientId);

      const entryList = Array.isArray(data)
        ? data
        : data?.entries || [];

      setEntries(entryList);
    } catch (error) {
      console.error(
        "Failed to load entries:",
        error,
      );

      setEntries([]);
    }
  }

  function handleSelectClient(client: Client) {
    setSelectedClient(client);

    setSearch("");
    setTypeFilter("all");
    setDateFilter("all");

    loadEntries(client._id);
  }

  const filteredClients = useMemo(() => {
    const query = clientSearch
      .toLowerCase()
      .trim();

    if (!query) return clients;

    return clients.filter((client) => {
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
    });
  }, [clients, clientSearch]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesType =
        typeFilter === "all" ||
        entry.type === typeFilter;

      const query = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !query ||
        entry.title
          ?.toLowerCase()
          .includes(query) ||
        entry.description
          ?.toLowerCase()
          .includes(query);

      const created = new Date(
        entry.createdAt,
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
    });
  }, [
    entries,
    search,
    typeFilter,
    dateFilter,
  ]);

  useEffect(() => {
    const container =
      entriesContainerRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop =
        container.scrollHeight;
    });
  }, [entries, selectedClient]);

  function getInitial(name?: string) {
    if (!name) return "?";

    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  }

  function getClientColor(name?: string) {
    if (!name) return "bg-gray-100";

    const colors = [
      "bg-emerald-100",
      "bg-blue-100",
      "bg-violet-100",
      "bg-amber-100",
      "bg-rose-100",
      "bg-cyan-100",
    ];

    const index =
      name.charCodeAt(0) %
      colors.length;

    return colors[index];
  }

  function getEntryIcon(type?: string) {
    switch (type) {
      case "note":
        return "📝";

      case "expense":
        return "💰";

      case "payment":
        return "💵";

      case "todo":
        return "✓";

      default:
        return "•";
    }
  }

  function getEntryLabel(type?: string) {
    switch (type) {
      case "note":
        return "Note";

      case "expense":
        return "Expense";

      case "payment":
        return "Payment";

      case "todo":
        return "Todo";

      default:
        return "Entry";
    }
  }

  return (
    <div className="relative box-border h-[580px] w-[760px] overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute bottom-0 right-0 z-0 h-[390px] w-[500px] overflow-hidden opacity-[0.16]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 500 390"
          className="absolute bottom-0 right-0 h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M500 390C420 310 390 240 310 185C230 130 135 95 30 20"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M470 390C425 300 435 220 390 145C355 88 305 45 245 10"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M400 390C335 300 265 265 180 220C115 185 60 135 10 70"
            stroke="#4ade80"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M500 340C420 315 350 320 285 355"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M355 265C315 225 312 185 330 160C367 177 384 218 355 265Z"
            fill="#22c55e"
          />
          <path
            d="M275 195C235 155 230 115 248 85C285 103 302 145 275 195Z"
            fill="#4ade80"
          />
          <path
            d="M185 135C145 105 138 70 155 42C193 57 210 98 185 135Z"
            fill="#16a34a"
          />
          <path
            d="M100 82C65 59 55 30 68 12C104 22 122 57 100 82Z"
            fill="#4ade80"
          />
          <path
            d="M375 315C420 278 455 282 475 302C448 335 405 338 375 315Z"
            fill="#16a34a"
          />
          <path
            d="M360 225C402 188 438 191 455 214C428 244 390 247 360 225Z"
            fill="#22c55e"
          />
          <path
            d="M325 125C365 91 400 94 417 115C392 143 355 148 325 125Z"
            fill="#4ade80"
          />
          <path
            d="M245 70C282 38 314 41 329 61C306 87 270 91 245 70Z"
            fill="#16a34a"
          />
          <path
            d="M215 245C173 215 137 219 120 242C145 270 185 272 215 245Z"
            fill="#22c55e"
          />
          <path
            d="M125 180C88 155 53 159 38 181C61 209 98 209 125 180Z"
            fill="#4ade80"
          />

          <path
            d="M65 125C35 105 12 107 0 125C19 149 47 149 65 125Z"
            fill="#16a34a"
          />
        </svg>
      </div>

      <div className="relative z-10 flex h-full">
        <aside className="flex w-[270px] shrink-0 flex-col border-r border-gray-200/80 bg-white/95 backdrop-blur">
          <div className="border-b bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/workspace")}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  title="Back to Workspaces"
                >
                  ←
                </button>
              <AddClientDialog
                refreshClients={loadClients}
              />
            </div>
            <Input
              placeholder="🔍 Search clients..."
              value={clientSearch}
              onChange={(event) =>
                setClientSearch(event.target.value)
              }
              className="h-9 border-gray-200 bg-gray-50/50 text-sm transition focus:bg-white"
            />
          </div>


          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {filteredClients.length === 0 ? (
              <div className="flex h-full min-h-[250px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">
                  👥
                </div>

                <p className="mt-3 text-xs font-medium text-gray-700">
                  No clients found
                </p>

                <p className="mt-1 text-[10px] leading-4 text-gray-400">
                  {clientSearch
                    ? "Try another search."
                    : "Add your first client to get started."}
                </p>
              </div>
            ) : (
              filteredClients.map(
                (client) => {
                  const selected =
                    selectedClient?._id ===
                    client._id;

                  return (
                    <button
                      key={client._id}
                      type="button"
                      onClick={() =>
                        handleSelectClient(
                          client,
                        )
                      }
                      className={`group mb-1.5 w-full rounded-xl px-2.5 py-2.5 text-left transition ${selected
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Avatar */}

                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-gray-700 ${getClientColor(
                            client.name,
                          )}`}
                        >
                          {getInitial(
                            client.name,
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-xs font-semibold text-gray-800">
                              {client.name}
                            </h3>
                            {client.lastEntry
                              ?.createdAt && (
                                <span className="shrink-0 text-[9px] text-gray-400">
                                  {new Date(
                                    client.lastEntry.createdAt,
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                    },
                                  )}
                                </span>
                              )}
                          </div>

                          <p className="mt-0.5 truncate text-[10px] text-gray-400">
                            {client.lastEntry ? (
                              <>
                                <span className="mr-1">
                                  {getEntryIcon(
                                    client
                                      .lastEntry
                                      .type,
                                  )}
                                </span>

                                {client.lastEntry
                                  .title ||
                                  getEntryLabel(
                                    client
                                      .lastEntry
                                      .type,
                                  )}
                              </>
                            ) : (
                              "No activity yet"
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                },
              )
            )}
          </div>
        </aside>
        <main className="min-w-0 flex-1 bg-gray-50/80">
          {selectedClient ? (
            <div className="flex h-full min-w-0 flex-col">
              <header className="border-b border-gray-200/70 bg-white/95 px-5 py-3.5 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-gray-700 ${getClientColor(
                        selectedClient.name,
                      )}`}
                    >
                      {getInitial(
                        selectedClient.name,
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-gray-900">
                        {selectedClient.name}
                      </h2>

                      <p className="mt-0.5 truncate text-[10px] text-gray-400">
                        {selectedClient.email ||
                          selectedClient.phone ||
                          "Client workspace"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <select
                      value={typeFilter}
                      onChange={(event) =>
                        setTypeFilter(
                          event.target.value,
                        )
                      }
                      className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-[10px] font-medium text-gray-600 outline-none transition hover:bg-gray-50"
                    >
                      <option value="all">
                        All types
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
                          event.target.value,
                        )
                      }
                      className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-[10px] font-medium text-gray-600 outline-none transition hover:bg-gray-50"
                    >
                      <option value="all">
                        All time
                      </option>

                      <option value="today">
                        Today
                      </option>

                      <option value="7">
                        7 days
                      </option>

                      <option value="30">
                        30 days
                      </option>

                      <option value="month">
                        This month
                      </option>

                      <option value="year">
                        This year
                      </option>
                    </select>

                    <AddEntryDialog
                      clientId={
                        selectedClient._id
                      }
                      refreshEntries={() =>
                        loadEntries(
                          selectedClient._id,
                        )
                      }
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Input
                    placeholder="Search entries..."
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    className="h-8 border-gray-200 bg-gray-50/70 text-xs shadow-none placeholder:text-gray-400 focus:bg-white"
                  />
                </div>
              </header>
              <div className="flex items-center justify-between border-b border-gray-100 bg-white/70 px-5 py-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  Activity
                </span>
                <span className="text-[10px] text-gray-400">
                  {filteredEntries.length}{" "}
                  {filteredEntries.length === 1
                    ? "entry"
                    : "entries"}
                </span>
              </div>
              <div
                ref={entriesContainerRef}
                className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
              >
                {filteredEntries.length ===
                  0 ? (
                  <div className="flex h-full min-h-[300px] items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg shadow-sm ring-1 ring-gray-100">
                        📝
                      </div>
                      <p className="mt-3 text-xs font-semibold text-gray-700">
                        No entries found
                      </p>
                      <p className="mt-1 max-w-[220px] text-[10px] leading-4 text-gray-400">
                        {search ||
                          typeFilter !== "all" ||
                          dateFilter !== "all"
                          ? "Try adjusting your filters or search."
                          : "Add an entry to start building this client's activity timeline."}
                      </p>
                      {!search &&
                        typeFilter ===
                        "all" &&
                        dateFilter ===
                        "all" && (
                          <div className="mt-4">
                            <AddEntryDialog
                              clientId={
                                selectedClient._id
                              }
                              refreshEntries={() =>
                                loadEntries(
                                  selectedClient._id,
                                )
                              }
                            />
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto w-full max-w-[520px] space-y-3">
                    {filteredEntries.map(
                      (entry) => (
                        <EntryCard
                          key={entry._id}
                          entry={entry}
                        />
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative flex h-full items-center justify-center overflow-hidden">
              <div className="relative z-10 px-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-gray-100">
                  👤
                </div>
                <h2 className="mt-4 text-sm font-semibold text-gray-800">
                  Select a client
                </h2>
                <p className="mx-auto mt-1 max-w-[230px] text-[11px] leading-5 text-gray-400">
                  Choose a client from the
                  sidebar to view their
                  activity and entries.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}