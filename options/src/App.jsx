

// // App.jsx OPTIONS
// import { useState, useEffect } from "react";

// export default function Options() {
//   const [realtime, setRealtime] = useState(true);
//   const [warnings, setWarnings] = useState(true);
//   const [analytics, setAnalytics] = useState(false);
//   const [history, setHistory] = useState([
//     {
//       url: "https://example.com",
//       status: "Safe",
//       label: "Normal Website",
//       domain: "example.com",
//       date: "2025-09-08",
//     },
//     {
//       url: "https://phishingsite.com",
//       status: "Dangerous",
//       label: "Phishing / Spam Detected",
//       domain: "phishingsite.com",
//       date: "2025-09-07",
//     },
//     {
//       url: "https://suspicious-site.com",
//       status: "Suspicious",
//       label: "Potential Risk - Login Form Detected",
//       domain: "suspicious-site.com",
//       date: "2025-09-06",
//     },
//   ]);

//   useEffect(() => {
//     if (chrome?.storage) {
//       chrome.storage.local.get(["scanHistory"], (result) => {
//         if (result.scanHistory) setHistory(result.scanHistory);
//       });
//     }
//   }, []);

//   const exportHistory = () => {
//     const blob = new Blob([JSON.stringify(history, null, 2)], {
//       type: "application/json",
//     });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "SafeNet_scan_history.json";
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Safe":
//         return "text-green-500";
//       case "Suspicious":
//         return "text-yellow-400";
//       case "Dangerous":
//         return "text-red-500";
//       default:
//         return "text-gray-400";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 p-6 text-white">
//       {/* Header */}
//       <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">SafeNet AI Dashboard</h1>
//         <button
//           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
//           onClick={exportHistory}
//         >
//           📥 Export History
//         </button>
//       </div>

//       <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
//         {/* Settings */}
//         <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-4">
//           <h2 className="text-xl font-semibold">Settings</h2>

//           <label className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
//             <span>Enable real-time protection</span>
//             <input
//               type="checkbox"
//               checked={realtime}
//               onChange={() => setRealtime(!realtime)}
//               className="w-5 h-5"
//             />
//           </label>

//           <label className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
//             <span>Show warnings before login forms</span>
//             <input
//               type="checkbox"
//               checked={warnings}
//               onChange={() => setWarnings(!warnings)}
//               className="w-5 h-5"
//             />
//           </label>

//           <label className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
//             <span>Send anonymous usage data</span>
//             <input
//               type="checkbox"
//               checked={analytics}
//               onChange={() => setAnalytics(!analytics)}
//               className="w-5 h-5"
//             />
//           </label>
//         </div>

//         {/* Scan History */}
//         <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
//           <h2 className="text-xl font-semibold mb-4">Recent Scans</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm border-collapse">
//               <thead>
//                 <tr className="border-b border-gray-600">
//                   <th className="text-left p-2 text-gray-300">Website</th>
//                   <th className="text-left p-2 text-gray-300">Status</th>
//                   <th className="text-left p-2 text-gray-300">Label</th>
//                   <th className="text-left p-2 text-gray-300">Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {history.map((h, i) => (
//                   <tr
//                     key={i}
//                     className="border-b border-gray-700 hover:bg-gray-700 transition"
//                   >
//                     <td className="p-2 break-words">
//                       <a
//                         href={h.url}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="text-blue-400 hover:underline"
//                       >
//                         {h.domain}
//                       </a>
//                     </td>
//                     <td
//                       className={`p-2 font-semibold ${getStatusColor(h.status)}`}
//                     >
//                       {h.status}
//                     </td>
//                     <td className="p-2 text-sm text-gray-300">{h.label}</td>
//                     <td className="p-2">{h.date}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Analytics */}
//       <div className="max-w-6xl mx-auto mt-8 bg-gray-800 rounded-2xl shadow-2xl p-6 text-gray-300">
//         <h3 className="font-semibold text-white mb-2">Analytics Overview</h3>
//         {history.length === 0 ? (
//           <p>No scan history available.</p>
//         ) : (
//           <div className="flex flex-col gap-2">
//             <p>Total Scans: {history.length}</p>
//             <p>✅ Safe: {history.filter((h) => h.status === "Safe").length}</p>
//             <p>⚠ Suspicious: {history.filter((h) => h.status === "Suspicious").length}</p>
//             <p>❌ Dangerous: {history.filter((h) => h.status === "Dangerous").length}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";

