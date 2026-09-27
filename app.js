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

// ---------- Reading the Google Sheet directly (no Apps Script needed) ----------

function gvizUrl(tabName){
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}&_=${Date.now()}`;
}

function cellValue(cell){
  if(!cell) return "";
  if(cell.f !== undefined && cell.f !== null && cell.f !== "") return cell.f;
  if(cell.v === undefined || cell.v === null) return "";
  return cell.v;
}

async function fetchTab(tabName){
  const res = await fetch(gvizUrl(tabName));
  if(!res.ok) throw new Error(`Could not load "${tabName}" tab (HTTP ${res.status})`);
  const text = await res.text();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if(start === -1 || end === -1){
    throw new Error(`"${tabName}" tab returned no readable data. Check the sheet is shared as "Anyone with the link -> Viewer".`);
  }
  const json = JSON.parse(text.substring(start, end + 1));
  if(!json.table) return [];

  let headers = json.table.cols.map(c => (c.label || "").trim());
  let rows = json.table.rows || [];

  // If Google didn't auto-detect header labels, use the first data row as headers.
  if(headers.every(h => h === "")){
    if(rows.length === 0) return [];
    headers = (rows[0].c || []).map(c => String(cellValue(c)).trim());
    rows = rows.slice(1);
  }

  return rows
    .map(r => {
      const obj = {};
      (r.c || []).forEach((cell, i) => {
        obj[headers[i] || `col${i}`] = cellValue(cell);
      });
      return obj;
    })
    .filter(o => Object.values(o).some(v => String(v).trim() !== ""));
}

function settingsRowsToObject(rows){
  const out = {};
  rows.forEach(r => {
    const keys = Object.keys(r);
    const keyCol = keys.find(k => k.toLowerCase() === "key") || keys[0];
    const valCol = keys.find(k => k.toLowerCase() === "value") || keys[1];
    if(r[keyCol] !== undefined && String(r[keyCol]).trim() !== ""){
      out[String(r[keyCol]).trim()] = r[valCol] !== undefined ? r[valCol] : "";
    }
  });
  return out;
}

function normalize(rawSettings, players, matches){
  return {
    settings: {
      eventDate: rawSettings.eventDate || sampleData.settings.eventDate,
      venue: rawSettings.venue || sampleData.settings.venue,
      fee: Number(rawSettings.fee || sampleData.settings.fee),
      timeControl: rawSettings.timeControl || sampleData.settings.timeControl,
      prizeNote: rawSettings.prizeNote || sampleData.settings.prizeNote
    },
    players: Array.isArray(players) ? players : [],
    matches: Array.isArray(matches) ? matches : []
  };
}

// ---------- Standings ----------

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

// ---------- Rendering (unchanged) ----------

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
  renderRounds(matches);

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

function renderRounds(matches){
  const select = $("roundFilter");
  const old = select.value;
  const rounds = [...new Set(matches.map(m=>m.round).filter(Boolean))];
  select.innerHTML = `<option value="all">All rounds</option>` + rounds.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join("");
  select.value = rounds.includes(old) ? old : "all";
}

function renderMatches(matches){
  const filter = $("roundFilter").value;
  const filtered = filter==="all" ? matches : matches.filter(m=>m.round===filter);
  $("matchesList").innerHTML = filtered.length ? filtered.map(m=>`
    <article class="match-card">
      <div class="round">${esc(m.round || "Match")}</div>
      <div class="player-a">${esc(m.player1)}</div>
      <div class="vs">VS</div>
      <div class="player-b">${esc(m.player2)}</div>
      <div class="match-meta">
        📅 ${esc(m.date || "TBA")}<br>
        ⏰ ${esc(m.time || "TBA")}
        <div class="result">${esc(m.result || "Pending")}</div>
      </div>
    </article>`).join("") : `<div class="empty">No matches published yet.</div>`;
}

function renderStandings(players, matches){
  const rows = calculateStandings(players,matches);
  $("standingsBody").innerHTML = rows.length ? rows.map((r,i)=>`
    <tr><td>${i+1}</td><td>${esc(r.name)}</td><td>${r.played}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.pts}</td></tr>
  `).join("") : `<tr><td colspan="7">No standings yet.</td></tr>`;
}

// ---------- Loading ----------

async function loadData(){
  try{
    const [settingsRows, players, matches] = await Promise.all([
      fetchTab(SHEET_TABS.settings),
      fetchTab(SHEET_TABS.players),
      fetchTab(SHEET_TABS.matches)
    ]);
    state = normalize(settingsRowsToObject(settingsRows), players, matches);
    render();
  }catch(err){
    console.error(err);
    $("updatedAt").textContent = "Could not load the sheet (check sharing settings). Showing demo data.";
    state = sampleData;
    render();
  }
}

$("playerSearch").addEventListener("input", ()=>renderPlayers(state.players));
$("roundFilter").addEventListener("change", ()=>renderMatches(state.matches));
$("menuBtn").addEventListener("click", ()=>$("navLinks").classList.toggle("open"));

loadData();
setInterval(loadData, window.REFRESH_MS || 30000);
