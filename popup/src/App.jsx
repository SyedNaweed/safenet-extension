import { useState, useEffect } from "react";


export default function App() {
  const [status, setStatus] = useState("safe"); // safe / suspicious / dangerous
  const [url, setUrl] = useState("Loading...");
  const [confidence, setConfidence] = useState(100);
  const [reason, setReason] = useState("Detecting...");

  // Simulated site check
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

  // Get current tab URL
  useEffect(() => {
    if (chrome && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0]?.url || "Unknown URL";
        setUrl(currentUrl);
        checkSiteStatus(currentUrl);
      });
    }
  }, []);

  const getBadge = () => {
    switch (status) {
      case "safe":
        return "✅ Safe";
      case "suspicious":
        return "⚠️ Suspicious";
      case "dangerous":
        return "❌ Phishing Alert";
      default:
        return "Unknown";
    }
  };

  const getBadgeColor = () => {
    switch (status) {
      case "safe":
        return "bg-green-500 text-white";
      case "suspicious":
        return "bg-yellow-400 text-black";
      case "dangerous":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-400 text-black";
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800 p-4">
      <div className="popup-card w-80 bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col space-y-4">
        
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-white">SafeNet AI</h1>

        {/* Status Badge */}
        <div className={`status-badge ${getBadgeColor()} rounded-full px-4 py-2 font-semibold text-center text-sm`}>
          {getBadge()}
        </div>

        {/* Details Section */}
        <div className="details bg-gray-800 rounded-xl p-4 space-y-2">
          <p className="text-sm break-words"><span className="font-semibold">URL:</span> {url}</p>
          <p className="text-sm"><span className="font-semibold">Confidence:</span> {confidence}%</p>
          <p className="text-sm"><span className="font-semibold">Reason:</span> {reason}</p>
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
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-xl shadow-md transition-all duration-200"
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            📜 View Report
          </button>
        </div>

      </div>
    </div>
  );
}
