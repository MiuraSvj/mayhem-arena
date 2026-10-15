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
function signSession(username, sessionId) {
  const payload = Buffer.from(JSON.stringify({ username, sessionId, expires: Date.now() + 1000 * 60 * 60 * 24 * 14 })).toString('base64url');
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
function authenticatedUser(request, list = users()) {
  const session = readSession(request);
  if (!session?.sessionId) return null;
  return list.find((item) => item.username.toLowerCase() === session.username.toLowerCase() && item.activeSessionId === session.sessionId) || null;
}
function newSessionId() { return crypto.randomBytes(32).toString('hex'); }
function setSessionCookie(response, username, sessionId) {
  response.setHeader('Set-Cookie', `mayhem_session=${signSession(username, sessionId)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1209600${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}
function profileFor(user) {
  if (!user.profile || typeof user.profile !== 'object') user.profile = { matches: 0, wins: 0, characters: {}, matchIds: [], history: [], achievementIds: [] };
  user.profile.matches = Number.isFinite(user.profile.matches) ? user.profile.matches : 0;
  user.profile.wins = Number.isFinite(user.profile.wins) ? user.profile.wins : 0;
  if (!user.profile.characters || typeof user.profile.characters !== 'object') user.profile.characters = {};
  if (!Array.isArray(user.profile.matchIds)) user.profile.matchIds = [];
  if (!Array.isArray(user.profile.history)) user.profile.history = [];
  if (!Array.isArray(user.profile.achievementIds)) user.profile.achievementIds = [];
  if (!user.profile.wonCharacters || typeof user.profile.wonCharacters !== 'object') user.profile.wonCharacters = {};
  return user.profile;
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.get('/api/auth/me', (request, response) => {
  const list = users();
  const session = readSession(request);
  const user = authenticatedUser(request, list);
  if (user) { const needsMigration = !user.profile; profileFor(user); if (needsMigration) saveUsers(list); }
  response.json({ user: user ? { username: user.username, profile: user.profile } : null, sessionEndedElsewhere: Boolean(session && !user) });
});
app.post('/api/profile/match', (request, response) => {
  const list = users();
  const user = authenticatedUser(request, list);
  if (!user) return response.status(401).json({ error: 'Sign in to save match stats.' });
  const { matchId, won, character, historyEntry } = request.body || {};
  if (typeof matchId !== 'string' || !/^[A-Za-z0-9-]{8,80}$/.test(matchId) || typeof won !== 'boolean' || typeof character !== 'string') return response.status(400).json({ error: 'Invalid match stats.' });
  const profile = profileFor(user);
  if (!profile.matchIds.includes(matchId)) {
    profile.matches++;
    if (won) { profile.wins++; profile.wonCharacters[character]=(profile.wonCharacters[character] || 0)+1; }
    profile.characters[character] = (profile.characters[character] || 0) + 1;
    profile.matchIds.push(matchId);
    profile.matchIds = profile.matchIds.slice(-1000);
    if (historyEntry && typeof historyEntry === 'object' && historyEntry.matchId === matchId && typeof historyEntry.playedAt === 'string') {
      profile.history.unshift({
        matchId,
        playedAt: historyEntry.playedAt.slice(0, 32),
        won,
        mode: ['ai','online'].includes(historyEntry.mode) ? historyEntry.mode : 'ai',
        character: String(character).slice(0, 32),
        opponentName: typeof historyEntry.opponentName === 'string' ? historyEntry.opponentName.slice(0, 24) : '',
        opponentCharacter: typeof historyEntry.opponentCharacter === 'string' ? historyEntry.opponentCharacter.slice(0, 32) : '',
        opponentStyle: typeof historyEntry.opponentStyle === 'string' ? historyEntry.opponentStyle.slice(0, 24) : '',
        difficulty: typeof historyEntry.difficulty === 'string' ? historyEntry.difficulty.slice(0, 16) : '',
        hpRemaining: Number.isInteger(historyEntry.hpRemaining) ? Math.max(0, Math.min(10, historyEntry.hpRemaining)) : null
      });
      profile.history = profile.history.slice(0, 25);
    }
    const validAchievements=['first-win','clutch-win','legend-slayer','five-wins','all-heroes'];
    if (Array.isArray(request.body?.achievementIds)) profile.achievementIds=[...new Set([...profile.achievementIds,...request.body.achievementIds.filter((id)=>validAchievements.includes(id))])];
    saveUsers(list);
  }
  response.json({ profile });
});
app.post('/api/auth/register', async (request, response) => {
  const username = String(request.body?.username || '').trim();
  const password = String(request.body?.password || '');
  if (!/^[A-Za-z0-9_]{3,18}$/.test(username)) return response.status(400).json({ error: 'Use 3–18 letters, numbers, or underscores for your username.' });
  if (password.length < 8) return response.status(400).json({ error: 'Use a password with at least 8 characters.' });
  const list = users();
  if (list.some((user) => user.username.toLowerCase() === username.toLowerCase())) return response.status(409).json({ error: 'That username is already in use.' });
  const sessionId = newSessionId();
  const user = { username, passwordHash: await hashPassword(password), createdAt: new Date().toISOString(), activeSessionId: sessionId, profile: { matches: 0, wins: 0, characters: {}, matchIds: [], history: [], achievementIds: [], wonCharacters: {} } };
  list.push(user);
  saveUsers(list);
  setSessionCookie(response, username, sessionId);
  response.status(201).json({ user: { username, profile: profileFor(user) } });
});
app.post('/api/auth/login', async (request, response) => {
  const username = String(request.body?.username || '').trim();
  const password = String(request.body?.password || '');
  const list = users();
  const user = list.find((item) => item.username.toLowerCase() === username.toLowerCase());
  if (!user || !(await verifyPassword(password, user.passwordHash))) return response.status(401).json({ error: 'Username or password is incorrect.' });
  profileFor(user);
  const hadOtherDeviceSession = Boolean(user.activeSessionId);
  const sessionId = newSessionId();
  user.activeSessionId = sessionId;
  saveUsers(list);
  setSessionCookie(response, user.username, sessionId);
  response.json({ user: { username: user.username, profile: user.profile }, replacedSession: hadOtherDeviceSession });
});
app.post('/api/auth/logout', (request, response) => {
  const list = users();
  const user = authenticatedUser(request, list);
  if (user) { delete user.activeSessionId; saveUsers(list); }
  response.setHeader('Set-Cookie', 'mayhem_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  response.status(204).end();
});
app.get('*', (_request, response) => response.sendFile(path.join(__dirname, 'index.html')));

const rooms = new Map();
const code = () => crypto.randomBytes(3).toString('hex').toUpperCase();
const characterIds = ['sutha','azzan','lia','oriax'];
function chooseRoomCharacter(requested, players=[], exceptId=null) {
  const used=new Set(players.filter((player)=>player.id!==exceptId && !player.left).map((player)=>player.character));
  const choices=requested==='random' ? characterIds.filter((id)=>!used.has(id)) : characterIds.includes(requested) && !used.has(requested) ? [requested] : [];
  return choices[Math.floor(Math.random()*choices.length)] || null;
}
function sendLobby(roomCode) { const room=rooms.get(roomCode); if(room) io.to(roomCode).emit('lobby-state',{code:roomCode,hostId:room.hostId,limit:room.limit,randomCharacter:room.randomCharacter,players:room.players}); }
function sendRematchVotes(roomCode) { const room=rooms.get(roomCode); if(!room) return; const players=room.players.filter((player)=>!player.left); const ids=players.map((player)=>player.id); room.rematchVotes=(room.rematchVotes || []).filter((id)=>ids.includes(id)); io.to(roomCode).emit('rematch-vote-state',{votes:room.rematchVotes,players}); if(ids.length && ids.every((id)=>room.rematchVotes.includes(id)) && !room.rematchStarting) { room.rematchStarting=true; io.to(roomCode).emit('rematch-ready'); } }
function markOnlinePlayerDead(room, socketId) {
  if (!room.game) return;
  const playerIndex=room.game.players.findIndex((player)=>player.socketId===socketId);
  const player=room.game.players[playerIndex];
  if (!player || !player.alive) return;
  player.alive=false; player.hp=0; player.hand=[]; player.defenses=[];
  room.game.logMessage=`${player.name} left the match and was knocked out.`;
  const standing=room.game.players.map((item,index)=>item.alive ? index : -1).filter((index)=>index>=0);
  if (standing.length<=1) {
    room.game.finished=true; room.game.required=0; room.game.pendingDamage=[];
  } else if (room.game.current===playerIndex) {
    let next=(playerIndex+1)%room.game.players.length;
    while(!room.game.players[next].alive) next=(next+1)%room.game.players.length;
    room.game.current=next; room.game.turn++; room.game.required=1; room.game.turnEndsAt=Date.now()+60_000;
    const nextPlayer=room.game.players[next];
    if(room.game.rules?.turnDraw) {
      if(!nextPlayer.deck.length && nextPlayer.discard.length) { nextPlayer.deck=nextPlayer.discard.slice().sort(()=>Math.random()-.5); nextPlayer.discard=[]; }
      if(nextPlayer.deck.length) nextPlayer.hand.push(nextPlayer.deck.pop());
    }
  }
}
io.on('connection',(socket)=>{
  socket.on('create-room',({name,character,limit,randomCharacter},reply)=>{ if(character!=='random' && character!==null && !characterIds.includes(character)) return reply?.({ok:false,error:'Choose a valid character.'}); const randomRule=Boolean(randomCharacter); const chosen=randomRule || character==='random' ? chooseRoomCharacter('random') : chooseRoomCharacter(character); const roomCode=code(); rooms.set(roomCode,{hostId:socket.id,limit:Math.min(4,Math.max(2,Number(limit)||2)),randomCharacter:randomRule,players:[{id:socket.id,name:String(name).slice(0,18),character:chosen,ready:false,left:false}],game:null,rematchVotes:[],rematchStarting:false}); socket.join(roomCode); sendLobby(roomCode); reply?.({ok:true,code:roomCode,character:chosen}); });
  socket.on('join-room',({code:roomCode,name,character},reply)=>{ const normalized=String(roomCode).toUpperCase(); const room=rooms.get(normalized); if(!room) return reply?.({ok:false,error:'Room not found.'}); if(room.players.filter((player)=>!player.left).length>=room.limit) return reply?.({ok:false,error:'This room is full.'}); if(room.game) return reply?.({ok:false,error:'This battle has already started.'}); if(character!=='random' && character!==null && !characterIds.includes(character)) return reply?.({ok:false,error:'Choose a valid character.'}); const chosen=room.randomCharacter || character==='random' ? chooseRoomCharacter('random',room.players) : chooseRoomCharacter(character,room.players); room.players.push({id:socket.id,name:String(name).slice(0,18),character:chosen,ready:false,left:false}); socket.join(normalized); sendLobby(normalized); reply?.({ok:true,code:normalized,character:chosen}); });
  socket.on('set-room-random-character',({code:roomCode,enabled},reply)=>{ const normalized=String(roomCode).toUpperCase(); const room=rooms.get(normalized); if(!room || room.game) return reply?.({ok:false,error:'This room is no longer available.'}); if(room.hostId!==socket.id) return reply?.({ok:false,error:'Only the host can change room rules.'}); room.randomCharacter=Boolean(enabled); if(room.randomCharacter) { const assignments=[...characterIds].sort(()=>Math.random()-.5); room.players.filter((player)=>!player.left).forEach((player,index)=>{ player.character=assignments[index] || null; }); } room.players.filter((player)=>!player.left).forEach((player)=>{ player.ready=false; }); sendLobby(normalized); reply?.({ok:true}); });
  socket.on('change-character',({code:roomCode,character},reply)=>{ const room=rooms.get(String(roomCode).toUpperCase()); if(!room || room.game) return reply?.({ok:false,error:'This room is no longer available.'}); const player=room.players.find((item)=>item.id===socket.id); if(!player) return reply?.({ok:false,error:'Join the room before choosing a character.'}); if(character!=='random' && !characterIds.includes(character)) return reply?.({ok:false,error:'Choose a valid character.'}); const chosen=chooseRoomCharacter(character,room.players,socket.id); if(!chosen) return reply?.({ok:false,error:'No character is available.'}); player.character=chosen; player.ready=false; sendLobby(String(roomCode).toUpperCase()); reply?.({ok:true,character:chosen}); });
  socket.on('set-ready',({code:roomCode,ready},reply)=>{ const normalized=String(roomCode).toUpperCase(); const room=rooms.get(normalized); if(!room || room.game) return reply?.({ok:false,error:'This room is no longer available.'}); const player=room.players.find((item)=>item.id===socket.id && !item.left); if(!player) return reply?.({ok:false,error:'You are not in this room.'}); if(ready && !player.character) return reply?.({ok:false,error:'Choose a character before getting ready.'}); player.ready=Boolean(ready); sendLobby(normalized); reply?.({ok:true}); });
  socket.on('kick-player',({code:roomCode,playerId},reply)=>{ const normalized=String(roomCode).toUpperCase(); const room=rooms.get(normalized); if(!room || room.game) return reply?.({ok:false,error:'This room is no longer available.'}); if(room.hostId!==socket.id) return reply?.({ok:false,error:'Only the host can kick players.'}); if(playerId===socket.id) return reply?.({ok:false,error:'The host cannot kick themselves.'}); const index=room.players.findIndex((player)=>player.id===playerId && !player.left); if(index<0) return reply?.({ok:false,error:'Player not found.'}); const [removed]=room.players.splice(index,1); io.to(removed.id).emit('kicked-from-room'); const target=io.sockets.sockets.get(removed.id); if(target) target.leave(normalized); sendLobby(normalized); reply?.({ok:true}); });
  socket.on('start-online-game',({code:roomCode,state},reply)=>{ const room=rooms.get(roomCode); if(!room || room.hostId!==socket.id) return reply?.({ok:false,error:'Only the room host can begin.'}); const active=room.players.filter((player)=>!player.left); if(active.length!==room.limit) return reply?.({ok:false,error:'Every seat must be filled before starting.'}); if(active.some((player)=>!player.character) || new Set(active.map((player)=>player.character)).size!==active.length) return reply?.({ok:false,error:'Every player must choose a different character.'}); if(active.some((player)=>!player.ready)) return reply?.({ok:false,error:'Every player must press Ready before starting.'}); room.game=state; room.rematchVotes=[]; room.rematchStarting=false; io.to(roomCode).emit('online-game-state',{state,players:room.players}); reply?.({ok:true}); });
  socket.on('rematch-vote',({code:roomCode},reply)=>{ const normalized=String(roomCode).toUpperCase(); const room=rooms.get(normalized); if(!room || !room.game?.finished) return reply?.({ok:false,error:'A completed battle is required to vote.'}); if(!room.players.some((player)=>player.id===socket.id && !player.left)) return reply?.({ok:false,error:'You are not an active player in this room.'}); room.rematchVotes=room.rematchVotes || []; if(!room.rematchVotes.includes(socket.id)) room.rematchVotes.push(socket.id); sendRematchVotes(normalized); reply?.({ok:true}); });
  socket.on('sync-online-game',({code:roomCode,state})=>{ const room=rooms.get(roomCode); if(!room || !room.players.some((player)=>player.id===socket.id && !player.left) || !room.game || room.game.matchId!==state.matchId || room.game.finished) return;
    const previous=room.game;
    previous.players.forEach((oldPlayer)=>{ if(!oldPlayer.alive) { const nextPlayer=state.players.find((player)=>player.socketId===oldPlayer.socketId); if(nextPlayer) { nextPlayer.alive=false; nextPlayer.hp=0; nextPlayer.hand=[]; nextPlayer.defenses=[]; } } });
    if(state.players[state.current]?.alive===false) { state.current=previous.current; state.turn=Math.max(state.turn,previous.turn); state.required=previous.required; state.turnEndsAt=previous.turnEndsAt; }
    room.game=state; socket.to(roomCode).emit('online-game-state',{state,players:room.players});
  });
  socket.on('leave-room',({code:roomCode},reply)=>{ const room=rooms.get(String(roomCode).toUpperCase()); if(!room) return reply?.({ok:false,error:'Room no longer exists.'});
    if(room.game) { const member=room.players.find((player)=>player.id===socket.id); if(member) member.left=true; markOnlinePlayerDead(room,socket.id); socket.leave(roomCode); if(room.hostId===socket.id) room.hostId=room.players.find((player)=>!player.left)?.id || null; if(!room.players.some((player)=>!player.left)) rooms.delete(roomCode); else io.to(roomCode).emit('online-game-state',{state:room.game,players:room.players}); }
    else { room.players=room.players.filter((player)=>player.id!==socket.id); socket.leave(roomCode); if(!room.players.length) rooms.delete(roomCode); else { if(room.hostId===socket.id) room.hostId=room.players[0].id; sendLobby(roomCode); } }
    reply?.({ok:true});
  });
  socket.on('disconnect',()=>{ for(const [roomCode,room] of rooms) { const member=room.players.find((player)=>player.id===socket.id); if(!member) continue;
    if(room.game) { member.left=true; markOnlinePlayerDead(room,socket.id); if(room.hostId===socket.id) room.hostId=room.players.find((player)=>!player.left)?.id || null; if(!room.players.some((player)=>!player.left)) rooms.delete(roomCode); else io.to(roomCode).emit('online-game-state',{state:room.game,players:room.players}); }
    else { room.players=room.players.filter((player)=>player.id!==socket.id); if(!room.players.length) rooms.delete(roomCode); else { if(room.hostId===socket.id) room.hostId=room.players[0].id; sendLobby(roomCode); } }
  } });
});

server.listen(port, () => console.log(`Mayhem Arena is listening on port ${port}`));
