chrome.webNavigation.onCompleted.addListener(
  (details) => {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId, frameIds: [details.frameId] },
      files: ["content-iframe.js"],
    });
  },
  { url: [{ hostSuffix: "static.crunchyroll.com" }] }
);
