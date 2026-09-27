# ♟ Season 1 — Aero Chess Open

A free, mobile-friendly tournament website for the 3rd Year Aerospace Engineering chess event.

## What this version does

Players can open one public link and see:

- Player list
- Searchable players
- Match pairings
- Round filter
- Match date/time
- Results
- Automatic standings
- Registered player count
- Amount collected
- Prize pool
- Rapid format / 10 minutes per player
- Venue and event information

The organizer does NOT need to edit the website every time.

You update the Google Sheet, and the public website reads it directly and refreshes
automatically every 30 seconds. **There is no backend to deploy** — the site reads the
sheet's public CSV export straight from the browser.

## Folder structure

```text
aero-chess-open/
├── index.html
├── style.css
├── app.js
└── config.js
```

## 1. Set up the Google Sheet

Your sheet: `Aero Chess Open — Season 1`

It needs exactly 3 tabs, named exactly:

### Settings

Headers: `key`, `value`

| key | value |
|---|---|
| eventDate | September 30 onwards |
| venue | Aero 3rd Year Classroom |
| fee | 10 |
| timeControl | 10 minutes per player |
| prizeNote | The collected registration amount goes to the Winner and Runner-Up. |

### Players

Use exactly these headers:

| id | name | paid | status |
|---|---|---|---|
| 1 | Arjun | YES | Registered |
| 2 | Rahul | YES | Registered |
| 3 | Karthik | NO | Registered |

Set `paid` to YES only after the ₹10 has been collected.

### Matches

Use exactly these headers:

| round | player1 | player2 | date | time | result |
|---|---|---|---|---|---|
| Round 1 | Arjun | Rahul | Sep 30 | 2:00 PM | Pending |
| Round 1 | Karthik | Vishnu | Sep 30 | 2:20 PM | Pending |

For results, use:

- `P1` = player 1 won
- `P2` = player 2 won
- `Draw` = draw

Example:

```text
Round 1 | Arjun | Rahul | Sep 30 | 2:00 PM | P1
```

The website then awards Arjun 1 point.

## 2. Make the sheet publicly viewable

This is the step that makes the website able to read it.

In the Google Sheet: `Share` (top right) → `General access` → change to
**`Anyone with the link`** → role **`Viewer`** → `Done`.

You are only making it *viewable*, not editable, so nobody else can change your data.
Don't put phone numbers, UPI IDs, or bank details in this sheet, since it's public.

## 3. Connect the website to your sheet

Open `config.js` and check the `SHEET_ID` — it must match the long ID in your
sheet's URL:

```text
https://docs.google.com/spreadsheets/d/  <-- THIS PART -->  /edit
```

This repo is already set to:

```javascript
const SHEET_ID = "1TU7oxekoErJuN9eIZFujQTNRbCMAqBky-p-3WysGTpk";
```

If you ever copy this sheet or make a new one, update `SHEET_ID` in `config.js` to match.

## 4. Host the website for free

GitHub Pages is suitable for this static HTML/CSS/JavaScript website.

In this repository:

`Settings -> Pages`

Choose:

`Deploy from a branch`

Select:

`main` and `/ (root)`

Save.

GitHub will give you a URL similar to:

```text
https://YOUR-GITHUB-USERNAME.github.io/aero-chess-open/
```

Share that link with your class.

## Updating the tournament

You only edit the Google Sheet. The website re-reads it automatically every 30 seconds
(or the player can just refresh the page).

### Add a player

Add a row to Players.

### Collect ₹10

Change `paid = NO` to `paid = YES`. The prize pool automatically changes.

Example:

10 paid players: `10 × ₹10 = ₹100`

25 paid players: `25 × ₹10 = ₹250`

### Add a match

Add a row to Matches.

### Enter a result

Change `Pending` to `P1`, `P2`, or `Draw`. The standings update automatically.

## Troubleshooting

If the site shows demo data (Arjun / Rahul / Karthik / Vishnu) instead of your real
players, open the browser console (F12) — the footer message and console will tell you
why, almost always one of:

- The sheet isn't shared as "Anyone with the link – Viewer" (see step 2).
- A tab isn't named exactly `Settings`, `Players`, or `Matches`.
- `SHEET_ID` in `config.js` doesn't match your sheet's URL.

## Important

This version deliberately keeps money/payment records simple: it displays the total
collected amount based on the `paid` column. Do not put bank account numbers, UPI
credentials, phone numbers, or other sensitive personal information in the
public-facing sheet — remember, the whole sheet is publicly viewable by link.
