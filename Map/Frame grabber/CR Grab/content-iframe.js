// content-iframe.js

// 1. Add marker to show script is active
console.log("[CR EXT] Injected content-iframe.js");
const marker = document.createElement("div");
marker.textContent = "📸 Iframe script active";
marker.style.position = "fixed";
marker.style.top = "0";
marker.style.left = "0";
marker.style.background = "rgba(0,0,0,0.7)";
marker.style.color = "white";
marker.style.fontSize = "12px";
marker.style.padding = "2px 6px";
marker.style.zIndex = 9999;
document.body.appendChild(marker);

// 2. Listen for message from main script
console.log("[CR EXT] Setting up message listener");
window.addEventListener("message", async (event) => {
  console.log("[CR EXT] Received message:", event.data);

  if (event.data?.type !== "CR_CAPTURE_FRAME") {
    console.log("[CR EXT] Ignored message: wrong type", event.data?.type);
    return;
  }

  console.log("[CR EXT] Valid capture request received");

  try {
    const video = document.querySelector("video");
    if (!video) {
      console.warn("[CR EXT] No video element found");
      return;
    }
    if (video.readyState < 2) {
      console.warn(
        "[CR EXT] Video not ready (readyState:",
        video.readyState,
        ")"
      );
      return;
    }

    console.log(
      "[CR EXT] Capturing frame:",
      video.videoWidth,
      "x",
      video.videoHeight
    );

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // const bitmap = await createImageBitmap(video);
    // ctx.drawImage(bitmap, 0, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    console.log("[CR EXT] Frame drawn to canvas");

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("[CR EXT] canvas.toBlob failed");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        console.log("[CR EXT] Sending captured frame back");
        window.postMessage(
          {
            type: "CR_FRAME_CAPTURED",
            payload: reader.result,
          },
          "*"
        );
      };
      reader.onerror = (e) => {
        console.error("[CR EXT] FileReader error:", e);
      };
      reader.readAsDataURL(blob);
    }, "image/png");
  } catch (err) {
    console.error("[CR EXT] Frame capture failed:", err);
  }
});
