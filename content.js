// // content.js
// console.log("SafeNet AI content script active...");

// // === Utility: extract visible textual content from DOM (optionally limited to rect) ===
// function extractVisibleTextFromRect(rect = null, limitChars = 20000) {
//   const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
//   let node;
//   let textPieces = [];
//   let total = 0;
//   while ((node = walker.nextNode())) {
//     const trimmed = node.textContent.replace(/\s+/g, " ").trim();
//     if (!trimmed) continue;
//     if (trimmed.length < 4) continue;
//     if (/^[\d\W\s]+$/.test(trimmed)) continue;

//     const parent = node.parentElement;
//     if (!parent) continue;
//     const rectParent = parent.getBoundingClientRect();
//     if (rectParent.width === 0 && rectParent.height === 0) continue;

//     // If rect provided, ensure some overlap with parent bbox
//     if (rect) {
//       const overlap = !(rect.left > rectParent.right ||
//                         rect.right < rectParent.left ||
//                         rect.top > rectParent.bottom ||
//                         rect.bottom < rectParent.top);
//       if (!overlap) continue;
//     } else {
//       // skip nodes outside viewport to reduce noise (optional)
//       if (rectParent.bottom < 0 || rectParent.top > (window.innerHeight || document.documentElement.clientHeight)) {
//         // allow some off-screen text occasionally; keep simple: skip
//         continue;
//       }
//     }

//     textPieces.push(trimmed);
//     total += trimmed.length;
//     if (total > limitChars) break;
//   }
//   return textPieces.join("\n");
// }

// // === Selection UI (returns a Promise that resolves with rect or null on cancel) ===
// function promptUserSelection() {
//   return new Promise((resolve) => {
//     // create overlay for selection (interactive)
//     const overlay = document.createElement("div");
//     overlay.id = "safenet-selection-overlay";
//     overlay.style.position = "fixed";
//     overlay.style.top = "0";
//     overlay.style.left = "0";
//     overlay.style.width = "100%";
//     overlay.style.height = "100%";
//     overlay.style.background = "rgba(0,0,0,0.25)";
//     overlay.style.zIndex = "1000000";
//     overlay.style.cursor = "crosshair";
//     document.body.appendChild(overlay);

//     const box = document.createElement("div");
//     box.style.position = "absolute";
//     box.style.border = "2px dashed #00e5ff";
//     box.style.background = "rgba(0,229,255,0.06)";
//     overlay.appendChild(box);

//     let startX = 0, startY = 0, selecting = false;

//     const onMouseDown = (e) => {
//       selecting = true;
//       startX = e.clientX;
//       startY = e.clientY;
//       box.style.left = `${startX}px`;
//       box.style.top = `${startY}px`;
//       box.style.width = "0px";
//       box.style.height = "0px";
//     };

//     const onMouseMove = (e) => {
//       if (!selecting) return;
//       const curX = e.clientX;
//       const curY = e.clientY;
//       const left = Math.min(startX, curX);
//       const top = Math.min(startY, curY);
//       const width = Math.abs(curX - startX);
//       const height = Math.abs(curY - startY);
//       box.style.left = `${left}px`;
//       box.style.top = `${top}px`;
//       box.style.width = `${width}px`;
//       box.style.height = `${height}px`;
//     };

//     const cleanup = () => {
//       overlay.removeEventListener("mousedown", onMouseDown);
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("mouseup", onMouseUp);
//       const el = document.getElementById("safenet-selection-overlay");
//       if (el) el.remove();
//     };

//     const onMouseUp = (e) => {
//       selecting = false;
//       const endX = e.clientX;
//       const endY = e.clientY;
//       const left = Math.min(startX, endX);
//       const top = Math.min(startY, endY);
//       const width = Math.abs(endX - startX);
//       const height = Math.abs(endY - startY);

//       // If selection too small, treat as cancel
//       if (width < 10 || height < 10) {
//         cleanup();
//         resolve(null);
//         return;
//       }

//       const rect = {
//         left: left,
//         top: top,
//         right: left + width,
//         bottom: top + height,
//         width,
//         height,
//       };

//       cleanup();
//       resolve(rect);
//     };

//     // Allow pressing Escape to cancel
//     const onKey = (e) => {
//       if (e.key === "Escape") {
//         window.removeEventListener("keydown", onKey);
//         cleanup();
//         resolve(null);
//       }
//     };

