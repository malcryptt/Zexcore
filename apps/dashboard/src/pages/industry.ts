/** One landing page per business type. The text lives in seo/pages.json, the same file the build uses to write each page's HTML. */
import seo from '../seo/pages.json';
import { block, cards, cta, intro, shell, steps, esc } from './ref';

type Entry = (typeof seo.pages)[number] & { kind?: string; name?: string; lead?: string; points?: string[][]; steps?: string[][]; faq?: string[][] };

export function renderIndustryPage(path: string): string | null {
  const e = (seo.pages as Entry[]).find((p) => p.path === path && p.kind === 'industry');
  if (!e) return null;
  const others = (seo.pages as Entry[]).filter((p) => p.kind === 'industry' && p.path !== path);
  return shell('solutions',
    intro('SOLUTIONS', e.h1, e.lead ?? e.description, [{ text: 'Start free', href: '/signup', primary: true }, { text: 'See pricing', href: '/pricing' }]),
    block('What you can do', '', cards((e.points ?? []).map(([title, text]) => ({ title, text }))), true),
    block('How it works', '', steps((e.steps ?? []).map(([title, text]) => ({ title, text })))),
    block('Questions', '', `<div class="rp-grid">${(e.faq ?? []).map(([q, a]) => `<div class="rp-card"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('')}</div>`, true),
    block('Other business types', '', `<p class="rp-lead">${others.map((o) => `<a href="${o.path}" data-link>${esc(o.name ?? o.h1)}</a>`).join(' · ')}</p>`),
    cta('Set up your booking page today', 'Create a workspace, add your services and share your link. Start on the free plan.', [{ text: 'Start free', href: '/signup', primary: true }, { text: 'Contact us', href: '/contact' }]),
  );
}
