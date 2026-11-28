'use strict';
const $ = s => document.querySelector(s);
const vp = $('#viewport'), scene = $('#scene'), art = $('#artwork');
const W = 1437, H = 1094, ROUND_SECONDS = 180, TARGET_COUNT = 16;
let round = [], previous = [], found = new Set(), selected = null;
let phase = 'loading', startedAt = 0, finishedAt = 0, deadline = null;
let scale = 1, x = 0, y = 0, ready = false, roundUntimed = false;
let wrongTimes = [], blockedUntil = 0, lastAttempt = -Infinity, answersShown = false;
const pointers = new Map();
let gesture = null;
const shuffle = items => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
function sampleTargets(last = []) {
  const chosen = [], groups = new Set();
  for (const [level, count] of [['easy', 4], ['medium', 6], ['hard', 6]]) {
    const pool = shuffle(TARGETS.filter(t => t.level === level));
    const ordered = [...pool.filter(t => !last.includes(t.id)), ...pool.filter(t => last.includes(t.id))];
    for (const item of ordered) {
      if (chosen.filter(t => t.level === level).length >= count) break;
      if (groups.has(item.group)) continue;
      chosen.push(item); groups.add(item.group);
    }
  }
  return shuffle(chosen);
}
function hit(item, px, py) {
  const [a,b,w,h] = item.hit;
  return px >= a && px <= a+w && py >= b && py <= b+h;
}
function say(message) { $('#feedback').textContent = message; }
function fitScale() { return Math.min(vp.clientWidth/W, vp.clientHeight/H); }
function draw() {
  const sw = W*scale, sh = H*scale;
  x = sw <= vp.clientWidth ? (vp.clientWidth-sw)/2 : Math.max(vp.clientWidth-sw, Math.min(0,x));
  y = sh <= vp.clientHeight ? (vp.clientHeight-sh)/2 : Math.max(vp.clientHeight-sh, Math.min(0,y));
  scene.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
}
function fit() { scale = fitScale(); x = 0; y = 0; draw(); }
function zoom(factor, cx=vp.clientWidth/2, cy=vp.clientHeight/2) {
  const next = Math.max(fitScale(), Math.min(5, scale*factor));
  x = cx-(cx-x)*next/scale; y = cy-(cy-y)*next/scale; scale = next; draw();
}
function formatTime(seconds) {
  return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}
