const characters = [
  { id:'sutha', name:'Sutha the Skullcrusher', role:'Barbarian', weapon:'axe', cards:[
    {name:'Big Axe is Best Axe',type:'attack',count:5,damage:3},{name:'Two Axes are Better Than One',type:'trick',count:2,again:2},{name:'Whirling Axes',type:'mighty',count:2,damage:1,area:true,healPerOpponent:true,mighty:true},{name:'Mighty Toss',type:'mighty',count:2,destroyDefense:true,draw:1,mighty:true},{name:'Battle Roar',type:'mighty',count:2,discardHandDraw:3,again:1,mighty:true},{name:'Head Butt',type:'attack',count:2,damage:1,again:1},{name:'Brutal Punch',type:'attack',count:2,damage:2},{name:'Rage!',type:'attack',count:2,damage:4},{name:'Open the Armory',type:'trick',count:2,draw:2},{name:'Flex',type:'trick',count:2,heal:1,draw:1},{name:'Bag of Rats',type:'mighty',count:1,shield:1,draw:1,mighty:true},{name:'Spiked Shield',type:'defense',count:1,shield:2},{name:'Riff',type:'defense',count:1,shield:3},{name:'Raff',type:'defense',count:1,shield:3},{name:'Snack Time',type:'heal',count:1,draw:2,heal:1}
  ]},
  { id:'azzan', name:'Azzan the Mystic', role:'Wizard', weapon:'staff', cards:[
    {name:'Lightning Bolt',type:'attack',count:4,damage:3},{name:'Magic Missile',type:'attack',count:3,damage:1,again:1},{name:'Burning Hands',type:'attack',count:3,damage:2},{name:'Knowledge is Power',type:'trick',count:3,draw:3},{name:'Speed of Thought',type:'trick',count:3,again:2},{name:'Fireball',type:'mighty',count:2,damage:3,area:true,areaSelf:true,mighty:true},{name:'Charm',type:'mighty',count:2,stealDefense:true,mighty:true},{name:'Evil Sneer',type:'trick',count:2,heal:1,again:1},{name:'Vampiric Touch',type:'mighty',count:2,swap:true,mighty:true},{name:'Shield',type:'defense',count:2,shield:1,draw:1},{name:'Stoneskin',type:'defense',count:1,shield:2},{name:'Mirror Image',type:'defense',count:1,shield:3}
  ]},
  { id:'lia', name:'Lia the Radiant', role:'Paladin', weapon:'sword', cards:[
    {name:'For Even More Justice!',type:'attack',count:4,damage:2},{name:'For Justice!',type:'attack',count:3,damage:1,again:1},{name:'Fighting Words',type:'attack',count:3,damage:2,heal:1},{name:'For the Most Justice!',type:'attack',count:2,damage:3},{name:'Divine Smite',type:'attack',count:3,damage:3,heal:1},{name:'Divine Shield',type:'defense',count:2,shield:3},{name:'Spinning Parry',type:'defense',count:2,shield:1,draw:1},{name:'Finger Wag of Judgement',type:'trick',count:2,again:2},{name:'Divine Inspiration',type:'mighty',count:2,reclaim:true,heal:2,mighty:true},{name:'Cure Wounds',type:'heal',count:1,draw:2,heal:1},{name:'High Charisma',type:'trick',count:2,draw:2},{name:'Banishing Smite',type:'mighty',count:1,destroyAllDefense:true,mighty:true},{name:'Fluffy',type:'mighty',count:1,shield:2,mighty:true}
  ]},
  { id:'oriax', name:'Oriax the Clever', role:'Rogue', weapon:'daggers', cards:[
    {name:'One Thrown Dagger',type:'attack',count:5,damage:1,again:1},{name:'Two Thrown Daggers',type:'attack',count:4,damage:2},{name:'All The Thrown Daggers',type:'attack',count:3,damage:3},{name:'Winged Serpent',type:'defense',count:2,shield:1,draw:1},{name:'The Goon Squad',type:'defense',count:2,shield:2},{name:'Sneak Attack!',type:'mighty',count:2,destroyDefense:true,again:1,mighty:true},{name:'Clever Disguise',type:'mighty',count:2,protected:true,mighty:true},{name:'Cunning Action',type:'trick',count:2,again:2},{name:'Stolen Potion',type:'heal',count:2,heal:1,again:1},{name:'Pick Pocket',type:'mighty',count:2,stealTop:true,mighty:true},{name:'Even More Daggers',type:'trick',count:1,draw:2,heal:1},{name:'My Little Friend',type:'defense',count:1,shield:1,draw:1,again:1}
  ]},
];
const cardArtwork = {
  lia: {'For Even More Justice!':1,'For Justice!':1,'Fighting Words':5,'For the Most Justice!':8,'Divine Shield':2,'High Charisma':3,'Finger Wag of Judgement':4,'Divine Smite':5,'Spinning Parry':6,'Divine Inspiration':7,'Banishing Smite':8,'Cure Wounds':3,'Fluffy':2},
  oriax: {'One Thrown Dagger':1,'Two Thrown Daggers':1,'All The Thrown Daggers':1,'My Little Friend':2,'Winged Serpent':3,'The Goon Squad':3,'Cunning Action':4,'Stolen Potion':5,'Sneak Attack!':6,'Pick Pocket':7,'Clever Disguise':8,'Even More Daggers':1},
  sutha: {'Big Axe is Best Axe':1,'Rage!':1,'Head Butt':1,'Brutal Punch':1,'Riff':2,'Raff':2,'Spiked Shield':2,'Bag of Rats':2,'Open the Armory':3,'Two Axes are Better Than One':4,'Snack Time':5,'Flex':5,'Whirling Axes':6,'Mighty Toss':7,'Battle Roar':8},
  azzan: {'Burning Hands':1,'Stoneskin':2,'Shield':2,'Knowledge is Power':3,'Speed of Thought':4,'Magic Missile':5,'Lightning Bolt':5,'Fireball':6,'Charm':7,'Mirror Image':7,'Evil Sneer':7,'Vampiric Touch':8}
};
function cardArtworkPath(card) { const imageNumber=cardArtwork[card.owner]?.[card.name]; return imageNumber ? `/assets/card-art/${card.owner}-${imageNumber}.webp` : null; }
const $ = (id) => document.getElementById(id);
const els = { setup:$('setup-panel'), battle:$('battle-panel'), opponents:$('opponents'), hand:$('hand'), playerName:$('player-name'), playerHp:$('player-hp'), playerDefense:$('player-defense'), playerDeck:$('player-deck'), playerDiscard:$('player-discard'), deckCount:$('deck-count'), discardCount:$('discard-count'), discardPreview:$('discard-preview'), status:$('turn-status'), actions:$('action-counter'), message:$('battle-message'), log:$('game-log'), target:$('target-popover'), targetTitle:$('target-title'), targetOptions:$('target-options'), winner:$('winner-overlay'), winnerTitle:$('winner-title'), winnerText:$('winner-text'), winnerStats:$('winner-stats') };
let selectedPlayers = 2;
let selectedCharacter = null;
let game = null;
let pendingCard = null;
let accountMode = 'register';
let currentAccount = null;
let gameMode = 'ai';
let socket = null;
let onlineRoom = null;
let onlinePlayers = [];
let onlineRematchVotes = [];
let localPlayerIndex = 0;
const TURN_LIMIT_SECONDS = 60;
let turnDeadline = 0;
let timerInterval = null;
let lastHitPlayer = null;
let lastAction = null;
let seenPlayedCardId = null;
let seenFirstRollMatchId = null;
const seenVisualEffectIds = new Set();
const lastEffectSoundAt = new Map();
let profileMatchSaved = false;
let randomCharacter = false;
let audioContext = null;
let resultFeedbackMatchId = null;
function readUiPreference(key, fallback) { try { const saved=localStorage.getItem(key); return saved===null?fallback:saved==='true'; } catch { return fallback; } }
function readUiVolume(key, fallback) { try { const stored=localStorage.getItem(key); if(stored===null) return fallback; const saved=Number(stored); return Number.isFinite(saved)?Math.max(0,Math.min(1,saved)):fallback; } catch { return fallback; } }
let soundEnabled = readUiPreference('mayhem-sound',true);
let vibrationEnabled = readUiPreference('mayhem-vibration',true);
let musicEnabled = readUiPreference('mayhem-music',true);
let soundVolume = readUiVolume('mayhem-sound-volume',.55);
let musicVolume = readUiVolume('mayhem-music-volume',.28);
let menuMusicTrack = null;
let battleMusicTrack = null;
let activeMusicTrack = null;
const gameTimeouts = new Set();

