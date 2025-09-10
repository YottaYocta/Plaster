import * as https from "https";
import path from "path";
import os from "os";
import { WebSocketServer, WebSocket } from "ws";
import selfsigned from "selfsigned";
import open from "open";
import { fileURLToPath } from "url";
import express from "express";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🛡️ Generate self-signed cert in memory
const attrs = [{ name: "commonName", value: "localhost" }];
const pems = selfsigned.generate(attrs, {
  days: 365,
  algorithm: "rsa",
  keySize: 2048,
  extensions: [{ name: "basicConstraints", cA: true }],
});

// 🖥️ Create HTTPS server with in-memory key/cert
const server = https.createServer(
  {
    key: pems.private,
    cert: pems.cert,
  },
  app
);

// 🔌 Set up WebSocket over HTTPS
const wss = new WebSocketServer({ server });

let broadcaster = null;
let viewers = [];

wss.on("connection", (ws) => {
  console.log("🟢 WebSocket client connected");

  ws.on("message", (msg, isBinary) => {
    if (isBinary) {
      console.warn("⚠️ Received unexpected binary message; ignoring.");
      return;
    }

    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch (e) {
      console.error("❌ Failed to parse JSON:", e.message);
      return;
    }

    if (data.type === "register") {
      if (data.role === "broadcaster") {
        broadcaster = ws;
        console.log("📡 Broadcaster registered");
      } else if (data.role === "viewer") {
        viewers.push(ws);
        console.log("👀 Viewer registered");
      }
      return;
    }

    if (data.type === "offer" && ws === broadcaster) {
      console.log("➡️ Forwarding offer to viewer");
      viewers.forEach((v) => {
        if (v.readyState === WebSocket.OPEN) v.send(JSON.stringify(data));
      });
    }

    if (data.type === "answer" && viewers.includes(ws)) {
      console.log("⬅️ Forwarding answer to broadcaster");
      if (broadcaster && broadcaster.readyState === WebSocket.OPEN) {
        broadcaster.send(JSON.stringify(data));
      }
    }

    if (data.type === "candidate") {
      console.log("🌐 Forwarding ICE candidate");
      if (ws === broadcaster) {
        viewers.forEach((v) => {
          if (v.readyState === WebSocket.OPEN) v.send(JSON.stringify(data));
        });
      } else {
        if (broadcaster && broadcaster.readyState === WebSocket.OPEN) {
          broadcaster.send(JSON.stringify(data));
        }
      }
    }
  });

  ws.on("close", () => {
    if (ws === broadcaster) {
      broadcaster = null;
      console.log("🔌 Broadcaster disconnected");
    }
    viewers = viewers.filter((v) => v !== ws);
    console.log("🔌 WebSocket client disconnected");
  });

  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err.message);
  });
});

// 📁 Serve static files from "public"
app.use(express.static(path.join(__dirname, "public")));

// 🌐 Get local IP for LAN access
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

const HOST = getLocalIP();
const PORT = 3000;

server.listen(PORT, HOST, async () => {
  console.log(`✅ HTTPS server running at: https://${HOST}:${PORT}`);
  await open(`https://${HOST}:${PORT}`);
});
