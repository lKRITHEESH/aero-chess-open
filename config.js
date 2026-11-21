/*
  AERO CHESS OPEN: SEASONS
  Each season has its own Google Sheet with tabs: Settings, Players, Matches.
  Share each sheet as "Anyone with the link -> Viewer", then paste its ID here
  (the part between /d/ and /edit in the sheet's address).

  Season 2 uses the SAME spreadsheet as Season 1, in extra tabs: S2_Settings, S2_Players, S2_Matches.
  Season 1 keeps its original sheet, so old data stays available at ?season=1
*/
const SEASONS = {
  "2": { label: "Season 2", sheetId: "1TU7oxekoErJuN9eIZFujQTNRbCMAqBky-p-3WysGTpk",
         tabs: { settings: "S2_Settings", players: "S2_Players", matches: "S2_Matches" }, status: "upcoming", poster: "poster-s2.jpg", showPrize: false,
         defaults: { eventDate: "December 1 onwards", venue: "Aero 3rd Year Classroom", fee: 10, timeControl: "10 minutes per player",
                     prizeNote: "The collected registration amount goes to the Winner and Runner-Up." } },
  "1": { label: "Season 1", sheetId: "1TU7oxekoErJuN9eIZFujQTNRbCMAqBky-p-3WysGTpk", status: "completed", poster: "",
         defaults: { eventDate: "September 30 onwards", venue: "Aero 3rd Year Classroom", fee: 10, timeControl: "10 minutes per player",
                     prizeNote: "The collected registration amount went to the Winner and Runner-Up." } }
};
const DEFAULT_SEASON = "2";
const SHEET_TABS = { settings: "Settings", players: "Players", matches: "Matches" };
const HUB_URL = "https://lkritheesh.github.io/aero-sports-hub/";
const REFRESH_MS = 30000;
