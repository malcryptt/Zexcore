/** Modules: Appwrite-style product grid — one card per capability with what it gives you and its limits. */
import { block, cards, cta, intro, shell, table } from './ref';

// Flip an entry to 'LIVE' only when it passes its end-to-end tests in production.
const STATUS: Record<string, string> = {
  booking: 'LIVE', crm: 'LIVE', pages: 'LIVE', billing: 'LIVE',
  inbox: 'LAUNCHING', devices: 'LAUNCHING', automations: 'LAUNCHING', privacy: 'LAUNCHING', audit: 'LAUNCHING',
};

export function renderModulesPage(): string {
  return shell('modules',
    intro('MODULES', 'Everything your business runs on, in one workspace',
      'Each module is a part of the dashboard that shares the same sign-in, the same data boundary and the same plan. Switch on what you need; nothing needs a separate login or a separate bill.',
      [{ text: 'Start free', href: '/signup', primary: true }, { text: 'See pricing', href: '/pricing' }]),

    block('Run the business', 'The day-to-day tools.', cards([
      { tag: STATUS.booking, title: 'Bookings', text: 'Public booking page, services, staff and live availability. Double booking is impossible: every slot is locked atomically.' },
      { tag: STATUS.crm, title: 'Customers & leads', text: 'Contacts, pipeline stages and leads in one list, created automatically from every booking.' },
      { tag: STATUS.pages, title: 'Booking pages', text: 'Your public page at zexcore.com.ng/your-name with your services, hours and contact details.' },
      { tag: STATUS.billing, title: 'Plans & payments', text: 'Paystack checkout in naira, instant plan activation and a payment history you can export.' },
    ])),

    block('Talk to customers', 'Stay on the channels your customers already use.', cards([
      { tag: STATUS.inbox, title: 'Inbox', text: 'Every customer conversation in one place, with a needs-reply count and one-tap WhatsApp chat links prefilled with the booking details.' },
    ]), true),

    block('Connect your equipment', 'For businesses with physical assets.', cards([
      { tag: STATUS.devices, title: 'Device monitoring', text: 'Register sensors and machines, send readings to a private ingest address and see the latest values and alerts per device.' },
      { tag: STATUS.automations, title: 'Automations', text: 'When something happens, do something: notify you, call a webhook or send an email. Rules are tested against real data before you switch them on.' },
    ])),

    block('Prove you are in control', 'For clients who ask hard questions.', cards([
      { tag: STATUS.privacy, title: 'Data protection', text: 'A consent record per customer, erasure requests that actually remove the data, and retention rules you set.' },
      { tag: STATUS.audit, title: 'Audit trail', text: 'An append-only record of who changed what, with a verification check you can run at any time.' },
    ]), true),

    block('Limits by plan', 'Limits are enforced by the database rules, not by the interface.', table(
      ['', 'Free', 'Starter', 'Growth', 'Agency'],
      [
        ['Bookings / month', '30', '200', '1,000', '5,000'],
        ['Staff', '1', '3', '10', '50'],
        ['Services', '3', '10', '30', '100'],
        ['Booking pages', '3', '10', '50', '200'],
        ['Contacts', '50', '500', '5,000', '50,000'],
      ])),

    cta('Start with what you need', 'Every plan includes every module. Upgrade only when your volume grows.', [{ text: 'Create your workspace', href: '/signup', primary: true }, { text: 'Compare plans', href: '/pricing' }]),
  );
}
