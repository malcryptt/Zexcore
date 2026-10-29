/** Resources. */
import { block, cards, cta, intro, shell } from './ref';

export function renderResourcesPage(): string {
  return shell('resources',
    intro('RESOURCES', 'Learn how ZexCore works', 'Short guides and the technical reference for the platform.'),
    block('Start here', '', cards([
      { title: 'Quickstart', text: 'Create a workspace and take your first booking.' },
      { title: 'How booking works', text: 'Why a slot can never be double booked.' },
      { title: 'Plans and limits', text: 'What each plan includes and how limits are enforced.' },
      { title: 'Security model', text: 'Who can see what, and what protects it.' },
    ]), true),
    `<section class="section-white" style="padding:0 0 56px"><div class="site-container"><p><a href="/docs" data-link class="btn btn-primary">Open the documentation</a> <a href="/security" data-link class="btn btn-secondary">Security model</a></p></div></section>`,
    cta('Still stuck?', 'Email us and a person will reply within one working day.', [{ text: 'Contact us', href: '/contact', primary: true }]),
  );
}
