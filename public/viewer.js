const video = document.getElementById("remoteVideo");
const fullscreenBtn = document.getElementById("fullscreenBtn");

fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    // Request full screen on the video element
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen(); // Safari
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen(); // IE11
    }
    fullscreenBtn.textContent = "Exit Full Screen";
  } else {
    // Exit full screen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen(); // Safari
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen(); // IE11
    }
    fullscreenBtn.textContent = "Full Screen";
  }
});

// Handle full screen change to update button text accordingly
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    fullscreenBtn.textContent = "Full Screen";
  }
});
document.addEventListener("webkitfullscreenchange", () => {
  if (!document.webkitFullscreenElement) {
    fullscreenBtn.textContent = "Full Screen";
  }
});
document.addEventListener("msfullscreenchange", () => {
  if (!document.msFullscreenElement) {
    fullscreenBtn.textContent = "Full Screen";
  }
});

let ws;
let pc = null;
let stream = null;

function createPeerConnection() {
  const newPc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  newPc.onicecandidate = (e) => {
    if (e.candidate) {
      ws.send(JSON.stringify({ type: "candidate", candidate: e.candidate }));
    }
  };

  newPc.ontrack = (event) => {
    console.log("🎥 New remote track received");
    if (stream) {
      // Remove previous stream tracks
      stream.getTracks().forEach((track) => track.stop());
    }

    stream = event.streams[0];
    video.srcObject = stream;
  };

  return newPc;
}

function setupWebSocket() {
  ws = new WebSocket(
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`
  );

  ws.onopen = () => {
    console.log("✅ WebSocket connected to signaling server (Viewer)");
    ws.send(JSON.stringify({ type: "register", role: "viewer" }));
  };

  ws.onmessage = async ({ data }) => {
    try {
      const msg = JSON.parse(data);
      console.log("📩 Received signaling message:", msg);

      if (msg.type === "offer") {
        console.log("🔁 New offer received – resetting connection");

        if (pc) {
          pc.close();
          pc = null;
        }

        pc = createPeerConnection();

        await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        ws.send(JSON.stringify({ type: "answer", answer }));
      }

      if (msg.type === "candidate" && msg.candidate && pc) {
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
      }
    } catch (err) {
      console.error("❌ Failed to process signaling message:", err);
    }
  };
}

setupWebSocket();
