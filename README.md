# RAISE Platform - Local Starter

## Stack
- Frontend: Next.js
- Backend: Node.js + Express (initial API scaffold)
- API: REST under `/api/v1`
- Future: WebSocket/Socket.IO for real-time features

## Run

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Start backend
```bash
npm run dev:backend
```
Backend: http://localhost:5000
Health: http://localhost:5000/api/v1/health

### 3. Start frontend in another terminal
```bash
npm run dev:frontend
```
Frontend: http://localhost:3000

### 4. Genertae JWT token
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Next development modules
1. Authentication / Magic Link
2. Events
3. GP Applications
4. Assets / Decks
5. Admin Review
6. LPSC Assignment & Review
7. LP Portal Sync
8. Reports
9. Notifications
10. WebSocket real-time updates
