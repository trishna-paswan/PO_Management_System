# Purchase Order Management System 🎮 📦

A fully-featured, deeply gamified full-stack application built to track procurement logic, execute real-time web-socket updates, and natively ingest Google Gemini AI completions into a NoSQL log.

## Features
- **Gamified Emoji UI**: Bouncing neon buttons, massive CSS aurora gradients, and natively structured OS emojis driving the sidebar.
- **RESTful API Engine**: Built heavily on Python FastAPI.
- **Real-Time WebSockets**: A detached Node.js microservice (`notification_service`) broadcasts socket events back to the client whenever PO status changes locally, allowing Live Dashboard Sync without user reloading.
- **Hybrid Data Design**:
  1. **SQLite (Relational)**: Core procurement data cleanly decoupled into normalized tables `Vendor`, `Product`, `PurchaseOrder`, and `POItem`.
  2. **MongoDB (NoSQL)**: High-speed logging pipe. Every time Gemini writes a marketing description, the raw JSON payload is thrown into MongoDB without rigid schema constraints.

---

## The Database Logic
We use a **Hybrid Relational-NoSQL Strategy**.

### 1. SQLite Relational Core `po_db.sqlite`
Because Procurement requires ironclad constraints (calculating cart totals, inventory validation, vendor linking), this must be normalized.
*   **`vendors` Table**: Stores Partner profiles. Has a `One-to-Many` relationship with `purchase_orders` (One Vendor can be assigned to multiple POs).
*   **`products` Table**: Stores the physical raw catalog (Unit Prices, SKUs).
*   **`purchase_orders` Table**: Core logistic object holding calculations (Total Amount, Tax) and tracking operational `State` (Pending -> Approved -> Completed). Holds a **Foreign Key** to `vendors.id`.
*   **`po_items` Table**: A junction table that resolves the `Many-to-Many` relationship between `purchase_orders` and `products`. It anchors to `po_id` and `product_id` and securely logs the historical `price_at_purchase` locally so future product price fluctuations don't alter finalized cart receipts!

### 2. MongoDB Unstructured Layer `po_management.ai_logs`
Because AI outputs (`product_name`, `description`, `tokens_used`) are largely unstructured analytics and never affect standard logistical tracking, forcefully putting them into our strict SQLite DB is anti-pattern. Instead, they are quickly dumped natively as raw JSON BSON blobs directly into the `ai_logs` namespace collection in MongoDB.

---

## How to Run it Locally

This is a microservice architecture. You need **three separate terminals** running at the same time to power the interface.

**Terminal 1: FastAPI Python Backend**
```bash
cd backend_python
source .venv/bin/activate  # If you use a virtual environment
python main.py
```
*(This will boot the API on `http://localhost:8080`)*

**Terminal 2: Node WebSocket Microservice**
```bash
cd notification_service
npm i
node server.js
```
*(This boots the websocket relayer on `http://localhost:3000`)*

**Terminal 3: UI Static Client**
```bash
cd frontend
python3 -m http.server 8000
```
*(This serves the HTML/JS dashboard on `http://localhost:8000`)*

> **Note on MongoDB**: Head to `http://localhost:8000/login.html` to start! If you don't actually have a MongoDB service running on your local Mac port 27017, the Python backend will silently catch the AI timeout natively and skip the logging! No errors will occur!
