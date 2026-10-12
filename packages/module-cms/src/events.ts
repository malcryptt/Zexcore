export const CMS_EVENTS = {
  PAGE_CREATED: 'cms.page.created',
  PAGE_UPDATED: 'cms.page.updated',
  PAGE_PUBLISHED: 'cms.page.published',
  PAGE_DELETED: 'cms.page.deleted',
} as const;

export interface CmsPageEventPayload {
  pageId: string;
  slug: string;
  title: string;
  status: string;
}
