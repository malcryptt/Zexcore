/**
 * ZexCore Contact Page
 * Hero header with stock photo + Web3Forms contact form
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderContactPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('contact')}

      <main>

        <!-- HERO -->
        <section class="page-intro-section" style="padding-bottom: 56px;">
          <div class="page-hero-backdrop" style="background-image: url('/hero-team.jpg');"></div>
          <div class="site-container">
            <div class="page-intro-header page-hero-content-col" style="text-align: left; max-width: 720px; margin: 0;">
              <div class="section-eyebrow">ENTERPRISE ENQUIRIES &amp; SUPPORT</div>
              <h1 class="page-intro-title" style="margin-bottom: 16px;">
                We Are Ready<br />
                <span class="text-brand">to Hear From You.</span>
              </h1>
              <p class="page-intro-desc">
                Whether you are exploring enterprise deployment, need a product demo, or have a technical question — every enquiry is answered directly by our team within <strong>48 hours</strong>.
              </p>
            </div>
          </div>
        </section>

        <!-- CONTACT BODY -->
        <section style="background: var(--bg-page); padding: 56px 0 96px;">
          <div class="site-container">
            <div style="display: grid; grid-template-columns: 1fr 1.6fr; gap: 40px; align-items: start; max-width: 1100px; margin: 0 auto;">

              <!-- LEFT: Contact Info -->
              <div style="display: flex; flex-direction: column; gap: 24px;">

                <div style="background: #fff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.03);">
                  <h2 style="font-size: 1.15rem; font-weight: 800; color: #17191D; margin: 0 0 24px 0;">Contact Details</h2>

                  <!-- Phone -->
                  <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px;">
                    <div style="width: 40px; height: 40px; flex-shrink: 0; background: rgba(229,9,32,0.07); border: 1px solid rgba(229,9,32,0.18); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #E50920;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.43 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l1.01-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <div>
                      <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">Phone</div>
                      <a href="tel:+2349131744823" style="font-size: 0.98rem; font-weight: 700; color: #17191D; text-decoration: none;">+234 913 174 4823</a>
                    </div>
                  </div>

                  <!-- WhatsApp -->
                  <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px;">
                    <div style="width: 40px; height: 40px; flex-shrink: 0; background: rgba(37,211,102,0.08); border: 1px solid rgba(37,211,102,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #25d366;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                      </svg>
                    </div>
                    <div>
                      <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">WhatsApp</div>
                      <a href="https://wa.me/2349164703407" target="_blank" rel="noopener noreferrer" style="font-size: 0.98rem; font-weight: 700; color: #17191D; text-decoration: none;">+234 916 470 3407</a>
                    </div>
                  </div>

                  <!-- Email -->
                  <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px;">
                    <div style="width: 40px; height: 40px; flex-shrink: 0; background: rgba(2,132,199,0.07); border: 1px solid rgba(2,132,199,0.18); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #0284c7;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div>
                      <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">Email</div>
                      <a href="mailto:hello@zexcore.com.ng" style="font-size: 0.98rem; font-weight: 700; color: #17191D; text-decoration: none;">hello@zexcore.com.ng</a>
                    </div>
                  </div>

                  <!-- Location -->
                  <div style="display: flex; align-items: flex-start; gap: 14px;">
                    <div style="width: 40px; height: 40px; flex-shrink: 0; background: rgba(139,92,246,0.07); border: 1px solid rgba(139,92,246,0.18); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #7c3aed;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div>
                      <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">Location</div>
                      <div style="font-size: 0.98rem; font-weight: 700; color: #17191D; line-height: 1.4;">Ondo &amp; Lagos,<br/>Nigeria</div>
                    </div>
                  </div>
                </div>

                <!-- Commitment Card — red-tinted, not solid -->
                <div style="background: rgba(229, 9, 32, 0.06); border: 1.5px solid rgba(229, 9, 32, 0.2); border-radius: 14px; padding: 26px 28px;">
                  <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #E50920; margin-bottom: 6px;">Our Commitment</div>
                  <div style="font-size: 1.55rem; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 6px; color: #17191D;">Within 48 Hours</div>
                  <div style="font-size: 0.88rem; color: #4B5563; line-height: 1.55;">Every enquiry receives a direct response from a member of the ZexCore team — not a bot, not a canned reply.</div>
                </div>

              </div>

              <!-- RIGHT: Contact Form -->
              <div style="background: #fff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.03);">
                <h2 style="font-size: 1.25rem; font-weight: 800; color: #17191D; margin: 0 0 6px 0;">Send us a Message</h2>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 28px 0;">Fill in the form below and we will get back to you shortly.</p>

                <div id="contact-success-banner" style="display: none; background: #ECFDF5; border: 1px solid #86EFAC; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; color: #15803D; font-size: 0.9rem; font-weight: 600;">
                  ✓ Your message has been sent. We will respond within 48 hours.
                </div>
                <div id="contact-error-banner" style="display: none; background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; color: #B91C1C; font-size: 0.9rem; font-weight: 600;">
                  Something went wrong. Please try again or email us directly at hello@zexcore.com.ng
                </div>

                <form id="zexcore-contact-form" style="display: flex; flex-direction: column; gap: 20px;">
                  <input type="hidden" name="access_key" value="ef8a1582-9a42-4f63-a0fd-930c388f08a4" />
                  <input type="hidden" name="subject" value="New ZexCore Contact Form Submission" />
                  <input type="hidden" name="from_name" value="ZexCore Website" />
                  <input type="checkbox" name="botcheck" style="display:none;" />

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                      <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">Full Name *</label>
                      <input type="text" name="name" required class="input" placeholder="Your full name" style="width: 100%; box-sizing: border-box;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">Email Address *</label>
                      <input type="email" name="email" required class="input" placeholder="you@company.com" style="width: 100%; box-sizing: border-box;" />
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                      <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">Phone / WhatsApp</label>
                      <input type="tel" name="phone" class="input" placeholder="+234 xxx xxx xxxx" style="width: 100%; box-sizing: border-box;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">Organisation</label>
                      <input type="text" name="organisation" class="input" placeholder="Company / Agency name" style="width: 100%; box-sizing: border-box;" />
                    </div>
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">Enquiry Type *</label>
                    <select name="enquiry_type" required class="input" style="width: 100%; box-sizing: border-box;">
                      <option value="">Select an enquiry type…</option>
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Enterprise Deployment">Enterprise / On-Premise Deployment</option>
                      <option value="Agency Partnership">Agency &amp; White-Label Partnership</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Product Demo">Request a Product Demo</option>
                      <option value="Pricing & Plans">Pricing &amp; Plans</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">Message *</label>
                    <textarea name="message" required class="input" rows="5" placeholder="Describe your enquiry in detail…" style="width: 100%; box-sizing: border-box; resize: vertical; min-height: 130px;"></textarea>
                  </div>

                  <button type="submit" id="contact-submit-btn" class="btn btn-primary" style="padding: 13px 28px; font-size: 0.98rem; font-weight: 750; align-self: flex-start; display: inline-flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Send Message
                  </button>
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
