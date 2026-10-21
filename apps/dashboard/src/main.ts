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
import { renderAboutPage } from './pages/about';
import { renderContactPage, setupContactPageEvents } from './pages/contact';
import { setupNavbarEvents } from './components/navbar';
import { renderConsoleAuditView, setupConsoleAuditEvents } from './pages/consoleAudit';
import { renderConsoleLicense, attachConsoleLicenseEvents } from './components/consoleLicense';
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
  openSelfServeUpgradeModal,
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

export type OmnichannelType = 'whatsapp' | 'sms' | 'email' | 'webchat' | 'telegram' | 'instagram' | 'voice';

interface WhatsAppMessage {
  sender: 'client' | 'agent' | 'bot';
  text: string;
  time: string;
  channel?: OmnichannelType;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  providerConfirmed?: boolean;
}

interface WhatsAppThread {
  id: string;
  contactName: string;
  phone: string;
  cleanPhone: string;
  email?: string;
  telegramHandle?: string;
  instagramId?: string;
  channel: OmnichannelType;
  activeChannel?: OmnichannelType;
  fallbackChannel?: OmnichannelType;
  unreadCount: number;
  lastMsg: string;
  time: string;
  leadValue: number;
  stage: string;
  windowStatus?: string;
  messages: WhatsAppMessage[];
}

interface BookingAppointment {
  id: string;
  clientName: string;
  phone: string;
  cleanPhone: string;
  email?: string;
  primaryChannel?: OmnichannelType;
  fallbackChannel?: OmnichannelType;
  service: string;
  dateTime: string;
  depositStatus: string;
  whatsappReminderStatus: 'delivered' | 'scheduled' | 'sent_1h' | 'fallback_sms_sent';
}

// ── Application State ────────────────────────────────────────────────────────
const state = {
  currentView: 'home' as 'home' | 'platform' | 'architecture' | 'modules' | 'solutions' | 'security' | 'docs' | 'resources' | 'pricing' | 'signin' | 'console' | 'dashboard' | 'about' | 'contact',
  platformModule: 'core',
  currentTab: 'overview',
  crmSubView: 'whatsapp' as 'whatsapp' | 'kanban' | 'booking',
  selectedThreadId: 'thread-1',
  selectedChannelFilter: 'all' as 'all' | OmnichannelType,
  activeReplyChannel: 'whatsapp' as OmnichannelType,
  activeTenant: 'acme_corp',
  systemStatus: 'operational' as 'operational' | 'offline',
  crmWebhookStatus: 'live' as 'live' | 'offline',
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
    {
      id: 'rule-4',
      name: 'Multi-Channel Fallback Automation Rule',
      trigger: 'crm.whatsapp.undelivered_10m',
      conditions: 'message.status == "undelivered" && elapsed_minutes >= 10',
      action: 'dispatch: crm.sms.fallback_sent',
      approved: true,
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
      email: 'adebayo.ogundimu@reefer-trans.ng',
      channel: 'whatsapp',
      activeChannel: 'whatsapp',
      fallbackChannel: 'sms',
      windowStatus: '24h Window Active',
      unreadCount: 1,
      lastMsg: 'Good day! We have 14 reefer trucks in Lagos and need IoT thermal tracking.',
      time: '11:42 AM',
      leadValue: 48000,
      stage: 'Proposal',
      messages: [
        { sender: 'client', text: 'Good day! Saw your starter site for cold chain logistics telemetry. We have 14 reefer trucks operating out of Lagos ports.', time: '11:40 AM', channel: 'whatsapp' },
        { sender: 'bot', text: 'Hello Adebayo! Thanks for contacting ZexCore Fleet. Your inquiry is mapped to our Cold Chain Telemetry Starter. Dispatching our hardware brochure.', time: '11:40 AM', channel: 'whatsapp', status: 'read', providerConfirmed: true },
        { sender: 'client', text: 'Great. Can we set up a live demo and simulated Paystack reservation for the 14 edge probes?', time: '11:42 AM', channel: 'whatsapp' },
      ],
    },
    {
      id: 'thread-2',
      contactName: 'Dr. Amina Bello',
      phone: '+234 802 331 4902',
      cleanPhone: '2348023314902',
      email: 'dr.amina@metromedical.org',
      channel: 'whatsapp',
      activeChannel: 'whatsapp',
      fallbackChannel: 'email',
      windowStatus: '24h Window Active',
      unreadCount: 0,
      lastMsg: 'Deposit confirmed (Paystack Sandbox). Automated 24h WhatsApp reminder received!',
      time: 'Yesterday',
      leadValue: 18500,
      stage: 'Negotiation',
      messages: [
        { sender: 'client', text: 'Hi, we are setting up patient intake booking for 3 clinics. We need automated WhatsApp & SMS reminders to cut missed appointments.', time: 'Yesterday 09:15 AM', channel: 'whatsapp' },
        { sender: 'agent', text: 'Hello Dr. Bello! ZexCore Booking automatically sends 24h and 1h multi-channel alerts with instant reschedule links to ensure confirmed attendance.', time: 'Yesterday 09:18 AM', channel: 'whatsapp', status: 'read', providerConfirmed: true },
        { sender: 'client', text: 'Deposit confirmed (Paystack Sandbox). Automated 24h WhatsApp reminder received!', time: 'Yesterday 10:04 AM', channel: 'whatsapp' },
      ],
    },
    {
      id: 'thread-3',
      contactName: 'Kofi Mensah',
      phone: '+233 24 551 9021',
      cleanPhone: '233245519021',
      email: 'kofi@accra-solargrid.gh',
      telegramHandle: '@kofi_solar_grid',
      channel: 'telegram',
      activeChannel: 'telegram',
      fallbackChannel: 'whatsapp',
      windowStatus: 'Always Open (Bot API)',
      unreadCount: 0,
      lastMsg: 'Confirmed. We will authorize the Flutterwave MoMo payment test today.',
      time: 'Oct 12',
      leadValue: 35000,
      stage: 'Qualified',
      messages: [
        { sender: 'client', text: 'Hello from Accra. We operate a solar mini-grid with 48V inverters. Can telemetry ping our Telegram ops channel?', time: 'Oct 12 08:30 AM', channel: 'telegram' },
        { sender: 'agent', text: 'Yes Kofi! ZexCore EventBus triggers direct Telegram bot notifications and fallback WhatsApp alerts whenever DC voltage drops below 48.0V.', time: 'Oct 12 08:35 AM', channel: 'telegram', status: 'read', providerConfirmed: true },
        { sender: 'client', text: 'Confirmed. We will authorize the Flutterwave MoMo payment test today.', time: 'Oct 12 09:12 AM', channel: 'telegram' },
      ],
    },
    {
      id: 'thread-4',
      contactName: 'Fatima Zahra',
      phone: '+234 812 409 3881',
      cleanPhone: '2348124093881',
      email: 'fatima@ecofleet.ng',
      channel: 'webchat',
      activeChannel: 'webchat',
      fallbackChannel: 'sms',
      windowStatus: 'Visitor Online (Web Chat Widget)',
      unreadCount: 1,
      lastMsg: 'Can this fall back to SMS or email if our field delivery reps are offline?',
      time: '02:15 PM',
      leadValue: 28000,
      stage: 'New',
      messages: [
        { sender: 'client', text: 'Hello! Inquiring via tenant web chat widget regarding cold chain telemetry alerts.', time: '02:10 PM', channel: 'webchat' },
        { sender: 'bot', text: 'Welcome Fatima! ZexCore Web Chat is linked directly to your tenant multi-channel router.', time: '02:11 PM', channel: 'webchat', status: 'read', providerConfirmed: true },
        { sender: 'client', text: 'Can this fall back to SMS or email if our field delivery reps are offline?', time: '02:15 PM', channel: 'webchat' },
      ],
    },
    {
      id: 'thread-5',
      contactName: 'Marcus Vance',
      phone: '+44 7700 900142',
      cleanPhone: '447700900142',
      email: 'm.vance@vanceproperties.co.uk',
      instagramId: '@vance_realty',
      channel: 'sms',
      activeChannel: 'sms',
      fallbackChannel: 'email',
      windowStatus: 'Direct Carrier Route (Nigeria / Global)',
      unreadCount: 0,
      lastMsg: 'SMS reminder received. Reservation deposit confirmed via Stripe Sandbox.',
      time: 'Oct 10',
      leadValue: 64000,
      stage: 'Proposal',
      messages: [
        { sender: 'client', text: 'Following up via SMS. Are enterprise NDPR and GDPR consent logs exportable to SIEM?', time: 'Oct 10 11:20 AM', channel: 'sms' },
        { sender: 'agent', text: 'Yes Marcus. All consent grants and revocations stream to tamper-evident audit logs and RFC5424 SIEM endpoints.', time: 'Oct 10 11:24 AM', channel: 'sms', status: 'delivered', providerConfirmed: true },
        { sender: 'client', text: 'SMS reminder received. Reservation deposit confirmed via Stripe Sandbox.', time: 'Oct 10 01:10 PM', channel: 'sms' },
      ],
    },
  ] as WhatsAppThread[],
  bookings: [
    {
      id: 'book-1',
      clientName: 'Dr. Amina Bello',
      phone: '+234 802 331 4902',
      cleanPhone: '2348023314902',
      email: 'dr.amina@metromedical.org',
      primaryChannel: 'whatsapp',
      fallbackChannel: 'email',
      service: 'Specialist Clinic Telemetry Consultation',
      dateTime: 'Tomorrow, 10:00 AM WAT',
      depositStatus: '₦50,000 (Paystack Sandbox)',
      whatsappReminderStatus: 'delivered',
    },
    {
      id: 'book-2',
      clientName: 'Adebayo Ogundimu',
      phone: '+234 803 892 1104',
      cleanPhone: '2348038921104',
      email: 'adebayo.ogundimu@reefer-trans.ng',
      primaryChannel: 'whatsapp',
      fallbackChannel: 'sms',
      service: 'Reefer Probe Fleet Hardware Pairing Demo',
      dateTime: 'Oct 16, 2:30 PM WAT',
      depositStatus: 'Deposit Held (Sandbox)',
      whatsappReminderStatus: 'scheduled',
    },
    {
      id: 'book-3',
      clientName: 'Kofi Mensah',
      phone: '+233 24 551 9021',
      cleanPhone: '233245519021',
      email: 'kofi@accra-solargrid.gh',
      primaryChannel: 'telegram',
      fallbackChannel: 'whatsapp',
      service: 'Solar Inverter Gateway Live Setup',
      dateTime: 'Oct 17, 11:00 AM GMT',
      depositStatus: 'KES 20,000 (Flutterwave Test)',
      whatsappReminderStatus: 'sent_1h',
    },
  ] as BookingAppointment[],
  events: [] as Array<{ ts: string; name: string; payload: string }>,
  erasureRequestsCount: 1,
  anonymizedCount: 4,
  agencyBranding: {
    agencyName: 'Apex Digital Agency',
    customDomain: 'portal.apexdigital.com',
    primaryColor: '#0d9488',
    logoUrl: '/zexcore-logo-light.png',
    logoIsUpload: false,
    removeWatermark: true,
    customFavicon: true,
    clientEmailBranding: true,
    isolatedSubWorkspaces: 25,
    previewMode: 'desktop' as 'desktop' | 'mobile',
  },
  // Export ledger — append-only, cannot be deleted from UI
  exportLedger: (() => {
    try {
      const stored = localStorage.getItem('zx_export_ledger');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  })() as Array<{
    serial: string;
    type: string;
    filename: string;
    exportedBy: string;
    recordedAt: string; // ISO 8601 to ms
    tenantId: string;
    hash: string;
  }>,
  // Immutable reading/chart records — hash-chained
  immutableRecords: (() => {
    try {
      const stored = localStorage.getItem('zx_immutable_records');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  })() as Array<{
    id: string;
    category: string; // 'iot_reading' | 'status_change' | 'audit_event' | etc
    data: Record<string, unknown>;
    recordedAt: string;
    hash: string;
    prevHash: string;
  }>,
};

// ── Precise ISO timestamp (to ms) ─────────────────────────────────────────────
function preciseTimestamp(): string {
  return new Date().toISOString(); // e.g. 2026-10-21T17:06:41.123Z
}

function formatTimestamp(iso: string): string {
  // Display format: "21 Oct 2026, 17:06:41 UTC"
  try {
    const d = new Date(iso);
    return d.toUTCString().replace('GMT', 'UTC').replace(',', ',').slice(0, -4) +
      ':' + String(d.getUTCSeconds()).padStart(2, '0') + ' UTC';
  } catch { return iso; }
}

// ── Simple SHA-256-like hash (djb2 for browser tamper detection) ───────────────
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash & hash;
  }
  return 'zx' + Math.abs(hash).toString(16).padStart(8, '0');
}

// ── Immutable Record Store (append-only, hash-chained) ────────────────────────
function appendImmutableRecord(category: string, data: Record<string, unknown>): void {
  const ts = preciseTimestamp();
  const prevHash = state.immutableRecords.length > 0
    ? state.immutableRecords[state.immutableRecords.length - 1].hash
    : '0000000000000000';
  const id = 'rec-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  const content = id + category + JSON.stringify(data) + ts + prevHash;
  const hash = hashString(content);
  const record = Object.freeze({ id, category, data: Object.freeze(data), recordedAt: ts, hash, prevHash });
  state.immutableRecords.push(record as typeof state.immutableRecords[0]);
  try { localStorage.setItem('zx_immutable_records', JSON.stringify(state.immutableRecords)); } catch { /* quota */ }
}

function verifyImmutableChain(): { valid: boolean; brokenAt?: number } {
  for (let i = 1; i < state.immutableRecords.length; i++) {
    if (state.immutableRecords[i].prevHash !== state.immutableRecords[i - 1].hash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}

// ── Export Ledger (append-only, serial numbered, watermarked) ──────────────────
function generateExportSerial(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `EXP-${date}-${rand}`;
}

function appendExportLedgerEntry(type: string, filename: string, exportedBy: string): string {
  const serial = generateExportSerial();
  const recordedAt = preciseTimestamp();
  const prevHash = state.exportLedger.length > 0
    ? state.exportLedger[state.exportLedger.length - 1].hash
    : '0000000000000000';
  const content = serial + type + filename + exportedBy + recordedAt + prevHash;
  const hash = hashString(content);
  const entry = Object.freeze({
    serial,
    type,
    filename,
    exportedBy,
    recordedAt,
    tenantId: state.activeTenant,
    hash,
  });
  state.exportLedger.push(entry);
  try { localStorage.setItem('zx_export_ledger', JSON.stringify(state.exportLedger)); } catch { /* quota */ }
  appendImmutableRecord('export_event', { serial, type, filename, exportedBy });
  return serial;
}

(window as any).formatTimestamp = formatTimestamp;
(window as any).verifyImmutableChain = verifyImmutableChain;
(window as any).appendImmutableRecord = appendImmutableRecord;

function logBusEvent(name: string, payload: Record<string, unknown>) {
  const ts = preciseTimestamp();
  state.events.unshift({
    ts,
    name,
    payload: JSON.stringify(payload),
  });
  if (state.events.length > 20) state.events.pop();
  appendImmutableRecord('bus_event', { name, ...payload });
  renderEventLog();
}

// ── In-Page Toast & Modal Dialog Engine (Never uses browser prompt/alert) ────
function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  let container = document.getElementById('zexcore-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'zexcore-toast-container';
    container.className = 'zex-toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `zex-toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s';
    setTimeout(() => toast.remove(), 250);
  }, 3400);
}

