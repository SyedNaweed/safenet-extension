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
    { url: "https://suspicious-site.com", status: "Suspicious", date: "2025-09-06" },
  ]);

  // Export history to JSON
  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: "application/json",
    });
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
      case "Safe":
        return "text-green-500";
      case "Suspicious":
        return "text-yellow-500";
      case "Dangerous":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">SafeNet AI Dashboard</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
          onClick={exportHistory}
        >
          📥 Export History
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Settings Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Settings</h2>

          <label className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
            <span className="text-white">Enable real-time protection</span>
            <input
              type="checkbox"
              checked={realtime}
              onChange={() => setRealtime(!realtime)}
              className="w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
            <span className="text-white">Show warnings before login forms</span>
            <input
              type="checkbox"
              checked={warnings}
              onChange={() => setWarnings(!warnings)}
              className="w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
            <span className="text-white">Send anonymous usage data</span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={() => setAnalytics(!analytics)}
              className="w-5 h-5"
            />
          </label>
        </div>

        {/* Scan History Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Scan History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-2 text-gray-300">URL</th>
                  <th className="text-left p-2 text-gray-300">Status</th>
                  <th className="text-left p-2 text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-700 hover:bg-gray-700 transition"
                  >
                    <td className="p-2 break-words">{h.url}</td>
                    <td
                      className={`p-2 font-semibold ${getStatusColor(h.status)}`}
                    >
                      {h.status}
                    </td>
                    <td className="p-2">{h.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="max-w-6xl mx-auto mt-8 bg-gray-800 rounded-2xl shadow-2xl p-6 text-gray-300">
        <h3 className="font-semibold text-white mb-2">Analytics Overview</h3>
        {history.length === 0 ? (
          <p>No scan history available.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p>Total Scans: {history.length}</p>
            <p>Safe: {history.filter((h) => h.status === "Safe").length}</p>
            <p>
              Suspicious: {history.filter((h) => h.status === "Suspicious").length}
            </p>
            <p>Dangerous: {history.filter((h) => h.status === "Dangerous").length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
