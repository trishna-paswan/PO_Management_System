# 📦 PO Nexus | Purchase Order Management System

A professional, enterprise-grade full-stack application designed for streamlined procurement management. Featuring a modern **Tailwind CSS** interface, real-time **WebSocket** updates, and native **Google Gemini AI** integration for automated product cataloging.

---

## ✨ Key Features

*   **Professional Enterprise UI**: A clean, high-performance interface built with **Tailwind CSS**, **Inter** typography, and **Lucide Icons**. Optimized for clarity and efficiency.
*   **RESTful API Engine**: A robust backend architecture powered by **Python FastAPI** for high-speed data processing and type-safe endpoints.
*   **Real-Time WebSockets**: A dedicated Node.js microservice (`notification_service`) provides instant dashboard synchronization, broadcasting status changes to all connected clients without page reloads.
*   **Hybrid Data Architecture**: 
    1.  **Relational (SQLite)** for ironclad financial and logistical integrity.
    2.  **NoSQL (MongoDB)** for high-speed, unstructured AI generation logging.

---

## 🏗️ Technical Architecture

We utilize a **Hybrid Relational-NoSQL Strategy** to balance data integrity with AI-driven flexibility.

### 1. Relational Core (SQLite)
Because procurement requires strict constraints (calculating totals, inventory validation, vendor linking), our core logic is fully normalized:
*   **`vendors` Table**: Stores partner profiles; has a `One-to-Many` relationship with purchase orders.
*   **`products` Table**: Master catalog holding SKUs, unit prices, and stock levels.
*   **`purchase_orders` Table**: Core logistic object tracking calculations (Total, Tax) and operational states (`Pending` → `Approved` → `Completed`).
*   **`po_items` Table**: A junction table resolving the `Many-to-Many` relationship between orders and products. It securely logs the `price_at_purchase` to preserve historical financial accuracy.

### 2. Unstructured Layer (MongoDB + Gemini AI)
When adding products, the system uses **Google Gemini AI** to generate marketing copy. These outputs are largely unstructured and are piped into MongoDB:
*   **`ai_logs` Collection**: Raw JSON payloads containing descriptions, token usage, and timestamps are dumped natively to keep the relational core focused strictly on logistics.

---

## 🚀 Local Setup

This microservice architecture requires three concurrent processes to be running:

### 🐍 Terminal 1: Python Backend (FastAPI)
```bash
cd backend_python
# Recommended: Create and activate a virtual environment
python main.py
```
> *API is served at:* `http://localhost:8080`

### ⚡ Terminal 2: Notification Service (Node.js)
```bash
cd notification_service
npm install
node server.js
```
> *WebSocket relayer runs on:* `http://localhost:3000`

### 🌐 Terminal 3: Frontend Client
```bash
cd frontend
# Serve using any static server
python3 -m http.server 8000
```
> *Dashboard accessible at:* `http://localhost:8000/index.html`

---

## 📝 Usage Notes

*   **Required Fields**: All essential form inputs (Product Name, SKU, Price, Vendor) are marked with a red asterisk (`*`).
*   **Direct Access**: Authentication has been disabled; you can navigate directly to the Dashboard to begin managing orders immediately.
*   **MongoDB Fail-Safe**: If a MongoDB instance is not detected on port 27017, the system will gracefully bypass AI logging without interrupting core procurement functionality.
