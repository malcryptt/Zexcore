/**
 * ZexCore Enterprise Footer Component
 * Clean Red & White Information Architecture | Comprehensive Sitemap
 */

export function renderFooter(): string {
  return `
    <footer class="site-footer">
      <div class="footer-top">
        <div class="footer-brand-col">
          <a href="#/home" class="footer-logo-link">
            <img src="/zexcore-logo-horizontal.png" alt="ZexCore" class="footer-logo" />
          </a>
          <p class="footer-tagline">One Core Infinite Possibilities.</p>
          <p class="footer-desc">
            The multi-tenant backend engine and operating system for vertical SaaS applications — providing shared infrastructure for identity, hard data isolation, deterministic rules, and compliance.
          </p>
          <div class="footer-status">
            <span class="status-indicator-dot"></span>
            <span>All Systems Operational &mdash; PostgreSQL 17 RLS</span>
          </div>
        </div>

        <div class="footer-links-grid">
          <div class="footer-col">
            <h4 class="footer-col-title">Platform</h4>
            <ul class="footer-list">
              <li><a href="#/platform">Platform Overview</a></li>
              <li><a href="#/platform#identity">Identity &amp; RBAC</a></li>
              <li><a href="#/platform#tenancy">Multi-Tenant Isolation</a></li>
              <li><a href="#/platform#data">Dynamic Data Engine</a></li>
              <li><a href="#/platform#events">Events &amp; Messaging</a></li>
              <li><a href="#/platform#rules">Rules &amp; Automation</a></li>
              <li><a href="#/platform#audit">Audit &amp; Compliance</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">Architecture</h4>
            <ul class="footer-list">
              <li><a href="#/architecture">System Overview</a></li>
              <li><a href="#/architecture#isolation">RLS Isolation Model</a></li>
              <li><a href="#/architecture#request">Request Lifecycle</a></li>
              <li><a href="#/architecture#composite">Composite Key Invariants</a></li>
              <li><a href="#/architecture#bus">EventBus Topology</a></li>
              <li><a href="#/architecture#ast">Deterministic AST Sandbox</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">Modules &amp; Packs</h4>
            <ul class="footer-list">
              <li><a href="#/modules">All Core Modules</a></li>
              <li><a href="#/modules#iot">@zexcore/module-iot</a></li>
              <li><a href="#/modules#rules">@zexcore/rules</a></li>
              <li><a href="#/modules#crm">@zexcore/module-crm</a></li>
              <li><a href="#/modules#compliance">@zexcore/compliance</a></li>
              <li><a href="#/solutions#industrial">Industrial IoT Pack</a></li>
              <li><a href="#/solutions#logistics">Logistics Fleet Pack</a></li>
              <li><a href="#/solutions#crm">Sovereign CRM Pack</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">Security &amp; Trust</h4>
            <ul class="footer-list">
              <li><a href="#/security">Security Model</a></li>
              <li><a href="#/security#rls">Row-Level Security Defense</a></li>
              <li><a href="#/security#crypto">AES-256-GCM Vault</a></li>
              <li><a href="#/security#blind">HMAC Blind Indexing</a></li>
              <li><a href="#/security#audit">Append-Only Audit Ledger</a></li>
              <li><a href="#/security#gdpr">GDPR Article 17 Erasure</a></li>
              <li><a href="#/security#ssrf">SSRF &amp; Network Defense</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">Developers</h4>
            <ul class="footer-list">
              <li><a href="#/docs">Documentation</a></li>
              <li><a href="#/docs#getting-started">Getting Started</a></li>
              <li><a href="#/docs#api">REST API Reference</a></li>
              <li><a href="#/docs#tokens">Device Token Ingest</a></li>
              <li><a href="#/resources">Technical Whitepapers</a></li>
              <li><a href="#/console">Control Console</a></li>
              <li><a href="#/signin">Workspace Sign In</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <p class="footer-copyright">
            &copy; 2026 ZexCore Systems Inc. All rights reserved. Sovereign multi-tenant backend infrastructure.
          </p>
          <div class="footer-bottom-badges">
            <span class="tech-badge">PostgreSQL 17</span>
            <span class="tech-badge">Fastify 5</span>
            <span class="tech-badge">Drizzle ORM</span>
            <span class="tech-badge">AES-256-GCM</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}
