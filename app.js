const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const val=c=>c?(c.f??c.v??""):"";
let season=new URLSearchParams(location.search).get("season");if(!SEASONS[season])season=DEFAULT_SEASON;
let state={settings:{},players:[],matches:[]},timer=null;

async function fetchTab(id,name){
  const r=await fetch(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(name)}&_=${Date.now()}`);
  if(!r.ok)throw new Error("HTTP "+r.status);
  const t=await r.text(),j=JSON.parse(t.slice(t.indexOf("{"),t.lastIndexOf("}")+1));
  let h=j.table.cols.map(c=>(c.label||"").trim()),rows=j.table.rows||[];
  if(h.every(x=>!x)&&rows.length){h=rows[0].c.map(c=>String(val(c)).trim());rows=rows.slice(1)}
  return rows.map(r=>Object.fromEntries(h.map((k,i)=>[k||"c"+i,val(r.c[i])]))).filter(o=>Object.values(o).some(v=>String(v).trim()));
}
function standings(){
  const m={};state.players.forEach(p=>m[p.name]={name:p.name,played:0,w:0,d:0,l:0,pts:0});
  state.matches.forEach(x=>{const a=m[x.player1],b=m[x.player2],r=String(x.result||"").trim().toLowerCase();if(!a||!b)return;
    if(["p1","player1","1","win1",String(x.player1).toLowerCase()+" win"].includes(r)){a.w++;a.pts++;b.l++}
    else if(["p2","player2","2","win2",String(x.player2).toLowerCase()+" win"].includes(r)){b.w++;b.pts++;a.l++}
    else if(["draw","d","½-½","0.5-0.5"].includes(r)){a.d++;b.d++;a.pts+=.5;b.pts+=.5}else return;a.played++;b.played++});
  return Object.values(m).sort((x,y)=>y.pts-x.pts||y.w-x.w||x.name.localeCompare(y.name));
}
function drawSeasons(){
  $("seasons").innerHTML=Object.keys(SEASONS).sort((a,b)=>b-a).map(k=>`<button data-s="${k}" class="${k==season?"on":""}">${esc(SEASONS[k].label)}${SEASONS[k].status=="completed"?" · Archive":""}</button>`).join("");
  $("seasons").querySelectorAll("button").forEach(b=>b.onclick=()=>{season=b.dataset.s;history.replaceState(null,"","?season="+season+location.hash);start()});
}
function render(){
  const S=SEASONS[season],d=S.defaults,s={...d,...state.settings},players=state.players,matches=state.matches;
  const paid=players.filter(p=>String(p.paid).toUpperCase()==="YES").length,fee=Number(s.fee||10),prize=paid*fee;
  document.title="Aero Chess Open · "+S.label;
  $("badge").textContent=S.label.toUpperCase();$("venueLine").textContent=String(s.venue).toUpperCase();
  if(S.poster){$("poster").src=S.poster;$("poster").hidden=false;$("glyph").hidden=true}else{$("poster").hidden=true;$("glyph").hidden=false}
  $("hub").href=$("hub2").href=HUB_URL;
  $("playerCount").textContent=players.length||"–";$("registeredCount").textContent=players.length||"–";$("collectedCount").textContent=paid+" paid";
  $("prizePool").textContent=money(prize);$("prizeBig").textContent=money(prize);$("feeText").textContent=money(fee);
  $("eventDate").textContent=s.eventDate;$("prizeNote").textContent=s.prizeNote;$("venue").textContent=s.venue;$("tc").textContent=s.timeControl;
  const w=String(state.settings.winner||"").trim();$("champ").hidden=!w;
  if(w){$("cs").textContent=season;$("champName").textContent=w;$("champRunner").textContent=state.settings.runnerUp?"Runner-up: "+state.settings.runnerUp:""}
  const note=$("note");if(!S.sheetId){note.hidden=false;note.textContent="Season 2 details are coming soon. Players, matches and standings will appear here once registrations open."}else note.hidden=true;
  renderPlayers();renderRounds();renderMatches();
  const rows=standings();$("standingsBody").innerHTML=rows.length?rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.name)}</td><td>${r.played}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.pts}</td></tr>`).join(""):`<tr><td colspan="7">No standings yet.</td></tr>`;
  $("updatedAt").textContent=S.sheetId?"Updated "+new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"";
}
function renderPlayers(){const q=$("playerSearch").value.trim().toLowerCase(),f=state.players.filter(p=>String(p.name).toLowerCase().includes(q));
  $("playersGrid").innerHTML=f.length?f.map((p,i)=>`<div class="pc"><div><small>PLAYER ${i+1}</small><b>${esc(p.name)}</b></div><i>${esc(p.status||"Registered")}</i></div>`).join(""):`<div class="empty" style="grid-column:1/-1">No players yet.</div>`}
function renderRounds(){const sel=$("roundFilter"),old=sel.value,rs=[...new Set(state.matches.map(m=>m.round).filter(Boolean))];
  sel.innerHTML=`<option value="all">All rounds</option>`+rs.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join("");sel.value=rs.includes(old)?old:"all"}
function renderMatches(){const f=$("roundFilter").value,ms=f==="all"?state.matches:state.matches.filter(m=>m.round===f);
  $("matchesList").innerHTML=ms.length?ms.map(m=>`<div class="mc"><div class="rd">${esc(m.round||"Match")}</div><b>${esc(m.player1)}</b><div class="vs">VS</div><b>${esc(m.player2)}</b><div class="mt">📅 ${esc(m.date||"TBA")}<br>⏰ ${esc(m.time||"TBA")}<br><span class="res">${esc(m.result||"Pending")}</span></div></div>`).join(""):`<div class="empty">No matches published yet.</div>`}
async function load(){const S=SEASONS[season];state={settings:{},players:[],matches:[]};
  if(!S.sheetId)return render();
  try{const[a,p,m]=await Promise.all([fetchTab(S.sheetId,SHEET_TABS.settings),fetchTab(S.sheetId,SHEET_TABS.players),fetchTab(S.sheetId,SHEET_TABS.matches)]);
    const s={};a.forEach(r=>{const k=Object.keys(r),key=String(r[k[0]]).trim();if(key)s[key]=r[k[1]]});
    if(s.fee)s.fee=Number(s.fee);state={settings:s,players:p,matches:m};render()}
  catch(e){console.error(e);render();$("updatedAt").textContent="Could not load the sheet. Check it is shared as \"Anyone with the link can view\"."}}
function start(){drawSeasons();clearInterval(timer);load();timer=setInterval(load,window.REFRESH_MS||30000)}
$("playerSearch").addEventListener("input",renderPlayers);$("roundFilter").addEventListener("change",renderMatches);
start();
