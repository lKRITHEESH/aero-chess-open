// ============================================================
// Aero Chess Open — reads live data straight from the Google Sheet.
// No Apps Script, no backend deployment. The sheet just needs to be
// shared as "Anyone with the link can view".
// ============================================================

const state = {
  settings: {},
  players: [],
  matches: [],
  playerSearch: "",
  roundFilter: "ALL",
};

function gvizUrl(tabName) {
  return (
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=` +
    encodeURIComponent(tabName) +
    `&_=${Date.now()}` // cache-bust so updates show up promptly
  );
}

function cellValue(cell) {
  if (!cell) return "";
  if (cell.f !== undefined && cell.f !== null && cell.f !== "") return cell.f;
  if (cell.v === undefined || cell.v === null) return "";
  return cell.v;
}

async function fetchTab(tabName) {
  const res = await fetch(gvizUrl(tabName));
  if (!res.ok) throw new Error(`Could not load tab "${tabName}" (HTTP ${res.status})`);
  const text = await res.text();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`Tab "${tabName}" did not return readable data. Is the sheet shared as "Anyone with the link can view"?`);
  }
  const json = JSON.parse(text.substring(start, end + 1));
  if (!json.table) return [];

  let headers = json.table.cols.map((c) => (c.label || "").trim());
  let rows = json.table.rows || [];

  // If Google didn't auto-detect header labels, treat the first row as headers.
  if (headers.every((h) => h === "")) {
    if (rows.length === 0) return [];
    headers = (rows[0].c || []).map((c) => String(cellValue(c)).trim());
    rows = rows.slice(1);
  }

  return rows
    .map((r) => {
      const obj = {};
      (r.c || []).forEach((cell, i) => {
        const key = headers[i] || `col${i}`;
        obj[key] = cellValue(cell);
      });
      return obj;
    })
    .filter((obj) => Object.values(obj).some((v) => String(v).trim() !== ""));
}

function settingsRowsToObject(rows) {
  const out = {};
  rows.forEach((r) => {
    const keys = Object.keys(r);
    const keyCol = keys.find((k) => k.toLowerCase() === "key") || keys[0];
    const valCol = keys.find((k) => k.toLowerCase() === "value") || keys[1];
    if (r[keyCol] !== undefined && String(r[keyCol]).trim() !== "") {
      out[String(r[keyCol]).trim()] = r[valCol] !== undefined ? r[valCol] : "";
    }
  });
  return out;
}

async function loadAllData() {
  const [settingsRows, players, matches] = await Promise.all([
    fetchTab(SHEET_TABS.settings),
    fetchTab(SHEET_TABS.players),
    fetchTab(SHEET_TABS.matches),
  ]);
  state.settings = settingsRowsToObject(settingsRows);
  state.players = players;
  state.matches = matches;
}

// ---------- Rendering ----------

function renderEventInfo() {
  const s = state.settings;
  document.getElementById("event-date").textContent = s.eventDate || "TBA";
  document.getElementById("event-venue").textContent = s.venue || "TBA";
  document.getElementById("event-time-control").textContent = s.timeControl || "TBA";
  document.getElementById("event-fee").textContent = s.fee ? `₹${s.fee}` : "—";
  document.getElementById("event-prize-note").textContent = s.prizeNote || "";
}

function renderStats() {
  const totalPlayers = state.players.length;
  const fee = parseFloat(state.settings.fee) || 0;
  const paidCount = state.players.filter((p) => String(p.paid).trim().toUpperCase() === "YES").length;
  const collected = fee * paidCount;

  document.getElementById("stat-registered").textContent = totalPlayers;
  document.getElementById("stat-paid").textContent = paidCount;
  document.getElementById("stat-collected").textContent = `₹${collected}`;
  document.getElementById("stat-prize").textContent = `₹${collected}`;
}

function renderPlayers() {
  const list = document.getElementById("players-list");
  const query = state.playerSearch.trim().toLowerCase();
  const filtered = state.players.filter((p) =>
    String(p.name || "").toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    list.innerHTML = `<li class="empty">No players found.</li>`;
    return;
  }

  list.innerHTML = filtered
    .map((p) => {
      const paid = String(p.paid).trim().toUpperCase() === "YES";
      return `
        <li class="player-row">
          <span class="player-name">${escapeHtml(p.name || "Unnamed")}</span>
          <span class="badge ${paid ? "badge-paid" : "badge-unpaid"}">${paid ? "Paid" : "Unpaid"}</span>
          <span class="player-status">${escapeHtml(p.status || "")}</span>
        </li>`;
    })
    .join("");
}

function normalizedResult(r) {
  return String(r || "").trim().toLowerCase();
}

function computeStandings() {
  const points = {};
  const played = {};
  const wins = {};
  const draws = {};
  const losses = {};

  state.players.forEach((p) => {
    const name = p.name || "Unnamed";
    points[name] = 0;
    played[name] = 0;
    wins[name] = 0;
    draws[name] = 0;
    losses[name] = 0;
  });

  state.matches.forEach((m) => {
    const p1 = m.player1;
    const p2 = m.player2;
    const result = normalizedResult(m.result);
    if (!p1 || !p2) return;
    if (!(p1 in points)) points[p1] = played[p1] = wins[p1] = draws[p1] = losses[p1] = 0;
    if (!(p2 in points)) points[p2] = played[p2] = wins[p2] = draws[p2] = losses[p2] = 0;

    if (result === "p1") {
      played[p1]++; played[p2]++;
      points[p1] += 1; wins[p1]++;
      losses[p2]++;
    } else if (result === "p2") {
      played[p1]++; played[p2]++;
      points[p2] += 1; wins[p2]++;
      losses[p1]++;
    } else if (result === "draw") {
      played[p1]++; played[p2]++;
      points[p1] += 0.5; points[p2] += 0.5;
      draws[p1]++; draws[p2]++;
    }
    // "Pending" or anything else: not counted yet
  });

  return Object.keys(points)
    .map((name) => ({
      name,
      points: points[name],
      played: played[name],
      wins: wins[name],
      draws: draws[name],
      losses: losses[name],
    }))
    .sort((a, b) => b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name));
}

function renderStandings() {
  const tbody = document.getElementById("standings-body");
  const standings = computeStandings();

  if (standings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">No standings yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = standings
    .map(
      (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(s.name)}</td>
        <td>${s.played}</td>
        <td>${s.wins}-${s.draws}-${s.losses}</td>
        <td><strong>${s.points}</strong></td>
      </tr>`
    )
    .join("");
}

