/*
AERO CHESS OPEN — Frontend application
*/

const sampleData = {
  settings: {
    eventDate: "September 30 onwards",
    venue: "Aero 3rd Year Classroom",
    fee: 10,
    timeControl: "10 minutes per player",
    prizeNote: "The collected registration amount goes to the Winner and Runner-Up."
  },
  players: [
    { id: "1", name: "Arjun", paid: "YES", status: "Registered" },
    { id: "2", name: "Rahul", paid: "YES", status: "Registered" },
    { id: "3", name: "Karthik", paid: "YES", status: "Registered" },
    { id: "4", name: "Vishnu", paid: "NO", status: "Registered" }
  ],
  matches: [
    { round: "Round 1", player1: "Arjun", player2: "Rahul", date: "Sep 30", time: "2:00 PM", result: "Pending" },
    { round: "Round 1", player1: "Karthik", player2: "Vishnu", date: "Sep 30", time: "2:20 PM", result: "Pending" }
  ]
};

let state = cloneData(sampleData);

function $(id) { return document.getElementById(id); }

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function normalize(raw) {
  if (!raw || typeof raw !== "object") return cloneData(sampleData);

  const settings = { ...sampleData.settings, ...(raw.settings || {}) };

  const players = Array.isArray(raw.players)
    ? raw.players.map((player, index) => ({
        id: String(player.id ?? index + 1),
        name: String(player.name ?? "").trim(),
        paid: String(player.paid ?? "NO").trim(),
        status: String(player.status ?? "Registered").trim()
      })).filter(player => player.name)
    : [];

  const matches = Array.isArray(raw.matches)
    ? raw.matches.map(match => ({
        round: String(match.round ?? "Round 1").trim(),
        player1: String(match.player1 ?? "").trim(),
        player2: String(match.player2 ?? "").trim(),
        date: String(match.date ?? "").trim(),
        time: String(match.time ?? "").trim(),
        result: String(match.result ?? "Pending").trim()
      })).filter(match => match.player1 && match.player2)
    : [];

  return { settings, players, matches };
}

function calculateStandings(players, matches) {
  const map = {};

  players.forEach(player => {
    const name = String(player.name).trim();
    if (!name) return;
    map[name] = { name, played: 0, w: 0, d: 0, l: 0, pts: 0 };
  });

  matches.forEach(match => {
    const player1 = String(match.player1 || "").trim();
    const player2 = String(match.player2 || "").trim();
    if (!map[player1] || !map[player2]) return;

    const result = String(match.result || "").trim().toLowerCase();

    if (!result || ["—", "-", "pending", "scheduled", "tba"].includes(result)) return;

    map[player1].played++;
    map[player2].played++;

    if (["p1", "player1", "1", "win1"].includes(result)) {
      map[player1].w++;
      map[player1].pts += 1;
      map[player2].l++;
      return;
    }

    if (["p2", "player2", "2", "win2"].includes(result)) {
      map[player2].w++;
      map[player2].pts += 1;
      map[player1].l++;
      return;
    }

    if (["draw", "d", "½-½", "0.5-0.5", "1/2-1/2"].includes(result)) {
      map[player1].d++;
      map[player2].d++;
      map[player1].pts += 0.5;
      map[player2].pts += 0.5;
    }
  });

  return Object.values(map).sort((a, b) =>
    b.pts - a.pts || b.w - a.w || a.name.localeCompare(b.name)
  );
}

function render() {
  const settings = state.settings || sampleData.settings;
  const players = Array.isArray(state.players) ? state.players : [];
  const matches = Array.isArray(state.matches) ? state.matches : [];

  const paidCount = players.filter(player =>
    String(player.paid).trim().toUpperCase() === "YES"
  ).length;

  const fee = Number(settings.fee || 10);
  const prize = paidCount * fee;

  $("playerCount").textContent = players.length;
  $("registeredCount").textContent = players.length;
  $("collectedCount").textContent = `${paidCount} paid`;
  $("prizePool").textContent = money(prize);
  $("prizeBig").textContent = money(prize);
  $("eventDate").textContent = settings.eventDate || "Sep 30 onwards";
  $("prizeNote").textContent = settings.prizeNote || "Collected registration amount goes to the Winner and Runner-Up.";

  if ($("venueText")) $("venueText").textContent = settings.venue || "Aero 3rd Year Classroom";
  if ($("timeControlText")) $("timeControlText").textContent = settings.timeControl || "10 minutes per player";

  renderPlayers(players);
  renderRounds(matches);
  renderMatches(matches);
  renderStandings(players, matches);
}