function saveUiPreference(key,value) { try { localStorage.setItem(key,String(value)); } catch { /* Preferences are optional when storage is unavailable. */ } }
function updateSettingsControls() {
  $('music-enabled').checked=musicEnabled;
  $('sound-enabled').checked=soundEnabled;
  $('vibration-enabled').checked=vibrationEnabled;
  $('music-volume').value=String(Math.round(musicVolume*100));
  $('effects-volume').value=String(Math.round(soundVolume*100));
  $('music-volume-value').value=`${Math.round(musicVolume*100)}%`;
  $('effects-volume-value').value=`${Math.round(soundVolume*100)}%`;
  const supported=typeof navigator.vibrate==='function';
  $('vibration-enabled').disabled=!supported;
  $('test-vibration').disabled=!supported || !vibrationEnabled;
  $('vibration-support-note').textContent=supported?'Vibrate for attacks and important game events.':'Vibration is not supported by this browser or device.';
  $('vibration-test-status').textContent=supported?'':'Unavailable on this device';
}
function playGameSound(kind) {
  if(!soundEnabled || soundVolume<=0) return;
  const AudioContextType=window.AudioContext || window.webkitAudioContext; if(!AudioContextType) return;
  try {
    if(!audioContext) audioContext=new AudioContextType();
    if(audioContext.state==='suspended') audioContext.resume().catch(()=>{});
    const cues={
      card:[[620,.09,0],[820,.11,.075]],attack:[[145,.12,0],[420,.1,.035]],
      axe:[[230,.13,0],[115,.2,.045],[510,.09,.12]],lightning:[[1040,.07,0],[620,.1,.06],[175,.2,.12]],
      blast:[[180,.22,0],[110,.24,.06],[390,.1,.1]],staff:[[520,.12,0],[740,.16,.09]],
      sword:[[820,.07,0],[480,.12,.045]],daggers:[[950,.045,0],[690,.06,.04],[440,.08,.08]],slash:[[760,.06,0],[390,.13,.055]],
      shield:[[360,.12,0],[680,.16,.08]],block:[[520,.07,0],[220,.15,.045]],heal:[[660,.12,0],[880,.18,.1],[1040,.2,.22]],
      draw:[[740,.055,0],[1020,.08,.065]],discard:[[360,.1,0],[190,.13,.05]],swap:[[430,.1,0],[700,.12,.09],[500,.13,.18]],
      shatter:[[920,.06,0],[610,.1,.045],[280,.18,.1]],steal:[[530,.075,0],[820,.1,.07]],ward:[[400,.12,0],[610,.18,.1]],
      extra:[[600,.08,0],[900,.12,.07]],knockout:[[330,.12,0],[220,.22,.1]],win:[[523,.16,0],[659,.16,.12],[784,.24,.24]],lose:[[330,.18,0],[247,.24,.15]]
    };
    for(const [frequency,duration,delay] of cues[kind] || cues.card) {
      const oscillator=audioContext.createOscillator(), gain=audioContext.createGain(), start=audioContext.currentTime+delay;
      oscillator.type=['attack','axe','blast','block','shatter','knockout'].includes(kind)?'triangle':'sine'; oscillator.frequency.setValueAtTime(frequency,start);
      if(['axe','lightning','blast','sword','daggers','slash','discard','shatter','knockout'].includes(kind)) oscillator.frequency.exponentialRampToValueAtTime(Math.max(45,frequency*(kind==='lightning'?0.24:0.58)),start+duration);
      gain.gain.setValueAtTime(.0001,start); gain.gain.exponentialRampToValueAtTime((['attack','axe','lightning','blast','knockout'].includes(kind) ? .045 : .035)*soundVolume,start+.012); gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
      oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(start); oscillator.stop(start+duration+.02);
    }
  } catch { /* Audio can be unavailable or blocked by browser policy. */ }
}
function vibrateGame(kind) {
  if(!vibrationEnabled || typeof navigator.vibrate!=='function') return;
  const patterns={card:12,attack:[24,18,34],win:[35,30,55],lose:[55,45,25]};
  try { navigator.vibrate(patterns[kind] || patterns.card); } catch { /* Ignore unsupported haptics. */ }
}
function gameFeedback(kind) { playGameSound(kind); vibrateGame(kind); }
function playEffectSound(kind) {
  const now=Date.now(), previous=lastEffectSoundAt.get(kind)||0;
  if(now-previous<180) return;
  lastEffectSoundAt.set(kind,now);
  playGameSound(kind);
}
function syncBackgroundMusic() {
  if(!musicEnabled || musicVolume<=0) { stopBackgroundMusic(); return; }
  const isBattleMusic=Boolean(game && !game.finished);
  const selectedTrack=isBattleMusic ? battleMusicTrack : menuMusicTrack;
  if(activeMusicTrack && activeMusicTrack!==selectedTrack) activeMusicTrack.pause();
  try {
    let track=selectedTrack;
    if(!track) {
      track=new Audio(isBattleMusic
        ? '/assets/music/rolandomat-epic-battle-song-182915.mp3'
        : '/assets/music/cinematic-soul-halloween-background-music-617918.mp3');
      track.loop=true;
      track.preload='auto';
      if(isBattleMusic) battleMusicTrack=track; else menuMusicTrack=track;
    }
    track.volume=musicVolume;
    activeMusicTrack=track;
    if(track.paused) track.play().catch(()=>{});
  } catch { /* Audio is optional. */ }
}
function startBackgroundMusic() {
  syncBackgroundMusic();
}
function stopBackgroundMusic() {
  if(activeMusicTrack) activeMusicTrack.pause();
  activeMusicTrack=null;
}
function unlockGameAudio() {
  if(!soundEnabled && !musicEnabled) return;
  if(soundEnabled) {
    const AudioContextType=window.AudioContext || window.webkitAudioContext;
    if(AudioContextType) try { if(!audioContext) audioContext=new AudioContextType(); if(audioContext.state==='suspended') audioContext.resume().catch(()=>{}); } catch { /* Audio is optional. */ }
  }
  if(musicEnabled) startBackgroundMusic();
}
document.addEventListener('pointerdown',unlockGameAudio,{once:true});

function scheduleGameAction(callback, delay) {
  const timer=window.setTimeout(()=>{ gameTimeouts.delete(timer); if(game) callback(); },delay);
  gameTimeouts.add(timer);
}
function clearGameActions() { gameTimeouts.forEach((timer)=>window.clearTimeout(timer)); gameTimeouts.clear(); }
function updateBattleControls() {
  const inOnlineMatch=gameMode==='online' && Boolean(onlineRoom);
  $('restart-button').classList.toggle('hidden',gameMode==='online');
  $('leave-online-button').classList.toggle('hidden',!inOnlineMatch);
  const leaveBattle=$('leave-battle-button');
  leaveBattle.classList.toggle('hidden',!game);
  const leaveLabel=gameMode==='online'?'Leave online match':'Leave battle';
  leaveBattle.setAttribute('aria-label',leaveLabel);
  leaveBattle.title=leaveLabel;
}
function stopCurrentGame() {
  stopTurnTimer(); clearGameActions(); game=null; pendingCard=null; lastAction=null; lastHitPlayer=null;
  syncBackgroundMusic();
  els.target.classList.add('hidden'); els.winner.classList.add('hidden'); els.battle.classList.add('hidden');
  $('online-room-page').classList.add('hidden'); els.setup.classList.remove('hidden');
  window.scrollTo(0,0);
  updateBattleControls();
  setStatus(''); els.actions.textContent='Cards to play: —';
}

function stopTurnTimer() { if(timerInterval) window.clearInterval(timerInterval); timerInterval=null; }
function refreshTurnTimer() {
  const seconds=Math.max(0,Math.ceil((turnDeadline-Date.now())/1000));
  $('timer-label').textContent=`${seconds}s`; $('timer-bar').style.width=`${Math.max(0,(seconds/TURN_LIMIT_SECONDS)*100)}%`;
  $('turn-timer').classList.toggle('warning',seconds<=10);
  if(seconds===0) { stopTurnTimer(); if(!game || game.finished) return; if(gameMode==='online' && !canControlTurn()) return; log(`${playerAtTurn().name}'s time ran out.`); game.required=0; if(game.rules.stackDamage && game.pendingDamage.length) resolvePendingDamage(); nextTurn(); }
}
function startTurnTimer() { stopTurnTimer(); turnDeadline=Date.now()+TURN_LIMIT_SECONDS*1000; if(game) game.turnEndsAt=turnDeadline; refreshTurnTimer(); timerInterval=window.setInterval(refreshTurnTimer,500); }

function renderNameFields() {
  const holder=$('name-fields');
  const existing=[...holder.querySelectorAll('input')].map((input)=>input.value);
  holder.innerHTML='';
  for(let index=0;index<selectedPlayers;index++) {
    const label=document.createElement('label'); label.textContent=`Player ${index+1} name`;
    const input=document.createElement('input'); input.type='text'; input.maxLength=18; input.autocomplete='nickname'; input.value=index===0 && currentAccount ? currentAccount.username : (existing[index] || `Player ${index+1}`); input.id=`player-name-${index}`;
    label.append(input); holder.append(label);
  }
}
function updateAccountUi() {
  const button=$('account-button');
  button.textContent=currentAccount ? `Signed in: ${currentAccount.username}` : 'Create account / Sign in';
  $('logout-button').classList.toggle('hidden',!currentAccount);
  $('account-form').classList.toggle('hidden',Boolean(currentAccount));
  $('account-mode').classList.toggle('hidden',Boolean(currentAccount));
  $('account-title').textContent=currentAccount ? 'Player profile' : (accountMode==='register' ? 'Create your account' : 'Sign in');
  renderProfile();
  if(currentAccount) renderNameFields();
}
function renderProfile() {
  const holder=$('profile-summary');
  if(!currentAccount) { holder.classList.add('hidden'); holder.innerHTML=''; return; }
  const profile=currentAccount.profile || {matches:0,wins:0,characters:{}};
  const mostPlayed=Object.entries(profile.characters || {}).sort((a,b)=>b[1]-a[1])[0];
  const character=mostPlayed ? characters.find((item)=>item.id===mostPlayed[0]) : null;
  holder.classList.remove('hidden');
  holder.innerHTML=`<h3>${currentAccount.username}'s stats</h3><div><span>Wins</span><strong>${profile.wins || 0}</strong></div><div><span>Matches played</span><strong>${profile.matches || 0}</strong></div><div><span>Win rate</span><strong>${profile.matches ? Math.round(profile.wins/profile.matches*100) : 0}%</strong></div><div><span>Most played</span><strong>${character ? character.name : '—'}</strong></div>`;
}
async function loadAccount() {
  try { const response=await fetch('/api/auth/me'); const result=await response.json(); currentAccount=result.user; updateAccountUi(); } catch { updateAccountUi(); }
}
function showAccountDialog(mode='register') {
  accountMode=mode; $('account-error').textContent=''; $('account-title').textContent=mode==='register' ? 'Create your account' : 'Sign in'; $('account-submit').textContent=mode==='register' ? 'Create account' : 'Sign in'; $('account-mode').textContent=mode==='register' ? 'Already have an account? Sign in' : 'Need an account? Create one'; $('account-password').autocomplete=mode==='register' ? 'new-password' : 'current-password'; $('account-dialog').showModal();
}

