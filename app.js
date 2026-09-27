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

function normalize(raw){
  const settings = raw.settings || sampleData.settings;
  const players = Array.isArray(raw.players) ? raw.players : [];
  const matches = Array.isArray(raw.matches) ? raw.matches : [];
  return {settings, players, matches};
}

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

async function loadData(){
  if(!window.API_URL){
    state = sampleData;
    render();
    return;
  }
  try{
    const res = await fetch(window.API_URL + "?t=" + Date.now(), {cache:"no-store"});
    if(!res.ok) throw new Error("HTTP " + res.status);
    state = normalize(await res.json());
    render();
  }catch(err){
    console.error(err);
    $("updatedAt").textContent = "Could not load live data. Showing demo data.";
    state = sampleData;
    render();
  }
}

$("playerSearch").addEventListener("input", ()=>renderPlayers(state.players));
$("roundFilter").addEventListener("change", ()=>renderMatches(state.matches));
$("menuBtn").addEventListener("click", ()=>$("navLinks").classList.toggle("open"));

loadData();
setInterval(loadData, window.REFRESH_MS || 30000);
