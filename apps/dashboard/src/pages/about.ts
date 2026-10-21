/**
 * ZexCore About & Plain-English Platform Guide
 * 
 * Provides non-technical and technical clients with:
 * - What ZexCore is and why it exists
 * - How every single feature works in plain English
 * - Plain-English glossary for all technical terms
 * - Step-by-step installation on client workspace (Enterprise) and running on the website
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderAboutPage(): string {
  return `
    <div class="site-wrapper">
      ${renderNavbar('about')}

      <main class="page-content" style="padding-top: 40px; padding-bottom: 80px;">
        <!-- Hero Section -->
        <section class="about-hero" style="max-width: 1200px; margin: 0 auto; padding: 40px 24px; text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(229, 9, 32, 0.08); border: 1px solid rgba(229, 9, 32, 0.2); padding: 6px 14px; border-radius: 999px; margin-bottom: 20px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #E50920;"></span>
            <span style="font-size: 0.76rem; font-weight: 800; color: #E50920; text-transform: uppercase; letter-spacing: 0.06em;">Plain English Guide &amp; Architecture</span>
          </div>

          <h1 style="font-size: clamp(2.2rem, 5vw, 3.4rem); font-weight: 850; line-height: 1.15; color: #17191D; letter-spacing: -0.03em; margin-bottom: 20px;">
            What is ZexCore, Really?<br />
            <span style="color: #E50920;">Everything Explained in Plain English.</span>
          </h1>

          <p style="max-width: 820px; margin: 0 auto 32px; font-size: 1.15rem; color: #4B5563; line-height: 1.6;">
            No confusing buzzwords, no gatekept jargon. Here is exactly what ZexCore is, why forward-thinking companies run on it, how every module works, and how to deploy it on your own servers or run it instantly in your browser.
          </p>

          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="#/console" class="btn btn-primary" style="padding: 12px 26px; font-size: 0.95rem; font-weight: 750;">
              Launch Live Console &rarr;
            </a>
            <a href="#how-to-install" class="btn btn-secondary" style="padding: 12px 24px; font-size: 0.95rem; font-weight: 600;">
              Installation Guide &darr;
            </a>
          </div>
        </section>

        <!-- Navigation Pills for Sections -->
        <div style="max-width: 1100px; margin: 0 auto 40px; padding: 0 24px;">
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; border-bottom: 1px solid var(--border-default); justify-content: flex-start;">
            <a href="#what-is-zexcore" class="btn btn-secondary btn-sm" style="white-space: nowrap; font-size: 0.78rem;">1. What is ZexCore?</a>
            <a href="#why-zexcore" class="btn btn-secondary btn-sm" style="white-space: nowrap; font-size: 0.78rem;">2. Why ZexCore?</a>
            <a href="#features-plain-english" class="btn btn-secondary btn-sm" style="white-space: nowrap; font-size: 0.78rem;">3. Every Feature Explained</a>
            <a href="#how-to-install" class="btn btn-secondary btn-sm" style="white-space: nowrap; font-size: 0.78rem;">4. How to Install &amp; Run</a>
            <a href="#plain-english-glossary" class="btn btn-secondary btn-sm" style="white-space: nowrap; font-size: 0.78rem;">5. Plain English Glossary</a>
          </div>
        </div>

        <div style="max-width: 1100px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 64px;">
          
          <!-- SECTION 1: WHAT IS ZEXCORE -->
          <section id="what-is-zexcore" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <span style="font-size: 1.6rem; background: rgba(229, 9, 32, 0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; color: #E50920;">🏢</span>
              <div>
                <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0; color: #17191D;">1. What is ZexCore?</h2>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">The digital engine room for businesses and software builders</p>
              </div>
            </div>

            <p style="font-size: 1.05rem; line-height: 1.65; color: #374151;">
              Imagine you are building a modern office tower. You wouldn't forge your own steel beams, generate your own electricity, or lay your own city water pipes before welcoming tenants. You rely on proven, certified utilities so you can focus entirely on designing beautiful offices.
            </p>
            <p style="font-size: 1.05rem; line-height: 1.65; color: #374151;">
              <strong>ZexCore is the certified utility foundation for business software.</strong>
            </p>
            <p style="font-size: 1.05rem; line-height: 1.65; color: #374151;">
              Whenever an agency, enterprise, or startup wants to run software for multiple customers (multi-tenant), collect sensor readings from physical hardware, manage customer deals, send automated messages on WhatsApp, encrypt confidential records, or pass strict security audits, they normally spend <strong>12 to 18 months</strong> building boring, risky plumbing from scratch.
            </p>
            <p style="font-size: 1.05rem; line-height: 1.65; color: #374151;">
              <strong>ZexCore gives you that complete foundation on Day 1.</strong> You get a secure core engine that keeps every client's data isolated in its own digital vault, with pre-built modules for hardware devices, automated logic, sales pipelines, client branding, and financial integrity.
            </p>
          </section>

          <!-- SECTION 2: WHY ZEXCORE -->
          <section id="why-zexcore" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
              <span style="font-size: 1.6rem; background: rgba(22, 163, 74, 0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; color: #16a34a;">💡</span>
              <div>
                <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0; color: #17191D;">2. Why ZexCore? (The Old Way vs. The ZexCore Way)</h2>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">Why companies choose ZexCore over cobbling together 10 different tools</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 16px;">
              <div style="background: #FFF5F5; border: 1px solid #FED7D7; border-radius: 12px; padding: 22px;">
                <h3 style="color: #9B1C1C; font-size: 1.05rem; font-weight: 750; margin-top: 0; margin-bottom: 10px;">❌ The Traditional (Hard) Way</h3>
                <ul style="padding-left: 20px; color: #4A5568; font-size: 0.92rem; line-height: 1.6; margin: 0;">
                  <li><strong>18 Months to Market:</strong> Engineering teams spend over a year writing login, permissions, and database filters before launching.</li>
                  <li><strong>Accidental Data Leaks:</strong> One junior developer forgets a filter, and Customer A sees Customer B's confidential invoices.</li>
                  <li><strong>Fragile Frankenstein Stack:</strong> Stitching Zapier, HubSpot, AWS IoT, and custom databases results in constant breakage and mounting monthly bills.</li>
                  <li><strong>Failed Security Audits:</strong> Regulators ask for tamper-proof logs and GDPR erasure evidence, and the company has no cryptographic proof.</li>
                </ul>
              </div>

              <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 22px;">
                <h3 style="color: #166534; font-size: 1.05rem; font-weight: 750; margin-top: 0; margin-bottom: 10px;">✓ The ZexCore Way</h3>
                <ul style="padding-left: 20px; color: #374151; font-size: 0.92rem; line-height: 1.6; margin: 0;">
                  <li><strong>Live in 10 Minutes:</strong> Deploy pre-packaged industry blueprints with working sample sites, device streams, and rules instantly.</li>
                  <li><strong>Mathematical Vault Isolation:</strong> The database itself guarantees Customer A can never, under any circumstances, see Customer B's data.</li>
                  <li><strong>Unified All-in-One Engine:</strong> Hardware telemetry, WhatsApp communications, rules, and billing run together in one high-performance kernel.</li>
                  <li><strong>Built-In Regulatory Proof:</strong> Every export and record receives an immutable cryptographic serial number and tamper-proof seal.</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- SECTION 3: EVERY FEATURE EXPLAINED IN PLAIN ENGLISH -->
          <section id="features-plain-english" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
              <span style="font-size: 1.6rem; background: rgba(2, 132, 199, 0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; color: #0284c7;">⚙️</span>
              <div>
                <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0; color: #17191D;">3. How Every Feature Works (In Plain English)</h2>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">Clear explanations of every button and capability on the console</p>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 24px;">
              
              <!-- Feature 1: Multi-Tenant Isolation -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 20px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px;">
                  <span style="color: #E50920;">01.</span> Sovereign Multi-Tenant Isolation
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0 0 8px 0;">
                  <strong>What it is:</strong> A digital security wall between different clients sharing the same system.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                  <strong>How it works in plain English:</strong> In old software, human programmers have to remember to check "which company does this belong to?" on every single screen. If they forget once, data leaks. ZexCore uses database-enforced Row-Level Security (RLS). Think of it like a hotel keycard: even if you try to open room 302 with a keycard for room 201, the physical lock on the door refuses to open. The database itself blocks cross-client access automatically.
                </p>
              </div>

              <!-- Feature 2: Connected Devices (IoT Hub) -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 20px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px;">
                  <span style="color: #E50920;">02.</span> Connected Devices &amp; IoT Telemetry
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0 0 8px 0;">
                  <strong>What it is:</strong> Connecting physical machines (fridges, sensors, trucks, medical gear) to your software.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                  <strong>How it works in plain English:</strong> Each physical sensor is given a unique secret token. The device pings ZexCore with readings (e.g. "temperature is 4.2°C, battery voltage is 3.7V"). ZexCore verifies the secret token in under one millisecond, logs the reading into a tamper-proof history, and triggers an alert if the fridge gets too warm or the machine vibrates excessively.
                </p>
              </div>

              <!-- Feature 3: Automation Rules & AI Logic -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 20px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px;">
                  <span style="color: #E50920;">03.</span> Deterministic Automation Rules &amp; AI Authoring
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0 0 8px 0;">
                  <strong>What it is:</strong> "If THIS happens, do THAT" automated workflows.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                  <strong>How it works in plain English:</strong> You can set rules like: <em>"If temperature > 8°C for more than 5 minutes, send an urgent SMS to the manager and log an incident."</em> Instead of letting unsafe computer code run (which hackers could abuse), ZexCore converts your rule into a safe mathematical tree (AST) that executes predictably with zero risk of crashing your server.
                </p>
              </div>

              <!-- Feature 4: CRM & WhatsApp Inbox -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 20px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px;">
                  <span style="color: #E50920;">04.</span> Customer Relationship Management (CRM) &amp; Messaging
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0 0 8px 0;">
                  <strong>What it is:</strong> Managing customer inquiries, WhatsApp chats, deal stages, and payments.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                  <strong>How it works in plain English:</strong> When a prospective client fills out an inquiry form on your website or sends a message, they appear immediately in your CRM pipeline. You can chat with them directly, send quotes, or collect card payments via Paystack. Message status ticks are strictly accurate: you see a grey checkmark when sent, two grey checkmarks when delivered to the recipient's phone, and blue checkmarks only when the customer has actually opened and read your message.
                </p>
              </div>

              <!-- Feature 5: Compliance Vault & Privacy -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 20px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px;">
                  <span style="color: #E50920;">05.</span> Compliance Vault &amp; GDPR Crypto-Erasure
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0 0 8px 0;">
                  <strong>What it is:</strong> Bank-grade encryption and total privacy compliance for sensitive customer records.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                  <strong>How it works in plain English:</strong> Confidential fields (like home addresses, phone numbers, and health records) are scrambled using military-grade encryption (AES-256) before they ever touch the hard drive. If a customer exercises their legal "Right to be Forgotten" under GDPR, ZexCore destroys that customer's unique cryptographic key. The data becomes mathematically scrambled gibberish forever, proving complete compliance to data protection authorities.
                </p>
              </div>

              <!-- Feature 6: Agency White-Label Branding -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 20px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px;">
                  <span style="color: #E50920;">06.</span> Agency White-Label Branding Studio
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0 0 8px 0;">
                  <strong>What it is:</strong> Making the platform look 100% like your own agency or company product.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                  <strong>How it works in plain English:</strong> You can upload your own company logo directly (drag and drop an image file or paste a link), choose your brand colors, remove all ZexCore watermarks, and connect your own custom internet domain (like <code>portal.yourcompany.com</code>). When your clients log in, they only see your company name and branding.
                </p>
              </div>

              <!-- Feature 7: Tamper-Proof Audit & Export Ledger -->
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px;">
                  <span style="color: #E50920;">07.</span> Tamper-Proof Audit &amp; Permanent Export Ledger
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0 0 8px 0;">
                  <strong>What it is:</strong> An unalterable black-box recorder for all system exports, readings, and financial events.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                  <strong>How it works in plain English:</strong> Just like a plane's flight recorder, every data export or major action is stamped with an official Serial Number (e.g. <code>EXP-20261021-A9F32B</code>), exact timestamp down to the second, user identity, and cryptographic watermark. This record is linked into a mathematical chain (hash chain). Nobody—not even a system administrator—can delete or secretly modify past records without breaking the cryptographic seal, guaranteeing 100% authenticity for auditors.
                </p>
              </div>

            </div>
          </section>

          <!-- SECTION 4: HOW TO INSTALL AND RUN -->
          <section id="how-to-install" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
              <span style="font-size: 1.6rem; background: rgba(229, 9, 32, 0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; color: #E50920;">🚀</span>
              <div>
                <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0; color: #17191D;">4. How to Run ZexCore</h2>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">Two ways to run: Instant Cloud/Web or Enterprise Workspace On-Premise</p>
              </div>
            </div>

            <!-- Path A: Instant Cloud / Browser -->
            <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0;">Option A: Run Directly on the Web (Instant Cloud SaaS)</h3>
                <span class="badge" style="background: rgba(22, 163, 74, 0.15); color: #16a34a; font-weight: 750;">Zero Setup Required</span>
              </div>
              <p style="color: #475569; font-size: 0.95rem; line-height: 1.6; margin: 0 0 14px 0;">
                If you want to use ZexCore without managing any servers, databases, or cloud infrastructure:
              </p>
              <ol style="color: #334155; font-size: 0.92rem; line-height: 1.7; margin: 0 0 16px 20px;">
                <li>Open your browser and navigate to the <strong><a href="#/console" style="color: #E50920; font-weight: 700;">ZexCore Operations Console</a></strong>.</li>
                <li>Sign in or select your tenant workspace from the top bar (e.g. <code>Acme Enterprise Corp</code> or your own agency name).</li>
                <li>Click <strong>Deploy Starter Kit</strong> to immediately load a pre-configured vertical package (HVAC, Cold Chain Logistics, Clinical Diagnostic, or Digital Agency).</li>
                <li>Your fleet sensors, WhatsApp CRM, and automated rules are live instantly in the browser.</li>
              </ol>
              <a href="#/console" class="btn btn-primary btn-sm" style="font-weight: 700;">Open Web Console Now &rarr;</a>
            </div>

            <!-- Path B: Enterprise Workspace On-Premise Installation -->
            <div style="background: #0F172A; border-radius: 12px; padding: 26px; color: #F8FAFC;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin: 0;">Option B: Install in the Client Workspace (Enterprise On-Prem / Private Cloud)</h3>
                <span class="badge" style="background: rgba(229, 9, 32, 0.25); color: #FFA4A4; font-weight: 750;">Self-Hosted &amp; Sovereign</span>
              </div>
              <p style="color: #94A3B8; font-size: 0.92rem; line-height: 1.6; margin: 0 0 16px 0;">
                For regulated enterprises requiring full data sovereignty on private hardware, AWS, Azure, Google Cloud, or local Docker environments:
              </p>

              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div>
                  <div style="font-weight: 700; font-size: 0.85rem; color: #38BDF8; margin-bottom: 4px;">Step 1: Clone Repository &amp; Install Dependencies</div>
                  <pre style="background: #020617; padding: 12px 16px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.82rem; color: #E2E8F0; overflow-x: auto; margin: 0;"><code>git clone https://github.com/malcryptt/Zexcore.git
cd ZexCore
pnpm install</code></pre>
                </div>

                <div>
                  <div style="font-weight: 700; font-size: 0.85rem; color: #38BDF8; margin-bottom: 4px;">Step 2: Start PostgreSQL 17 with Row-Level Security Enabled</div>
                  <pre style="background: #020617; padding: 12px 16px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.82rem; color: #E2E8F0; overflow-x: auto; margin: 0;"><code>docker compose up -d postgres
pnpm db:migrate
pnpm db:seed</code></pre>
                </div>

                <div>
                  <div style="font-weight: 700; font-size: 0.85rem; color: #38BDF8; margin-bottom: 4px;">Step 3: Launch High-Speed Fastify API &amp; Dashboard</div>
                  <pre style="background: #020617; padding: 12px 16px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.82rem; color: #E2E8F0; overflow-x: auto; margin: 0;"><code># Terminal 1: Backend API Engine (Port 3000)
pnpm --filter @zexcore/api dev

# Terminal 2: Web Console Interface (Port 5173)
pnpm --filter @zexcore/dashboard dev</code></pre>
                </div>

                <div>
                  <div style="font-weight: 700; font-size: 0.85rem; color: #38BDF8; margin-bottom: 4px;">Step 4: Verify Deployment Health</div>
                  <pre style="background: #020617; padding: 12px 16px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.82rem; color: #E2E8F0; overflow-x: auto; margin: 0;"><code>curl http://localhost:3000/health
# Returns: {"status":"healthy","database":"connected","rlsEnforced":true}</code></pre>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 5: GLOSSARY -->
          <section id="plain-english-glossary" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
              <span style="font-size: 1.6rem; background: rgba(13, 148, 136, 0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; color: #0d9488;">📖</span>
              <div>
                <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0; color: #17191D;">5. Plain English Glossary</h2>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">Confusing tech terms translated into everyday human language</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
              
              <div style="background: var(--bg-muted); border-radius: 10px; padding: 16px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 4px;">Tenant</div>
                <div style="color: #4B5563; font-size: 0.85rem; line-height: 1.5;">
                  A distinct company or customer account on the system. All their devices, users, rules, and sales records exist inside an isolated workspace.
                </div>
              </div>

              <div style="background: var(--bg-muted); border-radius: 10px; padding: 16px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 4px;">Row-Level Security (RLS)</div>
                <div style="color: #4B5563; font-size: 0.85rem; line-height: 1.5;">
                  A database feature that physically blocks one client from seeing another client's rows of data, like an impenetrable electronic door.
                </div>
              </div>

              <div style="background: var(--bg-muted); border-radius: 10px; padding: 16px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 4px;">Telemetry</div>
                <div style="color: #4B5563; font-size: 0.85rem; line-height: 1.5;">
                  Automated live measurements sent across the internet by physical hardware (e.g. temperature, battery voltage, GPS position, pressure).
                </div>
              </div>

              <div style="background: var(--bg-muted); border-radius: 10px; padding: 16px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 4px;">AST (Abstract Syntax Tree)</div>
                <div style="color: #4B5563; font-size: 0.85rem; line-height: 1.5;">
                  A safe mathematical chart used to evaluate business rules. It prevents dangerous hacker commands from ever running on your servers.
                </div>
              </div>

              <div style="background: var(--bg-muted); border-radius: 10px; padding: 16px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 4px;">AES-256-GCM Encryption</div>
                <div style="color: #4B5563; font-size: 0.85rem; line-height: 1.5;">
                  The highest civilian security standard in the world. It scrambles data so that even the world's most powerful supercomputers cannot read it without the secret key.
                </div>
              </div>

              <div style="background: var(--bg-muted); border-radius: 10px; padding: 16px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 4px;">Blind Indexing</div>
                <div style="color: #4B5563; font-size: 0.85rem; line-height: 1.5;">
                  A clever mathematical trick that lets you search for a client's email or phone number in your database without ever decrypting the whole database.
                </div>
              </div>

              <div style="background: var(--bg-muted); border-radius: 10px; padding: 16px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 4px;">Hash Chain (Tamper-Proof)</div>
                <div style="color: #4B5563; font-size: 0.85rem; line-height: 1.5;">
                  A digital seal where every new log entry contains a mathematical stamp of the previous entry. If anyone changes a past record, the seal immediately breaks and rings an alarm.
                </div>
              </div>

              <div style="background: var(--bg-muted); border-radius: 10px; padding: 16px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 4px;">SIEM (Security Event Management)</div>
                <div style="color: #4B5563; font-size: 0.85rem; line-height: 1.5;">
                  Professional cybersecurity logging tools (like Splunk or Datadog) used by corporate IT teams to monitor corporate networks for suspicious activity.
                </div>
              </div>

            </div>
          </section>

          <!-- Call to Action Banner -->
          <section style="background: linear-gradient(135deg, #17191D 0%, #2D3748 100%); border-radius: 16px; padding: 48px 32px; text-align: center; color: #ffffff;">
            <h2 style="font-size: 2rem; font-weight: 850; margin: 0 0 12px 0;">Ready to See ZexCore in Action?</h2>
            <p style="color: #E2E8F0; max-width: 600px; margin: 0 auto 28px; font-size: 1rem; line-height: 1.6;">
              Test drive the live operations console right now. No credit card required. Explore pre-loaded devices, trigger live rules, and see the architecture firsthand.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <a href="#/console" class="btn btn-primary" style="padding: 12px 28px; font-weight: 750;">
                Open Live Console Free &rarr;
              </a>
              <a href="#/pricing" class="btn btn-secondary" style="padding: 12px 24px; font-weight: 600; background: rgba(255,255,255,0.1); color: #ffffff; border-color: rgba(255,255,255,0.2);">
                View Platform Pricing
              </a>
            </div>
            <p style="margin-top: 24px; font-size: 0.88rem; color: #CBD5E1;">
              Direct Inquiries &amp; Enterprise Support: <a href="mailto:hello@zexcore.com.ng" style="color: #ffffff; text-decoration: underline; font-weight: 700;">hello@zexcore.com.ng</a>
            </p>
          </section>

        </div>
      </main>

      ${renderFooter()}
    </div>
  `;
}
