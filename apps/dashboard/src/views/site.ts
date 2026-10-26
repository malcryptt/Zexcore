import { html, mount, $, type Raw } from '../lib/html';
import { ic, type IconName } from '../lib/icons';
import { api } from '../lib/api';
import { isSignedIn } from '../lib/session';
import { brand } from '../layouts';
import { money } from '../lib/format';

const EMAIL = 'hello@zexcore.com.ng';
const root = (): HTMLElement => document.getElementById('app')!;

function setMeta(title: string, desc: string): void {
  document.title = title;
  document.querySelector('meta[name=description]')?.setAttribute('content', desc);
}

function shell(path: string, body: Raw): void {
  const link = (href: string, t: string) => html`<a href="${href}" data-link ${path === href ? 'aria-current="page"' : ''}>${t}</a>`;
  const signed = isSignedIn();
  mount(root(), html`<div class="site">
    <header class="site-nav"><div class="container">
      <a href="/" data-link aria-label="ZexCore home">${brand()}</a>
      <nav class="site-links" aria-label="Main">${link('/product', 'Product')}${link('/pricing', 'Pricing')}${link('/security', 'Security')}${link('/contact', 'Contact')}</nav>
      <div class="site-cta">
        ${signed ? html`<a class="btn btn-primary btn-sm" href="/app" data-link>Open dashboard</a>` : html`<a class="btn btn-ghost btn-sm hide-sm" href="/signin" data-link>Sign in</a><a class="btn btn-primary btn-sm" href="/signup" data-link>Get started</a>`}
        <button class="btn btn-ghost btn-sm btn-icon burger" data-burger aria-label="Menu" aria-expanded="false">${ic('menu')}</button>
      </div></div>
      <div class="mobile-menu hidden" data-mm><a href="/product" data-link>Product</a><a href="/pricing" data-link>Pricing</a><a href="/security" data-link>Security</a><a href="/contact" data-link>Contact</a>${signed ? '' : html`<a href="/signin" data-link>Sign in</a>`}</div>
    </header>
    <main id="main">${body}</main>
    <footer class="site-footer"><div class="container">
      <div class="foot-grid"><div>${brand()}<p style="margin-top:12px;max-width:300px;font-size:.9rem">Bookings, deposits and customer conversations for businesses in Nigeria and beyond. Built by Zexlabs in Akure.</p></div>
        <div><h4>Product</h4><ul><li><a href="/product" data-link>Features</a></li><li><a href="/pricing" data-link>Pricing</a></li><li><a href="/security" data-link>Security</a></li></ul></div>
        <div><h4>Company</h4><ul><li><a href="/contact" data-link>Contact</a></li><li><a href="mailto:${EMAIL}">${EMAIL}</a></li></ul></div>
        <div><h4>Legal</h4><ul><li><a href="/privacy" data-link>Privacy</a></li><li><a href="/terms" data-link>Terms</a></li></ul></div></div>
      <div class="foot-bottom"><span>© ${new Date().getFullYear()} Zexlabs. All rights reserved.</span><span>Akure, Nigeria</span></div></div></footer></div>`);
  $('[data-burger]')?.addEventListener('click', (e) => { const mm = $('[data-mm]')!; const open = mm.classList.toggle('hidden') === false; (e.currentTarget as HTMLElement).setAttribute('aria-expanded', String(open)); });
  window.scrollTo(0, 0);
}

const feature = (icon: IconName, t: string, p: string | Raw): Raw => html`<div class="feature"><span class="icon-tile">${ic(icon)}</span><h3>${t}</h3><p>${p}</p></div>`;

