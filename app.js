const sampleData = {
  settings: {
    eventDate: "September 30 onwards",
    venue: "Aero 3rd Year Classroom",
    fee: 10,
    timeControl: "10 minutes per player",
    prizeNote: "The collected registration amount goes to the Winner and Runner-Up."
  },
  players: [
    {id:"1", name:"Arjun", paid:"YES", status:"Registered"},
    {id:"2", name:"Rahul", paid:"YES", status:"Registered"},
    {id:"3", name:"Karthik", paid:"YES", status:"Registered"},
    {id:"4", name:"Vishnu", paid:"NO", status:"Registered"}
  ],
  matches: [
    {round:"Round 1", player1:"Arjun", player2:"Rahul", date:"Sep 30", time:"2:00 PM", result:"—"},
    {round:"Round 1", player1:"Karthik", player2:"Vishnu", date:"Sep 30", time:"2:20 PM", result:"—"}
  ]
};

let state = { ...sampleData };

const $ = id => document.getElementById(id);

function money(n){ return "₹" + Number(n || 0).toLocaleString("en-IN"); }
function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

/* ---------- CSV parsing (handles quoted fields, commas, newlines) ---------- */
function parseCSV(text){
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for(let i = 0; i < text.length; i++){
    const c = text[i], next = text[i+1];
    if(inQuotes){
      if(c === '"' && next === '"'){ field += '"'; i++; }
      else if(c === '"'){ inQuotes = false; }
      else { field += c; }
    } else {
      if(c === '"'){ inQuotes = true; }
      else if(c === ','){ row.push(field); field = ""; }
      else if(c === '\r'){ /* skip */ }
      else if(c === '\n'){ row.push(field); rows.push(row); row = []; field = ""; }
      else { field += c; }
    }
  }
  if(field.length || row.length){ row.push(field); rows.push(row); }
  return rows.filter(r => r.some(cell => String(cell).trim() !== ""));
}

function csvToObjects(text){
  const rows = parseCSV(text);
  if(!rows.length) return [];
  const headers = rows[0].map(h => String(h).trim().toLowerCase());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (r[i] ?? "").trim(); });
    return obj;
  });
}

async function fetchTab(tabName){
  const res = await fetch(sheetCsvUrl(tabName) + "&_=" + Date.now(), { cache: "no-store" });
  if(!res.ok) throw new Error("Could not load tab: " + tabName + " (HTTP " + res.status + ")");
  const text = await res.text();
  if(/^\s*<!DOCTYPE html/i.test(text) || /accounts\.google\.com/i.test(text)){
    throw new Error("Sheet is not public. Share it as \"Anyone with the link – Viewer\".");
  }
  return csvToObjects(text);
}

function buildSettings(rows){
  const settings = { ...sampleData.settings };
  rows.forEach(r => {
    const key = (r.key || "").trim();
    const value = (r.value ?? "").trim();
    if(key) settings[key] = value;
  });
  return settings;
}

/* ---------- Standings ---------- */
function calculateStandings(players, matches){
  const map = {};
  players.forEach(p => map[p.name] = {name:p.name, played:0, w:0, d:0, l:0, pts:0});
  matches.forEach(m => {
    const result = String(m.result || "").trim().toLowerCase();
    if(!map[m.player1] || !map[m.player2]) return;
    if(!result || result === "—" || result === "-" || result === "pending") return;
    map[m.player1].played++; map[m.player2].played++;
    if(["p1","player1","1","win1",m.player1.toLowerCase()+" win"].includes(result)){
      map[m.player1].w++; map[m.player1].pts += 1; map[m.player2].l++;
    } else if(["p2","player2","2","win2",m.player2.toLowerCase()+" win"].includes(result)){
      map[m.player2].w++; map[m.player2].pts += 1; map[m.player1].l++;
    } else if(["draw","d","½-½","0.5-0.5"].includes(result)){
      map[m.player1].d++; map[m.player2].d++; map[m.player1].pts += .5; map[m.player2].pts += .5;
    }
  });
  return Object.values(map).sort((a,b)=>b.pts-a.pts || b.w-a.w || a.name.localeCompare(b.name));
}

/* ---------- Rendering ---------- */
function render(){
  const {settings, players, matches} = state;
  const paidCount = players.filter(p => String(p.paid).toUpperCase()==="YES").length;
  const prize = paidCount * Number(settings.fee || 10);

  $("playerCount").textContent = players.length;
  $("registeredCount").textContent = players.length;
  $("collectedCount").textContent = paidCount + " paid";
  $("prizePool").textContent = money(prize);
  $("prizeBig").textContent = money(prize);
  $("eventDate").textContent = settings.eventDate || "Sep 30 onwards";
  $("prizeNote").textContent = settings.prizeNote || "Collected registration amount goes to the Winner and Runner-Up.";

  renderPlayers(players);
  renderMatches(matches);
  renderStandings(players, matches);

  $("updatedAt").textContent = "Updated " + new Date().toLocaleString("en-IN", {
    day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit"
  });
}

