/** About ZexCore / Zexlabs. */
import { block, cards, cta, intro, shell } from './ref';

export function renderAboutPage(): string {
  return shell('about',
    intro('ABOUT', 'Built in Akure, for businesses everywhere', 'ZexCore is made by Zexlabs, a cybersecurity and application-development agency based in Nigeria and working with customers across Nigeria, the UK and the US.'),
    block('What we believe', '', cards([
      { title: 'Software should be easy to start', text: 'You should be taking bookings the same day you sign up, not after a month of setup.' },
      { title: 'Security is a feature, not a footnote', text: 'We are a security company first. Access rules, payment checks and limits are enforced where they cannot be skipped.' },
      { title: 'Say only what is true', text: 'Our pages describe what the product does today. If something is not built, we do not sell it.' },
    ]), true),
    cta('Talk to the team', 'Questions, ideas or a custom plan: we reply within one working day.', [{ text: 'Contact us', href: '/contact', primary: true }, { text: 'Start free', href: '/signup' }]),
  );
}
