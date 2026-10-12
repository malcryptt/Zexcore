import type { CapabilityDefinition } from '@zexcore/core';

export const CMS_CAPABILITIES = {
  PAGES_READ: 'cms:pages:read',
  PAGES_CREATE: 'cms:pages:create',
  PAGES_UPDATE: 'cms:pages:update',
  PAGES_DELETE: 'cms:pages:delete',
  PAGES_PUBLISH: 'cms:pages:publish',
  MEDIA_UPLOAD: 'cms:media:upload',
} as const;

export const cmsCapabilityDefinitions: CapabilityDefinition[] = [
  { name: CMS_CAPABILITIES.PAGES_READ, description: 'View CMS pages and content drafts', module: 'cms' },
  { name: CMS_CAPABILITIES.PAGES_CREATE, description: 'Create new CMS pages', module: 'cms' },
  { name: CMS_CAPABILITIES.PAGES_UPDATE, description: 'Edit existing CMS pages', module: 'cms' },
  { name: CMS_CAPABILITIES.PAGES_DELETE, description: 'Delete CMS pages', module: 'cms' },
  { name: CMS_CAPABILITIES.PAGES_PUBLISH, description: 'Publish CMS pages to public visitors', module: 'cms' },
  { name: CMS_CAPABILITIES.MEDIA_UPLOAD, description: 'Upload media assets to CMS', module: 'cms' },
];
