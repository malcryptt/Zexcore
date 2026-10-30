/** Product overview. */
import { block, cards, cta, intro, shell, steps } from './ref';

export function renderPlatformPage(): string {
  return shell('platform',
    intro('PLATFORM CAPABILITIES', 'Unified Operational Infrastructure for Scaled Service Delivery', 'Client scheduling, automated CRM pipelines, instantaneous payment verification, and multi-channel communication inside one responsive command console.', [{ text: 'Start free', href: '/signup', primary: true }, { text: 'Explore modules', href: '/modules' }]),
    block('Core Operational Capabilities', 'Engineered to replace fragile point solutions with a single sovereign source of truth.', cards([
      { title: 'Deterministic booking engine', text: 'Clients select services, providers, and slots. Availability syncs in real time with strict concurrency locking that prevents double booking.' },
      { title: 'Automated CRM & client lifecycle', text: 'Every appointment interaction enriches customer profiles, tracking booking history, preferences, and lifetime value.' },
      { title: 'Verified payment reconciliation', text: 'Cryptographically verified checkout via Paystack with instant receipt dispatch and immutable transaction logs.' },
      { title: 'Responsive mobile command', text: 'Full administrative access across mobile and desktop, designed for real-time operations on the clinic or salon floor.' },
    ]), true),
    block('Daily Operational Cadence', 'How modern teams streamline appointment workflows from morning dispatch to evening reconciliation.', steps([
      { title: 'Morning preparation', text: 'Review the day’s scheduled appointments, staff assignments, and pending client requests in one consolidated view.' },
      { title: 'Real-time execution', text: 'Check-in arrivals, adjust time allocations, or reschedule with a single tap. Automated alerts notify clients immediately.' },
      { title: 'Evening analytics & reconciliation', text: 'Audit daily revenue, track completed sessions, and analyze service demand patterns across all team members.' },
    ])),
    cta('Experience ZexCore in Your Operations', 'Deploy an isolated production workspace in minutes with complete feature access.', [{ text: 'Start free', href: '/signup', primary: true }, { text: 'View pricing', href: '/pricing' }]),
  );
}
