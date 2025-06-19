// Runs on www.crunchyroll.com
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.altKey && e.code === "KeyC") {
    console.log("🔍 Capturing frame...");
    const iframe = document.querySelector("iframe.video-player");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: "CAPTURE_FRAME" }, "*");
    } else {
      console.error("❌ No video player iframe found.");
      console.log(iframe);
      console.log(iframe.contentWindow);
    }
  }
});

window.addEventListener("message", async (event) => {
  if (event.data?.type === "VIDEO_FRAME_DATA") {
    const uint8Array = new Uint8Array(event.data.data);
    const blob = new Blob([uint8Array], { type: "image/png" });

    try {
      const item = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item]);
      console.log("✅ Frame copied from iframe via parent.");
    } catch (err) {
      console.error("❌ Clipboard copy in parent failed:", err);
    }
  }
});
