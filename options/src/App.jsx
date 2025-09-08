import { useState } from "react";

export default function Options() {
  // Settings toggles
  const [realtime, setRealtime] = useState(true);
  const [warnings, setWarnings] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  // Sample scan history
  const [history, setHistory] = useState([
    { url: "https://example.com", status: "Safe", date: "2025-09-08" },
    { url: "https://phishingsite.com", status: "Dangerous", date: "2025-09-07" },
    { url: "https://suspicious-site.com", status: "Suspicious", date: "2025-09-06" }
  ]);

  // Export history to JSON
  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scan_history.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper for status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Safe": return "text-green-500";
      case "Suspicious": return "text-yellow-500";
      case "Dangerous": return "text-red-500";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="p-4 w-96 font-sans bg-gray-900 text-white rounded-lg">
      <h1 className="text-xl font-bold mb-4">SafeNet AI - Settings</h1>

      {/* Settings toggles */}
      <div className="mb-6 space-y-2">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={realtime} onChange={() => setRealtime(!realtime)} />
          <span>Enable real-time protection</span>
        </label>

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={warnings} onChange={() => setWarnings(!warnings)} />
          <span>Show warnings before login forms</span>
        </label>

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={analytics} onChange={() => setAnalytics(!analytics)} />
          <span>Send anonymous usage data</span>
        </label>
      </div>

      {/* Scan history table */}
      <h2 className="text-lg font-bold mb-2">Scan History</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left p-1">URL</th>
              <th className="text-left p-1">Status</th>
              <th className="text-left p-1">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-b border-gray-700">
                <td className="p-1">{h.url}</td>
                <td className={`p-1 font-semibold ${getStatusColor(h.status)}`}>{h.status}</td>
                <td className="p-1">{h.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export button */}
      <button
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        onClick={exportHistory}
      >
        📥 Export History
      </button>
    </div>
  );
}
