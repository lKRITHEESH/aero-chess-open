# ♟ Season 1 — Aero Chess Open

A free, mobile-friendly tournament website for the 3rd Year Aerospace Engineering chess event.

This version reads your Google Sheet **directly** — there is no Google Apps Script backend to write or deploy anymore. That was the reason the old version showed no data: `config.js` needed a Web App URL from a manually deployed script, and that step never got finished. Now the site just needs your Sheet ID.

## What it shows

- Player list, searchable
- Match pairings with a round filter
- Match date/time and results
- Automatic standings (1 point win, 0.5 draw)
- Registered player count, amount collected, prize pool
- Event date, venue, time control
- Auto-refreshes every 30 seconds

You only ever edit the Google Sheet. The website updates itself.

## Folder structure

```
aero-chess-open/
├── index.html
├── style.css
├── app.js
├── config.js
└── README.md
```

(The old `google-apps-script/` folder is no longer needed — you can delete it.)

## 1. Your Google Sheet

Keep the same 3 tabs, with the same headers, as before:

**Settings** — key/value pairs: `eventDate`, `venue`, `fee`, `timeControl`, `prizeNote`

**Players** — headers: `id | name | paid | status` (paid = `YES` or `NO`)

**Matches** — headers: `round | player1 | player2 | date | time | result`
(`result` = `P1`, `P2`, `Draw`, or `Pending`)

## 2. Share the sheet so the site can read it

In the Google Sheet: **Share** → **General access** → **Anyone with the link** → **Viewer**.

This does not let anyone edit it — only view it, the same as anyone opening the shared link today. No sign-in, no API key, no Apps Script needed.

## 3. Set your Sheet ID

Open `config.js`. It's pre-filled with the ID from your current sheet:

```js
const SHEET_ID = "1TU7oxekoErJuN9eIZFujQTNRbCMAqBky-p-3WysGTpk";
```

The ID is the long string in your sheet's URL, between `/d/` and `/edit`. If you ever create a new sheet, update this value.

## 4. Push these files to GitHub

Replace `index.html`, `style.css`, `app.js`, `config.js`, and `README.md` in your `aero-chess-open` repo with the versions here (via the GitHub web UI's "Add file → Upload files, or `git add . && git commit -m "rebuild site" && git push`).

## 5. GitHub Pages

Already set up per your repo — no change needed:

`Settings → Pages → Deploy from a branch → main → / (root)`

Your site stays at:

```
https://YOUR-GITHUB-USERNAME.github.io/aero-chess-open/
```

## Updating the tournament

Just edit the Google Sheet — add players, mark `paid = YES`, add matches, change `Pending` to `P1`/`P2`/`Draw`. The site picks it up within 30 seconds, no redeploy needed.

## Troubleshooting

If the site shows "Couldn't load the sheet…":
- Confirm sharing is set to **Anyone with the link → Viewer** (not "Restricted").
- Confirm the tab names are exactly `Settings`, `Players`, `Matches`.
- Confirm `SHEET_ID` in `config.js` matches your sheet's URL.

## Important

This keeps money records simple: it only shows the total collected based on the `paid` column. Do not put bank account numbers, UPI IDs, or phone numbers in the public sheet.
