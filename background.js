chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    checkUrlAndBlock(tabId, changeInfo.url);
  } else if (tab.url) {
    checkUrlAndBlock(tabId, tab.url);
  }
});

function checkUrlAndBlock(tabId, urlString) {
  if (urlString.startsWith('chrome-extension://')) return;

  try {
    const urlObj = new URL(urlString);
    let hostname = urlObj.hostname.replace(/^www\./, '');

    chrome.storage.local.get(['blockedSites'], (result) => {
      let blockedSites = result.blockedSites || [];
      const now = Date.now();
      
      let activeBlocks = blockedSites.filter(site => site.unblockTime > now);
      
      if (activeBlocks.length !== blockedSites.length) {
        chrome.storage.local.set({ blockedSites: activeBlocks });
      }

      for (let site of activeBlocks) {
        if (hostname === site.domain || hostname.endsWith('.' + site.domain)) {
          const blockedUrl = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(site.domain)}&unblockTime=${site.unblockTime}`);
          chrome.tabs.update(tabId, { url: blockedUrl });
          break;
        }
      }
    });
  } catch (e) {
    // Ignore invalid URLs
  }
}
