const characters = [
  { id:'sutha', name:'Sutha the Skullcrusher', role:'Barbarian', cards:[
    {name:'Big Axe is Best Axe',type:'attack',count:5,damage:3},{name:'Two Axes are Better Than One',type:'trick',count:2,again:2},{name:'Whirling Axes',type:'mighty',count:2,damage:1,area:true,healPerOpponent:true,mighty:true},{name:'Mighty Toss',type:'mighty',count:2,destroyDefense:true,draw:1,mighty:true},{name:'Battle Roar',type:'mighty',count:2,discardHandDraw:3,again:1,mighty:true},{name:'Head Butt',type:'attack',count:2,damage:1,again:1},{name:'Brutal Punch',type:'attack',count:2,damage:2},{name:'Rage!',type:'attack',count:2,damage:4},{name:'Open the Armory',type:'trick',count:2,draw:2},{name:'Flex',type:'trick',count:2,heal:1,draw:1},{name:'Bag of Rats',type:'mighty',count:1,shield:1,draw:1,mighty:true},{name:'Spiked Shield',type:'defense',count:1,shield:2},{name:'Riff',type:'defense',count:1,shield:3},{name:'Raff',type:'defense',count:1,shield:3},{name:'Snack Time',type:'heal',count:1,draw:2,heal:1}
  ]},
  { id:'azzan', name:'Azzan the Mystic', role:'Wizard', cards:[
    {name:'Lightning Bolt',type:'attack',count:4,damage:3},{name:'Magic Missile',type:'attack',count:3,damage:1,again:1},{name:'Burning Hands',type:'attack',count:3,damage:2},{name:'Knowledge is Power',type:'trick',count:3,draw:3},{name:'Speed of Thought',type:'trick',count:3,again:2},{name:'Fireball',type:'mighty',count:2,damage:3,area:true,areaSelf:true,mighty:true},{name:'Charm',type:'mighty',count:2,stealDefense:true,mighty:true},{name:'Evil Sneer',type:'trick',count:2,heal:1,again:1},{name:'Vampiric Touch',type:'mighty',count:2,swap:true,mighty:true},{name:'Shield',type:'defense',count:2,shield:1,draw:1},{name:'Stoneskin',type:'defense',count:1,shield:2},{name:'Mirror Image',type:'defense',count:1,shield:3}
  ]},
  { id:'lia', name:'Lia the Radiant', role:'Paladin', cards:[
    {name:'For Even More Justice!',type:'attack',count:4,damage:2},{name:'For Justice!',type:'attack',count:3,damage:1,again:1},{name:'Fighting Words',type:'attack',count:3,damage:2,heal:1},{name:'For the Most Justice!',type:'attack',count:2,damage:3},{name:'Divine Smite',type:'attack',count:3,damage:3,heal:1},{name:'Divine Shield',type:'defense',count:2,shield:3},{name:'Spinning Parry',type:'defense',count:2,shield:1,draw:1},{name:'Finger Wag of Judgement',type:'trick',count:2,again:2},{name:'Divine Inspiration',type:'mighty',count:2,reclaim:true,heal:2,mighty:true},{name:'Cure Wounds',type:'heal',count:1,draw:2,heal:1},{name:'High Charisma',type:'trick',count:2,draw:2},{name:'Banishing Smite',type:'mighty',count:1,destroyAllDefense:true,mighty:true},{name:'Fluffy',type:'mighty',count:1,shield:2,mighty:true}
  ]},
  { id:'oriax', name:'Oriax the Clever', role:'Rogue', cards:[
    {name:'One Thrown Dagger',type:'attack',count:5,damage:1,again:1},{name:'Two Thrown Daggers',type:'attack',count:4,damage:2},{name:'All The Thrown Daggers',type:'attack',count:3,damage:3},{name:'Winged Serpent',type:'defense',count:2,shield:1,draw:1},{name:'The Goon Squad',type:'defense',count:2,shield:2},{name:'Sneak Attack!',type:'mighty',count:2,destroyDefense:true,again:1,mighty:true},{name:'Clever Disguise',type:'mighty',count:2,protected:true,mighty:true},{name:'Cunning Action',type:'trick',count:2,again:2},{name:'Stolen Potion',type:'heal',count:2,heal:1,again:1},{name:'Pick Pocket',type:'mighty',count:2,stealTop:true,mighty:true},{name:'Even More Daggers',type:'trick',count:1,draw:2,heal:1},{name:'My Little Friend',type:'defense',count:1,shield:1,draw:1,again:1}
  ]},
];
const $ = (id) => document.getElementById(id);
const els = { setup:$('setup-panel'), battle:$('battle-panel'), opponents:$('opponents'), hand:$('hand'), playerName:$('player-name'), playerHp:$('player-hp'), playerDefense:$('player-defense'), playerDeck:$('player-deck'), playerDiscard:$('player-discard'), deckCount:$('deck-count'), discardCount:$('discard-count'), discardPreview:$('discard-preview'), status:$('turn-status'), actions:$('action-counter'), message:$('battle-message'), log:$('game-log'), target:$('target-popover'), targetTitle:$('target-title'), targetOptions:$('target-options'), winner:$('winner-overlay'), winnerTitle:$('winner-title'), winnerText:$('winner-text') };
let selectedPlayers = 2;
let selectedCharacter = 'sutha';
let game = null;
let pendingCard = null;
let accountMode = 'register';
let currentAccount = null;
let gameMode = 'ai';
let socket = null;
let onlineRoom = null;
let onlinePlayers = [];
let localPlayerIndex = 0;

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
  if(currentAccount) renderNameFields();
}
async function loadAccount() {
  try { const response=await fetch('/api/auth/me'); const result=await response.json(); currentAccount=result.user; updateAccountUi(); } catch { updateAccountUi(); }
}
function showAccountDialog(mode='register') {
  accountMode=mode; $('account-error').textContent=''; $('account-title').textContent=mode==='register' ? 'Create your account' : 'Sign in'; $('account-submit').textContent=mode==='register' ? 'Create account' : 'Sign in'; $('account-mode').textContent=mode==='register' ? 'Already have an account? Sign in' : 'Need an account? Create one'; $('account-password').autocomplete=mode==='register' ? 'new-password' : 'current-password'; $('account-dialog').showModal();
}

