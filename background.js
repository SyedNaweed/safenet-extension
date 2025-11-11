chrome.runtime.onInstalled.addListener(() => {
  console.log("SafeNet AI Extension Installed");
});

// background.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "scan_complete" && msg.extractedText) {
    console.log("SafeNet AI: scan result received in background.");

    // Store scan result temporarily
    chrome.storage.local.set({ lastScanResult: msg.extractedText }, () => {
      console.log("✅ Stored last scan result.");
    });

    // Reopen popup after scan complete (auto)
    chrome.action.openPopup();
  }
});