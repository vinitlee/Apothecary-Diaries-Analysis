chrome.webNavigation.onCompleted.addListener(
  ({ tabId, frameId, url }) => {
    if (
      url.startsWith(
        "https://static.crunchyroll.com/vilos-v2/web/vilos/player.html"
      )
    ) {
      chrome.scripting.executeScript({
        target: { tabId, frameIds: [frameId] },
        files: ["content-iframe.js"],
      });
    }
  },
  {
    url: [{ hostContains: "static.crunchyroll.com" }],
  }
);
