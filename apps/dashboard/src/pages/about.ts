/** About ZexCore / Zexlabs. */
import { block, cards, cta, intro, shell } from './ref';

export function renderAboutPage(): string {
  return shell('about',
    intro('ABOUT', 'Enterprise-Grade Software. Built for the People Who Run Real Businesses.', 'ZexCore is made by Zexlabs — a cybersecurity and application-development agency serving clients across Nigeria, the United Kingdom and the United States.'),
    block('What We Believe', '', cards([
      { title: 'Software Should Be Easy to Start', text: 'You should be taking bookings the same day you sign up, not after a month of setup and configuration.' },
      { title: 'Security Is a Feature, Not a Footnote', text: 'We are a security company first. Access controls, payment verification and capacity limits are enforced where they cannot be skipped or bypassed.' },
      { title: 'Say Only What Is True', text: 'Our pages describe what the product does today. If something is not built, we do not sell it.' },
    ]), true),
    cta('Talk to the Team', 'Questions, ideas or a custom plan — we reply within one working day.', [{ text: 'Contact Us', href: '/contact', primary: true }, { text: 'Start Free', href: '/signup' }]),
  );
}
