/**
 * ZexCore Solutions & Industry Packs Page
 * Matches user specifications:
 * - Alternating text-and-photography layout
 * - Authentic, high-quality professional photography with reliable local fallbacks
 * - Exact 4 solutions: Industrial IoT, Sales & CRM, Compliance & Data Privacy, Intelligent Automation
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
              <div class="section-eyebrow">VERTICAL DOMAIN ARCHITECTURE</div>
              <h1 class="page-intro-title">Industry Solutions &amp; Packs</h1>
              <p class="page-intro-desc">
                Configure industry-specific SaaS products using reusable domain modules while preserving consistent infrastructure, authorization, and tenant isolation.
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
                    <span class="sol-fallback-tag">PACK: INDUSTRIAL-IOT</span>
                    <span class="sol-fallback-title">Connected Manufacturing</span>
                  </div>
                </div>
                <div class="solution-h-body-col">
                  <h3 class="solution-h-title">Industrial IoT &amp; Connected Manufacturing</h3>
                  <ul class="solution-h-bullets">
                    <li>Equipment and fleet monitoring</li>
                    <li>Sensor telemetry ingestion</li>
                    <li>Temperature, humidity, and vibration monitoring</li>
                    <li>Threshold alerts and automated incident dispatch</li>
                    <li>Secure device authentication</li>
                  </ul>
                  <a href="#/docs" class="solution-h-link">Learn More &rarr;</a>
                </div>
              </div>

              <!-- Solution B: Sales & Customer Relationship Management -->
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
                    <span class="sol-fallback-title">Sales &amp; Pipeline Engine</span>
                  </div>
                </div>
                <div class="solution-h-body-col">
                  <h3 class="solution-h-title">Sales &amp; Customer Relationship Management</h3>
                  <ul class="solution-h-bullets">
                    <li>Lead and contact management</li>
                    <li>Sales pipeline tracking</li>
                    <li>Opportunity forecasting</li>
                    <li>Automated follow-up workflows</li>
                    <li>Tenant-isolated customer records</li>
                  </ul>
                  <a href="#/docs" class="solution-h-link">Learn More &rarr;</a>
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
                    <span class="sol-fallback-title">Compliance &amp; GDPR / NDPR</span>
                  </div>
                </div>
                <div class="solution-h-body-col">
                  <h3 class="solution-h-title">Compliance &amp; Data Privacy</h3>
                  <ul class="solution-h-bullets">
                    <li>Sensitive-data protection and envelope encryption</li>
                    <li>Immutable audit trails and access logging</li>
                    <li>Consent and retention lifecycle workflows</li>
                    <li>Granular data access controls and policy enforcement</li>
                    <li>Automated privacy request (DSAR) processing</li>
                  </ul>
                  <a href="#/docs" class="solution-h-link">Learn More &rarr;</a>
                </div>
              </div>

              <!-- Solution D: Intelligent Business Automation -->
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
                    <span class="sol-fallback-title">Deterministic Automation</span>
                  </div>
                </div>
                <div class="solution-h-body-col">
                  <h3 class="solution-h-title">Intelligent Business Automation</h3>
                  <ul class="solution-h-bullets">
                    <li>Deterministic rule evaluation with sub-millisecond execution</li>
                    <li>Event-driven automation triggered across tenant boundary</li>
                    <li>Complex workflow orchestration with state persistence</li>
                    <li>Real-time operational alerts and dispatch notifications</li>
                    <li>Extensible domain-specific workflow authoring</li>
                  </ul>
                  <a href="#/docs" class="solution-h-link">Learn More &rarr;</a>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="section-tinted-red final-cta-section">
          <div class="site-container final-cta-inner">
            <h2 class="final-cta-headline">Deploy an Industry Pack in ZexCore Control</h2>
            <p class="final-cta-subtext">
              Log into the control console and interact with active IoT device nodes, rule triggers, and compliance vaults.
            </p>
            <div class="final-cta-buttons">
              <a href="#/console" class="btn btn-primary btn-lg">
                Launch Control Console &rarr;
              </a>
              <a href="#/docs" class="btn btn-secondary btn-lg">
                Read Pack Specification Docs
              </a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
