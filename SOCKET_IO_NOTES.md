# Socket.IO — Developer Notes

## Current Status (cPanel Hosting)

Socket.IO real-time connections are **intentionally suppressed** on the production environment to prevent console error flooding.

### Why was this done?

This app is hosted on **cPanel shared hosting**, which runs Node.js through **Apache + Phusion Passenger**.
Apache does not forward the HTTP `Upgrade` header required for WebSocket handshakes.
As a result, Socket.IO falls back to HTTP polling, which also fails because `/api/socket.io` is not reachable through Apache's proxy — causing **hundreds of 404 errors** in the browser console on every page load.

The socket code itself is fully intact and functional. Only two config options were added to stop the infinite retry loop.

---

## Files Modified

| File | Line | Change |
|------|------|--------|
| `client/src/context/AuthContext.jsx` | ~89 | Added `reconnectionAttempts: 0, timeout: 5000` |
| `client/src/pages/InterestsPage.jsx` | ~60 | Added `reconnectionAttempts: 0, timeout: 5000` |
| `client/src/components/MobileChatRoom.jsx` | ~73 | Added `reconnectionAttempts: 0, timeout: 5000` |

**Current suppressed config (all 3 files):**
```js
io(SOCKET_BASE_URL, {
  path: '/api/socket.io',
  reconnectionAttempts: 0,  // Stops infinite retry — prevents 404 spam
  timeout: 5000             // Gives up after 5 seconds if connection fails
})
```

---

## What Still Works on cPanel

Even without Socket.IO, the following features work normally:

- ✅ User registration and login
- ✅ Sending and receiving interest requests
- ✅ Viewing and updating profiles
- ✅ Chat messages (saved to database — visible on page refresh)
- ✅ Web Push notifications (via service worker — works independently of socket)
- ✅ Gallery photo requests, shortlisting, admin panel

**What does NOT work without Socket.IO:**
- ❌ Instant message delivery without page refresh
- ❌ Real-time toast notifications (new interest, accepted request, new message)
- ❌ Live activity updates

---

## How to Re-Enable Socket.IO (When Moving to VPS or Cloud)

### Step 1 — Remove the two suppression options from all 3 files

**Change this (suppressed):**
```js
io(SOCKET_BASE_URL, {
  path: '/api/socket.io',
  reconnectionAttempts: 0,
  timeout: 5000
})
```

**Back to this (full real-time):**
```js
io(SOCKET_BASE_URL, {
  path: '/api/socket.io'
})
```

Files to update:
- `client/src/context/AuthContext.jsx` — line ~89
- `client/src/pages/InterestsPage.jsx` — line ~60
- `client/src/components/MobileChatRoom.jsx` — line ~73

---

### Step 2 — Configure Nginx to proxy WebSocket traffic

If using **Nginx** as the reverse proxy on your VPS, add the following location block:

```nginx
location /api/socket.io/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

> **Note:** The `Upgrade` and `Connection` headers are what enable the WebSocket handshake.
> Without these, the connection degrades to polling and eventually fails.

---

### Step 3 — Verify the connection

After deploying, open the browser DevTools → Network tab → filter by **WS** (WebSocket).
You should see an active WebSocket connection to your server.

If the connection is successful, you will **not** see any of these errors in the Console:
```
GET /api/socket.io/?EIO=4&transport=polling 404 (Not Found)
XHR failed loading: GET "<URL>"
```

---

## Recommended Hosting Platforms (WebSocket Supported)

| Platform | Free Tier | Ease of Setup | Notes |
|----------|-----------|---------------|-------|
| **Render.com** | Yes (with sleep) | Very easy | Connect GitHub repo, auto-deploy |
| **Railway.app** | Trial credits | Easy | Good for Node.js + MongoDB |
| **Fly.io** | Yes | Medium | More control, global regions |
| **DigitalOcean Droplet** | No (~$6/mo) | Manual | Full VPS, most control |

---

## Why cPanel Cannot Support WebSockets

```
cPanel Shared Hosting:
  Browser → Apache (port 80/443) → Passenger → Node.js (port 5000)

Problem:
  Apache does not pass the "Connection: Upgrade" header by default.
  Passenger does not maintain persistent connections.
  Shared hosting enforces connection timeouts and resource limits.

VPS / Cloud:
  Browser → Nginx (port 80/443) → Node.js (port 5000)

Solution:
  Nginx can be configured to forward the Upgrade header.
  Node.js HTTP server directly handles the WebSocket upgrade.
  Persistent connections are maintained without interruption.
```
