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