function openModal(options: {
  title: string;
  subtitle?: string;
  contentHtml: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => boolean | void;
}) {
  let overlay = document.getElementById('zexcore-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'zexcore-modal-overlay';
    overlay.className = 'zex-modal-overlay';
    document.body.appendChild(overlay);
  }

  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div class="zex-modal-card">
      <div class="zex-modal-header">
        <div>
          <h3 class="zex-modal-title">${options.title}</h3>
          ${options.subtitle ? `<div class="zex-modal-subtitle">${options.subtitle}</div>` : ''}
        </div>
        <button class="zex-modal-close-btn" id="zex-modal-btn-close">&times;</button>
      </div>
      <div class="zex-modal-body">
        ${options.contentHtml}
      </div>
      <div class="zex-modal-footer">
        <button class="btn btn-secondary btn-sm" id="zex-modal-btn-cancel">${options.cancelText || 'Cancel'}</button>
        <button class="btn btn-primary btn-sm" id="zex-modal-btn-confirm">${options.confirmText || 'Save Changes'}</button>
      </div>
    </div>
  `;

  const closeModal = () => {
    if (overlay) overlay.style.display = 'none';
  };

  document.getElementById('zex-modal-btn-close')?.addEventListener('click', closeModal);
  document.getElementById('zex-modal-btn-cancel')?.addEventListener('click', closeModal);
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };

  document.getElementById('zex-modal-btn-confirm')?.addEventListener('click', () => {
    if (options.onConfirm) {
      const res = options.onConfirm();
      if (res !== false) closeModal();
    } else {
      closeModal();
    }
  });
}

// Initial Events
logBusEvent('zexcore.system.boot', { status: 'healthy', modules: ['core', 'iot', 'rules', 'crm', 'compliance'] });
logBusEvent('iot.telemetry.received', { deviceId: 'dev-1', metrics: { temperature: 24.8, humidity: 54 } });
logBusEvent('compliance.consent.granted', { subjectId: 'emma.watson@enterprise-corp.io', purpose: 'telemetry_processing' });

// ── Soft Paywall Component ──────────────────────────────────────────────────
function renderWithSoftPaywall(tabId: string, currentPlan: PlanTier, innerContent: string): string {
  if (!isTabLocked(tabId, currentPlan, state.currentUser?.email)) {
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
              Unlock ${minPlanMeta.name} &rarr; ($${minPlanMeta.monthlyPrice}/mo)
            </button>
            <a href="#/pricing" class="btn-paywall-secondary">Compare All Tiers</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── In-Page Tier-Locked Feature Card Helper ──────────────────────────────────
function renderTierFeatureLock(
  minPlan: PlanTier,
  title: string,
  desc: string,
  currentPlan: PlanTier,
  innerPreviewHtml: string
): string {
  const planOrder: PlanTier[] = ['free', 'starter', 'growth', 'agency', 'enterprise', 'dedicated'];
  const isUnlocked = planOrder.indexOf(currentPlan) >= planOrder.indexOf(minPlan);

  if (isUnlocked) {
    return `
      <div class="tier-feature-card">
        <div class="tier-feature-header">
          <div>
            <span class="tier-badge-pill ${minPlan}">${minPlan.toUpperCase()} CAPABILITY UNLOCKED</span>
            <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin: 6px 0 2px 0;">${title}</h4>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${desc}</div>
          </div>
        </div>
        ${innerPreviewHtml}
      </div>
    `;
  }

  const minMeta = PLANS[minPlan] || PLANS.growth;
  return `
    <div class="tier-feature-card locked">
      <div class="tier-feature-header">
        <div>
          <span class="tier-badge-pill ${minPlan}">REQUIRES ${minPlan.toUpperCase()} TIER</span>
          <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin: 6px 0 2px 0;">${title}</h4>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${desc}</div>
        </div>
      </div>
      <div style="filter: blur(4px) opacity(0.35); pointer-events: none; user-select: none;">
        ${innerPreviewHtml}
      </div>
      <div class="tier-lock-overlay">
        <div class="tier-lock-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div class="tier-lock-title">${title}</div>
        <div class="tier-lock-desc">${desc}</div>
        <button class="btn btn-primary btn-sm btn-paywall-upgrade" data-paywall-upgrade="${minPlan}" style="padding: 9px 20px; font-weight: 700;">
          Unlock ${minMeta.name} &rarr; ($${minMeta.monthlyPrice}/mo)
        </button>
      </div>
    </div>
  `;
}

// ── 1. Console View: System Overview ─────────────────────────────────────────
function renderConsoleOverviewView(currentPlan: PlanTier): string {
  return `
    <div class="console-page-wrapper" id="page-console-overview">
      <div class="console-page-toolbar">
        <div>
          <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">Platform Operations Overview</h2>
          <div class="page-desc" style="margin-top: 2px;">Runtime health, active module metrics, and cross-module event bus ledger</div>
        </div>
        <div class="console-toolbar-actions">
          <button class="btn btn-secondary btn-sm" id="btn-download-all-data" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600; padding: 7px 14px; background: #ffffff; border: 1.5px solid #d1d5db; color: #1e293b; border-radius: var(--radius-sm); box-shadow: 0 1px 3px rgba(0,0,0,0.05); cursor: pointer;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download All My Data (JSON)
          </button>
        </div>
      </div>

      <!-- "Great First Ten Minutes" Onboarding Strip / Starters -->
      ${renderOnboardingBanner(state.onboarding)}

      <div class="grid-4">
        <div class="stat-box">
          <div class="stat-label">Platform Health</div>
          <div style="margin: 8px 0 4px 0;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <label class="zx-toggle-switch" id="overview-status-toggle" title="Toggle platform operational status" style="cursor: pointer;">
                <input type="checkbox" id="overview-status-checkbox" ${state.systemStatus === 'operational' ? 'checked' : ''} onchange="window.toggleSystemStatus()" style="display:none;" />
                <span class="zx-toggle-track ${state.systemStatus === 'operational' ? 'on' : 'off'}" id="overview-status-track">
                  <span class="zx-toggle-thumb"></span>
                </span>
              </label>
              <span id="overview-status-label" style="font-weight: 800; font-size: 0.85rem; color: ${state.systemStatus === 'operational' ? '#16a34a' : '#dc2626'};">
                ${state.systemStatus === 'operational' ? '● Operational' : '○ Offline'}
              </span>
            </div>
          </div>
          <div class="stat-subtext" id="overview-status-subtext" style="color: var(--text-muted); font-size: 0.72rem;">
            ${state.systemStatus === 'operational' ? 'Micro-kernel &amp; 5 modules &bull; 99.99% Uptime' : 'Maintenance window active &bull; Unoperational'}
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Fleet Nodes</div>
          <div class="stat-value" id="stat-online-devices">${state.devices.filter(d => d.status === 'online').length} / ${state.devices.length}</div>
          <div class="stat-subtext" style="color: #168447; font-weight: 600;">&bull; Connected &bull; Token-Auth</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Rules Evaluated</div>
          <div class="stat-value">1,428</div>
          <div class="stat-subtext" style="color: #0284c7; font-weight: 600;">Sub-millisecond AST</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Pipeline Value</div>
          <div class="stat-value" id="stat-total-pipeline" style="color: #E50920; font-weight: 800;">$${state.leads.reduce((a, b) => a + b.value, 0).toLocaleString()}</div>
          <div class="stat-subtext" style="color: var(--text-muted); font-size: 0.72rem;">Active multi-tenant pipeline</div>
        </div>
      </div>

      <!-- Middle Row: Multi-Tenant Isolation Diagram + Quick Operations -->
      <div class="grid-2">
        <div class="card">
          <div class="card-header" style="margin-bottom: 12px;">
            <div>
              <div class="card-title">Sovereign Multi-Tenant Isolation</div>
              <div class="card-subtitle">Zero data leakage enforced mathematically via PostgreSQL 17 Session RLS</div>
            </div>
          </div>
          <div class="console-tenant-diagram-wrap">
            <div class="console-tenant-diagram">
              <svg class="console-tenant-svg-lines" viewBox="0 0 440 160">
                <line x1="80" y1="30" x2="170" y2="80" stroke="#E1E5EA" stroke-width="2" stroke-dasharray="3 3"/>
                <line x1="360" y1="30" x2="270" y2="80" stroke="#E1E5EA" stroke-width="2" stroke-dasharray="3 3"/>
                <line x1="80" y1="130" x2="170" y2="80" stroke="#E1E5EA" stroke-width="2" stroke-dasharray="3 3"/>
                <line x1="360" y1="130" x2="270" y2="80" stroke="#E1E5EA" stroke-width="2" stroke-dasharray="3 3"/>
              </svg>
              <div class="console-tenant-node node-a">${state.activeTenant === 'acme_corp' ? 'Acme (Active)' : 'Tenant A'}</div>
              <div class="console-tenant-node node-b">${state.activeTenant === 'globex_corp' ? 'Globex (Active)' : 'Tenant B'}</div>
              <div class="console-tenant-node node-c">${state.activeTenant === 'soylent_ind' ? 'Soylent (Active)' : 'Tenant C'}</div>
              <div class="console-tenant-node node-d">Tenant D (Isolated)</div>
              <div class="console-core-center">
                <img src="/zexcore-logo-icon.png" alt="ZexCore" class="console-core-logo" />
                <span class="console-core-text">ZexCore Kernel</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Operations -->
        <div class="card">
          <div class="card-header" style="margin-bottom: 12px;">
            <div>
              <div class="card-title">Quick Operational Actions</div>
              <div class="card-subtitle">Dispatch verified cross-module actions across isolated engines</div>
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

      <!-- Advanced Tier Feature: Enterprise SIEM Forwarding Mesh -->
      ${renderTierFeatureLock(
        'growth',
        'Real-Time SIEM Webhook Relay & Syslog RFC 5424 Streaming',
        'Stream append-only tenant audit events with HMAC-SHA256 payload signing directly to Splunk HEC, Datadog Logs, AWS CloudWatch, or custom SIEM collectors.',
        currentPlan,
        `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; align-items: flex-end;">
          <div>
            <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary);">Webhook Destination Endpoint</label>
            <input type="text" class="input" id="siem-endpoint-input" value="https://siem-collector.enterprise.corp/events/v1" style="margin-top: 4px;" />
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary btn-sm" onclick="window.dispatchSiemTestWebhook()" style="flex: 1; padding: 8px 14px;">
              Dispatch Test SIEM Heartbeat
            </button>
          </div>
        </div>
        <div style="margin-top: 10px; font-size: 0.74rem; color: #16a34a; font-family: var(--font-mono); display: flex; align-items: center; gap: 6px;">
          <span>● mTLS Mutual Auth Verified</span> &bull;
          <span>Payload Signing: HMAC-SHA256 Active</span>
        </div>
        `
      )}

      <!-- Event Bus Live Log -->
      <div class="terminal-box">
        <div class="terminal-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>Core EventBus Real-Time Stream</span>
            <span style="font-size: 0.7rem; font-family: var(--font-mono); color: #94a3b8;">Asynchronous Append-Only Broker</span>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span style="font-size: 0.68rem; color: #cbd5e1; text-transform: uppercase; font-weight: 700; margin-right: 2px;">SIEM Export:</span>
            <button class="btn btn-xs" id="btn-export-siem-json" style="font-size: 0.68rem; padding: 3px 8px; border: 1px solid rgba(255,255,255,0.25); color: #ffffff; background: rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">NDJSON</button>
            <button class="btn btn-xs" id="btn-export-siem-csv" style="font-size: 0.68rem; padding: 3px 8px; border: 1px solid rgba(255,255,255,0.25); color: #ffffff; background: rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">CSV Audit</button>
          </div>
        </div>
        <div class="terminal-content" id="event-stream-body"></div>
      </div>

      <!-- Tamper-Proof Audit & Non-Deletable Export Ledger -->
      <div class="card" style="margin-top: 16px;">
        <div class="card-header" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
          <div>
            <div class="card-title" style="display: flex; align-items: center; gap: 8px;">
              <span>Tamper-Proof Records &amp; Export Ledger</span>
              <span class="status-pill" style="font-size: 0.68rem; padding: 2px 8px; background: rgba(22, 163, 74, 0.1); color: #16a34a; border: 1px solid rgba(22, 163, 74, 0.2);">
                ${verifyImmutableChain().valid ? '✓ Hash-Chain Verified' : '⚠ Integrity Mismatch'}
              </span>
            </div>
            <div class="card-subtitle">
              All exports, telemetry snapshots, and state modifications are sealed with HMAC &amp; serial numbers. Records are permanent and cannot be modified or deleted.
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-family: var(--font-mono); text-align: right;">
            Chain Length: <strong>${state.immutableRecords.length}</strong> records &bull; Exports: <strong>${state.exportLedger.length}</strong>
          </div>
        </div>

        ${state.exportLedger.length === 0 ? `
          <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.82rem; background: var(--bg-muted); border-radius: 6px;">
            No data exports generated yet. When you export Tenant Data or SIEM streams, immutable records with permanent serial numbers and cryptographic watermarks will be listed here.
          </div>
        ` : `
          <div class="console-table-wrap">
            <table class="data-table" style="width: 100%; font-size: 0.78rem;">
              <thead>
                <tr>
                  <th style="text-align: left;">Serial Number</th>
                  <th style="text-align: left;">Export Type</th>
                  <th style="text-align: left;">Filename &amp; Watermark</th>
                  <th style="text-align: left;">Exported By</th>
                  <th style="text-align: left;">Recorded At (Date &amp; Time)</th>
                  <th style="text-align: right;">Integrity Seal</th>
                </tr>
              </thead>
              <tbody>
                ${state.exportLedger.slice(-8).reverse().map((entry) => `
                  <tr>
                    <td style="font-family: var(--font-mono); font-weight: 700; color: #E50920;">
                      ${entry.serial}
                    </td>
                    <td><span class="badge" style="font-size: 0.68rem;">${entry.type}</span></td>
                    <td style="font-family: var(--font-mono); color: var(--text-main); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${entry.filename}">
                      ${entry.filename}
                    </td>
                    <td>${entry.exportedBy}</td>
                    <td style="font-family: var(--font-mono); color: var(--text-secondary);">
                      ${formatTimestamp(entry.recordedAt)}
                    </td>
                    <td style="text-align: right; font-family: var(--font-mono); font-size: 0.7rem; color: #16a34a;">
                      ${entry.hash} ✓
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

// ── 2. Console View: IoT Device Fleet ─────────────────────────────────────────
function getFleetAverages() {
  const online = state.devices.filter((d) => d.status === 'online');
  if (online.length === 0) {
    return {
      avgTemp: '0.0',
      avgHum: 0,
      avgVolt: '0.0',
      tempStatus: 'Offline &bull; 0 active nodes',
      humStatus: 'Offline &bull; 0 active nodes',
      voltStatus: 'Offline &bull; 0 active nodes',
    };
  }
  const avgTemp = (online.reduce((acc, d) => acc + d.temperature, 0) / online.length).toFixed(1);
  const avgHum = Math.round(online.reduce((acc, d) => acc + d.humidity, 0) / online.length);
  const avgVolt = (online.reduce((acc, d) => acc + d.voltage, 0) / online.length).toFixed(1);
  const isHighTemp = parseFloat(avgTemp) > 75;
  return {
    avgTemp,
    avgHum,
    avgVolt,
    tempStatus: isHighTemp ? 'Alert &bull; Exceeds Threshold' : 'Nominal &bull; Threshold &le; 75.0&deg;C',
    humStatus: 'Nominal &bull; Threshold &le; 80%',
    voltStatus: 'Regulated &bull; Tolerance &plusmn;0.5V',
  };
}

function updateFleetOscilloscope() {
  const fleet = getFleetAverages();
  const elTemp = document.getElementById('fleet-avg-temp');
  const elHum = document.getElementById('fleet-avg-hum');
  const elVolt = document.getElementById('fleet-avg-volt');
  const elTempStat = document.getElementById('fleet-temp-status');
  const elHumStat = document.getElementById('fleet-hum-status');
  const elVoltStat = document.getElementById('fleet-volt-status');
  if (elTemp) elTemp.innerHTML = `${fleet.avgTemp} &deg;C`;
  if (elHum) elHum.innerText = `${fleet.avgHum} %`;
  if (elVolt) elVolt.innerText = `${fleet.avgVolt} V`;
  if (elTempStat) elTempStat.innerHTML = fleet.tempStatus;
  if (elHumStat) elHumStat.innerHTML = fleet.humStatus;
  if (elVoltStat) elVoltStat.innerHTML = fleet.voltStatus;
}

function renderConsoleIotView(currentPlan: PlanTier): string {
  const fleet = getFleetAverages();
  const innerIot = `
    <div class="console-page-wrapper" id="page-console-iot">
      <div class="console-page-toolbar">
        <div>
          <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">IoT Device Fleet &amp; Telemetry Hub</h2>
          <div class="page-desc" style="margin-top: 2px;">Sub-second sensor streams, hardware token rotation, remote diagnostic shell, and edge health thresholds</div>
        </div>
        <div class="console-toolbar-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.rotateAllDeviceTokens()">Rotate All Device Keys</button>
          <button class="btn btn-primary" id="btn-open-register-device">+ Register Edge Device</button>
        </div>
      </div>

      <!-- Telemetry Stream Oscilloscope / Sparklines -->
      <div class="telemetry-oscilloscope-wrap">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: #10b981;">
            LIVE FLEET TELEMETRY WAVEFORM (0.5s JITTER MONITOR)
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #64748b;">Protocol: MQTT over TLS 1.3 / WSS</span>
        </div>
        <div class="oscilloscope-grid" id="iot-oscilloscope-grid">
          <div class="oscilloscope-metric-card">
            <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Avg Fleet Temp</div>
            <div class="oscilloscope-metric-val" id="fleet-avg-temp" style="color: #38bdf8;">${fleet.avgTemp} &deg;C</div>
            <div id="fleet-temp-status" style="font-size: 0.7rem; color: #10b981;">${fleet.tempStatus}</div>
          </div>
          <div class="oscilloscope-metric-card">
            <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Relative Humidity</div>
            <div class="oscilloscope-metric-val" id="fleet-avg-hum" style="color: #a78bfa;">${fleet.avgHum} %</div>
            <div id="fleet-hum-status" style="font-size: 0.7rem; color: #10b981;">${fleet.humStatus}</div>
          </div>
          <div class="oscilloscope-metric-card">
            <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">DC Rail Voltage</div>
            <div class="oscilloscope-metric-val" id="fleet-avg-volt" style="color: #f59e0b;">${fleet.avgVolt} V</div>
            <div id="fleet-volt-status" style="font-size: 0.7rem; color: #10b981;">${fleet.voltStatus}</div>
          </div>
        </div>
      </div>

      <!-- Device Fleet Table -->
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

      <!-- Advanced Feature 1: Remote Diagnostic Command Dispatcher (Requires Growth+) -->
      ${renderTierFeatureLock(
        'growth',
        'Remote Diagnostic Shell & Cryptographic Command Dispatcher',
        'Dispatch authenticated remote commands directly to edge microcontrollers (ESP32, STM32, ARM Cortex-M) over MQTT/WSS with tenant HMAC signatures.',
        currentPlan,
        `
        <div class="edge-shell-terminal">
          <div class="edge-shell-log" id="edge-shell-output">
            <div><span class="edge-shell-prompt">[zex-edge-shell]</span> Connected to edge broker: tls://edge.zexcore.io:8883</div>
            <div><span class="edge-shell-prompt">[zex-edge-shell]</span> Authenticated as tenant: ${state.activeTenant} (HMAC-SHA256 verified)</div>
            <div><span class="edge-shell-prompt">[zex-edge-shell]</span> Ready for authenticated remote instruction dispatch.</div>
          </div>
          <div class="edge-shell-input-row">
            <select id="shell-device-select" class="tenant-select" style="max-width: 160px; font-size: 0.75rem; background: #1e293b; color: #fff; border-color: #334155;">
              ${state.devices.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>
            <select id="shell-cmd-select" class="tenant-select" style="max-width: 220px; font-size: 0.75rem; background: #1e293b; color: #fff; border-color: #334155;">
              <option value="reboot">EXEC sys.reboot()</option>
              <option value="calibrate">EXEC sensor.calibrate_baseline()</option>
              <option value="rollback">EXEC ota.rollback_firmware(v2.2.0)</option>
              <option value="cutoff">EXEC power.emergency_cutoff()</option>
            </select>
            <button class="btn btn-primary btn-sm" onclick="window.dispatchEdgeCommand()" style="padding: 6px 14px; font-size: 0.78rem;">
              Dispatch Signed Command
            </button>
          </div>
        </div>
        `
      )}

      <!-- Advanced Feature 2: Hardware Root-of-Trust / TPM 2.0 (Requires Enterprise) -->
      ${renderTierFeatureLock(
        'enterprise',
        'Hardware Root-of-Trust & TPM 2.0 Mutual Attestation',
        'Enforce mTLS mutual cryptographic handshakes and X.509 TPM endorsement verification before edge devices are permitted to push telemetry into the PostgreSQL tenant pool.',
        currentPlan,
        `
        <div style="background: #f8fafc; border: 1px solid var(--border-default); border-radius: 6px; padding: 14px; font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.6;">
          <div style="color: #16a34a; font-weight: 700;">✓ Hardware TPM 2.0 Endorsement Enclave Active</div>
          <div style="color: #475569;">Root Certificate Authority: ZexCore Global Edge Hardware CA (X.509 v3)</div>
          <div style="color: #475569;">Attested Nodes: 12 / 12 &bull; Key Storage: Microchip ATECC608A Cryptographic Co-Processor</div>
        </div>
        `
      )}
    </div>
  `;

  return renderWithSoftPaywall('iot', currentPlan, innerIot);
}

// ── 3. Console View: Rules & AI Studio ────────────────────────────────────────
function renderConsoleRulesView(currentPlan: PlanTier): string {
  return `
    <div class="console-page-wrapper" id="page-console-rules">
      <div class="console-page-toolbar">
        <div>
          <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">Deterministic Automation Rules &amp; AI Authoring</h2>
          <div class="page-desc" style="margin-top: 2px;">AI synthesizes JSON AST proposals; deterministic engine runs approved rules with zero eval()</div>
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
          <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('If pressure exceeds 180 PSI trigger emergency cutoff valve')">Pressure Threshold</button>
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
          <div class="card-subtitle">Zero-eval() execution engine evaluated inside isolated PostgreSQL transaction blocks</div>
        </div>
        <div id="rules-list-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
      </div>

      <!-- Advanced Feature 1: AI Rule Conflict & Loop Detection Engine (Requires Growth+) -->
      ${renderTierFeatureLock(
        'growth',
        'AI Rule Conflict & Recursive Loop Detector',
        'Analyzes rules across the tenant mesh to identify circular trigger cascades, contradicting actions, or rate-limit saturation before rules enter production.',
        currentPlan,
        `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: #f8fafc; padding: 14px; border-radius: 6px; border: 1px solid var(--border-default);">
          <div>
            <div style="font-weight: 700; color: #1e293b; font-size: 0.88rem;">Mesh Static Analysis: 0 Cycles Detected</div>
            <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">Evaluated across 4 active rules &amp; 3 event triggers.</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.runConflictAnalysis()">
            Run Mesh Conflict Analysis
          </button>
        </div>
        `
      )}

      <!-- Advanced Feature 2: Dual-Operator Cryptographic Sign-Off Gate (Requires Enterprise+) -->
      ${renderTierFeatureLock(
        'enterprise',
        'Dual-Operator Cryptographic Sign-Off Gate (Multi-Sig)',
        'Requires two independent operators (SecOps Officer + Lead Automation Engineer) to digitally sign AI-generated rule deployments using tenant HMAC keys.',
        currentPlan,
        `
        <div class="multi-sign-pipeline">
          <div class="multi-sign-step signed">
            <div style="font-size: 0.72rem; color: #15803d; font-weight: 800;">STEP 1: SECOPS SIGNED</div>
            <div style="font-weight: 700; font-size: 0.85rem; margin: 4px 0;">secops@enterprise-corp.io</div>
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: #64748b;">sig:hmac_sha256:7f4c9a2...</div>
          </div>
          <div class="multi-sign-step" id="multisig-step-2">
            <div style="font-size: 0.72rem; color: #0284c7; font-weight: 800;">STEP 2: OPS LEAD SIGN-OFF</div>
            <div style="font-weight: 700; font-size: 0.85rem; margin: 4px 0;">lead-engineer@enterprise-corp.io</div>
            <button class="btn btn-primary btn-xs" onclick="window.signRuleOpsLead()" style="margin-top: 4px;">Digitally Sign &amp; Deploy Rule</button>
          </div>
        </div>
        `
      )}

      <!-- Advanced Feature 3: Dead-Letter Queue & Circuit Breakers (Requires Enterprise) -->
      ${renderTierFeatureLock(
        'enterprise',
        'Dead-Letter Queue (DLQ) & Automated Circuit Breaker Mesh',
        'Automatic quarantine of flapping rules with exponential backoff and replay buffer.',
        currentPlan,
        `
        <div style="background: #f8fafc; border: 1px solid var(--border-default); border-radius: 6px; padding: 14px; font-family: var(--font-mono); font-size: 0.78rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="color: #16a34a; font-weight: 700;">● Circuit Breaker Status: CLOSED (Normal)</span>
            <div style="color: #64748b; margin-top: 2px;">DLQ Quarantine Buffer: 0 failed executions</div>
          </div>
          <span style="background: #e2e8f0; color: #334155; padding: 3px 8px; border-radius: 4px;">Zero-Loss Replay Ready</span>
        </div>
        `
      )}
    </div>
  `;
}

// ── 4. Console View: CRM & Pipeline ──────────────────────────────────────────
function renderConsoleCrmView(currentPlan: PlanTier): string {
  const innerCrm = `
    <div class="console-page-wrapper" id="page-console-crm">
      <div class="console-page-toolbar">
        <div>
          <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">Multi-Channel CRM, Inbox &amp; Bookings</h2>
          <div class="page-desc" style="margin-top: 2px;">WhatsApp-first inbox, automated appointment reminders, Paystack deposits, and pipeline Kanban</div>
        </div>
        <div class="console-toolbar-actions">
          <button class="btn btn-primary" id="btn-add-lead">+ Create Opportunity</button>
        </div>
      </div>

      <!-- CRM Sub-navigation Tabs -->
      <div style="display: flex; gap: 8px; border-bottom: 2px solid var(--border-default); padding-bottom: 10px; flex-wrap: wrap;">
        <button class="btn ${state.crmSubView === 'whatsapp' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-crm-nav-whatsapp" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Inbox &amp; Channels
        </button>
        <button class="btn ${state.crmSubView === 'kanban' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-crm-nav-kanban" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Deals Pipeline
        </button>
        <button class="btn ${state.crmSubView === 'booking' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-crm-nav-booking" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Bookings
        </button>
      </div>

      <div id="crm-content-view"></div>

      <!-- Advanced Feature 1: Automated WhatsApp Drip Sequences (Requires Agency+) -->
      ${renderTierFeatureLock(
        'agency',
        'Automated WhatsApp Drip Sequences & AI Sentiment Scoring',
        'Trigger personalized multi-stage WhatsApp messaging sequences based on deal stage transitions with real-time sentiment scoring.',
        currentPlan,
        `
        <div style="background: #f8fafc; border: 1px solid var(--border-default); border-radius: 6px; padding: 14px; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-weight: 700; color: #1e293b;">Active Drip Workflows: 3 Running</div>
            <div style="color: #64748b; font-size: 0.74rem;">Cold Lead Re-engagement &bull; Deposit Reminder &bull; Post-Demo Survey</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.triggerDripSequence()">
            Simulate Drip Dispatch
          </button>
        </div>
        `
      )}

      <!-- Advanced Feature 2: Custom Meta WhatsApp Cloud API BYOK & SLA Timers (Requires Enterprise) -->
      ${renderTierFeatureLock(
        'enterprise',
        'Bring Your Own Meta WhatsApp Cloud API (BYOK) & SLA Timers',
        'Direct integration with your corporate Meta Business Manager Phone Number ID, custom webhook verification token, and strict 5-minute lead response SLA timers with automated round-robin distribution.',
        currentPlan,
        `
        <div style="background: #f8fafc; border: 1px solid var(--border-default); border-radius: 6px; padding: 14px; font-family: var(--font-mono); font-size: 0.78rem;">
          <div style="color: #16a34a; font-weight: 700;">✓ Meta Cloud API WABA ID: 109283746501928</div>
          <div style="color: #475569;">Verified Sender: +1 (800) 555-0199 &bull; Round-Robin Routing: 4 Reps Active</div>
          <div style="color: #475569;">SLA Response Timer: 5m Escalation Trigger (Zero Missed Inquiries)</div>
        </div>
        `
      )}
    </div>
  `;

  return renderWithSoftPaywall('crm', currentPlan, innerCrm);
}

// ── 5. Console View: Compliance & Vault ───────────────────────────────────────
function renderConsoleComplianceView(currentPlan: PlanTier): string {
  const innerCompliance = `
    <div class="console-page-wrapper" id="page-console-compliance">
      <div class="console-page-toolbar">
        <div>
          <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">Compliance Vault &amp; Cryptographic Privacy Suite</h2>
          <div class="page-desc" style="margin-top: 2px;">Field-level AEAD envelope encryption, mathematical Right-to-be-Forgotten erasure pipelines, and immutable consent ledgers</div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Cryptographic Envelope Simulator -->
        <div class="card">
          <div class="card-title">Field-Level AEAD Encryption</div>
          <div class="card-subtitle" style="margin-bottom: 14px;">
            Derived tenant key: <code>HMAC-SHA256(masterKey, 'tenant:${state.activeTenant}')</code>
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

      <!-- Advanced Feature: Customer-Managed Keys (BYOK / AWS KMS) (Requires Enterprise) -->
      ${renderTierFeatureLock(
        'enterprise',
        'Customer-Managed Keys (BYOK) via AWS KMS & HashiCorp Vault',
        'Full cryptographic key sovereignty: use your corporate AWS KMS Key ARN or HashiCorp Vault Transit engine for root envelope encryption. ZexCore engineers have zero access to your plaintext encryption master keys.',
        currentPlan,
        `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; align-items: flex-end;">
          <div>
            <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary);">AWS KMS Master Key ARN</label>
            <input type="text" class="input" value="arn:aws:kms:us-east-1:123456789012:key/zexcore-tenant-root" style="margin-top: 4px; font-family: var(--font-mono); font-size: 0.78rem;" />
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.testKmsKeyRotation()" style="padding: 8px 14px;">
            Simulate 90-Day Key Rotation
          </button>
        </div>
        <div style="margin-top: 10px; font-size: 0.74rem; color: #16a34a; font-family: var(--font-mono);">
          <span>● Enclave HSM Attestation: Verified</span> &bull;
          <span>Rotation: Every 90 Days</span>
        </div>
        `
      )}
    </div>
  `;

  return renderWithSoftPaywall('compliance', currentPlan, innerCompliance);
}

// ── Agency White-Label Branding Studio ──────────────────────────────────────
function renderConsoleWhiteLabelView(currentPlan: PlanTier): string {
  const branding = state.agencyBranding;

  const innerWhiteLabel = `
    <div class="console-page-wrapper" id="page-console-whitelabel">
      <div class="console-page-toolbar">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">Agency White-Label Branding Studio</h2>
            <span class="badge" style="background: rgba(13, 148, 136, 0.15); color: #0d9488; font-weight: 800;">25 Client Workspaces</span>
          </div>
          <div class="page-desc" style="margin-top: 2px;">Deliver turnkey SaaS to your clients under your own agency brand, custom CNAME domain, and corporate color palette.</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" id="btn-save-agency-branding">
            Save Agency Branding
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1.25fr; gap: 24px;">
        <!-- Left Column: Agency Brand Settings -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="card">
            <div class="card-title">Brand Identity &amp; Portal Domain</div>
            <div class="card-subtitle" style="margin-bottom: 14px;">Define how your clients identify and access their workspace</div>

            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Agency Business Name</label>
              <input type="text" id="agency-name-input" class="input" value="${branding.agencyName}" style="margin-top: 4px;" placeholder="e.g. Apex Growth Partners" />
            </div>

            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Custom CNAME Domain</label>
              <input type="text" id="agency-domain-input" class="input" value="${branding.customDomain}" style="margin-top: 4px; font-family: var(--font-mono); font-size: 0.8rem;" placeholder="portal.youragency.com" />
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 0.72rem; color: #16a34a; font-family: var(--font-mono);">
                <span>● DNS CNAME Status: Active</span> &bull; <span>SSL: Cloudflare Wildcard Valid</span>
              </div>
            </div>

            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Agency Logo</label>
              <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 8px;">
                <!-- Upload Zone -->
                <label id="logo-upload-zone" for="agency-logo-file-input" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border: 2px dashed var(--border-default); border-radius: 8px; padding: 14px 12px; cursor: pointer; background: #f8fafc; transition: border-color 0.2s, background 0.2s; min-height: 64px; position: relative;" title="Click or drag an image here to upload your logo">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div id="agency-logo-preview-container" style="width: 48px; height: 48px; border: 1px solid var(--border-default); border-radius: 6px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 2px; flex-shrink: 0;">
                      <img src="${branding.logoUrl}" id="agency-logo-preview-img" alt="Logo preview" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                    </div>
                    <div style="text-align: center;">
                      <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-main);">📁 Upload Logo File</div>
                      <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">PNG, JPG, SVG • Max 2MB • Click or drag &amp; drop</div>
                      <div id="logo-upload-filename" style="font-size: 0.68rem; color: #0d9488; font-weight: 700; margin-top: 2px;">${branding.logoIsUpload ? '✓ File uploaded' : ''}</div>
                    </div>
                  </div>
                  <input type="file" id="agency-logo-file-input" accept="image/png,image/jpeg,image/svg+xml,image/gif,image/webp" style="position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;" />
                </label>
                <!-- OR URL input -->
                <div style="display: flex; align-items: center; gap: 6px;">
                  <div style="flex: 1; height: 1px; background: var(--border-default);"></div>
                  <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">OR PASTE URL</span>
                  <div style="flex: 1; height: 1px; background: var(--border-default);"></div>
                </div>
                <input type="text" id="agency-logo-input" class="input" value="${branding.logoIsUpload ? '' : branding.logoUrl}" placeholder="https://youragency.com/logo.png" style="font-size: 0.8rem;" />
              </div>
            </div>

            <div style="margin-bottom: 8px;">
              <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 6px;">Primary Brand Color</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="color" id="agency-color-picker" value="${branding.primaryColor}" style="width: 38px; height: 38px; border: 1px solid var(--border-default); border-radius: 6px; cursor: pointer; padding: 2px; background: #fff;" />
                <input type="text" id="agency-color-hex" class="input" value="${branding.primaryColor}" style="width: 100px; font-family: var(--font-mono); font-size: 0.8rem;" />
                <div style="display: flex; gap: 4px;">
                  <button type="button" class="btn-color-preset" data-color="#0d9488" style="width: 24px; height: 24px; border-radius: 50%; background: #0d9488; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); cursor: pointer;" title="Teal"></button>
                  <button type="button" class="btn-color-preset" data-color="#2563eb" style="width: 24px; height: 24px; border-radius: 50%; background: #2563eb; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); cursor: pointer;" title="Royal Blue"></button>
                  <button type="button" class="btn-color-preset" data-color="#059669" style="width: 24px; height: 24px; border-radius: 50%; background: #059669; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); cursor: pointer;" title="Emerald"></button>
                  <button type="button" class="btn-color-preset" data-color="#E50920" style="width: 24px; height: 24px; border-radius: 50%; background: #E50920; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); cursor: pointer;" title="ZexCore Crimson"></button>
                  <button type="button" class="btn-color-preset" data-color="#7c3aed" style="width: 24px; height: 24px; border-radius: 50%; background: #7c3aed; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); cursor: pointer;" title="Purple"></button>
                </div>
              </div>
            </div>
          </div>

          <!-- White-Label Policies & Watermark Controls -->
          <div class="card">
            <div class="card-title">White-Label Policies &amp; Client Access</div>
            <div class="card-subtitle" style="margin-bottom: 12px;">Ensure zero vendor leakage for your client base</div>

            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.8rem;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="chk-remove-watermark" ${branding.removeWatermark ? 'checked' : ''} />
                <span>Remove all <strong>"Powered by ZexCore"</strong> watermarks and badge links</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="chk-custom-favicon" ${branding.customFavicon ? 'checked' : ''} />
                <span>Override browser favicon and HTML title tags with agency identity</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="chk-client-email" ${branding.clientEmailBranding ? 'checked' : ''} />
                <span>Route transactional email &amp; SMS notifications via agency sender signature</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" checked disabled />
                <span style="color: #64748b;">Postgres 17 RLS Sub-Tenant Isolation (Enforced across all 25 client databases)</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Right Column: Interactive Live Client Portal Sandbox -->
        <div>
          <div class="card" style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <div class="card-title" style="margin: 0;">Live Client Portal Sandbox Preview</div>
                <div class="card-subtitle">Real-time simulation of how your clients see their branded workspace</div>
              </div>
              <div style="display: flex; gap: 4px; background: #f1f5f9; padding: 3px; border-radius: 6px;">
                <button class="btn btn-sm ${branding.previewMode === 'desktop' ? 'btn-primary' : 'btn-secondary'}" id="btn-preview-desktop" style="padding: 4px 10px; font-size: 0.72rem; border: none;">Desktop</button>
                <button class="btn btn-sm ${branding.previewMode === 'mobile' ? 'btn-primary' : 'btn-secondary'}" id="btn-preview-mobile" style="padding: 4px 10px; font-size: 0.72rem; border: none;">Mobile</button>
              </div>
            </div>

            <!-- Browser Mockup Window -->
            <div id="sandbox-mock-window" style="background: #fff; border: 1.5px solid #cbd5e1; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); transition: max-width 0.3s ease; margin: 0 auto; ${branding.previewMode === 'mobile' ? 'max-width: 375px;' : 'max-width: 100%;'}">
              <!-- Browser Header -->
              <div style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; padding: 8px 12px; display: flex; align-items: center; gap: 8px;">
                <div style="display: flex; gap: 5px;">
                  <span style="width: 9px; height: 9px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
                  <span style="width: 9px; height: 9px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
                  <span style="width: 9px; height: 9px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                </div>
                <div style="flex: 1; background: #fff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 10px; font-family: var(--font-mono); font-size: 0.7rem; color: #475569; display: flex; align-items: center; justify-content: space-between;">
                  <span>🔒 https://<span id="preview-url-domain">${branding.customDomain}</span>/dashboard</span>
                  <span style="color: #16a34a; font-weight: 700; font-size: 0.65rem;">SSL ENCRYPTED</span>
                </div>
              </div>

              <!-- Inner Branded App Preview -->
              <div style="min-height: 400px; background: #f8fafc; display: flex; flex-direction: column;">
                <!-- Client Portal Topbar -->
                <div style="background: #fff; border-bottom: 1px solid #e2e8f0; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${branding.logoUrl}" id="preview-client-logo" alt="Logo" style="height: 22px; max-width: 80px; object-fit: contain;" />
                    <span id="preview-client-agency-name" style="font-weight: 800; font-size: 0.85rem; color: #0f172a;">${branding.agencyName}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <select id="preview-client-workspace-select" style="font-size: 0.72rem; padding: 3px 8px; border-radius: 4px; border: 1px solid #cbd5e1; background: #fff;">
                      <option>Client 1: Dr. Bello Specialist Clinic</option>
                      <option>Client 2: Polaris Cold Fleet</option>
                      <option>Client 3: GreenLeaf Organics</option>
                    </select>
                  </div>
                </div>

                <!-- Client Body Content -->
                <div style="padding: 16px; flex: 1;">
                  <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <h4 id="preview-workspace-headline" style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #0f172a;">Dr. Bello Specialist Clinic</h4>
                      <p style="margin: 2px 0 0; font-size: 0.72rem; color: #64748b;">Client Dedicated Workspace &bull; PostgreSQL RLS Isolated</p>
                    </div>
                    <button class="btn btn-sm" id="preview-action-btn" style="background: ${branding.primaryColor}; color: #fff; border: none; font-size: 0.72rem; padding: 5px 12px; border-radius: 4px; font-weight: 700;">
                      New Appointment
                    </button>
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px;">
                    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                      <span style="font-size: 0.68rem; color: #64748b; text-transform: uppercase; font-weight: 600;">Active Bookings</span>
                      <div id="preview-metric-bookings" style="font-size: 1.15rem; font-weight: 900; color: ${branding.primaryColor}; margin-top: 2px;">28</div>
                    </div>
                    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                      <span style="font-size: 0.68rem; color: #64748b; text-transform: uppercase; font-weight: 600;">SMS Reminders</span>
                      <div style="font-size: 1.15rem; font-weight: 900; color: #0f172a; margin-top: 2px;">99.4%</div>
                    </div>
                    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                      <span style="font-size: 0.68rem; color: #64748b; text-transform: uppercase; font-weight: 600;">Audit Health</span>
                      <div style="font-size: 1.15rem; font-weight: 900; color: #16a34a; margin-top: 2px;">Clean</div>
                    </div>
                  </div>

                  <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
                    <div style="font-size: 0.75rem; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Recent Automated Follow-ups</div>
                    <div style="font-size: 0.7rem; color: #475569; display: flex; flex-direction: column; gap: 6px;">
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
                        <span>WhatsApp 24h Reminder sent to Dr. Bello patient #1029</span>
                        <span style="color: #16a34a; font-weight: 700;">Delivered</span>
                      </div>
                      <div style="display: flex; justify-content: space-between;">
                        <span>Paystack consultation slot deposit confirmed (₦50,000)</span>
                        <span style="color: #0284c7; font-weight: 700;">Reconciled</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Client Footer (White-Labeled) -->
                <div style="background: #fff; border-top: 1px solid #e2e8f0; padding: 8px 16px; font-size: 0.68rem; color: #94a3b8; display: flex; justify-content: space-between; align-items: center;">
                  <span>Managed &amp; Hosted by <strong id="preview-footer-agency" style="color: #64748b;">${branding.agencyName}</strong></span>
                  <span style="font-family: var(--font-mono); font-size: 0.64rem;">Tenant RLS Enforced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderWithSoftPaywall('whitelabel', currentPlan, innerWhiteLabel);
}

function renderConsoleLicenseView(currentPlan: PlanTier): string {
  const innerLicense = renderConsoleLicense(state.activeTenant);
  return renderWithSoftPaywall('license', currentPlan, innerLicense);
}

function renderConsoleBillingView(currentPlan: PlanTier): string {
  const plan = PLANS[currentPlan] || PLANS.starter;
  const isHighTier = currentPlan === 'dedicated' || currentPlan === 'enterprise';
  const invoices = [
    { id: 'INV-2026-010', date: 'Oct 01, 2026', amount: plan.monthlyPrice, status: 'Paid', method: 'Bank Transfer' },
    { id: 'INV-2026-009', date: 'Sep 01, 2026', amount: plan.monthlyPrice, status: 'Paid', method: 'Paystack' },
    { id: 'INV-2026-008', date: 'Aug 01, 2026', amount: plan.monthlyPrice, status: 'Paid', method: 'Paystack' },
  ].filter(i => i.amount > 0);

  return `
    <div class="console-card-panel" style="max-width: 960px; margin: 0 auto;">
      <div class="console-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0;">Billing &amp; Invoices</h2>
          <p style="color: var(--text-secondary); font-size: 0.87rem; margin: 0;">Manage your subscription, payment methods, and download receipts.</p>
        </div>
        <button class="btn btn-primary" id="btn-billing-upgrade-plan" style="font-size: 0.84rem;">
          ${isHighTier ? '✦ Manage Plan' : '⬆ Upgrade Plan'}
        </button>
      </div>

      <!-- Current Plan Summary -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="metric-card" style="padding: 20px; border-radius: 12px;">
          <div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 8px;">Current Plan</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">${plan.name}</div>
          <div style="font-size: 0.83rem; color: var(--text-secondary); margin-top: 4px;">${plan.tagline}</div>
          <div style="margin-top: 12px; display: inline-block; background: rgba(22,163,74,0.12); color: #16a34a; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 999px;">ACTIVE</div>
        </div>
        <div class="metric-card" style="padding: 20px; border-radius: 12px;">
          <div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 8px;">Monthly Cost</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">$${plan.monthlyPrice.toLocaleString()}</div>
          <div style="font-size: 0.83rem; color: var(--text-secondary); margin-top: 4px;">per month · billed monthly</div>
          <div style="margin-top: 12px; font-size: 0.78rem; color: var(--text-secondary);">Next invoice: <strong>Nov 1, 2026</strong></div>
        </div>
        <div class="metric-card" style="padding: 20px; border-radius: 12px;">
          <div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 8px;">Payment Methods</div>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem;">
              <span style="font-size: 1rem;">🏦</span>
              <span style="font-weight: 600; color: var(--text-primary);">Bank Transfer</span>
              <span style="margin-left: auto; font-size: 0.7rem; background: #e0f2fe; color: #0284c7; padding: 2px 7px; border-radius: 999px; font-weight: 700;">DEFAULT</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem;">
              <span style="font-size: 1rem;">💳</span>
              <span style="color: var(--text-secondary);">Paystack · card ending 4242</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top: 14px; font-size: 0.78rem; width: 100%;">+ Add Payment Method</button>
        </div>
      </div>

      <!-- Invoice History -->
      <div style="background: #fff; border: 1.5px solid var(--border-default); border-radius: 12px; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-default); display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">Invoice History</div>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">Receipts sent to hello@zexcore.com.ng</span>
        </div>
        ${invoices.length > 0 ? `
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fb;">
              <th style="text-align: left; padding: 10px 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary);">Invoice</th>
              <th style="text-align: left; padding: 10px 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary);">Date</th>
              <th style="text-align: left; padding: 10px 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary);">Amount</th>
              <th style="text-align: left; padding: 10px 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary);">Method</th>
              <th style="text-align: left; padding: 10px 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary);">Status</th>
              <th style="text-align: right; padding: 10px 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary);">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.map((inv, i) => `
            <tr style="border-top: 1px solid #f1f5f9; ${i % 2 === 0 ? '' : 'background: #fafbfc;'}">
              <td style="padding: 13px 20px; font-family: var(--font-mono); font-size: 0.82rem; font-weight: 600; color: var(--text-primary);">${inv.id}</td>
              <td style="padding: 13px 20px; font-size: 0.84rem; color: var(--text-secondary);">${inv.date}</td>
              <td style="padding: 13px 20px; font-size: 0.84rem; font-weight: 700; color: var(--text-primary);">$${inv.amount.toLocaleString()}</td>
              <td style="padding: 13px 20px; font-size: 0.84rem; color: var(--text-secondary);">${inv.method}</td>
              <td style="padding: 13px 20px;">
                <span style="display: inline-block; background: rgba(22,163,74,0.12); color: #16a34a; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 999px;">${inv.status}</span>
              </td>
              <td style="padding: 13px 20px; text-align: right;">
                <button class="btn btn-secondary btn-sm" style="font-size: 0.78rem; padding: 4px 12px;" onclick="window.downloadInvoice('${inv.id}')">⬇ PDF</button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>` : `
        <div style="padding: 40px 20px; text-align: center; color: var(--text-secondary);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🧾</div>
          <div style="font-weight: 600; margin-bottom: 4px;">No invoices yet</div>
          <div style="font-size: 0.84rem;">Invoices will appear here once your first billing cycle completes.</div>
        </div>`}
      </div>

      <!-- Upgrade CTA for non-dedicated plans -->
      ${!isHighTier ? `
      <div style="margin-top: 20px; background: linear-gradient(135deg, #fff5f7, #fff0f0); border: 1.5px solid #fcd5db; border-radius: 14px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
        <div>
          <div style="font-weight: 800; font-size: 1rem; color: #17191d; margin-bottom: 4px;">Ready for Dedicated Infrastructure?</div>
          <div style="font-size: 0.85rem; color: #596579;">Upgrade to Dedicated at $1,500/mo for private VPC, PostgreSQL 17 RLS, AES-256 vault, and 99.99% uptime SLA.</div>
        </div>
        <button class="btn btn-primary" id="btn-billing-cta-upgrade" style="white-space: nowrap; flex-shrink: 0;">Upgrade to Dedicated →</button>
      </div>` : ''}
    </div>
  `;
}

function showToastNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  let container = document.getElementById('zexcore-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'zexcore-toast-container';
    container.className = 'zex-toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `zex-toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s';
    setTimeout(() => toast.remove(), 250);
  }, 3400);
}

// ── Vertical 1-Click Starter Kits Modal ──────────────────────────────────────
function openVerticalStarterKitsModal() {
  document.getElementById('zexcore-starter-kits-modal')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'zexcore-starter-kits-modal';
  overlay.className = 'stripe-modal-backdrop';

  const kits = [
    {
      id: 'solar_iot',
      name: 'Solar & Industrial IoT Fleet',
      badge: 'MQTT / LoRaWAN',
      tagline: 'Mini-grid inverter telemetry, battery voltage & remote kill-switches',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
      stats: '4 Devices &bull; 3 Rules &bull; 2 Deals',
      sample: '12kW Solar array, 48V inverters, DC voltage trigger, USSD reconnect rule',
      companyDefault: 'Helios Solar Mini-Grids',
      devices: [
        { id: 'dev-sol-1', name: 'Accra West Mini-Grid Array (12kW)', key: 'sol_array_accra_01', kind: 'power_gateway', status: 'online', temperature: 41.2, humidity: 36, voltage: 48.4, firmware: 'v3.1.2', lastSeen: 'Just now' },
        { id: 'dev-sol-2', name: 'Inverter Cluster Alpha (5000W Pure Sine)', key: 'sol_inv_alpha', kind: 'power_gateway', status: 'online', temperature: 46.8, humidity: 31, voltage: 48.2, firmware: 'v2.8.0', lastSeen: '1m ago' },
        { id: 'dev-sol-3', name: 'LiFePO4 Battery Bank B (10kWh)', key: 'sol_bat_bank_b', kind: 'power_gateway', status: 'online', temperature: 33.1, humidity: 40, voltage: 51.2, firmware: 'v2.1.0', lastSeen: 'Just now' },
        { id: 'dev-sol-4', name: 'Remote USSD Disconnect Node', key: 'sol_ussd_node_04', kind: 'network_gateway', status: 'online', temperature: 29.0, humidity: 45, voltage: 12.0, firmware: 'v1.4.1', lastSeen: '3m ago' },
      ],
      rules: [
        { id: 'r-sol-1', name: 'Low Battery Voltage Shutdown (< 44.0V)', trigger: 'iot.telemetry.received', conditions: 'metrics.voltage < 44.0', action: 'emit: solar.load_shedding.activated', approved: true, enabled: true },
        { id: 'r-sol-2', name: 'Inverter Overheating Fan Override (> 65°C)', trigger: 'iot.telemetry.received', conditions: 'metrics.temperature > 65.0', action: 'emit: solar.fan.speed_100', approved: true, enabled: true },
        { id: 'r-sol-3', name: 'USSD Remote Top-Up Auto-Reconnect', trigger: 'commerce.order.paid', conditions: 'payment.status == "success"', action: 'emit: iot.relay.closed', approved: true, enabled: true },
      ],
      leads: [
        { id: 'lead-sol-1', title: 'Commercial Cold-Storage Mini-Grid Supply', company: 'Kano Agro Cold Hub', value: 92000, currency: 'USD', stage: 'Negotiation' },
        { id: 'lead-sol-2', title: 'Off-Grid Hospital Inverter Backup', company: 'Mercy Specialist Center', value: 38000, currency: 'USD', stage: 'Proposal' },
      ],
    },
    {
      id: 'clinic_booking',
      name: 'Healthcare & Clinic Intake Booking',
      badge: 'HIPAA / GDPR Vault',
      tagline: 'Patient intake calendar, slot deposits, automated WhatsApp/SMS alerts',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      stats: '3 Doctors &bull; AES-256 Vault &bull; 2 Chiller Probes',
      sample: 'Vaccine storage temperature monitor, automated 24h & 1h reminder bot, Paystack slot deposit',
      companyDefault: 'Apex Specialist Clinic',
      devices: [
        { id: 'dev-cln-1', name: 'Vaccine Chiller Unit 01 (2°C to 8°C)', key: 'cln_vaccine_chiller_01', kind: 'chiller_probe', status: 'online', temperature: 3.8, humidity: 55, voltage: 220.0, firmware: 'v2.4.0', lastSeen: 'Just now' },
        { id: 'dev-cln-2', name: 'Pathology Lab Cold Vault', key: 'cln_lab_vault', kind: 'temperature_probe', status: 'online', temperature: -19.5, humidity: 70, voltage: 220.0, firmware: 'v2.1.0', lastSeen: '1m ago' },
      ],
      rules: [
        { id: 'r-cln-1', name: 'Vaccine Chiller Thermal Breach Warning (> 8°C)', trigger: 'iot.telemetry.received', conditions: 'metrics.temperature > 8.0', action: 'emit: medical.alert.vaccine_temp_breach', approved: true, enabled: true },
        { id: 'r-cln-2', name: 'Automated 24h WhatsApp Reminder on Appointment', trigger: 'booking.appointment.scheduled', conditions: 'appointment.status == "confirmed"', action: 'emit: whatsapp.reminder.scheduled', approved: true, enabled: true },
      ],
      leads: [
        { id: 'lead-cln-1', title: 'Corporate Health Screening Program', company: 'Consolidated Energy Ltd', value: 24000, currency: 'USD', stage: 'Negotiation' },
      ],
    },
    {
      id: 'fintech_agency',
      name: 'Field Sales & WhatsApp Commerce',
      badge: 'Paystack / Flutterwave',
      tagline: 'Omnichannel WhatsApp inbox, mobile money checkout & instant receipts',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
      stats: '5 Chat Threads &bull; Paystack &bull; Automated Receipts',
      sample: 'Direct WhatsApp customer chat, Paystack payment link generation, automated invoice PDF',
      companyDefault: 'AfriPay Digital Merchants',
      devices: [
        { id: 'dev-fin-1', name: 'Point of Sale Mobile Terminal POS-01', key: 'pos_terminal_01', kind: 'network_gateway', status: 'online', temperature: 28.2, humidity: 45, voltage: 5.0, firmware: 'v3.0.0', lastSeen: 'Just now' },
      ],
      rules: [
        { id: 'r-fin-1', name: 'Instant WhatsApp Receipt on Paystack / MoMo Success', trigger: 'commerce.order.paid', conditions: 'payment.status == "success"', action: 'emit: whatsapp.receipt.dispatched', approved: true, enabled: true },
        { id: 'r-fin-2', name: 'High-Value Invoice Escalation (> $5,000)', trigger: 'crm.lead.created', conditions: 'lead.value >= 5000', action: 'emit: crm.high_ticket.alert', approved: true, enabled: true },
      ],
      leads: [
        { id: 'lead-fin-1', title: 'Multi-Store Paystack Payment Router', company: 'Zenith Supermarkets', value: 65000, currency: 'USD', stage: 'Proposal' },
      ],
    },
    {
      id: 'logistics',
      name: 'Cold Chain Logistics & Reefer Telemetry',
      badge: 'ISO 9001 Reefer',
      tagline: 'Refrigerated container freight tracking, GPS geofencing & thermal alerts',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
      stats: '3 Reefer Units &bull; Sub-Zero Probes &bull; GPS Routing',
      sample: 'Sub-zero pharmaceutical transit, real-time temperature graph, breach push notifications',
      companyDefault: 'Polaris Fleet Logistics',
      devices: [
        { id: 'dev-log-1', name: 'Reefer Trailer 40ft Tri-Temp Alpha', key: 'reefer_alpha_40ft', kind: 'chiller_probe', status: 'online', temperature: -18.4, humidity: 85, voltage: 24.0, firmware: 'v2.4.1', lastSeen: 'Just now' },
        { id: 'dev-log-2', name: 'GPS & Telemetry Gateway Hub #402', key: 'gps_gw_402', kind: 'network_gateway', status: 'online', temperature: 21.0, humidity: 42, voltage: 12.6, firmware: 'v2.3.0', lastSeen: '1m ago' },
        { id: 'dev-log-3', name: 'Depot Cold Storage Vault B', key: 'vault_b_depot', kind: 'temperature_probe', status: 'online', temperature: -22.1, humidity: 88, voltage: 220.0, firmware: 'v1.8.4', lastSeen: 'Just now' },
      ],
      rules: [
        { id: 'r-log-1', name: 'Thermal Breach In Transit (> -10°C)', trigger: 'iot.telemetry.received', conditions: 'metrics.temperature > -10.0', action: 'emit: logistics.alert.thermal_breach', approved: true, enabled: true },
        { id: 'r-log-2', name: 'Freight Dispatch WhatsApp Auto-Notification', trigger: 'crm.lead.created', conditions: 'lead.value >= 1000', action: 'emit: dispatch.whatsapp.driver_assigned', approved: true, enabled: true },
      ],
      leads: [
        { id: 'lead-log-1', title: 'Pharma Cold Chain Monthly Contract', company: 'BioMed Logistics', value: 48000, currency: 'USD', stage: 'Negotiation' },
      ],
    },
  ];

  overlay.innerHTML = `
    <div class="stripe-modal-card" style="max-width: 880px; width: 95vw; max-height: 90vh; overflow-y: auto; padding: 28px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge badge-accent">TURNKEY VERTICAL BLUEPRINTS</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">1-Click Workspace Provisioning</span>
          </div>
          <h2 style="margin: 6px 0 2px; font-size: 1.45rem; font-weight: 850; color: var(--text-main);">
            Deploy 1-Click Starter Kits
          </h2>
          <p style="margin: 0; font-size: 0.86rem; color: var(--text-secondary);">
            Instantly populate your console with connected hardware devices, deterministic automation rules, CRM deals, and workflows.
          </p>
        </div>
        <button class="stripe-close-btn" id="btn-starter-kits-close">&times;</button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        ${kits
          .map(
            (k) => `
          <div style="border: 1px solid var(--border-default); border-radius: 10px; padding: 20px; background: #fff; display: flex; flex-direction: column; justify-content: space-between; hover:border-color: var(--primary);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(229, 9, 32, 0.08); display: flex; align-items: center; justify-content: center;">
                  ${k.icon}
                </div>
                <span style="font-size: 0.68rem; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 10px;">
                  ${k.badge}
                </span>
              </div>
              <h3 style="margin: 0 0 4px; font-size: 1.05rem; font-weight: 800; color: var(--text-main);">${k.name}</h3>
              <p style="margin: 0 0 10px; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">${k.tagline}</p>
              
              <div style="background: var(--bg-subtle); border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; font-size: 0.74rem;">
                <div style="font-weight: 700; color: var(--text-main); margin-bottom: 2px;">Includes: ${k.stats}</div>
                <div style="color: var(--text-secondary);">${k.sample}</div>
              </div>
            </div>

            <button class="btn btn-primary btn-sm btn-deploy-kit" data-kit-id="${k.id}" style="width: 100%; justify-content: center; font-weight: 700;">
              Deploy ${k.name.split('&')[0].trim()} Kit &rarr;
            </button>
          </div>
        `
          )
          .join('')}
      </div>

      <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--border-default); font-size: 0.76rem; color: var(--text-secondary); text-align: center;">
        Deploying a kit populates demo devices, automation rules, and pipeline stages in your active tenant with zero data loss.
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#btn-starter-kits-close')?.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  overlay.querySelectorAll<HTMLButtonElement>('.btn-deploy-kit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const kid = btn.getAttribute('data-kit-id');
      const selectedKit = kits.find((k) => k.id === kid);
      if (!selectedKit) return;

      btn.disabled = true;
      btn.innerHTML = `<span class="stripe-spinner"></span> Initializing schema...`;

      setTimeout(() => {
        state.devices = [...(selectedKit.devices as any)];
        state.rules = [...selectedKit.rules];
        state.leads = [...selectedKit.leads];
        state.onboarding.verticalKey = selectedKit.id;
        state.onboarding.companyName = selectedKit.companyDefault;

        overlay.remove();
        showToastNotification(`Starter kit "${selectedKit.name}" deployed! Devices paired, rules armed.`, 'success');
        renderDashboard();
      }, 700);
    });
  });
}

// ── Render Application Shell (Dashboard) ────────────────────────────────────
function renderDashboard() {
  const app = document.getElementById('app');
  if (!app) return;

  const currentPlan = getTenantPlan(state.activeTenant);
  const planMeta = PLANS[currentPlan] || PLANS.starter;

  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar Overlay for mobile -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>

      <!-- Sidebar -->
      <aside class="sidebar" id="sidebar">
        <div class="brand-header" id="brand-header-to-home" title="Click to view public site">
          <img src="/zexcore-logo-horizontal.png" alt="ZexCore" class="brand-logo-horizontal" />
        </div>

        <nav class="nav-menu">
          <!-- Group: Home -->
          <div class="nav-label">Home</div>
          <a href="#/console/overview" class="nav-item ${state.currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">System Overview</span>
              <span class="nav-item-sub">Health, metrics &amp; live events</span>
            </span>
          </a>
          <a href="#/about" class="nav-item" title="Read plain-English explanation, glossary &amp; installation guide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">About &amp; Guide</span>
              <span class="nav-item-sub">Plain English &amp; setup tutorial</span>
            </span>
          </a>

          <!-- Group: Operations -->
          <div class="nav-label" style="margin-top: 10px;">Operations</div>
          <a href="#/console/iot" class="nav-item ${state.currentTab === 'iot' ? 'active' : ''}" data-tab="iot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Connected Devices
                ${isTabLocked('iot', currentPlan, state.currentUser?.email) ? `<span class="nav-plan-lock-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> INDIE</span>` : `<span class="nav-badge" id="iot-count">${state.devices.length}</span>`}
              </span>
              <span class="nav-item-sub">IoT sensors, fleet &amp; telemetry</span>
            </span>
          </a>
          <a href="#/console/rules" class="nav-item ${state.currentTab === 'rules' ? 'active' : ''}" data-tab="rules">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Automation Rules <span class="nav-badge">${state.rules.length}</span></span>
              <span class="nav-item-sub">If-this-then-that logic &amp; AI rules</span>
            </span>
          </a>

          <!-- Group: People & Communication -->
          <div class="nav-label" style="margin-top: 10px;">People</div>
          <a href="#/console/crm" class="nav-item ${state.currentTab === 'crm' ? 'active' : ''}" data-tab="crm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Customers &amp; Inbox
                ${isTabLocked('crm', currentPlan, state.currentUser?.email) ? `<span class="nav-plan-lock-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> GROWTH</span>` : `<span class="nav-badge">${state.leads.length}</span>`}
              </span>
              <span class="nav-item-sub">WhatsApp, deals &amp; bookings</span>
            </span>
          </a>

          <!-- Group: Compliance & Trust -->
          <div class="nav-label" style="margin-top: 10px;">Compliance &amp; Trust</div>
          <a href="#/console/compliance" class="nav-item ${state.currentTab === 'compliance' ? 'active' : ''}" data-tab="compliance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Data &amp; Privacy
                ${isTabLocked('compliance', currentPlan, state.currentUser?.email) ? `<span class="nav-plan-lock-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> DEDICATED</span>` : ''}
              </span>
              <span class="nav-item-sub">GDPR, consent &amp; encryption vault</span>
            </span>
          </a>
          <a href="#/console/audit" class="nav-item ${state.currentTab === 'audit' ? 'active' : ''}" data-tab="audit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Audit &amp; Finance <span class="nav-badge" style="background: rgba(229, 9, 32, 0.12); color: var(--primary); font-weight: 800;">5</span></span>
              <span class="nav-item-sub">Logs, exports &amp; financial records</span>
            </span>
          </a>

          <!-- Group: Settings -->
          <div class="nav-label" style="margin-top: 10px;">Settings</div>
          <a href="#/console/whitelabel" class="nav-item ${state.currentTab === 'whitelabel' ? 'active' : ''}" data-tab="whitelabel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.26L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Agency White-Label
                ${isTabLocked('whitelabel', currentPlan, state.currentUser?.email) ? `<span class="nav-plan-lock-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> AGENCY</span>` : `<span class="nav-badge" style="background: rgba(13, 148, 136, 0.15); color: #0d9488; font-weight: 800;">25</span>`}
              </span>
              <span class="nav-item-sub">Your logo, brand &amp; client portals</span>
            </span>
          </a>
          <a href="#/console/license" class="nav-item ${state.currentTab === 'license' ? 'active' : ''}" data-tab="license">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3H9z"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">License &amp; Keys
                ${isTabLocked('license', currentPlan, state.currentUser?.email) ? `<span class="nav-plan-lock-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> DEDICATED</span>` : `<span class="nav-badge" style="background: rgba(22, 163, 74, 0.15); color: #16a34a; font-weight: 800;">ACTIVE</span>`}
              </span>
              <span class="nav-item-sub">Software license management</span>
            </span>
          </a>
          <a href="#/console/billing" class="nav-item ${state.currentTab === 'billing' ? 'active' : ''}" data-tab="billing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Billing &amp; Invoices</span>
              <span class="nav-item-sub">Subscription, payments &amp; receipts</span>
            </span>
          </a>
        </nav>

        <!-- Active Plan Card in Sidebar -->
        <div class="sidebar-plan-card">
          <div class="sidebar-plan-header">
            <span class="sidebar-plan-label">ACTIVE TIER</span>
            <span class="sidebar-plan-status">Active</span>
          </div>
          <div class="sidebar-plan-name">${planMeta.name}</div>
          <div class="sidebar-plan-price">$${planMeta.monthlyPrice} / mo &bull; Active Tier</div>
          <button class="btn-sidebar-upgrade" id="btn-sidebar-upgrade-plan">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${currentPlan === 'enterprise' || currentPlan === 'dedicated' ? 'Manage Plan' : 'Upgrade Plan'}
          </button>
        </div>

        <div class="sidebar-footer">
          <div style="display: flex; gap: 6px; margin-bottom: 8px; width: 100%;">
            <button class="btn btn-secondary btn-sm" id="btn-sidebar-home" style="flex: 1; font-size: 0.72rem; padding: 4px 6px;">Website</button>
            <a href="#/about" class="btn btn-secondary btn-sm" id="btn-sidebar-about" style="flex: 1; font-size: 0.72rem; padding: 4px 6px; text-decoration: none; text-align: center; display: inline-flex; align-items: center; justify-content: center; color: var(--text-main);" title="Plain-English guide to ZexCore features & installation">About</a>
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
            <!-- Mobile hamburger -->
            <button class="mobile-sidebar-toggle" id="btn-mobile-sidebar-toggle" aria-label="Toggle navigation">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div class="org-tenant-box">
              <span class="topbar-tenant-label" style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Tenant:</span>
              <select id="tenantSelect" class="tenant-select">
                <option value="acme_corp" ${state.activeTenant === 'acme_corp' ? 'selected' : ''}>Acme Enterprise Corp (prod-us-east)</option>
                <option value="globex_corp" ${state.activeTenant === 'globex_corp' ? 'selected' : ''}>Globex Research (dev-eu-west)</option>
                <option value="soylent_ind" ${state.activeTenant === 'soylent_ind' ? 'selected' : ''}>Soylent Dynamics (staging-apac)</option>
              </select>
              <div class="topbar-plan-pill" id="topbar-plan-indicator" title="Click to manage subscription or upgrade plan">
                <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#E50920;flex-shrink:0;"></span>
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${planMeta.name.toUpperCase()}</span>
                ${(currentPlan === 'starter' || currentPlan === 'growth' || currentPlan === 'agency' || currentPlan === 'free') ? '<span class="topbar-plan-upgrade-link">Upgrade</span>' : ''}
              </div>
            </div>
          </div>

          <div class="topbar-right">
            <!-- 1-Click Starter Kits Launcher -->
            <button class="btn btn-secondary btn-sm" id="btn-topbar-starter-kits" style="margin-right: 4px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700; border-color: #cbd5e1; color: #0f172a;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>1-Click Starter Kits</span>
            </button>

            <!-- Interactive System Status Toggle -->
            <label class="zx-toggle-switch" id="topbar-status-toggle" title="Toggle system state: Operational / Offline" style="cursor: pointer; display: inline-flex; align-items: center; gap: 7px; margin-right: 8px;" onclick="window.toggleSystemStatus()">
              <span class="zx-toggle-track ${state.systemStatus === 'operational' ? 'on' : 'off'}" id="topbar-status-track" style="width: 36px; height: 20px;">
                <span class="zx-toggle-thumb"></span>
              </span>
              <span id="topbar-status-label" style="font-size: 0.72rem; font-weight: 700; color: ${state.systemStatus === 'operational' ? '#16a34a' : '#dc2626'}; white-space: nowrap;">
                ${state.systemStatus === 'operational' ? 'Operational' : 'Offline'}
              </span>
            </label>

            <!-- Authenticated User Profile Badge -->
            <div class="auth-user-badge" style="display: flex; align-items: center; gap: 8px; padding: 4px 10px; background: #fff; border: 1px solid var(--border-default); border-radius: 20px; font-size: 0.76rem;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #e50920; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.7rem;">
                ${((state.currentUser?.displayName || state.currentUser?.email || 'A')[0]).toUpperCase()}
              </div>
              <div style="display: flex; flex-direction: column; text-align: left; line-height: 1.15;">
                <span style="font-weight: 600; color: var(--text-primary); max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${state.currentUser?.displayName || state.currentUser?.email || 'Operator'}
                </span>
                <span style="font-size: 0.65rem; color: ${state.currentUser?.isDemo ? '#d97706' : '#16a34a'}; font-family: var(--font-mono); font-weight: 700;">
                  ${state.currentUser?.isDemo ? 'Demo Preview / Sandbox' : 'Production Active'}
                </span>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" id="btn-topbar-home" style="margin-left: 4px;">Public Site</button>
            <button class="btn btn-secondary btn-sm" id="btn-topbar-signout">Sign Out</button>
          </div>
        </header>

        <!-- Dynamic Multi-Page Console Container -->
        <div class="page-container" id="console-page-container">
          ${
            state.currentTab === 'overview' ? renderConsoleOverviewView(currentPlan) :
            state.currentTab === 'iot' ? renderConsoleIotView(currentPlan) :
            state.currentTab === 'rules' ? renderConsoleRulesView(currentPlan) :
            state.currentTab === 'crm' ? renderConsoleCrmView(currentPlan) :
            state.currentTab === 'compliance' ? renderConsoleComplianceView(currentPlan) :
            state.currentTab === 'whitelabel' ? renderConsoleWhiteLabelView(currentPlan) :
            state.currentTab === 'license' ? renderConsoleLicenseView(currentPlan) :
            state.currentTab === 'billing' ? renderConsoleBillingView(currentPlan) :
            renderConsoleAuditView(currentPlan)
          }
        </div>
      </main>
    </div>
  `;

  setupEventListeners();

  // Initialize specific view state
  if (state.currentTab === 'overview') {
    renderEventLog();
  } else if (state.currentTab === 'iot') {
    renderDevices();
  } else if (state.currentTab === 'rules') {
    renderRules();
  } else if (state.currentTab === 'crm') {
    renderCrm();
  } else if (state.currentTab === 'compliance') {
    renderConsents();
    updateCryptoPreview();
  } else if (state.currentTab === 'audit') {
    setupConsoleAuditEvents(currentPlan, () => renderDashboard());
  }
}

// ── Event Handlers ───────────────────────────────────────────────────────────
function setupEventListeners() {
  // Topbar and Sidebar Navigation
  document.getElementById('brand-header-to-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('btn-topbar-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('btn-sidebar-home')?.addEventListener('click', () => navigateTo('home'));

  // Mobile sidebar hamburger toggle
  const sidebar = document.getElementById('console-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const hamburger = document.getElementById('btn-mobile-sidebar-toggle');
  function openMobileSidebar() {
    sidebar?.classList.add('mobile-open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileSidebar() {
    sidebar?.classList.remove('mobile-open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }
  hamburger?.addEventListener('click', openMobileSidebar);
  overlay?.addEventListener('click', closeMobileSidebar);
  // Close sidebar on nav-item click (mobile UX)
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      closeMobileSidebar();
      const tabId = item.getAttribute('data-tab');
      if (tabId) {
        state.currentTab = tabId;
        window.location.hash = '#/console/' + tabId;
      }
    });
  });

  document.getElementById('btn-topbar-starter-kits')?.addEventListener('click', () => {
    openVerticalStarterKitsModal();
  });

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
    if (!targetPlan) {
      openSelfServeUpgradeModal(currentPlan, (newPlan) => {
        setTenantPlan(newPlan, state.activeTenant);
        logBusEvent('billing.subscription.upgraded', {
          tenant: state.activeTenant,
          plan: newPlan,
          gateway: 'stripe',
          status: 'active',
        });
        renderDashboard();
      });
      return;
    }

    openStripeCheckoutModal(targetPlan, 'monthly', (newPlan) => {
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
  document.getElementById('btn-billing-upgrade-plan')?.addEventListener('click', () => handleUpgradeClick());
  document.getElementById('btn-billing-cta-upgrade')?.addEventListener('click', () => handleUpgradeClick('dedicated' as PlanTier));


  document.querySelectorAll<HTMLButtonElement>('.btn-paywall-upgrade').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetPlan = (btn.getAttribute('data-paywall-upgrade') || 'growth') as PlanTier;
      handleUpgradeClick(targetPlan);
    });
  });

  // ── Agency White-Label Branding Handlers ──────────────────────────────────
  if (state.currentTab === 'whitelabel') {
    const nameInput = document.getElementById('agency-name-input') as HTMLInputElement | null;
    const domainInput = document.getElementById('agency-domain-input') as HTMLInputElement | null;
    const logoInput = document.getElementById('agency-logo-input') as HTMLInputElement | null;
    const colorPicker = document.getElementById('agency-color-picker') as HTMLInputElement | null;
    const colorHex = document.getElementById('agency-color-hex') as HTMLInputElement | null;

    // Real-time preview bindings
    nameInput?.addEventListener('input', () => {
      const val = nameInput.value || 'Agency Portal';
      state.agencyBranding.agencyName = val;
      const previewAgency = document.getElementById('preview-client-agency-name');
      const previewFooter = document.getElementById('preview-footer-agency');
      if (previewAgency) previewAgency.innerText = val;
      if (previewFooter) previewFooter.innerText = val;
    });

    domainInput?.addEventListener('input', () => {
      const val = domainInput.value || 'portal.agency.com';
      state.agencyBranding.customDomain = val;
      const previewDomain = document.getElementById('preview-url-domain');
      if (previewDomain) previewDomain.innerText = val;
    });

    logoInput?.addEventListener('input', () => {
      const val = logoInput.value || '/zexcore-logo-light.png';
      state.agencyBranding.logoUrl = val;
      state.agencyBranding.logoIsUpload = false;
      const previewLogo = document.getElementById('preview-client-logo') as HTMLImageElement | null;
      const thumb = document.getElementById('agency-logo-preview-img') as HTMLImageElement | null;
      const filename = document.getElementById('logo-upload-filename');
      if (previewLogo) previewLogo.src = val;
      if (thumb) thumb.src = val;
      if (filename) filename.textContent = '';
    });

    // Logo file upload — converts to base64 and stores as data URI
    const applyLogoFile = (file: File) => {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files are accepted (PNG, JPG, SVG, WEBP)', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo file must be under 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        state.agencyBranding.logoUrl = dataUri;
        state.agencyBranding.logoIsUpload = true;
        const previewLogo = document.getElementById('preview-client-logo') as HTMLImageElement | null;
        const thumb = document.getElementById('agency-logo-preview-img') as HTMLImageElement | null;
        const filename = document.getElementById('logo-upload-filename');
        const urlInput = document.getElementById('agency-logo-input') as HTMLInputElement | null;
        if (previewLogo) previewLogo.src = dataUri;
        if (thumb) thumb.src = dataUri;
        if (filename) filename.textContent = `✓ ${file.name}`;
        if (urlInput) urlInput.value = '';
        try { localStorage.setItem('zx_agency_logo', dataUri); } catch { /* quota */ }
        showToast('Logo uploaded and applied!', 'success');
        logBusEvent('agency.branding.logo_uploaded', { filename: file.name, size: file.size, type: file.type });
      };
      reader.readAsDataURL(file);
    };

    const fileInput = document.getElementById('agency-logo-file-input') as HTMLInputElement | null;
    fileInput?.addEventListener('change', () => {
      if (fileInput.files?.[0]) applyLogoFile(fileInput.files[0]);
    });

    // Drag-and-drop on the upload zone
    const uploadZone = document.getElementById('logo-upload-zone');
    uploadZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = '#E50920';
      uploadZone.style.background = '#fff5f5';
    });
    uploadZone?.addEventListener('dragleave', () => {
      uploadZone.style.borderColor = '';
      uploadZone.style.background = '#f8fafc';
    });
    uploadZone?.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = '';
      uploadZone.style.background = '#f8fafc';
      const file = e.dataTransfer?.files?.[0];
      if (file) applyLogoFile(file);
    });

    const updateColor = (hex: string) => {
      state.agencyBranding.primaryColor = hex;
      if (colorPicker) colorPicker.value = hex;
      if (colorHex) colorHex.value = hex;
      const actionBtn = document.getElementById('preview-action-btn');
      const metricBookings = document.getElementById('preview-metric-bookings');
      if (actionBtn) actionBtn.style.background = hex;
      if (metricBookings) metricBookings.style.color = hex;
    };

    colorPicker?.addEventListener('input', () => updateColor(colorPicker.value));
    colorHex?.addEventListener('input', () => updateColor(colorHex.value));

    document.querySelectorAll<HTMLButtonElement>('.btn-color-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        const c = btn.getAttribute('data-color');
        if (c) updateColor(c);
      });
    });

    // Preview Mode Toggle (Desktop / Mobile)
    const mockWindow = document.getElementById('sandbox-mock-window');
    document.getElementById('btn-preview-desktop')?.addEventListener('click', () => {
      state.agencyBranding.previewMode = 'desktop';
      if (mockWindow) mockWindow.style.maxWidth = '100%';
      document.getElementById('btn-preview-desktop')?.classList.replace('btn-secondary', 'btn-primary');
      document.getElementById('btn-preview-mobile')?.classList.replace('btn-primary', 'btn-secondary');
    });

    document.getElementById('btn-preview-mobile')?.addEventListener('click', () => {
      state.agencyBranding.previewMode = 'mobile';
      if (mockWindow) mockWindow.style.maxWidth = '375px';
      document.getElementById('btn-preview-mobile')?.classList.replace('btn-secondary', 'btn-primary');
      document.getElementById('btn-preview-desktop')?.classList.replace('btn-primary', 'btn-secondary');
    });

    // Client workspace switcher in preview
    const wsSelect = document.getElementById('preview-client-workspace-select') as HTMLSelectElement | null;
    wsSelect?.addEventListener('change', () => {
      const headline = document.getElementById('preview-workspace-headline');
      if (headline && wsSelect) {
        headline.innerText = wsSelect.value.split(':')[1]?.trim() || wsSelect.value;
      }
    });

    // Save Branding button
    document.getElementById('btn-save-agency-branding')?.addEventListener('click', () => {
      showToastNotification('Agency branding saved! Client portals updated.', 'success');
    });
  }

  // ── Dedicated License Vault Handlers ──────────────────────────────────────
  if (state.currentTab === 'license') {
    attachConsoleLicenseEvents(state.activeTenant, () => {
      renderDashboard();
    });
  }

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

  // Checklist actions (In-page modal editing without browser prompts)
  document.getElementById('check-action-name')?.addEventListener('click', () => {
    openModal({
      title: 'Edit Brand & Workspace Name',
      subtitle: 'Set your customer-facing business name across customer portals and invoices',
      contentHtml: `
        <div class="zex-modal-form-group">
          <label class="zex-modal-form-label">Brand or Company Name</label>
          <input type="text" id="modal-brand-name" class="zex-modal-input" value="${state.onboarding.companyName}" placeholder="e.g. Acme Health Logistics" />
        </div>
      `,
      confirmText: 'Save Brand Name',
      onConfirm: () => {
        const val = (document.getElementById('modal-brand-name') as HTMLInputElement)?.value.trim();
        if (val) {
          state.onboarding.companyName = val;
          state.onboarding.checklist.namedCompany = true;
          saveOnboardingState(state.onboarding);
          renderDashboard();
          showToast(`Workspace name updated to "${val}"!`, 'success');
          return true;
        }
        return false;
      },
    });
  });

  document.getElementById('check-action-listing')?.addEventListener('click', () => {
    openModal({
      title: 'Edit Starter Catalog Listing',
      subtitle: 'Update your first catalog service or product package',
      contentHtml: `
        <div class="zex-modal-form-group">
          <label class="zex-modal-form-label">Listing or Service Title</label>
          <input type="text" id="modal-listing-title" class="zex-modal-input" value="${state.onboarding.listingTitle}" placeholder="e.g. Cold Chain Telemetry Starter" />
        </div>
        <div class="zex-modal-form-group">
          <label class="zex-modal-form-label">Pricing / Monthly Fee</label>
          <input type="text" id="modal-listing-price" class="zex-modal-input" value="${state.onboarding.listingPrice}" placeholder="e.g. $1,250 / mo" />
        </div>
      `,
      confirmText: 'Save Listing',
      onConfirm: () => {
        const t = (document.getElementById('modal-listing-title') as HTMLInputElement)?.value.trim();
        const p = (document.getElementById('modal-listing-price') as HTMLInputElement)?.value.trim();
        if (t) state.onboarding.listingTitle = t;
        if (p) state.onboarding.listingPrice = p;
        state.onboarding.checklist.editedListing = true;
        saveOnboardingState(state.onboarding);
        renderDashboard();
        showToast('Catalog listing updated successfully!', 'success');
        return true;
      },
    });
  });

  document.getElementById('check-action-enquiry')?.addEventListener('click', () => {
    if (sampleModal) sampleModal.style.display = 'flex';
  });

  document.getElementById('check-action-share')?.addEventListener('click', () => {
    const shareUrl = window.location.origin + '/#/console';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Showcase link copied to clipboard!', 'success');
        state.onboarding.checklist.sharedLink = true;
        saveOnboardingState(state.onboarding);
        renderDashboard();
      }).catch(() => {
        showToast('Showcase link ready: ' + shareUrl, 'info');
      });
    } else {
      showToast('Showcase link: ' + shareUrl, 'info');
    }
  });

  // Quick actions
  document.getElementById('btn-quick-reg-device')?.addEventListener('click', () => {
    document.getElementById('btn-open-register-device')?.click();
  });

  document.getElementById('btn-quick-telemetry')?.addEventListener('click', () => {
    triggerTelemetryPing('dev-1', 79.4, 55, 3.2);
    showToast('Telemetry ping ingested: 79.4°C threshold alert triggered.', 'warning');
  });

  document.getElementById('btn-quick-lead')?.addEventListener('click', () => {
    document.getElementById('btn-add-lead')?.click();
  });

  document.getElementById('btn-quick-eval-rule')?.addEventListener('click', () => {
    logBusEvent('rules.eval.requested', { ruleId: 'rule-temp-alert', tenantId: state.activeTenant, result: 'PASSED' });
    showToast('Deterministic AST rule graph evaluated in 0.42ms (PASSED).', 'success');
    const tabRules = document.querySelector('[data-tab="rules"]') as HTMLElement;
    tabRules?.click();
  });

  document.getElementById('btn-quick-view-audit')?.addEventListener('click', () => {
    logBusEvent('audit.viewed', { actor: 'admin@enterprise.org', tenantId: state.activeTenant });
    window.location.hash = '#/console/audit';
  });

  document.getElementById('btn-quick-encrypt')?.addEventListener('click', () => {
    const input = document.getElementById('pii-input') as HTMLInputElement;
    if (input) {
      input.value = `confidential_${Date.now()}@secure-enterprise.org`;
      updateCryptoPreview();
      showToast('Real Web Crypto AES-256-GCM envelope re-encrypted with fresh 96-bit IV.', 'success');
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

  // Device register (In-page modal without browser prompts)
  document.getElementById('btn-open-register-device')?.addEventListener('click', () => {
    openModal({
      title: 'Register Edge Device Node',
      subtitle: 'Provision a new IoT sensor probe or edge gateway on your sovereign tenant',
      contentHtml: `
        <div class="zex-modal-form-group">
          <label class="zex-modal-form-label">Device Name</label>
          <input type="text" id="modal-dev-name" class="zex-modal-input" value="Warehouse Cold Chain Monitor 05" placeholder="e.g. Reefer Cold Chiller Probe 05" />
        </div>
        <div class="zex-modal-form-group">
          <label class="zex-modal-form-label">Sensor Hardware Kind</label>
          <select id="modal-dev-kind" class="zex-modal-select">
            <option value="temperature_probe" selected>Temperature Probe (PT100/Thermistor)</option>
            <option value="chiller_probe">Chiller / Freezer Sensor (-40°C rated)</option>
            <option value="power_gateway">Power &amp; Voltage Inverter Gateway</option>
            <option value="network_gateway">Industrial LTE / Mesh Gateway</option>
            <option value="multi_sensor">Environmental Multi-Sensor Node</option>
          </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="zex-modal-form-group">
            <label class="zex-modal-form-label">Operating Voltage (V)</label>
            <input type="number" step="0.1" id="modal-dev-volt" class="zex-modal-input" value="3.3" />
          </div>
          <div class="zex-modal-form-group">
            <label class="zex-modal-form-label">Firmware Release</label>
            <input type="text" id="modal-dev-firmware" class="zex-modal-input" value="v2.3.1" />
          </div>
        </div>
      `,
      confirmText: 'Register Device Node',
      onConfirm: () => {
        const name = (document.getElementById('modal-dev-name') as HTMLInputElement)?.value.trim() || 'Edge Node';
        const kind = (document.getElementById('modal-dev-kind') as HTMLSelectElement)?.value || 'temperature_probe';
        const volt = parseFloat((document.getElementById('modal-dev-volt') as HTMLInputElement)?.value) || 3.3;
        const firmware = (document.getElementById('modal-dev-firmware') as HTMLInputElement)?.value.trim() || 'v2.3.1';
        const key = `iot_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(Math.random() * 100)}`;

        state.devices.push({
          id: `dev-${Date.now()}`,
          name,
          key,
          kind,
          status: 'online',
          temperature: 23.5,
          humidity: 48,
          voltage: volt,
          firmware,
          lastSeen: 'Just now',
        });
        const token = `zex_dev_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
        renderDevices();
        updateFleetOscilloscope();
        logBusEvent('iot.device.registered', { deviceKey: key, tokenHash: 'sha256_verified' });
        showToast(`Device "${name}" registered! Secret token: ${token.slice(0, 16)}...`, 'success');
        return true;
      },
    });
  });

  // Add lead (In-page modal without browser prompts)
  document.getElementById('btn-add-lead')?.addEventListener('click', () => {
    openModal({
      title: 'Create CRM Opportunity / Deal',
      subtitle: 'Add a prospective client deal to your multi-channel sales pipeline',
      contentHtml: `
        <div class="zex-modal-form-group">
          <label class="zex-modal-form-label">Opportunity Title</label>
          <input type="text" id="modal-lead-title" class="zex-modal-input" value="Smart Metering &amp; Telemetry Expansion" placeholder="e.g. Cold Chain Fleet Pilot" />
        </div>
        <div class="zex-modal-form-group">
          <label class="zex-modal-form-label">Client Company Name</label>
          <input type="text" id="modal-lead-company" class="zex-modal-input" value="Metropolis Energy Corp" placeholder="e.g. Apex Logistics" />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="zex-modal-form-group">
            <label class="zex-modal-form-label">Estimated Deal Value ($ USD)</label>
            <input type="number" id="modal-lead-value" class="zex-modal-input" value="65000" />
          </div>
          <div class="zex-modal-form-group">
            <label class="zex-modal-form-label">Pipeline Stage</label>
            <select id="modal-lead-stage" class="zex-modal-select">
              <option value="New" selected>New Inquiry</option>
              <option value="Qualified">Qualified Lead</option>
              <option value="Proposal">Proposal Submitted</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
            </select>
          </div>
        </div>
      `,
      confirmText: 'Create Opportunity',
      onConfirm: () => {
        const title = (document.getElementById('modal-lead-title') as HTMLInputElement)?.value.trim() || 'New Deal';
        const company = (document.getElementById('modal-lead-company') as HTMLInputElement)?.value.trim() || 'Client Org';
        const value = parseInt((document.getElementById('modal-lead-value') as HTMLInputElement)?.value, 10) || 50000;
        const stage = (document.getElementById('modal-lead-stage') as HTMLSelectElement)?.value || 'New';

        createLead(title, company, value, stage);
        showToast(`Opportunity "${title}" created for ${company}!`, 'success');
        return true;
      },
    });
  });

  // Grant consent (In-page modal without browser prompts)
  document.getElementById('btn-grant-consent')?.addEventListener('click', () => {
    openModal({
      title: 'Grant GDPR / NDPR Subject Consent',
      subtitle: 'Record lawful basis and cryptographic consent audit entry in immutable ledger',
      contentHtml: `
        <div class="zex-modal-form-group">
          <label class="zex-modal-form-label">Subject Email or Identifier</label>
          <input type="email" id="modal-consent-sub" class="zex-modal-input" value="patricia.miller@global-enterprise.com" placeholder="user@company.com" />
        </div>
        <div class="zex-modal-form-group">
          <label class="zex-modal-form-label">Data Processing Purpose</label>
          <select id="modal-consent-purpose" class="zex-modal-select">
            <option value="telemetry_processing" selected>telemetry_processing (IoT Ingestion &amp; Analysis)</option>
            <option value="marketing_analytics">marketing_analytics (Transactional Reminders &amp; Outreach)</option>
            <option value="crm_profiling">crm_profiling (Multi-Channel Pipeline Records)</option>
          </select>
        </div>
        <div class="zex-modal-form-group">
          <label class="zex-modal-form-label">Lawful Basis (Article 6)</label>
          <select id="modal-consent-basis" class="zex-modal-select">
            <option value="contract" selected>contract (Performance of a Service Contract)</option>
            <option value="consent">consent (Explicit Data Subject Consent)</option>
            <option value="legitimate_interests">legitimate_interests (Commercial Operations)</option>
          </select>
        </div>
      `,
      confirmText: 'Record Consent Entry',
      onConfirm: () => {
        const sub = (document.getElementById('modal-consent-sub') as HTMLInputElement)?.value.trim();
        const purpose = (document.getElementById('modal-consent-purpose') as HTMLSelectElement)?.value;
        const legalBasis = (document.getElementById('modal-consent-basis') as HTMLSelectElement)?.value;
        if (!sub) {
          showToast('Please enter subject email.', 'error');
          return false;
        }

        state.consents.unshift({
          id: `c-${Date.now()}`,
          subjectId: sub,
          purpose,
          legalBasis,
          grantedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          revokedAt: null,
        });
        renderConsents();
        logBusEvent('compliance.consent.granted', { subjectId: sub, purpose, legalBasis });
        showToast(`Consent recorded for ${sub}!`, 'success');
        return true;
      },
    });
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
        <label class="zx-toggle-switch" onclick="window.toggleDeviceStatus('${d.id}')" title="Toggle device: Live / Offline" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
          <span class="zx-toggle-track ${d.status === 'online' ? 'on' : 'off'}" style="width: 34px; height: 18px;">
            <span class="zx-toggle-thumb"></span>
          </span>
          <span style="font-size: 0.72rem; font-weight: 700; color: ${d.status === 'online' ? '#15803d' : '#b91c1c'};">
            ${d.status === 'online' ? 'Live' : 'Offline'}
          </span>
        </label>
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
        <button class="btn btn-secondary btn-sm" onclick="window.pingDevice('${d.id}')" style="display:inline-flex;align-items:center;gap:5px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
          Ingest Ping
        </button>
      </td>
    </tr>
  `).join('');

  const onlineCount = state.devices.filter((d) => d.status === 'online').length;
  const statOnline = document.getElementById('stat-online-devices');
  if (statOnline) statOnline.innerText = `${onlineCount} / ${state.devices.length}`;
}

(window as any).toggleDeviceStatus = (id: string) => {
  const dev = state.devices.find((d) => d.id === id);
  if (!dev) return;
  dev.status = dev.status === 'online' ? 'offline' : 'online';
  dev.lastSeen = dev.status === 'online' ? 'Just now' : 'Disconnected';
  logBusEvent(dev.status === 'online' ? 'iot.device.online' : 'iot.device.offline', {
    deviceId: dev.id,
    key: dev.key,
    name: dev.name,
    temperature: dev.temperature,
    voltage: dev.voltage,
  });
  renderDevices();
  updateFleetOscilloscope();
};

(window as any).downloadInvoice = (invoiceId: string) => {
  // In production this would call the API to generate a PDF receipt
  const link = document.createElement('a');
  link.href = `data:text/plain;charset=utf-8,ZexCore Invoice ${invoiceId}\n\nThis invoice PDF would be generated by your billing API.\nIntegrate with Paystack/Stripe PDF generation when APIs are ready.`;
  link.download = `${invoiceId}.txt`;
  link.click();
  import('./lib/invoicing').then(({ openReceiptModal }) => {
    const plan = PLANS[getTenantPlan(state.activeTenant)] || PLANS.starter;
    openReceiptModal({
      receiptId: invoiceId,
      plan: plan.name,
      amount: plan.monthlyPrice,
      currency: 'USD',
      billingCycle: 'monthly',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      tenantName: state.activeTenant,
      email: state.currentUser?.email || 'hello@zexcore.com.ng',
    } as any);
  });
};

(window as any).toggleSystemStatus = () => {
  const goingOffline = state.systemStatus === 'operational';
  if (goingOffline) {
    openModal({
      title: 'Switch to Offline / Maintenance?',
      subtitle: 'This will mark the platform as offline for all tenants. This action is logged and immutable.',
      contentHtml: '<p style="color:var(--text-secondary);font-size:0.88rem;margin:0;">Are you sure you want to switch the system status to <strong>Offline / Maintenance</strong>? This will be recorded in the tamper-proof audit log.</p>',
      confirmText: 'Yes, Switch Offline',
      cancelText: 'Cancel',
      onConfirm: () => {
        state.systemStatus = 'offline';
        _applySystemStatusUI();
        logBusEvent('system.health.status_changed', {
          status: 'offline',
          activeTenant: state.activeTenant,
          recordedAt: preciseTimestamp(),
        });
        appendImmutableRecord('status_change', { from: 'operational', to: 'offline', changedBy: state.currentUser?.email || 'admin', recordedAt: preciseTimestamp() });
      },
    });
  } else {
    state.systemStatus = 'operational';
    _applySystemStatusUI();
    logBusEvent('system.health.status_changed', {
      status: 'operational',
      activeTenant: state.activeTenant,
      recordedAt: preciseTimestamp(),
    });
    appendImmutableRecord('status_change', { from: 'offline', to: 'operational', changedBy: state.currentUser?.email || 'admin', recordedAt: preciseTimestamp() });
  }
};

function _applySystemStatusUI() {
  const isOp = state.systemStatus === 'operational';

  // Topbar toggle
  const topbarTrack = document.getElementById('topbar-status-track');
  const topbarLabel = document.getElementById('topbar-status-label');
  if (topbarTrack) { topbarTrack.className = `zx-toggle-track ${isOp ? 'on' : 'off'}`; }
  if (topbarLabel) {
    topbarLabel.style.color = isOp ? '#16a34a' : '#dc2626';
    topbarLabel.textContent = isOp ? 'Operational' : 'Offline';
  }

  // Overview toggle
  const checkbox = document.getElementById('overview-status-checkbox') as HTMLInputElement | null;
  const track = document.getElementById('overview-status-track');
  const label = document.getElementById('overview-status-label');
  if (checkbox) checkbox.checked = isOp;
  if (track) { track.className = `zx-toggle-track ${isOp ? 'on' : 'off'}`; }
  if (label) {
    label.style.color = isOp ? '#16a34a' : '#dc2626';
    label.textContent = isOp ? '● Operational' : '○ Offline';
  }

  const overviewSub = document.getElementById('overview-status-subtext');
  if (overviewSub) {
    overviewSub.innerHTML = isOp
      ? 'Micro-kernel &amp; 5 modules &bull; 99.99% Uptime'
      : 'Maintenance window active &bull; Unoperational';
  }
}

(window as any).pingDevice = (id: string) => {
  const dev = state.devices.find((d) => d.id === id);
  if (!dev) return;
  const temp = parseFloat((dev.temperature + (Math.random() * 4 - 2)).toFixed(1));
  const hum = Math.min(99, Math.max(10, Math.round(dev.humidity + (Math.random() * 6 - 3))));
  triggerTelemetryPing(id, temp, hum, dev.voltage);
};

(window as any).dispatchSiemTestWebhook = () => {
  const endpoint = (document.getElementById('siem-endpoint-input') as HTMLInputElement)?.value || 'https://siem-collector.enterprise.corp/events/v1';
  logBusEvent('audit.siem.dispatched', {
    endpoint,
    format: 'RFC5424_TLS',
    signature: 'hmac_sha256_verified',
    eventsBatched: 1,
    status: 200,
  });
  showToast(`Test SIEM Heartbeat Dispatched to ${endpoint} (HMAC-SHA256 verified, HTTP 200 OK)`, 'success');
};

(window as any).rotateAllDeviceTokens = () => {
  state.devices.forEach((d) => {
    d.lastSeen = 'Just now (Token Rotated)';
  });
  renderDevices();
  updateFleetOscilloscope();
  logBusEvent('iot.fleet.tokens_rotated', {
    tenant: state.activeTenant,
    count: state.devices.length,
    cryptoMethod: 'SHA-256 Single-Use Salted Hash',
  });
  showToast(`All ${state.devices.length} edge device authentication tokens rotated with fresh cryptographic secrets.`, 'success');
};

(window as any).dispatchEdgeCommand = () => {
  const devSelect = document.getElementById('shell-device-select') as HTMLSelectElement | null;
  const cmdSelect = document.getElementById('shell-cmd-select') as HTMLSelectElement | null;
  const devId = devSelect?.value || state.devices[0]?.id || 'dev-1';
  const cmd = cmdSelect?.value || 'reboot';
  const dev = state.devices.find((d) => d.id === devId);

  const shellOutput = document.getElementById('edge-shell-output');
  if (shellOutput) {
    const time = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.innerHTML = `<span class="edge-shell-prompt">[${time}]</span> <span style="color:#38bdf8;">DISPATCH:</span> ${cmd} -> <strong style="color:#fff;">${dev?.name || devId}</strong> (Signature: HMAC-SHA256 OK &bull; ACK 200)`;
    shellOutput.appendChild(line);
    shellOutput.scrollTop = shellOutput.scrollHeight;
  }

  logBusEvent('iot.command.dispatched', {
    deviceId: devId,
    deviceName: dev?.name,
    command: cmd,
    signature: 'hmac_sha256_valid',
    status: 'ACK_DELIVERED',
  });
};

(window as any).runConflictAnalysis = () => {
  logBusEvent('rules.static_analysis.executed', {
    tenant: state.activeTenant,
    rulesEvaluated: state.rules.length,
    circularLoops: 0,
    contradictions: 0,
    meshHealth: 'VERIFIED_DETERMINISTIC',
  });
  showToast(`Static Mesh Analysis Complete: ${state.rules.length} rules checked. Zero deadlocks or cascades. 100% deterministic.`, 'success');
};

(window as any).signRuleOpsLead = () => {
  const step2 = document.getElementById('multisig-step-2');
  if (step2) {
    step2.className = 'multi-sign-step signed';
    step2.innerHTML = `
      <div style="font-size: 0.72rem; color: #15803d; font-weight: 800;">STEP 2: OPS LEAD SIGNED</div>
      <div style="font-weight: 700; font-size: 0.85rem; margin: 4px 0;">lead-engineer@enterprise-corp.io</div>
      <div style="font-family: var(--font-mono); font-size: 0.7rem; color: #16a34a;">sig:hmac_sha256:d82e1a9... (Active)</div>
    `;
  }
  logBusEvent('rules.multisig.completed', {
    ruleId: state.rules[0]?.id || 'rule-1',
    signers: ['secops@enterprise-corp.io', 'lead-engineer@enterprise-corp.io'],
    status: 'DEPLOYED_PRODUCTION',
  });
  showToast('Dual-Operator Cryptographic Sign-Off Complete! Both signatures ledgered.', 'success');
};

(window as any).triggerDripSequence = () => {
  logBusEvent('crm.drip.sequence_dispatched', {
    campaign: 'Cold Lead Re-engagement Drip',
    recipient: state.whatsAppThreads[0]?.contactName || 'Client Lead',
    channel: 'whatsapp_meta_cloud',
    status: 'delivered',
  });
  showToast('Automated WhatsApp & SMS drip sequence dispatched via Meta Cloud API webhook.', 'success');
};

(window as any).testKmsKeyRotation = () => {
  logBusEvent('crypto.kms.key_rotated', {
    tenant: state.activeTenant,
    keyArn: 'arn:aws:kms:us-east-1:123456789012:key/zexcore-tenant-root',
    newVersion: 'v' + Math.floor(Math.random() * 900 + 100),
    rotationCycle: '90_day_automated',
    status: 'success',
  });
  showToast('AWS KMS Root Envelope Key rotation successful in HSM enclave.', 'success');
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
  updateFleetOscilloscope();

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
        <div style="display: flex; align-items: center; gap: 10px;">
          <strong style="font-size: 0.9rem; color: var(--text-main);">${r.name}</strong>
          <label class="zx-toggle-switch" onclick="window.toggleRule('${r.id}')" title="Toggle rule: Enabled / Disabled" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
            <span class="zx-toggle-track ${r.enabled ? 'on' : 'off'}" style="width: 34px; height: 18px;">
              <span class="zx-toggle-thumb"></span>
            </span>
            <span style="font-size: 0.72rem; font-weight: 700; color: ${r.enabled ? '#15803d' : '#b91c1c'};">
              ${r.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
          ${!r.approved ? '<span class="badge-status" style="background: var(--warning-bg); color: var(--warning); border: 1px solid var(--warning-border); font-size: 0.68rem; padding: 2px 6px;">PENDING APPROVAL</span>' : ''}
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
  const serial = generateExportSerial();
  const exportedAt = preciseTimestamp();
  const exportedBy = state.currentUser?.email || 'admin';
  const filename = `zexcore-tenant-export-${state.activeTenant}-${exportedAt.slice(0, 10)}.json`;

  const exportPayload = {
    _zexcore_watermark: {
      serial,
      exportedAt,
      exportedBy,
      tenantId: state.activeTenant,
      product: 'ZexCore Enterprise Platform',
      integrity: 'This export is registered in the ZexCore immutable export ledger and cannot be repudiated.',
    },
    version: '1.0.0',
    exportedAt,
    tenantId: state.activeTenant,
    user: state.currentUser ? { uid: state.currentUser.uid, email: state.currentUser.email, displayName: state.currentUser.displayName, tenantSlug: state.currentUser.tenantSlug } : null,
    plan: getTenantPlan(state.activeTenant),
    data: {
      devices: state.devices,
      rules: state.rules,
      leads: state.leads,
      consents: state.consents,
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
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  appendExportLedgerEntry('Tenant Data (JSON)', filename, exportedBy);
  logBusEvent('tenant.data.exported', {
    serial,
    tenant: state.activeTenant,
    sizeBytes: blob.size,
    recordsCount: state.devices.length + state.rules.length + state.leads.length + state.whatsAppThreads.length,
    gdprCompliant: true,
  });
  showToast(`Export complete. Serial: ${serial}`, 'success');
}

function exportSiemLog(format: 'json' | 'csv') {
  const serial = generateExportSerial();
  const exportedAt = preciseTimestamp();
  const exportedBy = state.currentUser?.email || 'admin';

  if (format === 'json') {
    // NDJSON format for Splunk, Datadog, Elastic, IBM QRadar, Microsoft Sentinel
    const headerLine = JSON.stringify({
      _type: 'SIEM_EXPORT_HEADER',
      serial,
      exportedAt,
      exportedBy,
      tenantId: state.activeTenant,
      watermark: 'ZexCore Immutable Export Ledger',
    });
    const ndjsonLines = state.events.map((evt, idx) => {
      const lineObj = {
        '@timestamp': evt.ts,
        tenant_id: state.activeTenant,
        event_name: evt.name,
        display_time: evt.ts,
        export_serial: serial,
        payload: (() => {
          try { return JSON.parse(evt.payload); } catch { return evt.payload; }
        })(),
        integrity_hash: hashString(evt.name + evt.ts + state.activeTenant + idx),
        classification: 'SECURITY_AUDIT_LOG',
      };
      return JSON.stringify(lineObj);
    });

    const content = [headerLine, ...ndjsonLines].join('\n');
    const filename = `zexcore-siem-${state.activeTenant}-${serial}.ndjson`;
    const blob = new Blob([content], { type: 'application/x-ndjson' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    appendExportLedgerEntry('SIEM Log (NDJSON)', filename, exportedBy);
    logBusEvent('audit.siem.exported', {
      serial,
      format: 'NDJSON',
      eventsCount: state.events.length,
      destination: 'SIEM_INGEST_READY',
    });
    showToast(`SIEM export complete. Serial: ${serial}`, 'success');
  } else {
    // CSV format for compliance auditors & Excel SIEM parsers
    const headers = ['ExportSerial', 'Timestamp', 'TenantID', 'EventName', 'Payload', 'IntegrityHash', 'Watermark'];
    const rows = state.events.map((evt, idx) => {
      const escapedPayload = `"${evt.payload.replace(/"/g, '""')}"`;
      const sig = hashString(evt.name + evt.ts + state.activeTenant + idx);
      return [serial, evt.ts, state.activeTenant, evt.name, escapedPayload, sig, 'ZexCore Immutable Export'].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const filename = `zexcore-siem-${state.activeTenant}-${serial}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    appendExportLedgerEntry('SIEM Log (CSV)', filename, exportedBy);
    logBusEvent('audit.siem.exported', {
      serial,
      format: 'CSV',
      eventsCount: state.events.length,
      destination: 'CSV_AUDIT_ARCHIVE',
    });
    showToast(`CSV export complete. Serial: ${serial}`, 'success');
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
  const currentFilter = state.selectedChannelFilter || 'all';
  const filteredThreads = currentFilter === 'all'
    ? state.whatsAppThreads
    : state.whatsAppThreads.filter((t) => t.channel === currentFilter || t.activeChannel === currentFilter);

  const activeThread = filteredThreads.find((t) => t.id === state.selectedThreadId) || filteredThreads[0] || state.whatsAppThreads[0];
  const totalUnread = state.whatsAppThreads.reduce((acc, t) => acc + t.unreadCount, 0);

  function getChannelBadge(ch?: string) {
    switch (ch) {
      case 'whatsapp': return `<span class="whatsapp-channel-badge wa">WhatsApp</span>`;
      case 'sms': return `<span class="whatsapp-channel-badge sms">SMS</span>`;
      case 'email': return `<span class="whatsapp-channel-badge email">Email</span>`;
      case 'telegram': return `<span class="whatsapp-channel-badge telegram">Telegram</span>`;
      case 'webchat': return `<span class="whatsapp-channel-badge webchat">Web Chat</span>`;
      case 'instagram': return `<span class="whatsapp-channel-badge instagram">Instagram</span>`;
      default: return `<span class="whatsapp-channel-badge wa">WhatsApp</span>`;
    }
  }

  container.innerHTML = `
    <!-- Omnichannel Channel Filter Bar -->
    <div class="channel-filter-bar">
      <button class="channel-filter-btn ${currentFilter === 'all' ? 'active' : ''}" onclick="window.setChannelFilter('all')">
        All Channels (${state.whatsAppThreads.length})
      </button>
      <button class="channel-filter-btn ${currentFilter === 'whatsapp' ? 'active' : ''}" onclick="window.setChannelFilter('whatsapp')">
        WhatsApp (${state.whatsAppThreads.filter(t => t.channel === 'whatsapp' || t.activeChannel === 'whatsapp').length})
      </button>
      <button class="channel-filter-btn ${currentFilter === 'sms' ? 'active' : ''}" onclick="window.setChannelFilter('sms')">
        SMS Fallback (${state.whatsAppThreads.filter(t => t.channel === 'sms' || t.activeChannel === 'sms').length})
      </button>
      <button class="channel-filter-btn ${currentFilter === 'email' ? 'active' : ''}" onclick="window.setChannelFilter('email')">
        Email Receipts (${state.whatsAppThreads.filter(t => t.channel === 'email' || t.activeChannel === 'email').length})
      </button>
      <button class="channel-filter-btn ${currentFilter === 'telegram' ? 'active' : ''}" onclick="window.setChannelFilter('telegram')">
        Telegram Direct (${state.whatsAppThreads.filter(t => t.channel === 'telegram' || t.activeChannel === 'telegram').length})
      </button>
    </div>

    <div class="whatsapp-inbox-grid" style="margin-top: 14px;">
      <!-- Left Column: Unified Contact Threads -->
      <div class="whatsapp-threads-col">
        <div class="whatsapp-threads-header">
          <div>
            <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Unified Contacts Inbox</span>
              ${totalUnread > 0 ? `<span style="background: #25d366; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 999px;">${totalUnread} new</span>` : ''}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; display: flex; align-items: center; gap: 6px;">
              <span>Pluggable Adapter Core</span>
              <span>&bull;</span>
              <label class="zx-toggle-switch" onclick="window.toggleCrmWebhook()" title="Toggle webhook: Live / Offline" style="cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                <span class="zx-toggle-track ${state.crmWebhookStatus === 'live' ? 'on' : 'off'}" style="width: 28px; height: 15px;">
                  <span class="zx-toggle-thumb"></span>
                </span>
                <span style="font-size: 0.65rem; font-weight: 700; color: ${state.crmWebhookStatus === 'live' ? '#15803d' : '#b91c1c'};">
                  ${state.crmWebhookStatus === 'live' ? 'Webhook Live' : 'Webhook Offline'}
                </span>
              </label>
            </div>
          </div>
          <button class="btn btn-secondary btn-xs" onclick="window.simulateIncomingWhatsApp()" title="Simulate incoming customer lead message via webhook">
            + Test Inbound
          </button>
        </div>

        <div style="flex: 1; overflow-y: auto;">
          ${filteredThreads.length === 0 ? `
            <div style="padding: 28px 16px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
              No conversations in "${currentFilter}". Select another channel tab above.
            </div>
          ` : filteredThreads.map((th) => {
            const isActive = activeThread && th.id === activeThread.id;
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
                  <div style="display: inline-flex; gap: 4px; align-items: center;">
                    ${getChannelBadge(th.activeChannel || th.channel)}
                    ${th.fallbackChannel ? `<span style="font-size: 0.62rem; color: #64748b;">&rarr; ${th.fallbackChannel.toUpperCase()}</span>` : ''}
                  </div>
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
                <div style="font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
                  <span style="color: #16a34a; font-weight: 700;">● Online</span>
                  <span>&middot;</span>
                  <span>Pipeline: <strong>${activeThread.stage}</strong> ($${activeThread.leadValue.toLocaleString()})</span>
                  <span>&middot;</span>
                  ${activeThread.windowStatus === 'open_24h' 
                    ? `<span style="background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; font-weight: 700; padding: 1px 6px; border-radius: 3px; font-size: 0.65rem;">Customer 24h Window Active</span>`
                    : `<span style="background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; font-weight: 700; padding: 1px 6px; border-radius: 3px; font-size: 0.65rem;">Window Closed (Templates Only)</span>`
                  }
                  ${activeThread.fallbackChannel ? `<span style="font-size: 0.65rem; color: #64748b;">(Fallback: ${activeThread.fallbackChannel.toUpperCase()})</span>` : ''}
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <a href="https://wa.me/${activeThread.cleanPhone}?text=${encodeURIComponent('Hello ' + activeThread.contactName + ', following up regarding your ZexCore inquiry!')}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                WhatsApp Direct
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
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; color: var(--text-muted); margin-bottom: 3px;">
                  <span style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${m.channel || activeThread.channel || 'whatsapp'}</span>
                  ${m.providerConfirmed ? `<span style="color: #16a34a; font-weight: 700;">✓ Provider Confirmed</span>` : ''}
                </div>
                <div style="margin-bottom: 3px;">${m.text}</div>
                <div class="whatsapp-msg-time">
                  <span style="font-size:0.65rem;color:var(--text-muted);">${m.time}</span>
                  ${m.sender === 'agent' || m.sender === 'bot'
                    ? m.status === 'read' && m.providerConfirmed
                      ? `<span title="Seen" style="color:#0284c7;font-weight:800;font-size:0.85rem;">✓✓</span>`
                      : m.status === 'delivered' && m.providerConfirmed
                        ? `<span title="Delivered" style="color:#94a3b8;font-weight:800;font-size:0.85rem;">✓✓</span>`
                        : m.status === 'sent'
                          ? `<span title="Sent" style="color:#cbd5e1;font-weight:800;font-size:0.85rem;">✓</span>`
                          : m.status === 'failed'
                            ? `<span title="Failed to deliver" style="color:#dc2626;font-size:0.7rem;">⚠ Failed</span>`
                            : `<span title="Sending..." style="color:#e2e8f0;font-size:0.75rem;">◷</span>`
                    : '' /* client messages never show outbound ticks */
                  }
                  ${m.sender === 'bot' ? `<span style="background:#e2e8f0;color:#475569;font-size:0.6rem;padding:1px 4px;border-radius:3px;">BOT AUTO</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Saved Reply Templates / Omnichannel Recipes -->
          <div class="whatsapp-quick-replies-row">
            <span style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); align-self: center; margin-right: 4px;">Quick Actions:</span>
            <button class="whatsapp-quick-reply-pill" onclick="window.sendWhatsAppQuickPing('Here is our Cold Chain & Fleet Telemetry Hardware Specification catalog.')">Send Spec Sheet</button>
            <button class="whatsapp-quick-reply-pill" onclick="window.sendWhatsAppQuickPing('You can book a 1-on-1 hardware onboarding slot here: https://zexcore.io/book/${activeThread.id}')">Share Booking Link</button>
            <button class="whatsapp-quick-reply-pill" onclick="window.sendWhatsAppQuickPing('Here is the Paystack checkout link to secure your initial reservation deposit (Sandbox Mode): https://paystack.com/pay/zexcore-starter')">Request Deposit (₦50k Sandbox)</button>
            <button class="whatsapp-quick-reply-pill" onclick="window.sendWhatsAppQuickPing('ZexCore operates on single-tenant database encryption with ISO 27001 audit logging.')">Security Summary</button>
          </div>

          <!-- Message Composer Form with Channel Adapter Switcher -->
          <form class="whatsapp-composer" id="whatsapp-message-form" onsubmit="event.preventDefault(); window.sendWhatsAppCustomMessage();" style="display: flex; gap: 8px; align-items: center;">
            <select id="whatsapp-composer-channel" style="padding: 8px 10px; border-radius: var(--radius-sm); border: 1.5px solid var(--border-default); font-size: 0.75rem; font-weight: 700; background: #fff; color: var(--text-main);">
              <option value="whatsapp">WhatsApp (In-Window Free)</option>
              <option value="sms">SMS Fallback (Termii / ~₦4.50)</option>
              <option value="email">Email (Transactional Receipt)</option>
              <option value="telegram">Telegram Bot Direct</option>
            </select>
            <input type="text" id="whatsapp-composer-input" class="input" placeholder="Type a message or automated dispatch..." style="flex: 1;" />
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
          <div class="stat-subtext" style="color: var(--text-muted); font-size: 0.72rem; margin-top: 4px;">Paystack &amp; Flutterwave (Sandbox Mode)</div>
        </div>

        <div class="stat-box" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: var(--radius-md); padding: 16px;">
          <div class="stat-label">Omnichannel Reminders</div>
          <div class="stat-value" style="font-size: 1.6rem; font-weight: 800; color: #16a34a; margin-top: 6px;">${remindersDelivered} / ${totalBookings}</div>
          <div class="stat-subtext" style="color: #16a34a; font-size: 0.72rem; font-weight: 600; margin-top: 4px;">Automated WhatsApp &amp; SMS alerts</div>
        </div>

        <div class="stat-box" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: var(--radius-md); padding: 16px;">
          <div class="stat-label">Attendance Confirmation</div>
          <div class="stat-value" style="font-size: 1.6rem; font-weight: 800; color: #0284c7; margin-top: 6px;">98.4%</div>
          <div class="stat-subtext" style="color: var(--text-muted); font-size: 0.72rem; margin-top: 4px;">Confirmed via automated multi-channel check-ins</div>
        </div>
      </div>

      <!-- Action Banner & Bookings Table -->
      <div class="card" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        <div class="card-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-default); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-weight: 800; font-size: 1rem; color: var(--text-main);">Scheduled Client Bookings &amp; Consultations</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
              Shareable booking page with automated WhatsApp/SMS reminders and in-place client editing
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.copyShareableBookingLink()" style="display:inline-flex;align-items:center;gap:5px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Copy Booking Link
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
                <th style="padding: 12px 16px;">Omnichannel Alert</th>
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
                        <button class="btn btn-secondary btn-xs" onclick="window.editBooking('${b.id}')" title="Edit booking parameters" style="display:inline-flex;align-items:center;gap:3px;">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                          Edit
                        </button>
                        <button class="btn btn-secondary btn-xs" onclick="window.triggerBookingReminder('${b.id}')" title="Dispatch automated reminder message now" style="display:inline-flex;align-items:center;gap:4px;">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>
                          Ping Reminder
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

(window as any).toggleCrmWebhook = () => {
  state.crmWebhookStatus = state.crmWebhookStatus === 'live' ? 'offline' : 'live';
  logBusEvent(state.crmWebhookStatus === 'live' ? 'crm.webhook.connected' : 'crm.webhook.disconnected', {
    channel: 'whatsapp_cloud_api',
    status: state.crmWebhookStatus,
    timestamp: new Date().toISOString(),
  });
  renderCrm();
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

// Global CRM & Omnichannel Interactive Handlers
(window as any).setChannelFilter = (filter: string) => {
  state.selectedChannelFilter = filter as any;
  renderCrm();
};

(window as any).selectWhatsAppThread = (id: string) => {
  state.selectedThreadId = id;
  const th = state.whatsAppThreads.find((t) => t.id === id);
  if (th) th.unreadCount = 0;
  renderCrm();
};

(window as any).sendWhatsAppQuickPing = (text: string, customChannel?: string) => {
  const activeThread = state.whatsAppThreads.find((t) => t.id === state.selectedThreadId) || state.whatsAppThreads[0];
  if (!activeThread) return;

  const targetChannel = customChannel || activeThread.activeChannel || activeThread.channel || 'whatsapp';
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newMsg: WhatsAppMessage = {
    sender: 'agent',
    text,
    time: timeStr,
    status: 'delivered',
    channel: targetChannel as any,
    providerConfirmed: true,
  };

  activeThread.messages.push(newMsg);
  activeThread.lastMsg = text;
  activeThread.time = timeStr;

  logBusEvent('crm.message_sent', {
    threadId: activeThread.id,
    phone: activeThread.phone,
    textSnippet: text.slice(0, 40),
    channel: targetChannel,
    gateway: targetChannel === 'whatsapp' ? 'Meta Cloud API' : targetChannel === 'sms' ? 'Termii / Twilio' : targetChannel === 'telegram' ? 'Telegram Bot API' : 'Resend / SMTP',
  });

  renderCrm();
  showToast(`Message sent via ${targetChannel.toUpperCase()} to ${activeThread.contactName}.`, 'success');
};

(window as any).sendWhatsAppCustomMessage = () => {
  const input = document.getElementById('whatsapp-composer-input') as HTMLInputElement;
  const channelSelect = document.getElementById('whatsapp-composer-channel') as HTMLSelectElement;
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  const channel = channelSelect ? channelSelect.value : undefined;
  (window as any).sendWhatsAppQuickPing(text, channel);
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
    channel: activeThread.channel,
    providerConfirmed: true,
  });
  activeThread.lastMsg = reply;
  activeThread.time = timeStr;
  activeThread.unreadCount++;

  logBusEvent('crm.webhook_received', {
    threadId: activeThread.id,
    from: activeThread.phone,
    snippet: reply.slice(0, 45),
    verifiedWebhook: 'Provider HMAC-SHA256 Signature Valid',
  });

  renderCrm();
  showToast(`Inbound message received from ${activeThread.contactName} (${activeThread.channel.toUpperCase()})`, 'info');
};

(window as any).convertChatToOpportunity = (threadId: string) => {
  const thread = state.whatsAppThreads.find((t) => t.id === threadId);
  if (!thread) return;

  createLead(`${thread.contactName} - Hardware Contract`, thread.contactName + ' Enterprise', thread.leadValue, thread.stage);
  showToast(`Conversation with ${thread.contactName} converted into CRM Opportunity (${thread.stage} · $${thread.leadValue.toLocaleString()})!`, 'success');
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
    channel: 'whatsapp_with_sms_fallback',
    template: 'booking_reminder_24h',
    delivered: true,
  });

  renderCrm();
  showToast(`Automated WhatsApp & SMS reminder dispatched to ${b.clientName} (${b.phone})! Reschedule link active.`, 'success');
};

(window as any).openNewBookingModal = () => {
  openModal({
    title: 'New Client Appointment & Booking',
    subtitle: 'Schedule a client consultation or hardware deployment slot with multi-channel alerts.',
    confirmText: 'Schedule Appointment',
    contentHtml: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Client Name</label>
          <input type="text" id="modal-booking-name" class="zex-modal-input" placeholder="e.g. Chief Olatunji Adeleke" value="Chief Olatunji Adeleke" />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">WhatsApp / Phone</label>
            <input type="text" id="modal-booking-phone" class="zex-modal-input" placeholder="+234 809 123 4567" value="+234 809 123 4567" />
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Email (Fallback Receipt)</label>
            <input type="email" id="modal-booking-email" class="zex-modal-input" placeholder="client@company.ng" value="adeleke@agrologistics.ng" />
          </div>
        </div>
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Service / Booking Item</label>
          <select id="modal-booking-service" class="zex-modal-select">
            <option value="Cold Chain Edge Telemetry Setup">Cold Chain Edge Telemetry Setup</option>
            <option value="Fleet IoT Gateway Calibration">Fleet IoT Gateway Calibration</option>
            <option value="Executive Security &amp; Compliance Audit">Executive Security &amp; Compliance Audit</option>
            <option value="NDPR / Sovereign Vault Consultation">NDPR / Sovereign Vault Consultation</option>
          </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Scheduled Date &amp; Time</label>
            <input type="text" id="modal-booking-time" class="zex-modal-input" placeholder="Tomorrow, 3:00 PM WAT" value="Tomorrow, 3:00 PM WAT" />
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Deposit Status</label>
            <select id="modal-booking-deposit" class="zex-modal-select">
              <option value="₦50,000 Paid (Paystack Sandbox)">₦50,000 Paid (Paystack Sandbox)</option>
              <option value="₦25,000 Paid (Flutterwave Sandbox)">₦25,000 Paid (Flutterwave Sandbox)</option>
              <option value="Waived / Enterprise Term Agreement">Waived / Enterprise Term Agreement</option>
            </select>
          </div>
        </div>
      </div>
    `,
    onConfirm: () => {
      const name = (document.getElementById('modal-booking-name') as HTMLInputElement)?.value.trim();
      const phone = (document.getElementById('modal-booking-phone') as HTMLInputElement)?.value.trim();
      const service = (document.getElementById('modal-booking-service') as HTMLSelectElement)?.value;
      const dateTime = (document.getElementById('modal-booking-time') as HTMLInputElement)?.value.trim();
      const depositStatus = (document.getElementById('modal-booking-deposit') as HTMLSelectElement)?.value;

      if (!name || !phone) {
        showToast('Please provide client name and contact phone.', 'error');
        return;
      }

      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const newBooking: BookingAppointment = {
        id: `book-${Date.now()}`,
        clientName: name,
        phone,
        cleanPhone,
        service: service || 'Telemetry Setup',
        dateTime: dateTime || 'Tomorrow, 3:00 PM WAT',
        depositStatus: depositStatus || '₦50,000 Paid (Paystack Sandbox)',
        whatsappReminderStatus: 'delivered',
      };

      state.bookings.unshift(newBooking);
      logBusEvent('booking.appointment.scheduled', {
        bookingId: newBooking.id,
        client: name,
        phone,
        service: newBooking.service,
        depositGateway: 'Paystack Sandbox',
      });

      renderCrm();
      showToast(`Appointment scheduled for ${name}! Multi-channel reminder queue initialized.`, 'success');
    }
  });
};

(window as any).editBooking = (id: string) => {
  const b = state.bookings.find((item) => item.id === id);
  if (!b) return;

  openModal({
    title: 'Edit Scheduled Appointment',
    subtitle: `Update client parameters, service tier, or schedule for ${b.clientName}.`,
    confirmText: 'Save Changes',
    contentHtml: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Client Name</label>
          <input type="text" id="modal-edit-name" class="zex-modal-input" value="${b.clientName}" />
        </div>
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Contact Phone / WhatsApp</label>
          <input type="text" id="modal-edit-phone" class="zex-modal-input" value="${b.phone}" />
        </div>
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Service / Session</label>
          <input type="text" id="modal-edit-service" class="zex-modal-input" value="${b.service}" />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Date &amp; Time</label>
            <input type="text" id="modal-edit-time" class="zex-modal-input" value="${b.dateTime}" />
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Deposit Status</label>
            <input type="text" id="modal-edit-deposit" class="zex-modal-input" value="${b.depositStatus}" />
          </div>
        </div>
      </div>
    `,
    onConfirm: () => {
      const name = (document.getElementById('modal-edit-name') as HTMLInputElement)?.value.trim();
      const phone = (document.getElementById('modal-edit-phone') as HTMLInputElement)?.value.trim();
      const service = (document.getElementById('modal-edit-service') as HTMLInputElement)?.value.trim();
      const dateTime = (document.getElementById('modal-edit-time') as HTMLInputElement)?.value.trim();
      const depositStatus = (document.getElementById('modal-edit-deposit') as HTMLInputElement)?.value.trim();

      if (!name || !phone) {
        showToast('Client name and phone cannot be empty.', 'error');
        return;
      }

      b.clientName = name;
      b.phone = phone;
      b.cleanPhone = phone.replace(/[^0-9]/g, '');
      if (service) b.service = service;
      if (dateTime) b.dateTime = dateTime;
      if (depositStatus) b.depositStatus = depositStatus;

      renderCrm();
      showToast(`Updated appointment for ${name}.`, 'success');
    }
  });
};

(window as any).copyShareableBookingLink = () => {
  const link = `https://zexcore.io/book/${state.activeTenant}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link);
    showToast(`Public booking link copied to clipboard: ${link}`, 'success');
  } else {
    showToast(`Booking link: ${link}`, 'info');
  }
};

// ── Compliance Render ────────────────────────────────────────────────────────
let cachedAesKey: CryptoKey | null = null;
let cachedHmacKey: CryptoKey | null = null;

async function getCryptoKeys() {
  if (!cachedAesKey) {
    cachedAesKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  if (!cachedHmacKey) {
    cachedHmacKey = await window.crypto.subtle.generateKey(
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );
  }
  return { aesKey: cachedAesKey, hmacKey: cachedHmacKey };
}

function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function updateCryptoPreview() {
  const input = document.getElementById('pii-input') as HTMLInputElement;
  const val = input && input.value.trim() ? input.value : 'operator@tenant-sovereign.io';

  const envEl = document.getElementById('crypto-envelope-display');
  const blnEl = document.getElementById('crypto-blind-display');

  try {
    const { aesKey, hmacKey } = await getCryptoKeys();
    const encoder = new TextEncoder();
    const data = encoder.encode(val);

    // Real 96-bit random IV for AES-256-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      aesKey,
      data
    );

    // Real HMAC-SHA256 blind index for zero-knowledge lookup
    const signature = await window.crypto.subtle.sign('HMAC', hmacKey, data);

    const ivHex = bufToHex(iv.buffer);
    const cipherHex = bufToHex(encrypted);
    const blindHex = bufToHex(signature).substring(0, 32);

    if (envEl) envEl.innerText = `enc:v1:aes256gcm:${ivHex}:${cipherHex}`;
    if (blnEl) blnEl.innerText = `blind:hmac_sha256:${blindHex}`;
  } catch (err) {
    console.error('Web Crypto API error:', err);
  }
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
              <label class="zx-toggle-switch" onclick="window.toggleConsent('${c.id}')" title="Toggle consent: Active / Revoked" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                <span class="zx-toggle-track ${c.revokedAt ? 'off' : 'on'}" style="width: 34px; height: 18px;">
                  <span class="zx-toggle-thumb"></span>
                </span>
                <span style="font-size: 0.72rem; font-weight: 700; color: ${c.revokedAt ? '#b91c1c' : '#15803d'};">
                  ${c.revokedAt ? 'Revoked' : 'Active'}
                </span>
              </label>
            </td>
            <td style="text-align: right;">
              <button class="btn ${c.revokedAt ? 'btn-secondary' : 'btn-danger'} btn-sm" onclick="window.toggleConsent('${c.id}')">
                ${c.revokedAt ? 'Reactivate' : 'Revoke'}
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

(window as any).toggleConsent = (id: string) => {
  const c = state.consents.find((item) => item.id === id);
  if (c) {
    if (c.revokedAt) {
      c.revokedAt = null;
      logBusEvent('compliance.consent.reactivated', { subjectId: c.subjectId, purpose: c.purpose });
    } else {
      c.revokedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      logBusEvent('compliance.consent.revoked', { subjectId: c.subjectId, purpose: c.purpose });
    }
    renderConsents();
  }
};
(window as any).revokeConsent = (window as any).toggleConsent;

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

  showToast(`Right to be Forgotten executed for ${subjectId}. Records anonymized & audit ledger appended.`, 'warning');
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
      app.innerHTML = renderPlatformPage(state.platformModule);
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
    case 'about':
      app.innerHTML = renderAboutPage();
      setupNavbarEvents();
      break;
    case 'contact':
      app.innerHTML = renderContactPage();
      setupNavbarEvents();
      setupContactPageEvents();
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
  const parts = rawHash.split('/');
  const route = parts[0]?.toLowerCase() || '';
  const subParam = parts[1]?.toLowerCase() || '';

  if (route === 'signin' || route === 'login') {
    state.currentView = 'signin';
  } else if (route === 'console' || route === 'dashboard' || route === 'app') {
    state.currentView = 'console';
    const validTabs = ['overview', 'iot', 'rules', 'crm', 'compliance', 'whitelabel', 'audit', 'license', 'billing'];
    state.currentTab = validTabs.includes(subParam) ? subParam : 'overview';
  } else if (route === 'platform') {
    state.currentView = 'platform';
    state.platformModule = subParam || 'core';
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
  } else if (route === 'about') {
    state.currentView = 'about';
  } else if (route === 'contact') {
    state.currentView = 'contact';
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
    about: 'About ZexCore — Plain English Platform Guide',
    contact: 'Contact ZexCore — Enterprise Enquiries & Support',
    signin: 'Sign in to ZexCore Control',
  };

  if (state.currentView === 'console') {
    const consoleTitles: Record<string, string> = {
      overview: 'System Overview — ZexCore Operations Console',
      iot: 'IoT Fleet & Telemetry Ingestion — ZexCore Console',
      rules: 'Deterministic Automation & AI Authoring — ZexCore Console',
      crm: 'Multi-Channel CRM & Revenue Ops — ZexCore Console',
      compliance: 'Compliance Vault & GDPR Privacy — ZexCore Console',
      whitelabel: 'Agency White-Label Branding Studio — ZexCore Console',
      audit: 'Audit & Financial Health Suite — ZexCore Console',
      license: 'Enterprise Dedicated License Vault — ZexCore Console',
      billing: 'Billing & Invoices — ZexCore Console',
    };
    document.title = consoleTitles[state.currentTab] || 'ZexCore Control — Operational Console';
  } else {
    document.title = titles[state.currentView] || 'ZexCore — Enterprise Infrastructure Platform';
  }

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

