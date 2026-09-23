const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend build if available
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// In-memory room store: roomCode -> RoomData
// RoomData: {
//   code: string,
//   host: { socketId: string, name: string },
//   participant: { socketId: string, name: string } | null,
//   createdAt: number
// }
const rooms = new Map();

// Helper to generate unique room code (e.g. PG-7K4X92)
function generateRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars like 0, O, 1, I
  let code = '';
  do {
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code = `PG-${randomPart}`;
  } while (rooms.has(code));
  return code;
}

// REST endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size, timestamp: Date.now() });
});

app.get('/api/room/:code', (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ exists: false, message: 'Invalid room code. Please check and try again.' });
  }
  if (room.host && room.participant) {
    return res.status(400).json({ exists: true, full: true, message: 'This room is already full.' });
  }
  return res.json({ exists: true, full: false, hostName: room.host.name });
});

// Socket.IO signaling handlers
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Create room
  socket.on('create-room', ({ userName }, callback) => {
    try {
      const roomCode = generateRoomCode();
      const cleanName = (userName || 'Host').trim();

      const newRoom = {
        code: roomCode,
        host: {
          socketId: socket.id,
          name: cleanName
        },
        participant: null,
        createdAt: Date.now()
      };

      rooms.set(roomCode, newRoom);
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.userName = cleanName;
      socket.data.isHost = true;

      console.log(`[Room Created] Code: ${roomCode} by Host: ${cleanName} (${socket.id})`);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode,
          userName: cleanName,
          isHost: true
        });
      }
    } catch (err) {
      console.error('[Create Room Error]', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: 'server_error', message: 'Failed to create room.' });
      }
    }
  });

  // Join room
  socket.on('join-room', ({ roomCode, userName }, callback) => {
    try {
      const formattedCode = (roomCode || '').toUpperCase().trim();
      const cleanName = (userName || 'Participant').trim();
      const room = rooms.get(formattedCode);

      if (!room) {
        if (typeof callback === 'function') {
          return callback({
            success: false,
            error: 'invalid_code',
            message: 'Invalid room code. Please check and try again.'
          });
        }
        return;
      }

      // Check if room is already full (max 2 participants)
      if (room.host && room.participant && room.participant.socketId !== socket.id) {
        if (typeof callback === 'function') {
          return callback({
            success: false,
            error: 'room_full',
            message: 'This room is already full.'
          });
        }
        return;
      }

      // If host reconnected or joining as participant
      if (room.host.socketId === socket.id) {
        return callback({
          success: true,
          roomCode: formattedCode,
          userName: room.host.name,
          isHost: true,
          peer: room.participant ? { name: room.participant.name } : null
        });
      }

      // Register participant
      room.participant = {
        socketId: socket.id,
        name: cleanName
      };

      socket.join(formattedCode);
      socket.data.roomCode = formattedCode;
      socket.data.userName = cleanName;
      socket.data.isHost = false;

      console.log(`[Participant Joined] Code: ${formattedCode} - ${cleanName} (${socket.id})`);

      // Notify host that participant has joined
      socket.to(room.host.socketId).emit('user-joined', {
        peerId: socket.id,
        peerName: cleanName,
        isHost: false
      });

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode: formattedCode,
          userName: cleanName,
          isHost: false,
          peer: {
            peerId: room.host.socketId,
            peerName: room.host.name,
            isHost: true
          }
        });
      }
    } catch (err) {
      console.error('[Join Room Error]', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: 'server_error', message: 'Failed to join room.' });
      }
    }
  });

  // WebRTC Signaling: Offer
  socket.on('offer', ({ roomCode, offer }) => {
    console.log(`[Signaling Offer] from ${socket.id} in room ${roomCode}`);
    socket.to(roomCode).emit('offer', {
      offer,
      senderId: socket.id,
      senderName: socket.data.userName
    });
  });

  // WebRTC Signaling: Answer
  socket.on('answer', ({ roomCode, answer }) => {
    console.log(`[Signaling Answer] from ${socket.id} in room ${roomCode}`);
    socket.to(roomCode).emit('answer', {
      answer,
      senderId: socket.id,
      senderName: socket.data.userName
    });
  });

  // WebRTC Signaling: ICE Candidate
  socket.on('ice-candidate', ({ roomCode, candidate }) => {
    socket.to(roomCode).emit('ice-candidate', {
      candidate,
      senderId: socket.id
    });
  });

  // Explicit Leave Room
  socket.on('leave-room', () => {
    handleUserLeave(socket);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    handleUserLeave(socket);
  });
});

function handleUserLeave(socket) {
  const roomCode = socket.data.roomCode;
  if (!roomCode || !rooms.has(roomCode)) return;

  const room = rooms.get(roomCode);
  const isHost = socket.data.isHost;
  const userName = socket.data.userName || 'User';

  console.log(`[User Left] ${userName} (${socket.id}) from room ${roomCode}`);

  // Notify the other participant
  socket.to(roomCode).emit('user-left', {
    message: 'Participant Disconnected',
    disconnectedId: socket.id,
    userName
  });

  if (isHost) {
    // If host leaves, clean up room
    rooms.delete(roomCode);
    console.log(`[Room Closed] Host left room: ${roomCode}`);
  } else {
    // Participant left, host is still in room
    room.participant = null;
    console.log(`[Room Updated] Participant left room: ${roomCode}, awaiting new participant`);
  }

  socket.leave(roomCode);
  delete socket.data.roomCode;
}

// Fallback for SPA routing if dist exists
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('PulseGuard AI Server active. Frontend build not found.');
    }
  });
});

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`PulseGuard AI Signaling Server running`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});
