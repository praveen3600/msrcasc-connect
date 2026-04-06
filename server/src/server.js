const http = require('http');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const { initializeSocket } = require('./sockets/chatHandler');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Connect to DB and start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 MSRCASC Connect API running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
