/** Automation & shared infrastructure: PlatformXe/Backendless-style — triggers, conditions, actions on shared services. */
import { block, cards, code, cta, intro, shell, steps, table } from './ref';

export function renderAutomationPage(): string {
  return shell('automation',
    intro('AUTOMATION', 'Let the platform do the repetitive work',
      'Describe a rule once: when this happens, and the conditions match, do that. ZexCore runs it for you, records what it did and asks you first when the action matters.',
      [{ text: 'Start free', href: '/signup', primary: true }, { text: 'See modules', href: '/modules' }]),

    block('Trigger, condition, action', 'Every automation has the same three parts.', table(
      ['Part', 'Examples'],
      [
        ['Trigger', 'A booking is created, a booking is cancelled, a payment is received, a device reading arrives.'],
        ['Condition', 'The service is “Deep clean”, the reading is above 80, the customer is new, it is outside working hours.'],
        ['Action', 'Notify you, send an email, call a webhook, flag the record for review.'],
      ])),

    block('From idea to running rule', '', steps([
      { title: 'Describe it', text: 'Write the rule in plain terms or let the built-in assistant draft one from a sentence. You always see and edit the result.' },
      { title: 'Test it on real data', text: 'Run the rule against a recent event and see exactly what it would have done, without doing it.' },
      { title: 'Approve it', text: 'Rules that can reach customers or external systems wait for your approval before they go live.' },
      { title: 'Watch it work', text: 'Every run is logged with the event, the decision and the outcome.' },
    ]), true),

    block('A rule, in full', 'Rules are plain data, so they can be reviewed, tested and versioned.', code(
`{
  <b>"name"</b>: "Alert on high freezer temperature",
  <b>"when"</b>: "device.reading",
  <b>"if"</b>: [{ "field": "temperature", "op": ">", "value": 8 }],
  <b>"then"</b>: [{ "do": "notify" }, { "do": "webhook", "url": "https://…" }]
}`)),

    block('Shared infrastructure', 'Automations, devices and bookings use the same building blocks, so they work together without glue code.', cards([
      { title: 'One event stream', text: 'Bookings, payments and device readings all produce events that rules can listen to.' },
      { title: 'One sign-in and data boundary', text: 'Automations run inside your workspace and can only touch your workspace.' },
      { title: 'One audit trail', text: 'What a rule did is recorded alongside what people did.' },
    ]), true),

    cta('Automate your first task', 'Start with a single alert and grow from there.', [{ text: 'Create your workspace', href: '/signup', primary: true }, { text: 'Read the docs', href: '/docs' }]),
  );
}
