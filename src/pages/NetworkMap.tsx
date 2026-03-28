import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Server, Printer, Laptop, ShieldAlert, Network } from "lucide-react";

interface Node {
  id: string;
  type: string;
  isCrownJewel?: boolean;
}

interface Edge {
  source: string;
  target: string;
  isGhostEdge?: boolean;
}

export default function NetworkMap() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/map")
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
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching map data:", err);
        setLoading(false);
      });
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "Server": return <Server className="w-5 h-5" />;
      case "Printer": return <Printer className="w-5 h-5" />;
      case "Endpoint": return <Laptop className="w-5 h-5" />;
      default: return <Network className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Digital Twin Network Map</h2>
        <p className="text-slate-500 mt-2">The "Official Roads" vs "Ghost Edges"</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network Topology</CardTitle>
          <CardDescription>Visualizing allowed paths and detected anomalies.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500">Loading map...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Nodes</h3>
                <div className="space-y-2">
                  {nodes.map((node) => (
                    <div key={node.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-md shadow-sm text-slate-600">
                          {getNodeIcon(node.type)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{node.id}</p>
                          <p className="text-xs text-slate-500">{node.type}</p>
                        </div>
                      </div>
                      {node.isCrownJewel && (
                        <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600">Crown Jewel</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Edges (Paths)</h3>
                <div className="space-y-2">
                  {edges.map((edge, i) => (
                    <div key={i} className={`flex items-center gap-4 p-3 rounded-lg border ${edge.isGhostEdge ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex-1 text-right text-sm font-medium text-slate-700">{edge.source}</div>
                      <div className="flex-shrink-0 text-slate-400">
                        {edge.isGhostEdge ? (
                          <div className="flex items-center text-red-500 font-bold text-xs gap-1">
                            <ShieldAlert className="w-4 h-4" />
                            GHOST EDGE
                          </div>
                        ) : (
                          "â"
                        )}
                      </div>
                      <div className="flex-1 text-left text-sm font-medium text-slate-700">{edge.target}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
