import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import "dotenv/config";
import neo4j, { Driver } from "neo4j-driver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let neo4jDriver: Driver | null = null;
if (process.env.NEO4J_URI && process.env.NEO4J_USERNAME && process.env.NEO4J_PASSWORD) {
  try {
    neo4jDriver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
      { connectionTimeout: 5000, maxConnectionPoolSize: 50 }
    );
    neo4jDriver.verifyConnectivity().then(() => {
      console.log("Connected to Neo4j successfully");
    }).catch((e: any) => {
      console.error("Failed to verify Neo4j connectivity:", e.message || e);
      neo4jDriver = null;
    });
  } catch (e: any) {
    console.error("Failed to initialize Neo4j driver:", e.message || e);
    neo4jDriver = null;
  }
} else {
  console.log("Neo4j configuration not found - using in-memory storage");
}

async function syncToNeo4j(nodes: any[], edges: any[]) {
  if (!neo4jDriver) return;
  let session;
  try {
    session = neo4jDriver.session();
    await session.run(`
      UNWIND $nodes AS node
      MERGE (n:Node {id: node.id})
      SET n.type = node.type, n.isCrownJewel = coalesce(node.isCrownJewel, false)
    `, { nodes });

    await session.run(`
      UNWIND $edges AS edge
      MATCH (s:Node {id: edge.source})
      MATCH (t:Node {id: edge.target})
      MERGE (s)-[r:CONNECTED_TO]->(t)
      SET r.isGhostEdge = coalesce(edge.isGhostEdge, false)
    `, { edges });
    console.log("Successfully synced topology to Neo4j");
  } catch (err: any) {
    console.error("Error syncing to Neo4j:", err.message || err);
  } finally {
    if (session) {
      try {
        await session.close();
      } catch (e: any) {
        console.error("Error closing Neo4j session:", e.message || e);
      }
    }
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" },
  });
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock Data (Mutable to allow uploads to modify them)
  let nodes = [
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

  let edges: { source: string; target: string; isGhostEdge?: boolean }[] = [
    { source: "Marketing", target: "WKSTN-MKTG-05" },
    { source: "Marketing", target: "WKSTN-MKTG-42" },
    { source: "Marketing", target: "Printer_VLAN" },
    { source: "Printer_VLAN", target: "Basement_Printer" },
    { source: "HR", target: "DC-01" },
    { source: "Finance", target: "Payroll_Vault" },
  ];

  let identities = [
    { id: "j.smith", name: "Jeffery Miller", group: "Domain Admins", weight: 10.0 },
    { id: "mktg_user_01", name: "Marketing User", group: "Marketing", weight: 1.0 },
    { id: "admin_jeff_corp", name: "Jeffery Miller (Corp)", group: "Domain Admins", weight: 10.0 },
  ];

  let customLogs: any[] = [];

  const upload = multer({ storage: multer.memoryStorage() });

  app.post("/api/upload/:type", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    try {
      const content = req.file.buffer.toString("utf-8");
      let data: any;
      
      try {
        data = JSON.parse(content);
      } catch (e) {
        // Fallback to basic CSV parsing
        const lines = content.split("\n").filter(l => l.trim());
        if (lines.length > 1 && lines[0].includes(",")) {
          const headers = lines[0].split(",").map(h => h.trim());
          data = lines.slice(1).map(line => {
            const values = line.split(",").map(v => v.trim());
            const obj: any = {};
            headers.forEach((h, i) => obj[h] = values[i]);
            return obj;
          });
        } else if (lines.length > 0) {
          // Fallback to raw lines for EDR logs or unstructured data
          data = lines.map(line => ({ raw_log: line }));
        } else {
          throw new Error("File is empty or invalid");
        }
      }
      
      const items = Array.isArray(data) ? data : [data];

      if (req.params.type === "ad") {
        items.forEach(item => {
          if (item.user_id) {
            identities.push({
              id: item.user_id,
              name: item.display_name || item.user_id,
              group: item.assigned_groups?.[0] || "User",
              weight: item.identity_weight_calc || 1.0
            });
          }
        });
      } else if (req.params.type === "fw") {
        items.forEach(item => {
          if (item.source_zone && item.destination_zone) {
            if (!nodes.find(n => n.id === item.source_zone)) nodes.push({ id: item.source_zone, type: "Subnet" });
            if (!nodes.find(n => n.id === item.destination_zone)) nodes.push({ id: item.destination_zone, type: "Subnet" });
            edges.push({
              source: item.source_zone,
              target: item.destination_zone,
              isGhostEdge: item.action !== "ALLOW"
            });
          }
        });
        // Sync the updated topology to Neo4j
        syncToNeo4j(nodes, edges);
      } else if (req.params.type === "edr") {
         customLogs.push(...items);
      }
      res.json({ success: true, count: items.length });
    } catch (e: any) {
      console.error("Parse error:", e.message || e);
      // Fallback for non-JSON or unparseable
      res.json({ success: true, message: "File received but could not be parsed" });
    }
  });

  app.get("/api/map", async (req, res) => {
    if (neo4jDriver) {
      let session;
      try {
        session = neo4jDriver.session();
        const nodesRes = await session.run(`MATCH (n:Node) RETURN n.id AS id, n.type AS type, n.isCrownJewel AS isCrownJewel`);
        const edgesRes = await session.run(`MATCH (s:Node)-[r:CONNECTED_TO]->(t:Node) RETURN s.id AS source, t.id AS target, r.isGhostEdge AS isGhostEdge`);

        const dbNodes = nodesRes.records.map(r => ({
          id: r.get('id'),
          type: r.get('type'),
          isCrownJewel: r.get('isCrownJewel')
        }));

        const dbEdges = edgesRes.records.map(r => ({
          source: r.get('source'),
          target: r.get('target'),
          isGhostEdge: r.get('isGhostEdge')
        }));

        if (dbNodes.length > 0) {
          return res.json({ nodes: dbNodes, edges: dbEdges });
        }
      } catch (err: any) {
        console.error("Error reading from Neo4j:", err.message || err);
      } finally {
        if (session) {
          try {
            await session.close();
          } catch (e: any) {
            console.error("Error closing Neo4j session:", e.message || e);
          }
        }
      }
    }
    res.json({ nodes, edges });
  });

  app.get("/api/identities", (req, res) => {
    res.json(identities);
  });

  app.post("/api/simulate", async (req, res) => {
    const apiKey = process.env.LLM_API_KEY;
    const apiUrl = process.env.LLM_BASE_URL || "https://api.openai.com/v1/chat/completions";
    const modelName = process.env.LLM_MODEL || "gpt-4o-mini";
    
    if (!apiKey) {
      return res.status(500).json({ error: "LLM_API_KEY is not configured in .env" });
    }

    try {
      const prompt = `
      Analyze the following network data and simulate a cyber attack.
      Nodes: ${JSON.stringify(nodes)}
      Edges: ${JSON.stringify(edges)}
      Identities: ${JSON.stringify(identities)}
      Recent Logs: ${JSON.stringify(customLogs.slice(-10))}

      Return a JSON object with this exact structure:
      {
        "title": "String (Name of the attack scenario)",
        "summary": "String (Brief summary of the attack and recommended action)",
        "steps": [
          { "name": "String (Step name)", "desc": "String (Step description)" }
        ],
        "newEdges": [
          { "source": "String (Node ID)", "target": "String (Node ID)", "isGhostEdge": true }
        ]
      }
      `;

      // Using a generic OpenAI-compatible endpoint format.
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: "You are a cybersecurity AI expert. Always respond in valid JSON." },
            { role: "user", content: prompt }
          ]
        }),
        signal: AbortSignal.timeout(15000) // 15 second timeout to prevent hanging
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = errText;
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error?.message || errJson.error?.type || errText;
        } catch (e) {
          // Ignore parse error, use raw text
        }
        throw new Error(`LLM API error (${response.status}): ${errMsg}`);
      }

      const textData = await response.text();
      let data;
      try {
        data = JSON.parse(textData);
      } catch (e) {
        throw new Error(`Failed to parse LLM API response as JSON. Response: ${textData.substring(0, 100)}...`);
      }

      let warStory;
      try {
        let contentStr = data.choices[0].message.content;
        // Clean up markdown code blocks if present
        contentStr = contentStr.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
        warStory = JSON.parse(contentStr);
      } catch (e) {
        throw new Error(`Failed to parse LLM message content as JSON. Content: ${data.choices[0].message.content.substring(0, 100)}...`);
      }
      
      res.json(warStory);
    } catch (error: any) {
      console.error("LLM Simulation Error:", error.message || error);
      
      // Fallback to mock data if the LLM call fails (e.g., invalid key or wrong provider)
      // Make it dynamic based on the uploaded data
      const randomNode1 = nodes.length > 0 ? nodes[Math.floor(Math.random() * nodes.length)].id : "Unknown_Source";
      const randomNode2 = nodes.length > 0 ? nodes[Math.floor(Math.random() * nodes.length)].id : "Unknown_Target";
      
      const ghostEdge = { source: randomNode1, target: randomNode2, isGhostEdge: true };
      
      res.json({
        title: "Simulation Fallback (LLM Error)",
        summary: `The backend LLM encountered an error: ${error.message || "Unknown error"}. Showing fallback simulation based on your data.`,
        steps: [
          { name: "Error", desc: "Failed to connect to the LLM provider or parse response." },
          { name: "Fallback", desc: `Simulated a lateral movement from ${randomNode1} to ${randomNode2}.` }
        ],
        newEdges: [ghostEdge]
      });
    }
  });

  // Socket.io for real-time heartbeats
  io.on("connection", (socket) => {
    console.log("Client connected");
    
    let interval = setInterval(() => {
      let randomEvent;
      if (customLogs.length > 0) {
        const log = customLogs[Math.floor(Math.random() * customLogs.length)];
        randomEvent = {
          type: log.event_type || "Process_Execution",
          user: log.user || "unknown",
          process: log.process_name || "unknown",
          dest: log.network_destination || "unknown",
          variance: 99.9
        };
      } else {
        const events = [
          { type: "Network_Policy_Sync", source: "Marketing_Subnet", dest: "Printer_VLAN", action: "ALLOW" },
          { type: "Identity_Update", user: "admin_jeff_corp", status: "Active_Session", weight: 10.0 },
          { type: "Process_Execution", user: "mktg_user_01", process: "powershell.exe", dest: "10.0.4.15:445", variance: 99.5 }
        ];
        randomEvent = events[Math.floor(Math.random() * events.length)];
      }
      socket.emit("heartbeat", { timestamp: new Date().toISOString(), ...randomEvent });
    }, 3000);

    socket.on("disconnect", () => {
      clearInterval(interval);
      console.log("Client disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "../dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
