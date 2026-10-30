/** Home: Supabase-style positioning — clear promise, product grid, how it works, proof you can inspect, pricing, CTA. */
import { block, cards, code, cta, shell, steps } from './ref';

export function renderHomePage(): string {
  const hero = `<section class="rp-hero" id="home-flagship-hero"><div class="site-container"><div class="rp-hero-copy">
    <h1 class="rp-hero-title">The Operating System for<br /><span class="rp-hero-red">Service &amp; Appointment Enterprises.</span></h1>
    <p class="rp-hero-desc" style="font-weight:600">Automated scheduling, customer CRM, instant payment settlement, and tamper-evident audit logs. Purpose-built for modern clinics, studios, salons, and multi-location operators.</p>
    <div class="rp-hero-actions">
      <a href="/signup" data-link class="btn btn-primary btn-lg" id="btn-hero-primary">Start free</a>
      <a href="/architecture" data-link class="btn btn-secondary btn-lg" id="btn-hero-secondary">See how it is built</a>
    </div>
    <div class="rp-hero-strip">
      <div class="rp-hero-strip-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>No card to start</div>
      <div class="rp-hero-strip-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Pay with card or Paystack</div>
      <div class="rp-hero-strip-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Your data stays in your workspace</div>
    </div>
  </div></div></section>`;

  return shell('home',
    hero,
    block('Comprehensive Operations Suite', 'Integrated modules designed to eliminate fragmented point solutions and disjointed spreadsheets.', cards([
      { title: 'Online booking', text: 'A public page where customers choose a service and a time. No double bookings, ever.' },
      { title: 'Customers & leads', text: 'Every booking becomes a customer record with a history you can search.' },
      { title: 'Payments', text: 'Upgrade with Paystack checkout and see every payment in one list.' },
      { title: 'Inbox', text: 'Reply to customers on WhatsApp with the booking details already filled in.' },
      { title: 'Device monitoring', text: 'Track equipment readings and get alerted when something is off.' },
      { title: 'Automations', text: 'Turn repeat tasks into rules that notify you or call your other tools.' },
    ]), true),

    block('Deployment in Three Guided Steps', 'Zero complex setup. Move from initial workspace creation to live client bookings in minutes.', steps([
      { title: 'Create your workspace', text: 'Sign up with your business name. Your public booking address is created for you.' },
      { title: 'Add services and hours', text: 'Say what you offer, how long it takes and when you work.' },
      { title: 'Share your link', text: 'Put it on WhatsApp, Instagram or your website. Bookings arrive in your dashboard.' },
    ])),

    block('Provable Architecture & Declarative Security', 'ZexCore enforces workspace isolation, strict concurrency locks, and plan limits at the database tier — mathematically verified on every request.', code(
`<b>allow create:</b> if isAdmin(wid)
  && slotId(wid, 's', 'services', id);   <i>// plan limit checked by the database</i>`) + `<p style="margin-top:18px"><a href="/security" data-link class="btn btn-secondary">Read the security model</a></p>`, true),

    block('Configured for High-Demand Industries', 'Specialized operational workflows designed for appointment density, staff scheduling, and client management.', cards([
      { title: 'Salons & beauty', text: 'Staff calendars, services with durations and instant confirmations.' },
      { title: 'Clinics & wellness', text: 'Appointments, reminders and a record of every visit.' },
      { title: 'Workshops & field teams', text: 'Jobs, customers and equipment readings in one place.' },
    ])),

    cta('Launch Your Production Workspace Today', 'Deploy your branded booking portal and client CRM in minutes. Upgrade only as your appointment volume scales.', [{ text: 'Create your workspace', href: '/signup', primary: true }, { text: 'See pricing', href: '/pricing' }]),
  );
}

export function setupHomePageEvents(): void { /* the home page is static */ }
