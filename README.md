🚀 PO Nexus | Purchase Order Management System

A modern, enterprise-grade full-stack application built to streamline procurement workflows with precision, scalability, and intelligent automation.

Designed with a microservices architecture, PO Nexus combines high-performance APIs, real-time updates, and AI-powered enhancements to deliver a seamless procurement experience.

✨ Key Features
🎯 Enterprise-Grade UI
Built with Tailwind CSS for a clean and responsive layout
Uses Inter typography and Lucide Icons for a modern look
Optimized for usability, clarity, and speed
⚙️ High-Performance Backend
Developed using FastAPI (Python)
Fully RESTful architecture with type-safe endpoints
Efficient request handling and structured data validation
🔄 Real-Time Updates
Powered by a Node.js WebSocket microservice
Instantly reflects:
PO status updates
New order creation
No page refresh required ⚡
🧠 AI-Powered Product Intelligence
Integrated with Google Gemini AI
Generates:
Professional product descriptions
Marketing-ready content
Enhances product catalog automatically
🗄️ Hybrid Data Architecture
🔷 Relational Core (SQLite)

Handles structured procurement data with strict integrity:

Vendors
Supplier profiles
One-to-Many relationship with orders
Products
SKU-based catalog
Pricing & stock tracking
Purchase Orders

Tracks lifecycle:

Pending → Approved → Completed
Stores financial totals
PO Items
Junction table (Many-to-Many)
Captures:
Quantity
Price at purchase (historical accuracy)
🔶 NoSQL Layer (MongoDB)

Handles unstructured AI data:

Stores raw Gemini AI responses
Logs:
Generated descriptions
Token usage
Enables future analytics & insights
🏗️ System Architecture
Frontend (HTML + Tailwind)
        ↓
FastAPI Backend (Python)
        ↓
SQLite (Core Data)
        ↓
MongoDB (AI Logs)

+ WebSocket Layer (Node.js) for real-time updates
⚙️ Local Setup

Run 3 services simultaneously:

🟢 Terminal 1: Backend (FastAPI)
cd backend_python
python main.py

📍 Runs on: http://localhost:8080

🔵 Terminal 2: Notification Service (Node.js)
cd notification_service
npm install
node server.js

📍 Runs on: http://localhost:3000

🟡 Terminal 3: Frontend
cd frontend
python3 -m http.server 8000

📍 Open: http://localhost:8000/index.html

🧾 Application Flow
Open Dashboard
Create New Purchase Order
Select Vendor & Add Products
System calculates:
Subtotal
5% Tax
Final Total
Submit PO → Status set to Pending

Update status via Dashboard:

Pending → Approved → Completed