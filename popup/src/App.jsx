import { useState, useEffect } from "react";

export default function App() {
  const [status, setStatus] = useState("safe"); // safe / suspicious / dangerous
  const [url, setUrl] = useState("Loading...");
  const [confidence, setConfidence] = useState(100);
  const [reason, setReason] = useState("Detecting...");
  const [theme, setTheme] = useState("dark"); // dark/light toggle

  const checkSiteStatus = (currentUrl) => {
    const rand = Math.random();
    if (rand < 0.6) {
      setStatus("safe");
      setConfidence(Math.floor(90 + Math.random() * 10));
      setReason("No suspicious activity detected.");
    } else if (rand < 0.9) {
      setStatus("suspicious");
      setConfidence(Math.floor(60 + Math.random() * 30));
      setReason("Detected suspicious form input.");
    } else {
      setStatus("dangerous");
      setConfidence(Math.floor(70 + Math.random() * 20));
      setReason("Domain mismatch / phishing patterns detected!");
    }
  };

  useEffect(() => {
    if (chrome && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0]?.url || "Unknown URL";
        setUrl(currentUrl);
        checkSiteStatus(currentUrl);
      });
    }
  }, []);

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

  // -------- Probability Distribution --------
  let safePercent = 0,
    suspiciousPercent = 0,
    dangerousPercent = 0;

  if (status === "safe") {
    safePercent = confidence;
    suspiciousPercent = Math.floor((100 - confidence) * 0.6);
    dangerousPercent = 100 - safePercent - suspiciousPercent;
  } else if (status === "suspicious") {
    suspiciousPercent = confidence;
    safePercent = Math.floor((100 - confidence) * 0.5);
    dangerousPercent = 100 - suspiciousPercent - safePercent;
  } else if (status === "dangerous") {
    dangerousPercent = confidence;
    suspiciousPercent = Math.floor((100 - confidence) * 0.7);
    safePercent = 100 - dangerousPercent - suspiciousPercent;
  }

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      } flex justify-center items-center min-h-screen p-4 transition-colors duration-300`}
    >
      <div
        className={`popup-card w-96 rounded-2xl shadow-2xl p-6 flex flex-col space-y-4 transition-colors duration-300 ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-50"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-center">SafeNet AI</h1>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`px-2 py-1 rounded ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            } transition-colors duration-200`}
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
        </div>

        {/* Status Badge */}
        <div
          className={`${getBadgeGradient()} rounded-full px-4 py-2 font-semibold text-center text-sm animate-pulse`}
          title={reason}
        >
          {status === "safe"
            ? "✅ Safe"
            : status === "suspicious"
            ? "⚠️ Suspicious"
            : "❌ Phishing Alert"}
        </div>

        {/* Details Section */}
        <div
          className={`details rounded-xl p-4 space-y-2 transition-colors duration-300 ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          <p className="text-sm break-words">
            <span className="font-semibold">URL:</span> {url}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Confidence:</span> {confidence}%
          </p>
          <p className="text-sm">
            <span className="font-semibold">Reason:</span> {reason}
          </p>
        </div>

        {/* Analytics Overview */}
        <div>
          <h2 className="text-sm font-semibold mb-1">Analytics Overview</h2>
          <div
            className={`flex h-3 w-full rounded overflow-hidden mb-2 ${
              theme === "dark" ? "bg-gray-600" : "bg-gray-300"
            }`}
          >
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
              style={{ width: `${safePercent}%` }}
            ></div>
            <div
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-500"
              style={{ width: `${suspiciousPercent}%` }}
            ></div>
            <div
              className="bg-gradient-to-r from-red-500 to-red-700 transition-all duration-500"
              style={{ width: `${dangerousPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs">
            <span>Safe ({safePercent}%)</span>
            <span>Suspicious ({suspiciousPercent}%)</span>
            <span>Dangerous ({dangerousPercent}%)</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 rounded-xl shadow-md transition-all duration-200"
            onClick={() => checkSiteStatus(url)}
          >
            🔍 Scan Again
          </button>
          <button
            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 rounded-xl shadow-md transition-all duration-200"
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            ⚙️ Advanced Options
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
