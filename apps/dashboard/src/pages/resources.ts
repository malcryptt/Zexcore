/**
 * ZexCore Engineering Resources & Whitepapers Page
 * Authentic Technical Publications, Architecture Deep Dives, and Case Studies
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderResourcesPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('resources')}

      <main>
        <!-- Page Header -->
        <section class="section-white page-intro-section">
          <div class="site-container">
            <div class="page-intro-header">
              <div class="section-eyebrow">ENGINEERING PUBLICATIONS</div>
              <h1 class="page-intro-title">Technical Resources &amp; Whitepapers</h1>
              <p class="page-intro-desc">
                Architectural deep-dives, database design rationale, and cryptographic engineering analysis authored by the ZexCore core team.
              </p>
            </div>
          </div>
        </section>

        <!-- Articles Grid -->
        <section class="section-gray section-padded">
          <div class="site-container">
            <div class="resources-grid">
              <!-- Article 1 -->
              <article class="resource-article-card">
                <div class="resource-meta-bar">
                  <span class="resource-tag">DATABASE ARCHITECTURE</span>
                  <span class="resource-reading-time">12 min read</span>
                </div>
                <h2 class="resource-title">
                  Why Multi-Tenancy Belongs in the Database Engine: PostgreSQL RLS vs Application-Level Filtering
                </h2>
                <p class="resource-excerpt">
                  A mathematical analysis of why relying on ORM where-clause decorators inevitably introduces cross-tenant leakage in production. We explore session-bound RLS, composite foreign key invariants, and query planner optimization.
                </p>
                <div class="resource-footer-row">
                  <span class="resource-date">October 2026 &bull; Core Systems Team</span>
                  <a href="#/docs#section-rls" class="resource-link">Read Paper &rarr;</a>
                </div>
              </article>

              <!-- Article 2 -->
              <article class="resource-article-card">
                <div class="resource-meta-bar">
                  <span class="resource-tag">RUNTIME SECURITY</span>
                  <span class="resource-reading-time">9 min read</span>
                </div>
                <h2 class="resource-title">
                  Eliminating Arbitrary Code Execution: Safe AST Interpreters for Multi-Tenant Rule Engines
                </h2>
                <p class="resource-excerpt">
                  Why JavaScript eval and sandboxed node runtimes (vm2) remain persistent attack vectors in multi-tenant SaaS. How ZexCore enforces deterministic Abstract Syntax Tree evaluation with instruction counters and hard timeouts.
                </p>
                <div class="resource-footer-row">
                  <span class="resource-date">September 2026 &bull; Security Architecture</span>
                  <a href="#/docs#section-rules" class="resource-link">Read Paper &rarr;</a>
                </div>
              </article>

              <!-- Article 3 -->
              <article class="resource-article-card">
                <div class="resource-meta-bar">
                  <span class="resource-tag">CRYPTOGRAPHY &amp; PRIVACY</span>
                  <span class="resource-reading-time">14 min read</span>
                </div>
                <h2 class="resource-title">
                  Building Searchable Encrypted Fields with HMAC Blind Indexing and AES-256-GCM
                </h2>
                <p class="resource-excerpt">
                  Balancing strict PII envelope encryption at rest with the real-world operational requirement to query records by email or national ID. Implementing deterministic blind indexes while mitigating frequency analysis attacks.
                </p>
                <div class="resource-footer-row">
                  <span class="resource-date">September 2026 &bull; Compliance Team</span>
                  <a href="#/docs#section-crypto" class="resource-link">Read Paper &rarr;</a>
                </div>
              </article>

              <!-- Article 4 -->
              <article class="resource-article-card">
                <div class="resource-meta-bar">
                  <span class="resource-tag">RELIABILITY &amp; SCALING</span>
                  <span class="resource-reading-time">11 min read</span>
                </div>
                <h2 class="resource-title">
                  Zero-Downtime Schema Migrations in Multi-Tenant PostgreSQL Environments
                </h2>
                <p class="resource-excerpt">
                  How Drizzle ORM and transactional lock management prevent exclusive table locks during rolling cluster upgrades. A step-by-step operational blueprint for composite index creation and constraint additions.
                </p>
                <div class="resource-footer-row">
                  <span class="resource-date">August 2026 &bull; Infrastructure Team</span>
                  <a href="#/architecture" class="resource-link">Read Paper &rarr;</a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <!-- Newsletter / Notification Callout -->
        <section class="section-white section-padded">
          <div class="site-container">
            <div class="resource-banner-card">
              <div class="resource-banner-text">
                <h3 class="banner-heading">Stay Updated on Core Infrastructure Releases</h3>
                <p class="banner-subtext">
                  Subscribe to quarterly engineering release notes, security advisories, and architecture whitepapers. Zero marketing spam.
                </p>
              </div>
              <div class="resource-banner-form">
                <input type="email" placeholder="engineer@enterprise.io" class="input" style="max-width: 280px;" />
                <button class="btn btn-primary" onclick="alert('Thank you for subscribing to ZexCore Engineering updates.')">Subscribe</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