//     overlay.addEventListener("mousedown", onMouseDown);
//     window.addEventListener("mousemove", onMouseMove);
//     window.addEventListener("mouseup", onMouseUp);
//     window.addEventListener("keydown", onKey);
//   });
// }

// // === Show your existing animated overlay flow but optionally run extraction ===
// async function startFormalScan(mode = "whole") {
//   // Remove any old overlay
//   const oldOverlay = document.getElementById("safenet-scan-overlay");
//   if (oldOverlay) oldOverlay.remove();

//   // === Semi-transparent overlay (visual-only for whole scan) ===
//   const overlay = document.createElement("div");
//   overlay.id = "safenet-scan-overlay";
//   overlay.style.position = "fixed";
//   overlay.style.top = "0";
//   overlay.style.left = "0";
//   overlay.style.width = "100%";
//   overlay.style.height = "100%";
//   overlay.style.background = "rgba(0, 0, 0, 0.5)";
//   overlay.style.backdropFilter = "blur(2px)";
//   overlay.style.zIndex = "999999";
//   overlay.style.pointerEvents = "none";
//   overlay.style.transition = "opacity 0.5s ease";
//   document.body.appendChild(overlay);

//   const popup = document.createElement("div");
//   popup.style.position = "fixed";
//   popup.style.top = "50%";
//   popup.style.left = "120px";
//   popup.style.transform = "translateY(-50%)";
//   popup.style.background = "rgba(15, 25, 35, 0.95)";
//   popup.style.color = "#00ffff";
//   popup.style.fontFamily = "monospace";
//   popup.style.border = "1px solid rgba(0,255,255,0.3)";
//   popup.style.borderRadius = "14px";
//   popup.style.padding = "20px 36px";
//   popup.style.textAlign = "left";
//   popup.style.boxShadow = "0 0 25px rgba(0,255,255,0.2)";
//   popup.style.maxWidth = "340px";
//   popup.style.fontSize = "17px";
//   popup.style.lineHeight = "1.7";
//   popup.style.animation = "fadeIn 0.6s ease";
//   popup.style.pointerEvents = "none";
//   overlay.appendChild(popup);

//   // animations style
//   const style = document.createElement("style");
//   style.textContent = `
//     @keyframes fadeIn {
//       from { opacity: 0; transform: translateY(-50%) scale(0.97); }
//       to { opacity: 1; transform: translateY(-50%) scale(1); }
//     }
//     @keyframes fadeOut {
//       from { opacity: 1; transform: translateY(-50%) scale(1); }
//       to { opacity: 0; transform: translateY(-50%) scale(0.97); }
//     }
//   `;
//   document.head.appendChild(style);

//   const messages = [
//     "🔍 SafeNet AI: Loading modules...",
//     "⚙ SafeNet AI: Fetching data...",
//     "🧠 SafeNet AI: Checking threats...",
//   ];

//   let index = 0;
//   popup.textContent = messages[index];
//   chrome.runtime.sendMessage({ type: "scan_started" });

//   const interval = setInterval(async () => {
//     index++;
//     if (index < messages.length) {
//       popup.textContent = messages[index];
//     } else {
//       clearInterval(interval);

//       try {
//         popup.textContent = "🧩 Preparing extraction...";

//         let extractedText = "";

//         if (mode === "select") {
//           // prompt user selection rectangle
//           popup.textContent = "✂ Please select an area on the page (Esc to cancel)...";
//           // enable pointer events (temporarily) so user can select
//           overlay.style.pointerEvents = "auto";
//           const rect = await promptUserSelection();
//           overlay.style.pointerEvents = "none";

//           if (!rect) {
//             // user canceled or drew too small area
//             popup.innerHTML = "⚠️ Selection cancelled. Please try again.";
//             chrome.runtime.sendMessage({ type: "scan_complete", extractedText: "" });
//             setTimeout(() => overlay.remove(), 1600);
//             return;
//           }

//           popup.textContent = "🧩 Extracting text from selection...";
//           extractedText = extractVisibleTextFromRect(rect);
//         } else {
//           // whole page extraction
//           popup.textContent = "🧩 Extracting visible text from page...";
//           extractedText = extractVisibleTextFromRect(null);
//         }

