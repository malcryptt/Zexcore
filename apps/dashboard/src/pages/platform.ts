/** Product overview. */
import { block, cards, cta, intro, shell, steps } from './ref';

export function renderPlatformPage(): string {
  return shell('platform',
    intro('PRODUCT', 'The workspace for appointment-based businesses', 'Booking, customers, payments and conversations in one dashboard that works on your phone as well as your desktop.', [{ text: 'Start free', href: '/signup', primary: true }, { text: 'See modules', href: '/modules' }]),
    block('What you get', '', cards([
      { title: 'A booking page that works for you', text: 'Customers choose a service, a team member and a time. Your calendar updates instantly and a slot can never be sold twice.' },
      { title: 'A customer list that builds itself', text: 'Each booking creates or updates a customer, so you always know who is returning.' },
      { title: 'Payments you can trust', text: 'Plans are paid through Paystack. The platform verifies each payment with Paystack before anything changes.' },
      { title: 'Works on mobile', text: 'The whole dashboard is designed for a phone screen, because that is where most owners work.' },
    ]), true),
    block('A day with ZexCore', '', steps([
      { title: 'Morning', text: 'Open the dashboard and see today’s bookings and anything waiting for confirmation.' },
      { title: 'During the day', text: 'Confirm, reschedule or cancel with one tap. Customers get the new time on the booking page.' },
      { title: 'Evening', text: 'Review who booked, who is new and which services sell best.' },
    ])),
    cta('See it with your own business', 'Create a workspace in a couple of minutes.', [{ text: 'Start free', href: '/signup', primary: true }, { text: 'Pricing', href: '/pricing' }]),
  );
}
