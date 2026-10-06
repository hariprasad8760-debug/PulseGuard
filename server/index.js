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
const MAX_ROOM_PARTICIPANTS = 5;

// In-memory room store: roomCode -> RoomData
// RoomData: {
//   code: string,
//   hostId: string,
//   participants: Map<string, { socketId: string, name: string, isHost: boolean }>,
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
  res.json({ status: 'ok', activeRooms: rooms.size, maxParticipants: MAX_ROOM_PARTICIPANTS, timestamp: Date.now() });
});

app.get('/api/room/:code', (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ exists: false, message: 'Invalid room code. Please check and try again.' });
  }
  const participantCount = room.participants.size;
  if (participantCount >= MAX_ROOM_PARTICIPANTS) {
    return res.status(400).json({ 
      exists: true, 
      full: true, 
      message: `This room is already full (maximum ${MAX_ROOM_PARTICIPANTS} participants).`,
      count: participantCount,
      max: MAX_ROOM_PARTICIPANTS
    });
  }
  return res.json({ 
    exists: true, 
    full: false, 
    count: participantCount, 
    max: MAX_ROOM_PARTICIPANTS 
  });
});

// Socket.IO signaling handlers
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Create room
  socket.on('create-room', ({ userName, maxParticipants }, callback) => {
    try {
      const roomCode = generateRoomCode();
      const cleanName = (userName || 'Host').trim();
      const maxLimit = Math.min(5, Math.max(1, parseInt(maxParticipants, 10) || 5));

      const newRoom = {
        code: roomCode,
        hostId: socket.id,
        participants: new Map(),
        maxParticipants: maxLimit,
        createdAt: Date.now()
      };

      const hostUser = {
        socketId: socket.id,
        name: cleanName,
        isHost: true
      };

      newRoom.participants.set(socket.id, hostUser);
      rooms.set(roomCode, newRoom);

      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.userName = cleanName;
      socket.data.isHost = true;

      console.log(`[Room Created] Code: ${roomCode} by Host: ${cleanName} (${socket.id}). Selected Capacity: ${maxLimit}`);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode,
          userName: cleanName,
          isHost: true,
          existingPeers: [],
          maxParticipants: maxLimit
        });
      }
    } catch (err) {
      console.error('[Create Room Error]', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: 'server_error', message: 'Failed to create room.' });
      }
    }
  });

  // Join room (up to configured max participants)
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

      // Check if room is already full
      const maxLimit = room.maxParticipants || MAX_ROOM_PARTICIPANTS;
      const currentCount = room.participants.size;
      const isAlreadyInRoom = room.participants.has(socket.id);

      if (!isAlreadyInRoom && currentCount >= maxLimit) {
        if (typeof callback === 'function') {
          return callback({
            success: false,
            error: 'room_full',
            message: `This room is already full (maximum ${maxLimit} participants).`
          });
        }
        return;
      }

      // If user is already registered in this room
      if (isAlreadyInRoom) {
        const existingPeers = Array.from(room.participants.values())
          .filter(p => p.socketId !== socket.id)
          .map(p => ({ peerId: p.socketId, peerName: p.name, isHost: p.isHost }));

        return callback({
          success: true,
          roomCode: formattedCode,
          userName: cleanName,
          isHost: room.participants.get(socket.id).isHost,
          existingPeers,
          maxParticipants: maxLimit
        });
      }

      // Collect existing peers before adding this participant
      const existingPeers = Array.from(room.participants.values())
        .map(p => ({ peerId: p.socketId, peerName: p.name, isHost: p.isHost }));

      // Register new participant
      const newParticipant = {
        socketId: socket.id,
        name: cleanName,
        isHost: false
      };

      room.participants.set(socket.id, newParticipant);
      socket.join(formattedCode);
      socket.data.roomCode = formattedCode;
      socket.data.userName = cleanName;
      socket.data.isHost = false;

      console.log(`[Participant Joined] Code: ${formattedCode} - ${cleanName} (${socket.id}). Total: ${room.participants.size}/${maxLimit}`);

      // Notify all existing peers in the room that a new participant has joined
      socket.to(formattedCode).emit('user-joined', {
        peerId: socket.id,
        peerName: cleanName,
        isHost: false,
        totalParticipants: room.participants.size
      });

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode: formattedCode,
          userName: cleanName,
          isHost: false,
          existingPeers,
          maxParticipants: maxLimit
        });
      }
    } catch (err) {
      console.error('[Join Room Error]', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: 'server_error', message: 'Failed to join room.' });
      }
    }
  });

  // WebRTC Signaling: Offer (supports targeted peer in mesh or broadcast)
  socket.on('offer', ({ roomCode, targetId, offer }) => {
    if (targetId) {
      io.to(targetId).emit('offer', {
        offer,
        senderId: socket.id,
        senderName: socket.data.userName
      });
    } else if (roomCode) {
      socket.to(roomCode).emit('offer', {
        offer,
        senderId: socket.id,
        senderName: socket.data.userName
      });
    }
  });

  // WebRTC Signaling: Answer
  socket.on('answer', ({ roomCode, targetId, answer }) => {
    if (targetId) {
      io.to(targetId).emit('answer', {
        answer,
        senderId: socket.id,
        senderName: socket.data.userName
      });
    } else if (roomCode) {
      socket.to(roomCode).emit('answer', {
        answer,
        senderId: socket.id,
        senderName: socket.data.userName
      });
    }
  });

  // WebRTC Signaling: ICE Candidate
  socket.on('ice-candidate', ({ roomCode, targetId, candidate }) => {
    if (targetId) {
      io.to(targetId).emit('ice-candidate', {
        candidate,
        senderId: socket.id
      });
    } else if (roomCode) {
      socket.to(roomCode).emit('ice-candidate', {
        candidate,
        senderId: socket.id
      });
    }
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
  const userName = socket.data.userName || 'User';

  console.log(`[User Left] ${userName} (${socket.id}) from room ${roomCode}`);

  // Remove participant from room
  room.participants.delete(socket.id);

  // Notify all remaining participants in the room
  socket.to(roomCode).emit('user-left', {
    message: 'Participant Disconnected',
    disconnectedId: socket.id,
    userName,
    totalParticipants: room.participants.size
  });

  // If room is empty, clean it up
  if (room.participants.size === 0) {
    rooms.delete(roomCode);
    console.log(`[Room Closed] All participants left room: ${roomCode}`);
  } else {
    console.log(`[Room Updated] Room ${roomCode} remaining participants: ${room.participants.size}/${MAX_ROOM_PARTICIPANTS}`);
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
  console.log(`Max Room Participants: ${MAX_ROOM_PARTICIPANTS}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});
