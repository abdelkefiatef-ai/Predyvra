import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Activity, Terminal } from "lucide-react";
import { io } from "socket.io-client";

interface LogEvent {
  timestamp: string;
  type: string;
  source?: string;
  dest?: string;
  action?: string;
  user?: string;
  status?: string;
  weight?: number;
  process?: string;
  variance?: number;
}

export default function Heartbeat() {
  const [logs, setLogs] = useState<LogEvent[]>([]);

  useEffect(() => {
    const socket = io();

    socket.on("heartbeat", (data: LogEvent) => {
      setLogs((prev) => [data, ...prev].slice(0, 50)); // Keep last 50 logs
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Live Heartbeat</h2>
        <p className="text-slate-500 mt-2">Real-time telemetry from EDR & SIEM</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
            Activity Stream
          </CardTitle>
          <CardDescription>Monitoring the "Rhythm" of the building.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-green-400 h-[600px] overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <div className="text-slate-500 flex items-center justify-center h-full">Waiting for telemetry...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="border-b border-slate-800 pb-2 flex items-start gap-4">
                  <div className="text-slate-500 flex-shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</div>
                  <div className="flex-1">
                    <span className="text-blue-400 font-bold">{log.type}</span>
                    <span className="text-slate-300 ml-2">
                      {log.type === "Network_Policy_Sync" && `SRC: ${log.source} -> DST: ${log.dest} [${log.action}]`}
                      {log.type === "Identity_Update" && `USER: ${log.user} STATUS: ${log.status} WEIGHT: ${log.weight}`}
                      {log.type === "Process_Execution" && (
                        <>
                          USER: <span className="text-amber-400">{log.user}</span> 
                          {" "}PROC: <span className="text-red-400">{log.process}</span> 
                          {" "}DST: {log.dest} 
                          {" "}VARIANCE: <span className="text-red-500 font-bold">{log.variance}%</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