//         if (!extractedText || extractedText.trim().length < 8) {
//           popup.innerHTML = "⚠️ No readable text found. Please try selecting a different area or use whole-page scan.";
//           chrome.runtime.sendMessage({ type: "scan_complete", extractedText: "" });
//           setTimeout(() => overlay.remove(), 2600);
//           return;
//         }

//         // send extracted text back to popup (React)
//         popup.textContent = "📤 Returning extracted content to UI...";
//         chrome.runtime.sendMessage({ type: "scan_complete", extractedText });

//         popup.textContent = "✅ SafeNet AI: Scan Complete";
//       } catch (err) {
//         console.error("SafeNet AI scan error:", err);
//         popup.textContent = "❌ Error during extraction";
//         chrome.runtime.sendMessage({ type: "scan_complete", extractedText: "" });
//       }

//       // fade & remove
//       setTimeout(() => {
//         popup.style.animation = "fadeOut 0.9s ease forwards";
//         setTimeout(() => overlay.remove(), 900);
//       }, 1600);
//     }
//   }, 2500);
// }

// // === Listen for messages from popup ===
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "run_screen_scan" || message.action === "startScan") {
//     const mode = message.mode || "whole";
//     console.log("SafeNet AI: Screen scan triggered. mode=", mode);
//     startFormalScan(mode);
//     sendResponse({ status: "scan_started" });
//   }
// });
// content.js
console.log("SafeNet AI content script active...");

// === Utility: extract visible textual content from DOM (optionally limited to rect) ===
function extractVisibleTextFromRect(rect = null, limitChars = 20000) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  let textPieces = [];
  let total = 0;
  while ((node = walker.nextNode())) {
    const trimmed = node.textContent.replace(/\s+/g, " ").trim();
    if (!trimmed) continue;
    if (trimmed.length < 4) continue;
    if (/^[\d\W\s]+$/.test(trimmed)) continue;

    const parent = node.parentElement;
    if (!parent) continue;
    const rectParent = parent.getBoundingClientRect();
    if (rectParent.width === 0 && rectParent.height === 0) continue;

    // Filter by rectangle overlap (for selection mode)
    if (rect) {
      const overlap = !(
        rect.left > rectParent.right ||
        rect.right < rectParent.left ||
        rect.top > rectParent.bottom ||
        rect.bottom < rectParent.top
      );
      if (!overlap) continue;
    } else {
      // skip offscreen nodes for whole-page scans
      if (rectParent.bottom < 0 || rectParent.top > (window.innerHeight || document.documentElement.clientHeight)) {
        continue;
      }
    }

    textPieces.push(trimmed);
    total += trimmed.length;
    if (total > limitChars) break;
  }
  return textPieces.join("\n");
}

// === Selection UI ===
// function promptUserSelection() {
//   return new Promise((resolve) => {
//     const overlay = document.createElement("div");
//     overlay.id = "safenet-selection-overlay";
//     overlay.style.position = "fixed";
//     overlay.style.top = "0";
//     overlay.style.left = "0";
//     overlay.style.width = "100%";
//     overlay.style.height = "100%";
//     overlay.style.background = "rgba(0,0,0,0.15)";
//     overlay.style.zIndex = "1000000";
//     overlay.style.cursor = "crosshair";
//     document.body.appendChild(overlay);

//     const box = document.createElement("div");
//     box.style.position = "absolute";
//     box.style.border = "2px dashed #00ffff";
//     box.style.background = "rgba(0,255,255,0.08)";
//     box.style.boxShadow = "0 0 12px rgba(0,255,255,0.3)";
//     box.style.animation = "pulseBox 1.2s infinite ease-in-out";
//     overlay.appendChild(box);

//     // Add animation
//     const style = document.createElement("style");
//     style.textContent = `
//       @keyframes pulseBox {
//         0% { opacity: 0.9; box-shadow: 0 0 10px rgba(0,255,255,0.3); }
//         50% { opacity: 1; box-shadow: 0 0 20px rgba(0,255,255,0.6); }
//         100% { opacity: 0.9; box-shadow: 0 0 10px rgba(0,255,255,0.3); }
//       }
//     `;
//     document.head.appendChild(style);

//     let startX = 0,
//       startY = 0,
//       selecting = false;

