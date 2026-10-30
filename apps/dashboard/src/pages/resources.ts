/** Resources. */
import { block, cards, cta, intro, shell } from './ref';

export function renderResourcesPage(): string {
  return shell('resources',
    intro('RESOURCES', 'Learn How ZexCore Works', 'Short guides and the technical reference for the platform — everything you need to get up and running quickly.'),
    block('Start Here', '', cards([
      { title: 'Quickstart', text: 'Create a workspace and take your first booking in minutes.' },
      { title: 'How Booking Works', text: 'Why a slot can never be double booked — guaranteed at the data layer.' },
      { title: 'Plans and Limits', text: 'What each plan includes and how capacity limits are enforced.' },
      { title: 'Security Model', text: 'Who can see what, and what enforces it.' },
    ]), true),
    `<section class="section-white" style="padding:0 0 56px"><div class="site-container"><p><a href="/docs" data-link class="btn btn-primary">Open the Documentation</a> <a href="/security" data-link class="btn btn-secondary">Security Model</a></p></div></section>`,
    cta('Still Need Help?', 'Send us a message and a person will reply within one working day.', [{ text: 'Contact Us', href: '/contact', primary: true }]),
  );
}
