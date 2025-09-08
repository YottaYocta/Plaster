const fs = require("fs");
const https = require("https");
const express = require("express");
const WebSocket = require("ws");
const os = require("os");
const path = require("path");

const app = express();

// Load SSL cert and key
const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

// Create HTTPS server
const server = https.createServer(options, app);
const wss = new WebSocket.Server({ server });

let viewers = [];

// FPS tracking variables
let framesSent = 0;

wss.on("connection", (ws, req) => {
  console.log("🟢 New WebSocket client connected");

  ws.on("message", (msg, isBinary) => {
    if (isBinary) {
      // Binary data (e.g., JPEG blob from screen stream)
      console.log("📸 Received binary frame, size:", msg.length);

      viewers.forEach((v) => {
        if (v !== ws && v.readyState === WebSocket.OPEN) {
          v.send(msg);
          framesSent++;
          // Commenting out per-send logs to avoid cluttering:
          // console.log("➡️ Sent frame to viewer");
        }
      });
    } else {
      // Text message (e.g., "viewer", "start", etc.)
      const text = msg.toString();
      console.log("💬 Received text message:", text);

      if (text === "viewer") {
        viewers.push(ws);
        console.log("👀 Viewer registered");
      }
    }
  });

  ws.on("close", () => {
    viewers = viewers.filter((v) => v !== ws);
    console.log("🔴 WebSocket client disconnected");
  });

  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err.message);
  });
});

// Log FPS every 3 seconds
setInterval(() => {
  const fps = (framesSent / 3).toFixed(2);
  console.log(`🎞️ Frames sent in last 3 seconds: ${framesSent}, FPS: ${fps}`);
  framesSent = 0;
}, 3000);

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
