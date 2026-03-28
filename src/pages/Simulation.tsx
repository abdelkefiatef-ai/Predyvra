import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Play, ShieldAlert, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

interface WarStory {
  title: string;
  summary: string;
  steps: { name: string; desc: string }[];
  newEdges: { source: string; target: string; isGhostEdge: boolean }[];
}

let globalStory: WarStory | null = null;

export default function Simulation() {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<WarStory | null>(globalStory);

  const runSimulation = async () => {
    setLoading(true);
    setStory(null);
    globalStory = null;
    try {
      const res = await fetch("/api/simulate", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON response:", text.substring(0, 100));
        throw new Error("Invalid JSON response from server");
      }
      setTimeout(() => {
        setStory(data);
        globalStory = data;
        setLoading(false);
      }, 2000); // Simulate processing time
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">War Game Simulation</h2>
          <p className="text-slate-500 mt-2">The 2,000 "What-If" Battles</p>
        </div>
        <Button onClick={runSimulation} disabled={loading} className="gap-2 bg-blue-600 hover:bg-blue-700">
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {loading ? "Running 2,000 Drills..." : "Start War Game"}
        </Button>
      </div>

      {loading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-12 flex flex-col items-center justify-center text-blue-800 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <h3 className="text-xl font-bold">Simulating Battles...</h3>
            <p className="text-sm text-blue-600">Red Soldier is attempting to breach the network.</p>
          </CardContent>
        </Card>
      )}

      {story && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <ShieldAlert className="w-6 h-6" />
                Breach Detected & Isolated
              </CardTitle>
              <CardDescription className="text-red-600 font-medium">
                {story.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-800 leading-relaxed font-medium">
                {story.summary}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  The 5-Step Execution Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {story.steps.map((step, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-blue-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        {i + 1}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-900">{step.name}</div>
                        </div>
                        <div className="text-slate-500 text-sm">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Ghost Edges Discovered
                </CardTitle>
                <CardDescription>Paths identified during the simulation.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {story.newEdges.map((edge, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-slate-800">{edge.source}</div>
                      <div className="flex-1 px-4">
                        <div className="h-px bg-red-300 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-bold">
                            GHOST EDGE
                          </div>
                        </div>
                      </div>
                      <div className="font-medium text-slate-800">{edge.target}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
