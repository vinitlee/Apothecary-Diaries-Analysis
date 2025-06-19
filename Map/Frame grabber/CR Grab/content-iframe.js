console.log("🔍 Content script loaded for frame capture.");

const marker = document.createElement("div");
marker.textContent = "Iframe script active";
marker.style.position = "fixed";
marker.style.top = "0";
marker.style.left = "0";
marker.style.background = "red";
marker.style.zIndex = 9999;
document.body.appendChild(marker);

async function getVideoFrameAsBlob(videoElement) {
  console.log("🔍 Capturing video frame...");
  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoElement, 0, 0);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

async function copyFrameToClipboard(video) {
  console.log("🔍 Copying frame to clipboard...");
  const blob = await getVideoFrameAsBlob(video);
  const item = new ClipboardItem({ "image/png": blob });
  await navigator.clipboard.write([item]);
  console.log("📋 Frame copied to clipboard.");
}

window.addEventListener("message", async (event) => {
  console.log("🔍 Received message:", event.data);
  if (event.data?.type === "CAPTURE_FRAME") {
    const video = document.querySelector("video");
    if (video && video.readyState >= 2) {
      try {
        await copyFrameToClipboard(video);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  }
});
