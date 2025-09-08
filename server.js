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

wss.on("connection", (ws, req) => {
  ws.on("message", (msg) => {
    if (Buffer.isBuffer(msg)) {
      viewers.forEach((v) => {
        if (v.readyState === WebSocket.OPEN) v.send(msg);
      });
    } else if (msg.toString() === "viewer") {
      viewers.push(ws);
    }
  });

  ws.on("close", () => {
    viewers = viewers.filter((v) => v !== ws);
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
