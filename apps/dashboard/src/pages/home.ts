/**
 * ZexCore — Homepage
 * Clean All-Light Modern Centered Product Showcase (Linear / Resend Inspired)
 * Zero noisy text badges — Pure typography, elegant framing, and real product interactions.
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderHomePage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('home')}

      <main class="home-main">

        <!-- ── HERO CENTERED HEADER (NO TEXT BADGES) ── -->
        <section class="hero-center-section">
          <div class="hero-center-container">

            <h1 class="hero-center-title">
              The multi-tenant database engine<br>for mission-critical SaaS.
            </h1>

            <p class="hero-center-lead">
              Enforce kernel-level PostgreSQL isolation, automated cryptographic audit trails,
              and native high-frequency IoT streaming &mdash; without writing tenancy boilerplate.
            </p>

            <div class="hero-center-actions">
              <a href="/console" data-link class="btn-primary-hero" id="btn-hero-launch">
                Launch Live Console &rarr;
              </a>
              <a href="/architecture" data-link class="btn-secondary-hero" id="btn-hero-arch">
                Architecture Whitepaper
              </a>
              <div class="hero-cli-pill" id="hero-cli-copy" title="Click to copy">
                <code>npx @zexcore/cli@latest init</code>
                <button class="cli-copy-btn" id="btn-copy-cli" aria-label="Copy CLI command">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
                <span class="cli-copied-hint" id="cli-copied-text">Copied!</span>
              </div>
            </div>

          </div>

          <!-- ── FULL-WIDTH PRODUCT CONSOLE SHOWCASE ── -->
          <div class="product-showcase-wrap">
            <div class="product-showcase-window" id="product-showcase">

              <!-- Window Top Bar -->
              <div class="showcase-topbar">
                <div class="showcase-traffic">
                  <span></span><span></span><span></span>
                </div>

                <div class="showcase-cmd-box">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <span class="showcase-cmd-placeholder">Search tenant records, audit hashes, IoT fleets...</span>
                  <kbd>&#8984;K</kbd>
                </div>

                <div class="showcase-status-indicator">
                  <span class="telemetry-live-dot"></span>
                  <span>zexcore_app</span>
                </div>
              </div>

              <!-- Showcase Navigation Tabs -->
              <div class="showcase-nav-bar">
                <button class="showcase-tab active" data-showcase-tab="tab-rls">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Kernel RLS Isolation</span>
                </button>
                <button class="showcase-tab" data-showcase-tab="tab-audit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span>Cryptographic Audit Chain</span>
                </button>
                <button class="showcase-tab" data-showcase-tab="tab-iot">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                  <span>Real-Time Telemetry</span>
                </button>
                <button class="showcase-tab" data-showcase-tab="tab-rules">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <span>Deterministic Rules</span>
                </button>
              </div>

              <!-- Showcase Tab Panes -->
              <div class="showcase-content-area">

                <!-- ── TAB 1: RLS Sandbox ── -->
                <div class="showcase-pane active" id="tab-rls">
                  <div class="pane-split">
                    <div class="pane-left">
                      <div class="pane-subhead">
                        <span class="pane-context-label">PostgreSQL 17 Session</span>
                        <div class="tenant-switcher-group">
                          <button class="tenant-pill-btn active" id="btn-tenant-alpha" data-tenant="alpha">
                            Tenant Alpha (Logistics)
                          </button>
                          <button class="tenant-pill-btn" id="btn-tenant-beta" data-tenant="beta">
                            Tenant Beta (Cold-Chain)
                          </button>
                        </div>
                      </div>

                      <pre class="sql-code-block"><code><span class="c-comment">-- Role: zexcore_app (NOBYPASSRLS enforced at PG kernel)</span>
<span class="c-kw">SET LOCAL</span> app.current_tenant = <span class="c-str" id="rls-sql-tenant">'tenant_alpha'</span>;
<span class="c-kw">SELECT</span> id, asset_id, telemetry_reading, tenant_id
<span class="c-kw">FROM</span> records <span class="c-kw">WHERE</span> status = <span class="c-str">'ACTIVE'</span>;</code></pre>

                      <div class="leak-guarantee-text">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        <span id="rls-shield-text">2 rows visible &middot; 0 cross-tenant leaks guaranteed</span>
                      </div>
                    </div>

                    <div class="pane-right">
                      <div class="table-header-row">
                        <span class="table-title">Live Isolated Row Results</span>
                        <span class="table-meta">Filtered by RLS policy: <code>tenant_isolation</code></span>
                      </div>
                      <div class="table-scroll-wrap">
                        <table class="showcase-grid-table">
                          <thead>
                            <tr>
                              <th>RECORD ID</th>
                              <th>ASSET</th>
                              <th>TELEMETRY</th>
                              <th>TENANT SCOPE</th>
                            </tr>
                          </thead>
                          <tbody id="rls-table-body">
                            <tr>
                              <td class="cell-mono">rec_01h8q</td>
                              <td>TRUCK-LAG-01</td>
                              <td><span class="metric-val ok">64 km/h</span></td>
                              <td class="cell-mono">tenant_alpha</td>
                            </tr>
                            <tr>
                              <td class="cell-mono">rec_01h8r</td>
                              <td>REEFER-IBD-04</td>
                              <td><span class="metric-val warn">84 &deg;C !</span></td>
                              <td class="cell-mono">tenant_alpha</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ── TAB 2: Audit Chain ── -->
                <div class="showcase-pane" id="tab-audit">
                  <div class="audit-chain-view">
                    <div class="audit-chain-header">
                      <div>
                        <div class="pane-title">Cryptographic Append-Only Ledger</div>
                        <div class="pane-desc">Each entry includes the SHA-256 hash of the previous transaction. Mutating rows is blocked at trigger level.</div>
                      </div>
                      <button class="btn-action-sm" id="btn-verify-chain">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Verify Chain Integrity
                      </button>
                    </div>

                    <div class="audit-blocks-flow">
                      <div class="audit-card">
                        <div class="audit-card-top">
                          <span class="block-num">Block #108</span>
                          <span class="block-status ok">&check; Verified</span>
                        </div>
                        <div class="audit-row"><span class="k">Actor</span> <code>admin@tenant-alpha.ng</code></div>
                        <div class="audit-row"><span class="k">Action</span> <code>TENANT_POLICY_UPDATE</code></div>
                        <div class="audit-row"><span class="k">Hash</span> <span class="hash-text">e3b0c44298fc1c149afbf4c8996fb924</span></div>
                      </div>

                      <div class="chain-arrow">&rarr;</div>

                      <div class="audit-card highlight">
                        <div class="audit-card-top">
                          <span class="block-num">Block #109</span>
                          <span class="block-status ok" id="chain-verify-result">&check; Verified</span>
                        </div>
                        <div class="audit-row"><span class="k">Actor</span> <code>device:dvt_reefer_hauler_09</code></div>
                        <div class="audit-row"><span class="k">Action</span> <code>TELEMETRY_INGEST_CRITICAL</code></div>
                        <div class="audit-row"><span class="k">Prev</span> <span class="hash-text">e3b0c44298fc1c149afbf4c8996fb924</span></div>
                        <div class="audit-row"><span class="k">Hash</span> <span class="hash-text">8f434346648f6b96df89dda901c5176b</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ── TAB 3: IoT Telemetry ── -->
                <div class="showcase-pane" id="tab-iot">
                  <div class="iot-stream-view">
                    <div class="iot-stream-header">
                      <div>
                        <div class="pane-title">Direct Hardware Telemetry Ingest</div>
                        <div class="pane-desc">No MQTT broker setup. ESP32, Raspberry Pi, and OBD-II devices post directly to scoped endpoints.</div>
                      </div>
                      <div class="iot-live-counter">
                        <span class="ping-dot"></span>
                        <span>4 devices streaming &middot; 3.2ms latency</span>
                      </div>
                    </div>

                    <table class="showcase-grid-table">
                      <thead>
                        <tr>
                          <th>DEVICE ID</th>
                          <th>TELEMETRY FEED</th>
                          <th>GEO POSITION</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="cell-mono">dvt_reefer_hauler_09</td>
                          <td><span class="metric-val ok">-18.4 &deg;C</span> <span class="text-sub">Cold-Chain OK</span></td>
                          <td>6.5244 N, 3.3792 E (Lagos Port)</td>
                          <td><span class="text-status ok">&bull; Normal</span></td>
                        </tr>
                        <tr>
                          <td class="cell-mono">dvt_cold_node_44</td>
                          <td><span class="metric-val warn">8.2 &deg;C</span> <span class="text-sub">Threshold Alert</span></td>
                          <td>7.3775 N, 3.9470 E (Ibadan Hub)</td>
                          <td><span class="text-status warn">&bull; Alert Dispatched</span></td>
                        </tr>
                        <tr>
                          <td class="cell-mono">dvt_truck_lag_01</td>
                          <td><span class="metric-val ok">64 km/h</span> <span class="text-sub">Speed Logged</span></td>
                          <td>6.4698 N, 3.5852 E (Lekki Expy)</td>
                          <td><span class="text-status ok">&bull; Normal</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- ── TAB 4: Rules ── -->
                <div class="showcase-pane" id="tab-rules">
                  <div class="rules-showcase-view">
                    <div class="rules-header">
                      <div>
                        <div class="pane-title">Sandboxed AST Condition Evaluator</div>
                        <div class="pane-desc">Replaces cloud functions for real-time condition triggers. Evaluates in &lt; 0.3 ms with zero cold starts.</div>
                      </div>
                      <button class="btn-action-sm" id="btn-eval-ast">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Test Rule Evaluation
                      </button>
                    </div>

                    <div class="rule-pipeline-row">
                      <div class="pipeline-step">
                        <span class="step-label">When Event</span>
                        <div class="step-card"><code>telemetry.temp &gt; 5.0 &deg;C</code></div>
                      </div>
                      <div class="pipeline-connector">&rarr;</div>
                      <div class="pipeline-step">
                        <span class="step-label">If Condition</span>
                        <div class="step-card"><code>tenant.tier == "enterprise"</code></div>
                      </div>
                      <div class="pipeline-connector">&rarr;</div>
                      <div class="pipeline-step">
                        <span class="step-label">Then Dispatch</span>
                        <div class="step-card highlight"><code>action: dispatch_whatsapp_alert</code></div>
                      </div>
                    </div>

                    <div class="ast-eval-status-bar">
                      <span class="status-label">Evaluation Engine:</span>
                      <span class="status-val" id="ast-eval-result">Ready &middot; AST parse latency ~0.14 ms</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <!-- ── SOCIAL PROOF STRIP (CLEAN TYPOGRAPHY, NO BADGES) ── -->
        <div class="proof-bar-section">
          <div class="proof-bar-container">
            <span class="proof-lead">PROVEN IN MISSION-CRITICAL VERTICALS</span>
            <div class="proof-industries-row">
              <span>Pharmaceutical Cold-Chain</span>
              <span class="proof-sep">&middot;</span>
              <span>Fleet Telematics &amp; Logistics</span>
              <span class="proof-sep">&middot;</span>
              <span>Regulated Financial Audit</span>
              <span class="proof-sep">&middot;</span>
              <span>Industrial IoT Monitoring</span>
              <span class="proof-sep">&middot;</span>
              <span>Multi-Brand Agency SaaS</span>
            </div>
          </div>
        </div>

        <!-- ── BENTO CAPABILITIES GRID (CLEAN, NO TEXT BADGES) ── -->
        <section class="bento-section" id="capabilities-section">
          <div class="bento-header">
            <h2 class="bento-title">Engineered to eliminate vertical SaaS boilerplate.</h2>
            <p class="bento-subtitle">
              Every vertical software platform hits the same four architectural walls. ZexCore provides battle-hardened primitives for all four.
            </p>
          </div>

          <div class="bento-grid">

            <!-- Card 1: Wide -->
            <div class="bento-card bento-wide">
              <h3 class="bento-card-title">Dual-Role Row-Level Security at the PostgreSQL Kernel</h3>
              <p class="bento-card-desc">
                ZexCore runs daily queries under a restricted runtime role with <code>NOBYPASSRLS</code>.
                The schema owner role runs only at migration time. Cross-tenant leakage is physically impossible at the database layer.
              </p>
              <div class="bento-code-box">
                <pre><code><span class="c-kw">CREATE POLICY</span> tenant_isolation <span class="c-kw">ON</span> records
  <span class="c-kw">FOR ALL TO</span> zexcore_app
  <span class="c-kw">USING</span> (tenant_id = current_setting(<span class="c-str">'app.current_tenant'</span>, true));</code></pre>
              </div>
              <div class="bento-stats-row">
                <div class="bento-stat">
                  <span class="stat-num">0</span>
                  <span class="stat-lbl">Cross-tenant data leaks in production</span>
                </div>
                <div class="bento-stat">
                  <span class="stat-num">100%</span>
                  <span class="stat-lbl">Queries filtered before code executes</span>
                </div>
              </div>
            </div>

            <!-- Card 2: Square -->
            <div class="bento-card">
              <h3 class="bento-card-title">Sandboxed AST Automations (&lt; 0.3 ms)</h3>
              <p class="bento-card-desc">
                Execute tenant-defined trigger logic without launching heavy container runtimes or cold-started serverless functions.
              </p>
              <div class="bento-pill-list">
                <div class="bento-item">&check; No cold starts</div>
                <div class="bento-item">&check; Safe against code injection</div>
                <div class="bento-item">&check; Instant WhatsApp / Webhook dispatch</div>
              </div>
            </div>

            <!-- Card 3: Square -->
            <div class="bento-card">
              <h3 class="bento-card-title">Cryptographic Append-Only Ledger</h3>
              <p class="bento-card-desc">
                Every financial modification and permission escalation carries the SHA-256 hash of the parent block. Triggers reject <code>UPDATE</code> and <code>DELETE</code>.
              </p>
              <div class="bento-pill-list">
                <div class="bento-item">&check; Tamper-evident hash chain</div>
                <div class="bento-item">&check; Superuser cannot overwrite history</div>
                <div class="bento-item">&check; Court-admissible compliance proofs</div>
              </div>
            </div>

            <!-- Card 4: Wide -->
            <div class="bento-card bento-wide">
              <h3 class="bento-card-title">Token-Scoped Native IoT Streams</h3>
              <p class="bento-card-desc">
                Hardware devices authenticate directly via scoped tokens. Data lands in isolated tenant tables, triggers evaluate, and alerts fire &mdash; with zero MQTT bridge infrastructure required.
              </p>
              <div class="bento-code-box">
                <pre><code><span class="c-comment"># Native curl from Raspberry Pi / ESP32</span>
curl -X POST https://api.zexcore.app/v1/telemetry \\
  -H <span class="c-str">"X-Device-Token: dvt_reefer_hauler_09"</span> \\
  -d <span class="c-str">'{ "temp_c": -18.4, "gps": [6.5244, 3.3792] }'</span>
<span class="c-comment"># 201 Created &middot; Evaluated &amp; Stored in 3.4 ms</span></code></pre>
              </div>
            </div>

          </div>
        </section>

        <!-- ── ARCHITECTURE COMPARISON ── -->
        <section class="compare-section" id="comparison-section">
          <div class="compare-header">
            <h2 class="compare-title">Built different from generic backends.</h2>
            <p class="compare-subtitle">
              How ZexCore stacks up against custom DIY plumbing and general-purpose backend services.
            </p>
          </div>

          <div class="compare-table-wrapper">
            <table class="compare-table">
              <thead>
                <tr>
                  <th>FEATURE</th>
                  <th>DIY IN-HOUSE STACK</th>
                  <th>GENERIC BAAS (FIREBASE / SUPABASE)</th>
                  <th class="col-highlight">ZEXCORE KERNEL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Tenant Isolation</strong></td>
                  <td>Manual <code>WHERE</code> clauses in app code</td>
                  <td>Row-level auth tokens (can be bypassed)</td>
                  <td class="col-highlight">Dual-role PG kernel RLS (zero bypass)</td>
                </tr>
                <tr>
                  <td><strong>Automated Rules</strong></td>
                  <td>Heavy serverless functions or <code>eval()</code></td>
                  <td>Edge functions with cold start delays</td>
                  <td class="col-highlight">Sandboxed AST parser (&lt; 0.3 ms execution)</td>
                </tr>
                <tr>
                  <td><strong>Audit Ledger</strong></td>
                  <td>Mutable log table, zero tamper proofing</td>
                  <td>External logging tools, unchained</td>
                  <td class="col-highlight">SHA-256 hash chain, append-only triggers</td>
                </tr>
                <tr>
                  <td><strong>Device Telemetry</strong></td>
                  <td>MQTT broker + Redis stream + custom bridge</td>
                  <td>IoT extensions bolted on via plugins</td>
                  <td class="col-highlight">Native device token ingest, direct to PG</td>
                </tr>
                <tr>
                  <td><strong>Data Sovereignty</strong></td>
                  <td>Encryption at rest only</td>
                  <td>Shared managed cloud, vendor lock-in</td>
                  <td class="col-highlight">AES-256-GCM + blind index on your hardware</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ── FINAL CALL TO ACTION ── -->
        <section class="final-cta-section">
          <div class="final-cta-container">
            <h2 class="final-cta-title">Start building with ZexCore today.</h2>
            <p class="final-cta-lead">
              Get PostgreSQL 17 isolation, cryptographic audit trails, and device telemetry running in your application in under five minutes.
            </p>
            <div class="final-cta-buttons">
              <a href="/console" data-link class="btn-primary-hero" id="btn-cta-launch">
                Open Developer Console &rarr;
              </a>
              <a href="/docs" data-link class="btn-secondary-hero" id="btn-cta-docs">
                Read API Documentation
              </a>
            </div>
          </div>
        </section>

      </main>

      ${renderFooter()}
    </div>
  `;
}

export function setupHomePageEvents(): void {
  // Tab switcher in product showcase window
  const showcase = document.getElementById('product-showcase');
  if (showcase) {
    const tabs = showcase.querySelectorAll<HTMLButtonElement>('.showcase-tab');
    const panes = showcase.querySelectorAll<HTMLElement>('.showcase-pane');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-showcase-tab');
        if (!target) return;
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const pane = showcase.querySelector<HTMLElement>(`#${target}`);
        if (pane) pane.classList.add('active');
      });
    });
  }

  // CLI copy button
  const copyWrap = document.getElementById('hero-cli-copy');
  const copiedHint = document.getElementById('cli-copied-text');
  if (copyWrap && copiedHint) {
    copyWrap.addEventListener('click', () => {
      navigator.clipboard?.writeText('npx @zexcore/cli@latest init');
      copiedHint.classList.add('show');
      setTimeout(() => copiedHint.classList.remove('show'), 2000);
    });
  }

  // RLS tenant switcher
  const btnAlpha   = document.getElementById('btn-tenant-alpha');
  const btnBeta    = document.getElementById('btn-tenant-beta');
  const sqlVar     = document.getElementById('rls-sql-tenant');
  const tableBody  = document.getElementById('rls-table-body');
  const shieldText = document.getElementById('rls-shield-text');

  if (btnAlpha && btnBeta && sqlVar && tableBody && shieldText) {
    btnAlpha.addEventListener('click', () => {
      btnAlpha.classList.add('active');
      btnBeta.classList.remove('active');
      sqlVar.textContent = "'tenant_alpha'";
      shieldText.textContent = "2 rows visible \xB7 0 cross-tenant leaks guaranteed";
      tableBody.innerHTML = `
        <tr>
          <td class="cell-mono">rec_01h8q</td>
          <td>TRUCK-LAG-01</td>
          <td><span class="metric-val ok">64 km/h</span></td>
          <td class="cell-mono">tenant_alpha</td>
        </tr>
        <tr>
          <td class="cell-mono">rec_01h8r</td>
          <td>REEFER-IBD-04</td>
          <td><span class="metric-val warn">84 \u00B0C !</span></td>
          <td class="cell-mono">tenant_alpha</td>
        </tr>`;
    });

    btnBeta.addEventListener('click', () => {
      btnBeta.classList.add('active');
      btnAlpha.classList.remove('active');
      sqlVar.textContent = "'tenant_beta'";
      shieldText.textContent = "2 rows visible \xB7 0 cross-tenant leaks guaranteed";
      tableBody.innerHTML = `
        <tr>
          <td class="cell-mono">rec_99v2a</td>
          <td>COLD-NODE-44</td>
          <td><span class="metric-val ok">\u221218.4 \u00B0C</span></td>
          <td class="cell-mono">tenant_beta</td>
        </tr>
        <tr>
          <td class="cell-mono">rec_99v2b</td>
          <td>VACCINE-HAULER-9</td>
          <td><span class="metric-val ok">\u221220.1 \u00B0C</span></td>
          <td class="cell-mono">tenant_beta</td>
        </tr>`;
    });
  }

  // AST demo evaluator
  const btnAst = document.getElementById('btn-eval-ast');
  const astOut  = document.getElementById('ast-eval-result');
  if (btnAst && astOut) {
    btnAst.addEventListener('click', () => {
      astOut.textContent = 'Parsing AST & evaluating conditions\u2026';
      setTimeout(() => {
        const ms = (Math.random() * 0.12 + 0.11).toFixed(2);
        astOut.innerHTML = `<span style="color:#10B981;font-weight:600;">&check; Evaluated in ${ms} ms</span> &mdash; Condition met &rarr; DISPATCH_WHATSAPP_ALERT queued`;
      }, 160);
    });
  }

  // Audit chain verifier
  const btnChain = document.getElementById('btn-verify-chain');
  const chainOut  = document.getElementById('chain-verify-result');
  if (btnChain && chainOut) {
    btnChain.addEventListener('click', () => {
      chainOut.textContent = 'Verifying SHA-256 hashes\u2026';
      setTimeout(() => {
        chainOut.textContent = '\u2713 25/25 Blocks Verified (Chain Intact)';
      }, 220);
    });
  }
}