export function renderHome(): void {
  setMeta('ZexCore — Take bookings. Get paid. Stop chasing.', 'A booking page, deposits through Paystack and a customer inbox for clinics, salons, property agents and other appointment-based businesses.');
  shell('/', html`
    <section class="hero"><div class="container hero-grid">
      <div>
        <span class="eyebrow">${ic('sparkles', 'ico-sm')} Built for appointment-based businesses</span>
        <h1>Take bookings. <em>Get paid.</em> Stop chasing.</h1>
        <p class="lead">Give customers one link to pick a service, choose a time and pay a deposit. You get a calendar, a customer inbox and a record of every change, with nothing to install.</p>
        <div class="hero-actions"><a class="btn btn-primary btn-lg" href="/signup" data-link>Create your workspace ${ic('arrow-right', 'ico-sm')}</a><a class="btn btn-secondary btn-lg" href="/product" data-link>See how it works</a></div>
        <div class="trust-row"><span>${ic('circle-check')} Free to start</span><span>${ic('circle-check')} Deposits via Paystack</span><span>${ic('circle-check')} Data isolated per business</span></div>
      </div>
      <div style="position:relative" aria-hidden="true">
        <div class="phone"><div class="phone-screen">
          <div class="step-row"><span class="n">1</span><div>Choose a service<small>Pick what you need</small></div></div>
          <div class="step-row"><span class="n">2</span><div>Pick a date and time<small>Only free slots are shown</small></div></div>
          <div class="step-row"><span class="n">3</span><div>Enter your details<small>Name, WhatsApp number, email</small></div></div>
          <div class="pay">${ic('lock', 'ico-sm')} Pay deposit with Paystack</div></div></div>
        <div class="float-chip" style="left:-12px;top:-22px">${ic('circle-check')} Slot can't be double-booked</div>
        <div class="float-chip" style="right:-12px;bottom:-22px">${ic('banknote')} Booking confirmed on payment</div>
      </div></div></section>

    <section class="section"><div class="container">
      <div class="section-head"><h2>Everything between “I'd like to book” and “see you then”</h2><p>One place for the work that usually lives across WhatsApp chats, notebooks and bank alerts.</p></div>
      <div class="grid-3">
        ${feature('link', 'A booking page of your own', 'Share one link. Customers choose a service, a person and a time. Taken slots disappear automatically.')}
        ${feature('banknote', 'Deposits that cut no-shows', 'Ask for an upfront deposit. A booking is confirmed only when Paystack confirms the exact amount.')}
        ${feature('message-square', 'A customer inbox', 'Enquiries, booking updates and payment receipts sit in one thread per customer. Reply with a tap on WhatsApp.')}
        ${feature('calendar-days', 'Calendar and daily view', 'See today at a glance: who is coming, who still owes a deposit and who is waiting for a reply.')}
        ${feature('users', 'Customers built for you', 'Everyone who books is added automatically, with their visit and no-show history.')}
        ${feature('history', 'An audit trail you can verify', 'Every important change is written to a tamper-evident log, and you can check its integrity any time.')}
      </div></div></section>

    <section class="section alt"><div class="container">
      <div class="section-head"><h2>Live in about two minutes</h2></div>
      <div class="steps-3"><div><h3>Create your workspace</h3><p class="muted">Sign up with email or Google and tell us what you do.</p></div><div><h3>Add services and hours</h3><p class="muted">Set prices, opening days and an optional deposit.</p></div><div><h3>Share your link</h3><p class="muted">Post it on WhatsApp, Instagram or your shop door.</p></div></div>
    </div></section>

    <section class="section"><div class="container"><div class="cta-band"><h2>Ready to stop chasing payments?</h2><p>Create a workspace in minutes. No card needed to start.</p><a class="btn btn-white btn-lg" href="/signup" data-link>Get started free</a></div></div></section>`);
}

export function renderProduct(): void {
  setMeta('Product — ZexCore', 'Booking page, deposits, calendar, customer inbox, and an audit trail.');
  shell('/product', html`
    <section class="page-hero"><div class="container"><h1>Run your appointments from one place</h1><p class="lead">Everything a small clinic, salon, agency or studio needs to take bookings and get paid.</p></div></section>
    <section class="section"><div class="container grid-2">
      ${feature('link', 'Public booking page', 'A clean mobile-first page at your own address. Customers choose a service, a team member or “any available”, then a date and an open slot.')}
      ${feature('lock', 'Deposits with Paystack', 'Set a deposit per booking. Payment is verified by signature and exact amount before a booking is confirmed. Record cash or transfer deposits by hand when needed.')}
      ${feature('calendar-days', 'Calendar and bookings', 'Month calendar, daily schedule, reschedule, complete, no-show and cancel. Two people can never take the same slot.')}
      ${feature('message-square', 'Customer inbox', 'Customer messages from your booking page and payment receipts in one thread. Replies open in WhatsApp ready to send.')}
      ${feature('id-card', 'Team and services', 'Add the people customers can book and the services you offer, each with its own duration and price.')}
      ${feature('credit-card', 'Plans and receipts', 'Upgrade when you need to. Prices are set on the server, so what you see is what you pay.')}
    </div></section>
    <section class="section alt"><div class="container"><div class="section-head"><h2>What's coming</h2><p>We only list what works today. On our roadmap: automatic WhatsApp and SMS reminders (they need a WhatsApp Business account), email receipts, and reports. Tell us what you need most at <a href="mailto:${EMAIL}" style="color:var(--primary);font-weight:600">${EMAIL}</a>.</p></div></div></section>`);
}

