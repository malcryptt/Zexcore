import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { cmsPages } from '../schema/pages.js';
import { CMS_EVENTS } from '../events.js';
import { eq, desc } from '@zexcore/core';
import { withTenantDb } from '@zexcore/core';

interface CreatePageBody {
  slug: string;
  title: string;
  description?: string;
  content?: Record<string, unknown>;
}

export function registerCmsRoutes(server: FastifyInstance, core: ZexCoreContext): void {
  // 1. List all CMS pages for current tenant
  server.get(
    '/api/cms/pages',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const tenant = (request as any).tenant;
      if (!tenant || !tenant.id) {
        return reply.status(400).send({ error: 'Tenant context required' });
      }

      const pagesList = await withTenantDb(tenant.id, async (tx) => {
        return await tx
          .select()
          .from(cmsPages)
          .where(eq(cmsPages.tenantId, tenant.id))
          .orderBy(desc(cmsPages.createdAt));
      });

      return reply.send({ pages: pagesList });
    },
  );

  // 2. Create CMS page
  server.post(
    '/api/cms/pages',
    async (request: FastifyRequest<{ Body: CreatePageBody }>, reply: FastifyReply) => {
      const tenant = (request as any).tenant;
      if (!tenant || !tenant.id) {
        return reply.status(400).send({ error: 'Tenant context required' });
      }

      const { slug, title, description, content } = request.body;

      const [newPage] = await withTenantDb(tenant.id, async (tx) => {
        return await tx
          .insert(cmsPages)
          .values({
            tenantId: tenant.id,
            slug,
            title,
            description,
            content: content || {},
            status: 'draft',
          })
          .returning();
      });

      // Emit event through core event bus
      await core.events.emit(CMS_EVENTS.PAGE_CREATED, {
        tenantId: tenant.id,
        payload: {
          pageId: newPage!.id,
          slug: newPage!.slug,
          title: newPage!.title,
          status: newPage!.status,
        },
        sourceModule: 'cms',
      });

      return reply.status(201).send({ page: newPage });
    },
  );

  // 3. Publish CMS page
  server.post(
    '/api/cms/pages/:id/publish',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const tenant = (request as any).tenant;
      if (!tenant || !tenant.id) {
        return reply.status(400).send({ error: 'Tenant context required' });
      }

      const { id } = request.params;

      const [updatedPage] = await withTenantDb(tenant.id, async (tx) => {
        return await tx
          .update(cmsPages)
          .set({
            status: 'published',
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(cmsPages.id, id))
          .returning();
      });

      if (!updatedPage) {
        return reply.status(404).send({ error: 'Page not found' });
      }

      // Emit event through core event bus
      await core.events.emit(CMS_EVENTS.PAGE_PUBLISHED, {
        tenantId: tenant.id,
        payload: {
          pageId: updatedPage.id,
          slug: updatedPage.slug,
          title: updatedPage.title,
          status: updatedPage.status,
        },
        sourceModule: 'cms',
      });

      return reply.send({ page: updatedPage });
    },
  );
}
