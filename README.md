# Hopper Station — Order Queue

A live order-queue system for a hopper stall at a Sri Lankan food festival, so
customers don't have to physically stand in line after ordering. Built with
React + Vite, Firebase Firestore (real-time sync), and deployed on Vercel.

## How it works

1. A customer orders and pays at the order counter and gets a physical **token**.
2. They walk to the hopper stall and enter their **token, name and phone
   number** on a kiosk/tablet running the **Token Entry** screen (`/`). This
   adds them to the queue in Firestore — no more standing in line.
3. Staff at the **Order desk** (`/admin`) see new tokens arrive, **accept**
   each order (kicking off the kitchen), then move it to **Preparing**, then
   **Done**.
4. The public **Stall display** (`/display`) — meant for a TV/monitor at the
   stall — shows three live columns: **Orders accepted**, **Preparing**, and
   **Ready for pickup**, plus a QR code customers can scan to check their
   status from their own phone.
5. Once a customer collects their food, staff at the **Pickup counter**
   (`/handover`) mark the order as **handed over**, which removes it from
   every screen.
6. Anyone can check progress any time on **Order status** (`/status`) by
   entering the phone number they used at the queue — this is also where the
   QR code on the stall display points.

Everything reads and writes the same Firestore `orders` collection in real
time (`onSnapshot`), so the stall display, order desk, pickup counter and a
customer's phone all stay in sync automatically.

## Routes

| Route       | Who uses it                | Purpose                                             |
|-------------|-----------------------------|------------------------------------------------------|
| `/`         | Customers (or a staff kiosk)| Enter token, name, phone to join the queue           |
| `/display`  | Public (TV/monitor)         | Live 3-column board + QR code                        |
| `/admin`    | Order desk staff (password) | Accept orders, move through Accepted → Preparing → Done |
| `/handover` | Pickup counter staff (password) | Mark orders as handed over                        |
| `/status`   | Customers                   | Check an order's status by phone number               |

## Order lifecycle

```
queued → accepted → preparing → done → completed
```

- **queued** — created by the Token Entry screen.
- **accepted** — Order desk accepted it; shown in "Orders accepted".
- **preparing** — kitchen started it; shown in "Preparing".
- **done** — ready for pickup; shown in "Ready for pickup" (only the 5 most
  recent, per the stall display spec — the Pickup counter screen still shows
  *all* of them).
- **completed** — handed to the customer; disappears from every screen.

Each order document in the `orders` collection looks like:

```js
{
  token: "42",
  name: "Nimal",
  phone: "0771234567",
  status: "preparing",
  createdAt: Timestamp,
  acceptedAt: Timestamp,
  preparingAt: Timestamp,
  doneAt: Timestamp | null,
  completedAt: Timestamp | null,
}
```

## 1. Set up Firebase

1. Go to the [Firebase console](https://console.firebase.google.com/) and
   create a new project.
2. Add a **Web app** (the `</>` icon) to the project. Copy the config values
   shown (`apiKey`, `authDomain`, `projectId`, etc).
3. In the left menu, open **Build → Firestore Database → Create database**.
   Start in **production mode** (the security rules below take care of
   access — you don't need "test mode").
4. Deploy the security rules and indexes in this repo. Easiest way, with the
   [Firebase CLI](https://firebase.google.com/docs/cli):

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add        # pick your Firebase project
   firebase deploy --only firestore:rules,firestore:indexes
   ```

   If you'd rather not install the CLI, you can instead paste the contents of
   `firestore.rules` into **Firestore → Rules** in the console, and let
   Firestore create each composite index the first time a query needs it — it
   will show a banner with a direct "create index" link in the browser
   console / error message.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in the Firebase values from step 1, and optionally set a custom staff
password:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_PASSWORD=hoppers@123
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open the printed local URL, then visit `/`, `/display`, `/admin`,
`/handover`, and `/status` to try each screen. The default staff password is
**`hoppers@123`** (or whatever you set `VITE_ADMIN_PASSWORD` to).

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "Hopper Station order queue"
gh repo create hopper-station-orders --private --source=. --push
# or: create a repo on github.com, then
# git remote add origin <your-repo-url>
# git branch -M main
# git push -u origin main
```

## 5. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. Vercel auto-detects Vite — leave the build command as `npm run build` and
   output directory as `dist`.
3. Under **Environment Variables**, add the same six `VITE_FIREBASE_*` keys
   (and `VITE_ADMIN_PASSWORD` if you're customizing it) from your `.env`.
4. Deploy. `vercel.json` is already set up to rewrite all paths to
   `index.html` so the client-side routes (`/display`, `/admin`, etc.) work
   correctly on refresh and direct links.
5. Once deployed, the QR code on `/display` automatically points to
   `<your-vercel-domain>/status`, so no extra config is needed there.

## Recommended hardware setup at the stall

- **Token entry**: a tablet or old phone running `/`, placed where customers
  arrive with their token.
- **Stall display**: a TV or monitor running `/display` in a browser
  full-screen / kiosk mode.
- **Order desk**: a tablet or laptop running `/admin`, used by whoever takes
  orders from the queue and relays them to the kitchen.
- **Pickup counter**: a second tablet running `/handover`, used by whoever
  hands the finished hoppers to customers.

## Security notes

- The `/admin` and `/handover` "login" is a single shared app password
  (`hoppers@123` by default) checked entirely in the browser — it's meant to
  keep a public kiosk from being fiddled with, **not** as real
  authentication. Anyone with the password (or who inspects the client code)
  can update order statuses.
- Because there's no real staff authentication, `firestore.rules` can't tell
  a staff member apart from any other visitor. The rules currently: (a) only
  allow creating a well-formed `queued` order, and (b) only allow updating
  the `status` and status-timestamp fields, into a recognised status value.
  This limits the damage a malicious visitor could do, but doesn't fully
  lock down status changes to staff.
- If you want proper staff authentication later, the natural upgrade is
  **Firebase Authentication** (email/password or anonymous + custom claims
  for staff), with rules like `allow update: if request.auth.token.staff ==
  true`. That's a bigger change than this MVP needed, but the data model
  here doesn't need to change to support it.
- Phone numbers are used only to look up an order's status — there's no
  other use of personal data in this app.

## Customizing

- **Colors and type**: `tailwind.config.js` (`cream`, `brown-900`, `turmeric`,
  `chili`, `curry`, `clay`) and the Google Fonts `<link>` in `index.html`
  (Fraunces for headings, IBM Plex Sans for everything else).
- **Column sizes on `/display`**: `src/pages/StallDisplay.jsx` sets a fixed
  pixel `height` per column (5 visible tickets for Accepted/Done, 8 for
  Preparing) — the columns scroll internally once there are more orders than
  that.
- **Staff password**: set `VITE_ADMIN_PASSWORD` in `.env` / Vercel project
  settings.
