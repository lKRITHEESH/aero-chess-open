/*
  AERO CHESS OPEN — DATA CONNECTION

  The website now reads your Google Sheet directly. No Google Apps Script
  backend, no deployment, no URL to paste — that step was where the old
  setup was breaking (API_URL was left empty, so the site always fell back
  to demo data).

  Two things to check:

  1. Share the Google Sheet:
     Share -> General access -> "Anyone with the link" -> Viewer
     (Viewer access only lets people SEE it, not edit it.)

  2. SHEET_ID below must match your sheet's URL, the long string
     between /d/ and /edit:
     https://docs.google.com/spreadsheets/d/  THIS_PART  /edit
*/
const SHEET_ID = "1TU7oxekoErJuN9eIZFujQTNRbCMAqBky-p-3WysGTpk";

const SHEET_TABS = {
  settings: "Settings",
  players: "Players",
  matches: "Matches"
};

const REFRESH_MS = 30000;
