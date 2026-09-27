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

You update Google Sheets, and the public website refreshes the data automatically.

## Folder structure

```text
aero-chess-open/
├── index.html
├── style.css
├── app.js
└── config.js
```

(The `google-apps-script/` folder from the previous version is no longer needed — safe to delete it from the repo.)

## 1. Create the Google Sheet

Create a new Google Sheet named:

`Aero Chess Open — Season 1`

Create 3 tabs:

### Settings

| A | B |
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

## 2. Share the sheet so the site can read it

No Apps Script backend needed anymore. The site reads the sheet directly.

In the Google Sheet: **Share** → **General access** → **Anyone with the link** → **Viewer**.

This only lets people *view* it — the same as opening the link today — it does not let anyone edit it.

> **Why this changed:** the old version needed you to paste the Apps Script's Code.gs into `Extensions -> Apps Script`, deploy it as a Web App, and paste the generated URL into `config.js` as `API_URL`. That step never got completed, so `API_URL` stayed empty and the site silently fell back to the sample/demo data (Arjun, Rahul, Karthik, Vishnu) baked into `app.js` — that's why it looked like it wasn't reading the sheet. The `google-apps-script/` folder is no longer used and can be deleted from the repo.

## 3. Set your Sheet ID

Open `config.js`. It's pre-filled with your current sheet's ID:

```javascript
const SHEET_ID = "1TU7oxekoErJuN9eIZFujQTNRbCMAqBky-p-3WysGTpk";
```

The ID is the long string in your sheet's URL, between `/d/` and `/edit`. If you ever create a new sheet, update this value here.

## 4. Host the website for free

GitHub Pages is suitable for this static HTML/CSS/JavaScript website.

Create a public GitHub repository, for example:

`aero-chess-open`

Upload:

```text
index.html
style.css
app.js
config.js
```

Then:

`Repository -> Settings -> Pages`

Choose:

`Deploy from a branch`

Select:

`main`

and:

`/ (root)`

Save.

GitHub will give you a URL similar to:

```text
https://YOUR-GITHUB-USERNAME.github.io/aero-chess-open/
```

Share that link with your class.

## Updating the tournament

You only edit the Google Sheet.

### Add a player

Add a row to Players.

### Collect ₹10

Change:

```text
paid = NO
```

to:

```text
paid = YES
```

The prize pool automatically changes.

Example:

10 paid players:

`10 × ₹10 = ₹100`

25 paid players:

`25 × ₹10 = ₹250`

### Add a match

Add a row to Matches.

### Enter a result

Change `Pending` to:

```text
P1
```

or

```text
P2
```

or

```text
Draw
```

The standings update automatically.

## Important

This version deliberately keeps money/payment records simple: it displays the total collected amount based on the `paid` column. Do not put bank account numbers, UPI credentials, phone numbers, or other sensitive personal information in the public-facing sheet.

The site re-checks the sheet every 30 seconds, so players normally see updates without refreshing.

## Troubleshooting

If the page says "Could not load the sheet… Showing demo data":

- Confirm sharing is **Anyone with the link → Viewer** (not "Restricted").
- Confirm the tab names are exactly `Settings`, `Players`, `Matches`.
- Confirm `SHEET_ID` in `config.js` matches your sheet's current URL.
