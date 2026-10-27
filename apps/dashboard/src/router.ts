export interface RouteCtx { path: string; params: Record<string, string>; query: URLSearchParams }
export type Handler = (ctx: RouteCtx) => void | Promise<void>;

interface Route { re: RegExp; keys: string[]; handler: Handler }
const routes: Route[] = [];
let notFound: Handler = () => {};
let beforeEach: (ctx: RouteCtx) => string | void | Promise<string | void> = () => {};
let afterEach: (ctx: RouteCtx) => void = () => {};

export function route(pattern: string, handler: Handler): void {
  const keys: string[] = [];
  const re = new RegExp('^' + pattern.replace(/:([a-z]+)/gi, (_m, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  routes.push({ re, keys, handler });
}
export const setNotFound = (h: Handler): void => { notFound = h; };
export const setGuard = (g: typeof beforeEach): void => { beforeEach = g; };
export const setAfter = (a: typeof afterEach): void => { afterEach = a; };

let seq = 0;
export async function resolve(): Promise<void> {
  const my = ++seq;
  const path = decodeURI(location.pathname) || '/';
  const query = new URLSearchParams(location.search);
  let ctx: RouteCtx = { path, params: {}, query };
  for (const r of routes) {
    const m = r.re.exec(path);
    if (!m) continue;
    r.keys.forEach((k, i) => { ctx.params[k] = decodeURIComponent(m[i + 1]!); });
    const redirect = await beforeEach(ctx);
    if (my !== seq) return;
    if (redirect) { history.replaceState(null, '', redirect); return resolve(); }
    await r.handler(ctx);
    if (my === seq) afterEach(ctx);
    return;
  }
  ctx = { path, params: {}, query };
  const redirect = await beforeEach(ctx);
  if (redirect) { history.replaceState(null, '', redirect); return resolve(); }
  await notFound(ctx);
  if (my === seq) afterEach(ctx);
}

export function navigate(to: string, replace = false): void {
  if (to === location.pathname + location.search) { void resolve(); return; }
  replace ? history.replaceState(null, '', to) : history.pushState(null, '', to);
  void resolve();
}

export function startRouter(): void {
  // Legacy hash links (#/platform) from the previous site map onto real paths.
  if (location.hash.startsWith('#/')) history.replaceState(null, '', location.hash.slice(1));
  window.addEventListener('popstate', () => void resolve());
  window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#/')) {
      history.replaceState(null, '', location.hash.slice(1));
      void resolve();
    }
  });
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-link]');
    if (!a || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('/')) return;
    e.preventDefault();
    navigate(href);
    if (!href.includes('#')) window.scrollTo({ top: 0 });
  });
  void resolve();
}