function renderTargets() {
  $('#progress').textContent = `Dijumpai: ${found.size}/${round.length || TARGET_COUNT}`;
  $('#targets').replaceChildren(...round.map((item, i) => {
    const li = document.createElement('li'), button = document.createElement('button');
    button.type = 'button'; button.dataset.target = item.id;
    button.className = 'target-card' + (found.has(item.id) ? ' found' : selected === item.id ? ' selected' : '');
    button.setAttribute('aria-label', `Gambar ${i+1}: ${item.name}${found.has(item.id) ? ', dijumpai' : ''}`);
    button.setAttribute('aria-pressed', String(selected === item.id));
    const canvas = document.createElement('canvas');
    canvas.width = 210; canvas.height = 156; canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d'), [sx,sy,sw,sh] = item.crop;
    const factor = Math.min(198/sw,144/sh), dw=sw*factor, dh=sh*factor;
    ctx.drawImage(art,sx,sy,sw,sh,(210-dw)/2,(156-dh)/2,dw,dh);
    const number = document.createElement('span'); number.className = 'card-number';
    number.textContent = `GAMBAR ${String(i+1).padStart(2,'0')}`;
    button.append(canvas,number);
    if (found.has(item.id)) {
      const check = document.createElement('span'); check.className = 'check'; check.textContent = '✓'; button.append(check);
    }
    button.onclick = () => {
      if (phase !== 'playing' || found.has(item.id)) return;
      selected = selected === item.id ? null : item.id;
      renderTargets();
      $('#targets').querySelector(`[data-target="${item.id}"]`).focus({preventScroll:true});
      say(selected ? `Cari padanan gambar ${i+1}. Ketik gambar ini semula untuk mencari mana-mana sasaran.` : 'Cari mana-mana gambar sasaran.');
    };
    li.append(button); return li;
  }));
}
function renderMarkers() {
  const svg = $('#markers'), ns = 'http://www.w3.org/2000/svg';
  svg.replaceChildren();
  round.forEach((item,i) => {
    const done = found.has(item.id);
    if (!done && !answersShown) return;
    const [a,b,w,h] = item.crop;
    const rect = document.createElementNS(ns,'rect');
    rect.setAttribute('x', a); rect.setAttribute('y', b); rect.setAttribute('width', w); rect.setAttribute('height', h);
    rect.setAttribute('rx', 7); rect.setAttribute('class', done ? 'found-outline' : 'answer-outline');
    const text = document.createElementNS(ns,'text');
    text.setAttribute('x',a+5); text.setAttribute('y',Math.max(20,b-6)); text.setAttribute('class','marker-label');
    text.textContent = done ? `${i+1} ✓` : String(i+1);
    svg.append(rect,text);
  });
}
let dialogAction = null;
function showDialog(title,text,primary='Teruskan',action=null,secondary=false,summary='') {
  $('#modalTitle').textContent = title; $('#modalText').textContent = text;
  $('#dialog-primary').textContent = primary; $('#dialog-secondary').hidden = !secondary;
  $('#summary').textContent = summary; dialogAction = action;
  if (!$('#modal').open) $('#modal').showModal();
}
$('#modal form').addEventListener('submit', e => {
  e.preventDefault(); const action = dialogAction; dialogAction = null; $('#modal').close();
  if (e.submitter === $('#dialog-primary') && action) action();
});
$('#modal').addEventListener('cancel', e => {
  if (phase === 'loading' || phase === 'ready') e.preventDefault();
});
function start() {
  if (!ready) return;
  if ($('#modal').open) $('#modal').close();
  round = sampleTargets(previous); previous = round.map(t => t.id);
  found = new Set(); selected = null; phase = 'playing'; answersShown = false;
  startedAt = Date.now(); finishedAt = 0; roundUntimed = $('#untimed').checked;
  deadline = roundUntimed ? null : startedAt + ROUND_SECONDS*1000;
  wrongTimes = []; blockedUntil = 0; lastAttempt = -Infinity; pointers.clear(); gesture = null;
  $('#answers').hidden = true; $('#answers').textContent = 'Lihat jawapan'; $('#round-label').textContent = 'Cari 16 orang';
  renderTargets(); renderMarkers(); fit(); tick();
  say('Cari mana-mana gambar sasaran. Zum untuk melihat butiran kecil.');
  budgetCount('cari_kenali');
}
function end(won) {
  if (phase !== 'playing') return;
  finishedAt = deadline ? Math.min(Date.now(),deadline) : Date.now(); phase = won ? 'won' : 'expired';
  deadline = null; selected = null;
  $('#round-label').textContent = won ? 'Misi selesai!' : 'Pusingan tamat';
  $('#answers').hidden = false; renderTargets(); tick();
  const elapsed = formatTime(Math.floor((finishedAt-startedAt)/1000));
  say(won ? 'Tahniah! Kesemua 16 orang dijumpai.' : 'Masa tamat. Lihat jawapan atau cuba pusingan baharu.');
  showDialog(won ? 'Mata anda memang tajam!' : 'Masa tamat',
    won ? 'Kesemua 16 orang telah dijumpai. Cuba pusingan seterusnya dengan pilihan gambar baharu.' : 'Masih ada gambar yang belum ditemui. Anda boleh semak lokasinya sebelum mencuba lagi.',
    'Main lagi →',start,true,`Dijumpai: ${found.size}/${round.length} · Masa: ${elapsed}`);
}
function choose(px,py) {
  if (phase !== 'playing') return;
  tick(); if (phase !== 'playing') return;
  const now = Date.now();
  if (now < blockedUntil) { say('Perhatikan gambar dahulu. Cuba lagi sebentar lagi.'); return; }
  if (now-lastAttempt < 350) return;
  lastAttempt = now;
  const item = round.find(t => !found.has(t.id) && (!selected || selected === t.id) && hit(t,px,py));
  if (!item) {
    if (round.some(t => found.has(t.id) && hit(t,px,py))) { say('Gambar ini sudah dijumpai. Cari sasaran yang lain.'); return; }
    wrongTimes = wrongTimes.filter(time => now-time < 5000); wrongTimes.push(now);
    if (wrongTimes.length >= 4) { blockedUntil = now+2200; wrongTimes = []; say('Ambil masa untuk meneliti. Carian disambung dalam 2 saat.'); }
    else say('Belum tepat. Teliti bentuk, warna dan butirannya.');
    return;
  }
  found.add(item.id); selected = null; wrongTimes = [];
  renderTargets(); renderMarkers();
  say(`Tepat! ${found.size} daripada ${round.length} gambar dijumpai.`);
  if (found.size === round.length) end(true);
}
function tick() {
  $('#timerDisplay').classList.remove('urgent');
  if (phase === 'playing') {
    if (deadline) {
      const seconds = Math.max(0,Math.ceil((deadline-Date.now())/1000));
      $('#timer-label').textContent = 'BAKI MASA'; $('#clock').textContent = formatTime(seconds);
      $('#timerDisplay').classList.toggle('urgent', seconds <= 20);
      if (!seconds) end(false);
    } else { $('#timer-label').textContent = 'MASA'; $('#clock').textContent = formatTime(Math.floor((Date.now()-startedAt)/1000)); }
  } else if (phase === 'won') { $('#timer-label').textContent = 'MASA ANDA'; $('#clock').textContent = formatTime(Math.floor((finishedAt-startedAt)/1000)); }
  else if (phase === 'expired') { $('#timer-label').textContent = 'MASA TAMAT'; $('#clock').textContent = '0:00'; }
}
$('#restart').onclick = () => {
  if (phase === 'playing') showDialog('Mulakan pusingan baharu?','Kemajuan pusingan ini akan ditetapkan semula. 16 gambar baharu akan dipilih.','Mula semula',start,true);
  else start();
};
$('#untimed').onchange = () => {
  if (phase !== 'playing') return;
  const requested = $('#untimed').checked; $('#untimed').checked = roundUntimed;
  showDialog('Tukar tetapan masa?', 'Menukar tetapan masa akan memulakan pusingan baharu.', 'Tukar & mula', () => { $('#untimed').checked = requested; start(); },true);
};
$('#in').onclick=()=>zoom(1.3); $('#out').onclick=()=>zoom(1/1.3); $('#fit').onclick=fit;
$('#answers').onclick=()=>{
  if (!['won','expired'].includes(phase)) return;
  answersShown = !answersShown; renderMarkers(); fit();
  $('#answers').textContent = answersShown ? 'Tutup jawapan' : 'Lihat jawapan';
  say(answersShown ? 'Nombor pada ilustrasi sepadan dengan nombor gambar sasaran.' : 'Cuba pusingan baharu untuk pilihan gambar seterusnya.');
};
$('#help').onclick=()=>showDialog('Cara bermain',
  'Cari orang yang sepadan dengan 16 gambar sasaran dalam ilustrasi, kemudian ketik padanannya. Anda boleh mencari mana-mana sasaran, atau memilih satu gambar untuk menumpukan carian.\n\nSeret untuk bergerak. Cubit dua jari, gunakan roda tetikus atau butang + / − untuk zum. Tiada petunjuk lokasi diberikan.\n\nPemasa lalai ialah 3 minit. Pilih Tanpa had masa untuk pusingan tanpa kiraan undur. Empat tekaan salah dalam 5 saat akan menghentikan tekaan selama 2 saat. Pemasa terus berjalan semasa tetingkap ini dibuka.');
