Customer‑facing web app that lets users:

- Home hero + search + feature highlights
- Rooms list with discounts, ratings, amenities
- Register / Login (show/hide password)
- 3‑step booking: guest → payment (bank info + slip) → confirm
- My Bookings with payment status and slip preview
- Profile edit

## Run

```bash
npm i
npm run dev
```

## Wire to real backend

Replace functions in `src/services/api.js` with API calls to your server
(`/auth/login`, `/auth/register`, `/room-types`, `/bookings`, `/me/bookings`).
Current mock uses `localStorage`.
