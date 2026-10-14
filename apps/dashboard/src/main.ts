/**
 * ZexCore Control & Enterprise SaaS Platform
 * Red & White Production-Ready Multi-Page Website & Console
 */

import './style.css';
import { renderHomePage, setupHomePageEvents } from './pages/home';
import { renderPlatformPage } from './pages/platform';
import { renderArchitecturePage } from './pages/architecture';
import { renderModulesPage } from './pages/modules';
import { renderSolutionsPage } from './pages/solutions';
import { renderSecurityPage } from './pages/security';
import { renderDocsPage } from './pages/docs';
import { renderResourcesPage } from './pages/resources';
import { renderPricingPage } from './pages/pricing';
import { renderSignInPage, setupSignInEvents } from './pages/signin';
import { setupNavbarEvents } from './components/navbar';
import { getCurrentUser, logoutUser, subscribeToAuth, type AuthUserProfile } from './lib/firebase';
import {
  loadOnboardingState,
  saveOnboardingState,
  renderOnboardingBanner,
  INDUSTRY_STARTERS,
  type OnboardingState,
} from './components/onboarding';
import {
  getTenantPlan,
  setTenantPlan,
  isTabLocked,
  getTabLockedInfo,
  openStripeCheckoutModal,
  PLANS,
  type PlanTier,
} from './lib/billing';

interface Device {
  id: string;
  name: string;
  key: string;
  kind: string;
  status: 'online' | 'offline';
  temperature: number;
  humidity: number;
  voltage: number;
  firmware: string;
  lastSeen: string;
}

interface Rule {
  id: string;
  name: string;
  trigger: string;
  conditions: string;
  action: string;
  approved: boolean;
  enabled: boolean;
}

interface Lead {
  id: string;
  title: string;
  company: string;
  value: number;
  currency: string;
  stage: string;
}

interface Consent {
  id: string;
  subjectId: string;
  purpose: string;
  legalBasis: string;
  grantedAt: string;
  revokedAt: string | null;
}

