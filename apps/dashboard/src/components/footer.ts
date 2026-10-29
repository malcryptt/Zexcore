/**
 * ZexCore Enterprise Footer Component
 * Clean Red & White Information Architecture | Comprehensive Sitemap
 */

export function renderFooter(): string {
  return `
    <footer class="site-footer">
      <div class="footer-top">
        <div class="footer-brand-col">
          <a href="/" data-link class="footer-logo-link">
            <img src="/zexcore-logo-dark.png" alt="ZexCore" class="footer-logo" />
          </a>
          <p class="footer-tagline">One Core Infinite Possibilities.</p>
          <p class="footer-desc">
            The multi-tenant backend engine and operating system for vertical SaaS applications — providing shared infrastructure for identity, hard data isolation, deterministic rules, and compliance.
          </p>
          <p style="margin-top: 12px; font-size: 0.85rem; color: rgba(255,255,255,0.88);">
            Direct Contact: <a href="mailto:hello@zexcore.com.ng" style="color: #ffffff; text-decoration: underline; font-weight: 600;">hello@zexcore.com.ng</a>
          </p>
        </div>

        <div class="footer-links-grid">
          <div class="footer-col">
            <h4 class="footer-col-title">Platform</h4>
            <ul class="footer-list">
              <li><a href="/platform" data-link>Platform Overview</a></li>
              <li><a href="/about" data-link>About ZexCore (Plain English)</a></li>
              <li><a href="/platform#identity" data-link>Identity &amp; RBAC</a></li>
              <li><a href="/platform#tenancy" data-link>Multi-Tenant Isolation</a></li>
              <li><a href="/platform#data" data-link>Dynamic Data Engine</a></li>
              <li><a href="/platform#events" data-link>Events &amp; Messaging</a></li>
              <li><a href="/platform#rules" data-link>Rules &amp; Automation</a></li>
              <li><a href="/platform#audit" data-link>Audit &amp; Compliance</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">Architecture</h4>
            <ul class="footer-list">
              <li><a href="/architecture" data-link>System Overview</a></li>
              <li><a href="/architecture#isolation" data-link>RLS Isolation Model</a></li>
              <li><a href="/architecture#request" data-link>Request Lifecycle</a></li>
              <li><a href="/architecture#composite" data-link>Composite Key Invariants</a></li>
              <li><a href="/architecture#bus" data-link>EventBus Topology</a></li>
              <li><a href="/architecture#ast" data-link>Deterministic AST Sandbox</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">Modules &amp; Packs</h4>
            <ul class="footer-list">
              <li><a href="/modules#iot" data-link>@zexcore/module-iot</a></li>
              <li><a href="/modules#rules" data-link>@zexcore/rules</a></li>
              <li><a href="/modules#crm" data-link>@zexcore/module-crm</a></li>
              <li><a href="/modules#compliance" data-link>@zexcore/compliance</a></li>
              <li><a href="/modules#audit" data-link>@zexcore/module-audit</a></li>
              <li><a href="/solutions#solutions-agency" data-link>Agency SaaS in a Box ($149)</a></li>
              <li><a href="/solutions#solutions-regulated" data-link>Regulated Verticals ($1,500)</a></li>
              <li><a href="/solutions#industrial" data-link>Industrial IoT Pack</a></li>
              <li><a href="/solutions#logistics" data-link>Logistics Fleet Pack</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">Security &amp; Trust</h4>
            <ul class="footer-list">
              <li><a href="/security" data-link>Security Model</a></li>
              <li><a href="/security#rls" data-link>Row-Level Security Defense</a></li>
              <li><a href="/security#crypto" data-link>AES-256-GCM Vault</a></li>
              <li><a href="/security#blind" data-link>HMAC Blind Indexing</a></li>
              <li><a href="/security#audit" data-link>Append-Only Audit Ledger</a></li>
              <li><a href="/security#gdpr" data-link>GDPR Article 17 Erasure</a></li>
              <li><a href="/security#ssrf" data-link>SSRF &amp; Network Defense</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">Developers</h4>
            <ul class="footer-list">
              <li><a href="/docs" data-link>Documentation</a></li>
              <li><a href="/docs#getting-started" data-link>Getting Started</a></li>
              <li><a href="/docs#api" data-link>REST API Reference</a></li>
              <li><a href="/docs#tokens" data-link>Device Token Ingest</a></li>
              <li><a href="/resources" data-link>Technical Whitepapers</a></li>
              <li><a href="/pricing" data-link>Pricing</a></li>
              <li><a href="/console" data-link>Control Console</a></li>
              <li><a href="/signin" data-link>Workspace Sign In</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <p class="footer-copyright">
            &copy; 2026 ZexCore Systems Inc. All rights reserved. Sovereign multi-tenant backend infrastructure.
          </p>
        </div>
      </div>
    </footer>
  `;
}