// Keep an entire gesture ineligible for guesses after any pan or second contact.
vp.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  vp.setPointerCapture(e.pointerId);
  if (!pointers.size) gesture = {startX:e.clientX,startY:e.clientY,moved:false};
  else if (gesture) gesture.moved = true;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
});
vp.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId) || !gesture) return;
  const old = pointers.get(e.pointerId), other = [...pointers.entries()].find(([id])=>id!==e.pointerId);
  if (other) {
    const o=other[1], distance=Math.hypot(old.x-o.x,old.y-o.y), nextDistance=Math.hypot(e.clientX-o.x,e.clientY-o.y);
    const bounds=vp.getBoundingClientRect();
    const oldCx=(old.x+o.x)/2-bounds.left, oldCy=(old.y+o.y)/2-bounds.top;
    const cx=(e.clientX+o.x)/2-bounds.left, cy=(e.clientY+o.y)/2-bounds.top;
    if (distance>0) {
      const next=Math.max(fitScale(),Math.min(5,scale*nextDistance/distance));
      x=cx-(oldCx-x)*next/scale; y=cy-(oldCy-y)*next/scale; scale=next; draw();
    }
    gesture.moved=true;
  } else {
    if (Math.hypot(e.clientX-gesture.startX,e.clientY-gesture.startY)>7) gesture.moved=true;
    if (gesture.moved) { x+=e.clientX-old.x; y+=e.clientY-old.y; draw(); }
  }
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
});
vp.addEventListener('pointerup', e => {
  if (!pointers.has(e.pointerId)) return;
  if (gesture && Math.hypot(e.clientX-gesture.startX,e.clientY-gesture.startY)>7) gesture.moved=true;
  const tapped=gesture && !gesture.moved && pointers.size===1;
  pointers.delete(e.pointerId);
  if (tapped) { const b=vp.getBoundingClientRect(); choose((e.clientX-b.left-x)/scale,(e.clientY-b.top-y)/scale); }
  if (!pointers.size) gesture=null;
});
function cancelPointer(e) { pointers.delete(e.pointerId); if (gesture) gesture.moved=true; if (!pointers.size) gesture=null; }
vp.addEventListener('pointercancel',cancelPointer); vp.addEventListener('lostpointercapture',cancelPointer);
vp.addEventListener('wheel', e => {
  e.preventDefault(); const b=vp.getBoundingClientRect(); zoom(Math.exp(-e.deltaY*.0015),e.clientX-b.left,e.clientY-b.top);
},{passive:false});
vp.addEventListener('keydown',e=>{
  const moves={ArrowLeft:[45,0],ArrowRight:[-45,0],ArrowUp:[0,45],ArrowDown:[0,-45]};
  if (moves[e.key]) { e.preventDefault(); x+=moves[e.key][0]; y+=moves[e.key][1]; draw(); }
  else if (e.key==='+' || e.key==='=') { e.preventDefault(); zoom(1.3); }
  else if (e.key==='-') { e.preventDefault(); zoom(1/1.3); }
  else if (e.key==='0') { e.preventDefault(); fit(); }
});
new ResizeObserver(()=>requestAnimationFrame(fit)).observe(vp);
$('#fullscreen').onclick=async()=>{
  try {
    const active=document.fullscreenElement||document.webkitFullscreenElement;
    if (active) { const leave=document.exitFullscreen||document.webkitExitFullscreen; if(leave) await leave.call(document); }
    else { const enter=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen; if(!enter) {say('Skrin penuh tidak disokong oleh pelayar ini.');return;} await enter.call(document.documentElement); }
  } catch { say('Skrin penuh tidak dapat dibuka dalam pelayar ini.'); }
};
function syncFullscreen() { const active=!!(document.fullscreenElement||document.webkitFullscreenElement); $('#fullscreen').setAttribute('aria-pressed',String(active)); $('#fullscreen span').textContent=active?'Keluar skrin penuh':'Skrin penuh'; requestAnimationFrame(fit); }
document.addEventListener('fullscreenchange',syncFullscreen); document.addEventListener('webkitfullscreenchange',syncFullscreen);
// Preserve the existing shared game counter; counter failures never block play.
const COUNTER_BASE='https://belanjawan-2027-games-default-rtdb.asia-southeast1.firebasedatabase.app/counters/';
function displayCount(value) { $('[data-count="cari_kenali"]').textContent=new Intl.NumberFormat('ms-MY').format(value); }
async function budgetCount(key) {
  try {
    const r=await fetch(COUNTER_BASE+key+'.json',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({'.sv':{increment:1}})});
    if(r.ok) displayCount(await r.json());
  } catch { /* Optional statistics. */ }
}
async function readCount() { try {const r=await fetch(COUNTER_BASE+'cari_kenali.json',{cache:'no-store'}); if(r.ok) displayCount((await r.json())||0);}catch{ /* Optional statistics. */ } }
function initialise() {
  if(ready) return; ready=true; phase='ready'; fit();
  showDialog('Mata tajam, misi baharu.',
    'Cari 16 orang dalam ilustrasi Belanjawan. Perhatikan pakaian, aksesori dan gaya setiap orang. Zum untuk melihat lebih dekat.\n\nMasa anda: 3 minit. Aktifkan pilihan di bawah jika mahu bermain tanpa had masa.',
    'Mula mencari →',start);
  const label=document.createElement('label'), option=document.createElement('input');
  option.type='checkbox'; option.checked=$('#untimed').checked; option.onchange=()=>{$('#untimed').checked=option.checked;};
  label.append(option,document.createTextNode(' Bermain tanpa had masa')); $('#summary').append(label);
}
art.addEventListener('load',initialise);
art.addEventListener('error',()=>{phase='error';say('Ilustrasi tidak dapat dimuatkan. Muat semula halaman untuk mencuba lagi.');});
if(art.complete && art.naturalWidth) initialise();
readCount(); setInterval(tick,200);
