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

  log("Capture request received.");
  const video = document.querySelector("video");
  if (!video) return log("No video element found.");

  try {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    log("Frame captured.");
    window.parent.postMessage({ type: "CR_FRAME_DATA", data: dataUrl }, "*");
  } catch (err) {
    log("Frame capture failed:", err);
  }
});