function renderRoundFilterOptions() {
  const select = document.getElementById("round-filter");
  const rounds = [];
  state.matches.forEach((m) => {
    if (m.round && !rounds.includes(m.round)) rounds.push(m.round);
  });

  const current = state.roundFilter;
  select.innerHTML =
    `<option value="ALL">All rounds</option>` +
    rounds.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join("");
  select.value = rounds.includes(current) ? current : "ALL";
  state.roundFilter = select.value;
}

function resultBadge(result) {
  const r = normalizedResult(result);
  if (r === "p1") return `<span class="badge badge-result">Player 1 won</span>`;
  if (r === "p2") return `<span class="badge badge-result">Player 2 won</span>`;
  if (r === "draw") return `<span class="badge badge-result">Draw</span>`;
  return `<span class="badge badge-pending">Pending</span>`;
}

function renderMatches() {
  const container = document.getElementById("matches-list");
  const filtered = state.matches.filter(
    (m) => state.roundFilter === "ALL" || m.round === state.roundFilter
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty">No matches found.</div>`;
    return;
  }

  container.innerHTML = filtered
    .map(
      (m) => `
      <div class="match-card">
        <div class="match-round">${escapeHtml(m.round || "")}</div>
        <div class="match-players">
          <span>${escapeHtml(m.player1 || "TBD")}</span>
          <span class="vs">vs</span>
          <span>${escapeHtml(m.player2 || "TBD")}</span>
        </div>
        <div class="match-meta">
          <span>${escapeHtml(m.date || "")}</span>
          <span>${escapeHtml(m.time || "")}</span>
          ${resultBadge(m.result)}
        </div>
      </div>`
    )
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderAll() {
  renderEventInfo();
  renderStats();
  renderPlayers();
  renderRoundFilterOptions();
  renderMatches();
  renderStandings();
}

function setStatus(message, isError) {
  const el = document.getElementById("sync-status");
  el.textContent = message;
  el.classList.toggle("status-error", !!isError);
}

async function refresh(showLoading) {
  if (showLoading) setStatus("Loading tournament data…", false);
  try {
    await loadAllData();
    renderAll();
    const now = new Date();
    setStatus(`Last updated ${now.toLocaleTimeString()}`, false);
  } catch (err) {
    console.error(err);
    setStatus(
      "Couldn't load the sheet. Make sure it's shared as 'Anyone with the link can view'. " +
        (err && err.message ? err.message : ""),
      true
    );
  }
}

function init() {
  document.getElementById("player-search").addEventListener("input", (e) => {
    state.playerSearch = e.target.value;
    renderPlayers();
  });

  document.getElementById("round-filter").addEventListener("change", (e) => {
    state.roundFilter = e.target.value;
    renderMatches();
  });

  document.getElementById("refresh-btn").addEventListener("click", () => refresh(true));

  refresh(true);
  setInterval(() => refresh(false), REFRESH_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", init);
