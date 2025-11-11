#!/usr/bin/env python3
"""
train.py — Simple PyTorch URL phishing detector
Uses a character-level BiLSTM classifier trained on:
    CSV with columns: url, status (0=legit, 1=phish)
"""

import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from torch.utils.data import Dataset, DataLoader
from tqdm import tqdm

# ==============================
# ✅ CONFIG
# ==============================
CSV_PATH = r"C:\Users\S Duraimurugan\Pictures\newfish\data\new_data_urls.csv"  # use raw string (r"...")
OUTPUT_DIR = r"C:\Users\S Duraimurugan\Pictures\newfish\models"
os.makedirs(OUTPUT_DIR, exist_ok=True)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {DEVICE}")

VOCAB_SIZE = 256
MAX_LEN = 120
EMBED_DIM = 64
HIDDEN_DIM = 128
BATCH_SIZE = 512
EPOCHS = 3
LR = 1e-3

# ==============================
# ✅ ENCODING
# ==============================
def char_to_idx(c):
    return (ord(c) % (VOCAB_SIZE - 1)) + 1  # ensure 1..255

def encode_url(url, max_len=MAX_LEN):
    url = str(url)[:max_len]
    encoded = [char_to_idx(c) for c in url]
    if len(encoded) < max_len:
        encoded += [0] * (max_len - len(encoded))
    return encoded

# ==============================
# ✅ DATASET
# ==============================
class URLDataset(Dataset):
    def __init__(self, df):
        self.urls = df["url"].astype(str).tolist()
        self.labels = df["status"].astype(int).tolist()

    def __len__(self):
        return len(self.urls)

    def __getitem__(self, idx):
        x = torch.tensor(encode_url(self.urls[idx]), dtype=torch.long)
        y = torch.tensor(self.labels[idx], dtype=torch.long)
        return x, y

# ==============================
# ✅ MODEL
# ==============================
class URLPhishModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.embedding = nn.Embedding(VOCAB_SIZE, EMBED_DIM, padding_idx=0)
        self.lstm = nn.LSTM(EMBED_DIM, HIDDEN_DIM, batch_first=True, bidirectional=True)
        self.fc = nn.Linear(HIDDEN_DIM * 2, 2)
        self.dropout = nn.Dropout(0.2)

    def forward(self, x):
        x = self.embedding(x)
        out, (h_n, _) = self.lstm(x)
        h = torch.cat((h_n[-2], h_n[-1]), dim=1)
        h = self.dropout(h)
        return self.fc(h)

# ==============================
# ✅ LOAD DATA
# ==============================
print("Loading data from:", CSV_PATH)
df = pd.read_csv(CSV_PATH)

if not {"url", "status"}.issubset(df.columns):
    raise ValueError("CSV must contain columns: url, status")

train_df, val_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df["status"])
train_ds = URLDataset(train_df)
val_ds = URLDataset(val_df)

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE)

# ==============================
# ✅ TRAIN
# ==============================
model = URLPhishModel().to(DEVICE)
optimizer = optim.Adam(model.parameters(), lr=LR)
criterion = nn.CrossEntropyLoss()

def evaluate(loader):
    model.eval()
    total_loss, y_true, y_pred = 0, [], []
    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(DEVICE), y.to(DEVICE)
            out = model(x)
            loss = criterion(out, y)
            total_loss += loss.item() * len(x)
            preds = out.argmax(1).cpu().tolist()
            y_pred.extend(preds)
            y_true.extend(y.cpu().tolist())
    acc = accuracy_score(y_true, y_pred)
    return total_loss / len(loader.dataset), acc, y_true, y_pred

print("\nStarting training...\n")
best_val_acc = 0

for epoch in range(1, EPOCHS + 1):
    model.train()
    total_loss = 0
    pbar = tqdm(train_loader, desc=f"Epoch {epoch}/{EPOCHS}")
    for x, y in pbar:
        x, y = x.to(DEVICE), y.to(DEVICE)
        optimizer.zero_grad()
        out = model(x)
        loss = criterion(out, y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * len(x)
        pbar.set_postfix(loss=f"{loss.item():.4f}")

    val_loss, val_acc, y_true, y_pred = evaluate(val_loader)
    print(f"Epoch {epoch} done | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}")
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), os.path.join(OUTPUT_DIR, "best_model.pth"))
        print(f"✅ Saved new best model (Acc={val_acc:.4f})")

# ==============================
# ✅ REPORT
# ==============================
val_loss, val_acc, y_true, y_pred = evaluate(val_loader)
print("\nFinal Evaluation:")
print(f"Loss: {val_loss:.4f}, Accuracy: {val_acc:.4f}")
print(classification_report(y_true, y_pred, digits=4))

torch.save(model.state_dict(), os.path.join(OUTPUT_DIR, "final_model.pth"))
print(f"\n✅ Model saved to: {OUTPUT_DIR}\\final_model.pth")
