import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Activity, ShieldAlert, Zap, Network } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">AI Sentinel Dashboard</h2>
        <p className="text-slate-500 mt-2">Continuous War-Gaming & Threat Detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Nodes</CardTitle>
            <Network className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-slate-500 mt-1">Updated 2 mins ago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Daily Simulations</CardTitle>
            <Zap className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48,000</div>
            <p className="text-xs text-slate-500 mt-1">2,000 battles / hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ghost Edges Detected</CardTitle>
            <Activity className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-slate-500 mt-1">In the last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Threats Isolated</CardTitle>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-slate-500 mt-1">Pending CISO review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>The 5-Step Execution Loop</CardTitle>
            <CardDescription>How the AI protects the network</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold">Map Sync</h4>
                  <p className="text-sm text-slate-500">Updates Digital Twin with new logs & connections.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold">War Briefing</h4>
                  <p className="text-sm text-slate-500">Red General (Attacker) & Blue General (Defender) set goals.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold">2,000 Battles</h4>
                  <p className="text-sm text-slate-500">Simulates 2,000 "What-If" attacks to find the winning path.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">4</div>
                <div>
                  <h4 className="font-semibold">Sentinel Vote</h4>
                  <p className="text-sm text-slate-500">Council of Three votes to isolate threats (requires 2/3 majority).</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">5</div>
                <div>
                  <h4 className="font-semibold">War Story Report</h4>
                  <p className="text-sm text-slate-500">Translates math into a human-readable narrative.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent War Story</CardTitle>
            <CardDescription>The Printer-to-Payroll Pivot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 p-4 rounded-lg border text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold mb-2">CISO Summary:</p>
              "We stopped a breach in progress. An attacker tried to hide behind a basement printer to use a forgotten Admin password. We blocked the printer and saved the Payroll data. Recommended Action: Wipe the memory of all legacy printers and rotate the Admin's password."
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
