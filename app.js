// ===== EDIT ONLY THIS FILE to change the site =====
window.HUB = {
  org: {
    name: "Aero Games Hub",
    about: "Aero Games Hub is the home of every game and tournament run by the 3rd Year Aerospace Engineering class. Pick a tournament, check who plays whom, follow the live table and see who takes the crown.",
    sub: "Open to everyone: experienced players, beginners and anyone who just wants a break from class. Registration is small, the rivalry is big."
  },
  // Games used for the filter chips (icon = emoji)
  games: [
    { id: "chess", name: "Chess", icon: "♞" },
    { id: "badminton", name: "Badminton", icon: "🏸" },
    { id: "racing", name: "Racing", icon: "🏁" }
  ],
  // Next event banner (set to null to hide)
  next: { title: "Next tournament coming soon", text: "Want your game here? Tell the organisers and we will set it up.", label: "Suggest a game", url: "mailto:you@example.com" },
  // Photos: put image files in a folder called photos/ in this repo
  photos: [
    { src: "photos/1.jpg", caption: "Round 1" },
    { src: "photos/2.jpg", caption: "Game face on" },
    { src: "photos/3.jpg", caption: "The final" },
    { src: "photos/4.jpg", caption: "Prize time" }
  ],
  tournaments: [
    {
      id: "chess-open-s1", game: "chess", name: "Aero Chess Open", season: "Season 1",
      status: "completed",               // upcoming | live | completed
      date: "Sep 30 onwards",
      poster: "",                        // optional poster image, e.g. "photos/chess-poster.jpg"
      winner: "",                        // leave empty to read from the Google Sheet (Settings tab)
      runnerUp: "",
      url: "https://lkritheesh.github.io/aero-chess-open/",
      sheetId: "1TU7oxekoErJuN9eIZFujQTNRbCMAqBky-p-3WysGTpk"
    },
    {
      id: "chess-open-s2", game: "chess", name: "Aero Chess Open", season: "Season 2",
      status: "upcoming", date: "Dates to be announced",
      poster: "photos/chess-s2-poster.jpg",
      details: ["Venue: Aero 3rd Year Classroom", "For 3rd Year Aero students"],
      winner: "", runnerUp: "", url: "", sheetId: ""
    },
    {
      id: "badminton-open", game: "badminton", name: "Aerospace Badminton Tournament", season: "Season 1",
      status: "upcoming", date: "Dates to be announced",
      poster: "photos/badminton-poster.jpg",
      details: ["Venue: Synthetic Badminton Court, Behind Vasistha", "Badminton Support Coordinator: Viswanath K"],
      winner: "", runnerUp: "", url: "", sheetId: ""
    },
    {
      id: "apex-cup", game: "racing", name: "The Apex Cup Grand Prix", season: "Season 1",
      status: "upcoming", date: "Dates to be announced",
      poster: "photos/apex-cup-poster.jpg",
      details: ["Powered by RaceRoom Racing Experience", "Circuit: Sepang International Circuit"],
      winner: "", runnerUp: "", url: "", sheetId: ""
    }
  ]
};