export default function Options() {
  const [realtime, setRealtime] = useState(true);
  const [warnings, setWarnings] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // --- Load and Listen for Updates ---
  useEffect(() => {
    function loadHistory() {
      chrome.storage.local.get(["scanHistory"], (result) => {
        if (result.scanHistory) {
          const stored = Array.isArray(result.scanHistory)
            ? result.scanHistory
            : [];
          setHistory(stored);
          if (stored.length > 0) {
            setLastUpdated(stored[0].date || new Date().toLocaleTimeString());
          }
        }
        setLoading(false);
      });
    }

    loadHistory();

    const listener = (changes, area) => {
      if (area === "local" && changes.scanHistory) {
        const updated = Array.isArray(changes.scanHistory.newValue)
          ? changes.scanHistory.newValue
          : [];
        setHistory(updated);
        if (updated.length > 0) {
          setLastUpdated(updated[0].date || new Date().toLocaleTimeString());
        } else {
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // --- Export to JSON ---
  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SafeNet_scan_history.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Status Color ---
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "safe":
        return "text-green-400";
      case "suspicious":
        return "text-yellow-400";
      case "dangerous":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getScanTypeColor = (type) => {
    return type?.includes("Screen") ? "text-purple-400" : "text-pink-400";
  };

  const recentEntries = history.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      {/* === Header === */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🧠 SafeNet AI Dashboard
        </h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
          onClick={exportHistory}
        >
          📥 Export History
        </button>
      </div>

      {/* === Full-width Recent Scans === */}
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Recent Scans (Last 10)</h2>
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated at {lastUpdated}
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400">Loading recent scans...</p>
        ) : recentEntries.length === 0 ? (
          <p className="text-gray-400">No scan history available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-2 text-gray-300 w-[20%]">Website</th>
                  <th className="text-left p-2 text-gray-300 w-[12%]">Type</th>
                  <th className="text-left p-2 text-gray-300 w-[10%]">Status</th>
                  <th className="text-left p-2 text-gray-300 w-[40%]">Reason</th>
                  <th className="text-left p-2 text-gray-300 w-[18%]">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((h, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-700 hover:bg-gray-700 transition"
                  >
                    <td className="p-2 break-words">
                      <a
                        href={h.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {h.domain || h.url || "Unknown"}
                      </a>
                    </td>
                    <td
                      className={`p-2 font-semibold ${getScanTypeColor(
                        h.scanType
                      )}`}
                    >
                      {h.scanType || "Unknown"}
                    </td>
                    <td
                      className={`p-2 font-semibold capitalize ${getStatusColor(
                        h.status
                      )}`}
                    >
                      {h.status || "Unknown"}
                    </td>
                    <td
                      className="p-2 text-xs text-gray-300 max-w-[400px] truncate"
                      title={h.reason || "—"}
                    >
                      {h.reason || "—"}
                    </td>
                    <td className="p-2 text-gray-400">{h.date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* === Analytics Overview === */}
      <div className="max-w-6xl mx-auto mt-8 bg-gray-800 rounded-2xl shadow-2xl p-6 text-gray-300">
        <h3 className="font-semibold text-white mb-2">Analytics Overview</h3>
        {history.length === 0 ? (
          <p>No scan history available.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p>Total Scans: {history.length}</p>
            <p>✅ Safe: {history.filter((h) => h.status === "safe").length}</p>
            <p>
              ⚠ Suspicious:{" "}
              {history.filter((h) => h.status === "suspicious").length}
            </p>
            <p>
              ❌ Dangerous:{" "}
              {history.filter((h) => h.status === "dangerous").length}
            </p>
            <p>
              🖥 Screen Scans:{" "}
              {history.filter((h) => h.scanType?.includes("Screen")).length}
            </p>
            <p>
              🌐 URL Scans:{" "}
              {history.filter((h) => h.scanType === "URL Scan").length}
            </p>
          </div>
        )}
      </div>

      {/* === Settings (Moved below, compact) === */}
      <div className="max-w-6xl mx-auto mt-8 bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-3">
        <h2 className="text-lg font-semibold mb-3">Settings</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
            <span>Real-time protection</span>
            <input
              type="checkbox"
              checked={realtime}
              onChange={() => setRealtime(!realtime)}
              className="w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
            <span>Show warnings</span>
            <input
              type="checkbox"
              checked={warnings}
              onChange={() => setWarnings(!warnings)}
              className="w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
            <span>Send usage data</span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={() => setAnalytics(!analytics)}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-xs mt-6">
        SafeNet AI © 2025 | Secure Web Companion
      </div>
    </div>
  );
}