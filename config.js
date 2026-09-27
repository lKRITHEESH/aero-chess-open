/*
  AERO CHESS OPEN — DATA CONNECTION

  This site reads your Google Sheet directly (its public CSV export).
  No Google Apps Script / backend deployment is needed.

  Requirements for this to work:
  1. The Google Sheet must be shared as "Anyone with the link" -> "Viewer".
     (Share button, top right of the Sheet -> General access -> Anyone with the link)
  2. The Sheet must have exactly 3 tabs named: Settings, Players, Matches
     (see README.md for the exact column headers each tab needs).

  SHEET_ID is the long ID in your Google Sheet's URL:
  https://docs.google.com/spreadsheets/d/  <-- THIS PART -->  /edit
*/
const SHEET_ID = "1TU7oxekoErJuN9eIZFujQTNRbCMAqBky-p-3WysGTpk";

const SHEET_TABS = {
  settings: "Settings",
  players: "Players",
  matches: "Matches"
};

const REFRESH_MS = 30000;

function sheetCsvUrl(tabName) {
  return (
    "https://docs.google.com/spreadsheets/d/" +
    SHEET_ID +
    "/gviz/tq?tqx=out:csv&sheet=" +
    encodeURIComponent(tabName)
  );
}
