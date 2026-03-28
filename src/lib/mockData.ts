// Mock data for frontend-only mode (when backend is not running)

export const mockNodes = [
  { id: "Marketing", type: "Subnet" },
  { id: "Finance", type: "Subnet" },
  { id: "HR", type: "Subnet" },
  { id: "Printer_VLAN", type: "Subnet" },
  { id: "DC-01", type: "Server", isCrownJewel: true },
  { id: "Payroll_Vault", type: "Server", isCrownJewel: true },
  { id: "WKSTN-MKTG-05", type: "Endpoint" },
  { id: "WKSTN-MKTG-42", type: "Endpoint" },
  { id: "Basement_Printer", type: "Printer" },
];

export const mockEdges = [
  { source: "Marketing", target: "WKSTN-MKTG-05" },
  { source: "Marketing", target: "WKSTN-MKTG-42" },
  { source: "Marketing", target: "Printer_VLAN" },
  { source: "Printer_VLAN", target: "Basement_Printer" },
  { source: "HR", target: "DC-01" },
  { source: "Finance", target: "Payroll_Vault" },
];

export const mockIdentities = [
  { id: "j.smith", name: "Jeffery Miller", group: "Domain Admins", weight: 10.0 },
  { id: "mktg_user_01", name: "Marketing User", group: "Marketing", weight: 1.0 },
  { id: "admin_jeff_corp", name: "Jeffery Miller (Corp)", group: "Domain Admins", weight: 10.0 },
];

export const mockHeartbeatEvents = [
  { type: "Network_Policy_Sync", source: "Marketing_Subnet", dest: "Printer_VLAN", action: "ALLOW" },
  { type: "Identity_Update", user: "admin_jeff_corp", status: "Active_Session", weight: 10.0 },
  { type: "Process_Execution", user: "mktg_user_01", process: "powershell.exe", dest: "10.0.4.15:445", variance: 99.5 },
  { type: "Network_Policy_Sync", source: "Finance_Subnet", dest: "Payroll_Vault", action: "ALLOW" },
  { type: "Process_Execution", user: "j.smith", process: "cmd.exe", dest: "10.0.4.22:443", variance: 87.2 },
];

export const mockSimulationResult = {
  title: "Lateral Movement via Compromised Marketing Endpoint",
  summary: "An attacker gained initial access through a phishing email on WKSTN-MKTG-42, then moved laterally through the Printer_VLAN to reach the Finance subnet. Recommend segmenting the Printer_VLAN and enabling MFA for all admin accounts.",
  steps: [
    { name: "Initial Access", desc: "Phishing email opened on WKSTN-MKTG-42, malware executed." },
    { name: "Privilege Escalation", desc: "Attacker obtained local admin credentials via mimikatz." },
    { name: "Lateral Movement", desc: "Used compromised printer service account to pivot through Printer_VLAN." },
    { name: "Target Discovery", desc: "Scanned Finance subnet and identified Payroll_Vault server." },
    { name: "Objective Complete", desc: "Exfiltrated sensitive payroll data via encrypted tunnel." },
  ],
  newEdges: [
    { source: "WKSTN-MKTG-42", target: "Printer_VLAN", isGhostEdge: true },
    { source: "Printer_VLAN", target: "Finance", isGhostEdge: true },
    { source: "Finance", target: "Payroll_Vault", isGhostEdge: true },
  ],
};
