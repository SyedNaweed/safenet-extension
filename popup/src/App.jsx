// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
import { useState } from "react";

export default function App() {
  const [status, setStatus] = useState("Safe");

  return (
    <div className="p-4 bg-gray-900 text-white w-64">
      <h1 className="text-lg font-bold">SafeNet AI</h1>
      <p>Status:ßc <span className={status === "Safe" ? "text-green-400" : "text-red-400"}>{status}</span></p>
      <button 
        className="mt-3 px-3 py-1 bg-blue-500 rounded hover:bg-blue-600"
        onClick={() => setStatus(status === "Safe" ? "Phishing" : "Safe")}
      >
        Toggle Status
      </button>
    </div>
  );
}
