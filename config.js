// ============================================================
// CONFIGURE THIS FILE — that's the only setup step now.
// ============================================================

// The ID is the long string in your sheet's URL, between /d/ and /edit:
// https://docs.google.com/spreadsheets/d/  1TU7oxekoErJuN9eIZFujQTNRbCMAqBky-p-3WysGTpk  /edit
const SHEET_ID = "1TU7oxekoErJuN9eIZFujQTNRbCMAqBky-p-3WysGTpk";

// Tab names inside the sheet — must match exactly (case-sensitive)
const SHEET_TABS = {
  settings: "Settings",
  players: "Players",
  matches: "Matches",
};

// How often the site re-checks the sheet for updates (milliseconds)
const REFRESH_INTERVAL_MS = 30000;