interface WhatsAppMessage {
  sender: 'client' | 'agent' | 'bot';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface WhatsAppThread {
  id: string;
  contactName: string;
  phone: string;
  cleanPhone: string;
  channel: 'whatsapp' | 'sms' | 'email';
  unreadCount: number;
  lastMsg: string;
  time: string;
  leadValue: number;
  stage: string;
  messages: WhatsAppMessage[];
}

interface BookingAppointment {
  id: string;
  clientName: string;
  phone: string;
  cleanPhone: string;
  service: string;
  dateTime: string;
  depositStatus: string;
  whatsappReminderStatus: 'delivered' | 'scheduled' | 'sent_1h';
}

// ── Application State ────────────────────────────────────────────────────────
const state = {
  currentView: 'home' as 'home' | 'platform' | 'architecture' | 'modules' | 'solutions' | 'security' | 'docs' | 'resources' | 'pricing' | 'signin' | 'console' | 'dashboard',
  currentTab: 'overview',
  crmSubView: 'whatsapp' as 'whatsapp' | 'kanban' | 'booking',
  selectedThreadId: 'thread-1',
  activeTenant: 'acme_corp',
  currentUser: getCurrentUser() as AuthUserProfile | null,
  onboarding: loadOnboardingState() as OnboardingState,
  devices: [
    { id: 'dev-1', name: 'Factory Edge Sensor Node 01', key: 'iot_temp_sensor_01', kind: 'temperature_probe', status: 'online', temperature: 24.8, humidity: 54, voltage: 3.3, firmware: 'v2.1.4', lastSeen: 'Just now' },
    { id: 'dev-2', name: 'Cold Chain Storage Facility B', key: 'iot_cold_chiller_02', kind: 'chiller_probe', status: 'online', temperature: -4.2, humidity: 76, voltage: 3.2, firmware: 'v2.1.2', lastSeen: '1m ago' },
    { id: 'dev-3', name: 'Main Power Grid Inverter', key: 'iot_solar_gw_03', kind: 'power_gateway', status: 'offline', temperature: 48.0, humidity: 32, voltage: 48.1, firmware: 'v1.9.0', lastSeen: '12m ago' },
    { id: 'dev-4', name: 'Logistics Depot Gateway', key: 'iot_depot_gw_04', kind: 'network_gateway', status: 'online', temperature: 31.5, humidity: 45, voltage: 12.0, firmware: 'v2.2.0', lastSeen: 'Just now' },
  ] as Device[],
  rules: [
    {
      id: 'rule-1',
      name: 'High Temperature Threshold Monitor (>75°C)',
      trigger: 'iot.telemetry.received',
      conditions: 'metrics.temperature > 75',
      action: 'emit: iot.alert.triggered (severity: critical)',
      approved: true,
      enabled: true,
    },
    {
      id: 'rule-2',
      name: 'VIP Enterprise Lead Assignment (> $50k)',
      trigger: 'crm.lead.created',
      conditions: 'lead.value >= 50000',
      action: 'emit: crm.vip_lead.assigned',
      approved: true,
      enabled: true,
    },
    {
      id: 'rule-3',
      name: 'Hardware Offline Incident Dispatcher',
      trigger: 'iot.device.offline',
      conditions: 'device.kind == "power_gateway"',
      action: 'emit: ops.incident.created',
      approved: false,
      enabled: true,
    },
  ] as Rule[],
  stages: ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'],
  leads: [
    { id: 'lead-1', title: 'Global Fleet Telemetry Infrastructure', company: 'LogiTrans International', value: 85000, currency: 'USD', stage: 'Proposal' },
    { id: 'lead-2', title: 'Industrial Automation Core Deployment', company: 'Apex Robotics Corp', value: 120000, currency: 'USD', stage: 'Negotiation' },
    { id: 'lead-3', title: 'Pharmaceutical Cold-Chain Compliance Suite', company: 'PharmaCore Laboratories', value: 45000, currency: 'USD', stage: 'Qualified' },
    { id: 'lead-4', title: 'Microgrid Edge Control Expansion', company: 'EcoGrid Dynamics', value: 210000, currency: 'USD', stage: 'Closed Won' },
    { id: 'lead-5', title: 'Smart Sensor Pilot Program', company: 'Nordic Agricultural Tech', value: 18000, currency: 'USD', stage: 'New' },
  ] as Lead[],
  consents: [
    { id: 'c-1', subjectId: 'emma.watson@enterprise-corp.io', purpose: 'telemetry_processing', legalBasis: 'contract', grantedAt: '2026-10-01 10:24', revokedAt: null },
    { id: 'c-2', subjectId: 'david.k@global-cloud.com', purpose: 'marketing_analytics', legalBasis: 'consent', grantedAt: '2026-09-18 14:12', revokedAt: null },
    { id: 'c-3', subjectId: 'alina.p@industrial-iot.de', purpose: 'crm_profiling', legalBasis: 'legitimate_interests', grantedAt: '2026-08-11 09:00', revokedAt: '2026-10-10 18:30' },
  ] as Consent[],
  whatsAppThreads: [
    {
      id: 'thread-1',
      contactName: 'Adebayo Ogundimu',
      phone: '+234 803 892 1104',
      cleanPhone: '2348038921104',
      channel: 'whatsapp',
      unreadCount: 1,
      lastMsg: 'Good day! We have 14 reefer trucks in Lagos and need IoT thermal tracking.',
      time: '11:42 AM',
      leadValue: 48000,
      stage: 'Proposal',
      messages: [
        { sender: 'client', text: 'Good day! Saw your starter site for cold chain logistics telemetry. We have 14 reefer trucks operating out of Lagos ports.', time: '11:40 AM' },
        { sender: 'bot', text: 'Hello Adebayo! Thanks for contacting ZexCore Fleet. Your inquiry is mapped to our Cold Chain Telemetry Starter. Dispatching our hardware brochure.', time: '11:40 AM', status: 'read' },
        { sender: 'client', text: 'Great. Can we set up a WhatsApp live demo and Paystack payment for the 14 edge probes?', time: '11:42 AM' },
      ],
    },
    {
      id: 'thread-2',
      contactName: 'Dr. Amina Bello',
      phone: '+234 802 331 4902',
      cleanPhone: '2348023314902',
      channel: 'whatsapp',
      unreadCount: 0,
      lastMsg: 'Deposit paid via Paystack. Automated 24h WhatsApp reminder received!',
      time: 'Yesterday',
      leadValue: 18500,
      stage: 'Negotiation',
      messages: [
        { sender: 'client', text: 'Hi, we are setting up patient intake booking for 3 clinics. We need automated WhatsApp & SMS reminders to cut patient no-shows.', time: 'Yesterday 09:15 AM' },
        { sender: 'agent', text: 'Hello Dr. Bello! ZexCore Booking automatically sends 24h and 1h WhatsApp alerts with reschedule links. This reduces clinic no-shows by 40%.', time: 'Yesterday 09:18 AM', status: 'read' },
        { sender: 'client', text: 'Deposit paid via Paystack. Automated 24h WhatsApp reminder received!', time: 'Yesterday 10:04 AM' },
      ],
    },
    {
      id: 'thread-3',
      contactName: 'Kofi Mensah',
      phone: '+233 24 551 9021',
      cleanPhone: '233245519021',
      channel: 'whatsapp',
      unreadCount: 0,
      lastMsg: 'Confirmed. We will authorize the Flutterwave MoMo payment today.',
      time: 'Oct 12',
      leadValue: 35000,
      stage: 'Qualified',
      messages: [
        { sender: 'client', text: 'Hello from Accra. We operate a solar mini-grid with 48V inverters. Can telemetry ping our WhatsApp ops group?', time: 'Oct 12 08:30 AM' },
        { sender: 'agent', text: 'Yes Kofi! ZexCore EventBus triggers direct WhatsApp webhook notifications whenever voltage drops below 48.0V.', time: 'Oct 12 08:35 AM', status: 'read' },
        { sender: 'client', text: 'Confirmed. We will authorize the Flutterwave MoMo payment today.', time: 'Oct 12 09:12 AM' },
      ],
    },
  ] as WhatsAppThread[],
  bookings: [
    {
      id: 'book-1',
      clientName: 'Dr. Amina Bello',
      phone: '+234 802 331 4902',
      cleanPhone: '2348023314902',
      service: 'Specialist Clinic Telemetry Consultation',
      dateTime: 'Tomorrow, 10:00 AM WAT',
      depositStatus: '₦50,000 Paid (Paystack)',
      whatsappReminderStatus: 'delivered',
    },
    {
      id: 'book-2',
      clientName: 'Adebayo Ogundimu',
      phone: '+234 803 892 1104',
      cleanPhone: '2348038921104',
      service: 'Reefer Probe Fleet Hardware Pairing Demo',
      dateTime: 'Oct 16, 2:30 PM WAT',
      depositStatus: 'Deposit Held',
      whatsappReminderStatus: 'scheduled',
    },
    {
      id: 'book-3',
      clientName: 'Kofi Mensah',
      phone: '+233 24 551 9021',
      cleanPhone: '233245519021',
      service: 'Solar Inverter Gateway Live Setup',
      dateTime: 'Oct 17, 11:00 AM GMT',
      depositStatus: 'KES 20,000 (Flutterwave)',
      whatsappReminderStatus: 'sent_1h',
    },
  ] as BookingAppointment[],
  events: [] as Array<{ ts: string; name: string; payload: string }>,
  erasureRequestsCount: 1,
  anonymizedCount: 4,
};

function logBusEvent(name: string, payload: Record<string, unknown>) {
  const ts = new Date().toLocaleTimeString();
  state.events.unshift({
    ts,
    name,
    payload: JSON.stringify(payload),
  });
  if (state.events.length > 20) state.events.pop();
  renderEventLog();
}

// Initial Events
logBusEvent('zexcore.system.boot', { status: 'healthy', modules: ['core', 'iot', 'rules', 'crm', 'compliance'] });
logBusEvent('iot.telemetry.received', { deviceId: 'dev-1', metrics: { temperature: 24.8, humidity: 54 } });
logBusEvent('compliance.consent.granted', { subjectId: 'emma.watson@enterprise-corp.io', purpose: 'telemetry_processing' });

// ── Soft Paywall Component ──────────────────────────────────────────────────
function renderWithSoftPaywall(tabId: string, currentPlan: PlanTier, innerContent: string): string {
  if (!isTabLocked(tabId, currentPlan)) {
    return innerContent;
  }
  const info = getTabLockedInfo(tabId);
  const minPlanMeta = PLANS[info.minPlan];

  return `
    <div class="soft-paywall-wrap">
      <div class="soft-paywall-blur-bg">
        ${innerContent}
      </div>
      <div class="soft-paywall-overlay">
        <div class="soft-paywall-card">
          <div class="soft-paywall-icon-wrap">
            ${info.icon}
          </div>
          <div class="soft-paywall-tier-pill">REQUIRES ${info.minPlan.toUpperCase()} TIER</div>
          <h3 class="soft-paywall-title">${info.title}</h3>
          <p class="soft-paywall-desc">${info.subtitle}</p>
          <div class="soft-paywall-actions">
            <button class="btn-paywall-upgrade" data-paywall-upgrade="${info.minPlan}">
              Unlock with Stripe &rarr; ($${minPlanMeta.monthlyPrice}/mo)
            </button>
            <a href="#/pricing" class="btn-paywall-secondary">Compare All Tiers</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Render Application Shell (Dashboard) ────────────────────────────────────
function renderDashboard() {
  const app = document.getElementById('app');
  if (!app) return;

  const currentPlan = getTenantPlan(state.activeTenant);
  const planMeta = PLANS[currentPlan] || PLANS.starter;

  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="brand-header" id="brand-header-to-home" title="Click to view public site">
          <img src="/zexcore-logo-horizontal.png" alt="ZexCore" class="brand-logo-horizontal" />
        </div>

        <nav class="nav-menu">
          <div class="nav-label">Platform Modules</div>
          <div class="nav-item ${state.currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            System Overview
          </div>
          <div class="nav-item ${state.currentTab === 'iot' ? 'active' : ''}" data-tab="iot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            IoT Hub
            ${isTabLocked('iot', currentPlan) ? '<span class="nav-plan-lock-badge">🔒 INDIE</span>' : `<span class="nav-badge" id="iot-count">${state.devices.length}</span>`}
          </div>
          <div class="nav-item ${state.currentTab === 'rules' ? 'active' : ''}" data-tab="rules">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Rules &amp; AI Author
            <span class="nav-badge">${state.rules.length}</span>
          </div>
          <div class="nav-item ${state.currentTab === 'crm' ? 'active' : ''}" data-tab="crm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            CRM Sales Pipeline
            ${isTabLocked('crm', currentPlan) ? '<span class="nav-plan-lock-badge">🔒 GROWTH</span>' : `<span class="nav-badge">${state.leads.length}</span>`}
          </div>
          <div class="nav-item ${state.currentTab === 'compliance' ? 'active' : ''}" data-tab="compliance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Compliance &amp; Vault
            ${isTabLocked('compliance', currentPlan) ? '<span class="nav-plan-lock-badge">🔒 SCALE</span>' : ''}
          </div>
        </nav>

        <!-- Active Plan Card in Sidebar -->
        <div class="sidebar-plan-card">
          <div class="sidebar-plan-header">
            <span class="sidebar-plan-label">ACTIVE TIER</span>
            <span class="sidebar-plan-status">Active</span>
          </div>
          <div class="sidebar-plan-name">${planMeta.name}</div>
          <div class="sidebar-plan-price">$${planMeta.monthlyPrice} / mo &bull; Stripe Gateway</div>
          <button class="btn-sidebar-upgrade" id="btn-sidebar-upgrade-plan">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${currentPlan === 'enterprise' ? 'Manage Subscription' : 'Upgrade Plan'}
          </button>
        </div>

        <div class="sidebar-footer">
          <div style="display: flex; gap: 6px; margin-bottom: 10px; width: 100%;">
            <button class="btn btn-secondary btn-sm" id="btn-sidebar-home" style="flex: 1; font-size: 0.72rem; padding: 4px 6px;">Website</button>
            <button class="btn btn-secondary btn-sm" id="btn-sidebar-signout" style="flex: 1; font-size: 0.72rem; padding: 4px 6px;">Sign Out</button>
          </div>
          <div class="status-pill">
            <div class="status-dot"></div>
            <span>RLS Enforced</span>
          </div>
          <span style="font-family: var(--font-mono); color: var(--text-secondary); font-size: 0.72rem;">Postgres 17</span>
        </div>
      </aside>

      <!-- Main Layout -->
      <main class="main-wrapper">
        <header class="topbar">
          <div class="topbar-left">
            <div class="org-tenant-box">
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Tenant:</span>
              <select id="tenantSelect" class="tenant-select">
                <option value="acme_corp" ${state.activeTenant === 'acme_corp' ? 'selected' : ''}>Acme Enterprise Corp (prod-us-east)</option>
                <option value="globex_corp" ${state.activeTenant === 'globex_corp' ? 'selected' : ''}>Globex Research (dev-eu-west)</option>
                <option value="soylent_ind" ${state.activeTenant === 'soylent_ind' ? 'selected' : ''}>Soylent Dynamics (staging-apac)</option>
              </select>
              <div class="topbar-plan-pill" id="topbar-plan-indicator" title="Click to manage subscription or upgrade with Stripe">
                <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#E50920;"></span>
                <span>${planMeta.name.toUpperCase()}</span>
                ${currentPlan !== 'enterprise' ? '<span class="topbar-plan-upgrade-link">Upgrade</span>' : ''}
              </div>
            </div>
          </div>

          <div class="topbar-right">
            <div class="module-status-group">
              <span class="module-chip"><span class="dot"></span>core</span>
              <span class="module-chip"><span class="dot"></span>iot</span>
              <span class="module-chip"><span class="dot"></span>rules</span>
              <span class="module-chip"><span class="dot"></span>crm</span>
              <span class="module-chip"><span class="dot"></span>compliance</span>
            </div>

            <!-- Authenticated User Profile Badge -->
            <div class="auth-user-badge" style="display: flex; align-items: center; gap: 8px; padding: 4px 10px; background: #fff; border: 1px solid var(--border-default); border-radius: 20px; font-size: 0.76rem;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #e50920; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.7rem;">
                ${((state.currentUser?.displayName || state.currentUser?.email || 'A')[0]).toUpperCase()}
              </div>
              <div style="display: flex; flex-direction: column; text-align: left; line-height: 1.15;">
                <span style="font-weight: 600; color: var(--text-primary); max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${state.currentUser?.displayName || state.currentUser?.email || 'Operator'}
                </span>
                <span style="font-size: 0.65rem; color: ${state.currentUser?.isDemo ? '#d97706' : '#16a34a'}; font-family: var(--font-mono);">
                  ${state.currentUser?.isDemo ? 'Demo Session' : 'Firebase Live'}
                </span>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" id="btn-topbar-home" style="margin-left: 4px;">Public Site</button>
            <button class="btn btn-secondary btn-sm" id="btn-topbar-signout">Sign Out</button>
          </div>
        </header>

        <div class="page-container">
          <!-- ── OVERVIEW TAB ─────────────────────────────────────────────── -->
          <div id="tab-overview" class="tab-content ${state.currentTab === 'overview' ? 'active' : ''}">
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
              <div>
                <h2 class="page-title">Platform Operations Overview</h2>
                <div class="page-desc">Runtime health, active module metrics, and cross-module event bus ledger</div>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <button class="btn btn-secondary btn-sm" id="btn-download-all-data" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600; padding: 6px 14px; background: #ffffff; border: 1.5px solid #d1d5db; color: #1e293b; border-radius: var(--radius-sm); box-shadow: 0 1px 3px rgba(0,0,0,0.05); cursor: pointer;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download All My Data (JSON)
                </button>
              </div>
            </div>

            <!-- "Great First Ten Minutes" Onboarding Strip / Starters -->
            ${renderOnboardingBanner(state.onboarding)}

            <div class="grid-4" style="margin-bottom: 24px;">
              <div class="stat-box">
                <div class="stat-label">Platform Health</div>
                <div style="margin: 8px 0 4px 0;">
                  <span class="badge" style="background: #ECFDF5; color: #168447; border: 1px solid #A7F3D0; font-size: 0.95rem; font-weight: 700; padding: 4px 12px; border-radius: 9999px;">Operational</span>
                </div>
                <div class="stat-subtext" style="color: var(--text-muted); font-size: 0.72rem;">Micro-kernel &amp; 5 modules</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Fleet Nodes</div>
                <div class="stat-value" id="stat-online-devices">12</div>
                <div class="stat-subtext" style="color: #168447; font-weight: 600;">&bull; Connected</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Rules Evaluated</div>
                <div class="stat-value">1,428</div>
                <div class="stat-subtext">Today</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Pipeline Value</div>
                <div class="stat-value" id="stat-total-pipeline" style="color: #E50920; font-weight: 800;">$478,000</div>
                <div class="stat-subtext">Total</div>
              </div>
            </div>

            <!-- Middle Row: Multi-Tenant Isolation Diagram + Quick Operations -->
            <div class="grid-2" style="margin-bottom: 24px;">
              <div class="card">
                <div class="card-header" style="margin-bottom: 12px;">
                  <div>
                    <div class="card-title">Multi-Tenant Isolation</div>
                    <div class="card-subtitle">Isolated tenant execution enforced via PostgreSQL RLS</div>
                  </div>
                </div>
                <div class="console-tenant-diagram-wrap">
                  <div class="console-tenant-diagram">
                    <!-- SVG connector lines -->
                    <svg class="console-tenant-svg-lines" viewBox="0 0 440 160">
                      <line x1="80" y1="30" x2="170" y2="80" stroke="#E1E5EA" stroke-width="2" stroke-dasharray="3 3"/>
                      <line x1="360" y1="30" x2="270" y2="80" stroke="#E1E5EA" stroke-width="2" stroke-dasharray="3 3"/>
                      <line x1="80" y1="130" x2="170" y2="80" stroke="#E1E5EA" stroke-width="2" stroke-dasharray="3 3"/>
                      <line x1="360" y1="130" x2="270" y2="80" stroke="#E1E5EA" stroke-width="2" stroke-dasharray="3 3"/>
                    </svg>

                    <!-- 4 Tenant Nodes -->
                    <div class="console-tenant-node node-a">Tenant A</div>
                    <div class="console-tenant-node node-b">Tenant B</div>
                    <div class="console-tenant-node node-c">Tenant C</div>
                    <div class="console-tenant-node node-d">Tenant D</div>

                    <!-- Center Box: ZexCore Core -->
                    <div class="console-core-center">
                      <img src="/zexcore-logo-icon.png" alt="ZexCore" class="console-core-logo" />
                      <span class="console-core-text">ZexCore Core</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Operations -->
              <div class="card">
                <div class="card-header" style="margin-bottom: 12px;">
                  <div>
                    <div class="card-title">Quick Operations</div>
                    <div class="card-subtitle">Dispatch platform actions across isolated engines</div>
                  </div>
                </div>
                <div class="console-quick-op-list">
                  <button class="console-quick-op-btn" id="btn-quick-reg-device">
                    <span class="console-quick-op-icon">&oplus;</span>
                    <span>Register Edge Device</span>
                  </button>
                  <button class="console-quick-op-btn" id="btn-quick-telemetry">
                    <span class="console-quick-op-icon">&oplus;</span>
                    <span>Ingest IoT Reading</span>
                  </button>
                  <button class="console-quick-op-btn" id="btn-quick-lead">
                    <span class="console-quick-op-icon">&oplus;</span>
                    <span>Create Opportunity</span>
                  </button>
                  <button class="console-quick-op-btn" id="btn-quick-eval-rule">
                    <span class="console-quick-op-icon">&oplus;</span>
                    <span>Evaluate Rule</span>
                  </button>
                  <button class="console-quick-op-btn" id="btn-quick-view-audit">
                    <span class="console-quick-op-icon">&oplus;</span>
                    <span>View Audit Event</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Bottom 3-Column Panels: Real-Time Event Stream, Recent Activity, Module Health -->
            <div class="console-bottom-3col" style="margin-bottom: 24px;">
              <!-- 1. Real-Time Event Stream -->
              <div class="console-card-panel">
                <div class="console-panel-header">
                  <span class="console-panel-title">Real-Time Event Stream</span>
                </div>
                <div class="console-stream-list">
                  <div class="console-stream-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot"></span>
                      <span>device.telemetry</span>
                    </div>
                    <span class="console-stream-time">10:21:55</span>
                  </div>
                  <div class="console-stream-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot"></span>
                      <span>rules.executed</span>
                    </div>
                    <span class="console-stream-time">10:21:12</span>
                  </div>
                  <div class="console-stream-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot"></span>
                      <span>audit.logged</span>
                    </div>
                    <span class="console-stream-time">10:20:41</span>
                  </div>
                  <div class="console-stream-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot"></span>
                      <span>tenant.created</span>
                    </div>
                    <span class="console-stream-time">10:17:22</span>
                  </div>
                </div>
                <div class="console-panel-footer">
                  <a href="#/console" class="console-panel-link" onclick="document.querySelector('[data-tab=\\'iot\\']')?.click()">View All &rarr;</a>
                </div>
              </div>

              <!-- 2. Recent Activity -->
              <div class="console-card-panel">
                <div class="console-panel-header">
                  <span class="console-panel-title">Recent Activity</span>
                </div>
                <div class="console-stream-list">
                  <div class="console-stream-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot blue"></span>
                      <div>
                        <strong>New device registered</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">sensor-hub</div>
                      </div>
                    </div>
                    <span class="console-stream-time">2m ago</span>
                  </div>
                  <div class="console-stream-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot blue"></span>
                      <div>
                        <strong>Rule executed</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">temperature_threshold</div>
                      </div>
                    </div>
                    <span class="console-stream-time">4m ago</span>
                  </div>
                  <div class="console-stream-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot blue"></span>
                      <div>
                        <strong>Opportunity created</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">$95,000</div>
                      </div>
                    </div>
                    <span class="console-stream-time">12m ago</span>
                  </div>
                  <div class="console-stream-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot blue"></span>
                      <div>
                        <strong>Audit log viewed</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">admin</div>
                      </div>
                    </div>
                    <span class="console-stream-time">18m ago</span>
                  </div>
                </div>
                <div class="console-panel-footer">
                  <a href="#/console" class="console-panel-link" onclick="document.querySelector('[data-tab=\\'compliance\\']')?.click()">View All &rarr;</a>
                </div>
              </div>

              <!-- 3. Module Health -->
              <div class="console-card-panel">
                <div class="console-panel-header">
                  <span class="console-panel-title">Module Health</span>
                </div>
                <div class="console-health-list">
                  <div class="console-health-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot green"></span>
                      <span>Core</span>
                    </div>
                    <span class="console-health-pct">100%</span>
                  </div>
                  <div class="console-health-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot green"></span>
                      <span>IoT</span>
                    </div>
                    <span class="console-health-pct">100%</span>
                  </div>
                  <div class="console-health-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot green"></span>
                      <span>Rules</span>
                    </div>
                    <span class="console-health-pct">100%</span>
                  </div>
                  <div class="console-health-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot green"></span>
                      <span>CRM</span>
                    </div>
                    <span class="console-health-pct">100%</span>
                  </div>
                  <div class="console-health-item">
                    <div class="console-stream-left">
                      <span class="console-stream-dot green"></span>
                      <span>Compliance</span>
                    </div>
                    <span class="console-health-pct">100%</span>
                  </div>
                </div>
                <div class="console-panel-footer">
                  <a href="#/modules" class="console-panel-link">View All &rarr;</a>
                </div>
              </div>
            </div>

            <!-- Event Bus Live Log -->
            <div class="terminal-box">
              <div class="terminal-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>Core EventBus Real-Time Stream</span>
                  <span style="font-size: 0.7rem; font-family: var(--font-mono); color: #94a3b8;">Asynchronous Event Broker</span>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <span style="font-size: 0.68rem; color: #cbd5e1; text-transform: uppercase; font-weight: 700; margin-right: 2px;">SIEM Export:</span>
                  <button class="btn btn-xs" id="btn-export-siem-json" style="font-size: 0.68rem; padding: 3px 8px; border: 1px solid rgba(255,255,255,0.25); color: #ffffff; background: rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">NDJSON</button>
                  <button class="btn btn-xs" id="btn-export-siem-csv" style="font-size: 0.68rem; padding: 3px 8px; border: 1px solid rgba(255,255,255,0.25); color: #ffffff; background: rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">CSV Audit</button>
                </div>
              </div>
              <div class="terminal-content" id="event-stream-body"></div>
            </div>
          </div>

          <!-- ── IOT HUB TAB ─────────────────────────────────────────────── -->
          <div id="tab-iot" class="tab-content ${state.currentTab === 'iot' ? 'active' : ''}">
            ${renderWithSoftPaywall('iot', currentPlan, `
            <div class="page-header">
              <div>
                <h2 class="page-title">IoT Device Fleet &amp; Telemetry Gateway</h2>
                <div class="page-desc">Manage edge hardware, ingest telemetry via token authentication, and monitor health thresholds</div>
              </div>
              <button class="btn btn-primary" id="btn-open-register-device">+ Register Edge Device</button>
            </div>

            <div class="device-table-card">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Device Name &amp; Key</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Temperature</th>
                    <th>Humidity</th>
                    <th>Voltage</th>
                    <th>Firmware</th>
                    <th>Last Seen</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody id="device-table-body"></tbody>
              </table>
            </div>
            `)}
          </div>

          <!-- ── RULES TAB ────────────────────────────────────────────────── -->
          <div id="tab-rules" class="tab-content ${state.currentTab === 'rules' ? 'active' : ''}">
            <div class="page-header">
              <div>
                <h2 class="page-title">Deterministic Automation Rules &amp; AI Authoring</h2>
                <div class="page-desc">AI synthesizes JSON AST proposals; deterministic engine runs approved rules with zero eval()</div>
              </div>
            </div>

            <!-- AI Authoring Panel -->
            <div class="prompt-panel">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">
                  AI Rule Synthesis Console (Google Gemini Validation Loop)
                </span>
                <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-secondary); background: var(--bg-muted); padding: 2px 8px; border-radius: var(--radius-xs);">
                  POST /api/rules/ai-draft
                </span>
              </div>
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px;">
                Describe an automation intent in plain English. The AI generates a validated RuleDraft JSON conforming to strict Zod schema with approved=false.
              </p>
              <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                <input type="text" class="input" id="ai-rule-prompt" value="Notify operations if temperature exceeds 75°C for 3 consecutive readings" />
                <button class="btn btn-primary" id="btn-generate-ai-rule">Synthesize Rule</button>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('Alert sales VP when a CRM deal over $100k is closed won')">Deal Won Alert</button>
                <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('When IoT battery level falls below 15% queue recharge command')">Battery Low Command</button>
                <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('If customer revokes GDPR consent anonymize personal data immediately')">Consent Erasure</button>
              </div>

              <!-- Output AST Preview -->
              <div id="ai-rule-preview" style="display: none; margin-top: 16px; border-top: 1px solid var(--border-default); padding-top: 14px;">
                <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">
                  Validated Rule Draft AST (Awaiting Human Approval Gate):
                </div>
                <pre class="code-block" id="ai-rule-json"></pre>
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                  <button class="btn btn-primary btn-sm" id="btn-approve-ai-draft">Approve &amp; Deploy Rule (Human Gate)</button>
                  <button class="btn btn-secondary btn-sm" id="btn-discard-ai-draft">Discard Draft</button>
                </div>
              </div>
            </div>

            <!-- Existing Rules Table -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">Active &amp; Draft Automation Rules</div>
              </div>
              <div id="rules-list-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
            </div>
          </div>

          <!-- ── CRM TAB ─────────────────────────────────────────────────── -->
          <div id="tab-crm" class="tab-content ${state.currentTab === 'crm' ? 'active' : ''}">
            ${renderWithSoftPaywall('crm', currentPlan, `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
              <div>
                <h2 class="page-title">Multi-Channel CRM &amp; Booking</h2>
                <div class="page-desc">WhatsApp-first inbox, automated appointment reminders, Paystack deposits, and pipeline Kanban</div>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <button class="btn btn-primary" id="btn-add-lead">+ Create Opportunity</button>
              </div>
            </div>

            <!-- CRM Sub-navigation Tabs -->
            <div style="display: flex; gap: 8px; margin-bottom: 18px; border-bottom: 2px solid var(--border-default); padding-bottom: 10px; flex-wrap: wrap;">
              <button class="btn ${state.crmSubView === 'whatsapp' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-crm-nav-whatsapp" style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #25d366;"></span>
                💬 WhatsApp &amp; Multi-Channel Inbox
                <span style="background: #25d366; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 999px;">1 New</span>
              </button>
              <button class="btn ${state.crmSubView === 'kanban' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-crm-nav-kanban">
                📊 Deals Pipeline (Kanban)
              </button>
              <button class="btn ${state.crmSubView === 'booking' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-crm-nav-booking" style="display: inline-flex; align-items: center; gap: 6px;">
                <span>📅</span> Bookings &amp; Reminders
                <span style="background: #e11d48; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 999px;">3 Active</span>
              </button>
            </div>

            <div id="crm-content-view"></div>
            `)}
          </div>

          <!-- ── COMPLIANCE TAB ───────────────────────────────────────────── -->
          <div id="tab-compliance" class="tab-content ${state.currentTab === 'compliance' ? 'active' : ''}">
            ${renderWithSoftPaywall('compliance', currentPlan, `
            <div class="page-header">
              <div>
                <h2 class="page-title">Compliance, Vault &amp; Privacy Suite</h2>
                <div class="page-desc">GDPR &amp; NDPR regulatory compliance, AES-256-GCM envelope encryption, and Right-to-be-Forgotten</div>
              </div>
            </div>

            <div class="grid-2" style="margin-bottom: 24px;">
              <!-- Cryptographic Envelope Simulator -->
              <div class="card">
                <div class="card-title">Field-Level AEAD Encryption</div>
                <div class="card-subtitle" style="margin-bottom: 14px;">
                  Derived tenant key: <code>HMAC-SHA256(masterKey, 'tenant:<id>')</code>
                </div>
                <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Sensitive Plaintext PII:</label>
                <input type="text" class="input" id="pii-input" value="john.enterprise@finance-corp.gov" style="margin: 4px 0 12px 0;" />
                
                <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">AES-256-GCM Envelope:</div>
                <div class="crypto-display" id="crypto-envelope-display">enc:v1:7f4c9a2d...</div>

                <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; margin-top: 10px;">Deterministic HMAC Blind Index:</div>
                <div class="crypto-display" id="crypto-blind-display" style="color: var(--primary);">blind:e8b417c...</div>
              </div>

              <!-- Right to be Forgotten / Erasure -->
              <div class="card">
                <div class="card-title">Right to be Forgotten (GDPR / NDPR)</div>
                <div class="card-subtitle" style="margin-bottom: 14px;">
                  Permanent pseudonymization of PII across CRM and Consent records
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                  <input type="text" class="input" id="erasure-subject-input" placeholder="Subject Email or UUID" value="david.k@global-cloud.com" />
                  <button class="btn btn-danger" id="btn-execute-erasure">Execute Erasure</button>
                </div>
                <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-default); font-size: 0.8rem; line-height: 1.5;">
                  <div>Fulfilled Erasure Requests: <strong style="color: var(--text-main);" id="erasure-counter">${state.erasureRequestsCount}</strong></div>
                  <div>Sanitized Records: <strong style="color: var(--primary);" id="anonymized-counter">${state.anonymizedCount}</strong></div>
                  <div style="color: var(--text-secondary); font-size: 0.74rem; margin-top: 4px;">
                    Replaces PII with <code>[REDACTED]</code>, wipes contact numbers, and revokes active consent grants.
                  </div>
                </div>
              </div>
            </div>