//     const onMouseDown = (e) => {
//       selecting = true;
//       startX = e.clientX;
//       startY = e.clientY;
//       box.style.left = `${startX}px`;
//       box.style.top = `${startY}px`;
//       box.style.width = "0px";
//       box.style.height = "0px";
//     };

//     const onMouseMove = (e) => {
//       if (!selecting) return;
//       const curX = e.clientX;
//       const curY = e.clientY;
//       const left = Math.min(startX, curX);
//       const top = Math.min(startY, curY);
//       const width = Math.abs(curX - startX);
//       const height = Math.abs(curY - startY);
//       box.style.left = `${left}px`;
//       box.style.top = `${top}px`;
//       box.style.width = `${width}px`;
//       box.style.height = `${height}px`;
//     };

//     const cleanup = () => {
//       overlay.removeEventListener("mousedown", onMouseDown);
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("mouseup", onMouseUp);
//       window.removeEventListener("keydown", onKey);
//       const el = document.getElementById("safenet-selection-overlay");
//       if (el) el.remove();
//     };

//     const onMouseUp = (e) => {
//       selecting = false;
//       const endX = e.clientX;
//       const endY = e.clientY;
//       const left = Math.min(startX, endX);
//       const top = Math.min(startY, endY);
//       const width = Math.abs(endX - startX);
//       const height = Math.abs(endY - startY);

//       if (width < 10 || height < 10) {
//         cleanup();
//         resolve(null);
//         return;
//       }

//       const rect = { left, top, right: left + width, bottom: top + height, width, height };
//       cleanup();
//       resolve(rect);
//     };

//     const onKey = (e) => {
//       if (e.key === "Escape") {
//         cleanup();
//         resolve(null);
//       }
//     };

