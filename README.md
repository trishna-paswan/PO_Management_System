# 🚀 PO Nexus | Purchase Order Management System

A modern, enterprise-grade full-stack application built to streamline procurement workflows with precision, scalability, and intelligent automation.

Designed with a microservices architecture, **PO Nexus** combines high-performance APIs, real-time updates, and AI-powered enhancements to deliver a seamless procurement experience.

---

## ✨ Key Features

### 🎯 Enterprise-Grade UI
- Built with **Tailwind CSS** for a clean, responsive, and high-performance layout.
- Uses **Inter** typography and **Lucide Icons** for a professional aesthetic.
- Optimized for usability, clarity, and rapid procurement actions.

### ⚙️ High-Performance Backend
- Powered by **Python FastAPI** for asynchronous, type-safe API endpoints.
- Robust data validation and structured request handling.
- Seamlessly scales across multiple microservices.

### 🔄 Real-Time Updates
- Dedicated **Node.js WebSocket** microservice (`notification_service`).
- Instantly reflects PO status changes and new order creations across all dashboards.
- **No page refresh required** ⚡ — stay synced in real-time.

### 🧠 AI-Powered Product Intelligence
- Native integration with **Google Gemini AI**.
- Automatically generates professional marketing copy and catchy product descriptions.
- Enhances your product catalog with zero manual effort.

---

## 🗄️ Hybrid Data Architecture

### 🔷 Relational Core (PostgreSQL)
Handles structured procurement data with strict referential integrity:
*   **Vendors**: Supplier profiles with a `One-to-Many` relationship to orders.
*   **Products**: Master catalog with unique SKUs, pricing, and stock tracking.
*   **Purchase Orders**: Tracks the full lifecycle from `DRAFT` → `PLACED` → `COMPLETED`.
*   **PO Items**: Junction table capturing precise quantity and `price_at_purchase` for historical financial accuracy.

### 🔶 NoSQL Layer (MongoDB)
Handles unstructured AI logs and telemetry:
*   Stores raw **Gemini AI** responses and token usage.
*   Enables deep analytics on AI-generated content without bloating the relational core.

---

## 🏗️ System Architecture

```text
       Frontend (HTML + Tailwind)
                  ↓
       FastAPI Backend (Python)
          ↙               ↘
PostgreSQL (Core)      MongoDB (AI Logs)
          ↘               ↙
       WebSocket (Node.js) → [Real-Time Dashboard]
```

---

## ⚙️ Local Setup

Run these 3 services simultaneously to power the full ecosystem:

### 🟢 Terminal 1: Backend (FastAPI)
```bash
cd backend_python
# Install dependencies: pip install -r requirements.txt
python main.py
```
📍 **API runs on**: `http://localhost:8080`

### 🔵 Terminal 2: Notification Service (Node.js)
```bash
cd notification_service
npm install
node server.js
```
📍 **WebSocket runs on**: `http://localhost:3000`

### 🟡 Terminal 3: Frontend Client
```bash
cd frontend
# Start a simple static server
python3 -m http.server 8000
```
📍 **Open**: `http://localhost:8000/index.html`

---

## 🔐 Authentication (Google OAuth 2.0)

The system uses **Google Identity Services (GSI)** for secure, enterprise-ready authentication:
1.  **Frontend**: `login.html` renders a secure "Sign in with Google" button.
2.  **Verification**: The backend verifies the `id_token` against your `GOOGLE_CLIENT_ID`.
3.  **Session**: A local JWT is issued for authorized API access.

> **Note on MongoDB**: If a MongoDB instance is not detected on port 27017, the system will gracefully bypass AI logging, ensuring the core procurement flow remains uninterrupted.

---

## 🧾 Application Flow

1.  **Dashboard**: Overview of all active Purchase Orders.
2.  **Create PO**: Select a Vendor and add Products.
3.  **Auto-Calculation**: System calculates Subtotals, Tax (5%), and Final Totals in real-time.
4.  **Submit**: PO is created in `DRAFT` status.
5.  **Lifecycle**: Update status from **Pending → Approved → Completed** to trigger instant WebSocket broadcasts.
