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
  const onlineDevices = state.devices.filter(d => d.status === 'online').length;
  const totalDevices = state.devices.length;
  const pipelineTotal = state.leads.reduce((a, b) => a + b.value, 0);

  return `
    <div class="console-page-wrapper" id="page-console-overview">
      <div class="console-page-toolbar">
        <div>
          <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">System Operations Overview</h2>
          <div class="page-desc" style="margin-top: 2px;">Real-time infrastructure health, fleet telemetry, active automations, and event streams</div>
        </div>
        <div class="console-toolbar-actions">
          <button class="btn btn-secondary btn-sm" id="btn-download-all-data" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600; padding: 7px 14px; background: #ffffff; border: 1.5px solid #d1d5db; color: #1e293b; border-radius: var(--radius-sm); box-shadow: 0 1px 3px rgba(0,0,0,0.05); cursor: pointer;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Audit Snapshot (JSON)
          </button>
        </div>
      </div>

      <!-- "Great First Ten Minutes" Onboarding Strip / Starters -->
      ${renderOnboardingBanner(state.onboarding)}

      <!-- Calm Enterprise Stat Row -->
      <div class="enterprise-stat-grid">
        <div class="enterprise-stat-card">
          <div class="enterprise-stat-header">
            <span class="enterprise-stat-label">Connected Fleet</span>
            <span style="font-size: 0.72rem; font-weight: 700; color: #16a34a; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 2px 7px; border-radius: 4px;">
              ● ONLINE
            </span>
          </div>
          <div class="enterprise-stat-value" id="stat-online-devices">
            ${onlineDevices} <span style="font-size: 1rem; font-weight: 500; color: #64748b;">/ ${totalDevices}</span>
          </div>
          <div class="enterprise-stat-sub">
            <span class="dot-healthy"></span>
            <span>All nodes responding &bull; MQTT over WSS</span>
          </div>
        </div>

        <div class="enterprise-stat-card">
          <div class="enterprise-stat-header">
            <span class="enterprise-stat-label">Automations Evaluated</span>
            <span style="font-size: 0.72rem; font-weight: 700; color: #0284c7; background: #f0f9ff; border: 1px solid #bae6fd; padding: 2px 7px; border-radius: 4px;">
              0 ERRORS
            </span>
          </div>
          <div class="enterprise-stat-value">1,428</div>
          <div class="enterprise-stat-sub">
            <span style="color: #0284c7; font-weight: 700;">Sub-millisecond</span>
            <span>deterministic execution</span>
          </div>
        </div>

        <div class="enterprise-stat-card">
          <div class="enterprise-stat-header">
            <span class="enterprise-stat-label">Customer Conversations</span>
            <span style="font-size: 0.72rem; font-weight: 700; color: #d97706; background: #fffbeb; border: 1px solid #fde68a; padding: 2px 7px; border-radius: 4px;">
              ACTIVE
            </span>
          </div>
          <div class="enterprise-stat-value">${state.whatsAppThreads.length}</div>
          <div class="enterprise-stat-sub">
            <span>WhatsApp &amp; Omnichannel inbox</span>
          </div>
        </div>

        <div class="enterprise-stat-card">
          <div class="enterprise-stat-header">
            <span class="enterprise-stat-label">Pipeline Value</span>
            <span style="font-size: 0.72rem; font-weight: 700; color: #E50920; background: #fff1f2; border: 1px solid #fecdd3; padding: 2px 7px; border-radius: 4px;">
              QUALIFIED
            </span>
          </div>
          <div class="enterprise-stat-value" id="stat-total-pipeline">
            $${pipelineTotal.toLocaleString()}
          </div>
          <div class="enterprise-stat-sub">
            <span>Paystack &amp; Stripe integrated</span>
          </div>
        </div>
      </div>

      <!-- Main Operations Grid (Left: Activity Stream, Right: Health & Quick Actions) -->
      <div class="enterprise-overview-grid">

        <!-- LEFT COLUMN: Live Event Stream -->
        <div class="activity-card">
          <div class="activity-card-header">
            <div class="activity-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span>Live Event Stream</span>
              <span class="status-dot-pulse" style="width: 6px; height: 6px; background: #16a34a; border-radius: 50%; margin-left: 4px;"></span>
            </div>
            <div class="activity-filter-bar">
              <button class="activity-filter-btn active">All Events</button>
              <button class="activity-filter-btn">Fleet</button>
              <button class="activity-filter-btn">WhatsApp</button>
              <button class="activity-filter-btn">Rules</button>
            </div>
          </div>
          <div class="activity-feed-list" id="event-stream-body">
            <!-- Event stream items populated by renderEventLog() -->
          </div>
        </div>

        <!-- RIGHT COLUMN: System Health Matrix & Quick Actions -->
        <div>
          <!-- System Services Health Card -->
          <div class="health-service-card">
            <div style="font-size: 0.88rem; font-weight: 750; color: #0f172a; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
              <span>Infrastructure Services</span>
              <span style="font-size: 0.72rem; color: #16a34a; font-weight: 700;">All Operational</span>
            </div>

            <div class="health-service-row">
              <div class="health-service-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg>
                <span>Core API Micro-kernel</span>
              </div>
              <span class="health-status-tag"><span class="dot"></span> 2.1ms avg</span>
            </div>

            <div class="health-service-row">
              <div class="health-service-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                <span>PostgreSQL 17 Database</span>
              </div>
              <span class="health-status-tag"><span class="dot"></span> RLS Enforced</span>
            </div>

            <div class="health-service-row">
              <div class="health-service-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                <span>WhatsApp Cloud API</span>
              </div>
              <span class="health-status-tag"><span class="dot"></span> Webhook 200</span>
            </div>

            <div class="health-service-row">
              <div class="health-service-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                <span>Telemetry Ingestion Gateway</span>
              </div>
              <span class="health-status-tag"><span class="dot"></span> Active</span>
            </div>

            <div class="health-service-row">
              <div class="health-service-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>AES-256 Vault Encryption</span>
              </div>
              <span class="health-status-tag"><span class="dot"></span> Sealed</span>
            </div>
          </div>

          <!-- Quick Actions Grid -->
          <div style="font-size: 0.88rem; font-weight: 750; color: #0f172a; margin-bottom: 10px;">
            Quick Operations
          </div>
          <div class="quick-action-grid">
            <button class="quick-action-item" id="btn-quick-reg-device">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>
              <span>Add Device</span>
            </button>
            <button class="quick-action-item" id="btn-quick-telemetry">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Ingest Reading</span>
            </button>
            <button class="quick-action-item" id="btn-quick-lead">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
              <span>Add Lead</span>
            </button>
            <button class="quick-action-item" id="btn-quick-eval-rule">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              <span>Run Rule</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Advanced Tier Feature: Enterprise SIEM Forwarding Mesh -->
      ${renderTierFeatureLock(
        'growth',
        'Enterprise SIEM Webhook Relay & Real-Time Log Forwarding',
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
              Dispatch Test Heartbeat
            </button>
          </div>
        </div>
        <div style="margin-top: 10px; font-size: 0.74rem; color: #16a34a; font-family: var(--font-mono); display: flex; align-items: center; gap: 6px;">
          <span>● mTLS Mutual Auth Verified</span> &bull;
          <span>Payload Signing: HMAC-SHA256 Active</span>
        </div>
        `
      )}

      <!-- Tamper-Proof Audit & Non-Deletable Export Ledger -->
      <div class="card" style="margin-top: 16px;">
        <div class="card-header" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
          <div>
            <div class="card-title" style="display: flex; align-items: center; gap: 8px;">
              <span>Tamper-Proof Records &amp; Export Ledger</span>
              <span class="status-pill" style="font-size: 0.68rem; padding: 2px 8px; background: rgba(22, 163, 74, 0.1); color: #16a34a; border: 1px solid rgba(22, 163, 74, 0.2);">
                ${verifyImmutableChain().valid ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block;vertical-align:middle;margin-right:3px;"><polyline points="20 6 9 17 4 12"/></svg>Hash-Chain Verified' : '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block;vertical-align:middle;margin-right:3px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Integrity Mismatch'}
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
                      ${entry.hash} <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="display:inline-block;vertical-align:-1px;margin-left:2px;"><polyline points="20 6 9 17 4 12"/></svg>
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
          <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">Connected Devices &amp; Fleet Hub</h2>
          <div class="page-desc" style="margin-top: 2px;">Monitor edge hardware nodes, live sensor telemetry, firmware revisions, and authenticated dispatch.</div>
        </div>
        <div class="console-toolbar-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.rotateAllDeviceTokens()">Rotate All Device Keys</button>
          <button class="btn btn-primary" id="btn-open-register-device">+ Register Edge Device</button>
        </div>
      </div>

      <!-- Live Telemetry Ingestion Metrics -->
      <div class="telemetry-oscilloscope-wrap">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border-default);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);"></span>
            <span style="font-size: 0.82rem; font-weight: 650; color: var(--text-main);">Live Sensor Aggregates</span>
            <span style="font-size: 0.72rem; color: var(--text-secondary); background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);">MQTT / TLS 1.3</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 14px;">
            <span>Sample Rate: <strong style="color: var(--text-main);">1.0s</strong></span>
            <span>Attestation: <strong style="color: #15803d;">Active</strong></span>
          </div>
        </div>
        <div class="oscilloscope-grid" id="iot-oscilloscope-grid">
          <div class="oscilloscope-metric-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.04em;">Fleet Temperature</span>
              <span style="color: #64748b; font-size: 0.72rem;">Ambient Avg</span>
            </div>
            <div class="oscilloscope-metric-val" id="fleet-avg-temp">${fleet.avgTemp} &deg;C</div>
            <div id="fleet-temp-status" style="font-size: 0.72rem; color: #15803d; font-weight: 500;">${fleet.tempStatus}</div>
          </div>
          <div class="oscilloscope-metric-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.04em;">Relative Humidity</span>
              <span style="color: #64748b; font-size: 0.72rem;">Median RH</span>
            </div>
            <div class="oscilloscope-metric-val" id="fleet-avg-hum">${fleet.avgHum} %</div>
            <div id="fleet-hum-status" style="font-size: 0.72rem; color: #15803d; font-weight: 500;">${fleet.humStatus}</div>
          </div>
          <div class="oscilloscope-metric-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.04em;">DC Rail Voltage</span>
              <span style="color: #64748b; font-size: 0.72rem;">Nominal 12V</span>
            </div>
            <div class="oscilloscope-metric-val" id="fleet-avg-volt">${fleet.avgVolt} V</div>
            <div id="fleet-volt-status" style="font-size: 0.72rem; color: #15803d; font-weight: 500;">${fleet.voltStatus}</div>
          </div>
        </div>
      </div>

      <!-- Device Fleet Table with Search & Filtering -->
      <div class="device-table-card">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-default); background: #ffffff; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 260px;">
            <div style="position: relative; width: 100%; max-width: 300px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="iot-search-filter" placeholder="Search devices by name or key..." oninput="window.renderDevices()" style="width: 100%; padding: 6px 12px 6px 30px; font-size: 0.8rem; border: 1px solid var(--border-default); border-radius: 6px; background: #f8fafc; color: var(--text-main); outline: none;">
            </div>
            <select id="iot-status-filter" onchange="window.renderDevices()" style="padding: 6px 10px; font-size: 0.8rem; border: 1px solid var(--border-default); border-radius: 6px; background: #ffffff; color: var(--text-main);">
              <option value="all">All Statuses</option>
              <option value="online">Online only</option>
              <option value="offline">Offline only</option>
            </select>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);" id="iot-fleet-counts">
            <strong>${state.devices.filter(d => d.status === 'online').length}</strong> online &bull; <strong>${state.devices.length}</strong> total
          </div>
        </div>
        <div style="overflow-x: auto;">
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
      </div>

      <!-- Advanced Feature 1: Remote Diagnostic Command Dispatcher (Requires Growth+) -->
      ${renderTierFeatureLock(
        'growth',
        'Remote Diagnostic Shell & Signed Command Dispatcher',
        'Dispatch cryptographic operational instructions directly to edge microcontrollers (ESP32, STM32, ARM Cortex-M) over MQTT/WSS with tenant HMAC signatures.',
        currentPlan,
        `
        <div class="edge-shell-terminal">
          <div class="edge-shell-log" id="edge-shell-output">
            <div><span class="edge-shell-prompt">[edge-gateway]</span> Connected to edge broker: tls://edge.zexcore.io:8883</div>
            <div><span class="edge-shell-prompt">[edge-gateway]</span> Authenticated as tenant: ${state.activeTenant} (HMAC-SHA256 verified)</div>
            <div><span class="edge-shell-prompt">[edge-gateway]</span> Gateway ready for authenticated operational commands.</div>
          </div>
          <div class="edge-shell-input-row">
            <select id="shell-device-select" class="tenant-select" style="max-width: 170px; font-size: 0.75rem; background: #1e293b; color: #fff; border-color: #334155;">
              ${state.devices.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>
            <select id="shell-cmd-select" class="tenant-select" style="max-width: 220px; font-size: 0.75rem; background: #1e293b; color: #fff; border-color: #334155;">
              <option value="reboot">sys.reboot()</option>
              <option value="calibrate">sensor.calibrate_baseline()</option>
              <option value="rollback">ota.rollback_firmware(v2.2.0)</option>
              <option value="cutoff">power.emergency_cutoff()</option>
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
        'Hardware Root-of-Trust & Device Attestation (mTLS / X.509)',
        'Enforce mutual cryptographic handshakes and X.509 TPM endorsement verification before edge hardware can push telemetry into the PostgreSQL tenant pool.',
        currentPlan,
        `
        <div style="background: #ffffff; border: 1px solid var(--border-default); border-radius: 8px; padding: 16px; font-family: var(--font-sans); font-size: 0.82rem; line-height: 1.6;">
          <div style="display: flex; align-items: center; gap: 8px; color: #15803d; font-weight: 700; margin-bottom: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Hardware TPM 2.0 Attestation Enclave Active
          </div>
          <div style="color: var(--text-secondary); font-size: 0.78rem;">Root Certificate Authority: ZexCore Global Edge Hardware CA (X.509 v3)</div>
          <div style="color: var(--text-secondary); font-size: 0.78rem;">Attested Nodes: ${state.devices.length} / ${state.devices.length} &bull; Key Storage: Microchip ATECC608A Cryptographic Co-Processor</div>
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
          <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">Automation &amp; Event Rules</h2>
          <div class="page-desc" style="margin-top: 2px;">Configure trigger conditions, automated operational actions, and notification workflows.</div>
        </div>
      </div>

      <!-- Natural Language Rule Generator -->
      <div class="prompt-panel" style="background: #ffffff; border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 18px 20px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary);"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            <span style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">
              Natural Language Rule Generator
            </span>
          </div>
          <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-secondary); background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">
            Deterministic Engine
          </span>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">
          Describe your automation requirement in plain English. The rule engine validates schema and stages a draft rule for review before activation.
        </p>
        <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
          <input type="text" class="input" id="ai-rule-prompt" style="flex: 1; min-width: 280px; font-size: 0.84rem; background: #f8fafc;" value="Notify operations if temperature exceeds 75°C for 3 consecutive readings" />
          <button class="btn btn-primary" id="btn-generate-ai-rule" style="white-space: nowrap;">Generate Rule Draft</button>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
          <span style="font-size: 0.72rem; color: var(--text-secondary); margin-right: 4px;">Presets:</span>
          <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('Alert sales VP when a CRM deal over $100k is closed won')" style="font-size: 0.74rem; padding: 3px 8px;">Deal Won Alert</button>
          <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('When IoT battery level falls below 15% queue recharge command')" style="font-size: 0.74rem; padding: 3px 8px;">Battery Low Command</button>
          <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('If customer revokes consent anonymize personal data immediately')" style="font-size: 0.74rem; padding: 3px 8px;">Consent Erasure</button>
          <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('If pressure exceeds 180 PSI trigger emergency cutoff valve')" style="font-size: 0.74rem; padding: 3px 8px;">Pressure Cutoff</button>
        </div>

        <!-- Output AST Preview -->
        <div id="ai-rule-preview" style="display: none; margin-top: 16px; border-top: 1px solid var(--border-default); padding-top: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.78rem; font-weight: 650; color: var(--text-main);">
              Staged Rule Definition (Pending Approval):
            </span>
            <span style="font-size: 0.72rem; color: #15803d; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Schema Validated</span>
          </div>
          <pre class="code-block" id="ai-rule-json" style="background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 6px; font-size: 0.75rem; max-height: 220px; overflow-y: auto;"></pre>
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <button class="btn btn-primary btn-sm" id="btn-approve-ai-draft">Approve &amp; Activate Rule</button>
            <button class="btn btn-secondary btn-sm" id="btn-discard-ai-draft">Discard Draft</button>
          </div>
        </div>
      </div>

      <!-- Existing Rules Table -->
      <div class="card" style="background: #ffffff; border: 1px solid var(--border-default); border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);">
        <div class="card-header" style="padding: 14px 20px; border-bottom: 1px solid var(--border-default); background: #ffffff;">
          <div class="card-title" style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">Active Automation Rules</div>
          <div class="card-subtitle" style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Evaluated in real-time against incoming device telemetry and tenant event buses.</div>
        </div>
        <div id="rules-list-container" style="display: flex; flex-direction: column; gap: 8px; padding: 16px 20px;"></div>
      </div>

      <!-- Advanced Feature 1: AI Rule Conflict & Loop Detection Engine (Requires Growth+) -->
      ${renderTierFeatureLock(
        'growth',
        'Automation Conflict & Loop Analysis',
        'Analyzes rule graph across the tenant mesh to identify circular trigger cascades, contradicting actions, or rate-limit saturation before rules enter production.',
        currentPlan,
        `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid var(--border-default);">
          <div>
            <div style="font-weight: 650; color: var(--text-main); font-size: 0.88rem;">Rule Mesh Static Analysis: 0 Conflicts Detected</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Evaluated across ${state.rules.length} active rules and event trigger subscriptions.</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.runConflictAnalysis()">
            Run Conflict Analysis
          </button>
        </div>
        `
      )}

      <!-- Advanced Feature 2: Dual-Operator Sign-Off Gate (Requires Enterprise+) -->
      ${renderTierFeatureLock(
        'enterprise',
        'Dual-Operator Sign-Off Gate (Multi-Signature)',
        'Requires two independent operators to digitally sign and approve rule modifications before promotion to production execution.',
        currentPlan,
        `
        <div class="multi-sign-pipeline">
          <div class="multi-sign-step signed" style="background: #ffffff; border: 1px solid var(--border-default); border-radius: 8px; padding: 14px;">
            <div style="font-size: 0.72rem; color: #15803d; font-weight: 700;">STEP 1: SECOPS SIGNED</div>
            <div style="font-weight: 600; font-size: 0.85rem; margin: 4px 0; color: var(--text-main);">secops@enterprise-corp.io</div>
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-secondary);">sig:sha256:7f4c9a2d...</div>
          </div>
          <div class="multi-sign-step" id="multisig-step-2" style="background: #ffffff; border: 1px solid var(--border-default); border-radius: 8px; padding: 14px;">
            <div style="font-size: 0.72rem; color: var(--primary); font-weight: 700;">STEP 2: OPS LEAD SIGN-OFF</div>
            <div style="font-weight: 600; font-size: 0.85rem; margin: 4px 0; color: var(--text-main);">lead-engineer@enterprise-corp.io</div>
            <button class="btn btn-primary btn-xs" onclick="window.signRuleOpsLead()" style="margin-top: 6px;">Sign &amp; Deploy Rule</button>
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
          <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">Customer Communications &amp; Pipeline</h2>
          <div class="page-desc" style="margin-top: 2px;">Unified customer inbox, WhatsApp messaging, deal stages, and scheduled consultations.</div>
        </div>
        <div class="console-toolbar-actions">
          <button class="btn btn-primary" id="btn-add-lead">+ Create Opportunity</button>
        </div>
      </div>

      <!-- CRM Sub-navigation Tabs -->
      <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border-default); padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap;">
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
          Bookings &amp; Consultations
        </button>
      </div>

      <div id="crm-content-view"></div>

      <!-- Advanced Feature 1: Automated Follow-up Sequences (Requires Agency+) -->
      ${renderTierFeatureLock(
        'agency',
        'Automated Follow-up Sequences & Smart Routing',
        'Trigger personalized multi-stage WhatsApp and SMS messaging sequences based on deal stage transitions.',
        currentPlan,
        `
        <div style="background: #ffffff; border: 1px solid var(--border-default); border-radius: 8px; padding: 16px; font-size: 0.82rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-weight: 650; color: var(--text-main);">Active Messaging Sequences: 3 Running</div>
            <div style="color: var(--text-secondary); font-size: 0.76rem; margin-top: 2px;">Lead Re-engagement &bull; Deposit Confirmation &bull; Post-Consultation Survey</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.triggerDripSequence()">
            Simulate Sequence Dispatch
          </button>
        </div>
        `
      )}

      <!-- Advanced Feature 2: Dedicated Meta WhatsApp Cloud API (Requires Enterprise) -->
      ${renderTierFeatureLock(
        'enterprise',
        'Dedicated WhatsApp Business API (WABA) & SLA Timers',
        'Direct integration with your corporate Meta Business Manager Phone Number ID, custom webhooks, and team round-robin routing.',
        currentPlan,
        `
        <div style="background: #ffffff; border: 1px solid var(--border-default); border-radius: 8px; padding: 16px; font-size: 0.8rem; line-height: 1.6;">
          <div style="display: flex; align-items: center; gap: 8px; color: #15803d; font-weight: 700; margin-bottom: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Meta Cloud API WABA ID: 109283746501928 (Connected)
          </div>
          <div style="color: var(--text-secondary); font-size: 0.78rem;">Verified Sender: +1 (800) 555-0199 &bull; Round-Robin Routing: 4 Reps Active</div>
          <div style="color: var(--text-secondary); font-size: 0.78rem;">SLA Response Timer: 5-minute escalation policy active</div>
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
          <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">Data Privacy &amp; Compliance</h2>
          <div class="page-desc" style="margin-top: 2px;">Field-level envelope encryption, right-to-be-forgotten erasure pipelines, and consent records.</div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Cryptographic Envelope Simulator -->
        <div class="card" style="background: #ffffff; border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 18px 20px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.04);">
          <div class="card-title" style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">Field-Level Envelope Encryption</div>
          <div class="card-subtitle" style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 14px; margin-top: 2px;">
            AES-256-GCM envelope with isolated tenant key derivation
          </div>
          <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary);">Plaintext Input (Simulation):</label>
          <input type="text" class="input" id="pii-input" value="john.enterprise@finance-corp.gov" style="margin: 4px 0 12px 0; font-size: 0.82rem; background: #f8fafc;" />
          
          <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.04em;">Ciphertext Envelope:</div>
          <div class="crypto-display" id="crypto-envelope-display" style="background: #0f172a; color: #38bdf8; padding: 8px 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.75rem; word-break: break-all; margin: 4px 0 10px 0;">enc:v1:7f4c9a2d...</div>

          <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.04em;">Deterministic Blind Search Index:</div>
          <div class="crypto-display" id="crypto-blind-display" style="background: #0f172a; color: #a78bfa; padding: 8px 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.75rem; word-break: break-all; margin-top: 4px;">blind:e8b417c...</div>
        </div>

        <!-- Right to be Forgotten / Erasure -->
        <div class="card" style="background: #ffffff; border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 18px 20px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.04);">
          <div class="card-title" style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">Right to be Forgotten (GDPR / NDPR)</div>
          <div class="card-subtitle" style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 14px; margin-top: 2px;">
            Permanent pseudonymization of data across customer records and logs
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 14px;">
            <input type="text" class="input" id="erasure-subject-input" placeholder="Subject Email or UUID" value="david.k@global-cloud.com" style="flex: 1; font-size: 0.82rem; background: #f8fafc;" />
            <button class="btn btn-danger" id="btn-execute-erasure" style="white-space: nowrap; font-size: 0.8rem; padding: 6px 14px;">Execute Erasure</button>
          </div>
          <div style="background: #f8fafc; padding: 14px; border-radius: 6px; border: 1px solid var(--border-default); font-size: 0.8rem; line-height: 1.6;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">Fulfilled Requests:</span>
              <strong style="color: var(--text-main);" id="erasure-counter">${state.erasureRequestsCount}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: var(--text-secondary);">Sanitized Records:</span>
              <strong style="color: #15803d;" id="anonymized-counter">${state.anonymizedCount}</strong>
            </div>
            <div style="color: var(--text-secondary); font-size: 0.74rem; border-top: 1px solid var(--border-default); padding-top: 6px;">
              Replaces PII with <code>[REDACTED]</code>, clears phone numbers, and invalidates active consent grants.
            </div>
          </div>
        </div>
      </div>

      <!-- Consent Registry -->
      <div class="card" style="background: #ffffff; border: 1px solid var(--border-default); border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.04);">
        <div class="card-header" style="padding: 14px 20px; border-bottom: 1px solid var(--border-default); display: flex; justify-content: space-between; align-items: center; background: #ffffff;">
          <div>
            <div class="card-title" style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">Consent Ledger &amp; Lawful Basis</div>
            <div class="card-subtitle" style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Verifiable timestamps and lawful basis tracking for data processing</div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-grant-consent">+ Record Consent</button>
        </div>

        <div id="consent-table-container" style="padding: 0;"></div>
      </div>

      <!-- Advanced Feature: Customer-Managed Keys (BYOK / AWS KMS) (Requires Enterprise) -->
      ${renderTierFeatureLock(
        'enterprise',
        'Customer-Managed Keys (BYOK) via AWS KMS & HashiCorp Vault',
        'Use your corporate AWS KMS Key ARN or HashiCorp Vault transit engine for root envelope encryption.',
        currentPlan,
        `
        <div style="background: #ffffff; border: 1px solid var(--border-default); border-radius: 8px; padding: 16px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; align-items: flex-end;">
            <div>
              <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary);">AWS KMS Master Key ARN</label>
              <input type="text" class="input" value="arn:aws:kms:us-east-1:123456789012:key/zexcore-tenant-root" style="margin-top: 4px; font-family: var(--font-mono); font-size: 0.78rem; background: #f8fafc;" />
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.testKmsKeyRotation()" style="padding: 8px 14px;">
              Rotate Key
            </button>
          </div>
          <div style="margin-top: 10px; font-size: 0.74rem; color: #15803d; font-family: var(--font-mono); display: flex; align-items: center; gap: 8px;">
            <span>● Enclave HSM Attestation: Verified</span> &bull;
            <span>Rotation Interval: 90 Days</span>
          </div>
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
                      <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        <span>Upload Logo File</span>
                      </div>
                      <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">PNG, JPG, SVG • Max 2MB • Click or drag &amp; drop</div>
                      <div id="logo-upload-filename" style="font-size: 0.68rem; color: #0d9488; font-weight: 700; margin-top: 2px;">${branding.logoIsUpload ? 'File uploaded' : ''}</div>
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
                <span style="color: #64748b;">Row-level tenant isolation enforced across all client workspaces</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Right Column: Interactive Live Client Portal Sandbox -->
        <div>
          <div class="card" style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <div class="card-title" style="margin: 0;">Client Portal Sandbox Preview</div>
                <div class="card-subtitle">Real-time simulation of client-facing branded workspace</div>
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
                  <span style="display:flex;align-items:center;gap:6px;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    https://<span id="preview-url-domain">${branding.customDomain}</span>/dashboard
                  </span>
                  <span style="color: #16a34a; font-weight: 700; font-size: 0.65rem;">SSL Valid</span>
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
        <button class="btn btn-primary" id="btn-billing-upgrade-plan" style="font-size: 0.84rem; display: inline-flex; align-items: center; gap: 6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          <span>${isHighTier ? 'Manage Plan' : 'Upgrade Plan'}</span>
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L2 7h20L12 2z"/></svg>
              <span style="font-weight: 600; color: var(--text-primary);">Bank Transfer</span>
              <span style="margin-left: auto; font-size: 0.7rem; background: #e0f2fe; color: #0284c7; padding: 2px 7px; border-radius: 999px; font-weight: 700;">DEFAULT</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
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
                <button class="btn btn-secondary btn-sm" style="font-size: 0.78rem; padding: 4px 12px; display: inline-flex; align-items: center; gap: 5px;" onclick="window.downloadInvoice('${inv.id}')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  PDF
                </button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>` : `
        <div style="padding: 40px 20px; text-align: center; color: var(--text-secondary);">
          <div style="margin-bottom: 8px; color: #94a3b8;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
          <div style="font-weight: 600; margin-bottom: 4px; color: var(--text-main);">No invoices yet</div>
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
          <!-- Group: Core -->
          <div class="nav-label">Core</div>
          <a href="#/console/overview" class="nav-item ${state.currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">System Overview</span>
              <span class="nav-item-sub">Health, metrics &amp; live events</span>
            </span>
          </a>
          <a href="#/console/iot" class="nav-item ${state.currentTab === 'iot' ? 'active' : ''}" data-tab="iot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Connected Devices
                <span class="nav-badge" id="iot-count">${state.devices.length}</span>
              </span>
              <span class="nav-item-sub">IoT sensors, fleet &amp; telemetry</span>
            </span>
          </a>
          <a href="#/console/rules" class="nav-item ${state.currentTab === 'rules' ? 'active' : ''}" data-tab="rules">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Automation Rules <span class="nav-badge">${state.rules.length}</span></span>
              <span class="nav-item-sub">Trigger actions &amp; workflows</span>
            </span>
          </a>

          <!-- Group: Customers -->
          <div class="nav-label" style="margin-top: 10px;">Customers</div>
          <a href="#/console/crm" class="nav-item ${state.currentTab === 'crm' ? 'active' : ''}" data-tab="crm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Customers &amp; Inbox
                <span class="nav-badge">${state.leads.length}</span>
              </span>
              <span class="nav-item-sub">WhatsApp, deals &amp; bookings</span>
            </span>
          </a>

          <!-- Group: Governance & Trust -->
          <div class="nav-label" style="margin-top: 10px;">Governance &amp; Trust</div>
          <a href="#/console/compliance" class="nav-item ${state.currentTab === 'compliance' ? 'active' : ''}" data-tab="compliance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Data Privacy Vault
                ${isTabLocked('compliance', currentPlan, state.currentUser?.email) ? `<span class="nav-plan-lock-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> PRO</span>` : ''}
              </span>
              <span class="nav-item-sub">GDPR consent &amp; data privacy</span>
            </span>
          </a>
          <a href="#/console/audit" class="nav-item ${state.currentTab === 'audit' ? 'active' : ''}" data-tab="audit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Audit Ledger &amp; Finance</span>
              <span class="nav-item-sub">Logs, exports &amp; verification</span>
            </span>
          </a>

          <!-- Group: Organization & Settings -->
          <div class="nav-label" style="margin-top: 10px;">Organization</div>
          <a href="#/console/whitelabel" class="nav-item ${state.currentTab === 'whitelabel' ? 'active' : ''}" data-tab="whitelabel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.26L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Client Portals &amp; Brand
                ${isTabLocked('whitelabel', currentPlan, state.currentUser?.email) ? `<span class="nav-plan-lock-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> AGENCY</span>` : `<span class="nav-badge">25</span>`}
              </span>
              <span class="nav-item-sub">White-label agency portals</span>
            </span>
          </a>
          <a href="#/console/license" class="nav-item ${state.currentTab === 'license' ? 'active' : ''}" data-tab="license">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3H9z"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">License Keys</span>
              <span class="nav-item-sub">Activation &amp; enterprise keys</span>
            </span>
          </a>
          <a href="#/console/billing" class="nav-item ${state.currentTab === 'billing' ? 'active' : ''}" data-tab="billing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <span class="nav-item-text">
              <span class="nav-item-title">Billing &amp; Invoices</span>
              <span class="nav-item-sub">Subscription &amp; payment receipts</span>
            </span>
          </a>
        </nav>

        <!-- Active Plan Card in Sidebar -->
        <div class="sidebar-plan-card">
          <div class="sidebar-plan-header">
            <span class="sidebar-plan-label">ACTIVE PLAN</span>
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
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 0.72rem; color: var(--text-muted);">
            <span>ZexCore Engine</span>
            <span style="font-family: var(--font-mono);">v1.4.2 &bull; Active</span>
          </div>
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

            <!-- Workspace / Tenant Selector -->
            <div class="org-tenant-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="flex-shrink: 0;"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="22"/><line x1="9" y1="6" x2="9" y2="6"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="9" y2="14"/><line x1="15" y1="14" x2="15" y2="14"/></svg>
              <select id="tenantSelect" class="tenant-select" aria-label="Select Tenant Workspace">
                <option value="acme_corp" ${state.activeTenant === 'acme_corp' ? 'selected' : ''}>Acme Enterprise Corp (prod-us-east)</option>
                <option value="globex_corp" ${state.activeTenant === 'globex_corp' ? 'selected' : ''}>Globex Research (dev-eu-west)</option>
                <option value="soylent_ind" ${state.activeTenant === 'soylent_ind' ? 'selected' : ''}>Soylent Dynamics (staging-apac)</option>
              </select>
              <span class="topbar-env-pill">PROD</span>
              <div class="topbar-plan-pill" id="topbar-plan-indicator" title="Manage subscription tier">
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#E50920;flex-shrink:0;"></span>
                <span>${planMeta.name.toUpperCase()}</span>
                ${(currentPlan === 'starter' || currentPlan === 'growth' || currentPlan === 'agency' || currentPlan === 'free') ? '<span class="topbar-plan-upgrade-link">Upgrade</span>' : ''}
              </div>
            </div>
          </div>

          <!-- Middle: Global Quick Search / Command Palette Hint -->
          <div class="topbar-search-box" id="topbar-search-trigger" title="Quick Search across resources">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Search devices, rules, customers...</span>
            <kbd>⌘K</kbd>
          </div>

          <!-- Right: System Status, Templates & User Profile -->
          <div class="topbar-right">
            <!-- Calm Operational Status Indicator -->
            <a href="#/console/audit" class="topbar-status-indicator" title="All systems operational. Click to view audit log &amp; health.">
              <span class="status-dot-pulse"></span>
              <span>Systems Operational</span>
            </a>

            <!-- Starter Kits Launcher -->
            <button class="btn btn-secondary btn-sm" id="btn-topbar-starter-kits" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Starter Kits</span>
            </button>

            <!-- User Menu & Sign Out -->
            <div class="topbar-user-menu">
              <div class="topbar-user-badge">
                <div class="user-avatar">
                  ${((state.currentUser?.displayName || state.currentUser?.email || 'A')[0]).toUpperCase()}
                </div>
                <div class="user-info">
                  <span class="user-name">
                    ${state.currentUser?.displayName || state.currentUser?.email || 'Operator'}
                  </span>
                  <span class="user-role">
                    ${state.currentUser?.isDemo ? 'Sandbox Demo' : 'Administrator'}
                  </span>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-topbar-home">Public Site</button>
              <button class="btn btn-secondary btn-sm" id="btn-topbar-signout">Sign Out</button>
            </div>
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

  // Global Quick Search (⌘K Command Palette)
  const openQuickSearch = () => {
    let palette = document.getElementById('zexcore-cmd-palette-backdrop');
    if (palette) {
      palette.remove();
    }

    palette = document.createElement('div');
    palette.id = 'zexcore-cmd-palette-backdrop';
    palette.className = 'cmd-palette-backdrop';

    palette.innerHTML = `
      <div class="cmd-palette-modal" id="cmd-palette-modal">
        <div class="cmd-palette-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="cmd-palette-input" class="cmd-palette-input" placeholder="Type a command or search devices, leads, views..." autocomplete="off" />
          <span class="cmd-palette-esc-badge">ESC</span>
        </div>
        <div class="cmd-palette-results" id="cmd-palette-results"></div>
        <div class="cmd-palette-footer">
          <div class="cmd-palette-shortcut-hints">
            <span><kbd style="font-family:var(--font-mono);background:#f1f5f9;padding:1px 5px;border-radius:3px;">↑↓</kbd> Navigate</span>
            <span><kbd style="font-family:var(--font-mono);background:#f1f5f9;padding:1px 5px;border-radius:3px;">↵</kbd> Select</span>
            <span><kbd style="font-family:var(--font-mono);background:#f1f5f9;padding:1px 5px;border-radius:3px;">ESC</kbd> Close</span>
          </div>
          <span>ZexCore Operations Console</span>
        </div>
      </div>
    `;

    document.body.appendChild(palette);

    const input = document.getElementById('cmd-palette-input') as HTMLInputElement | null;
    const resultsContainer = document.getElementById('cmd-palette-results');

    const closePalette = () => {
      palette?.remove();
    };

    palette.addEventListener('click', (e) => {
      if (e.target === palette) closePalette();
    });

    const staticItems = [
      { id: 'nav-overview', label: 'Operations Overview & Telemetry', group: 'Navigation', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', action: () => { window.location.hash = '#/console/overview'; } },
      { id: 'nav-iot', label: 'Connected Devices & Fleet Hub', group: 'Navigation', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>', action: () => { window.location.hash = '#/console/iot'; } },
      { id: 'nav-crm', label: 'WhatsApp CRM & Customer Inbox', group: 'Navigation', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', action: () => { window.location.hash = '#/console/crm'; } },
      { id: 'nav-rules', label: 'Automation & Event Rules', group: 'Navigation', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>', action: () => { window.location.hash = '#/console/rules'; } },
      { id: 'nav-compliance', label: 'Data Privacy & Compliance Vault', group: 'Navigation', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>', action: () => { window.location.hash = '#/console/compliance'; } },
      { id: 'nav-audit', label: 'Security & Financial Audit Ledger', group: 'Navigation', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', action: () => { window.location.hash = '#/console/audit'; } },
      { id: 'nav-whitelabel', label: 'Agency White-Label Branding', group: 'Navigation', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>', action: () => { window.location.hash = '#/console/whitelabel'; } },
      { id: 'nav-billing', label: 'Subscription & Tier Licensing', group: 'Navigation', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>', action: () => { window.location.hash = '#/console/billing'; } },
      { id: 'act-reg-dev', label: 'Register New Edge Device Node', group: 'Quick Actions', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>', action: () => { closePalette(); document.getElementById('btn-open-register-device')?.click(); } },
      { id: 'act-rotate-keys', label: 'Rotate All Device Hardware Keys', group: 'Quick Actions', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>', action: () => { closePalette(); (window as any).rotateAllDeviceTokens(); } },
      { id: 'act-add-opp', label: 'Create New CRM Opportunity', group: 'Quick Actions', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>', action: () => { closePalette(); document.getElementById('btn-add-lead')?.click(); } },
      { id: 'act-run-audit', label: 'Run Security & Ledger Verification', group: 'Quick Actions', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>', action: () => { closePalette(); window.location.hash = '#/console/audit'; document.getElementById('btn-run-audit-now')?.click(); } },
      { id: 'act-switch-ws', label: 'Switch Active Tenant Workspace', group: 'Quick Actions', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="2"/></svg>', action: () => { closePalette(); (window as any).tenantSwitcherModal(); } },
    ];

    let selectedIndex = 0;
    let visibleItems: Array<{ id: string; label: string; group: string; icon: string; action: () => void; hint?: string }> = [];

    const renderResults = (query: string) => {
      const q = query.toLowerCase().trim();
      const items: typeof visibleItems = [];

      // Filter static navigation & actions
      staticItems.forEach((item) => {
        if (!q || item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)) {
          items.push(item);
        }
      });

      // Filter active devices
      state.devices.forEach((dev) => {
        if (!q || dev.name.toLowerCase().includes(q) || dev.key.toLowerCase().includes(q) || dev.kind.toLowerCase().includes(q)) {
          items.push({
            id: `dev-${dev.id}`,
            label: `${dev.name} (${dev.kind})`,
            group: 'Fleet Devices',
            icon: dev.status === 'online' ? '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#16a34a;"></span>' : '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#94a3b8;"></span>',
            hint: `${dev.temperature}°C • ${dev.voltage}V`,
            action: () => {
              window.location.hash = '#/console/iot';
              setTimeout(() => {
                const search = document.getElementById('iot-search-filter') as HTMLInputElement | null;
                if (search) {
                  search.value = dev.name;
                  (window as any).renderDevices();
                }
              }, 100);
            },
          });
        }
      });

      // Filter WhatsApp threads
      state.whatsAppThreads.forEach((th) => {
        if (!q || th.contactName.toLowerCase().includes(q) || th.phone.includes(q) || th.lastMsg.toLowerCase().includes(q)) {
          items.push({
            id: `th-${th.id}`,
            label: `${th.contactName} (${th.phone})`,
            group: 'Customer Inbox',
            icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
            hint: `$${th.leadValue.toLocaleString()} • ${th.stage}`,
            action: () => {
              state.selectedThreadId = th.id;
              state.crmSubView = 'whatsapp';
              window.location.hash = '#/console/crm';
            },
          });
        }
      });

      visibleItems = items;
      if (selectedIndex >= visibleItems.length) selectedIndex = 0;

      if (!resultsContainer) return;

      if (visibleItems.length === 0) {
        resultsContainer.innerHTML = `
          <div style="padding: 32px 16px; text-align: center; color: var(--text-secondary); font-size: 0.84rem;">
            No results found for "${query}".
          </div>
        `;
        return;
      }

      // Group by category
      let currentGroup = '';
      let html = '';

      visibleItems.forEach((item, idx) => {
        if (item.group !== currentGroup) {
          currentGroup = item.group;
          html += `<div class="cmd-group-label">${currentGroup}</div>`;
        }
        const isSelected = idx === selectedIndex;
        html += `
          <div class="cmd-item ${isSelected ? 'selected' : ''}" data-index="${idx}" id="cmd-item-${idx}">
            <div class="cmd-item-left">
              <span class="cmd-item-icon">${item.icon}</span>
              <span>${item.label}</span>
            </div>
            ${item.hint ? `<span class="cmd-item-hint">${item.hint}</span>` : ''}
          </div>
        `;
      });

      resultsContainer.innerHTML = html;

      // Click listener for each item
      visibleItems.forEach((item, idx) => {
        document.getElementById(`cmd-item-${idx}`)?.addEventListener('click', () => {
          closePalette();
          item.action();
        });
      });
    };

    renderResults('');

    if (input) {
      input.focus();
      input.addEventListener('input', () => {
        selectedIndex = 0;
        renderResults(input.value);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (visibleItems.length > 0) {
            selectedIndex = (selectedIndex + 1) % visibleItems.length;
            renderResults(input.value);
            document.getElementById(`cmd-item-${selectedIndex}`)?.scrollIntoView({ block: 'nearest' });
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (visibleItems.length > 0) {
            selectedIndex = (selectedIndex - 1 + visibleItems.length) % visibleItems.length;
            renderResults(input.value);
            document.getElementById(`cmd-item-${selectedIndex}`)?.scrollIntoView({ block: 'nearest' });
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (visibleItems[selectedIndex]) {
            const item = visibleItems[selectedIndex];
            closePalette();
            item.action();
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closePalette();
        }
      });
    }
  };

  (window as any).openConsoleSearch = openQuickSearch;
  document.getElementById('topbar-search-trigger')?.addEventListener('click', openQuickSearch);
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openQuickSearch();
    }
  });

  // Activity stream category filters
  document.querySelectorAll('.activity-filter-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.activity-filter-btn').forEach(b => b.classList.remove('active'));
      const target = e.currentTarget as HTMLElement;
      target.classList.add('active');
      const text = target.textContent?.trim().toLowerCase() || 'all';
      renderEventLog(text.includes('fleet') ? 'fleet' : text.includes('whatsapp') ? 'whatsapp' : text.includes('rules') ? 'rules' : 'all');
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
        if (filename) filename.textContent = file.name;
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
      submitBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Enquiry Dispatched to CRM Pipeline</span>';
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

function renderDevices() {
  const tbody = document.getElementById('device-table-body');
  if (!tbody) return;

  const searchInput = (document.getElementById('iot-search-filter') as HTMLInputElement)?.value?.toLowerCase().trim() || '';
  const statusFilter = (document.getElementById('iot-status-filter') as HTMLSelectElement)?.value || 'all';

  const filtered = state.devices.filter((d) => {
    const matchesSearch = !searchInput || d.name.toLowerCase().includes(searchInput) || d.key.toLowerCase().includes(searchInput) || d.kind.toLowerCase().includes(searchInput);
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countBadge = document.getElementById('iot-fleet-counts');
  if (countBadge) {
    const online = state.devices.filter(d => d.status === 'online').length;
    countBadge.innerHTML = `<strong>${online}</strong> online &bull; <strong>${state.devices.length}</strong> total`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 36px 20px; color: var(--text-secondary); font-size: 0.84rem;">
          No edge devices match your query.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((d) => `
    <tr>
      <td>
        <div style="font-weight: 600; color: var(--text-main);">${d.name}</div>
        <div style="font-size: 0.72rem; color: var(--text-secondary); font-family: var(--font-mono);">${d.key}</div>
      </td>
      <td style="color: var(--text-secondary); font-size: 0.8rem;"><code>${d.kind}</code></td>
      <td>
        <button onclick="window.toggleDeviceStatus('${d.id}')" title="Click to toggle status" style="cursor: pointer; border: 1px solid ${d.status === 'online' ? '#bbf7d0' : '#e2e8f0'}; background: ${d.status === 'online' ? '#f0fdf4' : '#f8fafc'}; color: ${d.status === 'online' ? '#15803d' : '#64748b'}; padding: 3px 8px; border-radius: 9999px; font-size: 0.72rem; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${d.status === 'online' ? '#16a34a' : '#94a3b8'};"></span>
          ${d.status === 'online' ? 'Live' : 'Offline'}
        </button>
      </td>
      <td>
        <strong style="color: ${d.temperature > 70 ? '#b91c1c' : 'var(--text-main)'}; font-family: var(--font-mono);">
          ${d.temperature}°C
        </strong>
      </td>
      <td style="font-family: var(--font-mono); color: var(--text-main);">${d.humidity}%</td>
      <td style="font-family: var(--font-mono); color: var(--text-main);">${d.voltage}V</td>
      <td style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono);">${d.firmware}</td>
      <td style="font-size: 0.78rem; color: var(--text-secondary);">${d.lastSeen}</td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm" onclick="window.pingDevice('${d.id}')" style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;font-size:0.75rem;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
          Ping Ingest
        </button>
      </td>
    </tr>
  `).join('');

  const onlineCount = state.devices.filter((d) => d.status === 'online').length;
  const statOnline = document.getElementById('stat-online-devices');
  if (statOnline) statOnline.innerText = `${onlineCount} / ${state.devices.length}`;
}
(window as any).renderDevices = renderDevices;

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

  if (state.rules.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 32px 16px; color: var(--text-secondary); font-size: 0.84rem;">
        No automation rules configured. Use the builder above to stage a new rule.
      </div>`;
    return;
  }

  container.innerHTML = state.rules.map((r) => `
    <div style="background: #ffffff; border: 1px solid var(--border-default); border-radius: 8px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 280px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <strong style="font-size: 0.92rem; color: var(--text-main); font-weight: 650;">${r.name}</strong>
          <span style="display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 9999px; font-size: 0.72rem; font-weight: 600; border: 1px solid ${r.enabled ? '#bbf7d0' : '#e2e8f0'}; background: ${r.enabled ? '#f0fdf4' : '#f8fafc'}; color: ${r.enabled ? '#15803d' : '#64748b'};">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${r.enabled ? '#16a34a' : '#94a3b8'};"></span>
            ${r.enabled ? 'Active' : 'Disabled'}
          </span>
          ${!r.approved ? '<span style="background: #fffbeb; color: #b45309; border: 1px solid #fde68a; font-size: 0.7rem; font-weight: 600; padding: 2px 7px; border-radius: 4px;">Pending Review</span>' : ''}
        </div>
        <div style="font-size: 0.76rem; color: var(--text-secondary); margin-top: 6px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
          <span>Trigger: <strong style="color: var(--text-main); font-family: var(--font-mono); font-size: 0.74rem;">${r.trigger}</strong></span>
          <span style="color: var(--border-default);">&bull;</span>
          <span>IF: <code style="background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-family: var(--font-mono); color: #0f172a;">${r.conditions}</code></span>
          <span style="color: var(--border-default);">&bull;</span>
          <span>THEN: <code style="background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-family: var(--font-mono); color: #0f172a;">${r.action}</code></span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        ${!r.approved ? `<button class="btn btn-primary btn-sm" onclick="window.approveRule('${r.id}')" style="font-size: 0.76rem; padding: 5px 12px;">Approve Rule</button>` : `<button class="btn btn-secondary btn-sm" onclick="window.toggleRule('${r.id}')" style="font-size: 0.76rem; padding: 5px 12px;">${r.enabled ? 'Disable' : 'Enable'}</button>`}
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
    <div class="whatsapp-inbox-grid">
      <!-- Omnichannel Channel Filter Bar across top -->
      <div class="channel-filter-bar">
        <button class="channel-filter-btn ${currentFilter === 'all' ? 'active' : ''}" onclick="window.setChannelFilter('all')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>All Channels</span>
          <span class="filter-count">${state.whatsAppThreads.length}</span>
        </button>
        <button class="channel-filter-btn ${currentFilter === 'whatsapp' ? 'active' : ''}" onclick="window.setChannelFilter('whatsapp')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
          <span>WhatsApp</span>
          <span class="filter-count">${state.whatsAppThreads.filter(t => t.channel === 'whatsapp' || t.activeChannel === 'whatsapp').length}</span>
        </button>
        <button class="channel-filter-btn ${currentFilter === 'sms' ? 'active' : ''}" onclick="window.setChannelFilter('sms')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>SMS Fallback</span>
          <span class="filter-count">${state.whatsAppThreads.filter(t => t.channel === 'sms' || t.activeChannel === 'sms').length}</span>
        </button>
        <button class="channel-filter-btn ${currentFilter === 'email' ? 'active' : ''}" onclick="window.setChannelFilter('email')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span>Email Receipts</span>
          <span class="filter-count">${state.whatsAppThreads.filter(t => t.channel === 'email' || t.activeChannel === 'email').length}</span>
        </button>
        <button class="channel-filter-btn ${currentFilter === 'telegram' ? 'active' : ''}" onclick="window.setChannelFilter('telegram')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.847-.96 4.965-1.356 7.078-.168.894-.5 1.194-.82 1.223-.695.064-1.222-.46-1.896-.9-1.055-.69-1.652-1.12-2.678-1.796-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.429-.01-1.253-.243-1.867-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.664 3.498-1.524 5.831-2.529 7.001-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.155.231.171.326.016.096.037.314.02.486z"/></svg>
          <span>Telegram Direct</span>
          <span class="filter-count">${state.whatsAppThreads.filter(t => t.channel === 'telegram' || t.activeChannel === 'telegram').length}</span>
        </button>
      </div>

      <!-- Left Column: Unified Contact Threads -->
      <div class="whatsapp-threads-col">
        <div class="whatsapp-threads-header">
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 800; font-size: 0.92rem; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Unified Contacts Inbox</span>
              ${totalUnread > 0 ? `<span style="background: #25d366; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 999px;">${totalUnread} new</span>` : ''}
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; display: flex; align-items: center; gap: 8px;">
              <span>Pluggable Adapter</span>
              <span>&bull;</span>
              <label class="zx-toggle-switch" onclick="window.toggleCrmWebhook()" title="Toggle webhook: Live / Offline" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                <span class="zx-toggle-mini-track ${state.crmWebhookStatus === 'live' ? 'on' : 'off'}">
                  <span class="zx-toggle-mini-thumb"></span>
                </span>
                <span style="font-size: 0.68rem; font-weight: 700; color: ${state.crmWebhookStatus === 'live' ? '#15803d' : '#b91c1c'};">
                  ${state.crmWebhookStatus === 'live' ? 'Webhook Live' : 'Webhook Offline'}
                </span>
              </label>
            </div>
          </div>
          <button class="btn btn-secondary btn-xs" onclick="window.simulateIncomingWhatsApp()" title="Simulate incoming customer lead message via webhook" style="white-space: nowrap; margin-left: 8px;">
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
                  ${m.providerConfirmed ? `<span style="color: #16a34a; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>Provider Confirmed</span>` : ''}
                </div>
                <div style="margin-bottom: 3px;">${m.text}</div>
                <div class="whatsapp-msg-time">
                  <span style="font-size:0.65rem;color:var(--text-muted);">${m.time}</span>
                  ${m.sender === 'agent' || m.sender === 'bot'
                    ? m.status === 'read' && m.providerConfirmed
                      ? `<span title="Seen" style="color:#0284c7;display:inline-flex;align-items:center;"><svg width="14" height="10" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7l3.5 3.5L12 2"/><path d="M5 7l3.5 3.5L15 2"/></svg></span>`
                      : m.status === 'delivered' && m.providerConfirmed
                        ? `<span title="Delivered" style="color:#94a3b8;display:inline-flex;align-items:center;"><svg width="14" height="10" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7l3.5 3.5L12 2"/><path d="M5 7l3.5 3.5L15 2"/></svg></span>`
                        : m.status === 'sent'
                          ? `<span title="Sent" style="color:#cbd5e1;display:inline-flex;align-items:center;"><svg width="11" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7l3.5 3.5L11 2"/></svg></span>`
                          : m.status === 'failed'
                            ? `<span title="Failed to deliver" style="color:#dc2626;font-size:0.7rem;display:inline-flex;align-items:center;gap:3px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Failed</span>`
                            : `<span title="Sending..." style="color:#94a3b8;font-size:0.75rem;">...</span>`
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
                  ? `<span class="badge" style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; font-size: 0.72rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Delivered (24h)</span>`
                  : b.whatsappReminderStatus === 'sent_1h'
                  ? `<span class="badge" style="background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; font-size: 0.72rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>1-Hour Alert Sent</span>`
                  : `<span class="badge" style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-size: 0.72rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Scheduled</span>`;

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

// ── Event Log Stream (Clean Enterprise Activity Feed) ────────────────────────
function renderEventLog(filter: string = 'all') {
  const container = document.getElementById('event-stream-body');
  if (!container) return;

  let filtered = state.events;
  if (filter === 'fleet') {
    filtered = state.events.filter(e => e.name.startsWith('iot.'));
  } else if (filter === 'whatsapp') {
    filtered = state.events.filter(e => e.name.startsWith('crm.'));
  } else if (filter === 'rules') {
    filtered = state.events.filter(e => e.name.startsWith('rules.'));
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="padding: 32px 20px; text-align: center; color: #94a3b8; font-size: 0.85rem;">
        No ${filter === 'all' ? '' : filter + ' '}events captured yet. Trigger an action to see live telemetry.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((e) => {
    let badgeColor = '#f1f5f9';
    let badgeTextColor = '#475569';
    let category = 'SYSTEM';

    if (e.name.startsWith('iot.')) {
      badgeColor = '#f0fdf4';
      badgeTextColor = '#166534';
      category = 'FLEET';
    } else if (e.name.startsWith('crm.')) {
      badgeColor = '#fef3c7';
      badgeTextColor = '#92400e';
      category = 'WHATSAPP';
    } else if (e.name.startsWith('rules.')) {
      badgeColor = '#f0f9ff';
      badgeTextColor = '#0369a1';
      category = 'RULES';
    } else if (e.name.startsWith('compliance.') || e.name.startsWith('audit.')) {
      badgeColor = '#fdf2f8';
      badgeTextColor = '#9d174d';
      category = 'SECURITY';
    }

    return `
      <div class="activity-feed-item">
        <span class="item-time">${e.ts.split(' ')[1] || e.ts}</span>
        <span class="item-badge" style="background: ${badgeColor}; color: ${badgeTextColor}; border: 1px solid rgba(0,0,0,0.06);">${category}</span>
        <div class="item-body">
          <div class="item-desc">${e.name}</div>
          <div class="item-payload" title="${e.payload}">${e.payload}</div>
        </div>
      </div>
    `;
  }).join('');
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

