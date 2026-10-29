/** Solutions by business type. */
import { block, cards, cta, intro, shell } from './ref';

export function renderSolutionsPage(): string {
  return shell('solutions',
    intro('SOLUTIONS', 'Set up for the way your business works', 'ZexCore fits any business that serves customers by appointment. Here is how teams in a few common trades use it.'),
    block('By business type', '', cards([
      { title: 'Salons & barbers', text: 'Services with durations, a calendar per stylist and a link customers can book from Instagram or WhatsApp.' },
      { title: 'Clinics & wellness', text: 'Appointments with reminders and a customer record that shows each visit.' },
      { title: 'Studios & trainers', text: 'Sessions by time slot, with a limit on how many each day.' },
      { title: 'Repair & workshops', text: 'Drop-off and pickup bookings, with customer notes on every job.' },
      { title: 'Agencies & multi-location', text: 'Higher limits on staff and bookings, with a workspace for each client or branch.' },
      { title: 'Large organisations', text: 'Unlimited limits and a setup built with our team. Talk to us.' },
    ]), true),
    cta('Not sure it fits?', 'Tell us about your business and we will tell you honestly.', [{ text: 'Contact us', href: '/contact', primary: true }, { text: 'Start free', href: '/signup' }]),
  );
}
