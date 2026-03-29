const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // allow frontend access
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`[Socket] Browser connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`[Socket] Browser disconnected: ${socket.id}`);
    });
});

// Incoming webhook from the Python Backend
app.post('/webhook/notify', (req, res) => {
    const { po_id, status } = req.body;
    
    if (!po_id || !status) {
        return res.status(400).json({ error: "Missing po_id or status" });
    }
    
    console.log(`[Webhook] Received update: PO #${po_id} -> ${status}`);
    
    // Broadcast out to all connected Browser clients
    io.emit('po-status-update', {
        po_id: po_id,
        status: status,
        timestamp: new Date()
    });
    
    res.status(200).json({ success: true, message: "Broadcast generated" });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Real-Time Notification Wrapper listening on http://localhost:${PORT}`);
});
