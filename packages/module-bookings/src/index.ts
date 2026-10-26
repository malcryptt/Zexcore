import type { ZexModule, ZexCoreContext } from '@zexcore/core';
import type { FastifyInstance } from 'fastify';
import { applyRlsToTable, sql } from '@zexcore/core';
import { bookingsCapabilityDefinitions } from './permissions.js';
import { BOOKINGS_DDL, BOOKINGS_OWNER_BYPASS_TABLES } from './schema.js';
import { registerManageRoutes } from './routes/manage.js';
import { registerPublicRoutes } from './routes/public.js';

export * from './permissions.js';
export { generateSlotStarts, isValidSlotStart, normalizePhone } from './lib/slots.js';

export const bookingsModule: ZexModule = {
  name: 'bookings',
  version: '1.0.0',
  description: 'Appointments & bookings: services, staff, public booking page, deposits and customer inbox',
  permissions: bookingsCapabilityDefinitions,

  async onInit(core: ZexCoreContext): Promise<void> {
    await core.db.execute(sql.raw(BOOKINGS_DDL));
    for (const table of ['bk_settings', 'bk_services', 'bk_staff', 'bk_bookings', 'bk_messages']) {
      await applyRlsToTable(table);
    }
    // zex_settle_deposit() is a SECURITY DEFINER function owned by the schema owner and runs from a signed
    // webhook with no tenant context. It sets the tenant GUC itself, but locating the booking by payment
    // reference needs the OWNER to bypass RLS on these two tables. The runtime role (not owner, no BYPASSRLS)
    // stays fully subject to the tenant policy.
    for (const table of BOOKINGS_OWNER_BYPASS_TABLES) {
      await core.db.execute(sql.raw(`ALTER TABLE ${table} NO FORCE ROW LEVEL SECURITY`));
    }
    core.logger.info('[bookings] Tables & RLS initialised');
  },

  async registerRoutes(server: FastifyInstance): Promise<void> {
    registerManageRoutes(server);
    registerPublicRoutes(server);
  },
};

export default bookingsModule;
