const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
const dataDirectory = path.join(__dirname, 'data');
const usersPath = path.join(dataDirectory, 'users.json');
const secret = process.env.AUTH_SECRET || 'replace-this-secret-before-production';

fs.mkdirSync(dataDirectory, { recursive: true });
if (!fs.existsSync(usersPath)) fs.writeFileSync(usersPath, '[]');

function users() { return JSON.parse(fs.readFileSync(usersPath, 'utf8')); }
function saveUsers(list) { fs.writeFileSync(usersPath, JSON.stringify(list, null, 2)); }
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (error, hash) => error ? reject(error) : resolve(`${salt}:${hash.toString('hex')}`)));
}
function verifyPassword(password, stored) {
  const [salt, expected] = stored.split(':');
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (error, hash) => error ? reject(error) : resolve(crypto.timingSafeEqual(Buffer.from(expected, 'hex'), hash))));
}
function signSession(username) {
  const payload = Buffer.from(JSON.stringify({ username, expires: Date.now() + 1000 * 60 * 60 * 24 * 14 })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}
function readSession(request) {
  const token = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('mayhem_session='))?.slice(15);
  if (!token) return null;
  const [payload, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (!payload || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { const session = JSON.parse(Buffer.from(payload, 'base64url').toString()); return session.expires > Date.now() ? session : null; } catch { return null; }
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.get('/api/auth/me', (request, response) => {
  const session = readSession(request);
  response.json({ user: session ? { username: session.username } : null });
});
app.post('/api/auth/register', async (request, response) => {
  const username = String(request.body?.username || '').trim();
  const password = String(request.body?.password || '');
  if (!/^[A-Za-z0-9_]{3,18}$/.test(username)) return response.status(400).json({ error: 'Use 3–18 letters, numbers, or underscores for your username.' });
  if (password.length < 8) return response.status(400).json({ error: 'Use a password with at least 8 characters.' });
  const list = users();
  if (list.some((user) => user.username.toLowerCase() === username.toLowerCase())) return response.status(409).json({ error: 'That username is already in use.' });
  list.push({ username, passwordHash: await hashPassword(password), createdAt: new Date().toISOString() });
  saveUsers(list);
  response.setHeader('Set-Cookie', `mayhem_session=${signSession(username)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1209600${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  response.status(201).json({ user: { username } });
});
app.post('/api/auth/login', async (request, response) => {
  const username = String(request.body?.username || '').trim();
  const password = String(request.body?.password || '');
  const user = users().find((item) => item.username.toLowerCase() === username.toLowerCase());
  if (!user || !(await verifyPassword(password, user.passwordHash))) return response.status(401).json({ error: 'Username or password is incorrect.' });
  response.setHeader('Set-Cookie', `mayhem_session=${signSession(user.username)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1209600${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  response.json({ user: { username: user.username } });
});
app.post('/api/auth/logout', (_request, response) => {
  response.setHeader('Set-Cookie', 'mayhem_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  response.status(204).end();
});
app.get('*', (_request, response) => response.sendFile(path.join(__dirname, 'index.html')));

const rooms = new Map();
const code = () => crypto.randomBytes(3).toString('hex').toUpperCase();
function sendLobby(roomCode) { const room=rooms.get(roomCode); if(room) io.to(roomCode).emit('lobby-state',{code:roomCode,hostId:room.hostId,limit:room.limit,players:room.players}); }
io.on('connection',(socket)=>{
  socket.on('create-room',({name,character,limit},reply)=>{ const roomCode=code(); rooms.set(roomCode,{hostId:socket.id,limit:Math.min(4,Math.max(2,Number(limit)||2)),players:[{id:socket.id,name:String(name).slice(0,18),character}],game:null}); socket.join(roomCode); sendLobby(roomCode); reply?.({ok:true,code:roomCode}); });
  socket.on('join-room',({code:roomCode,name,character},reply)=>{ const room=rooms.get(String(roomCode).toUpperCase()); if(!room) return reply?.({ok:false,error:'Room not found.'}); if(room.players.length>=room.limit) return reply?.({ok:false,error:'This room is full.'}); if(room.game) return reply?.({ok:false,error:'This battle has already started.'}); room.players.push({id:socket.id,name:String(name).slice(0,18),character}); socket.join(String(roomCode).toUpperCase()); sendLobby(String(roomCode).toUpperCase()); reply?.({ok:true,code:String(roomCode).toUpperCase()}); });
  socket.on('start-online-game',({code:roomCode,state},reply)=>{ const room=rooms.get(roomCode); if(!room || room.hostId!==socket.id) return reply?.({ok:false,error:'Only the room host can begin.'}); if(room.players.length<2) return reply?.({ok:false,error:'At least two players must join.'}); room.game=state; io.to(roomCode).emit('online-game-state',{state,players:room.players}); reply?.({ok:true}); });
  socket.on('sync-online-game',({code:roomCode,state})=>{ const room=rooms.get(roomCode); if(room && room.players.some((player)=>player.id===socket.id)) { room.game=state; socket.to(roomCode).emit('online-game-state',{state,players:room.players}); } });
  socket.on('disconnect',()=>{ for(const [roomCode,room] of rooms) { const before=room.players.length; room.players=room.players.filter((player)=>player.id!==socket.id); if(!room.players.length) rooms.delete(roomCode); else if(before!==room.players.length) { if(room.hostId===socket.id) room.hostId=room.players[0].id; sendLobby(roomCode); } } });
});

server.listen(port, () => console.log(`Mayhem Arena is listening on port ${port}`));
