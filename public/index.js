const startBtn = document.getElementById("startBtn");
const video = document.getElementById("localVideo");
// const fpsDisplay = document.getElementById("fps");
// const timeSinceDisplay = document.getElementById("timeSince");

// Controls
const bitrateRange = document.getElementById("bitrateRange");
const bitrateValue = document.getElementById("bitrateValue");
const prioritySelect = document.getElementById("prioritySelect");
const degradationSelect = document.getElementById("degradationSelect");

let ws, pc;
let frames = 0;
let lastFrameTime = performance.now();
let lastFpsUpdate = performance.now();

// Update displayed bitrate value on slider change
bitrateRange.addEventListener("input", () => {
  bitrateValue.textContent = bitrateRange.value;
  updateSenderParameters();
});

prioritySelect.addEventListener("change", () => {
  updateSenderParameters();
});

degradationSelect.addEventListener("change", () => {
  updateSenderParameters();
});

// const updateTimeSince = setInterval(() => {
//   const now = performance.now();
//   const diff = (now - lastFrameTime) / 1000;
//   timeSinceDisplay.textContent = diff.toFixed(1);
// }, 100);

let sender; // video RTCRtpSender

async function updateSenderParameters() {
  if (!sender) return;

  const parameters = sender.getParameters();

  if (!parameters.encodings) parameters.encodings = [{}];

  parameters.encodings[0].maxBitrate = parseInt(bitrateRange.value) * 1000; // kbps to bps
  parameters.encodings[0].priority = prioritySelect.value;
  parameters.degradationPreference = degradationSelect.value;

  try {
    await sender.setParameters(parameters);
    // console.log("Updated sender parameters:", parameters);
  } catch (e) {
    console.warn("Failed to update sender parameters:", e);
  }
}

startBtn.onclick = async () => {
  startBtn.disabled = true;

  // Request screen capture with max resolution and lower frame rate
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      width: { max: 1280 },
      height: { max: 720 },
    },
  });

  video.srcObject = stream;

  pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  sender = pc.getSenders().find((s) => s.track.kind === "video");
  if (sender) {
    // Set initial encoding parameters from UI controls
    await updateSenderParameters();
  }

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      ws.send(JSON.stringify({ type: "candidate", candidate: e.candidate }));
    }
  };

  ws = new WebSocket(
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`
  );

  ws.onopen = async () => {
    console.log("✅ WebSocket signaling connected (Streamer)");
    ws.send(JSON.stringify({ type: "register", role: "broadcaster" }));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    ws.send(JSON.stringify({ type: "offer", offer }));
  };

  ws.onmessage = async ({ data }) => {
    try {
      const msg = JSON.parse(data);
      console.log("📩 Received message:", msg);

      if (msg.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
      } else if (msg.type === "candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
      }
    } catch (err) {
      console.error("❌ Error parsing signaling message:", err);
    }
  };

  // Track frame updates for diagnostics
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const track = stream.getVideoTracks()[0];
  const [width, height] = [128, 72];
  canvas.width = width;
  canvas.height = height;

  const imgCapture = new ImageCapture(track);
  async function monitorFrames() {
    if (!stream.active) return;

    try {
      const bitmap = await imgCapture.grabFrame();
      ctx.drawImage(bitmap, 0, 0, width, height);
      frames++;
      const now = performance.now();
      lastFrameTime = now;

      if (now - lastFpsUpdate > 1000) {
        // fpsDisplay.textContent = frames;
        frames = 0;
        lastFpsUpdate = now;
      }
    } catch (e) {
      console.warn("Frame grab failed", e);
    }

    requestAnimationFrame(monitorFrames);
  }

  monitorFrames();
  startBtn.textContent = "Streaming...";
};
