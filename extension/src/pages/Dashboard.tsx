import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getClients } from "@/api/client";

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

async function loadClients() {
  try {
    const data: any = await getClients();

    console.log("Clients response:", data);

    setClients(data);
  } catch (err) {
    console.log(err);
  }
}

  return (
    <div className="w-[760px] h-[580px] flex flex-col">

      {/* Top Bar */}
      <div className="flex items-center gap-3 border-b p-3">

        <Button>
          + Client
        </Button>

        <Input placeholder="Search Client..." />

      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-60 border-r overflow-y-auto">

          {clients.map((client) => (
            <div
              key={client._id}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b"
            >
              <h3 className="font-medium">
                {client.name}
              </h3>
            </div>
          ))}

        </div>

        {/* Right */}
        <div className="flex-1 flex items-center justify-center">

          <h2 className="text-gray-500">
            Select a Client
          </h2>

        </div>

      </div>

    </div>
  );
}