function shuffle(list) {
  const shuffled=[...list];
  for(let index=shuffled.length-1;index>0;index--) {
    const other=Math.floor(Math.random()*(index+1));
    [shuffled[index],shuffled[other]]=[shuffled[other],shuffled[index]];
  }
  return shuffled;
}
function cardText(card) { const effects=[]; if(card.damage) effects.push(card.area ? `Deal ${card.damage} damage to ${card.areaSelf ? 'every player' : 'every opponent'}.` : `Deal ${card.damage} damage to one opponent.`); if(card.shield) effects.push(`Absorb ${card.shield} incoming damage.`); if(card.heal) effects.push(`Restore ${card.heal} HP.`); if(card.healPerOpponent) effects.push('Recover 1 HP for each opponent.'); if(card.draw) effects.push(`Draw ${card.draw} card${card.draw>1?'s':''}.`); if(card.again) effects.push(`Play ${card.again===1?'another card':`${card.again} more cards`}.`); if(card.swap) effects.push('Swap HP totals with an opponent.'); if(card.destroyDefense) effects.push('Destroy one of their defenses.'); if(card.destroyAllDefense) effects.push('Destroy every active defense.'); if(card.stealDefense) effects.push('Take one of their defenses.'); if(card.discardTarget) effects.push('Target discards a random card.'); if(card.discardHandDraw) effects.push(`Each player discards their hand and draws ${card.discardHandDraw}.`); if(card.reclaim) effects.push('Choose a discarded card and return it to your hand.'); if(card.protected) effects.push('Ignore opponents’ card effects until your next turn.'); if(card.stealTop) effects.push('Take the top card of an opponent’s deck and play it this turn.'); return effects.join(' '); }
function makeDeck(character) { return shuffle(character.cards.flatMap((template) => Array.from({length:template.count},(_,index) => ({ ...template, owner:character.id, role:character.role, text:cardText(template), id:`${Date.now()}-${template.name}-${index}-${Math.random()}` })))); }
function makePlayer(character, isHuman = false) { return { name:character.name, role:character.role, character, isHuman, hp:10, deck:makeDeck(character), discard:[], hand:[], defenses:[], alive:true, protected:false, stats:{ cardsPlayed:0, damageDealt:0, damageTaken:0, damageBlocked:0, healing:0, shieldsRaised:0 } }; }
function log(message) { if(!els.log) return; const item = document.createElement('li'); item.textContent = message; els.log.prepend(item); }
function activePlayers() { return game.players.filter((player) => player.alive); }
function queueVisualEffect(player,kind,label='') {
  if(!game || !player) return;
  if(!Array.isArray(game.visualEffects)) game.visualEffects=[];
  const playerIndex=game.players.indexOf(player);
  if(playerIndex<0) return;
  game.visualEffects.push({id:`${game.matchId}-${Date.now()}-${Math.random()}`,playerIndex,kind,label:String(label),expiresAt:Date.now()+1800});
  if(game.visualEffects.length>32) game.visualEffects.splice(0,game.visualEffects.length-32);
}
function playVisualEffects() {
  if(!game?.visualEffects?.length) return;
  const localIndex=gameMode==='online' ? localPlayerIndex : 0;
  const icons={lightning:'⚡',blast:'💥',axe:'🪓',staff:'🪄',sword:'🗡️',daggers:'🗡️',slash:'⚔',shield:'🛡',block:'🛡',heal:'💚',draw:'🃏',discard:'🂠',swap:'⇄',shatter:'✦',steal:'⇣',ward:'◉',reclaim:'↶',extra:'⚡',knockout:'💫'};
  game.visualEffects.forEach((effect)=>{
    if(seenVisualEffectIds.has(effect.id)) return;
    seenVisualEffectIds.add(effect.id);
    if(Date.now()>effect.expiresAt) return;
    const target=effect.playerIndex===localIndex ? $('player-board') : document.querySelector(`.combatant[data-player-index="${effect.playerIndex}"]`);
    if(!target) return;
    playEffectSound(effect.kind);
    const burst=document.createElement('div'); burst.className=`combat-fx fx-${effect.kind}`; burst.setAttribute('aria-hidden','true');
    const mark=document.createElement('span'); mark.className='fx-mark'; mark.textContent=icons[effect.kind] || '✦'; burst.append(mark);
    if(effect.label) { const label=document.createElement('small'); label.textContent=effect.label; burst.append(label); }
    target.append(burst);
    scheduleGameAction(()=>burst.remove(),1450);
  });
}
function draw(player, count = 1) {
  const before=player.hand.length;
  for (let i=0;i<count;i++) {
    if (!player.deck.length && player.discard.length) { player.deck = shuffle(player.discard); player.discard = []; log(`${player.name} reshuffles their discard pile.`); }
    if (player.deck.length) player.hand.push(player.deck.pop());
  }
  const drawn=player.hand.length-before;
  if(drawn) queueVisualEffect(player,'draw',`+${drawn}`);
}
function refillLowHand(player) {
  if(player.hand.length>1 || !player.alive) return;
  const hadOne=player.hand.length===1;
  const before=player.hand.length;
  draw(player,2);
  const drawn=player.hand.length-before;
  if(drawn) log(`${player.name} ${hadOne?'has one card left':'has an empty hand'} and automatically draws ${drawn} card${drawn===1?'':'s'}.`);
}
function setStatus(text) { els.status.textContent = text; }
function updateHouseRuleLabel() { $('house-rules-state').textContent=$('house-rules-toggle').checked ? 'ON' : 'OFF'; }
function setSelectedCharacter(character) {
  selectedCharacter=character;
  document.querySelectorAll('.character-choice').forEach((button)=>button.classList.toggle('selected',button.dataset.character===character));
}
function syncRandomCharacterUi() {
  ['random-character-toggle','lobby-random-character-toggle'].forEach((id)=>{ const input=$(id); if(input) input.checked=randomCharacter; });
  $('random-character-state').textContent=randomCharacter?'ON':'OFF';
  $('lobby-random-character-state').textContent=randomCharacter?'ON':'OFF';
}
function setRandomCharacter(enabled) {
  randomCharacter=enabled;
  syncRandomCharacterUi();
  if(gameMode==='online' && onlineRoom && onlineRoom.hostId===socket?.id) {
    socket.emit('set-room-random-character',{code:onlineRoom.code,enabled},(result)=>{ if(!result.ok) $('lobby-page-status').textContent=result.error; });
  }
}
function playerAtTurn() { return game.players[game.current]; }
function canControlTurn() { return Boolean(game) && (gameMode === 'online' ? game.current === localPlayerIndex : playerAtTurn().isHuman); }
function syncOnlineGame() { if(gameMode==='online' && onlineRoom) socket.emit('sync-online-game',{code:onlineRoom.code,state:game}); }
function rollFirstPlayer(players) {
  const rolls=players.map(()=>0); let contenders=players.map((_,index)=>index); let winnerIndex=-1; let rounds=0;
  while(winnerIndex<0 && rounds<20) {
    rounds++;
    contenders.forEach((index)=>{ rolls[index]=Math.floor(Math.random()*6)+1; });
    const high=Math.max(...contenders.map((index)=>rolls[index]));
    const tied=contenders.filter((index)=>rolls[index]===high);
    if(tied.length===1) winnerIndex=tied[0]; else contenders=tied;
  }
  if(winnerIndex<0) winnerIndex=contenders[Math.floor(Math.random()*contenders.length)];
  return {rolls,winnerIndex,rounds};
}
function startGame() {
  els.winner.classList.add('hidden');
  lastAction = null; lastHitPlayer = null;
  seenPlayedCardId=null; profileMatchSaved=false; resultFeedbackMatchId=null;
  const houseRules = $('house-rules-toggle').checked;
  const randomizeCharacters=gameMode==='online' ? Boolean(onlineRoom?.randomCharacter) : randomCharacter;
  const rules = { houseRules, openingHand: houseRules, stackDamage: houseRules, oneCardRefill: houseRules, turnDraw: !houseRules, randomCharacter:randomizeCharacters };
  const chosen = characters.find((character)=>character.id===selectedCharacter);
  if(gameMode!=='online' && !randomizeCharacters && !chosen) { setStatus('Choose a character before starting the battle.'); return; }
  const opponents = shuffle(characters.filter((character)=>character.id!==selectedCharacter)).slice(0,selectedPlayers-1);
  const names=[...document.querySelectorAll('#name-fields input')].map((input,index)=>input.value.trim() || `Player ${index+1}`);
  if(gameMode==='online' && (!onlineRoom || onlinePlayers.filter((player)=>!player.left).length<2)) { setStatus('Create or join an online room before beginning.'); return; }
  if(gameMode==='online' && onlineRoom.hostId!==socket.id) { setStatus('Only the room host can begin the battle.'); return; }
  let roster=gameMode==='online' ? onlinePlayers.filter((entry)=>!entry.left) : [{name:names[0],character:chosen?.id},...opponents.map((character)=>({name:character.name,character:character.id}))];
  if(randomizeCharacters) {
    const randomRoster=shuffle(characters).slice(0,roster.length);
    roster=roster.map((entry,index)=>({...entry,character:randomRoster[index].id}));
  }
  if(gameMode==='online' && roster.length!==onlineRoom.limit) { setStatus('Every seat must be filled before starting.'); return; }
  if(gameMode==='online' && roster.some((player)=>!player.character)) { setStatus('Every player must choose a character before the battle can begin.'); return; }
  if(gameMode==='online' && roster.some((player)=>!player.ready)) { setStatus('Every player must press Ready before starting.'); return; }
  clearGameActions(); stopTurnTimer();
  const players=roster.map((entry,index)=>({ ...makePlayer(characters.find((character)=>character.id===entry.character), gameMode==='online' || index===0), name:entry.name, ...(entry.id ? {socketId:entry.id} : {}) }));
  const firstRoll=rollFirstPlayer(players);
  game = { matchId:crypto.randomUUID(), players, current:firstRoll.winnerIndex, firstRoll, firstRollEndsAt:Date.now()+2200, required:0, started:false, turn:1, finished:false, rules, pendingDamage:[], visualEffects:[], playHistory:[] };
  syncBackgroundMusic();
  seenVisualEffectIds.clear();
  seenFirstRollMatchId=null;
  if(gameMode==='online') localPlayerIndex=game.players.findIndex((player)=>player.socketId===socket.id);
  game.players.forEach((player) => draw(player,rules.openingHand ? 3 : 2));
  updateBattleControls();
  els.setup.classList.add('hidden'); els.battle.classList.remove('hidden'); if(els.log) els.log.innerHTML = '';
  window.scrollTo(0,0);
  log(`The dice decide who goes first. ${game.players[game.current].name} wins the roll and takes the first turn.`);
  log(houseRules ? 'House rules ON: no automatic draw at the start of a turn.' : 'House rules OFF: players draw 1 card at the start of a turn.');
  beginTurn();
  if(gameMode==='online') socket.emit('start-online-game',{code:onlineRoom.code,state:game},(result)=>{ if(!result.ok) { setStatus(result.error); } });
}
function beginTurn() {
  if (game.finished) return;
  let player = playerAtTurn();
  if (!player.alive) return nextTurn();
  startTurnTimer();
  if (player.protected) { player.protected=false; queueVisualEffect(player,'ward','FADED'); log(`${player.name}'s Clever Disguise fades.`); }
  if(game.rules.houseRules!==true) { draw(player,1); log(`${player.name} draws a card.`); }
  refillLowHand(player);
  game.required = 1; game.started = true;
  if(canControlTurn()) { setStatus(`${player.name}'s turn.`); els.message.textContent = `${player.name}, click a card or drag it to the center to play.`; render(); }
  else if(gameMode==='ai') { setStatus(`${player.name} is deciding…`); els.message.textContent = `${player.name} enters the arena.`; render(); scheduleGameAction(runAi,900); }
  else { setStatus(`${player.name}'s turn. Waiting for them to play.`); els.message.textContent='Your opponent is choosing a card.'; render(); }
}
function nextTurn() {
  if (checkWinner()) return;
  do { game.current = (game.current + 1) % game.players.length; } while (!playerAtTurn().alive);
  game.turn++; beginTurn(); syncOnlineGame();
}
function checkWinner() {
  const standing = activePlayers();
  if (standing.length > 1) return false;
  game.finished = true;
  stopTurnTimer();
  showResults(standing[0]);
  setStatus('Battle complete.'); return true;
}
function showResults(winner) {
  syncBackgroundMusic();
  if(resultFeedbackMatchId!==game.matchId) { resultFeedbackMatchId=game.matchId; const localWinner=gameMode==='online'?winner===game.players[localPlayerIndex]:Boolean(winner?.isHuman); gameFeedback(localWinner?'win':'lose'); }
  els.winner.classList.remove('hidden');
  $('winner-restart').classList.toggle('hidden',gameMode==='online');
  $('ready-next-button').classList.toggle('hidden',gameMode!=='online');
  $('ready-vote-status').classList.toggle('hidden',gameMode!=='online');
  $('leave-room-button').classList.remove('hidden');
  $('leave-room-button').textContent=gameMode==='online' ? 'Leave match' : 'Leave battle';
  els.winnerTitle.textContent = winner?.isHuman ? 'Victory!' : `${winner?.name || 'Nobody'} wins`;
  els.winnerText.textContent = winner?.isHuman ? 'You are the last fighter standing.' : 'The arena falls silent. Start another battle and claim the crown.';
  els.winnerStats.innerHTML = game.players.slice().sort((left,right)=>Number(right===winner)-Number(left===winner) || right.stats.damageDealt-left.stats.damageDealt).map((player)=>`<article class="result-row ${player===winner?'winner':''}"><div><strong>${player===winner?'♛ ':''}${player.name}</strong><small>${player.role} · ${player.alive ? `${player.hp} HP left` : 'Knocked out'}</small></div><dl><div><dt>Damage</dt><dd>${player.stats.damageDealt}</dd></div><div><dt>Taken</dt><dd>${player.stats.damageTaken}</dd></div><div><dt>Blocked</dt><dd>${player.stats.damageBlocked}</dd></div><div><dt>Healed</dt><dd>${player.stats.healing}</dd></div><div><dt>Shields</dt><dd>${player.stats.shieldsRaised}</dd></div><div><dt>Cards</dt><dd>${player.stats.cardsPlayed}</dd></div></dl></article>`).join('');
  renderRematchVoteStatus();
  if(currentAccount && !profileMatchSaved) {
    profileMatchSaved=true;
    const local=gameMode==='online' ? game.players[localPlayerIndex] : game.players[0];
    fetch('/api/profile/match',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({matchId:game.matchId,won:local===winner,character:local.character.id})})
      .then((response)=>response.ok ? response.json() : null).then((result)=>{ if(result && currentAccount) { currentAccount.profile=result.profile; renderProfile(); } }).catch(()=>{});
  }
}
function renderRematchVoteStatus() {
  if(gameMode!=='online') return;
  const active=onlinePlayers.filter((player)=>!player.left);
  const votes=onlineRematchVotes.filter((id)=>active.some((player)=>player.id===id));
  const alreadyVoted=votes.includes(socket?.id);
  $('ready-vote-status').textContent=votes.length===active.length && active.length ? 'Everyone is ready. Starting the next battle…' : `${votes.length} of ${active.length} players are ready to play again.`;
  const button=$('ready-next-button');
  button.disabled=alreadyVoted;
  button.textContent=alreadyVoted?'Ready ✓':'Ready for next round';
}
function damage(target, amount, attacker) {
  if (target.protected && target !== attacker) { queueVisualEffect(target,'ward','BLOCKED'); log(`${target.name}'s disguise ignores ${attacker.name}'s card effect.`); return; }
  let remaining = amount;
  for (const defense of [...target.defenses]) {
    if (!remaining) break;
    const blocked = Math.min(defense.shield,remaining); defense.shield -= blocked; remaining -= blocked; target.stats.damageBlocked += blocked;
    if (!defense.shield) { target.defenses.splice(target.defenses.indexOf(defense),1); target.discard.push(defense); log(`${target.name}'s ${defense.name} breaks.`); }
  }
  if (remaining) { target.hp = Math.max(0,target.hp-remaining); target.stats.damageTaken += remaining; attacker.stats.damageDealt += remaining; log(`${attacker.name} deals ${remaining} damage to ${target.name}.`); }
  if (amount-remaining>0) queueVisualEffect(target,'block',`−${amount-remaining}`);
  if (!remaining) log(`${target.name}'s defenses absorb ${amount} damage.`);
  if (remaining) { lastHitPlayer=target; scheduleGameAction(()=>{ lastHitPlayer=null; render(); },600); }
  if (target.hp === 0) { target.alive=false; target.hand=[]; queueVisualEffect(target,'knockout','KNOCKED OUT'); log(`${target.name} is knocked out!`); }
}
function queueDamage(target, amount, attacker) {
  game.pendingDamage.push({ target, amount, attacker });
  const total = game.pendingDamage.filter((hit) => hit.target === target).reduce((sum,hit) => sum + hit.amount, 0);
  log(`${attacker.name} adds ${amount} damage to ${target.name}'s chain (${total} total).`);
}
function resolvePendingDamage() {
  const hits = game.pendingDamage;
  game.pendingDamage = [];
  hits.forEach(({ target, amount, attacker }) => { if (target.alive) damage(target, amount, attacker); });
}
function effectSymbols(card) { const result=[]; if(card.damage) result.push(`${card.area?'☄':'⚔'} ${card.damage}${card.areaSelf?' all':''}`); if(card.shield) result.push(`🛡 ${card.shield}`); if(card.heal) result.push(`♥ ${card.heal}`); if(card.healPerOpponent) result.push('♥ × foes'); if(card.draw) result.push(`▣ ${card.draw}`); if(card.again) result.push(`⚡ ${card.again}`); if(card.swap) result.push('⇄ HP'); if(card.destroyDefense) result.push('✦ break'); if(card.destroyAllDefense) result.push('✦ all break'); if(card.stealDefense) result.push('⇣ shield'); if(card.discardTarget) result.push('✕ discard'); if(card.discardHandDraw) result.push(`↻ ${card.discardHandDraw}`); if(card.reclaim) result.push('↶ reclaim'); if(card.protected) result.push('◉ ward'); if(card.stealTop) result.push('⇣ card'); return result.join('  '); }
function cardActionSymbols(card) { const result=[]; if(card.damage) result.push(card.area?'☄':'⚔'); if(card.shield) result.push('🛡'); if(card.heal || card.healPerOpponent) result.push('♥'); if(card.again) result.push('⚡'); if(card.draw) result.push('🃏'); if(card.swap || card.destroyDefense || card.destroyAllDefense || card.stealDefense || card.discardTarget || card.discardHandDraw || card.reclaim || card.protected || card.stealTop) result.push('✦'); return result.join(' ') || '✦'; }
function effectRows(card) { const rows=[]; if(card.damage) rows.push(`<span><b>${card.area?'☄':'⚔'}</b>${card.area ? `Deal ${card.damage} to ${card.areaSelf?'every player':'each opponent'}` : `Deal ${card.damage} damage`}</span>`); if(card.shield) rows.push(`<span><b>🛡</b>Block ${card.shield} damage</span>`); if(card.heal) rows.push(`<span><b>♥</b>Recover ${card.heal} HP</span>`); if(card.healPerOpponent) rows.push('<span><b>♥</b>Recover 1 HP per opponent</span>'); if(card.draw) rows.push(`<span><b>▣</b>Draw ${card.draw} card${card.draw>1?'s':''}</span>`); if(card.again) rows.push(`<span><b>⚡</b>Play ${card.again===1?'an extra card':`${card.again} extra cards`}</span>`); if(card.swap) rows.push('<span class="mighty"><b>✦</b>Swap HP with an opponent</span>'); if(card.destroyDefense) rows.push('<span class="mighty"><b>✦</b>Destroy an active defense</span>'); if(card.destroyAllDefense) rows.push('<span class="mighty"><b>✦</b>Destroy every defense</span>'); if(card.stealDefense) rows.push('<span class="mighty"><b>⇣</b>Take an active defense</span>'); if(card.discardTarget) rows.push('<span class="mighty"><b>✕</b>Target discards a card</span>'); if(card.discardHandDraw) rows.push(`<span class="mighty"><b>↻</b>All discard, then draw ${card.discardHandDraw}</span>`); if(card.reclaim) rows.push('<span class="mighty"><b>↶</b>Choose a discard to return</span>'); if(card.protected) rows.push('<span class="mighty"><b>◉</b>Ignore effects until next turn</span>'); if(card.stealTop) rows.push('<span class="mighty"><b>⇣</b>Take and play their top card</span>'); return rows.join(''); }
function damageEffectKind(card, attacker) {
  const weapon=attacker?.character?.weapon;
  if (weapon==='axe') return 'axe';
  if (/lightning|bolt|thunder|storm/i.test(card.name)) return 'lightning';
  if (weapon==='staff') return 'staff';
  if (weapon==='sword') return 'sword';
  if (weapon==='daggers') return 'daggers';
  return card.area ? 'blast' : 'slash';
}
function playCard(actor, card, target=null, reclaimChoice=null) {
  if(Date.now() < (game.revealUntil || 0)) return;
  const clicked=document.querySelector(`.card[data-card-id="${card.id}"]`); if(clicked) clicked.classList.add('played');
  game.lastPlayedCard={id:`${game.matchId}-${actor.stats.cardsPlayed+1}-${Date.now()}`,name:card.name,owner:actor.name,ownerCharacter:actor.character.id,role:card.role,type:card.type,symbol:effectSymbols(card),text:card.text,artImage:cardArtworkPath(card),art:card.area?'☄':card.swap?'⇄':card.shield?'🛡':card.heal?'♥':card.damage?'⚔':'✦'};
  if(!Array.isArray(game.playHistory)) game.playHistory=[];
  game.playHistory.push({...game.lastPlayedCard});
  if(game.playHistory.length>40) game.playHistory.splice(0,game.playHistory.length-40);
  game.revealUntil=Date.now()+1700;
  actor.stats.cardsPlayed++;
  if(card.damage) lastAction={actor,card,target,area:card.area};
  else if(target && (card.swap || card.destroyDefense || card.stealDefense || card.discardTarget || card.stealTop)) lastAction={actor,card,target,area:false};
  else lastAction={actor,card,target:null,area:false};
  actor.hand.splice(actor.hand.indexOf(card),1); game.required = Math.max(0,game.required-1) + (card.again || 0);
  const reclaimCandidate = card.reclaim ? (reclaimChoice || actor.discard.at(-1)) : null;
  const dealDamage = (recipient) => {
    queueVisualEffect(recipient,damageEffectKind(card,actor),`−${card.damage}`);
    if (game.rules.stackDamage) queueDamage(recipient,card.damage,actor);
    else damage(recipient,card.damage,actor);
  };
  if (card.healPerOpponent) {
    const oldHp=actor.hp; actor.hp=Math.min(10,actor.hp+activePlayers().filter((player)=>player!==actor).length);
    actor.stats.healing += actor.hp-oldHp;
    if(actor.hp>oldHp) queueVisualEffect(actor,'heal',`+${actor.hp-oldHp}`);
    log(`${actor.name} recovers ${actor.hp-oldHp} HP from Whirling Axes.`);
  }
  if (card.damage && card.area) {
    activePlayers().filter((player)=>card.areaSelf || player!==actor).forEach(dealDamage);
  } else if (card.damage && target) {
    dealDamage(target);
  }
  if (card.swap && target && !target.protected) {
    [actor.hp,target.hp] = [target.hp,actor.hp];
    queueVisualEffect(actor,'swap'); queueVisualEffect(target,'swap');
    log(`${actor.name} swaps HP totals with ${target.name}.`);
  }
  if (card.destroyDefense && target && !target.protected && target.defenses.length) {
    const defense = target.defenses.pop(); target.discard.push(defense);
    queueVisualEffect(target,'shatter',`−${defense.shield}`);
    log(`${actor.name} destroys ${target.name}'s ${defense.name}.`);
  }
  if (card.destroyAllDefense) {
    let destroyed=0;
    game.players.forEach((player)=>{ let playerDestroyed=0; while(player.defenses.length) { player.discard.push(player.defenses.pop()); destroyed++; playerDestroyed++; } if(playerDestroyed) queueVisualEffect(player,'shatter',`−${playerDestroyed}`); });
    log(`${actor.name} banishes ${destroyed || 'no'} active defense${destroyed===1?'':'s'}.`);
  }
  if (card.stealDefense && target && !target.protected && target.defenses.length) {
    const defense=target.defenses.pop(); actor.defenses.push(defense);
    queueVisualEffect(target,'steal'); queueVisualEffect(actor,'shield',`+${defense.shield}`);
    log(`${actor.name} takes ${target.name}'s ${defense.name}.`);
  }
  if (card.discardTarget && target && !target.protected && target.hand.length) {
    const discarded = target.hand.splice(Math.floor(Math.random()*target.hand.length),1)[0]; target.discard.push(discarded);
    queueVisualEffect(target,'discard');
    log(`${target.name} discards ${discarded.name}.`);
  }
  if (card.discardHandDraw) {
    activePlayers().forEach((player)=>{ if(player.hand.length) queueVisualEffect(player,'discard'); player.discard.push(...player.hand.splice(0)); draw(player,card.discardHandDraw); });
    log(`Battle Roar makes every player discard their hand and draw ${card.discardHandDraw}.`);
  }
  if (card.shield) { actor.defenses.push({ ...card }); actor.stats.shieldsRaised += card.shield; queueVisualEffect(actor,'shield',`+${card.shield}`); log(`${actor.name} raises ${card.name} (${card.shield} shields).`); }
  else { actor.discard.push(card); }
  if (card.heal) { const oldHp=actor.hp; actor.hp=Math.min(10,actor.hp+card.heal); actor.stats.healing += actor.hp-oldHp; if(actor.hp>oldHp) queueVisualEffect(actor,'heal',`+${actor.hp-oldHp}`); log(`${actor.name} recovers ${actor.hp-oldHp} HP.`); }
  if (card.draw) { draw(actor,card.draw); log(`${actor.name} draws ${card.draw} card${card.draw>1?'s':''}.`); }
  if (reclaimCandidate) { actor.discard.splice(actor.discard.lastIndexOf(reclaimCandidate),1); actor.hand.push(reclaimCandidate); queueVisualEffect(actor,'reclaim',reclaimCandidate.name); log(`${actor.name} returns ${reclaimCandidate.name} from the discard pile.`); }
  if (card.protected) { actor.protected=true; queueVisualEffect(actor,'ward'); log(`${actor.name} is protected until their next turn.`); }
  if (card.again) queueVisualEffect(actor,'extra',`+${card.again}`);
  if (card.stealTop && target && !target.protected) {
    if (!target.deck.length && target.discard.length) { target.deck=shuffle(target.discard); target.discard=[]; }
    const stolen=target.deck.pop();
    if (stolen) { actor.hand.push(stolen); game.required=Math.max(1,game.required); queueVisualEffect(target,'discard'); queueVisualEffect(actor,'steal',stolen.name); log(`${actor.name} takes ${stolen.name} from ${target.name}'s deck and may play it this turn.`); }
    else log(`${target.name}'s deck has no card to steal.`);
  }
  activePlayers().forEach(refillLowHand);
  if (game.rules.stackDamage && game.required===0 && game.pendingDamage.length) resolvePendingDamage();
  if (checkWinner()) { render(); syncOnlineGame(); return; }
  render();
  syncOnlineGame();
  if (actor.isHuman) {
    if (game.required === 0) { setStatus('Your turn is complete.'); els.message.textContent='Showing the played card…'; scheduleGameAction(nextTurn,1750); }
    else { setStatus(`Play ${game.required} more card${game.required>1?'s':''}.`); els.message.textContent='Showing the played card…'; }
  }
}
function chooseTarget(card) {
  const choices = activePlayers().filter((player)=>player !== playerAtTurn());
  if (!choices.length) return; pendingCard=card; els.targetTitle.textContent = `${card.name} — choose an opponent`; els.targetOptions.innerHTML='';
  choices.forEach((player)=>{ const button=document.createElement('button'); button.type='button'; button.textContent=`${player.name} · ${player.hp} HP${player.defenses.length?` · ${player.defenses.reduce((sum,d)=>sum+d.shield,0)} shield`:''}`; button.onclick=()=>{ els.target.classList.add('hidden'); const actor=playerAtTurn(); playCard(actor,pendingCard,player); pendingCard=null; }; els.targetOptions.append(button); });
  els.target.classList.remove('hidden');
}
function chooseReclaim(card) {
  const actor=playerAtTurn(); const choices=[...actor.discard].reverse();
  if (!choices.length) return playCard(actor,card);
  pendingCard=card; els.targetTitle.textContent=`${card.name} — choose a discarded card`;
  els.targetOptions.innerHTML='';
  choices.forEach((discarded)=>{ const button=document.createElement('button'); button.type='button'; button.className=`reclaim-option ${discarded.owner}`; const preview=document.createElement('span'); preview.className='reclaim-card-preview'; const image=cardArtworkPath(discarded); if(image) { const artwork=document.createElement('img'); artwork.src=image; artwork.alt=''; preview.append(artwork); } else { const portrait=document.createElement('img'); portrait.src=`/assets/face-${discarded.owner || actor.character.id}.png`; portrait.alt=''; preview.append(portrait); } const details=document.createElement('span'); details.className='reclaim-card-details'; const name=document.createElement('strong'); name.textContent=discarded.name; const effect=document.createElement('small'); effect.textContent=cardText(discarded) || 'No special effect.'; details.append(name,effect); button.append(preview,details); button.onclick=()=>{ els.target.classList.add('hidden'); playCard(playerAtTurn(),pendingCard,null,discarded); pendingCard=null; }; els.targetOptions.append(button); });
  els.target.classList.remove('hidden');
}
function humanPlay(card) { if(game.finished || !canControlTurn() || game.required===0 || Date.now()<(game.revealUntil||0) || Date.now()<(game.firstRollEndsAt||0)) return; $('dice-roll-display').classList.add('hidden'); if(card.reclaim) chooseReclaim(card); else if((card.damage && !card.area) || card.swap || card.destroyDefense || card.stealDefense || card.discardTarget || card.stealTop) chooseTarget(card); else playCard(playerAtTurn(),card); }
function runAi() {
  if(game.finished) return; const actor=playerAtTurn(); if(actor.isHuman) return;
  if(Date.now()<(game.firstRollEndsAt||0)) return scheduleGameAction(runAi,game.firstRollEndsAt-Date.now()+20);
  const enemies=activePlayers().filter((player)=>player!==actor);
  const pick = () => {
    const defense=actor.hand.find((card)=>card.shield && actor.defenses.reduce((sum,d)=>sum+d.shield,0)<2);
    const heal=actor.hand.find((card)=>card.heal && actor.hp<=6);
    const attacks=actor.hand.filter((card)=>card.damage);
    const attack=attacks.length ? attacks[Math.floor(Math.random()*attacks.length)] : null;
    return defense || heal || attack || actor.hand[0];
  };
  const card=pick(); if(!card) { draw(actor,2); game.required=0; return scheduleGameAction(nextTurn,450); }
  const needsTarget=(card.damage && !card.area) || card.swap || card.destroyDefense || card.stealDefense || card.discardTarget || card.stealTop;
  const target=needsTarget && enemies.length ? enemies[Math.floor(Math.random()*enemies.length)] : null;
  const reclaim=card.reclaim && actor.discard.length ? actor.discard[Math.floor(Math.random()*actor.discard.length)] : null;
  els.message.textContent=`${actor.name} plays ${card.name}.`; playCard(actor,card,target,reclaim);
  if(!game.finished && game.required>0) scheduleGameAction(runAi,1750);
  else if(!game.finished) scheduleGameAction(nextTurn,1750);
}
function renderFirstRoll() {
  const holder=$('dice-roll-display');
  if(!game?.firstRoll || Date.now()>=(game.firstRollEndsAt || 0)) { holder.classList.add('hidden'); holder.classList.remove('rolling'); return; }
  if(seenFirstRollMatchId===game.matchId) return;
  seenFirstRollMatchId=game.matchId;
  holder.innerHTML='';
  const heading=document.createElement('strong'); heading.className='dice-roll-heading'; heading.textContent='🎲 First turn roll'; holder.append(heading);
  const die=document.createElement('b'); die.className='die-face'; die.textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][game.firstRoll.rolls[game.firstRoll.winnerIndex]-1] || '🎲'; holder.append(die);
  const winner=document.createElement('small'); winner.className='dice-roll-winner'; winner.textContent=`${game.players[game.firstRoll.winnerIndex].name} goes first${game.firstRoll.rounds>1?' · tied dice rerolled':''}`; holder.append(winner);
  holder.classList.remove('hidden'); holder.classList.add('rolling');
  scheduleGameAction(()=>holder.classList.remove('rolling'),2000);
  scheduleGameAction(()=>{ if(game?.matchId===seenFirstRollMatchId) { holder.classList.add('hidden'); holder.classList.remove('rolling'); } },Math.max(0,(game.firstRollEndsAt||Date.now())-Date.now()));
}
function renderPlayedHistory() {
  const rail=$('played-history-list');
  if(!rail) return;
  rail.replaceChildren();
  const history=(game.playHistory || []).slice(-4).reverse();
  if(!history.length) { const empty=document.createElement('small'); empty.textContent='No cards yet'; rail.append(empty); return; }
  history.forEach((played)=>{
    const item=document.createElement('article'); item.className=`played-history-card ${played.ownerCharacter || ''} ${played.type || ''}`; item.title=`${played.owner}: ${played.name}`;
    const art=document.createElement('div'); art.className='played-history-art';
    const image=document.createElement('img'); image.src=played.artImage || `/assets/face-${played.ownerCharacter || 'sutha'}.png`; image.alt=''; art.append(image);
    const details=document.createElement('span'); details.className='played-history-details';
    const name=document.createElement('b'); name.textContent=played.name;
    const owner=document.createElement('small'); owner.textContent=played.owner;
    details.append(name,owner); item.append(art,details); rail.append(item);
  });
}
function render() {
  if(!game) return;
  renderFirstRoll();
  renderPlayedHistory();
  const human=gameMode==='online' ? game.players[localPlayerIndex] : game.players[0];
  els.opponents.innerHTML='';
  game.players.filter((player)=>player!==human).forEach((player)=>{ const shields=player.defenses.reduce((sum,card)=>sum+card.shield,0); const node=document.createElement('article'); node.className=`combatant ${player.character.id} ${!player.alive?'out':''} ${player===playerAtTurn()?'active':''} ${player===lastHitPlayer?'hit':''}`; node.dataset.playerIndex=game.players.indexOf(player); node.innerHTML=`<h3>${player.name} <small>· ${player.role}</small></h3><div class="mini-info"><span>${player.alive?`${player.hp} HP`:'Knocked out'}</span><span>${player.hand.length} cards</span></div><div class="healthbar"><span style="width:${player.hp*10}%"></span></div>${shields?`<div class="mini-defense">🛡 ${shields} shield</div>`:''}${player.protected?'<div class="mini-defense">◉ protected</div>':''}`; els.opponents.append(node); });
  els.playerName.innerHTML=`${human.name} <span class="hp">${human.hp} HP</span>`; els.playerDeck.textContent=`Deck ${human.deck.length}`; els.playerDiscard.textContent=`Discard ${human.discard.length}`; els.deckCount.textContent=`${human.deck.length} cards`; els.discardCount.textContent=`${human.discard.length} cards`; const last=human.discard.at(-1); els.discardPreview.textContent=last ? effectSymbols(last).split(' ')[0] : '?';
  els.playerDefense.innerHTML=(human.defenses.length ? human.defenses.map((card)=>`<span class="defense-token">🛡 ${card.name}: ${card.shield}</span>`).join('') : '<span class="defense-token">No active defenses</span>') + (human.protected ? '<span class="defense-token">◉ Protected until your next turn</span>' : '');
  const stacked = game.pendingDamage.reduce((sum,hit)=>sum+hit.amount,0);
  els.actions.textContent = game.finished ? 'Cards to play: —' : `Cards to play: ${game.required}${stacked ? ` · Stacked damage: ${stacked}` : ''}`;
  const banner=$('action-banner');
  if(lastAction) { const targetText=lastAction.area ? (lastAction.card.areaSelf ? 'every player' : 'all opponents') : (lastAction.target ? lastAction.target.name : 'their board'); banner.innerHTML=`<span>${lastAction.card.damage?'⚔':'✦'}</span><strong>${lastAction.actor.name} used ${lastAction.card.name}${lastAction.card.damage || lastAction.target ? ` → ${targetText}` : ''}</strong>`; banner.classList.remove('attack'); void banner.offsetWidth; banner.classList.add('attack'); }
  else banner.innerHTML='<span>⚔</span><strong>Waiting for the next move</strong>';
  const stage=$('played-card-stage'), played=game.lastPlayedCard;
  const revealActive=Boolean(played && Date.now()<(game.revealUntil || 0));
  if(revealActive) {
    if(!stage.querySelector(`[data-reveal-id="${CSS.escape(played.id)}"]`)) {
      stage.innerHTML='';
      const reveal=document.createElement('article'); reveal.className=`reveal-card ${played.role.toLowerCase()}`; reveal.dataset.revealId=played.id;
      const topline=document.createElement('div'); topline.className='reveal-topline'; topline.textContent=`${played.owner} · ${played.role}`;
      const title=document.createElement('strong'); title.textContent=played.name;
      const art=document.createElement('div'); art.className='reveal-art has-face'; const portrait=characters.find((character)=>character.id===played.ownerCharacter); const face=document.createElement('img'); face.className='reveal-character-face'; face.src=played.artImage || `/assets/face-${portrait?.id || 'sutha'}.png`; face.alt=played.artImage ? `${played.name} artwork` : `${portrait?.name || 'Character'} portrait`; const effect=document.createElement('span'); effect.className='reveal-effect-icon'; effect.textContent=played.art; art.append(face,effect);
      const details=document.createElement('small'); details.textContent=played.text || played.symbol;
      reveal.append(topline,title,art,details); stage.append(reveal);
    }
    if(seenPlayedCardId!==played.id) { seenPlayedCardId=played.id; if(played.art==='⚔'||played.art==='☄') vibrateGame('attack'); else playGameSound('card'); stage.classList.remove('active'); void stage.offsetWidth; stage.classList.add('active'); scheduleGameAction(()=>{ if(seenPlayedCardId===played.id) stage.classList.remove('active'); },1900); }
    scheduleGameAction(()=>{ if(game?.lastPlayedCard?.id===played.id) { stage.innerHTML=''; stage.classList.remove('active'); } },Math.max(0,game.revealUntil-Date.now()));
  } else { stage.innerHTML=''; stage.classList.remove('active'); }
  els.hand.innerHTML=''; human.hand.forEach((card)=>{ const button=document.createElement('button'); button.type='button'; button.dataset.cardId=card.id; button.className=`card ${card.owner} ${card.type} ${canControlTurn() && game.required>0?'playable':''}`; button.disabled=!canControlTurn() || game.required===0 || game.finished || Date.now()<(game.revealUntil||0) || Date.now()<(game.firstRollEndsAt||0); button.draggable=!button.disabled; button.addEventListener('dragstart',(event)=>{ if(button.disabled){event.preventDefault();return;} event.dataTransfer.effectAllowed='move'; event.dataTransfer.setData('text/plain',card.id); $('played-card-stage').classList.add('drop-ready'); }); button.addEventListener('dragend',()=>$('played-card-stage').classList.remove('drop-ready')); const image=cardArtworkPath(card); button.innerHTML=`<div class="card-topline"><span class="card-symbols">${cardActionSymbols(card)}</span><span class="card-faction"><b>${card.type}</b><small>${card.role}</small></span></div><div class="card-art ${card.owner}" aria-hidden="true">${image?`<img class="card-illustration" src="${image}" alt="">`:'<i class="card-character-face"></i>'}<span class="card-effect-icon">${card.area?'☄':card.swap?'⇄':card.shield?'🛡':card.heal?'♥':card.damage?'⚔':'✦'}</span></div><div class="card-nameplate"><h3>${card.name}</h3></div><div class="card-text-panel">${card.mighty?'<strong class="card-power-label">✦ MIGHTY POWER</strong>':''}<div class="card-effects">${effectRows(card)}</div></div>`; button.onclick=()=>humanPlay(card); els.hand.append(button); });
  playVisualEffects();
  if(played && Date.now()<(game.revealUntil||0) && canControlTurn() && game.required>0) scheduleGameAction(()=>{ if(game && !game.finished) render(); },Math.max(0,game.revealUntil-Date.now()));
}
function renderCardLibrary() {
  $('library-decks').innerHTML = characters.map((character) => `<section class="library-deck ${character.id}"><h3>${character.name} <small>${character.role}</small></h3><div class="library-cards">${character.cards.map((template) => { const card={...template,owner:character.id,role:character.role}; const image=cardArtworkPath(card); return `<article class="card library-card ${character.id} ${card.type}" aria-label="${card.name}, ${cardText(card)}"><div class="card-topline"><span class="card-symbols">${cardActionSymbols(card)}</span><span class="card-faction"><b>${card.type}</b><small>${card.role}</small></span></div><div class="card-art ${character.id}" aria-hidden="true">${image?`<img class="card-illustration" src="${image}" alt="">`:'<i class="card-character-face"></i>'}<span class="card-effect-icon">${card.area?'☄':card.swap?'⇄':card.shield?'🛡':card.heal?'♥':card.damage?'⚔':'✦'}</span></div><div class="card-nameplate"><h3>${card.name}</h3></div><div class="card-text-panel">${card.mighty?'<strong class="card-power-label">✦ MIGHTY POWER</strong>':''}<div class="card-effects">${effectRows(card)}</div></div><div class="card-footer"><span>×${card.count} in deck</span><b>${card.type.toUpperCase()}</b></div></article>`; }).join('')}</div></section>`).join('');
}
document.querySelectorAll('.player-count').forEach((button)=>button.addEventListener('click',()=>{ selectedPlayers=Number(button.dataset.players); document.querySelectorAll('.player-count').forEach((other)=>other.classList.toggle('selected',other===button)); renderNameFields(); }));
document.querySelectorAll('.character-choice').forEach((button)=>button.addEventListener('click',()=>{ const character=button.dataset.character; if(gameMode==='online' && onlineRoom) { socket.emit('change-character',{code:onlineRoom.code,character},(result)=>{ if(!result.ok) $('lobby-page-status').textContent=result.error; }); return; } setSelectedCharacter(character); }));
function playerIdentity() { return currentAccount?.username || $('player-name-0')?.value.trim() || 'Player'; }
function leaveOnlineMatch() {
  if(gameMode!=='online' || !onlineRoom || !socket) return;
  const code=onlineRoom.code;
  socket.emit('leave-room',{code});
  stopCurrentGame();
  onlineRoom=null; onlinePlayers=[];
  updateBattleControls();
  $('online-lobby').classList.remove('hidden');
  setStatus('You left the online match.');
}
function renderOnlineLobby(room) {
  onlineRoom={code:room.code,hostId:room.hostId,limit:room.limit,randomCharacter:Boolean(room.randomCharacter)}; onlinePlayers=room.players;
  randomCharacter=onlineRoom.randomCharacter;
  syncRandomCharacterUi();
  updateBattleControls();
  const self=room.players.find((player)=>player.id===socket.id); if(self) setSelectedCharacter(self.character || null);
  const owners=new Map(room.players.filter((player)=>player.character && !player.left).map((player)=>[player.character,player]));
  document.querySelectorAll('#lobby-character-grid .character-choice').forEach((button)=>{ const owner=owners.get(button.dataset.character); const unavailable=Boolean(owner && owner.id!==socket.id); button.disabled=Boolean(room.randomCharacter) || unavailable; button.title=room.randomCharacter?'Characters are assigned randomly by the house rule.':owner?`Picked by ${owner.name}${owner.id===socket.id?' (you)':''}`:''; button.classList.toggle('selected',button.dataset.character===selectedCharacter); let badge=button.querySelector('.claimed-by'); if(!badge) { badge=document.createElement('small'); badge.className='claimed-by'; button.querySelector('span:last-child').append(badge); } badge.textContent=owner?`Picked by ${owner.name}${owner.id===socket.id?' (you)':''}`:''; badge.classList.toggle('hidden',!owner || Boolean(room.randomCharacter)); });
  const host=room.hostId===socket.id; const active=room.players.filter((player)=>!player.left); const charactersReady=active.length===room.limit && (room.randomCharacter || (active.every((player)=>player.character) && new Set(active.map((player)=>player.character)).size===active.length)); const allReady=charactersReady && active.every((player)=>player.ready); const randomRule=$('lobby-random-character-toggle'); randomRule.disabled=!host; randomRule.title=host?'Set random characters for everyone in this room.':'Only the host can change room rules.'; const list=$('lobby-page-list'); list.innerHTML=''; room.players.forEach((player,index)=>{ const character=characters.find((item)=>item.id===player.character); const item=document.createElement('li'); const identity=document.createElement('span'); identity.textContent=`${index===0?'👑 ':''}${player.name}${player.id===socket.id?' (You)':''}`; const detail=document.createElement('span'); detail.className='lobby-player-detail'; const characterLabel=document.createElement('small'); characterLabel.textContent=character?.name || 'No character selected'; const readyLabel=document.createElement('small'); readyLabel.className=player.ready?'player-ready':'player-not-ready'; readyLabel.textContent=player.ready?'Ready':'Not ready'; detail.append(characterLabel,readyLabel); item.append(identity,detail); if(host && player.id!==socket.id){const kick=document.createElement('button');kick.type='button';kick.className='button ghost lobby-kick-button';kick.textContent='Kick';kick.setAttribute('aria-label',`Kick ${player.name}`);kick.onclick=()=>socket.emit('kick-player',{code:room.code,playerId:player.id},(result)=>{if(!result.ok)$('lobby-page-status').textContent=result.error;});item.append(kick);} list.append(item); }); for(let seat=active.length;seat<room.limit;seat++){const item=document.createElement('li');item.className='empty';item.textContent=`Open seat ${seat+1}`;list.append(item);}
  $('lobby-ready-button').classList.remove('hidden'); $('lobby-ready-button').disabled=!self?.character; $('lobby-ready-button').textContent=self?.ready?'Not ready':'Ready'; $('lobby-ready-button').classList.toggle('is-ready',Boolean(self?.ready)); $('lobby-ready-button').onclick=()=>socket.emit('set-ready',{code:room.code,ready:!self?.ready},(result)=>{if(!result.ok)$('lobby-page-status').textContent=result.error;});
  $('lobby-page-title').textContent=`Room ${room.code}`; $('lobby-page-count').textContent=`${active.length}/${room.limit}`; $('lobby-page-status').textContent=host ? `Share code ${room.code}. Fill every seat and wait for everyone to be ready.` : `You joined room ${room.code}. Choose a character and press Ready.`; $('lobby-start-button').classList.toggle('hidden',!host); $('lobby-start-button').disabled=!allReady; $('lobby-start-note').textContent=host ? (active.length<room.limit?'Every seat must be filled before the battle can start.':!charactersReady?'Every player must choose a different character.':!allReady?'Waiting for every player to press Ready.':'Everyone is ready. Start the battle!') : 'The host can start once every seat is filled and all players are ready.';
  els.setup.classList.add('hidden'); $('online-room-page').classList.remove('hidden');
}
function connectOnline() {
  if(socket) return;
  socket=io();
  socket.on('lobby-state',renderOnlineLobby);
  socket.on('kicked-from-room',()=>{ onlineRoom=null; onlinePlayers=[]; setSelectedCharacter(null); $('online-room-page').classList.add('hidden'); els.setup.classList.remove('hidden'); $('room-status').textContent='The host removed you from the room.'; updateBattleControls(); });
  socket.on('online-game-state',({state,players})=>{ const enteringBattle=els.battle.classList.contains('hidden'); if(game?.matchId!==state.matchId) { profileMatchSaved=false; seenPlayedCardId=null; resultFeedbackMatchId=null; seenVisualEffectIds.clear(); onlineRematchVotes=[]; } game=state; syncBackgroundMusic(); onlinePlayers=players; localPlayerIndex=game.players.findIndex((player)=>player.socketId===socket.id); updateBattleControls(); els.setup.classList.add('hidden'); $('online-room-page').classList.add('hidden'); els.battle.classList.remove('hidden'); if(enteringBattle) window.scrollTo(0,0); if(els.log) els.log.innerHTML=''; turnDeadline=game.turnEndsAt || Date.now()+TURN_LIMIT_SECONDS*1000; stopTurnTimer(); refreshTurnTimer(); timerInterval=window.setInterval(refreshTurnTimer,500); render(); if(game.finished) { stopTurnTimer(); showResults(activePlayers()[0]); setStatus('Battle complete.'); return; } const active=playerAtTurn(); setStatus(canControlTurn() ? `${active.name}'s turn.` : `${active.name}'s turn. Waiting for them to play.`); });
  socket.on('rematch-vote-state',({votes,players})=>{ onlineRematchVotes=votes; onlinePlayers=players; if(game?.finished) renderRematchVoteStatus(); });
  socket.on('rematch-ready',()=>{ if(gameMode==='online' && onlineRoom?.hostId===socket.id && game?.finished) startGame(); });
}
document.querySelectorAll('.mode-choice').forEach((button)=>button.addEventListener('click',()=>{ gameMode=button.dataset.mode; updateBattleControls(); document.querySelectorAll('.mode-choice').forEach((other)=>other.classList.toggle('selected',other===button)); const online=gameMode==='online'; $('online-lobby').classList.toggle('hidden',!online); $('battle-size-heading').textContent=online?'Choose online room size':'Choose the battle size'; if(online) connectOnline(); else { document.querySelectorAll('.character-choice,.player-count').forEach((control)=>{ control.disabled=false; control.title=''; }); } }));
$('create-room').onclick=()=>{ connectOnline(); socket.emit('create-room',{name:playerIdentity(),character:randomCharacter?'random':null,randomCharacter,limit:selectedPlayers},(result)=>{ if(!result.ok) $('room-status').textContent=result.error; else setSelectedCharacter(result.character || null); }); };
$('join-room').onclick=()=>{ connectOnline(); socket.emit('join-room',{code:$('room-code').value.trim(),name:playerIdentity(),character:null},(result)=>{ if(!result.ok) $('room-status').textContent=result.error; else setSelectedCharacter(result.character || null); }); };
$('random-character-toggle').addEventListener('change',(event)=>setRandomCharacter(event.target.checked));
$('lobby-random-character-toggle').addEventListener('change',(event)=>setRandomCharacter(event.target.checked));
$('ready-next-button').onclick=()=>{ if(gameMode==='online' && onlineRoom) socket.emit('rematch-vote',{code:onlineRoom.code},(result)=>{ if(!result.ok) $('ready-vote-status').textContent=result.error; }); };
$('start-button').onclick=startGame; $('lobby-start-button').onclick=startGame; $('restart-button').onclick=()=>{ if(gameMode==='online') return; stopCurrentGame(); }; $('leave-online-button').onclick=leaveOnlineMatch; $('leave-room-button').onclick=()=>{ if(gameMode==='online') leaveOnlineMatch(); else stopCurrentGame(); }; $('winner-restart').onclick=()=>{ els.winner.classList.add('hidden'); startGame(); }; $('rules-button').onclick=()=>$('rules-dialog').showModal(); $('close-rules').onclick=()=>$('rules-dialog').close(); $('cancel-target').onclick=()=>{ pendingCard=null; els.target.classList.add('hidden'); };
$('leave-battle-button').onclick=()=>{ if(gameMode==='online') leaveOnlineMatch(); else stopCurrentGame(); };
const navToggle=$('nav-toggle'),topbar=document.querySelector('.topbar');
function setNavOpen(open) { topbar.classList.toggle('nav-open',open); navToggle.setAttribute('aria-expanded',String(open)); navToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation'); }
navToggle.addEventListener('click',()=>setNavOpen(navToggle.getAttribute('aria-expanded')!=='true'));
$('topbar-actions').addEventListener('click',()=>setNavOpen(false));
document.addEventListener('keydown',(event)=>{ if(event.key==='Escape') setNavOpen(false); });
window.matchMedia('(min-width: 701px)').addEventListener('change',()=>setNavOpen(false));
const playDropZone=$('played-card-stage');
playDropZone.addEventListener('dragover',(event)=>{ if(canControlTurn() && game && !game.finished && game.required>0 && Date.now()>=(game.revealUntil||0)) { event.preventDefault(); event.dataTransfer.dropEffect='move'; playDropZone.classList.add('drag-over'); } });
playDropZone.addEventListener('dragleave',(event)=>{ if(!playDropZone.contains(event.relatedTarget)) playDropZone.classList.remove('drag-over'); });
playDropZone.addEventListener('drop',(event)=>{ event.preventDefault(); playDropZone.classList.remove('drag-over','drop-ready'); const cardId=event.dataTransfer.getData('text/plain'); const human=game && (gameMode==='online'?game.players[localPlayerIndex]:game.players[0]); const card=human?.hand.find((item)=>item.id===cardId); if(card) humanPlay(card); });
$('house-rules-toggle').addEventListener('change',updateHouseRuleLabel);
$('settings-button').onclick=()=>{ updateSettingsControls(); $('settings-dialog').showModal(); };
$('close-settings').onclick=()=>$('settings-dialog').close();
$('music-enabled').addEventListener('change',(event)=>{ musicEnabled=event.target.checked; saveUiPreference('mayhem-music',musicEnabled); if(musicEnabled) unlockGameAudio(); else stopBackgroundMusic(); updateSettingsControls(); });
$('sound-enabled').addEventListener('change',(event)=>{ soundEnabled=event.target.checked; saveUiPreference('mayhem-sound',soundEnabled); if(soundEnabled) { unlockGameAudio(); playGameSound('card'); $('sound-test-status').textContent=''; } updateSettingsControls(); });
$('vibration-enabled').addEventListener('change',(event)=>{ vibrationEnabled=event.target.checked; saveUiPreference('mayhem-vibration',vibrationEnabled); if(vibrationEnabled) { vibrateGame('card'); $('vibration-test-status').textContent='Haptic test sent.'; } else { try { navigator.vibrate?.(0); } catch {} $('vibration-test-status').textContent=''; } updateSettingsControls(); });
  $('music-volume').addEventListener('input',(event)=>{ musicVolume=Number(event.target.value)/100; saveUiPreference('mayhem-music-volume',musicVolume); updateSettingsControls(); if(activeMusicTrack) activeMusicTrack.volume=musicVolume; if(musicVolume===0) stopBackgroundMusic(); else if(musicEnabled) startBackgroundMusic(); });
$('effects-volume').addEventListener('input',(event)=>{ soundVolume=Number(event.target.value)/100; saveUiPreference('mayhem-sound-volume',soundVolume); updateSettingsControls(); });
$('test-sound').onclick=()=>{ unlockGameAudio(); if(!soundEnabled) { $('sound-test-status').textContent='Turn on game sound effects first.'; return; } playGameSound('attack'); $('sound-test-status').textContent='Sound test played.'; };
$('test-vibration').onclick=()=>{ if(!vibrationEnabled || typeof navigator.vibrate!=='function') return; try { const started=navigator.vibrate(120); $('vibration-test-status').textContent=started===false?'This device did not start vibration.':'Haptic test sent.'; } catch { $('vibration-test-status').textContent='Vibration is unavailable.'; } };
updateSettingsControls();
$('card-library-button').onclick=()=>{ renderCardLibrary(); $('card-library-dialog').showModal(); }; $('close-card-library').onclick=()=>$('card-library-dialog').close();
$('account-button').onclick=()=>{ if(currentAccount) { updateAccountUi(); $('account-dialog').showModal(); } else showAccountDialog('register'); };
$('close-account').onclick=()=>$('account-dialog').close();
$('account-mode').onclick=()=>showAccountDialog(accountMode==='register' ? 'login' : 'register');
$('account-form').onsubmit=async (event)=>{ event.preventDefault(); const username=$('account-username').value.trim(); const password=$('account-password').value; const error=$('account-error'); error.textContent=''; try { const response=await fetch(`/api/auth/${accountMode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})}); const result=await response.json(); if(!response.ok) throw new Error(result.error || 'Unable to sign in.'); currentAccount=result.user; $('account-password').value=''; $('account-dialog').close(); updateAccountUi(); } catch (issue) { error.textContent=issue.message; } };
$('logout-button').onclick=async ()=>{ await fetch('/api/auth/logout',{method:'POST'}); currentAccount=null; $('account-dialog').close(); updateAccountUi(); };
renderNameFields();
updateHouseRuleLabel();
loadAccount();