export async function renderPricing(): Promise<void> {
  setMeta('Pricing — ZexCore', 'Start free. Upgrade when your business grows.');
  shell('/pricing', html`
    <section class="page-hero"><div class="container"><h1>Simple pricing</h1><p class="lead">Start free. Upgrade when you need more. Prices are in naira, billed through Paystack.</p></div></section>
    <section class="section"><div class="container"><div class="price-grid" id="pg"><div class="skel" style="height:200px"></div><div class="skel" style="height:200px"></div><div class="skel" style="height:200px"></div></div>
      <div class="faq" style="margin-top:56px;max-width:760px"><h2 style="margin-bottom:12px">Questions</h2>
        <details><summary>Do I need a card to start?</summary><p>No. Creating a workspace is free.</p></details>
        <details><summary>How do deposits reach me?</summary><p>Customers pay through Paystack. Your Paystack account settles to your bank according to Paystack's schedule. ZexCore never holds your customers' money.</p></details>
        <details><summary>Can I change or cancel my plan?</summary><p>Yes. Contact us at ${EMAIL} and we'll help you switch.</p></details></div></div></section>`);
  try {
    const r = await api<{ currencyRates: { NGN_PER_USD: number }; plans: { tier: string; monthlyUsd: number; annualUsd: number }[] }>('/api/billing/plans', { auth: false });
    const blurb: Record<string, string> = { starter: 'For a single location getting started.', growth: 'For growing businesses with a busy calendar.', agency: 'For operators running several locations.', enterprise: 'For large organisations with advanced needs.', dedicated: 'Dedicated infrastructure and a named support contact.' };
    mount($('#pg')!, html`<div class="card price-card"><h3>Free</h3><div class="amt">${money(0)}</div><p class="muted small">to get started</p><p class="muted">Create your workspace, add services and start taking bookings.</p><a class="btn btn-secondary btn-block" href="/signup" data-link>Start free</a></div>
      ${r.plans.map((p) => html`<div class="card price-card"><h3 style="text-transform:capitalize">${p.tier}</h3><div class="amt">${money(Math.round(p.monthlyUsd * r.currencyRates.NGN_PER_USD * 100))}<span class="muted small" style="font-weight:500"> / month</span></div><p class="muted small">or ${money(Math.round(p.annualUsd * r.currencyRates.NGN_PER_USD * 100))} billed yearly</p><p class="muted">${blurb[p.tier] ?? ''}</p><a class="btn btn-primary btn-block" href="/signup" data-link>Choose ${p.tier}</a></div>`)}`);
  } catch { mount($('#pg')!, html`<div class="alert alert-warn">${ic('triangle-alert', 'ico-sm')} Prices could not be loaded right now. Please refresh, or email ${EMAIL}.</div>`); }
}

