/** Solutions by business type. */
import { block, cards, cta, intro, shell } from './ref';

export function renderSolutionsPage(): string {
  return shell('solutions',
    intro('INDUSTRY BLUEPRINTS', 'Purpose-Built Solutions for High-Trust Service Sectors', 'Tailored operational templates engineered for client privacy, high appointment density, multi-practitioner scheduling, and verified payments.'),
    block('Tailored Vertical Deployments', 'Pre-configured workflow architectures for specialized service sectors.', cards([
      { title: 'Salons & barbers', text: 'Services with durations, a calendar per stylist and a link customers can book from Instagram or WhatsApp.' },
      { title: 'Clinics & wellness', text: 'Appointments with reminders and a customer record that shows each visit.' },
      { title: 'Studios & trainers', text: 'Sessions by time slot, with a limit on how many each day.' },
      { title: 'Repair & workshops', text: 'Drop-off and pickup bookings, with customer notes on every job.' },
      { title: 'Agencies & multi-location', text: 'Higher limits on staff and bookings, with a workspace for each client or branch.' },
      { title: 'Large organisations', text: 'Unlimited limits and a setup built with our team. Talk to us.' },
    ]), true),
    cta('Evaluate Fit for Your Organization', 'Speak directly with our solutions team to discuss custom multi-tenant architecture, data residency, or integration needs.', [{ text: 'Contact advisory team', href: '/contact', primary: true }, { text: 'Start free', href: '/signup' }]),
  );
}
