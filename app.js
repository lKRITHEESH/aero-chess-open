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
    {round:"Round 1", player1:"Arjun", player2:"Rahul", date:"Sep 30", time:"14:00", result:"P1"},
    {round:"Round 1", player1:"Karthik", player2:"Vishnu", date:"Sep 30", time:"14:20", result:"P2"},
    {round:"Finals", player1:"Arjun", player2:"Vishnu", date:"Sep 30", time:"15:00", result:"Pending"}
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

function renderMatches(matches){
  const container = $("matchesList");
  if(!matches || !matches.length){
    container.innerHTML = `<div class="empty">No matches published yet.</div>`;
    return;
  }

  const roundsMap = {};
  const roundOrder = [];
  matches.forEach(m => {
    const roundName = m.round || "Round 1";
    if(!roundsMap[roundName]){
      roundsMap[roundName] = [];
      roundOrder.push(roundName);
    }
    roundsMap[roundName].push(m);
  });

  let bracketHTML = `<div class="bracket-container">`;

  roundOrder.forEach((rName) => {
    bracketHTML += `<div class="bracket-round"><div class="bracket-round-title">${esc(rName)}</div><div class="bracket-matches">`;
    
    roundsMap[rName].forEach(m => {
      const res = String(m.result || "").trim().toLowerCase();
      const p1Won = ["p1","player1","1","win1"].includes(res) || res === String(m.player1).toLowerCase()+" win";
      const p2Won = ["p2","player2","2","win2"].includes(res) || res === String(m.player2).toLowerCase()+" win";
      
      bracketHTML += `
        <div class="bracket-match">
          <div class="bracket-player ${p1Won ? 'winner' : ''}">
            <span class="p-name">${esc(m.player1 || 'TBA')}</span>
            ${p1Won ? '<span class="win-badge">✔</span>' : ''}
          </div>
          <div class="bracket-player ${p2Won ? 'winner' : ''}">
            <span class="p-name">${esc(m.player2 || 'TBA')}</span>
            ${p2Won ? '<span class="win-badge">✔</span>' : ''}
          </div>
          <div class="bracket-info">
            <span>📅 ${esc(m.date || 'TBA')}</span>
            <span>⏰ ${esc(m.time || 'TBA')}</span>
          </div>
        </div>
      `;
    });

    bracketHTML += `</div></div>`;
  });

  bracketHTML += `</div>`;
  container.innerHTML = bracketHTML;
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
$("menuBtn").addEventListener("click", ()=>$("navLinks").classList.toggle("open"));

loadData();
setInterval(loadData, window.REFRESH_MS || 30000);