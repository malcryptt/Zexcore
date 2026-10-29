/** Home: Supabase-style positioning — clear promise, product grid, how it works, proof you can inspect, pricing, CTA. */
import { block, cards, code, cta, shell, steps } from './ref';

export function renderHomePage(): string {
  const hero = `<section class="rp-hero" id="home-flagship-hero"><div class="site-container"><div class="rp-hero-copy">
    <h1 class="rp-hero-title">Run your service business<br /><span class="rp-hero-red">from one workspace.</span></h1>
    <p class="rp-hero-desc">Online booking, customers, payments, conversations and automations for Nigerian businesses. Start free, take your first booking today, and grow into the rest when you need it.</p>
    <div class="rp-hero-actions">
      <a href="/signup" data-link class="btn btn-primary btn-lg" id="btn-hero-primary">Start free</a>
      <a href="/architecture" data-link class="btn btn-secondary btn-lg" id="btn-hero-secondary">See how it is built</a>
    </div>
    <div class="rp-hero-strip"><span>No card to start</span><span>Pay in naira with Paystack</span><span>Your data stays in your workspace</span></div>
  </div></div></section>`;

  return shell('home',
    hero,
    block('Everything in one place', 'Each part works on its own and works better with the others.', cards([
      { title: 'Online booking', text: 'A public page where customers choose a service and a time. No double bookings, ever.' },
      { title: 'Customers & leads', text: 'Every booking becomes a customer record with a history you can search.' },
      { title: 'Payments', text: 'Upgrade with Paystack checkout and see every payment in one list.' },
      { title: 'Inbox', text: 'Reply to customers on WhatsApp with the booking details already filled in.' },
      { title: 'Device monitoring', text: 'Track equipment readings and get alerted when something is off.' },
      { title: 'Automations', text: 'Turn repeat tasks into rules that notify you or call your other tools.' },
    ]), true),

    block('Live in three steps', '', steps([
      { title: 'Create your workspace', text: 'Sign up with your business name. Your public booking address is created for you.' },
      { title: 'Add services and hours', text: 'Say what you offer, how long it takes and when you work.' },
      { title: 'Share your link', text: 'Put it on WhatsApp, Instagram or your website. Bookings arrive in your dashboard.' },
    ])),

    block('Built so you can check it', 'ZexCore runs on Firebase with security rules you can read. Your plan, your limits and your customers’ privacy are enforced by the database, not by hope.', code(
`<b>allow create:</b> if isAdmin(wid)
  && slotId(wid, 's', 'services', id);   <i>// plan limit checked by the database</i>`) + `<p style="margin-top:18px"><a href="/security" data-link class="btn btn-secondary">Read the security model</a></p>`, true),

    block('Made for businesses like yours', 'Salons, clinics, studios, repair shops, workshops and any team that works by appointment.', cards([
      { title: 'Salons & beauty', text: 'Staff calendars, services with durations and instant confirmations.' },
      { title: 'Clinics & wellness', text: 'Appointments, reminders and a record of every visit.' },
      { title: 'Workshops & field teams', text: 'Jobs, customers and equipment readings in one place.' },
    ])),

    cta('Take your first booking today', 'The Free plan includes online booking for one team member. Upgrade when you outgrow it.', [{ text: 'Create your workspace', href: '/signup', primary: true }, { text: 'See pricing', href: '/pricing' }]),
  );
}

export function setupHomePageEvents(): void { /* the home page is static */ }
