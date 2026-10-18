/**
 * ZexCore "Great First Ten Minutes" Onboarding Wizard & Sample Site Generator
 * Allows a business to answer one question ("What do you do?") and get a working,
 * good-looking niche site, sample listing, inquiry form, and live automated follow-up.
 */

export interface IndustryStarter {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  companyDefault: string;
  listingTitle: string;
  listingPrice: string;
  listingDesc: string;
  listingBadges: string[];
  followUpMsg: string;
  devices: Array<{
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
  }>;
  rules: Array<{
    id: string;
    name: string;
    trigger: string;
    conditions: string;
    action: string;
    approved: boolean;
    enabled: boolean;
  }>;
  leads: Array<{
    id: string;
    title: string;
    company: string;
    value: number;
    currency: string;
    stage: string;
  }>;
}

export function getIndustrySvgIcon(verticalId: string, size = 22, strokeColor = '#E50920'): string {
  switch (verticalId) {
    case 'logistics':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
    case 'industrial':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>`;
    case 'crm':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
    case 'services':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
    case 'fintech_agency':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`;
    case 'clinic_booking':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`;
  }
}

export const INDUSTRY_STARTERS: Record<string, IndustryStarter> = {
  logistics: {
    id: 'logistics',
    name: 'Cold Chain Logistics & Fleet',
    icon: 'logistics',
    tagline: 'Precision refrigerated freight & telemetry tracking',
    companyDefault: 'Polaris Fleet Logistics',
    listingTitle: 'Cold Storage Reefer Unit 40ft (Tri-Temp)',
    listingPrice: '$1,250 / haul',
    listingDesc: 'Sub-zero pharmaceutical and food distribution trailer equipped with real-time ZexCore IoT probe telemetry and automated thermal alerts.',
    listingBadges: ['ISO 9001 Certified', 'Continuous Telemetry', '-25°C to +15°C Range'],
    followUpMsg: 'Your refrigerated freight enquiry has been routed to our Fleet Dispatcher. A real-time rate quote has been emailed and dispatched via WhatsApp.',
    devices: [
      { id: 'dev-pol-1', name: 'Reefer Unit Alpha-01 Thermal Probe', key: 'iot_reefer_alpha_01', kind: 'chiller_probe', status: 'online', temperature: -18.2, humidity: 82, voltage: 24.1, firmware: 'v2.4.1', lastSeen: 'Just now' },
      { id: 'dev-pol-2', name: 'GPS & Telemetry Gateway Hub #402', key: 'iot_gps_gw_402', kind: 'network_gateway', status: 'online', temperature: 19.5, humidity: 40, voltage: 12.6, firmware: 'v2.3.0', lastSeen: '1m ago' },
      { id: 'dev-pol-3', name: 'Depot Cold Storage Vault B', key: 'iot_vault_b', kind: 'temperature_probe', status: 'online', temperature: -22.0, humidity: 88, voltage: 220.0, firmware: 'v1.8.4', lastSeen: 'Just now' },
    ],
    rules: [
      { id: 'rule-pol-1', name: 'Thermal Breach Incident (> -10°C in Transit)', trigger: 'iot.telemetry.received', conditions: 'metrics.temperature > -10.0', action: 'emit: logistics.alert.thermal_breach', approved: true, enabled: true },
      { id: 'rule-pol-2', name: 'Automatic WhatsApp Dispatch on New Freight Enquiry', trigger: 'crm.lead.created', conditions: 'lead.value >= 1000', action: 'emit: dispatch.whatsapp.driver_assigned', approved: true, enabled: true },
    ],
    leads: [
      { id: 'lead-pol-1', title: 'Pharma Cold Chain Monthly Contract', company: 'BioMed Logistics', value: 48000, currency: 'USD', stage: 'Negotiation' },
      { id: 'lead-pol-2', title: 'Fresh Produce Inter-State Transport', company: 'Pacific Grocers', value: 16500, currency: 'USD', stage: 'Qualified' },
    ],
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial Machinery & Edge IoT',
    icon: 'industrial',
    tagline: 'Predictive maintenance & edge vibration telemetry',
    companyDefault: 'Vanguard Industrial Automation',
    listingTitle: '5-Axis CNC Precision Edge Telemetry Station',
    listingPrice: '$3,800 / mo',
    listingDesc: 'Industrial edge control cluster with deterministic sub-millisecond vibration analysis, power factor monitoring, and RLS tenant safety.',
    listingBadges: ['OPC-UA Protocol', 'IP67 Ruggedized', '<1ms AST Rules'],
    followUpMsg: 'Thank you for your machinery inquiry. Vanguard engineering has verified equipment capacity and scheduled an edge telemetry demo.',
    devices: [
      { id: 'dev-ind-1', name: 'CNC Spindle High-Frequency Vibration Node', key: 'iot_spindle_vib_01', kind: 'vibration_node', status: 'online', temperature: 46.2, humidity: 32, voltage: 24.0, firmware: 'v3.1.0', lastSeen: 'Just now' },
      { id: 'dev-ind-2', name: 'Hydraulic Pressure Transducer #12', key: 'iot_hydraulic_p12', kind: 'pressure_probe', status: 'online', temperature: 52.1, humidity: 28, voltage: 24.0, firmware: 'v2.9.2', lastSeen: '2m ago' },
    ],
    rules: [
      { id: 'rule-ind-1', name: 'Critical Spindle Bearing Over-Vibration Warning', trigger: 'iot.telemetry.received', conditions: 'metrics.vibration > 4.5', action: 'emit: maintenance.emergency_shutdown', approved: true, enabled: true },
    ],
    leads: [
      { id: 'lead-ind-1', title: 'Automotive Factory Floor Retooling', company: 'Apex Motors Ltd', value: 140000, currency: 'USD', stage: 'Proposal' },
    ],
  },
  crm: {
    id: 'crm',
    name: 'B2B Tech & Advisory Services',
    icon: 'crm',
    tagline: 'High-ticket pipeline, SLA escalation & contracts',
    companyDefault: 'Apex Cloud Advisory Group',
    listingTitle: 'Enterprise Cloud Modernization & Sovereignty Sprint',
    listingPrice: '$12,500 / sprint',
    listingDesc: 'Turnkey architectural overhaul: PostgreSQL RLS tenant isolation, cryptographic vault integration, and deterministic business rules.',
    listingBadges: ['SOC2 & HIPAA Compliant', 'Zero Data Leakage', 'Dedicated Architect'],
    followUpMsg: 'Enquiry confirmed. Your dedicated Principal Solutions Architect has been assigned and an introductory strategy briefing has been sent.',
    devices: [
      { id: 'dev-crm-1', name: 'Primary Cloud Cluster Gateway', key: 'gw_cloud_us_east', kind: 'network_gateway', status: 'online', temperature: 28.0, humidity: 45, voltage: 12.0, firmware: 'v4.0.0', lastSeen: 'Just now' },
    ],
    rules: [
      { id: 'rule-crm-1', name: 'VIP Enterprise Lead Assignment (> $25k)', trigger: 'crm.lead.created', conditions: 'lead.value >= 25000', action: 'emit: crm.vip_lead.assigned', approved: true, enabled: true },
    ],
    leads: [
      { id: 'lead-crm-1', title: 'National Bank Core Banking Isolation', company: 'First Sovereign Bank', value: 250000, currency: 'USD', stage: 'Proposal' },
      { id: 'lead-crm-2', title: 'Fintech Identity & GDPR Vault', company: 'PayMatrix Europe', value: 85000, currency: 'USD', stage: 'Negotiation' },
    ],
  },
  services: {
    id: 'services',
    name: 'Local Services & Equipment Rentals',
    icon: 'services',
    tagline: 'Instant inquiry capture, booking & WhatsApp response',
    companyDefault: 'Evergreen Commercial Services',
    listingTitle: 'Commercial HVAC Preventive Maintenance Plan',
    listingPrice: '$299 / unit / mo',
    listingDesc: 'Quarterly certified inspections, 24/7 priority emergency dispatch, automated IoT filter telemetry, and 100% uptime SLA.',
    listingBadges: ['24/7 Emergency Dispatch', 'Licensed Master Techs', 'WhatsApp Alerts'],
    followUpMsg: 'We received your booking inquiry! A technician in your zone has accepted the dispatch notification and will text you within 15 minutes.',
    devices: [
      { id: 'dev-srv-1', name: 'Smart Rooftop Chiller Monitor Node #08', key: 'iot_hvac_node_08', kind: 'temperature_probe', status: 'online', temperature: 21.4, humidity: 48, voltage: 120.0, firmware: 'v1.4.1', lastSeen: 'Just now' },
    ],
    rules: [
      { id: 'rule-srv-1', name: 'Instant WhatsApp Auto-Reply on New Inquiry', trigger: 'crm.lead.created', conditions: 'lead.stage == "New"', action: 'emit: notify.whatsapp.customer_ack', approved: true, enabled: true },
    ],
    leads: [
      { id: 'lead-srv-1', title: 'Downtown Corporate Tower HVAC Contract', company: 'Metro Commercial Properties', value: 36000, currency: 'USD', stage: 'Qualified' },
    ],
  },
  fintech_agency: {
    id: 'fintech_agency',
    name: 'Fintech & Agency Commerce',
    icon: 'fintech_agency',
    tagline: 'Paystack, Flutterwave & WhatsApp agency onboarding',
    companyDefault: 'AfriPay Digital Agency',
    listingTitle: 'Turnkey Merchant Gateway & WhatsApp Checkout',
    listingPrice: '₦150,000 / mo',
    listingDesc: 'Omnichannel merchant payments across Paystack, Flutterwave, and Stripe with instant WhatsApp receipts and abandoned-cart recovery.',
    listingBadges: ['Paystack & Flutterwave', 'WhatsApp Invoicing', 'Instant Settlement'],
    followUpMsg: 'Welcome to AfriPay! Your merchant account setup has been initiated. A WhatsApp onboarding link has been dispatched to your mobile phone.',
    devices: [
      { id: 'dev-fin-1', name: 'Virtual Terminal Edge POS Node', key: 'pos_terminal_lagos_01', kind: 'network_gateway', status: 'online', temperature: 26.5, humidity: 42, voltage: 5.0, firmware: 'v1.8.0', lastSeen: 'Just now' },
    ],
    rules: [
      { id: 'rule-fin-1', name: 'Auto-Send WhatsApp Receipt on Paystack / Flutterwave Success', trigger: 'commerce.order.paid', conditions: 'payment.status == "success"', action: 'emit: whatsapp.receipt.dispatched', approved: true, enabled: true },
      { id: 'rule-fin-2', name: 'Instant VIP Merchant Escalation (> ₦1,000,000)', trigger: 'crm.lead.created', conditions: 'lead.value >= 1000000', action: 'emit: crm.vip_merchant.alert', approved: true, enabled: true },
    ],
    leads: [
      { id: 'lead-fin-1', title: 'Lagos E-Commerce Superstore Checkout', company: 'Zenith Retail Outlets', value: 2500000, currency: 'NGN', stage: 'Negotiation' },
      { id: 'lead-fin-2', title: 'Agency White-Label Reseller Portal', company: 'Prime Digital Studios', value: 850000, currency: 'NGN', stage: 'Qualified' },
    ],
  },
  clinic_booking: {
    id: 'clinic_booking',
    name: 'Healthcare & Clinic Booking',
    icon: 'clinic_booking',
    tagline: 'Patient scheduling with automated WhatsApp reminders that cut no-shows',
    companyDefault: 'Apex Specialist Clinic',
    listingTitle: 'Specialist Medical Consultation & Diagnostics',
    listingPrice: '$150 / session',
    listingDesc: 'Seamless patient booking, multi-staff calendar sync, deposits to hold slots, and automated 24h/1h WhatsApp reminders cutting patient no-shows by 40%.',
    listingBadges: ['WhatsApp Reminders', 'Zero No-Shows', 'HIPAA/GDPR Vault'],
    followUpMsg: 'Your appointment request has been confirmed! An automated WhatsApp calendar invitation and preparation checklist has been sent to your phone.',
    devices: [
      { id: 'dev-cln-1', name: 'Vaccine Storage Reefer Telemetry Probe', key: 'iot_vaccine_chiller_01', kind: 'chiller_probe', status: 'online', temperature: 4.1, humidity: 55, voltage: 220.0, firmware: 'v2.0.1', lastSeen: 'Just now' },
    ],
    rules: [
      { id: 'rule-cln-1', name: 'Automated WhatsApp 24h & 1h Appointment Reminders', trigger: 'booking.appointment.scheduled', conditions: 'appointment.status == "confirmed"', action: 'emit: whatsapp.reminder.scheduled', approved: true, enabled: true },
    ],
    leads: [
      { id: 'lead-cln-1', title: 'Corporate Annual Employee Health Screening', company: 'Standard Capital Corp', value: 18500, currency: 'USD', stage: 'Proposal' },
    ],
  },
};

export interface OnboardingState {
  verticalKey: string | null;
  companyName: string;
  listingTitle: string;
  listingPrice: string;
  checklist: {
    selectedField: boolean;
    namedCompany: boolean;
    editedListing: boolean;
    testedEnquiry: boolean;
    sharedLink: boolean;
  };
}

const STORAGE_KEY = 'zexcore_onboarding_state';

export function loadOnboardingState(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    verticalKey: null,
    companyName: 'My Enterprise',
    listingTitle: 'Premium Commercial Service',
    listingPrice: '$999 / mo',
    checklist: {
      selectedField: false,
      namedCompany: false,
      editedListing: false,
      testedEnquiry: false,
      sharedLink: false,
    },
  };
}

export function saveOnboardingState(state: OnboardingState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/**
 * Render the Onboarding Overview Strip & Sample Site Customizer
 */
export function renderOnboardingBanner(state: OnboardingState): string {
  const isStarted = Boolean(state.verticalKey && INDUSTRY_STARTERS[state.verticalKey]);
  const activePreset = isStarted ? INDUSTRY_STARTERS[state.verticalKey!] : null;

  const totalSteps = 5;
  const completedSteps = Object.values(state.checklist).filter(Boolean).length;
  const progressPct = Math.round((completedSteps / totalSteps) * 100);

  if (!isStarted) {
    return `
      <div class="onboarding-welcome-card" style="background: linear-gradient(135deg, #fff 0%, #fff9f9 100%); border: 2px solid #fecdd3; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 16px rgba(229,9,32,0.06);">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="background: #e50920; color: #fff; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.05em;">FIRST 10 MINUTES SETUP</span>
              <span style="font-size: 0.8rem; color: #64748b;">Answer 1 question to configure your field instantly</span>
            </div>
            <h3 style="font-size: 1.4rem; color: #17191d; margin: 0 0 6px; letter-spacing: -0.03em;">What does your business do?</h3>
            <p style="color: #64748b; font-size: 0.88rem; margin: 0; max-width: 640px; line-height: 1.5;">
              Pick your industry niche below. ZexCore will immediately set up a working sample site, an enquiry form, realistic IoT/telemetry nodes, and automated follow-ups tailored for you.
            </p>
          </div>
        </div>

        <div class="onboarding-industry-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 20px;">
          ${Object.values(INDUSTRY_STARTERS)
            .map(
              (ind) => `
            <div class="industry-choice-card" data-vertical="${ind.id}" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="width: 42px; height: 42px; border-radius: 8px; background: #fff1f2; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                  ${getIndustrySvgIcon(ind.id, 22, '#e50920')}
                </div>
                <div style="font-weight: 700; color: #1e293b; font-size: 0.95rem; margin-bottom: 4px;">${ind.name}</div>
                <div style="font-size: 0.78rem; color: #64748b; line-height: 1.4;">${ind.tagline}</div>
              </div>
              <button class="btn btn-primary btn-sm" style="margin-top: 14px; width: 100%; justify-content: center; background: #e50920; border-color: #e50920;">
                Select &amp; Launch Site &rarr;
              </button>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  // When an industry is selected, display the Interactive Starter Strip
  return `
    <div class="onboarding-active-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #e50920; border-radius: 10px; padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: #fee2e5; display: flex; align-items: center; justify-content: center;">
            ${activePreset ? getIndustrySvgIcon(activePreset.id, 22, '#e50920') : ''}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #e50920; letter-spacing: 0.05em; text-transform: uppercase;">ACTIVE STARTER SETUP</span>
              <span style="font-size: 0.75rem; color: #64748b;">· ${completedSteps}/${totalSteps} tasks done (${progressPct}%)</span>
            </div>
            <h3 style="font-size: 1.18rem; color: #17191d; margin: 2px 0 0;">
              ${state.companyName} (${activePreset?.name})
            </h3>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-open-sample-site" style="font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Preview Sample Site
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-onboarding-undo" style="color: #64748b; display: inline-flex; align-items: center; gap: 6px;" title="Undo everything and pick another industry">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            Switch Niche
          </button>
        </div>
      </div>

      <!-- Checklist Strip -->
      <div class="onboarding-checklist-strip" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; padding-top: 14px; border-top: 1px solid #f1f5f9;">
        <div class="checklist-item ${state.checklist.selectedField ? 'done' : ''}" style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: ${state.checklist.selectedField ? '#166534' : '#64748b'};">
          <span>${state.checklist.selectedField ? '✓' : '○'}</span>
          <span><b>1.</b> Picked ${activePreset?.name.split('&')[0]}</span>
        </div>

        <div class="checklist-item ${state.checklist.namedCompany ? 'done' : ''}" id="check-action-name" style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: ${state.checklist.namedCompany ? '#166534' : '#1e293b'}; cursor: pointer;">
          <span>${state.checklist.namedCompany ? '✓' : '○'}</span>
          <span style="text-decoration: underline;"><b>2.</b> Set Company Name</span>
        </div>

        <div class="checklist-item ${state.checklist.editedListing ? 'done' : ''}" id="check-action-listing" style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: ${state.checklist.editedListing ? '#166534' : '#1e293b'}; cursor: pointer;">
          <span>${state.checklist.editedListing ? '✓' : '○'}</span>
          <span style="text-decoration: underline;"><b>3.</b> Edit First Listing</span>
        </div>

        <div class="checklist-item ${state.checklist.testedEnquiry ? 'done' : ''}" id="check-action-enquiry" style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: ${state.checklist.testedEnquiry ? '#166534' : '#1e293b'}; cursor: pointer;">
          <span>${state.checklist.testedEnquiry ? '✓' : '○'}</span>
          <span style="text-decoration: underline;"><b>4.</b> Test Enquiry Form</span>
        </div>

        <div class="checklist-item ${state.checklist.sharedLink ? 'done' : ''}" id="check-action-share" style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: ${state.checklist.sharedLink ? '#166534' : '#1e293b'}; cursor: pointer;">
          <span>${state.checklist.sharedLink ? '✓' : '○'}</span>
          <span style="text-decoration: underline;"><b>5.</b> Copy &amp; Share Link</span>
        </div>
      </div>
    </div>

    <!-- Sample Site Modal -->
    <div id="sample-site-modal" style="display: none; position: fixed; inset: 0; background: rgba(15,23,42,0.7); z-index: 9999; align-items: center; justify-content: center; padding: 20px; overflow-y: auto;">
      <div style="background: #ffffff; border-radius: 12px; width: 100%; max-width: 820px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.25);">
        <!-- Modal Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; background: #fff; z-index: 10;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 6px; background: #fee2e5; display: flex; align-items: center; justify-content: center;">
              ${activePreset ? getIndustrySvgIcon(activePreset.id, 18, '#e50920') : ''}
            </div>
            <div>
              <div style="font-weight: 700; font-size: 1.05rem; color: #0f172a;">${state.companyName} — Public Preview</div>
              <div style="font-size: 0.74rem; color: #64748b;">Live editable sample site ready for clients</div>
            </div>
          </div>
          <button type="button" id="btn-close-sample-modal" style="background: none; border: none; font-size: 1.5rem; color: #64748b; cursor: pointer;">&times;</button>
        </div>

        <!-- Site Hero & Featured Listing -->
        <div style="padding: 24px;">
          <div style="background: linear-gradient(135deg, #fff1f2 0%, #fff 100%); border: 1px solid #fecdd3; border-radius: 10px; padding: 24px; margin-bottom: 24px;">
            <div style="font-size: 0.74rem; font-weight: 800; color: #e50920; letter-spacing: 0.08em; margin-bottom: 6px;">FEATURED LISTING / SERVICE</div>
            <h2 style="font-size: 1.5rem; color: #0f172a; margin: 0 0 8px;">${state.listingTitle}</h2>
            <div style="font-size: 1.35rem; font-weight: 800; color: #e50920; margin-bottom: 12px;">${state.listingPrice}</div>
            <p style="color: #475569; font-size: 0.92rem; line-height: 1.6; margin: 0 0 16px;">
              ${activePreset?.listingDesc}
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${activePreset?.listingBadges.map((b) => `<span style="background: #fff; border: 1px solid #fecdd3; color: #9f1239; font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 6px;">${b}</span>`).join('')}
            </div>
          </div>

          <!-- Working Enquiry Form Section -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px;">
            <h3 style="font-size: 1.15rem; color: #0f172a; margin: 0 0 6px;">Book or Inquire Online</h3>
            <p style="color: #64748b; font-size: 0.82rem; margin: 0 0 16px;">
              Submitting this form dispatches directly into your ZexCore CRM pipeline and triggers the automated follow-up.
            </p>

            <form id="sample-enquiry-form" onsubmit="event.preventDefault();">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div>
                  <label style="display: block; font-size: 0.76rem; font-weight: 600; color: #475569; margin-bottom: 4px;">Contact Name</label>
                  <input type="text" id="enquiry-name" class="input" value="Sarah Jenkins" required style="width: 100%;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.76rem; font-weight: 600; color: #475569; margin-bottom: 4px;">Email or Phone</label>
                  <input type="text" id="enquiry-contact" class="input" value="sarah.j@acme-enterprises.com" required style="width: 100%;" />
                </div>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 0.76rem; font-weight: 600; color: #475569; margin-bottom: 4px;">Requirements / Specific Date</label>
                <textarea id="enquiry-msg" class="input" rows="2" style="width: 100%; height: auto; padding: 8px;">Need delivery deployment scheduled for next Monday with full temperature log verification.</textarea>
              </div>

              <div id="enquiry-success-banner" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 12px; border-radius: 8px; margin-bottom: 14px; font-size: 0.85rem; line-height: 1.5;">
                <div style="font-weight: 700; margin-bottom: 2px; display: flex; align-items: center; gap: 6px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Enquiry Received &amp; Lead Created
                </div>
                <div>${activePreset?.followUpMsg}</div>
              </div>

              <button type="submit" class="btn btn-primary" id="btn-submit-enquiry" style="width: 100%; justify-content: center; padding: 12px; font-weight: 700;">
                Submit Test Enquiry &rarr;
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}
