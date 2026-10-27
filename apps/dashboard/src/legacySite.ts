import legacyCss from './style.css?inline';
import { renderHomePage, setupHomePageEvents } from './pages/home';
import { renderPlatformPage } from './pages/platform';
import { renderArchitecturePage } from './pages/architecture';
import { renderModulesPage } from './pages/modules';
import { renderSolutionsPage } from './pages/solutions';
import { renderSecurityPage } from './pages/security';
import { renderDocsPage } from './pages/docs';
import { renderResourcesPage } from './pages/resources';
import { renderPricingPage } from './pages/pricing';
import { renderAboutPage } from './pages/about';
import { renderContactPage, setupContactPageEvents } from './pages/contact';
import { setupNavbarEvents } from './components/navbar';

type LegacyPage = 'home' | 'platform' | 'architecture' | 'modules' | 'solutions' | 'security' | 'docs' | 'resources' | 'pricing' | 'about' | 'contact';

export function clearLegacySiteStyles(): void {
  document.getElementById('legacy-site-style')?.remove();
}

export function renderLegacySite(page: LegacyPage): void {
  clearLegacySiteStyles();
  const style = document.createElement('style');
  style.id = 'legacy-site-style';
  style.textContent = legacyCss;
  document.head.appendChild(style);
  const root = document.getElementById('app');
  if (!root) return;
  const pages: Record<LegacyPage, () => string> = {
    home: renderHomePage,
    platform: renderPlatformPage,
    architecture: renderArchitecturePage,
    modules: renderModulesPage,
    solutions: renderSolutionsPage,
    security: renderSecurityPage,
    docs: renderDocsPage,
    resources: renderResourcesPage,
    pricing: renderPricingPage,
    about: renderAboutPage,
    contact: renderContactPage,
  };
  root.innerHTML = pages[page]();
  setupNavbarEvents();
  if (page === 'home') setupHomePageEvents();
  if (page === 'contact') setupContactPageEvents();
}
