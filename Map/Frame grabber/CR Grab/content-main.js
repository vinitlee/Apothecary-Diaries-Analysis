// content-main.js

function log(...args) {
  console.log("[CR EXT]", ...args);
}

window.addEventListener("keydown", async (e) => {
  if (e.ctrlKey && e.altKey && e.code === "KeyC") {
    log("Shortcut detected, sending capture request...");
    const iframe = document.querySelector('iframe[src*="vilos/player.html"]');
    if (!iframe) return log("No video iframe found.");

    iframe.contentWindow.postMessage({ type: "CR_CAPTURE_FRAME" }, "*");
  }
});

window.addEventListener("message", async (event) => {
  if (event.source !== window && event.data?.type === "CR_FRAME_DATA") {
    const base64 = event.data.data;
    log("Received image data from iframe.");

    try {
      const blob = await (await fetch(base64)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      log("Image copied to clipboard.");
    } catch (err) {
      log("Clipboard write failed:", err);
    }
  }
});
