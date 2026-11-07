# Checking that every feature works

Do the **System check** first (Plan & billing, Platform admin, Run system check). It tests every connection live and tells you what is missing. Then walk this list once with two accounts: your owner account, and a private browser window acting as a customer. Tick each line.

Use a very small price (for example ₦100 or $0.10) for payment tests, and refund yourself afterwards.

## Owner account
- [ ] Sign up, confirm the email, sign in (password and Google). Sign out everywhere under Security.
- [ ] Settings: business name, phone, address, opening hours. Save and reload: still there.
- [ ] Settings: choose a logo. It saves at once and shows in the sidebar and on your public booking page (open it in the private window).
- [ ] Services: add one, edit it, delete it. Bookable staff: add one.
- [ ] Settings: add your payout bank account (the name shown should be yours).
- [ ] Shop: add a product with a photo. Edit it. The photo shows on the public shop.
- [ ] Billing: upgrade path opens Paystack. (Platform admins can grant a plan instead.)

## Customer, in a private window, on your booking page
- [ ] Book a service. You get a confirmation email, and so does the owner.
- [ ] Book with a deposit. Pay with a real card. "Payment received" appears; the booking shows as paid; the receipt email arrives.
- [ ] Shop: add a product, "Send order request". The owner sees a badge on Shop and the order in Orders.
- [ ] Settings: accept the online payment fee terms (owner only). Without it, Pay now and deposits are switched off.
- [ ] Shop: "Pay now". Pay. "Payment received" appears; the order shows "Paid online".
- [ ] Service enquiry form: submit. It shows under Service enquiries and in Customers.

## Back as the owner
- [ ] Bookings: confirm, reschedule (the customer is emailed the new time), cancel.
- [ ] Orders: mark shipped; the customer is emailed. Refund a paid order; the customer is emailed and the order stays cancelled.
- [ ] Messages and Customers show the people above.
- [ ] Team access: invite a second email, accept the invite in the private window, check their role limits.
- [ ] Audit log lists the actions you just did.
- [ ] Data protection, Backups (Enterprise): download a backup and an export.
- [ ] Cluster & license (Enterprise): generate a licence; request a cluster (the sales inbox gets an email).
- [ ] Security: delete a throwaway account. It asks for the email only (and the password for password accounts).

## Scheduled things (wait for them)
- [ ] A booking tomorrow produces a reminder email about a day before (runs hourly).
- [ ] After a completed visit, the thank-you email arrives.
- [ ] An unpaid risk deposit expires after its window.
