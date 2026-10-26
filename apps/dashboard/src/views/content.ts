import { ApiError } from '../lib/api';
import { html, mount, $ } from '../lib/html';
import { ic } from '../lib/icons';
import { ago, slugify } from '../lib/format';
import { emptyState, skeletonRows } from '../lib/ui';
import { canManage } from '../lib/session';
import { api, toast, badge, pageHead, formModal, inp, fail, errMsg } from './shared';

interface Page { id: string; slug: string; title: string; description: string | null; status: string; publishedAt: string | null; createdAt: string }

export async function renderContent(view: HTMLElement): Promise<void> {
  mount(view, html`${pageHead('Website pages', 'Pages you write here are stored in your workspace and can be published when ready.',
    canManage() ? html`<button class="btn btn-primary" data-add>${ic('plus', 'ico-sm')} New page</button>` : '')}
    <div class="alert alert-info" style="margin-bottom:16px">${ic('info', 'ico-sm')} Publishing marks a page live inside your workspace. A public delivery address for pages is not switched on yet.</div>
    <div class="card" id="pg"></div>`);
  const host = $('#pg', view)!;
  const load = async (): Promise<void> => {
    mount(host, skeletonRows(3));
    try {
      const { pages } = await api<{ pages: Page[] }>('/api/cms/pages');
      if (!pages.length) { mount(host, emptyState({ icon: 'file-text', title: 'No pages yet', text: 'Create your first page. It starts as a draft.' })); return; }
      mount(host, html`<div class="list">${pages.map((p) => html`<div class="list-item"><span class="icon-tile">${ic('file-text')}</span>
        <div class="grow"><b>${p.title}</b> ${badge(p.status === 'published' ? 'Published' : 'Draft', p.status === 'published' ? 'success' : 'warning')}<br><span class="muted small mono">/${p.slug}</span> <span class="muted small">· ${p.publishedAt ? `published ${ago(p.publishedAt)}` : `created ${ago(p.createdAt)}`}</span></div>
        ${canManage() && p.status !== 'published' ? html`<button class="btn btn-secondary btn-sm" data-pub="${p.id}">Publish</button>` : ''}</div>`)}</div>`);
      host.querySelectorAll<HTMLElement>('[data-pub]').forEach((b) => b.addEventListener('click', async () => {
        try { await api(`/api/cms/pages/${b.dataset.pub}/publish`, { method: 'POST' }); toast('Page published', 'success'); void load(); }
        catch (e) { toast(errMsg(e, 'Could not publish'), 'error'); }
      }));
    } catch (e) { mount(host, fail(host, e, () => void load(), 'Could not load pages')); }
  };
  $('[data-add]', view)?.addEventListener('click', () => formModal({
    title: 'New page', submitLabel: 'Create draft',
    body: html`<div class="field"><label for="pt">Title</label><input class="input" id="pt" maxlength="200" required></div>
      <div class="field"><label for="ps">Address</label><input class="input mono" id="ps" maxlength="120" placeholder="about-us"><span class="hint">Lowercase letters, numbers and dashes.</span></div>
      <div class="field"><label for="pd">Summary <span class="faint">(optional)</span></label><input class="input" id="pd" maxlength="300"></div>
      <div class="field"><label for="pb">Content</label><textarea class="textarea" id="pb" rows="7"></textarea></div>`,
    submit: async (el) => {
      const title = inp(el, '#pt'); const slug = slugify(inp(el, '#ps') || title);
      if (!title || !slug) throw new ApiError(0, 'Give the page a title');
      const body: Record<string, unknown> = { title, slug, content: { body: inp(el, '#pb') } };
      if (inp(el, '#pd')) body.description = inp(el, '#pd');
      await api('/api/cms/pages', { method: 'POST', body }); toast('Draft created', 'success'); void load();
    },
  }));
  await load();
}
