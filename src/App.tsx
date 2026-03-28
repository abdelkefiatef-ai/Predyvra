/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Activity, Shield, Users, Network, Play, CheckSquare } from "lucide-react";
import { cn } from "@/src/lib/utils";

import Dashboard from "./pages/Dashboard";
import NetworkMap from "./pages/NetworkMap";
import Identities from "./pages/Identities";
import Heartbeat from "./pages/Heartbeat";
import Simulation from "./pages/Simulation";
import Onboarding from "./pages/Onboarding";

function Sidebar() {
  const location = useLocation();
  
  const links = [
    { name: "Dashboard", path: "/", icon: Shield },
    { name: "Network Map", path: "/map", icon: Network },
    { name: "Identities", path: "/identities", icon: Users },
    { name: "Live Heartbeat", path: "/heartbeat", icon: Activity },
    { name: "War Game Simulation", path: "/simulate", icon: Play },
    { name: "Onboarding", path: "/onboarding", icon: CheckSquare },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          AI Sentinel
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        Status: <span className="text-green-400">Active Mode</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<NetworkMap />} />
            <Route path="/identities" element={<Identities />} />
            <Route path="/heartbeat" element={<Heartbeat />} />
            <Route path="/simulate" element={<Simulation />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