function shuffle(list) { return [...list].sort(() => Math.random() - .5); }
function cardText(card) { const effects=[]; if(card.damage) effects.push(card.area ? `Deal ${card.damage} damage to ${card.areaSelf ? 'every player' : 'every opponent'}.` : `Deal ${card.damage} damage to one opponent.`); if(card.shield) effects.push(`Absorb ${card.shield} incoming damage.`); if(card.heal) effects.push(`Restore ${card.heal} HP.`); if(card.healPerOpponent) effects.push('Recover 1 HP for each opponent.'); if(card.draw) effects.push(`Draw ${card.draw} card${card.draw>1?'s':''}.`); if(card.again) effects.push(`Play ${card.again===1?'another card':`${card.again} more cards`}.`); if(card.swap) effects.push('Swap HP totals with an opponent.'); if(card.destroyDefense) effects.push('Destroy one of their defenses.'); if(card.destroyAllDefense) effects.push('Destroy every active defense.'); if(card.stealDefense) effects.push('Take one of their defenses.'); if(card.discardTarget) effects.push('Target discards a random card.'); if(card.discardHandDraw) effects.push(`Each player discards their hand and draws ${card.discardHandDraw}.`); if(card.reclaim) effects.push('Choose a discarded card and return it to your hand.'); if(card.protected) effects.push('Ignore opponents’ card effects until your next turn.'); if(card.stealTop) effects.push('Take the top card of an opponent’s deck and play it this turn.'); return effects.join(' '); }
function makeDeck(character) { return shuffle(character.cards.flatMap((template) => Array.from({length:template.count},(_,index) => ({ ...template, owner:character.id, role:character.role, text:cardText(template), id:`${Date.now()}-${template.name}-${index}-${Math.random()}` })))); }
function makePlayer(character, isHuman = false) { return { name:character.name, role:character.role, character, isHuman, hp:10, deck:makeDeck(character), discard:[], hand:[], defenses:[], alive:true, protected:false }; }
function log(message) { const item = document.createElement('li'); item.textContent = message; els.log.prepend(item); }
function activePlayers() { return game.players.filter((player) => player.alive); }
function draw(player, count = 1) {
  for (let i=0;i<count;i++) {
    if (!player.deck.length && player.discard.length) { player.deck = shuffle(player.discard); player.discard = []; log(`${player.name} reshuffles their discard pile.`); }
    if (player.deck.length) player.hand.push(player.deck.pop());
  }
}
function setStatus(text) { els.status.textContent = text; }
function playerAtTurn() { return game.players[game.current]; }
function canControlTurn() { return Boolean(game) && (gameMode === 'online' ? game.current === localPlayerIndex : playerAtTurn().isHuman); }
function syncOnlineGame() { if(gameMode==='online' && onlineRoom) socket.emit('sync-online-game',{code:onlineRoom.code,state:game}); }
function startGame() {
  const rules = { openingHand: $('opening-hand-toggle').checked, stackDamage: $('damage-stack-toggle').checked, oneCardRefill: $('one-card-refill-toggle').checked };
  const chosen = characters.find((character)=>character.id===selectedCharacter);
  const opponents = shuffle(characters.filter((character)=>character.id!==selectedCharacter)).slice(0,selectedPlayers-1);
  const names=[...document.querySelectorAll('#name-fields input')].map((input,index)=>input.value.trim() || `Player ${index+1}`);
  if(gameMode==='online' && (!onlineRoom || onlinePlayers.length<2)) { setStatus('Create or join an online room before beginning.'); return; }
  if(gameMode==='online' && onlineRoom.hostId!==socket.id) { setStatus('Only the room host can begin the battle.'); return; }
  const roster=gameMode==='online' ? onlinePlayers : [{name:names[0],character:chosen.id},...opponents.map((character)=>({name:character.name,character:character.id}))];
  game = { players:roster.map((entry,index)=>({ ...makePlayer(characters.find((character)=>character.id===entry.character), gameMode==='online' || index===0), name:entry.name })), current:0, required:0, started:false, turn:1, finished:false, rules, pendingDamage:[] };
  if(gameMode==='online') localPlayerIndex=onlinePlayers.findIndex((player)=>player.id===socket.id);
  game.players.forEach((player) => draw(player,rules.openingHand ? 3 : 2));
  els.setup.classList.add('hidden'); els.battle.classList.remove('hidden'); els.log.innerHTML = '';
  log(`A ${selectedPlayers}-player battle begins. ${game.players[0].name} goes first as ${game.players[0].character.name}.`);
  beginTurn();
  if(gameMode==='online') socket.emit('start-online-game',{code:onlineRoom.code,state:game},(result)=>{ if(!result.ok) { setStatus(result.error); } });
}
function beginTurn() {
  if (game.finished) return;
  let player = playerAtTurn();
  if (!player.alive) return nextTurn();
  if (player.protected) { player.protected=false; log(`${player.name}'s Clever Disguise fades.`); }
  draw(player,1); game.required = 1; game.started = true;
  log(`${player.name} draws a card.`);
  if(canControlTurn()) { setStatus(`${player.name}'s turn.`); els.message.textContent = `${player.name}, choose a card and make your move.`; render(); }
  else if(gameMode==='ai') { setStatus(`${player.name} is deciding…`); els.message.textContent = `${player.name} enters the arena.`; render(); window.setTimeout(runAi,900); }
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
  const winner = standing[0];
  els.winner.classList.remove('hidden');
  els.winnerTitle.textContent = winner?.isHuman ? 'Victory!' : `${winner?.name || 'Nobody'} wins`;
  els.winnerText.textContent = winner?.isHuman ? 'You are the last fighter standing.' : 'The arena falls silent. Start another battle and claim the crown.';
  setStatus('Battle complete.'); return true;
}
function damage(target, amount, attacker) {
  if (target.protected && target !== attacker) { log(`${target.name}'s disguise ignores ${attacker.name}'s card effect.`); return; }
  let remaining = amount;
  for (const defense of [...target.defenses]) {
    if (!remaining) break;
    const blocked = Math.min(defense.shield,remaining); defense.shield -= blocked; remaining -= blocked;
    if (!defense.shield) { target.defenses.splice(target.defenses.indexOf(defense),1); target.discard.push(defense); log(`${target.name}'s ${defense.name} breaks.`); }
  }
  if (remaining) { target.hp = Math.max(0,target.hp-remaining); log(`${attacker.name} deals ${remaining} damage to ${target.name}.`); }
  else log(`${target.name}'s defenses absorb ${amount} damage.`);
  if (target.hp === 0) { target.alive=false; target.hand=[]; log(`${target.name} is knocked out!`); }
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
function effectRows(card) { const rows=[]; if(card.damage) rows.push(`<span><b>${card.area?'☄':'⚔'}</b>${card.area ? `Deal ${card.damage} to ${card.areaSelf?'every player':'each opponent'}` : `Deal ${card.damage} damage`}</span>`); if(card.shield) rows.push(`<span><b>🛡</b>Block ${card.shield} damage</span>`); if(card.heal) rows.push(`<span><b>♥</b>Recover ${card.heal} HP</span>`); if(card.healPerOpponent) rows.push('<span><b>♥</b>Recover 1 HP per opponent</span>'); if(card.draw) rows.push(`<span><b>▣</b>Draw ${card.draw} card${card.draw>1?'s':''}</span>`); if(card.again) rows.push(`<span><b>⚡</b>Play ${card.again===1?'an extra card':`${card.again} extra cards`}</span>`); if(card.swap) rows.push('<span class="mighty"><b>✦</b>Swap HP with an opponent</span>'); if(card.destroyDefense) rows.push('<span class="mighty"><b>✦</b>Destroy an active defense</span>'); if(card.destroyAllDefense) rows.push('<span class="mighty"><b>✦</b>Destroy every defense</span>'); if(card.stealDefense) rows.push('<span class="mighty"><b>⇣</b>Take an active defense</span>'); if(card.discardTarget) rows.push('<span class="mighty"><b>✕</b>Target discards a card</span>'); if(card.discardHandDraw) rows.push(`<span class="mighty"><b>↻</b>All discard, then draw ${card.discardHandDraw}</span>`); if(card.reclaim) rows.push('<span class="mighty"><b>↶</b>Choose a discard to return</span>'); if(card.protected) rows.push('<span class="mighty"><b>◉</b>Ignore effects until next turn</span>'); if(card.stealTop) rows.push('<span class="mighty"><b>⇣</b>Take and play their top card</span>'); return rows.join(''); }
function playCard(actor, card, target=null, reclaimChoice=null) {
  actor.hand.splice(actor.hand.indexOf(card),1); game.required = Math.max(0,game.required-1) + (card.again || 0);
  const reclaimCandidate = card.reclaim ? (reclaimChoice || actor.discard.at(-1)) : null;
  const dealDamage = (recipient) => {
    if (game.rules.stackDamage) queueDamage(recipient,card.damage,actor);
    else damage(recipient,card.damage,actor);
  };
  if (card.healPerOpponent) {
    const oldHp=actor.hp; actor.hp=Math.min(10,actor.hp+activePlayers().filter((player)=>player!==actor).length);
    log(`${actor.name} recovers ${actor.hp-oldHp} HP from Whirling Axes.`);
  }
  if (card.damage && card.area) {
    activePlayers().filter((player)=>card.areaSelf || player!==actor).forEach(dealDamage);
  } else if (card.damage && target) {
    dealDamage(target);
  }
  if (card.swap && target && !target.protected) {
    [actor.hp,target.hp] = [target.hp,actor.hp];
    log(`${actor.name} swaps HP totals with ${target.name}.`);
  }
  if (card.destroyDefense && target && !target.protected && target.defenses.length) {
    const defense = target.defenses.pop(); target.discard.push(defense);
    log(`${actor.name} destroys ${target.name}'s ${defense.name}.`);
  }
  if (card.destroyAllDefense) {
    let destroyed=0;
    game.players.forEach((player)=>{ while(player.defenses.length) { player.discard.push(player.defenses.pop()); destroyed++; } });
    log(`${actor.name} banishes ${destroyed || 'no'} active defense${destroyed===1?'':'s'}.`);
  }
  if (card.stealDefense && target && !target.protected && target.defenses.length) {
    const defense=target.defenses.pop(); actor.defenses.push(defense);
    log(`${actor.name} takes ${target.name}'s ${defense.name}.`);
  }
  if (card.discardTarget && target && !target.protected && target.hand.length) {
    const discarded = target.hand.splice(Math.floor(Math.random()*target.hand.length),1)[0]; target.discard.push(discarded);
    log(`${target.name} discards ${discarded.name}.`);
  }
  if (card.discardHandDraw) {
    activePlayers().forEach((player)=>{ player.discard.push(...player.hand.splice(0)); draw(player,card.discardHandDraw); });
    log(`Battle Roar makes every player discard their hand and draw ${card.discardHandDraw}.`);
  }
  if (card.shield) { actor.defenses.push({ ...card }); log(`${actor.name} raises ${card.name} (${card.shield} shields).`); }
  else { actor.discard.push(card); }
  if (card.heal) { const oldHp=actor.hp; actor.hp=Math.min(10,actor.hp+card.heal); log(`${actor.name} recovers ${actor.hp-oldHp} HP.`); }
  if (card.draw) { draw(actor,card.draw); log(`${actor.name} draws ${card.draw} card${card.draw>1?'s':''}.`); }
  if (reclaimCandidate) { actor.discard.splice(actor.discard.lastIndexOf(reclaimCandidate),1); actor.hand.push(reclaimCandidate); log(`${actor.name} returns ${reclaimCandidate.name} from the discard pile.`); }
  if (card.protected) { actor.protected=true; log(`${actor.name} is protected until their next turn.`); }
  if (card.stealTop && target && !target.protected) {
    if (!target.deck.length && target.discard.length) { target.deck=shuffle(target.discard); target.discard=[]; }
    const stolen=target.deck.pop();
    if (stolen) { actor.hand.push(stolen); game.required=Math.max(1,game.required); log(`${actor.name} takes ${stolen.name} from ${target.name}'s deck and may play it this turn.`); }
    else log(`${target.name}'s deck has no card to steal.`);
  }
  const refillAt = game.rules.oneCardRefill ? 1 : 0;
  if (actor.hand.length<=refillAt && actor.alive) { draw(actor,2); log(`${actor.name} reaches ${refillAt === 1 ? 'one card' : 'an empty hand'} and draws 2 cards.`); }
  if (game.rules.stackDamage && game.required===0 && game.pendingDamage.length) resolvePendingDamage();
  if (checkWinner()) { render(); return; }
  render();
  syncOnlineGame();
  if (actor.isHuman) {
    if (game.required === 0) { setStatus('Your turn is complete.'); els.message.textContent='Passing to the next fighter…'; window.setTimeout(nextTurn,650); }
    else { setStatus(`Play ${game.required} more card${game.required>1?'s':''}.`); els.message.textContent='Lightning demands another play.'; }
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
  choices.forEach((discarded)=>{ const button=document.createElement('button'); button.type='button'; button.textContent=discarded.name; button.onclick=()=>{ els.target.classList.add('hidden'); playCard(playerAtTurn(),pendingCard,null,discarded); pendingCard=null; }; els.targetOptions.append(button); });
  els.target.classList.remove('hidden');
}
function humanPlay(card) { if(game.finished || !canControlTurn() || game.required===0) return; if(card.reclaim) chooseReclaim(card); else if((card.damage && !card.area) || card.swap || card.destroyDefense || card.stealDefense || card.discardTarget || card.stealTop) chooseTarget(card); else playCard(playerAtTurn(),card); }
function runAi() {
  if(game.finished) return; const actor=playerAtTurn(); if(actor.isHuman) return;
  const enemies=activePlayers().filter((player)=>player!==actor);
  const pick = () => {
    const defense=actor.hand.find((card)=>card.shield && actor.defenses.reduce((sum,d)=>sum+d.shield,0)<2);
    const heal=actor.hand.find((card)=>card.heal && actor.hp<=6);
    const attack=actor.hand.find((card)=>card.damage);
    return defense || heal || attack || actor.hand[0];
  };
  const card=pick(); if(!card) { draw(actor,2); game.required=0; return window.setTimeout(nextTurn,450); }
  const target=(card.damage && !card.area) || card.swap || card.destroyDefense || card.stealDefense || card.discardTarget || card.stealTop ? enemies.sort((a,b)=>a.hp-b.hp)[0] : null;
  els.message.textContent=`${actor.name} plays ${card.name}.`; playCard(actor,card,target);
  if(!game.finished && game.required>0) window.setTimeout(runAi,600);
  else if(!game.finished) window.setTimeout(nextTurn,750);
}
function render() {
  if(!game) return;
  const human=gameMode==='online' ? game.players[localPlayerIndex] : game.players[0];
  els.opponents.innerHTML='';
  game.players.filter((player)=>player!==human).forEach((player)=>{ const shields=player.defenses.reduce((sum,card)=>sum+card.shield,0); const node=document.createElement('article'); node.className=`combatant ${!player.alive?'out':''}`; node.innerHTML=`<h3>${player.name} <small>· ${player.role}</small></h3><div class="mini-info"><span>${player.alive?`${player.hp} HP`:'Knocked out'}</span><span>${player.hand.length} cards</span></div><div class="healthbar"><span style="width:${player.hp*10}%"></span></div>${shields?`<div class="mini-defense">🛡 ${shields} shield</div>`:''}${player.protected?'<div class="mini-defense">◉ protected</div>':''}`; els.opponents.append(node); });
  els.playerName.innerHTML=`${human.name} <span class="hp">${human.hp} HP</span>`; els.playerDeck.textContent=`Deck ${human.deck.length}`; els.playerDiscard.textContent=`Discard ${human.discard.length}`; els.deckCount.textContent=`${human.deck.length} cards`; els.discardCount.textContent=`${human.discard.length} cards`; const last=human.discard.at(-1); els.discardPreview.textContent=last ? effectSymbols(last).split(' ')[0] : '?';
  els.playerDefense.innerHTML=(human.defenses.length ? human.defenses.map((card)=>`<span class="defense-token">🛡 ${card.name}: ${card.shield}</span>`).join('') : '<span class="defense-token">No active defenses</span>') + (human.protected ? '<span class="defense-token">◉ Protected until your next turn</span>' : '');
  const stacked = game.pendingDamage.reduce((sum,hit)=>sum+hit.amount,0);
  els.actions.textContent = game.finished ? 'Cards to play: —' : `Cards to play: ${game.required}${stacked ? ` · Stacked damage: ${stacked}` : ''}`;
  els.hand.innerHTML=''; human.hand.forEach((card)=>{ const button=document.createElement('button'); button.type='button'; button.className=`card ${card.owner} ${card.type} ${canControlTurn() && game.required>0?'playable':''}`; button.disabled=!canControlTurn() || game.required===0 || game.finished; button.innerHTML=`<div class="card-topline"><span>${card.role}</span><span>${card.type}</span></div><div class="card-nameplate"><h3>${card.name}</h3></div><div class="card-art" aria-hidden="true"><span>${card.area?'☄':card.swap?'⇄':card.shield?'🛡':card.heal?'♥':card.damage?'⚔':'✦'}</span></div><div class="card-effects">${effectRows(card)}</div><div class="card-footer"><span>${card.owner === 'sutha' ? 'SKULLCRUSHER' : card.owner === 'azzan' ? 'MYSTIC' : card.owner === 'lia' ? 'RADIANT' : 'CLEVER'}</span><b>${effectSymbols(card)}</b></div>`; button.onclick=()=>humanPlay(card); els.hand.append(button); });
}
document.querySelectorAll('.player-count').forEach((button)=>button.addEventListener('click',()=>{ selectedPlayers=Number(button.dataset.players); document.querySelectorAll('.player-count').forEach((other)=>other.classList.toggle('selected',other===button)); renderNameFields(); }));
document.querySelectorAll('.character-choice').forEach((button)=>button.addEventListener('click',()=>{ selectedCharacter=button.dataset.character; document.querySelectorAll('.character-choice').forEach((other)=>other.classList.toggle('selected',other===button)); }));
function playerIdentity() { return currentAccount?.username || $('player-name-0')?.value.trim() || 'Player'; }
function connectOnline() {
  if(socket) return;
  socket=io();
  socket.on('lobby-state',(room)=>{ onlineRoom={code:room.code,hostId:room.hostId,limit:room.limit}; onlinePlayers=room.players; const host=room.hostId===socket.id; $('room-status').textContent=`Room ${room.code}: ${room.players.length}/${room.limit} players. ${host ? 'You are the host—start when everyone has joined.' : 'Waiting for the host to begin.'}`; });
  socket.on('online-game-state',({state,players})=>{ game=state; onlinePlayers=players; localPlayerIndex=players.findIndex((player)=>player.id===socket.id); els.setup.classList.add('hidden'); els.battle.classList.remove('hidden'); els.log.innerHTML=''; render(); const active=playerAtTurn(); setStatus(canControlTurn() ? `${active.name}'s turn.` : `${active.name}'s turn. Waiting for them to play.`); });
}
document.querySelectorAll('.mode-choice').forEach((button)=>button.addEventListener('click',()=>{ gameMode=button.dataset.mode; document.querySelectorAll('.mode-choice').forEach((other)=>other.classList.toggle('selected',other===button)); $('online-lobby').classList.toggle('hidden',gameMode!=='online'); if(gameMode==='online') connectOnline(); }));
$('create-room').onclick=()=>{ connectOnline(); socket.emit('create-room',{name:playerIdentity(),character:selectedCharacter,limit:selectedPlayers},(result)=>{ if(!result.ok) $('room-status').textContent=result.error; }); };
$('join-room').onclick=()=>{ connectOnline(); socket.emit('join-room',{code:$('room-code').value.trim(),name:playerIdentity(),character:selectedCharacter},(result)=>{ if(!result.ok) $('room-status').textContent=result.error; }); };
$('start-button').onclick=startGame; $('restart-button').onclick=()=>{ els.winner.classList.add('hidden'); els.battle.classList.add('hidden'); els.setup.classList.remove('hidden'); setStatus('Choose a character and game size to begin.'); els.actions.textContent='Cards to play: —'; }; $('winner-restart').onclick=()=>{ els.winner.classList.add('hidden'); startGame(); }; $('rules-button').onclick=()=>$('rules-dialog').showModal(); $('close-rules').onclick=()=>$('rules-dialog').close(); $('cancel-target').onclick=()=>{ pendingCard=null; els.target.classList.add('hidden'); }; $('clear-log').onclick=()=>els.log.innerHTML='';
$('account-button').onclick=()=>showAccountDialog(currentAccount ? 'login' : 'register');
$('close-account').onclick=()=>$('account-dialog').close();
$('account-mode').onclick=()=>showAccountDialog(accountMode==='register' ? 'login' : 'register');
$('account-form').onsubmit=async (event)=>{ event.preventDefault(); const username=$('account-username').value.trim(); const password=$('account-password').value; const error=$('account-error'); error.textContent=''; try { const response=await fetch(`/api/auth/${accountMode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})}); const result=await response.json(); if(!response.ok) throw new Error(result.error || 'Unable to sign in.'); currentAccount=result.user; $('account-password').value=''; $('account-dialog').close(); updateAccountUi(); } catch (issue) { error.textContent=issue.message; } };
$('logout-button').onclick=async ()=>{ await fetch('/api/auth/logout',{method:'POST'}); currentAccount=null; $('account-dialog').close(); updateAccountUi(); };
renderNameFields();
loadAccount();
