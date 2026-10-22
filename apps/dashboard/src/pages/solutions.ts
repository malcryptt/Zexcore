/**
 * ZexCore Solutions & Industry Packs Page
 * Plain-English benefit-first rewrite — no engineering jargon in headlines.
 * Real-world scenarios lead; technical badges appear as quiet proof.
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderSolutionsPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('solutions')}

      <main>
        <!-- Page Header -->
        <section class="section-white page-intro-section">
          <div class="page-hero-backdrop" style="background-image: url('/heroes/hero-solutions.jpg');"></div>
          <div class="site-container">
            <div class="page-intro-header page-hero-content-col">
              <div class="section-eyebrow">WHO ZEXCORE IS BUILT FOR</div>
              <h1 class="page-intro-title">Your Industry.<br /><span class="text-brand">Ready Out of the Box.</span></h1>
              <p class="page-intro-desc">
                Whether you run a cold-chain logistics company, a medical clinic, a financial firm, or a digital agency serving dozens of clients — ZexCore has a pre-configured pack that sets up your private workspace, live dashboards, customer communications, and automated workflows in minutes.
              </p>
            </div>
          </div>
        </section>

        <!-- ── ALTERNATING SOLUTIONS SECTIONS ───────────────────── -->
        <section class="section-white section-padded" style="padding: 48px 0 80px 0;">
          <div class="site-container">
            <div class="solutions-v-list">

              <!-- Solution A: Industrial IoT & Connected Manufacturing -->
              <div class="solution-h-card">
                <div class="solution-h-img-col">
                  <img
                    src="/solutions/iot.jpg"
                    alt="Industrial engineer inspecting connected sensors and machinery in a modern plant"
                    class="solution-h-img"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  />
                  <div class="sol-fallback-box" style="display: none;">
                    <span class="sol-fallback-tag">FOR: MANUFACTURING & LOGISTICS</span>
                    <span class="sol-fallback-title">Live Equipment Monitoring</span>
                  </div>
                </div>
                <div class="solution-h-body-col">
                  <div class="section-eyebrow" style="margin-bottom: 8px;">MANUFACTURING & COLD CHAIN LOGISTICS</div>
                  <h3 class="solution-h-title">Stop Discovering Problems After They Happen</h3>
                  <p style="font-size: 0.92rem; color: #475569; line-height: 1.65; margin-bottom: 14px;">
                    If a freezer fails at 2am, how quickly do you know? With ZexCore, a temperature probe fires an automated WhatsApp alert to your on-call engineer within seconds — before product is damaged.
                  </p>
                  <ul class="solution-h-bullets">
                    <li>Live dashboards showing every machine, vehicle, and sensor in real time</li>
                    <li>Automatic WhatsApp / SMS alerts the instant a threshold is breached</li>
                    <li>Permanent tamper-proof records of every reading for insurance and compliance</li>
                    <li>Send commands to physical equipment remotely from the dashboard</li>
                    <li>Handles 5 sensors or 5,000 without slowdown</li>
                  </ul>
                  <a href="#/platform/iot" class="solution-h-link">See How It Works &rarr;</a>
                </div>
              </div>

              <!-- Solution B: WhatsApp CRM & Revenue -->
              <div class="solution-h-card">
                <div class="solution-h-img-col">
                  <img
                    src="/solutions/sales.jpg"
                    alt="Modern enterprise sales and operations team collaborating in boardroom"
                    class="solution-h-img"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  />
                  <div class="sol-fallback-box" style="display: none;">
                    <span class="sol-fallback-title">WhatsApp CRM & Revenue Pipeline</span>
                  </div>
                </div>
                <div class="solution-h-body-col">
                  <div class="section-eyebrow" style="margin-bottom: 8px;">SALES TEAMS & SERVICE BUSINESSES</div>
                  <h3 class="solution-h-title">Close Deals Where Your Customers Already Are</h3>
                  <p style="font-size: 0.92rem; color: #475569; line-height: 1.65; margin-bottom: 14px;">
                    Your customers are on WhatsApp. ZexCore turns every WhatsApp conversation into a tracked sales lead — with a verified read receipt so you know exactly who saw your quote and when.
                  </p>
                  <ul class="solution-h-bullets">
                    <li>Shared WhatsApp inbox — your whole team responds from one business number</li>
                    <li>Every new inquiry automatically becomes a deal in your visual sales board</li>
                    <li>Clients book appointments online and pay a deposit to confirm — no-shows drop</li>
                    <li>Automatic WhatsApp reminders sent 24h and 1h before every appointment</li>
                    <li>Track revenue across USD, NGN, KES, GHS, and EUR in one pipeline</li>
                  </ul>
                  <a href="#/platform/crm" class="solution-h-link">See How It Works &rarr;</a>
                </div>
              </div>

              <!-- Solution C: Compliance & Data Privacy -->
              <div class="solution-h-card">
                <div class="solution-h-img-col">
                  <img
                    src="/solutions/compliance.jpg"
                    alt="Cybersecurity and compliance specialist working in modern security operations environment"
                    class="solution-h-img"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  />
                  <div class="sol-fallback-box" style="display: none;">
                    <span class="sol-fallback-title">Regulatory Compliance & Privacy</span>
                  </div>
                </div>
                <div class="solution-h-body-col">
                  <div class="section-eyebrow" style="margin-bottom: 8px;">HEALTHCARE, FINTECH & LEGAL FIRMS</div>
                  <h3 class="solution-h-title">Handle Patient and Client Data Without Legal Exposure</h3>
                  <p style="font-size: 0.92rem; color: #475569; line-height: 1.65; margin-bottom: 14px;">
                    A single data breach can cost a clinic its operating license. ZexCore encrypts every patient or client record with military-grade protection and gives you one-click legal deletion when required by law.
                  </p>
                  <ul class="solution-h-bullets">
                    <li>Every customer record encrypted individually — one breach cannot expose all records</li>
                    <li>When a client requests data deletion (GDPR / NDPR), erase it completely in one click with a signed legal certificate</li>
                    <li>Search encrypted records by name or phone — without ever unlocking the database</li>
                    <li>Track when each client consented to data use, and what they consented to</li>
                    <li>Tamper-proof audit trail of every access, change, and export</li>
                  </ul>
                  <a href="#/platform/compliance" class="solution-h-link">See How It Works &rarr;</a>
                </div>
              </div>

              <!-- Solution D: No-Code Automation -->
              <div class="solution-h-card">
                <div class="solution-h-img-col">
                  <img
                    src="/solutions/automation.jpg"
                    alt="Engineers working with industrial automation dashboards and telemetry systems"
                    class="solution-h-img"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  />
                  <div class="sol-fallback-box" style="display: none;">
                    <span class="sol-fallback-title">No-Code Business Automation</span>
                  </div>
                </div>
                <div class="solution-h-body-col">
                  <div class="section-eyebrow" style="margin-bottom: 8px;">OPERATIONS TEAMS & FIELD MANAGERS</div>
                  <h3 class="solution-h-title">Automate Repetitive Decisions — Without Writing a Single Line of Code</h3>
                  <p style="font-size: 0.92rem; color: #475569; line-height: 1.65; margin-bottom: 14px;">
                    Describe the rule in plain English: "If an order is placed after 6pm, assign to the night shift and WhatsApp the driver." ZexCore's AI turns that into a live automation in seconds.
                  </p>
                  <ul class="solution-h-bullets">
                    <li>Describe automation rules in plain English — AI builds them correctly for you</li>
                    <li>Rules evaluate in under 1 millisecond — actions fire before users notice</li>
                    <li>Every AI-generated rule requires a human to approve it before going live</li>
                    <li>Connect sensor data, customer actions, payments, and messages into one workflow</li>
                    <li>Full audit log of every rule execution — know exactly what triggered and when</li>
                  </ul>
                  <a href="#/platform/rules" class="solution-h-link">See How It Works &rarr;</a>
                </div>
              </div>

              <!-- Solution E: Web & Digital Agencies (SaaS in a Box) -->
              <div class="solution-h-card" id="solutions-agency" style="border-left: 4px solid #E50920;">
                <div class="solution-h-img-col">
                  <img
                    src="/heroes/hero-solutions.jpg"
                    alt="Agency team collaborating on client multi-tenant portals"
                    class="solution-h-img"
                    loading="lazy"
                  />
                  <div class="sol-fallback-box" style="display: none;">
                    <span class="sol-fallback-tag">TIER: AGENCY</span>
                    <span class="sol-fallback-title">Agency Turnkey SaaS</span>
                  </div>
                </div>
                <div class="solution-h-body-col">
                  <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <span class="badge badge-accent">AGENCY TIER &bull; $149/MO</span>
                    <span style="font-size: 0.72rem; font-weight: 700; color: #15803d; background: #dcfce7; padding: 2px 8px; border-radius: 12px;">25 Client Workspaces</span>
                  </div>
                  <div class="section-eyebrow" style="margin-bottom: 8px;">WEB AGENCIES & SOFTWARE RESELLERS</div>
                  <h3 class="solution-h-title">Deliver a Branded Platform to Every Client — In 60 Seconds</h3>
                  <p style="font-size: 0.9rem; color: #475569; line-height: 1.6; margin-bottom: 12px;">
                    Stop building one-off custom backends for every client. Spin up a fully branded, private workspace for each client from one central console. They see their logo and domain. You keep the revenue.
                  </p>
                  <ul class="solution-h-bullets">
                    <li><strong>25 Fully Isolated Client Workspaces:</strong> Each client's data is completely private from every other client.</li>
                    <li><strong>Your Branding, Their Portal:</strong> Upload each client's logo, set their brand colors, and map their custom domain — no ZexCore branding visible.</li>
                    <li><strong>Instant ROI:</strong> Bill each client $50–$100/mo while your platform cost is capped at $149/mo.</li>
                    <li><strong>Automatic Security Reports:</strong> Generate professional security and uptime summaries for clients without any manual effort.</li>
                  </ul>
                  <div style="display: flex; gap: 10px; margin-top: 14px;">
                    <button class="btn btn-primary btn-sm" onclick="window.startStripeCheckout('agency')">Get Agency Plan &rarr;</button>
                    <a href="#/console/whitelabel" class="btn btn-secondary btn-sm">Preview White-Label Studio</a>
                  </div>
                </div>
              </div>

              <!-- Solution F: Regulated Verticals (Healthcare & Financial Compliance) -->
              <div class="solution-h-card" id="solutions-regulated" style="border-left: 4px solid #1e293b;">
                <div class="solution-h-img-col">
                  <img
                    src="/heroes/hero-security.jpg"
                    alt="Regulated banking vault and healthcare encryption compliance infrastructure"
                    class="solution-h-img"
                    loading="lazy"
                  />
                  <div class="sol-fallback-box" style="display: none;">
                    <span class="sol-fallback-tag">TIER: REGULATED</span>
                    <span class="sol-fallback-title">Regulated Verticals</span>
                  </div>
                </div>
                <div class="solution-h-body-col">
                  <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <span class="badge" style="background: #1e293b; color: #fff;">DEDICATED &bull; FROM $1,500/MO</span>
                    <span style="font-size: 0.72rem; font-weight: 700; color: #1e293b; background: #e2e8f0; padding: 2px 8px; border-radius: 12px;">Signed BAA &amp; DPA</span>
                  </div>
                  <div class="section-eyebrow" style="margin-bottom: 8px;">HOSPITALS, CLINICS & FINANCIAL INSTITUTIONS</div>
                  <h3 class="solution-h-title">Enterprise Infrastructure That Runs Inside Your Own Building</h3>
                  <p style="font-size: 0.9rem; color: #475569; line-height: 1.6; margin-bottom: 12px;">
                    For organizations where data cannot leave the building — hospitals, clinical research labs, fintech payment routers, and government agencies. ZexCore runs entirely within your own servers with zero data sent externally.
                  </p>
                  <ul class="solution-h-bullets">
                    <li><strong>Runs On Your Servers:</strong> Full platform deployed inside your own data center or private cloud — no shared infrastructure.</li>
                    <li><strong>Patient Data Vault:</strong> Every record encrypted with each patient's unique key — irreversibly deleted on request with a legal certificate.</li>
                    <li><strong>Automatic Payment Reconciliation:</strong> Every invoice matched against payment gateway and bank records automatically.</li>
                    <li><strong>Legal Commitments Included:</strong> Signed Business Associate Agreement (BAA), Data Processing Addendum (DPA), and 99.95% SLA.</li>
                  </ul>
                  <div style="display: flex; gap: 10px; margin-top: 14px;">
                    <button class="btn btn-primary btn-sm" onclick="window.startStripeCheckout('dedicated')">Contact for Dedicated Pricing &rarr;</button>
                    <a href="#/security" class="btn btn-secondary btn-sm">View Security Architecture</a>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="section-tinted-red final-cta-section">
          <div class="site-container final-cta-inner">
            <h2 class="final-cta-headline">Try Your Industry Pack Live — Free, No Setup</h2>
            <p class="final-cta-subtext">
              Launch the console, select an industry pack, and watch sensors, alerts, and client workspaces come to life in minutes. No installation, no credit card.
            </p>
            <div class="final-cta-buttons">
              <a href="#/console" class="btn btn-primary btn-lg">
                Launch Live Console &rarr;
              </a>
              <a href="#/pricing" class="btn btn-secondary btn-lg">
                View Pricing Plans
              </a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
