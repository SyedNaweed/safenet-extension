# 🚨 SafeNet AI  
### **Multi-Platform Phishing Detection System with Integrated Browser Extension**

SafeNet AI is an intelligent phishing detection platform designed to safeguard users from malicious websites, URLs, and online scams in real time. It combines a powerful backend built with Python, heuristic detection, SentenceTransformer embeddings, Qdrant vector search, and a modern browser extension powered by React to deliver accurate and dynamic phishing classification.

---

## 🧠 Key Highlights

- ✅ Real-time phishing detection directly in your browser  
- ✅ LLM-based (SentenceTransformer) semantic understanding of URLs/content  
- ✅ Qdrant vector similarity search to identify known phishing patterns  
- ✅ Dynamic heuristic analysis of URL structure & domain patterns  
- ✅ Clean React-powered popup UI for fast, accessible feedback  
- ✅ Visual alert system with confidence scores  
- ✅ Background monitoring that runs silently  
- ✅ Lightweight extension integrated with backend API  

---

## 🏛️ System Architecture

```
                ┌──────────────────────────────────────┐
                │              Browser                  │
                │     Chrome/Edge Extension             │
                └───────────────┬──────────────────────┘
                                │
                                ▼
                ┌──────────────────────────────────────┐
                │         Popup React UI (Vite)         │
                └───────────────┬──────────────────────┘
                                │ JSON API Request
                                ▼
                ┌──────────────────────────────────────┐
                │        FastAPI Backend (Python)       │
                ├──────────────────────────────────────┤
                │ Heuristic URL Pattern Analysis        │
                │ SentenceTransformer embeddings        │
                │ Qdrant Vector Similarity Search       │
                │ ML/Tensor models (optional fallback)  │
                └─────────────────┬────────────────────┘
                                  │
                                  ▼
                ┌──────────────────────────────────────┐
                │           Qdrant Vector DB            │
                └──────────────────────────────────────┘
```

---

## 🚀 Features Overview

### ✅ Browser Extension (Frontend)
- **Real-time detection** whenever user opens a page  
- **Red / Yellow / Green status indicators**  
- **Confidence score** displayed  
- **Suspicious token analysis**  
- **Background script** for continuous URL monitoring  
- **React UI with Vite** for smooth performance  
- **Minimalistic popup design**  

---

### ✅ Backend (FastAPI)
- Python-based backend  
- Hybrid detection approach:
  - ✅ Heuristics  
  - ✅ LLM-based semantic similarity  
  - ✅ Qdrant vector retrieval  
  - ✅ Optional ML model fallback  
- Embedding generation using **SentenceTransformers**  
- REST API endpoint `/analyze` that returns:
  ```json
  {
    "label": "phishing",
    "confidence": 0.92,
    "reason": "Suspicious domain + high vector similarity",
    "tokens": ["login", "secure", "verify", ...]
  }
  ```

---

## 📦 Tech Stack

### ✅ Frontend (Extension)
- React.js
- Vite
- Tailwind CSS (popup UI)
- Manifest v3
- JavaScript background/content scripts

### ✅ Backend
- Python FastAPI
- SentenceTransformers
- Qdrant (vector similarity search)
- NumPy, Pandas
- Uvicorn server

---

## 📁 Project Structure

```
safenet-extension/
│
├── backend/
│   ├── final.py                # Main FastAPI server
│   ├── check.py                # Heuristic analysis
│   ├── gen.py                  # Embedding generation
│   ├── quadup.py               # Qdrant utilities
│   ├── top_brands.txt          # Reference brand list
│   ├── requirements.txt
│   └── ...other backend scripts...
│
├── popup/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── assets/
│
├── options/
│   └── ... (Extension options page if enabled)
│
├── manifest.json
├── content.js
├── background.js
└── icons/
```

---

## 🛠️ Installation & Setup

### 🔹 Backend Setup (FastAPI)

```
cd backend
pip install -r requirements.txt
python final.py
```

Backend will start at:

```
http://localhost:8000/analyze
```

---

### 🔹 Frontend (Browser Extension)

1. Install dependencies:
```
cd popup
npm install
npm run build
```

2. Open Chrome → Extensions → Enable Developer Mode  
3. Load Unpacked  
4. Select `safenet-extension/dist` folder  

---

## 🎯 Usage Flow

1. User opens a webpage  
2. Background script detects a URL change  
3. Sends URL + page data to backend  
4. Backend:
   - Analyzes heuristics  
   - Embeds URL via SentenceTransformer  
   - Retrieves vector neighbors from Qdrant  
   - Decides label and confidence  
5. Popup UI displays result instantly  

---

## 📊 Example API Response

```
{
  "status": "phishing",
  "confidence": 0.89,
  "reason": "High similarity to known phishing attempts",
  "suspicious_tokens": ["verify", "secure", "account", "login"]
}
```

---

![Screenshot of SafeNet AI](https://github.com/user-attachments/assets/84eabadd-9750-4085-99b8-5c6fd3a83b41)
<img width="1035" height="921" alt="image" src="https://github.com/user-attachments/assets/48f00c82-224d-4ef0-a838-f0afaca39f72" />
<img width="518" height="650" alt="image" src="https://github.com/user-attachments/assets/1a621477-ab1a-481d-a218-6209a02a840e" />
<img width="1047" height="424" alt="image" src="https://github.com/user-attachments/assets/18216c13-43e0-4301-8c4b-c36b65f306e8" />
<img width="972" height="978" alt="image" src="https://github.com/user-attachments/assets/21ce300a-8f15-4e73-b9f9-bd30a770aeb0" />
<img width="574" height="852" alt="image" src="https://github.com/user-attachments/assets/7496aeb0-8cfe-4517-bca6-76314fb132da" />
<img width="422" height="256" alt="image" src="https://github.com/user-attachments/assets/dda3e232-4b6e-447b-9e64-678710ba3708" />








---

## 🤝 Contributing

PRs and suggestions are welcome — open issues for improvements.

---

## 📝 License

MIT License © 2025 SafeNet AI

---
