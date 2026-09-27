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
├── config.js
└── google-apps-script/
    ├── Code.gs
    └── README.md
```

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

## 2. Create the Google Apps Script backend

Open the Google Sheet.

Go to:

`Extensions -> Apps Script`

Open `google-apps-script/Code.gs` from this project and paste it into the Apps Script editor.

Save it.

## 3. Deploy the backend

In Apps Script:

`Deploy -> New deployment`

Select:

`Web app`

Use:

`Execute as: Me`

For access, choose:

`Anyone`

Deploy and authorize it if Google asks.

Copy the generated Web App URL.

It will look similar to:

```text
https://script.google.com/macros/s/XXXXXXXXXXXX/exec
```

## 4. Connect the website

Open `config.js`.

Change:

```javascript
const API_URL = "";
```

to:

```javascript
const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
```

Do not add extra quotes around the URL beyond the JavaScript string.

## 5. Host the website for free

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

The site polls the backend every 30 seconds, so players normally see updates without refreshing.

