const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  path: '/api/socket.io',
  cors: {
    origin: '*', // Adjust for production safety
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve profile photo uploads statically
app.use('/uploads', express.static(uploadsDir));

// Pass io to request object if needed inside routes (Optional but good practice)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount routes (with /api for local dev)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profiles', require('./routes/profileRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/gallery-requests', require('./routes/galleryRequestRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/kyc', require('./routes/kycRoutes'));

// Mount routes (without /api for cPanel Passenger which strips the sub-URI)
app.use('/auth', require('./routes/authRoutes'));
app.use('/profiles', require('./routes/profileRoutes'));
app.use('/requests', require('./routes/requestRoutes'));
app.use('/gallery-requests', require('./routes/galleryRequestRoutes'));
app.use('/messages', require('./routes/messageRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/reports', require('./routes/reportRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/kyc', require('./routes/kycRoutes'));

// Public Platform Settings (Pricing)
app.get('/api/settings', require('./controllers/adminController').getSettings);
app.get('/settings', require('./controllers/adminController').getSettings);

// Public Success Stories route
const SuccessStory = require('./models/SuccessStory');
const successStoriesHandler = async (req, res) => {
  try {
    const stories = await SuccessStory.find({ isPublished: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: stories.length, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
app.get('/api/success-stories', successStoriesHandler);
app.get('/success-stories', successStoriesHandler);

// Basic health check route
const healthCheckHandler = (req, res) => {
  res.status(200).json({ success: true, message: 'Muslim Matrimony API is healthy and running!' });
};
app.get('/api/health', healthCheckHandler);
app.get('/health', healthCheckHandler);

// Socket.io Real-Time Connection Handling
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);

  // User joins their personal room using their user ID to receive direct messages
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room.`);
  });

  // Client sends a new message payload
  socket.on('send_message', (data) => {
    // data contains { receiverId, messageObj }
    // We emit to the receiver's room instantly
    io.to(data.receiverId).emit('receive_message', data.messageObj);
    // Emit to sender's other active tabs (room is the sender's user ID)
    if (data.messageObj && data.messageObj.sender) {
      socket.to(data.messageObj.sender).emit('receive_message', data.messageObj);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