//     overlay.addEventListener("mousedown", onMouseDown);
//     window.addEventListener("mousemove", onMouseMove);
//     window.addEventListener("mouseup", onMouseUp);
//     window.addEventListener("keydown", onKey);
//   });
//}
// === Selection UI (No Blur Version) ===
function promptUserSelection() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.id = "safenet-selection-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.1)", // light dim, no blur
      zIndex: "1000000",
      cursor: "crosshair",
      transition: "background 0.3s ease",
    });
    document.body.appendChild(overlay);

    const box = document.createElement("div");
    Object.assign(box.style, {
      position: "absolute",
      border: "2px dashed #00ffff",
      background: "rgba(0,255,255,0.08)",
      boxShadow: "0 0 12px rgba(0,255,255,0.3)",
      animation: "pulseBox 1.2s infinite ease-in-out",
    });
    overlay.appendChild(box);

    // Add animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulseBox {
        0% { opacity: 0.9; box-shadow: 0 0 10px rgba(0,255,255,0.3); }
        50% { opacity: 1; box-shadow: 0 0 20px rgba(0,255,255,0.6); }
        100% { opacity: 0.9; box-shadow: 0 0 10px rgba(0,255,255,0.3); }
      }
    `;
    document.head.appendChild(style);

    let startX = 0, startY = 0, selecting = false;

    const onMouseDown = (e) => {
      selecting = true;
      startX = e.clientX;
      startY = e.clientY;
      Object.assign(box.style, {
        left: `${startX}px`,
        top: `${startY}px`,
        width: "0px",
        height: "0px",
      });
      overlay.style.background = "rgba(0,0,0,0.05)"; // even lighter while dragging
    };

    const onMouseMove = (e) => {
      if (!selecting) return;
      const curX = e.clientX;
      const curY = e.clientY;
      const left = Math.min(startX, curX);
      const top = Math.min(startY, curY);
      const width = Math.abs(curX - startX);
      const height = Math.abs(curY - startY);
      Object.assign(box.style, {
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      });
    };

    const cleanup = () => {
      overlay.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keydown", onKey);
      const el = document.getElementById("safenet-selection-overlay");
      if (el) el.remove();
    };

    const onMouseUp = (e) => {
      selecting = false;
      overlay.style.background = "rgba(0,0,0,0.1)"; // restore
      const endX = e.clientX;
      const endY = e.clientY;
      const left = Math.min(startX, endX);
      const top = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);

      if (width < 10 || height < 10) {
        cleanup();
        resolve(null);
        return;
      }

      const rect = { left, top, right: left + width, bottom: top + height, width, height };
      cleanup();
      resolve(rect);
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        cleanup();
        resolve(null);
      }
    };

    overlay.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keydown", onKey);
  });
}


// === Main scanning function ===
async function startFormalScan(mode = "whole") {
  const oldOverlay = document.getElementById("safenet-scan-overlay");
  if (oldOverlay) oldOverlay.remove();

  const overlay = document.createElement("div");
  overlay.id = "safenet-scan-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0, 0, 0, 0.45)";
  // overlay.style.backdropFilter = "blur(2px)";
  overlay.style.zIndex = "999999";
  overlay.style.pointerEvents = "none";
  overlay.style.transition = "opacity 0.5s ease";
  document.body.appendChild(overlay);

  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "120px";
  popup.style.transform = "translateY(-50%)";
  popup.style.background = "rgba(15, 25, 35, 0.95)";
  popup.style.color = "#00ffff";
  popup.style.fontFamily = "monospace";
  popup.style.border = "1px solid rgba(0,255,255,0.3)";
  popup.style.borderRadius = "14px";
  popup.style.padding = "20px 36px";
  popup.style.textAlign = "left";
  popup.style.boxShadow = "0 0 25px rgba(0,255,255,0.2)";
  popup.style.maxWidth = "340px";
  popup.style.fontSize = "17px";
  popup.style.lineHeight = "1.7";
  popup.style.animation = "fadeIn 0.6s ease";
  popup.style.pointerEvents = "none";
  overlay.appendChild(popup);

  // animations style
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-50%) scale(0.97); }
      to { opacity: 1; transform: translateY(-50%) scale(1); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(-50%) scale(1); }
      to { opacity: 0; transform: translateY(-50%) scale(0.97); }
    }
  `;
  document.head.appendChild(style);

  const messages = [
    "🔍 SafeNet AI: Loading modules...",
    "⚙ SafeNet AI: Fetching data...",
    "🧠 SafeNet AI: Checking threats...",
  ];

  let index = 0;
  popup.textContent = messages[index];
  chrome.runtime.sendMessage({ type: "scan_started" });

  const interval = setInterval(async () => {
    index++;
    if (index < messages.length) {
      popup.textContent = messages[index];
    } else {
      clearInterval(interval);

      try {
        popup.textContent = "🧩 Preparing extraction...";
        let extractedText = "";

        if (mode === "select") {
          popup.textContent = "✂ Please select an area (Esc to cancel)...";

          // ✅ Fix: enable full pointer events for selection
          overlay.style.pointerEvents = "auto";
          overlay.style.background = "rgba(0,0,0,0.15)";
          overlay.style.cursor = "crosshair";

          const rect = await promptUserSelection();

          overlay.style.pointerEvents = "none"; // restore

          if (!rect) {
            popup.textContent = "⚠ Selection cancelled.";
            chrome.runtime.sendMessage({ type: "scan_complete", extractedText: "" });
            setTimeout(() => overlay.remove(), 1200);
            return;
          }

          popup.textContent = "🧩 Extracting text from selected area...";
          extractedText = extractVisibleTextFromRect(rect);
        } else {
          popup.textContent = "🧩 Extracting visible text from page...";
          extractedText = extractVisibleTextFromRect(null);
        }

        if (!extractedText || extractedText.trim().length < 8) {
          popup.textContent = "⚠ No readable text found.";
          chrome.runtime.sendMessage({ type: "scan_complete", extractedText: "" });
          setTimeout(() => overlay.remove(), 1800);
          return;
        }

        popup.textContent = "📤 Sending extracted text to SafeNet UI...";
        chrome.runtime.sendMessage({ type: "scan_complete", extractedText });
        popup.textContent = "✅ SafeNet AI: Scan Complete";
      } catch (err) {
        console.error("SafeNet AI scan error:", err);
        popup.textContent = "❌ Error during extraction";
        chrome.runtime.sendMessage({ type: "scan_complete", extractedText: "" });
      }

      setTimeout(() => {
        popup.style.animation = "fadeOut 0.9s ease forwards";
        setTimeout(() => overlay.remove(), 900);
      }, 1600);
    }
  }, 2500);
}

// === Message listener from popup ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "run_screen_scan" || message.action === "startScan") {
    const mode = message.mode || "whole";
    console.log("SafeNet AI: Screen scan triggered. Mode =", mode);
    startFormalScan(mode);
    sendResponse({ status: "scan_started" });
  }
});