// content-iframe.js

function log(...args) {
  console.log("[CR EXT][IFRAME]", ...args);
}

const marker = document.createElement("div");
marker.style.position = "fixed";
marker.style.top = "0";
marker.style.right = "0";
marker.style.zIndex = "999999";
marker.style.background = "red";
marker.style.color = "white";
marker.style.fontSize = "10px";
marker.style.padding = "2px 4px";
marker.textContent = "EXT ACTIVE";
document.body.appendChild(marker);

window.addEventListener("message", async (event) => {
  if (event.data?.type !== "CR_CAPTURE_FRAME") return;

  const video = document.querySelector("video");
  if (!video) return log("No video element found.");
  if (video.readyState < 2) return log("Video not ready.");

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");

  let attempts = 0;

  function attemptCapture() {
    if (video.videoWidth === 0 || video.videoHeight === 0 || video.paused) {
      if (attempts++ > 10) return log("Unable to capture: video not ready.");
      return requestAnimationFrame(attemptCapture);
    }

    try {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      window.parent.postMessage({ type: "CR_FRAME_DATA", data: dataUrl }, "*");
      log("Frame successfully captured and sent.");
    } catch (e) {
      log("drawImage failed:", e);
    }
  }

  requestAnimationFrame(attemptCapture);
});
