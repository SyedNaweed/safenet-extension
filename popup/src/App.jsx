import { useState, useEffect } from "react";

export default function App() {
  const [status, setStatus] = useState("safe");
  const [url, setUrl] = useState("Loading...");
  const [confidence, setConfidence] = useState(100);
  const [reason, setReason] = useState("Detecting...");
  const [theme, setTheme] = useState("dark");
  const [scanType, setScanType] = useState("URL Scan");
  const [scanStatus, setScanStatus] = useState("Idle");
  const [scanMode, setScanMode] = useState("whole"); // "whole" or "select"
  const [backendURL, setBackendURL] = useState("http://localhost:8000/analyze");

  

  // --- Load backend URL ---
  useEffect(() => {
    chrome?.storage?.local?.get(["backendURL"], (res) => {
      if (res?.backendURL) setBackendURL(res.backendURL);
    });
  }, []);

  // --- Extract domain from URL ---
  const getDomain = (rawUrl) => {
    try {
      const u = new URL(rawUrl);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return rawUrl;
    }
  };

  // --- Save scan entry to history ---
  const saveScanToHistory = (entry) => {
    try {
      chrome.storage.local.get(["scanHistory"], (res) => {
        const prev = Array.isArray(res?.scanHistory) ? res.scanHistory : [];
        const newest = [entry, ...prev].slice(0, 100);
        chrome.storage.local.set({ scanHistory: newest });
      });
    } catch (err) {
      console.warn("SafeNet AI: saveScanToHistory error", err);
    }
  };

  // --- Heuristic analysis for extracted text ---
  const analyzeText = (text) => {
    if (!text || text.trim().length === 0)
      return {
        label: "unknown",
        confidence: 0,
        reason:
          "No readable text captured. Please select text or use full-page scan.",
      };

    const lower = text.toLowerCase();
    let score = 0;
    const reasons = [];

    const kw = {
      creds: ["password", "login", "verify", "username", "account", "otp"],
      urgent: ["urgent", "immediately", "asap", "within 24 hours"],
      reward: ["prize", "won", "free", "congratulations", "claim reward"],
      shorteners: ["bit.ly", "tinyurl", "lnkd.in", "shorturl"],
    };

    const urls = text.match(/https?:\/\/[^\s]+/gi) || [];
    if (urls.length) {
      reasons.push(`Found ${urls.length} link(s): ${urls.slice(0, 2).join(", ")}`);
      score += urls.length * 10;
      urls.forEach((u) => {
        if (kw.shorteners.some((s) => u.includes(s))) {
          reasons.push("URL shortener found");
          score += 15;
        }
      });
    }

    if (kw.creds.some((k) => lower.includes(k))) {
      reasons.push("Credential-related text detected");
      score += 25;
    }
    if (kw.urgent.some((k) => lower.includes(k))) {
      reasons.push("Urgency language found");
      score += 10;
    }
    if (kw.reward.some((k) => lower.includes(k))) {
      reasons.push("Reward/scam-like text found");
      score += 10;
    }

    let label = "safe";
    if (score >= 60) label = "dangerous";
    else if (score >= 20) label = "suspicious";

    const confidence = Math.min(98, Math.max(20, score + 30));

    return {
      label,
      confidence,
      reason: reasons.join("; ") || "No suspicious indicators detected.",
    };
  };

  // --- Listen for scan results from content.js ---
  useEffect(() => {
    const listener = (message) => {
      if (message.type === "scan_started") {
        setScanStatus("🧠 Scanning...");
        return;
      }

      if (message.type === "scan_complete") {
        setScanType("Screen Scan");
        const extractedText = message.extractedText || "";

        if (!extractedText || extractedText.length < 8) {
          setStatus("unknown");
          setConfidence(0);
          setReason("No text detected. Try 'Selection' or full-page scan.");
          setScanStatus("❗ No text captured");
          return;
        }

        setScanStatus("🔍 Analyzing text...");
        const frontendRes = analyzeText(extractedText);

        setStatus(frontendRes.label);
        setConfidence(frontendRes.confidence);
        setReason(frontendRes.reason);
        setScanStatus("✅ analysis complete");

        const domain = getDomain(url);
        saveScanToHistory({
          domain,
          url,
          scanType:
            scanMode === "select" ? "Screen Scan (Snip)" : "Screen Scan",
          status: frontendRes.label,
          label: frontendRes.label,
          confidence: frontendRes.confidence,
          reason: frontendRes.reason,
          snippet: extractedText.slice(0, 500),
          date: new Date().toLocaleString(),
        });

        // Optional backend verification
        if (backendURL) {
          setScanStatus("📡 Verifying with backend...");
          fetch(backendURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: extractedText }),
          })
            .then((r) => r.json())
            .then((res) => {
              if (res && res.label) {
                setReason(
                  `Backend: ${res.reason || "verified"} — ${frontendRes.reason}`
                );
                setStatus(res.label === "phishing" ? "dangerous" : res.label);
                setConfidence(
                  Math.round(res.confidence || frontendRes.confidence)
                );
              }
              setScanStatus("✅ Full verification complete");
            })
            .catch(() =>
              setScanStatus("⚠ Backend verification failed")
            );
        }
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [url, backendURL, scanMode]);

  // --- Load auto-saved snip results after popup opens ---
  useEffect(() => {
    chrome.storage.local.get(["lastScanResult"], (res) => {
      const text = res?.lastScanResult;
      if (text && text.trim().length > 0) {
        const frontendRes = analyzeText(text);
        setScanType("Screen Scan (Snip)");
        setStatus(frontendRes.label);
        setConfidence(frontendRes.confidence);
        setReason(frontendRes.reason);
        setScanStatus("✅ Snip Scan Complete");

        saveScanToHistory({
          domain: getDomain(url),
          url,
          scanType: "Screen Scan (Snip)",
          status: frontendRes.label,
          label: frontendRes.label,
          confidence: frontendRes.confidence,
          reason: frontendRes.reason,
          snippet: text.slice(0, 500),
          date: new Date().toLocaleString(),
        });

        // Clean up after reading
        chrome.storage.local.remove("lastScanResult");
      }
    });
  }, []);

  // --- Simulate URL scan ---
  // const checkSiteStatus = (currentUrl) => {
  //   setScanType("URL Scan");
  //   setScanStatus("🧠 Checking URL...");
  //   const rand = Math.random();
  //   setTimeout(() => {
  //     let result;
  //     if (rand < 0.6)
  //       result = { label: "safe", reason: "No issues detected." };
  //     else if (rand < 0.9)
  //       result = { label: "suspicious", reason: "Suspicious form detected." };
  //     else
  //       result = { label: "dangerous", reason: "Phishing patterns found." };

  //     setStatus(result.label);
  //     setConfidence(90);
  //     setReason(result.reason);
  //     setScanStatus("✅ Scan Complete");

  //     saveScanToHistory({
  //       domain: getDomain(currentUrl),
  //       url: currentUrl,
  //       scanType: "URL Scan",
  //       status: result.label,
  //       label: result.label,
  //       confidence: 90,
  //       reason: result.reason,
  //       snippet: "",
  //       date: new Date().toLocaleString(),
  //     });
  //   }, 2000);
  // };
// --- Replace your old checkSiteStatus with this ---
// --- Proper URL check using backend ---
const checkSiteStatus = async (currentUrl) => {
  setScanType("URL Scan");
  setScanStatus("🧠 Checking URL...");

  // If backendURL not set, skip to random
  if (!backendURL) {
    console.warn("❗ No backend URL found — running local simulation");
    const rand = Math.random();
    setTimeout(() => {
      let result;
      if (rand < 0.6)
        result = { label: "safe", reason: "No issues detected." };
      else if (rand < 0.9)
        result = { label: "suspicious", reason: "Suspicious form detected." };
      else
        result = { label: "dangerous", reason: "Phishing patterns found." };

      setStatus(result.label);
      setConfidence(90);
      setReason(result.reason);
      setScanStatus("✅ Local Simulation Complete");
    }, 1500);
    return;
  }

  try {
    setScanStatus("📡 Sending to backend...");
    console.log("Sending to backend:", backendURL, currentUrl);
    const res = await fetch(backendURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentUrl }),
    });

    if (!res.ok) {
      console.error("Backend returned", res.status);
      setScanStatus("⚠ Backend Error");
      setStatus("unknown");
      setReason(`Backend error: ${res.status}`);
      return;
    }

    const data = await res.json();
    console.log("Backend result:", data);

    // Map backend result to frontend display
    let label;
    if (data.label === "phishing") label = "dangerous";
    else if (data.label === "legit") label = "safe";
    else label = "suspicious";

    setStatus(label);
    setConfidence(Math.round(data.confidence || 70));
    setReason(data.reason || "No reason provided");
    setScanStatus("✅ Backend Analysis Complete");

  } catch (err) {
    console.error("Error contacting backend:", err);
    setScanStatus("⚠ Backend Unreachable");
    setStatus("unknown");
    setReason("Could not connect to backend");
  }
};


  // --- Handle screen scan ---
  const handleScreenScan = () => {
    setScanType("Screen Scan");
    const allow = window.confirm(
      "SafeNet AI needs permission to capture your screen.\n\nAllow?"
    );
    if (!allow) return alert("❌ Scan cancelled.");

    setScanStatus("🧠 Initializing...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab?.id) return;

      chrome.tabs.sendMessage(
        activeTab.id,
        { type: "run_screen_scan", mode: scanMode },
        () => {
          if (chrome.runtime.lastError) {
            alert("❌ Unable to scan this page.");
            setScanStatus("❌ Scan Failed");
          } else {
            setTimeout(() => setScanStatus("🔍 Loading modules..."), 1000);
            setTimeout(() => setScanStatus("⚙ Fetching data..."), 4000);
            setTimeout(() => setScanStatus("🧠 Checking threats..."), 7000);
          }
        }
      );
    });
  };

  // --- Get current URL ---
  useEffect(() => {
    chrome?.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url || "Unknown URL";
      setUrl(currentUrl);
      checkSiteStatus(currentUrl);
    });
  }, []);

  // --- Color utility ---
  const getBadgeGradient = () => {
    switch (status) {
      case "safe":
        return "bg-gradient-to-r from-green-400 to-green-600";
      case "suspicious":
        return "bg-gradient-to-r from-yellow-300 to-yellow-500 text-black";
      case "dangerous":
        return "bg-gradient-to-r from-red-500 to-red-700";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div
      className={`${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } flex justify-center items-center min-h-screen p-4`}
    >
      <div
        className={`w-96 rounded-2xl shadow-2xl p-6 flex flex-col space-y-4 ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-50"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">SafeNet AI</h1>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`px-2 py-1 rounded ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
        </div>

        {/* Scan Type */}
        <div className="text-center font-semibold text-sm">
          {scanType === "Screen Scan"
            ? "🖥 Screen Scan Results:"
            : "🌐 URL Scan Results:"}
        </div>

        {/* Status */}
        <div
          className={`${getBadgeGradient()} rounded-full px-4 py-2 font-semibold text-center text-sm animate-pulse`}
        >
          {status === "safe"
            ? "✅ Safe"
            : status === "suspicious"
            ? "⚠ Suspicious"
            : status === "dangerous"
            ? "❌ Phishing Alert"
            : "ℹ Unknown"}
        </div>

        {/* Scan progress */}
        <div className="text-center text-sm text-blue-400 italic animate-pulse">
          {scanStatus}
        </div>

        {/* Scrollable Results Box */}
        <div
          className={`rounded-xl p-4 max-h-32 overflow-y-auto ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}
          style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
        >
          <p className="text-sm break-words">
            <span className="font-semibold">URL:</span>{" "}
            <span className="text-blue-300">{url}</span>
          </p>
          <p className="text-sm">
            <span className="font-semibold">Confidence:</span> {confidence}%
          </p>
          <p className="text-sm mt-1">
            <span className="font-semibold">Reason:</span>
            <br />
            <span className="text-xs text-gray-300 leading-snug">{reason}</span>
          </p>
        </div>

        {/* Scan Mode */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Scan Mode:</span>
          <select
            value={scanMode}
            onChange={(e) => setScanMode(e.target.value)}
            className="ml-2 p-2 rounded bg-gray-600 text-white text-sm"
          >
            <option value="whole">Whole Page</option>
            <option value="select">Selection (Snip)</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-3">
          <div className="flex gap-3">
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl"
              onClick={() => checkSiteStatus(url)}
            >
              🔍 Scan Again
            </button>
            <button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-xl"
              onClick={handleScreenScan}
            >
              🖥 Check Screen
            </button>
          </div>
          <button
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-xl"
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            ⚙ Advanced Options / Report
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs mt-2">
          SafeNet AI © 2025 | Trusted Browser Security
        </div>
      </div>
    </div>
  );
}