/**
 * ZexCore Contact Page
 * Upgraded: benefit-first hero, Book a Demo CTA card, industry selector,
 * conversational form labels, and improved left-column social proof.
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderContactPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('contact')}

      <main>

        <!-- HERO -->
        <section class="section-white page-intro-section">
          <div class="page-hero-backdrop" style="background-image: url('/hero-team.jpg');"></div>
          <div class="site-container">
            <div class="page-intro-header page-hero-content-col">
              <div class="section-eyebrow">ENTERPRISE SUPPORT &amp; ADVISORY</div>
              <h1 class="page-intro-title" style="margin-bottom: 16px;">
                Direct Advisory &amp;<br />
                <span class="text-brand">Engineering Support</span>
              </h1>
              <p class="page-intro-desc">
                Consult directly with our engineering and operations team. Whether you need a guided live demonstration, custom enterprise deployment review, or architecture briefing — we respond within <strong>24–48 hours</strong>.
              </p>
            </div>
          </div>
        </section>

        <!-- CONTACT BODY -->
        <section style="background: var(--bg-page); padding: 56px 0 96px;">
          <div class="site-container">
            <div class="contact-layout-grid">

              <!-- LEFT: Book a Call + Contact Info -->
              <div style="display: flex; flex-direction: column; gap: 20px;">

                <!-- Book a Demo Call — Featured CTA -->
                <div style="background: #E50920; border-radius: 14px; padding: 28px 26px; color: #fff; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.06); border-radius: 50%;"></div>
                  <div style="position: absolute; bottom: -30px; right: 20px; width: 80px; height: 80px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                  <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.75); margin-bottom: 8px; position: relative;">
                    FASTEST WAY TO START
                  </div>
                  <div style="font-size: 1.3rem; font-weight: 850; line-height: 1.25; margin-bottom: 8px; letter-spacing: -0.01em; position: relative;">
                    Book a Free<br />15-Minute Demo
                  </div>
                  <div style="font-size: 0.85rem; color: rgba(255,255,255,0.85); line-height: 1.5; margin-bottom: 18px; position: relative;">
                    See ZexCore running live — sensors, WhatsApp alerts, client workspaces, and automation in action. No slides, just the real product.
                  </div>
                  <a
                    href="https://wa.me/2348102085840?text=Hi%2C%20I'd%20like%20to%20book%20a%20free%2015-minute%20ZexCore%20demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    id="contact-book-demo-btn"
                    style="display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #E50920; font-size: 0.88rem; font-weight: 800; padding: 10px 18px; border-radius: 8px; text-decoration: none; position: relative;"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                    </svg>
                    Book on WhatsApp &rarr;
                  </a>
                </div>

                <!-- Contact Details -->
                <div style="background: #fff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.03);">
                  <h2 style="font-size: 1rem; font-weight: 800; color: #17191D; margin: 0 0 20px 0;">Other Ways to Reach Us</h2>

                  <!-- Phone -->
                  <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px;">
                    <div style="width: 38px; height: 38px; flex-shrink: 0; background: rgba(229,9,32,0.07); border: 1px solid rgba(229,9,32,0.18); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #E50920;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.43 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l1.01-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <div>
                      <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">Phone</div>
                      <a href="tel:+2348102085840" style="font-size: 0.95rem; font-weight: 700; color: #17191D; text-decoration: none;">+234 810 208 5840</a>
                    </div>
                  </div>

                  <!-- WhatsApp -->
                  <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px;">
                    <div style="width: 38px; height: 38px; flex-shrink: 0; background: rgba(37,211,102,0.08); border: 1px solid rgba(37,211,102,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #25d366;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                      </svg>
                    </div>
                    <div>
                      <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">WhatsApp</div>
                      <a href="https://wa.me/2348102085840" target="_blank" rel="noopener noreferrer" style="font-size: 0.95rem; font-weight: 700; color: #17191D; text-decoration: none;">+234 810 208 5840</a>
                    </div>
                  </div>

                  <!-- Email -->
                  <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px;">
                    <div style="width: 38px; height: 38px; flex-shrink: 0; background: rgba(2,132,199,0.07); border: 1px solid rgba(2,132,199,0.18); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #0284c7;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div>
                      <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">Email</div>
                      <a href="mailto:hello@zexcore.com.ng" style="font-size: 0.95rem; font-weight: 700; color: #17191D; text-decoration: none;">hello@zexcore.com.ng</a>
                    </div>
                  </div>

                  <!-- Location -->
                  <div style="display: flex; align-items: flex-start; gap: 14px;">
                    <div style="width: 38px; height: 38px; flex-shrink: 0; background: rgba(139,92,246,0.07); border: 1px solid rgba(139,92,246,0.18); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #7c3aed;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div>
                      <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">Based In</div>
                      <div style="font-size: 0.95rem; font-weight: 700; color: #17191D; line-height: 1.4;">Ondo &amp; Lagos, Nigeria</div>
                    </div>
                  </div>
                </div>

                <!-- 48h Commitment Card -->
                <div style="background: rgba(229, 9, 32, 0.06); border: 1.5px solid rgba(229, 9, 32, 0.2); border-radius: 14px; padding: 22px 24px;">
                  <div style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #E50920; margin-bottom: 5px;">Our Commitment</div>
                  <div style="font-size: 1.45rem; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 5px; color: #17191D;">Within 48 Hours</div>
                  <div style="font-size: 0.85rem; color: #4B5563; line-height: 1.55;">Every message is read and answered directly by our team — not a bot, not a canned reply.</div>
                </div>

              </div>

              <!-- RIGHT: Contact Form -->
              <div class="contact-form-card">
                <h2 style="font-size: 1.25rem; font-weight: 800; color: #17191D; margin: 0 0 4px 0;">Send Us a Message</h2>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 28px 0;">Tell us a bit about your business and what you need — we'll come back with the right answer.</p>

                <div id="contact-success-banner" style="display: none; background: #ECFDF5; border: 1px solid #86EFAC; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; color: #15803D; font-size: 0.9rem; font-weight: 600; align-items: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Message sent! We will respond within 48 hours.</span>
                </div>
                <div id="contact-error-banner" style="display: none; background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; color: #B91C1C; font-size: 0.9rem; font-weight: 600;">
                  Something went wrong. Please try again or WhatsApp us directly.
                </div>

                <form id="zexcore-contact-form" style="display: flex; flex-direction: column; gap: 18px;">
                  <input type="hidden" name="access_key" value="ef8a1582-9a42-4f63-a0fd-930c388f08a4" />
                  <input type="hidden" name="subject" value="New ZexCore Contact Form Submission" />
                  <input type="hidden" name="from_name" value="ZexCore Website" />
                  <input type="checkbox" name="botcheck" style="display:none;" />

                  <div class="contact-form-row">
                    <div>
                      <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 6px;">Your Name *</label>
                      <input type="text" name="name" required class="input" placeholder="e.g. Amina Bello" style="width: 100%; box-sizing: border-box;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 6px;">Work Email *</label>
                      <input type="email" name="email" required class="input" placeholder="you@company.com" style="width: 100%; box-sizing: border-box;" />
                    </div>
                  </div>

                  <div class="contact-form-row">
                    <div>
                      <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 6px;">Phone / WhatsApp</label>
                      <input type="tel" name="phone" class="input" placeholder="+234 xxx xxx xxxx" style="width: 100%; box-sizing: border-box;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 6px;">Company or Organisation</label>
                      <input type="text" name="organisation" class="input" placeholder="e.g. BioMed Logistics Ltd" style="width: 100%; box-sizing: border-box;" />
                    </div>
                  </div>

                  <!-- Industry Selector -->
                  <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 6px;">What industry are you in? *</label>
                    <select name="industry" required class="input" style="width: 100%; box-sizing: border-box;">
                      <option value="">Select your industry…</option>
                      <option value="Healthcare & Medical">Healthcare &amp; Medical</option>
                      <option value="Logistics & Cold Chain">Logistics &amp; Cold Chain</option>
                      <option value="Manufacturing & Industrial">Manufacturing &amp; Industrial</option>
                      <option value="Finance & Fintech">Finance &amp; Fintech</option>
                      <option value="Government & Public Sector">Government &amp; Public Sector</option>
                      <option value="Digital Agency / Reseller">Digital Agency / Reseller</option>
                      <option value="Real Estate & Construction">Real Estate &amp; Construction</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <!-- What They Need -->
                  <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 6px;">What do you need help with? *</label>
                    <select name="enquiry_type" required class="input" style="width: 100%; box-sizing: border-box;">
                      <option value="">Select a topic…</option>
                      <option value="Product Demo">I want to see a live product demo</option>
                      <option value="Pricing & Plans">I have pricing or plan questions</option>
                      <option value="Agency Partnership">I want to offer ZexCore to my clients (Agency)</option>
                      <option value="Enterprise Deployment">I need ZexCore running on my own servers</option>
                      <option value="Technical Support">I need technical support or troubleshooting</option>
                      <option value="General Enquiry">Something else</option>
                    </select>
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 6px;">Tell us more about what you're building *</label>
                    <textarea name="message" required class="input" rows="5" placeholder="e.g. We run a cold-chain logistics company and want to track 20 refrigerated trucks in real time and alert drivers automatically when temperatures go out of range…" style="width: 100%; box-sizing: border-box; resize: vertical; min-height: 130px;"></textarea>
                  </div>

                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                    <button type="submit" id="contact-submit-btn" class="btn btn-primary" style="padding: 13px 28px; font-size: 0.97rem; font-weight: 750; display: inline-flex; align-items: center; gap: 8px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Send Message
                    </button>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      We respond within 48 hours
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

      </main>

      ${renderFooter()}
    </div>
  `;

}

export function setupContactPageEvents(): void {
  const form = document.getElementById('zexcore-contact-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contact-submit-btn') as HTMLButtonElement | null;
    const successBanner = document.getElementById('contact-success-banner');
    const errorBanner = document.getElementById('contact-error-banner');

    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    if (successBanner) successBanner.style.display = 'none';
    if (errorBanner) errorBanner.style.display = 'none';

    try {
      const data = new FormData(form);
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const json = await res.json();
      if (json.success) {
        if (successBanner) successBanner.style.display = 'block';
        form.reset();
        // Scroll success banner into view
        successBanner?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        throw new Error(json.message || 'Submission failed');
      }
    } catch (_err) {
      if (errorBanner) errorBanner.style.display = 'block';
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message';
      }
    }
  });
}
