import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Users, Shield } from "lucide-react";

interface Identity {
  id: string;
  name: string;
  group: string;
  weight: number;
}

export default function Identities() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/identities")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse JSON response:", text.substring(0, 100));
          throw new Error("Invalid JSON response from server");
        }
      })
      .then((data) => {
        setIdentities(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching identities:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Identity & Privilege List</h2>
        <p className="text-slate-500 mt-2">The "Who" moving across the map (Identity Weight)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Directory / Okta Sync</CardTitle>
          <CardDescription>Assigning power scores to users based on privileges.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500">Loading identities...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                  <tr>
                    <th scope="col" className="px-6 py-3">User ID</th>
                    <th scope="col" className="px-6 py-3">Display Name</th>
                    <th scope="col" className="px-6 py-3">Group</th>
                    <th scope="col" className="px-6 py-3">Identity Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {identities.map((identity) => (
                    <tr key={identity.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        {identity.id}
                      </td>
                      <td className="px-6 py-4">{identity.name}</td>
                      <td className="px-6 py-4">
                        <Badge variant={identity.group.includes("Admin") ? "destructive" : "secondary"}>
                          {identity.group}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${identity.weight >= 10 ? 'text-red-600' : 'text-slate-700'}`}>
                            {identity.weight.toFixed(1)}
                          </span>
                          {identity.weight >= 10 && <Shield className="w-4 h-4 text-red-500" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
