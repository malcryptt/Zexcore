// Runs after `vite build`. Writes one HTML file per public page so search engines get that page's own title,
// description, canonical address and a plain list of links without running JavaScript, and rebuilds sitemap.xml.
// Firebase Hosting has cleanUrls on, so /pricing is served from pricing.html. The app replaces this content when it loads.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, '..', 'dist');
const data = JSON.parse(readFileSync(join(here, '..', 'src', 'seo', 'pages.json'), 'utf8'));
const base = readFileSync(join(dist, 'index.html'), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const today = new Date().toISOString().slice(0, 10);
const logo = `${data.site}/zexcore-logo-horizontal.png`;
const card = `${data.site}/og-card.png`;

const ld = (page) => JSON.stringify([
  { '@context': 'https://schema.org', '@type': 'Organization', name: data.name, url: data.site, logo,
    parentOrganization: { '@type': 'Organization', name: 'Zexlabs' } },
  { '@context': 'https://schema.org', '@type': 'WebSite', name: data.name, url: data.site, inLanguage: 'en' },
  ...(page.path === '/' ? [{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: data.name, applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web', url: data.site, description: page.description }] : []),
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: page.path === '/'
    ? [{ '@type': 'ListItem', position: 1, name: data.name, item: `${data.site}/` }]
    : [{ '@type': 'ListItem', position: 1, name: data.name, item: `${data.site}/` }, { '@type': 'ListItem', position: 2, name: page.h1, item: `${data.site}${page.path}` }] },
]).replace(/</g, '\\u003c');

function render(page) {
  const url = `${data.site}${page.path === '/' ? '/' : page.path}`;
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${data.name}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:image" content="${card}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${card}" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<script type="application/ld+json">${ld(page)}</script>`,
  ].join('\n    ');
  const links = data.nav.map(([href, text]) => `<li><a href="${href}">${esc(text)}</a></li>`).join('');
  const points = (page.points ?? []).map(([h, t]) => `<li><strong>${esc(h)}</strong> ${esc(t)}</li>`).join('');
  const faq = (page.faq ?? []).map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('');
  const others = page.kind === 'industry' ? data.pages.filter((p) => p.kind === 'industry' && p.path !== page.path).map((p) => `<a href="${p.path}">${esc(p.name)}</a>`).join(' · ') : '';
  const body = `<div id="app"><header><nav aria-label="Main"><a href="/">${data.name}</a><ul>${links}</ul></nav></header><main><h1>${esc(page.h1)}</h1><p>${esc(page.lead ?? page.description)}</p>${points ? `<ul>${points}</ul>` : ''}${faq}${others ? `<p>${others}</p>` : ''}</main><footer><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></footer></div>`;
  return base
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace(/<meta property="og:(title|description|image)"[^>]*>\s*/g, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="app"></div>', body);
}

// Every other address (the signed-in app, each business's booking page) is served this plain copy, so it never
// claims the home page's title or canonical address.
writeFileSync(join(dist, 'shell.html'), base);

for (const page of data.pages) {
  const file = page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`;
  mkdirSync(dirname(join(dist, file)), { recursive: true });
  writeFileSync(join(dist, file), render(page));
}

const urls = data.pages.map((p) => `  <url>\n    <loc>${data.site}${p.path === '/' ? '/' : p.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.freq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`).join('\n');
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`SEO: wrote ${data.pages.length} pages and sitemap.xml`);