function renderPlayers(players) {
  const query = $("playerSearch") ? $("playerSearch").value.trim().toLowerCase() : "";
  const filtered = players.filter(player => String(player.name).toLowerCase().includes(query));

  if (!filtered.length) {
    $("playersGrid").innerHTML = `<div class="empty">No players found.</div>`;
    return;
  }

  $("playersGrid").innerHTML = filtered.map((player, index) => `
    <article class="player-card">
      <div>
        <div class="player-number">PLAYER ${index + 1}</div>
        <div class="player-name">${esc(player.name)}</div>
      </div>
      <div class="player-status">${esc(player.status || "Registered")}</div>
    </article>
  `).join("");
}

function renderRounds(matches) {
  const select = $("roundFilter");
  if (!select) return;

  const oldValue = select.value;
  const rounds = [...new Set(matches.map(match => match.round).filter(Boolean))];

  select.innerHTML = `<option value="all">All rounds</option>` +
    rounds.map(round => `<option value="${esc(round)}">${esc(round)}</option>`).join("");

  select.value = rounds.includes(oldValue) ? oldValue : "all";
}

function renderMatches(matches) {
  const filter = $("roundFilter") ? $("roundFilter").value : "all";
  const filtered = filter === "all" ? matches : matches.filter(match => match.round === filter);

  if (!filtered.length) {
    $("matchesList").innerHTML = `<div class="empty">No matches published yet.</div>`;
    return;
  }

  $("matchesList").innerHTML = filtered.map(match => `
    <article class="match-card">
      <div class="round">${esc(match.round || "Match")}</div>
      <div class="player-a">${esc(match.player1)}</div>
      <div class="vs">VS</div>
      <div class="player-b">${esc(match.player2)}</div>
      <div class="match-meta">
        📅 ${esc(match.date || "TBA")}<br>
        ⏰ ${esc(match.time || "TBA")}
        <div class="result">${esc(match.result || "Pending")}</div>
      </div>
    </article>
  `).join("");
}

function renderStandings(players, matches) {
  const rows = calculateStandings(players, matches);

  if (!rows.length) {
    $("standingsBody").innerHTML = `<tr><td colspan="7">No standings yet.</td></tr>`;
    return;
  }

  $("standingsBody").innerHTML = rows.map((row, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${esc(row.name)}</td>
      <td>${row.played}</td>
      <td>${row.w}</td>
      <td>${row.d}</td>
      <td>${row.l}</td>
      <td>${row.pts}</td>
    </tr>
  `).join("");
}

let jsonpCounter = 0;

function loadDataJSONP(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `aeroChessCallback_${Date.now()}_${jsonpCounter++}`;
    const script = document.createElement("script");
    let finished = false;

    const cleanup = () => {
      finished = true;
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    const timeout = setTimeout(() => {
      if (finished) return;
      cleanup();
      reject(new Error("Google Apps Script request timed out."));
    }, 15000);

    window[callbackName] = data => {
      if (finished) return;
      clearTimeout(timeout);
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      if (finished) return;
      clearTimeout(timeout);
      cleanup();
      reject(new Error("Could not connect to Google Apps Script."));
    };

    const separator = url.includes("?") ? "&" : "?";
    script.src = `${url}${separator}callback=${encodeURIComponent(callbackName)}&t=${Date.now()}`;
    script.async = true;
    document.head.appendChild(script);
  });
}

async function loadData() {
  const apiUrl = String(window.API_URL || "").trim();

  if (!apiUrl) {
    state = cloneData(sampleData);
    render();
    $("updatedAt").textContent = "Demo data loaded — connect Google Sheets to enable live data.";
    return;
  }

  try {
    $("updatedAt").textContent = "Loading live tournament data…";

    const raw = await loadDataJSONP(apiUrl);

    if (raw && raw.ok === false) {
      throw new Error(raw.error || "Backend returned an error.");
    }

    state = normalize(raw);
    render();

    $("updatedAt").textContent =
      "Live data updated " +
      new Date().toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
  } catch (error) {
    console.error("Aero Chess Open API error:", error);
    state = cloneData(sampleData);
    render();
    $("updatedAt").textContent = "Live data unavailable — showing demo data.";
  }
}

function setupEvents() {
  const playerSearch = $("playerSearch");
  if (playerSearch) {
    playerSearch.addEventListener("input", () => renderPlayers(state.players));
  }

  const roundFilter = $("roundFilter");
  if (roundFilter) {
    roundFilter.addEventListener("change", () => renderMatches(state.matches));
  }

  const menuButton = $("menuBtn");
  const navLinks = $("navLinks");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => navLinks.classList.toggle("open"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  state = cloneData(sampleData);
  render();
  loadData();

  const refresh = Number(window.REFRESH_MS) || 30000;
  setInterval(loadData, refresh);
});
