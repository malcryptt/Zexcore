# Email outbox

Important emails are written to Firestore (`emailOutbox/{id}`, Worker-only) before they are sent, so a provider outage or a Worker crash does not lose them.

* **Retries:** after a failure the message waits 1 min, 5 min, 30 min, 2 h, 12 h, then is marked `dead` after 6 tries. A permanent rejection (bad address, 4xx) goes `dead` straight away. The hourly cron (`scheduled`) does the retrying, so a retry can be up to an hour late.
* **No provider yet:** with no `RESEND_API_KEY` the message waits an hour at a time without using up tries, and is sent once the key is set.
* **Crash recovery:** a sender takes a message with a 5-minute lease. If it dies, the next run takes the message over once the lease has run out.
* **No duplicates:** the record id comes from a key such as `ack:<workspace>:<booking>`, so asking twice queues once. The same id goes to Resend as an `Idempotency-Key`, so a retry after a crash that happened after Resend accepted the message is dropped by Resend (it remembers keys for about a day).
* **Privacy:** after sending (or giving up) the subject and body are erased. Sent records are deleted after 7 days, dead ones after 30.

Moved onto the outbox: booking acknowledgement and owner alert, reschedule notice, deposit receipt, waitlist offers, released-deposit notice, new-device sign-in, and order request, owner alert and status emails.
Not on it (sent directly, result shown at once): welcome, team invitations, weekly digest, deposit-link emails, IoT alerts, account deletion notice.

To see what is stuck: Firestore console, `emailOutbox`, filter `status` = `dead` or `pending` (`lastError` says why).

## Customer emails around an appointment

Sent by the hourly job through the outbox, only for workspaces whose owner switched them on under Settings, "Emails to your customers":

* **Reminder** (`settings.reminderEmails`): about a day before a *confirmed* appointment, only when the booking was made more than 26 hours ahead. New workspaces get it switched on at the end of setup; existing ones start off.
* **Thank-you** (`settings.followUpEmails`, off by default): a day after a booking is marked completed, with a link to book again.

Both need the customer's email address (optional on the booking page). Keys are `remind:<ws>:<booking>` and `followup:<ws>:<booking>`, so no one is emailed twice.

## Shop orders paid online

Customers can pay for shop goods through Paystack when the business has a payout account and payments are enabled. The order is stored as `awaiting_payment` (hidden from the owner) until the payment is verified server-side (`/transaction/verify`, amount and currency compared) either on return or via the webhook; then it becomes `new`, the customer gets a receipt and the owner an alert (both through the outbox, one each per order). Owners can refund a paid order in full from the Orders tab. Orders above the checkout ceiling can only be sent as requests.

Online payments for shop orders and booking deposits are available on every plan when the business has completed Paystack payout setup and platform payments are enabled. ZexCore's platform commission is deducted from the business's settlement through Paystack `transaction_charge`; customers are charged only the advertised order/deposit amount. The commission is 2% on Free, 1.5% on Starter, 1% on Growth, and 0.5% on Agency, Enterprise and Dedicated. Paystack's processing fee is separate and is borne by the business. The effective plan (including the existing three-day expiry grace) determines the commission rate. The pending payment record stores the commission amount, basis points and plan for reconciliation. The Worker still verifies the full customer payment server-side before marking the order or deposit paid.


## ZexCore payment fee notice and acceptance

The current owner-facing fee policy is version `2026-11-v1`. Workspace owners see the full rate schedule and charging explanation under **Settings → Online payment fees**. Only the workspace owner can accept it; the Worker records the version, timestamp, owner UID and email on the workspace. The Worker refuses to start new shop checkouts or booking deposits until the current policy version is accepted. This is enforced server-side, not by hiding a dashboard control. The shop's public payment-availability check also stays off until acceptance. Existing payment records retain their originally recorded fee terms. Bump the policy version whenever rates or charging rules change.

The Worker sends the owner notice through the durable email outbox in resumable batches. The hourly campaign targets active workspaces with a configured Paystack payout account, records a per-workspace delivery marker, and uses an idempotency key so retries do not duplicate the message. The notice states that the policy is effective immediately on 8 November 2026. Delivery remains subject to the configured Resend provider; queued, failed and dead-letter states are visible through the existing outbox monitoring.


## Payment fee reconciliation fields

After server-side Paystack verification, each booking-deposit and shop-order payment record stores the verified customer amount and Paystack transaction ID, the Paystack processing fee returned by the Verify Transaction API, the ZexCore `transaction_charge` requested at initialization, and an estimated merchant net (customer amount less both fee components). Records explicitly identify when Paystack's fee is not present in the verification response. The dashboard labels merchant net as an estimate; it must not be presented as a final bank settlement until matched against Paystack's settlement report. Existing payment records are not rewritten.
