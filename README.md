# PO Nexus | Purchase Order Management System

A professional, enterprise-grade full-stack application designed for streamlined procurement management. Featuring a modern Tailwind CSS interface, real-time WebSocket updates, and native Google Gemini AI integration for automated product cataloging.

## Features
- **Professional Enterprise UI**: A clean, high-performance interface built with **Tailwind CSS**, **Inter** typography, and **Lucide Icons**. Optimized for clarity and efficiency.
- **RESTful API Engine**: A robust backend architecture powered by **Python FastAPI** for high-speed data processing and type-safe endpoints.
- **Real-Time WebSockets**: A dedicated Node.js microservice (`notification_service`) provides instant dashboard synchronization, broadcasting status changes to all connected clients without page reloads.
- **Hybrid Data Architecture**:
  1. **SQLite (Relational Core)**: Normalized relational schema for procurement logic, including `Vendor`, `Product`, `PurchaseOrder`, and `POItem` with strict referential integrity.
  2. **MongoDB (NoSQL Layer)**: High-speed unstructured logging for AI-generated content. Raw JSON payloads from Gemini AI completions are stored without rigid schema constraints for analytics.

---

## Technical Architecture

### 1. Relational Logic (SQLite)
The core procurement flow requires high data integrity for financial calculations and inventory tracking:
*   **Vendors**: Profiles for supply partners with a `One-to-Many` relationship to orders.
*   **Products**: Master catalog holding SKUs and unit prices.
*   **Purchase Orders**: Tracks operational states (Pending -> Approved -> Completed) and financial totals.
*   **PO Items**: Junction table resolving the `Many-to-Many` relationship between orders and products, capturing the `price_at_purchase` to preserve historical financial accuracy.

### 2. AI Intelligence (MongoDB & Gemini)
When adding new products, the system utilizes **Google Gemini AI** to generate professional marketing copy. These logs—including token usage and raw descriptions—are piped into MongoDB to keep the relational core focused strictly on logistics.

---

## Local Setup

This microservice architecture requires three concurrent processes:

### Terminal 1: Python Backend (FastAPI)
```bash
cd backend_python
# Recommended: Create and activate a virtual environment
python main.py
```
*API runs on: `http://localhost:8080`*

### Terminal 2: Notification Service (Node.js)
```bash
cd notification_service
npm install
node server.js
```
*WebSocket relayer runs on: `http://localhost:3000`*

### Terminal 3: Frontend Client
```bash
cd frontend
# You can use any static server, e.g., Python's built-in module
python3 -m http.server 8000
```
*Dashboard accessible at: `http://localhost:8000/index.html`*

---

## Usage Note
- **Required Fields**: All essential form inputs in the Product Catalog and Purchase Order creation screens are marked with a red asterisk (`*`).
- **Direct Access**: Authentication has been disabled for this version; you can navigate directly to the Dashboard and start managing orders immediately.
- **MongoDB**: If a MongoDB instance is not detected on port 27017, the system will gracefully bypass AI logging without interrupting core procurement functionality.
