const fs = require("fs");
const https = require("https");
const express = require("express");
const WebSocket = require("ws");
const os = require("os");
const path = require("path");
const selfsigned = require("selfsigned");

// 📜 Automatically generate key.pem and cert.pem if missing
function ensureCertificates() {
  const keyPath = path.resolve(__dirname, "key.pem");
  const certPath = path.resolve(__dirname, "cert.pem");

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log("🔐 Using existing key.pem and cert.pem");
    return;
  }

  console.log(
    "📄 key.pem and/or cert.pem not found. Generating new self-signed cert..."
  );

  const attrs = [{ name: "commonName", value: "localhost" }];
  const pems = selfsigned.generate(attrs, {
    days: 365,
    algorithm: "rsa",
    keySize: 2048,
    extensions: [{ name: "basicConstraints", cA: true }],
  });

  fs.writeFileSync(keyPath, pems.private);
  fs.writeFileSync(certPath, pems.cert);

  console.log("✅ Generated key.pem and cert.pem");
}

// 🛡️ Ensure certificates before starting HTTPS server
ensureCertificates();

const app = express();

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

const server = https.createServer(options, app);
const wss = new WebSocket.Server({ server });

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

    // Register broadcaster or viewer
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

    // Forward signaling messages
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

app.use(express.static(path.join(__dirname, "public")));

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

server.listen(PORT, HOST, () => {
  console.log(`✅ HTTPS server running at: https://${HOST}:${PORT}`);
});