function renderPlayers(players){
  const q = $("playerSearch").value.trim().toLowerCase();
  const filtered = players.filter(p => String(p.name).toLowerCase().includes(q));
  $("playersGrid").innerHTML = filtered.length ? filtered.map((p,i)=>`
    <article class="player-card">
      <div><div class="player-number">PLAYER ${i+1}</div><div class="player-name">${esc(p.name)}</div></div>
      <div class="player-status">${esc(p.status || "Registered")}</div>
    </article>`).join("") : `<div class="empty">No players found.</div>`;
}

/* Groups matches into columns by their `round` value, in the order rounds
   first appear in the sheet, and renders them as a bracket. Each column's
   matches are vertically centered/spaced (CSS flex `justify-content: space-around`
   on equal-height columns), so if each round has half as many matches as the
   one before it (a true single-elimination bracket), pairs line up naturally.
   For a round-robin sheet, rounds just show as side-by-side columns — still
   useful, but there's no "advancing winner" concept in that format. */
function renderMatches(matches){
  if(!matches.length){
    $("bracketWrap").innerHTML = `<div class="empty">No matches published yet.</div>`;
    return;
  }

  const roundOrder = [];
  const byRound = {};
  matches.forEach(m => {
    const r = m.round || "Round";
    if(!byRound[r]){ byRound[r] = []; roundOrder.push(r); }
    byRound[r].push(m);
  });

  $("bracketWrap").innerHTML = roundOrder.map(round => `
    <div class="bracket-round">
      <div class="bracket-round-title">${esc(round)}</div>
      ${byRound[round].map(m => bracketMatchHTML(m)).join("")}
    </div>
  `).join("");
}

function bracketMatchHTML(m){
  const result = String(m.result || "").trim().toLowerCase();
  const p1Wins = result === "p1";
  const p2Wins = result === "p2";
  const isDraw = ["draw","d"].includes(result);
  const cls1 = p1Wins ? "winner" : (p2Wins ? "loser" : "");
  const cls2 = p2Wins ? "winner" : (p1Wins ? "loser" : "");
  const pending = !result || result === "—" || result === "-" || result === "pending";

  return `
    <div class="bracket-match">
      <div class="bracket-slot ${cls1}">
        <span>${esc(m.player1 || "TBD")}</span>
        ${p1Wins ? '<span class="pts">1</span>' : isDraw ? '<span class="pts">½</span>' : ""}
      </div>
      <div class="bracket-slot ${cls2}">
        <span>${esc(m.player2 || "TBD")}</span>
        ${p2Wins ? '<span class="pts">1</span>' : isDraw ? '<span class="pts">½</span>' : ""}
      </div>
      <div class="bracket-meta">
        <span>${esc(m.date || "TBA")} · ${esc(m.time || "TBA")}</span>
        <span class="${pending ? "pending" : ""}">${pending ? "Pending" : esc(m.result)}</span>
      </div>
    </div>`;
}

function renderStandings(players, matches){
  const rows = calculateStandings(players,matches);
  $("standingsBody").innerHTML = rows.length ? rows.map((r,i)=>`
    <tr><td>${i+1}</td><td>${esc(r.name)}</td><td>${r.played}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.pts}</td></tr>
  `).join("") : `<tr><td colspan="7">No standings yet.</td></tr>`;
}

/* ---------- Data loading straight from the Google Sheet ---------- */
async function loadData(){
  try{
    const [settingsRows, players, matches] = await Promise.all([
      fetchTab(SHEET_TABS.settings),
      fetchTab(SHEET_TABS.players),
      fetchTab(SHEET_TABS.matches)
    ]);

    state = {
      settings: buildSettings(settingsRows),
      players: players.filter(p => p.name),
      matches: matches.filter(m => m.player1 && m.player2)
    };
    render();
  }catch(err){
    console.error(err);
    $("updatedAt").textContent = "Could not load the Google Sheet (" + err.message + "). Showing demo data.";
    state = sampleData;
    render();
  }
}

$("playerSearch").addEventListener("input", ()=>renderPlayers(state.players));
$("menuBtn").addEventListener("click", ()=>$("navLinks").classList.toggle("open"));

loadData();
setInterval(loadData, (typeof REFRESH_MS !== "undefined" ? REFRESH_MS : 30000));
