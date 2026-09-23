# PulseGuard AI — Phase 1: Real-Time Video & Audio Calling Platform

PulseGuard AI is an academic AI security platform for real-time video communications. Phase 1 provides the foundational WebRTC two-way audio and video calling system, Socket.IO signaling, room management with unique codes, device permission handling, and call controls.

---

## 🎨 UI Design System

- **Background**: Clean white (`#FFFFFF` / `#F8FAFC`)
- **Theme Color**: Deep Sea Blue (`#0A2540`, `#003B73`, `#0A3663`)
- **Aesthetic**: Academic AI security project — rounded cards, subtle shadows, clean typography (Inter & JetBrains Mono), and status indicators.

---

## 🚀 Features Implemented (Phase 1)

1. **Header**:
   - Branding: **PulseGuard AI** (Phase 1 Academic Security badge)
   - Navigation: **Home**, **Settings** (device diagnostics & scanner), **About** (project architecture & roadmap).

2. **Main Home Screen**:
   - Title: **Secure Video Communication**
   - Subtitle: **Create or join a secure room to start a real-time call.**
   - Two Interactive Cards:
     - **Create Room**:
       1. Prompts for host name: **Enter Your Name**.
       2. **Continue** button generates unique room code (e.g., `PG-7K4X92`).
       3. **Copy Code** button with clipboard feedback.
       4. Direct transition to Call Screen as **Host**.
     - **Join Room**:
       1. Prompts for participant name: **Enter Your Name**.
       2. Prompts for room code: **Enter Room Code**.
       3. **Join** button validates room code.
       4. Validation states:
          - If invalid: `Invalid room code. Please check and try again.`
          - If full: `This room is already full.`

3. **WebRTC Real-Time Calling Engine**:
   - P2P Audio and Video live streaming via STUN servers (`stun:stun.l.google.com:19302`).
   - Two Live Video Panels:
     - **Local Participant**: Shows current user's camera feed with mirroring and local role tag.
     - **Remote Participant**: Shows peer's live feed (no placeholder when connected).
   - Real-time Connection Status Indicators:
     - `Connecting...`
     - `Connected` / `2 Participants Connected`
     - `Participant Disconnected`
     - `Connection Failed – Please try again`
   - Strict 2-Participant Room Enactment.

4. **Call Controls (Bottom Floating Bar)**:
   - 🎤 **Microphone**: Mute / Unmute with visual mute badges.
   - 📹 **Camera**: Camera Off / Camera On with user avatar placeholder.
   - 📞 **End Call**: Gracefully stops local media tracks, closes RTCPeerConnection, notifies server, and returns to home screen.

5. **Permission Management**:
   - Requests camera and microphone access.
   - If blocked or unavailable, displays diagnostic permission modal with **Try Again** (retry) and **Leave Call** options.

6. **Phase 2 Readiness**:
   - Clean, modular architecture: `useWebRTC` hook exposes raw `localStream` and `remoteStream` references ready to plug into canvas frame processors, rPPG heart rate analyzers, and facial landmark pipelines.

---

## 🛠 Project Structure

```
pluseguard/
├── server/
│   ├── index.js          # Express + Socket.IO signaling server & static file host
│   └── package.json      # Server dependencies (express, socket.io, cors)
├── client/
│   ├── index.html        # HTML entry point with Inter & JetBrains Mono fonts
│   ├── package.json      # React 18, Vite, Tailwind CSS, Lucide icons
│   ├── vite.config.js    # Vite configuration & backend proxy
│   ├── tailwind.config.js # Deep Sea Blue palette configuration
│   └── src/
│       ├── main.jsx      # React DOM bootstrap
│       ├── App.jsx       # Screen orchestration (Home vs Call)
│       ├── index.css     # Tailwind imports and video styling
│       ├── services/
│       │   └── socket.js # Socket.IO client singleton
│       ├── hooks/
│       │   └── useWebRTC.js # Complete WebRTC lifecycle hook
│       └── components/
│           ├── Header.jsx          # Top navigation bar
│           ├── HomeScreen.jsx      # Main landing with Create/Join cards
│           ├── CreateRoomModal.jsx # Room generator & copy code flow
│           ├── JoinRoomModal.jsx   # Room validation & participant join
│           ├── CallScreen.jsx      # Video room with dual feeds & status
│           ├── VideoPanel.jsx      # Individual video feed & placeholders
│           ├── CallControls.jsx    # Floating bottom controls (Mute, Cam, End)
│           ├── PermissionModal.jsx # Camera/Mic permission explanation & retry
│           ├── AboutModal.jsx      # Academic research & roadmap
│           └── SettingsModal.jsx   # Hardware device inspection
└── README.md
```

---

## 🏃 How to Run

### Option 1: Unified Production Mode (Single Command)
1. Build the client:
   ```bash
   cd client
   npm run build
   cd ..
   ```
2. Start the server (serves both API, WebRTC signaling, and frontend on port `3001`):
   ```bash
   node server/index.js
   ```
3. Open your browser at:
   ```
   http://localhost:3001
   ```

### Option 2: Development Mode (Hot Reload)
1. Start the backend signaling server:
   ```bash
   cd server
   node index.js
   ```
2. In a separate terminal, start Vite frontend:
   ```bash
   cd client
   npm run dev
   ```
3. Open:
   ```
   http://localhost:3000
   ```