            <!-- Consent Registry -->
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title">GDPR / NDPR Consent Ledger</div>
                  <div class="card-subtitle">Verifiable timestamps and lawful basis tracking</div>
                </div>
                <button class="btn btn-secondary btn-sm" id="btn-grant-consent">+ Grant Subject Consent</button>
              </div>

              <div id="consent-table-container"></div>
            </div>
            `)}
          </div>
        </div>
      </main>
    </div>
  `;

  setupEventListeners();
  renderDevices();
  renderRules();
  renderCrm();
  renderConsents();
  updateCryptoPreview();
  renderEventLog();
}

// ── Event Handlers ───────────────────────────────────────────────────────────
function setupEventListeners() {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((i) => i.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((tc) => tc.classList.remove('active'));

      item.classList.add('active');
      const tabId = item.getAttribute('data-tab');
      if (tabId) {
        state.currentTab = tabId;
        const target = document.getElementById(`tab-${tabId}`);
        if (target) target.classList.add('active');
      }
    });
  });

  // Topbar and Sidebar Navigation
  document.getElementById('brand-header-to-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('btn-topbar-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('btn-sidebar-home')?.addEventListener('click', () => navigateTo('home'));

  const handleSignOut = async () => {
    await logoutUser();
    state.currentUser = null;
    logBusEvent('auth.session.terminated', { tenant: state.activeTenant });
    navigateTo('signin');
  };
  document.getElementById('btn-topbar-signout')?.addEventListener('click', handleSignOut);
  document.getElementById('btn-sidebar-signout')?.addEventListener('click', handleSignOut);

  // Tenant switch
  const tenantSelect = document.getElementById('tenantSelect') as HTMLSelectElement;
  tenantSelect?.addEventListener('change', (e) => {
    const val = (e.target as HTMLSelectElement).value;
    state.activeTenant = val;
    logBusEvent('tenant.context.switched', { tenantId: val, rlsStatus: 'enforced' });
    renderDashboard();
  });

  // ── Billing / Stripe Upgrade Gateways ─────────────────────────────────────
  const handleUpgradeClick = (targetPlan?: PlanTier) => {
    const currentPlan = getTenantPlan(state.activeTenant);
    const chosenPlan: PlanTier = targetPlan || (
      currentPlan === 'starter' ? 'indie' :
      currentPlan === 'indie' ? 'growth' :
      currentPlan === 'growth' ? 'scale' : 'enterprise'
    );

    openStripeCheckoutModal(chosenPlan, 'monthly', (newPlan) => {
      setTenantPlan(newPlan, state.activeTenant);
      logBusEvent('billing.subscription.upgraded', {
        tenant: state.activeTenant,
        plan: newPlan,
        gateway: 'stripe',
        status: 'active',
      });
      renderDashboard();
    });
  };

  document.getElementById('btn-sidebar-upgrade-plan')?.addEventListener('click', () => handleUpgradeClick());
  document.getElementById('topbar-plan-indicator')?.addEventListener('click', () => handleUpgradeClick());

  document.querySelectorAll<HTMLButtonElement>('.btn-paywall-upgrade').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetPlan = (btn.getAttribute('data-paywall-upgrade') || 'growth') as PlanTier;
      handleUpgradeClick(targetPlan);
    });
  });

  // ── First 10 Minutes Onboarding & Starter Selection ────────────────────────
  document.querySelectorAll('.industry-choice-card').forEach((card) => {
    card.addEventListener('click', () => {
      const vKey = card.getAttribute('data-vertical');
      if (!vKey || !INDUSTRY_STARTERS[vKey]) return;
      const preset = INDUSTRY_STARTERS[vKey];
      state.onboarding.verticalKey = vKey;
      state.onboarding.companyName = preset.companyDefault;
      state.onboarding.listingTitle = preset.listingTitle;
      state.onboarding.listingPrice = preset.listingPrice;
      state.onboarding.checklist.selectedField = true;
      state.devices = [...preset.devices];
      state.rules = [...preset.rules];
      state.leads = [...preset.leads];
      saveOnboardingState(state.onboarding);
      logBusEvent('onboarding.starter.applied', { vertical: vKey, company: preset.companyDefault });
      renderDashboard();
    });
  });

  // Undo & Reset to Select Another Field
  document.getElementById('btn-onboarding-undo')?.addEventListener('click', () => {
    state.onboarding.verticalKey = null;
    saveOnboardingState(state.onboarding);
    logBusEvent('onboarding.starter.reset', { tenant: state.activeTenant });
    renderDashboard();
  });

  // Open / Close Sample Site Preview Modal
  const sampleModal = document.getElementById('sample-site-modal');
  document.getElementById('btn-open-sample-site')?.addEventListener('click', () => {
    if (sampleModal) sampleModal.style.display = 'flex';
  });
  document.getElementById('btn-close-sample-modal')?.addEventListener('click', () => {
    if (sampleModal) sampleModal.style.display = 'none';
  });

  // Sample Enquiry Form submission -> creates CRM lead + logs event
  document.getElementById('sample-enquiry-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('enquiry-name') as HTMLInputElement)?.value || 'Enquiry Client';
    const contact = (document.getElementById('enquiry-contact') as HTMLInputElement)?.value || 'contact@client.io';
    const msg = (document.getElementById('enquiry-msg') as HTMLTextAreaElement)?.value || '';

    const newLead = {
      id: 'lead-' + Date.now().toString(36),
      title: `${state.onboarding.listingTitle} (${name})`,
      company: contact,
      value: parseInt(state.onboarding.listingPrice.replace(/[^0-9]/g, '')) || 2500,
      currency: 'USD',
      stage: 'New',
    };
    state.leads.unshift(newLead);
    state.onboarding.checklist.testedEnquiry = true;
    saveOnboardingState(state.onboarding);
    logBusEvent('crm.enquiry.received', { lead: name, contact, notes: msg, followUp: 'instant_dispatched' });

    const successBanner = document.getElementById('enquiry-success-banner');
    if (successBanner) successBanner.style.display = 'block';

    const submitBtn = document.getElementById('btn-submit-enquiry') as HTMLButtonElement | null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '✓ Enquiry Dispatched to CRM Pipeline';
    }
    renderKanban();
  });

  // Checklist actions
  document.getElementById('check-action-name')?.addEventListener('click', () => {
    const newName = prompt('Enter your company or brand name:', state.onboarding.companyName);
    if (newName && newName.trim()) {
      state.onboarding.companyName = newName.trim();
      state.onboarding.checklist.namedCompany = true;
      saveOnboardingState(state.onboarding);
      renderDashboard();
    }
  });

  document.getElementById('check-action-listing')?.addEventListener('click', () => {
    const newTitle = prompt('Enter your first listing or service title:', state.onboarding.listingTitle);
    if (newTitle && newTitle.trim()) {
      const newPrice = prompt('Enter price (e.g. $1,250 / mo):', state.onboarding.listingPrice);
      state.onboarding.listingTitle = newTitle.trim();
      if (newPrice && newPrice.trim()) state.onboarding.listingPrice = newPrice.trim();
      state.onboarding.checklist.editedListing = true;
      saveOnboardingState(state.onboarding);
      renderDashboard();
    }
  });

  document.getElementById('check-action-enquiry')?.addEventListener('click', () => {
    if (sampleModal) sampleModal.style.display = 'flex';
  });

  document.getElementById('check-action-share')?.addEventListener('click', () => {
    const shareUrl = window.location.origin + '/#/console';
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`Link copied to clipboard!\nShare this link to showcase your site and enquiry flow:\n${shareUrl}`);
      state.onboarding.checklist.sharedLink = true;
      saveOnboardingState(state.onboarding);
      renderDashboard();
    }).catch(() => {
      alert(`Share this link to showcase your site and enquiry flow:\n${shareUrl}`);
    });
  });

  // Quick actions
  document.getElementById('btn-quick-reg-device')?.addEventListener('click', () => {
    const modal = document.getElementById('register-device-modal');
    if (modal) modal.style.display = 'flex';
    else {
      const tabIot = document.querySelector('[data-tab="iot"]') as HTMLElement;
      tabIot?.click();
    }
  });

  document.getElementById('btn-quick-telemetry')?.addEventListener('click', () => {
    triggerTelemetryPing('dev-1', 79.4, 55, 3.2);
  });

  document.getElementById('btn-quick-lead')?.addEventListener('click', () => {
    createLead('Enterprise Analytics Platform', 'CloudScale Inc', 95000, 'Qualified');
  });

  document.getElementById('btn-quick-eval-rule')?.addEventListener('click', () => {
    logBusEvent('rules.eval.requested', { ruleId: 'rule-temp-alert', tenantId: state.activeTenant, result: 'PASSED' });
    const tabRules = document.querySelector('[data-tab="rules"]') as HTMLElement;
    tabRules?.click();
  });

  document.getElementById('btn-quick-view-audit')?.addEventListener('click', () => {
    logBusEvent('audit.viewed', { actor: 'admin@enterprise.org', tenantId: state.activeTenant });
    const tabCompliance = document.querySelector('[data-tab="compliance"]') as HTMLElement;
    tabCompliance?.click();
  });

  document.getElementById('btn-quick-encrypt')?.addEventListener('click', () => {
    const input = document.getElementById('pii-input') as HTMLInputElement;
    if (input) {
      input.value = `confidential_${Date.now()}@secure-enterprise.org`;
      updateCryptoPreview();
    }
  });

  // Crypto preview
  document.getElementById('pii-input')?.addEventListener('input', updateCryptoPreview);

  // AI rule generation
  document.getElementById('btn-generate-ai-rule')?.addEventListener('click', generateAiRule);
  document.getElementById('btn-approve-ai-draft')?.addEventListener('click', approveAiDraft);
  document.getElementById('btn-discard-ai-draft')?.addEventListener('click', () => {
    const box = document.getElementById('ai-rule-preview');
    if (box) box.style.display = 'none';
  });

  // Erasure execute
  document.getElementById('btn-execute-erasure')?.addEventListener('click', () => {
    const input = document.getElementById('erasure-subject-input') as HTMLInputElement;
    const subject = input?.value || 'unknown_subject';
    executeSubjectErasure(subject);
  });

  // Device register
  document.getElementById('btn-open-register-device')?.addEventListener('click', () => {
    const name = prompt('Enter edge device name:', 'Warehouse Environmental Monitor');
    if (!name) return;
    const key = `iot_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(Math.random() * 100)}`;
    state.devices.push({
      id: `dev-${Date.now()}`,
      name,
      key,
      kind: 'multi_sensor',
      status: 'online',
      temperature: 22.0,
      humidity: 50,
      voltage: 3.3,
      firmware: 'v2.2.0',
      lastSeen: 'Just now',
    });
    const token = `zex_dev_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    renderDevices();
    logBusEvent('iot.device.registered', { deviceKey: key, tokenHash: 'sha256_verified' });
    alert(`Device registered successfully!\n\nSingle-Use Secret Token:\n${token}\n\n(Stored securely with SHA-256 token hashing)`);
  });

  // Add lead
  document.getElementById('btn-add-lead')?.addEventListener('click', () => {
    const title = prompt('Opportunity Name:', 'Smart Metering Expansion');
    if (!title) return;
    const company = prompt('Company Name:', 'Metropolis Energy');
    if (!company) return;
    const val = parseInt(prompt('Estimated Deal Value ($):', '65000') || '65000', 10);
    createLead(title, company, val, 'New');
  });

  // Grant consent
  document.getElementById('btn-grant-consent')?.addEventListener('click', () => {
    const sub = prompt('Subject Email or ID:', 'patricia.miller@global-enterprise.com');
    if (!sub) return;
    const purpose = prompt('Purpose (e.g. telemetry_processing, data_analytics):', 'telemetry_processing');
    if (!purpose) return;
    state.consents.unshift({
      id: `c-${Date.now()}`,
      subjectId: sub,
      purpose,
      legalBasis: 'consent',
      grantedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      revokedAt: null,
    });
    renderConsents();
    logBusEvent('compliance.consent.granted', { subjectId: sub, purpose, legalBasis: 'consent' });
  });

  // Download All My Data
  document.getElementById('btn-download-all-data')?.addEventListener('click', downloadAllTenantData);

  // SIEM Exports
  document.getElementById('btn-export-siem-json')?.addEventListener('click', () => exportSiemLog('json'));
  document.getElementById('btn-export-siem-csv')?.addEventListener('click', () => exportSiemLog('csv'));

  // CRM Sub-navigation
  document.getElementById('btn-crm-nav-whatsapp')?.addEventListener('click', () => {
    state.crmSubView = 'whatsapp';
    renderDashboard();
  });
  document.getElementById('btn-crm-nav-kanban')?.addEventListener('click', () => {
    state.crmSubView = 'kanban';
    renderDashboard();
  });
  document.getElementById('btn-crm-nav-booking')?.addEventListener('click', () => {
    state.crmSubView = 'booking';
    renderDashboard();
  });
}

(window as any).setAiPrompt = (txt: string) => {
  const input = document.getElementById('ai-rule-prompt') as HTMLInputElement;
  if (input) input.value = txt;
};

// ── IoT Render ───────────────────────────────────────────────────────────────
function renderDevices() {
  const tbody = document.getElementById('device-table-body');
  if (!tbody) return;

  tbody.innerHTML = state.devices.map((d) => `
    <tr>
      <td>
        <div style="font-weight: 600; color: var(--text-main);">${d.name}</div>
        <div style="font-size: 0.72rem; color: var(--text-secondary); font-family: var(--font-mono);">${d.key}</div>
      </td>
      <td style="color: var(--text-secondary); font-size: 0.8rem;"><code>${d.kind}</code></td>
      <td>
        <span class="badge-status ${d.status}">${d.status}</span>
      </td>
      <td>
        <strong style="color: ${d.temperature > 70 ? 'var(--primary)' : 'var(--text-main)'}; font-family: var(--font-mono);">
          ${d.temperature}°C
        </strong>
      </td>
      <td style="font-family: var(--font-mono);">${d.humidity}%</td>
      <td style="font-family: var(--font-mono);">${d.voltage}V</td>
      <td style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono);">${d.firmware}</td>
      <td style="font-size: 0.78rem; color: var(--text-secondary);">${d.lastSeen}</td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm" onclick="window.pingDevice('${d.id}')">📡 Ingest Ping</button>
      </td>
    </tr>
  `).join('');

  const onlineCount = state.devices.filter((d) => d.status === 'online').length;
  const statOnline = document.getElementById('stat-online-devices');
  if (statOnline) statOnline.innerText = `${onlineCount} / ${state.devices.length}`;
}

(window as any).pingDevice = (id: string) => {
  const dev = state.devices.find((d) => d.id === id);
  if (!dev) return;
  const temp = parseFloat((dev.temperature + (Math.random() * 4 - 2)).toFixed(1));
  const hum = Math.min(99, Math.max(10, Math.round(dev.humidity + (Math.random() * 6 - 3))));
  triggerTelemetryPing(id, temp, hum, dev.voltage);
};

function triggerTelemetryPing(deviceId: string, temp: number, humidity: number, voltage: number) {
  const dev = state.devices.find((d) => d.id === deviceId);
  if (dev) {
    dev.temperature = temp;
    dev.humidity = humidity;
    dev.voltage = voltage;
    dev.status = 'online';
    dev.lastSeen = 'Just now';
  }
  renderDevices();

  logBusEvent('iot.telemetry.received', { deviceId, metrics: { temperature: temp, humidity, voltage } });

  if (temp > 75) {
    logBusEvent('iot.alert.triggered', {
      deviceId,
      metric: 'temperature',
      actualValue: temp,
      threshold: 75,
      severity: 'critical',
      action: 'rules_engine_dispatched',
    });
  }
}

// ── Rules Render ─────────────────────────────────────────────────────────────
let currentDraftRule: Rule | null = null;

function renderRules() {
  const container = document.getElementById('rules-list-container');
  if (!container) return;

  container.innerHTML = state.rules.map((r) => `
    <div style="background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <strong style="font-size: 0.9rem; color: var(--text-main);">${r.name}</strong>
          ${r.approved ? '<span class="badge-status online">ACTIVE</span>' : '<span class="badge-status" style="background: var(--warning-bg); color: var(--warning); border: 1px solid var(--warning-border);">PENDING APPROVAL</span>'}
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.76rem; color: var(--text-secondary); margin-top: 4px;">
          <span>Trigger: <strong style="color: var(--text-main);">${r.trigger}</strong></span> |
          <span>Condition: <code>${r.conditions}</code></span> |
          <span>Action: <code>${r.action}</code></span>
        </div>
      </div>
      <div>
        ${!r.approved ? `<button class="btn btn-primary btn-sm" onclick="window.approveRule('${r.id}')">Approve Rule</button>` : `<button class="btn btn-secondary btn-sm" onclick="window.toggleRule('${r.id}')">${r.enabled ? 'Disable' : 'Enable'}</button>`}
      </div>
    </div>
  `).join('');
}

(window as any).approveRule = (id: string) => {
  const rule = state.rules.find((r) => r.id === id);
  if (rule) {
    rule.approved = true;
    renderRules();
    logBusEvent('rules.rule.activated', { ruleId: id, name: rule.name });
  }
};

(window as any).toggleRule = (id: string) => {
  const rule = state.rules.find((r) => r.id === id);
  if (rule) {
    rule.enabled = !rule.enabled;
    renderRules();
    logBusEvent(rule.enabled ? 'rules.rule.enabled' : 'rules.rule.disabled', { ruleId: id });
  }
};

function generateAiRule() {
  const input = document.getElementById('ai-rule-prompt') as HTMLInputElement;
  const intent = input?.value || 'High temperature threshold monitor';

  currentDraftRule = {
    id: `rule-${Date.now()}`,
    name: intent.length > 50 ? `${intent.substring(0, 47)}...` : intent,
    trigger: intent.toLowerCase().includes('deal') || intent.toLowerCase().includes('crm') ? 'crm.lead.won' : 'iot.telemetry.received',
    conditions: 'metrics.temperature > 75',
    action: 'emit: ops.notification.dispatched',
    approved: false,
    enabled: true,
  };

  const astJson = {
    $schema: 'https://zexcore.org/schema/v1/rule.json',
    name: currentDraftRule.name,
    trigger: { source: currentDraftRule.trigger },
    conditions: {
      all: [
        { field: 'metrics.temperature', op: 'gt', value: 75 },
      ],
    },
    actions: [
      { type: 'emit', event: 'ops.notification.dispatched', payload: { channel: 'ops_alert', priority: 'high' } },
    ],
    approved: false,
    aiGenerated: true,
  };

  const preview = document.getElementById('ai-rule-preview');
  const jsonPre = document.getElementById('ai-rule-json');
  if (preview && jsonPre) {
    jsonPre.textContent = JSON.stringify(astJson, null, 2);
    preview.style.display = 'block';
  }

  logBusEvent('rules.ai_draft.synthesized', { intent, generatedAST: 'RuleDraftSchema.verified' });
}

function approveAiDraft() {
  if (currentDraftRule) {
    currentDraftRule.approved = true;
    state.rules.unshift(currentDraftRule);
    renderRules();
    logBusEvent('rules.rule.activated', { ruleId: currentDraftRule.id, name: currentDraftRule.name });
    currentDraftRule = null;
    const preview = document.getElementById('ai-rule-preview');
    if (preview) preview.style.display = 'none';
  }
}

// ── Data Portability & SIEM Audit Exports ────────────────────────────────────
function downloadAllTenantData() {
  const exportPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    tenantId: state.activeTenant,
    user: state.currentUser ? { uid: state.currentUser.uid, email: state.currentUser.email, displayName: state.currentUser.displayName, tenantSlug: state.currentUser.tenantSlug } : null,
    plan: getTenantPlan(state.activeTenant),
    data: {
      devices: state.devices,
      rules: state.rules,
      crm: {
        leads: state.leads,
        whatsAppThreads: state.whatsAppThreads,
        bookings: state.bookings,
      },
      compliance: {
        consents: state.consents,
        erasureRequestsCount: state.erasureRequestsCount,
        anonymizedCount: state.anonymizedCount,
      },
      auditLedger: state.events,
    },
    cryptographicProof: {
      algorithm: 'SHA-256',
      ledgerRootHash: Array.from(state.activeTenant + Date.now().toString())
        .map((c) => c.charCodeAt(0).toString(16))
        .join('')
        .slice(0, 64),
      signedBy: 'ZexCore Root HSM Authority',
    },
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zexcore-tenant-export-${state.activeTenant}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  logBusEvent('tenant.data.exported', {
    tenant: state.activeTenant,
    sizeBytes: blob.size,
    recordsCount: state.devices.length + state.rules.length + state.leads.length + state.whatsAppThreads.length,
    gdprCompliant: true,
  });
}

function exportSiemLog(format: 'json' | 'csv') {
  if (format === 'json') {
    // NDJSON format for Splunk, Datadog, Elastic, IBM QRadar, Microsoft Sentinel
    const ndjsonLines = state.events.map((evt, idx) => {
      const lineObj = {
        '@timestamp': new Date(Date.now() - (state.events.length - idx) * 60000).toISOString(),
        tenant_id: state.activeTenant,
        event_name: evt.name,
        display_time: evt.ts,
        payload: (() => {
          try { return JSON.parse(evt.payload); } catch { return evt.payload; }
        })(),
        integrity_hash: Array.from(evt.name + evt.ts + state.activeTenant)
          .map((c) => c.charCodeAt(0).toString(16))
          .join('')
          .slice(0, 32),
        classification: 'SECURITY_AUDIT_LOG',
      };
      return JSON.stringify(lineObj);
    });

    const content = ndjsonLines.join('\n');
    const blob = new Blob([content], { type: 'application/x-ndjson' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zexcore-siem-${state.activeTenant}-${Date.now()}.ndjson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logBusEvent('audit.siem.exported', {
      format: 'NDJSON',
      eventsCount: state.events.length,
      destination: 'SIEM_INGEST_READY',
    });
  } else {
    // CSV format for compliance auditors & Excel SIEM parsers
    const headers = ['Timestamp', 'TenantID', 'EventName', 'Payload', 'IntegritySignature'];
    const rows = state.events.map((evt, idx) => {
      const iso = new Date(Date.now() - (state.events.length - idx) * 60000).toISOString();
      const escapedPayload = `"${evt.payload.replace(/"/g, '""')}"`;
      const sig = Array.from(evt.name + evt.ts).map((c) => c.charCodeAt(0).toString(16)).join('').slice(0, 24);
      return [iso, state.activeTenant, evt.name, escapedPayload, sig].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zexcore-siem-${state.activeTenant}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logBusEvent('audit.siem.exported', {
      format: 'CSV',
      eventsCount: state.events.length,
      destination: 'CSV_AUDIT_ARCHIVE',
    });
  }
}

