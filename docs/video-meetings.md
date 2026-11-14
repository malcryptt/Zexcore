# Video meetings

A service marked **Online meeting** gives each booking a video link. Customers get it in their booking
acknowledgement and in the reminder email; the team gets a **Join video meeting** button on the booking.

## Two ways to host

1. **The business's own link** (Settings, Online meetings). Paste a Google Meet or Zoom address and it is used for every
   online booking. Nothing is counted and ZexCore needs no setup.
2. **ZexCore calls** (Daily). The Worker creates a private room the first time someone joins. A room lasts 30 minutes,
   holds up to 4 people, and every join needs a token only the Worker can issue.

## Allowance (calls a month, one call = one room)

| Plan | Calls |
|---|---|
| Free | 10 |
| Starter | 30 |
| Growth | 100 |
| Agency | 300 |
| Enterprise, Dedicated | 1,000 |

The count is kept in `meetingUsage/{workspace}_{YYYYMM}` (Worker-only) and resets on the 1st (UTC). Change the numbers in
`CALLS_PER_MONTH` in `workers/payments/src/plan.ts` and in `apps/dashboard/src/lib/fb/plan.ts`; a test fails if they differ.

## Cost

Daily gives 10,000 participant-minutes a month free, shared by every business on ZexCore, then $0.004 per
participant-minute (check Daily's pricing page). A 30-minute call between two people is 60 participant-minutes, so
$0.24 once the free pool is used up. Set a spend alert in Daily's dashboard.

## Setup

```bash
cd workers/payments
npx wrangler secret put DAILY_API_KEY      # paste the key at the prompt; never in chat
npx wrangler deploy
firebase deploy --only hosting             # the page headers now allow *.daily.co for camera and microphone
```

Then Billing, System check: the **Video calls (Daily)** line should be OK.

## Rules that keep it safe

- Rooms open 15 minutes before the appointment for customers (an hour for the team) and close after the slot.
- At most 3 rooms per booking, so nobody can drain the monthly allowance by rejoining.
- A cancelled booking cannot be joined.
- The customer link carries a key (an HMAC of the workspace and booking, made with the Daily key). It cannot be guessed,
  and there is nothing to store. Rotating `DAILY_API_KEY` invalidates links already emailed; the own-link mode is unaffected.
- Recording is not offered.

## Browser permissions

`firebase.json` allows camera, microphone and screen sharing only for `https://*.daily.co` (the call frame), and lists
`*.daily.co` in `frame-src`. The rest of the site still cannot use the camera.

## Scheduled call requests

For high-trust or high-value work (clinics, large orders) a business can let customers ask for a scheduled video call.

- **Settings → Online meetings → Let customers request a call.** The threshold defaults to ₦100,000 (stored in USD cents at the rate when saved) and can be changed or set to 0, which offers calls only on services marked **Always offer a call**.
- **Bookings:** the booking page offers "Request a call / No thanks" when the service price is at or above the threshold, or the service is marked always-offer. **Shop:** the checkout offers it when the order total is at or above the threshold. Declining, or a failed request, never blocks the booking or order.
- The customer may suggest a time. The request is stored in `workspaces/{wid}/calls/{c_b_<bookingId>|c_o_<orderId>}` (Worker-only writes) and the owner is emailed. The owner opens **Calls**, confirms or changes the time (or declines), and the customer is emailed the time and a join link.
- **Reminders:** a second Worker cron, `*/5 * * * *`, emails the customer and the owner once when a scheduled call is within 30 minutes. Re-scheduling re-arms the reminder. Redeploy the Worker (`npx wrangler deploy`) after pulling so the new trigger is registered.
- **Joining** uses the same rooms, windows (customer 15 min before to 90 after; team 60 min before to 4 h after), own-link override, and monthly allowance as online bookings. A call counts only when someone joins.
- A request must be made within 2 hours of the booking/order, and is idempotent per booking/order.