export function renderSecurity(): void {
  setMeta('Security — ZexCore', 'How ZexCore isolates each business, protects payments and records changes.');
  shell('/security', html`
    <section class="page-hero"><div class="container"><h1>Built so one business can never see another</h1><p class="lead">Your customers\' details are the most sensitive thing you hold. Here is how we protect them, in plain terms.</p></div></section>
    <section class="section"><div class="container grid-2">
      ${feature('database', 'Isolation enforced by the database', 'Each business\'s records are separated by row-level security inside PostgreSQL itself, not just by application code. The app connects with a restricted role that cannot bypass it.')}
      ${feature('lock', 'Passwords and sessions', 'Passwords are hashed with a slow, salted algorithm. Sign-in attempts are rate limited. You can also sign in with Google.')}
      ${feature('credit-card', 'Payments verified by signature', 'Paystack notifications are checked against a cryptographic signature and the exact amount we expected before anything is confirmed. Replays do nothing.')}
      ${feature('history', 'A tamper-evident audit log', 'Important actions are written to an append-only, hash-chained log inside the database. You can verify it in your dashboard at any time.')}
      ${feature('fingerprint', 'Least privilege', 'Roles limit what each team member can do, and the application database role cannot alter the audit log or read other businesses\' data.')}
      ${feature('shield-check', 'Responsible disclosure', html`Found a vulnerability? Email <a href="mailto:${EMAIL}" style="color:var(--primary);font-weight:600">${EMAIL}</a>. We read every report.`)}
    </div></section>`);
}

export function renderContact(): void {
  setMeta('Contact — ZexCore', 'Talk to the ZexCore team.');
  shell('/contact', html`
    <section class="page-hero"><div class="container"><h1>Talk to us</h1><p class="lead">Questions, a custom plan, or something you'd like us to build next? We reply within one working day.</p></div></section>
    <section class="section"><div class="container grid-2">
      <div class="card card-pad stack"><span class="icon-tile">${ic('mail')}</span><h3>Email</h3><p class="muted">The fastest way to reach us.</p><a class="btn btn-primary" href="mailto:${EMAIL}">${EMAIL}</a></div>
      <div class="card card-pad stack"><span class="icon-tile">${ic('map-pin')}</span><h3>Where we are</h3><p class="muted">Zexlabs is based in Akure, Nigeria and works with customers across Nigeria, the UK and the US.</p></div></div></section>`);
}

function legal(path: string, title: string, body: Raw): void {
  setMeta(`${title} — ZexCore`, `${title} for ZexCore.`);
  shell(path, html`<section class="page-hero"><div class="container"><h1>${title}</h1></div></section><section class="section"><div class="container prose">${body}</div></section>`);
}

export function renderPrivacy(): void {
  legal('/privacy', 'Privacy Policy', html`
    <p class="muted">Draft for review. Last updated 25 October 2026.</p>
    <h2>What we collect</h2><p>Account details (name, email), business details you enter, and, on behalf of the businesses that use ZexCore, their customers' booking details such as name, phone number, email and appointment times.</p>
    <h2>How we use it</h2><p>To provide the service: showing bookings, taking deposits, and keeping a record of changes. We do not sell personal data.</p>
    <h2>Payments</h2><p>Card payments are processed by Paystack. We do not store card numbers.</p>
    <h2>Your rights</h2><p>You can ask us to access, correct or delete your data. Email ${EMAIL}.</p>
    <h2>Contact</h2><p>${EMAIL}</p>`);
}
export function renderTerms(): void {
  legal('/terms', 'Terms of Service', html`
    <p class="muted">Draft for review. Last updated 25 October 2026.</p>
    <h2>The service</h2><p>ZexCore provides booking, deposit collection and customer messaging tools to businesses.</p>
    <h2>Your account</h2><p>Keep your password safe. You are responsible for activity under your workspace and for the accuracy of the services and prices you publish.</p>
    <h2>Payments</h2><p>Deposits are collected by Paystack and settle to your Paystack account. Paystack's terms apply to those payments.</p>
    <h2>Acceptable use</h2><p>Do not use ZexCore for unlawful activity or to send unsolicited messages.</p>
    <h2>Contact</h2><p>${EMAIL}</p>`);
}

export function renderNotFound(): void {
  setMeta('Page not found — ZexCore', 'That page does not exist.');
  shell('', html`<section class="section"><div class="container" style="text-align:center;max-width:520px"><span class="icon-tile" style="margin:0 auto 16px;background:var(--primary-tint);color:var(--primary)">${ic('search')}</span><h1 style="font-size:2rem">We can't find that page</h1><p class="muted" style="margin:10px 0 24px">The link may be wrong or the page may have moved.</p><a class="btn btn-primary" href="/" data-link>Back to home</a></div></section>`);
}