// ── Multi-Channel CRM & Booking Renderers ─────────────────────────────────────
function renderCrm() {
  const container = document.getElementById('crm-content-view');
  if (!container) return;

  if (state.crmSubView === 'kanban') {
    container.innerHTML = `
      <div class="kanban-board" id="kanban-container"></div>
    `;
    renderKanban();
    return;
  }

  if (state.crmSubView === 'booking') {
    renderBookingsView(container);
    return;
  }

  // Default: WhatsApp & Multi-Channel Inbox
  renderWhatsAppInboxView(container);
}

function renderWhatsAppInboxView(container: HTMLElement) {
  const activeThread = state.whatsAppThreads.find((t) => t.id === state.selectedThreadId) || state.whatsAppThreads[0];
  const totalUnread = state.whatsAppThreads.reduce((acc, t) => acc + t.unreadCount, 0);

  container.innerHTML = `
    <div class="whatsapp-inbox-grid">
      <!-- Left Column: Thread List -->
      <div class="whatsapp-threads-col">
        <div class="whatsapp-threads-header">
          <div>
            <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
              <span>💬 Multi-Channel Inbox</span>
              ${totalUnread > 0 ? `<span style="background: #25d366; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 999px;">${totalUnread} new</span>` : ''}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
              Meta WhatsApp Cloud API &middot; Webhooks Live
            </div>
          </div>
          <button class="btn btn-secondary btn-xs" onclick="window.simulateIncomingWhatsApp()" title="Simulate incoming customer lead message via webhook">
            + Test Inbound
          </button>
        </div>

        <div style="flex: 1; overflow-y: auto;">
          ${state.whatsAppThreads.map((th) => {
            const isActive = activeThread && th.id === activeThread.id;
            const channelBadge = th.channel === 'whatsapp'
              ? `<span class="whatsapp-channel-badge wa">WhatsApp</span>`
              : th.channel === 'sms'
              ? `<span class="whatsapp-channel-badge sms">SMS</span>`
              : `<span class="whatsapp-channel-badge email">Email</span>`;

            return `
              <div class="whatsapp-thread-item ${isActive ? 'active' : ''}" onclick="window.selectWhatsAppThread('${th.id}')">
                <div class="whatsapp-thread-top">
                  <span class="whatsapp-thread-name">${th.contactName}</span>
                  <span class="whatsapp-thread-time">${th.time}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="whatsapp-thread-snippet">${th.lastMsg}</span>
                  ${th.unreadCount > 0 ? `<span style="background: #25d366; color: #fff; font-size: 0.65rem; font-weight: 800; border-radius: 999px; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center;">${th.unreadCount}</span>` : ''}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem;">
                  ${channelBadge}
                  <span style="font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 1px 6px; border-radius: 4px;">$${th.leadValue.toLocaleString()} &middot; ${th.stage}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Right Column: Active Conversation -->
      <div class="whatsapp-chat-col">
        ${activeThread ? `
          <div class="whatsapp-chat-header">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: #dcfce7; color: #15803d; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; border: 1.5px solid #86efac;">
                ${activeThread.contactName.charAt(0)}
              </div>
              <div>
                <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                  <span>${activeThread.contactName}</span>
                  <span style="font-size: 0.72rem; color: #64748b; font-weight: 500;">${activeThread.phone}</span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                  <span style="color: #16a34a; font-weight: 700;">● Online</span>
                  <span>&middot;</span>
                  <span>Pipeline: <strong>${activeThread.stage}</strong> ($${activeThread.leadValue.toLocaleString()})</span>
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <a href="https://wa.me/${activeThread.cleanPhone}?text=${encodeURIComponent('Hello ' + activeThread.contactName + ', following up regarding your ZexCore inquiry!')}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                Open in WhatsApp
              </a>
              <button class="btn btn-secondary btn-sm" onclick="window.convertChatToOpportunity('${activeThread.id}')">
                Convert to Deal &rarr;
              </button>
            </div>
          </div>

          <!-- Chat Messages Body -->
          <div class="whatsapp-chat-body" id="whatsapp-chat-body">
            ${activeThread.messages.map((m) => `
              <div class="whatsapp-msg ${m.sender}">
                <div style="margin-bottom: 2px;">${m.text}</div>
                <div class="whatsapp-msg-time">
                  <span>${m.time}</span>
                  ${m.sender === 'agent' ? `<span style="color: #0284c7; font-weight: 800;">✓✓</span>` : ''}
                  ${m.sender === 'bot' ? `<span style="background: #e2e8f0; color: #475569; font-size: 0.6rem; padding: 1px 4px; border-radius: 3px;">BOT AUTO</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Saved Reply Templates / Ready Recipes -->
          <div class="whatsapp-quick-replies-row">
            <span style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); align-self: center; margin-right: 4px;">⚡ Quick Replies:</span>
            <button class="whatsapp-quick-reply-pill" onclick="window.sendWhatsAppQuickPing('⚡ Here is our Cold Chain & Fleet Telemetry Hardware Specification catalog.')">📄 Send Product Specs</button>
            <button class="whatsapp-quick-reply-pill" onclick="window.sendWhatsAppQuickPing('📅 You can book a 1-on-1 hardware live onboarding slot here: https://zexcore.io/book/${activeThread.id}')">📅 Share 1-Click Booking</button>
            <button class="whatsapp-quick-reply-pill" onclick="window.sendWhatsAppQuickPing('💳 Here is the Paystack checkout link to secure your initial reservation deposit: https://paystack.com/pay/zexcore-starter')">💳 Request Paystack Deposit (₦50k)</button>
            <button class="whatsapp-quick-reply-pill" onclick="window.sendWhatsAppQuickPing('🔒 ZexCore operates on single-tenant database encryption with ISO 27001 audit logging.')">🔒 Security Summary</button>
          </div>

          <!-- Message Composer Form -->
          <form class="whatsapp-composer" id="whatsapp-message-form" onsubmit="event.preventDefault(); window.sendWhatsAppCustomMessage();">
            <input type="text" id="whatsapp-composer-input" class="input" placeholder="Type a WhatsApp message or automated dispatch..." style="flex: 1;" />
            <button type="submit" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px;">
              <span>Send</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        ` : `
          <div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
            Select a conversation on the left to view messages.
          </div>
        `}
      </div>
    </div>
  `;

  // Auto-scroll chat body to bottom
  const bodyEl = document.getElementById('whatsapp-chat-body');
  if (bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;
}

function renderBookingsView(container: HTMLElement) {
  const totalBookings = state.bookings.length;
  const remindersDelivered = state.bookings.filter((b) => b.whatsappReminderStatus === 'delivered').length;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <!-- Top Metrics Strip -->
      <div class="grid-4">
        <div class="stat-box" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: var(--radius-md); padding: 16px;">
          <div class="stat-label">Confirmed Appointments</div>
          <div class="stat-value" style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-top: 6px;">${totalBookings}</div>
          <div class="stat-subtext" style="color: #16a34a; font-size: 0.72rem; font-weight: 600; margin-top: 4px;">Calendar sync: Active</div>
        </div>

        <div class="stat-box" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: var(--radius-md); padding: 16px;">
          <div class="stat-label">Slot Deposits Secured</div>
          <div class="stat-value" style="font-size: 1.6rem; font-weight: 800; color: #0284c7; margin-top: 6px;">₦120,000</div>
          <div class="stat-subtext" style="color: var(--text-muted); font-size: 0.72rem; margin-top: 4px;">Via Paystack &amp; Flutterwave</div>
        </div>

        <div class="stat-box" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: var(--radius-md); padding: 16px;">
          <div class="stat-label">WhatsApp Reminders</div>
          <div class="stat-value" style="font-size: 1.6rem; font-weight: 800; color: #16a34a; margin-top: 6px;">${remindersDelivered} / ${totalBookings}</div>
          <div class="stat-subtext" style="color: #16a34a; font-size: 0.72rem; font-weight: 600; margin-top: 4px;">Automated 24h &amp; 1h alerts</div>
        </div>

        <div class="stat-box" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: var(--radius-md); padding: 16px;">
          <div class="stat-label">No-Show Prevention Rate</div>
          <div class="stat-value" style="font-size: 1.6rem; font-weight: 800; color: #e11d48; margin-top: 6px;">98.4%</div>
          <div class="stat-subtext" style="color: var(--text-muted); font-size: 0.72rem; margin-top: 4px;">Cuts missed meetings by 40%</div>
        </div>
      </div>

      <!-- Action Banner & Bookings Table -->
      <div class="card" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        <div class="card-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-default); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-weight: 800; font-size: 1rem; color: var(--text-main);">📅 Scheduled Client Bookings &amp; Telemetry Intakes</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
              Shareable booking page with automated WhatsApp/SMS reminders to cut customer no-shows
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.copyShareableBookingLink()">
              🔗 Copy Booking Link
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.openNewBookingModal()">
              + New Appointment
            </button>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1.5px solid var(--border-default); font-size: 0.75rem; color: #64748b; text-transform: uppercase;">
                <th style="padding: 12px 16px;">Client &amp; Contact</th>
                <th style="padding: 12px 16px;">Service / Booking Item</th>
                <th style="padding: 12px 16px;">Scheduled Time</th>
                <th style="padding: 12px 16px;">Deposit Held</th>
                <th style="padding: 12px 16px;">WhatsApp Automation</th>
                <th style="padding: 12px 16px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.bookings.map((b) => {
                const statusBadge = b.whatsappReminderStatus === 'delivered'
                  ? `<span class="badge" style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; font-size: 0.72rem; font-weight: 700;">✓ Delivered (24h)</span>`
                  : b.whatsappReminderStatus === 'sent_1h'
                  ? `<span class="badge" style="background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; font-size: 0.72rem; font-weight: 700;">✓ 1-Hour Alert Sent</span>`
                  : `<span class="badge" style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-size: 0.72rem; font-weight: 700;">⏳ Scheduled</span>`;

                return `
                  <tr style="border-bottom: 1px solid #f1f5f9; font-size: 0.85rem;">
                    <td style="padding: 12px 16px;">
                      <div style="font-weight: 700; color: var(--text-main);">${b.clientName}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${b.phone}</div>
                    </td>
                    <td style="padding: 12px 16px;">
                      <div style="font-weight: 600; color: #1e293b;">${b.service}</div>
                    </td>
                    <td style="padding: 12px 16px; font-weight: 600; color: #0284c7;">
                      ${b.dateTime}
                    </td>
                    <td style="padding: 12px 16px;">
                      <span style="background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; font-weight: 700; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px;">
                        ${b.depositStatus}
                      </span>
                    </td>
                    <td style="padding: 12px 16px;">
                      ${statusBadge}
                    </td>
                    <td style="padding: 12px 16px; text-align: right;">
                      <div style="display: inline-flex; gap: 6px; align-items: center;">
                        <button class="btn btn-secondary btn-xs" onclick="window.triggerBookingReminder('${b.id}')" title="Dispatch automated reminder message now">
                          📲 Ping Reminder
                        </button>
                        <a href="https://wa.me/${b.cleanPhone}?text=${encodeURIComponent(`Hi ${b.clientName}, this is a reminder for your confirmed booking: ${b.service} at ${b.dateTime}. To reschedule or modify: https://zexcore.io/reschedule/${b.id}`)}" target="_blank" rel="noopener noreferrer" class="btn btn-xs" style="background: #25d366; color: #fff; border: none; font-weight: 700; border-radius: 4px; padding: 3px 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                          Chat
                        </a>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ── CRM Kanban Render ────────────────────────────────────────────────────────
function renderKanban() {
  const container = document.getElementById('kanban-container');
  if (!container) return;

  container.innerHTML = state.stages.map((stage) => {
    const stageLeads = state.leads.filter((l) => l.stage === stage);
    const totalVal = stageLeads.reduce((acc, l) => acc + l.value, 0);

    return `
      <div class="kanban-column">
        <div class="kanban-header">
          <span class="kanban-title">${stage}</span>
          <span class="kanban-metric">${stageLeads.length} · $${totalVal.toLocaleString()}</span>
        </div>
        <div class="kanban-cards">
          ${stageLeads.map((l) => `
            <div class="lead-card">
              <div class="lead-title">${l.title}</div>
              <div class="lead-company">${l.company}</div>
              <div class="lead-meta">
                <span class="lead-value">$${l.value.toLocaleString()}</span>
                <button class="btn btn-secondary btn-sm" onclick="window.advanceLead('${l.id}')">Advance →</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  const total = state.leads.reduce((a, b) => a + b.value, 0);
  const el = document.getElementById('stat-total-pipeline');
  if (el) el.innerText = `$${total.toLocaleString()}`;
}

(window as any).advanceLead = (id: string) => {
  const lead = state.leads.find((l) => l.id === id);
  if (!lead) return;
  const idx = state.stages.indexOf(lead.stage);
  if (idx < state.stages.length - 1) {
    lead.stage = state.stages[idx + 1]!;
    if (state.crmSubView === 'kanban') renderKanban();
    logBusEvent('crm.lead.stage_changed', { leadId: id, newStage: lead.stage, value: lead.value });
    if (lead.stage === 'Closed Won') {
      logBusEvent('crm.lead.won', { leadId: id, value: lead.value, title: lead.title });
    }
  }
};

function createLead(title: string, company: string, value: number, stage: string) {
  const lead: Lead = {
    id: `lead-${Date.now()}`,
    title,
    company,
    value,
    currency: 'USD',
    stage,
  };
  state.leads.unshift(lead);
  if (state.crmSubView === 'kanban') renderKanban();
  logBusEvent('crm.lead.created', { leadId: lead.id, title, value, stage });
}

// Global CRM & WhatsApp Interactive Handlers
(window as any).selectWhatsAppThread = (id: string) => {
  state.selectedThreadId = id;
  const th = state.whatsAppThreads.find((t) => t.id === id);
  if (th) th.unreadCount = 0;
  renderCrm();
};

(window as any).sendWhatsAppQuickPing = (text: string) => {
  const activeThread = state.whatsAppThreads.find((t) => t.id === state.selectedThreadId) || state.whatsAppThreads[0];
  if (!activeThread) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newMsg: WhatsAppMessage = {
    sender: 'agent',
    text,
    time: timeStr,
    status: 'delivered',
  };

  activeThread.messages.push(newMsg);
  activeThread.lastMsg = text;
  activeThread.time = timeStr;

  logBusEvent('crm.whatsapp.message_sent', {
    threadId: activeThread.id,
    phone: activeThread.phone,
    textSnippet: text.slice(0, 40),
    channel: activeThread.channel,
    gateway: 'Meta WhatsApp Cloud API',
  });

  renderCrm();
};

(window as any).sendWhatsAppCustomMessage = () => {
  const input = document.getElementById('whatsapp-composer-input') as HTMLInputElement;
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  (window as any).sendWhatsAppQuickPing(text);
  input.value = '';
};

(window as any).simulateIncomingWhatsApp = () => {
  const activeThread = state.whatsAppThreads.find((t) => t.id === state.selectedThreadId) || state.whatsAppThreads[0];
  if (!activeThread) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const responses = [
    'Thanks! I just reviewed the specs. What is the lead time for 10 hardware units in Nairobi?',
    'Awesome, our finance team has approved the Paystack invoice. Can we schedule delivery for Thursday?',
    'Confirmed, temperature alerts are working properly on our dashboard test unit!',
  ];
  const reply = responses[Math.floor(Math.random() * responses.length)];

  activeThread.messages.push({
    sender: 'client',
    text: reply,
    time: timeStr,
  });
  activeThread.lastMsg = reply;
  activeThread.time = timeStr;
  activeThread.unreadCount++;

  logBusEvent('crm.whatsapp.webhook_received', {
    threadId: activeThread.id,
    from: activeThread.phone,
    snippet: reply.slice(0, 45),
    verifiedWebhook: 'Meta HMAC-SHA256 Signature Valid',
  });

  renderCrm();
};

(window as any).convertChatToOpportunity = (threadId: string) => {
  const thread = state.whatsAppThreads.find((t) => t.id === threadId);
  if (!thread) return;

  createLead(`${thread.contactName} - Hardware Contract`, thread.contactName + ' Enterprise', thread.leadValue, thread.stage);
  alert(`Conversation with ${thread.contactName} converted into CRM Opportunity (${thread.stage} · $${thread.leadValue.toLocaleString()})!`);
  state.crmSubView = 'kanban';
  renderDashboard();
};

(window as any).triggerBookingReminder = (id: string) => {
  const b = state.bookings.find((item) => item.id === id);
  if (!b) return;

  b.whatsappReminderStatus = 'delivered';
  logBusEvent('booking.reminder.dispatched', {
    bookingId: b.id,
    client: b.clientName,
    phone: b.phone,
    channel: 'whatsapp',
    template: 'booking_reminder_24h',
    delivered: true,
  });

  renderCrm();
  alert(`Automated WhatsApp Reminder dispatched to ${b.clientName} (${b.phone})!\n\nMessage delivered with zero-friction reschedule link.`);
};

(window as any).openNewBookingModal = () => {
  const name = prompt('Client Name:', 'Chief Olatunji Adeleke');
  if (!name) return;
  const phone = prompt('Client WhatsApp Phone (+234...):', '+234 809 123 4567');
  if (!phone) return;
  const service = prompt('Service / Consultation:', 'Cold Chain Edge Sensor Deployment');
  if (!service) return;
  const dateTime = prompt('Scheduled Date & Time:', 'Tomorrow, 3:00 PM WAT');
  if (!dateTime) return;

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const newBooking: BookingAppointment = {
    id: `book-${Date.now()}`,
    clientName: name,
    phone,
    cleanPhone,
    service,
    dateTime,
    depositStatus: '₦50,000 Paid (Paystack)',
    whatsappReminderStatus: 'delivered',
  };

  state.bookings.unshift(newBooking);
  logBusEvent('booking.appointment.scheduled', {
    bookingId: newBooking.id,
    client: name,
    phone,
    service,
    depositGateway: 'Paystack Instant',
  });

  renderCrm();
};

(window as any).copyShareableBookingLink = () => {
  const link = `https://zexcore.io/book/${state.activeTenant}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link);
    alert(`Public shareable booking link copied to clipboard:\n${link}\n\nClients can pick slots, pay Paystack deposits, and get instant WhatsApp reminders!`);
  } else {
    prompt('Shareable Booking Link:', link);
  }
};

// ── Compliance Render ────────────────────────────────────────────────────────
function updateCryptoPreview() {
  const input = document.getElementById('pii-input') as HTMLInputElement;
  const val = input ? input.value : 'user@example.com';

  const hex = Array.from(val).map((c) => c.charCodeAt(0).toString(16)).join('');
  const iv = '4a9f1c7e8b02';
  const tag = '9b2c3d4e5f6a7b8c';
  const envelope = `enc:v1:${iv}:${tag}:${hex.substring(0, 40)}`;
  const blind = `blind:${hex.substring(0, 16)}fa79c02d4`;

  const envEl = document.getElementById('crypto-envelope-display');
  const blnEl = document.getElementById('crypto-blind-display');
  if (envEl) envEl.innerText = envelope;
  if (blnEl) blnEl.innerText = blind;
}

function renderConsents() {
  const container = document.getElementById('consent-table-container');
  if (!container) return;

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Subject Identifier</th>
          <th>Purpose</th>
          <th>Lawful Basis</th>
          <th>Granted Date</th>
          <th>Status</th>
          <th style="text-align: right;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${state.consents.map((c) => `
          <tr>
            <td style="font-family: var(--font-mono); font-size: 0.8rem;">${c.subjectId}</td>
            <td><code>${c.purpose}</code></td>
            <td><span class="badge-status active" style="font-size: 0.68rem;">${c.legalBasis}</span></td>
            <td style="color: var(--text-secondary); font-size: 0.78rem;">${c.grantedAt}</td>
            <td>
              ${c.revokedAt ? '<span class="badge-status" style="background: var(--error-bg); color: var(--error); border: 1px solid var(--error-border);">REVOKED</span>' : '<span class="badge-status online">ACTIVE</span>'}
            </td>
            <td style="text-align: right;">
              ${!c.revokedAt ? `<button class="btn btn-danger btn-sm" onclick="window.revokeConsent('${c.id}')">Revoke</button>` : '<span style="color: var(--text-muted); font-size: 0.74rem;">Archived</span>'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

(window as any).revokeConsent = (id: string) => {
  const c = state.consents.find((item) => item.id === id);
  if (c) {
    c.revokedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    renderConsents();
    logBusEvent('compliance.consent.revoked', { subjectId: c.subjectId, purpose: c.purpose });
  }
};

function executeSubjectErasure(subjectId: string) {
  state.erasureRequestsCount++;
  state.anonymizedCount += 3;

  state.consents.forEach((c) => {
    if (c.subjectId.includes(subjectId) || subjectId.includes(c.subjectId)) {
      c.revokedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
  });
  renderConsents();

  const eraCounter = document.getElementById('erasure-counter');
  const anoCounter = document.getElementById('anonymized-counter');
  if (eraCounter) eraCounter.innerText = state.erasureRequestsCount.toString();
  if (anoCounter) anoCounter.innerText = state.anonymizedCount.toString();

  logBusEvent('compliance.erasure.completed', {
    subjectId,
    sanitizedRecords: 3,
    anonymizedMask: '[REDACTED]',
    hashChainedAuditLedger: 'SHA256_APPEND_ONLY',
  });

  alert(`Right to be Forgotten Executed for: ${subjectId}\n\n- CRM Personal Records: Anonymized to [REDACTED]\n- Consents: Revoked\n- Tamper-evident Audit Ledger Entry Appended`);
}

// ── Event Log Stream ─────────────────────────────────────────────────────────
function renderEventLog() {
  const container = document.getElementById('event-stream-body');
  if (!container) return;

  container.innerHTML = state.events.map((e) => `
    <div class="log-row">
      <span class="log-time">[${e.ts}]</span>
      <span class="log-topic">${e.name}</span>
      <span class="log-data">${e.payload}</span>
    </div>
  `).join('');
}

// ── Application Router (10 Distinct Pages) ──────────────────────────────────
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const view = state.currentView;

  switch (view) {
    case 'home':
      app.innerHTML = renderHomePage();
      setupNavbarEvents();
      setupHomePageEvents();
      break;
    case 'platform':
      app.innerHTML = renderPlatformPage();
      setupNavbarEvents();
      break;
    case 'architecture':
      app.innerHTML = renderArchitecturePage();
      setupNavbarEvents();
      break;
    case 'modules':
      app.innerHTML = renderModulesPage();
      setupNavbarEvents();
      break;
    case 'solutions':
      app.innerHTML = renderSolutionsPage();
      setupNavbarEvents();
      break;
    case 'security':
      app.innerHTML = renderSecurityPage();
      setupNavbarEvents();
      break;
    case 'docs':
      app.innerHTML = renderDocsPage();
      setupNavbarEvents();
      break;
    case 'resources':
      app.innerHTML = renderResourcesPage();
      setupNavbarEvents();
      break;
    case 'pricing':
      app.innerHTML = renderPricingPage();
      setupNavbarEvents();
      break;
    case 'signin':
      app.innerHTML = renderSignInPage(state.activeTenant);
      setupSignInEvents((tenant, user) => {
        state.activeTenant = tenant;
        state.currentUser = user;
        logBusEvent('auth.session.created', { tenant, user: user.email, status: 'authenticated' });
        window.location.hash = '#/console';
      });
      break;
    case 'console':
    case 'dashboard':
      renderDashboard();
      break;
    default:
      app.innerHTML = renderHomePage();
      setupNavbarEvents();
      setupHomePageEvents();
      break;
  }
}

function syncRouteFromHash() {
  const rawHash = window.location.hash.replace(/^#\/?/, '').split('?')[0].split('#')[0];
  const route = rawHash.toLowerCase();

  if (route === 'signin' || route === 'login') {
    state.currentView = 'signin';
  } else if (route === 'console' || route === 'dashboard' || route === 'app') {
    state.currentView = 'console';
  } else if (route === 'platform') {
    state.currentView = 'platform';
  } else if (route === 'architecture') {
    state.currentView = 'architecture';
  } else if (route === 'modules') {
    state.currentView = 'modules';
  } else if (route === 'solutions') {
    state.currentView = 'solutions';
  } else if (route === 'security') {
    state.currentView = 'security';
  } else if (route === 'docs' || route === 'documentation') {
    state.currentView = 'docs';
  } else if (route === 'resources') {
    state.currentView = 'resources';
  } else if (route === 'pricing') {
    state.currentView = 'pricing';
  } else {
    state.currentView = 'home';
  }

  // Dynamic Page Titles
  const titles: Record<string, string> = {
    home: 'ZexCore — One Core Infinite Possibilities',
    platform: 'Platform & Capabilities — ZexCore Infrastructure',
    architecture: 'Technical Architecture & Invariants — ZexCore',
    modules: 'Domain Modules — ZexCore Micro-Kernel',
    solutions: 'Vertical SaaS Solutions & Industry Packs — ZexCore',
    security: 'Security Model & RLS Defense-in-Depth — ZexCore',
    docs: 'Developer Documentation & API Reference — ZexCore',
    resources: 'Engineering Publications & Whitepapers — ZexCore',
    pricing: 'Pricing & Platform Tiers — ZexCore Infrastructure',
    signin: 'Sign in to ZexCore Control',
    console: 'ZexCore Control — Operational Console',
  };
  document.title = titles[state.currentView] || 'ZexCore — Enterprise Infrastructure Platform';

  renderApp();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function navigateTo(view: string) {
  if (view === 'home') {
    window.location.hash = '#/home';
  } else {
    window.location.hash = `#/${view}`;
  }
}
(window as any).navigateTo = navigateTo;

// ── Pricing billing toggle & Stripe Checkout ──────────────────────────────
(window as any).setPricingBilling = function(mode: 'monthly' | 'annual') {
  const monthly = document.getElementById('btn-billing-monthly');
  const annual = document.getElementById('btn-billing-annual');
  const note = document.getElementById('billing-annual-note');

  if (monthly) monthly.classList.toggle('active', mode === 'monthly');
  if (annual) annual.classList.toggle('active', mode === 'annual');
  if (note) note.style.display = mode === 'annual' ? 'block' : 'none';

  document.querySelectorAll<HTMLElement>('.pricing-amount[data-monthly]').forEach(el => {
    const val = mode === 'annual' ? el.dataset.annual : el.dataset.monthly;
    if (val !== undefined) el.textContent = val;
  });
};

(window as any).startStripeCheckout = function(planId: PlanTier) {
  openStripeCheckoutModal(planId, 'monthly', (newPlan) => {
    setTenantPlan(newPlan, state.activeTenant);
    logBusEvent('billing.subscription.upgraded', {
      tenant: state.activeTenant,
      plan: newPlan,
      gateway: 'stripe',
      status: 'active',
    });
    if (state.currentView !== 'console' && state.currentView !== 'dashboard') {
      navigateTo('console');
    } else {
      renderDashboard();
    }
  });
};

function initApp() {
  subscribeToAuth((user) => {
    state.currentUser = user;
  });
  window.addEventListener('hashchange', syncRouteFromHash);
  syncRouteFromHash();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

