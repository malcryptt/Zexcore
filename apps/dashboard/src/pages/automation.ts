/** Automation & shared infrastructure: PlatformXe/Backendless-style — triggers, conditions, actions on shared services. */
import { block, cards, code, cta, intro, shell, steps, table } from './ref';

export function renderAutomationPage(): string {
  return shell('automation',
    intro('AUTOMATION', 'Let the Platform Do the Repetitive Work',
      'Describe a rule once: when this happens and the conditions match, do that. ZexCore runs it for you, records what it did and asks you first when the action matters.',
      [{ text: 'Start Free', href: '/signup', primary: true }, { text: 'See Modules', href: '/modules' }]),

    block('Trigger, Condition, Action', 'Every automation has the same three parts.', table(
      ['Part', 'Examples'],
      [
        ['Trigger', 'A booking is created, a booking is cancelled, a payment is received, a device reading arrives.'],
        ['Condition', 'The service is "Deep clean", the reading is above 80, the customer is new, it is outside working hours.'],
        ['Action', 'Notify you, send an email, call a webhook, flag the record for review.'],
      ])),

    block('From Idea to Running Rule', '', steps([
      { title: 'Describe It', text: 'Write the rule in plain terms or let the built-in assistant draft one from a sentence. You always see and edit the result before it goes live.' },
      { title: 'Test It on Real Data', text: 'Run the rule against a recent event and see exactly what it would have done — without doing it.' },
      { title: 'Approve It', text: 'Rules that can reach customers or external systems wait for your explicit approval before they go live.' },
      { title: 'Watch It Work', text: 'Every run is logged with the event, the decision and the outcome. Nothing happens silently.' },
    ]), true),

    block('A Rule, in Full', 'Rules are plain structured data, so they can be reviewed, tested and versioned like any other configuration.', code(
`{
  <b>"name"</b>: "Alert on high freezer temperature",
  <b>"when"</b>: "device.reading",
  <b>"if"</b>: [{ "field": "temperature", "op": ">", "value": 8 }],
  <b>"then"</b>: [{ "do": "notify" }, { "do": "webhook", "url": "https://…" }]
}`)),

    block('Shared Infrastructure', 'Automations, devices and bookings use the same building blocks — so they work together without glue code.', cards([
      { title: 'One Event Stream', text: 'Bookings, payments and device readings all produce events that automation rules can listen to.' },
      { title: 'One Unified Data Boundary', text: 'Automations run inside your workspace and can only touch your workspace data.' },
      { title: 'One Audit Trail', text: 'What a rule did is recorded alongside what people did — in the same log.' },
    ]), true),

    cta('Automate Your First Task', 'Start with a single alert and grow from there.', [{ text: 'Create Your Workspace', href: '/signup', primary: true }, { text: 'Read the Docs', href: '/docs' }]),
  );
}
