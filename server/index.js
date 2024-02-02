// server/index.js

const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const workerRoutes = require('./routes/workerRoutes');
const providerRoutes = require('./routes/providerRoutes');
const jobRoutes = require('./routes/jobRoutes');
const logoRoutes = require('./routes/logoRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/FYP");

const PORT = 3001;

app.use('/workers', workerRoutes);
app.use('/providers', providerRoutes);
app.use('/jobs', jobRoutes);
app.use('/admin', adminRoutes);
app.use('/logo', logoRoutes);

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Example: Send a welcome message to the client
  socket.emit("message", "Welcome to the WebSocket!");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
