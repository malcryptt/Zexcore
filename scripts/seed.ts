import crypto from 'node:crypto';
import {
  initializeDatabaseSchema,
  getAdminDb,
  closeDatabaseConnection,
  tenants,
  users,
  memberships,
  contentTypes,
  records,
  hashPassword,
  eq,
  withTenantDb,
} from '../packages/core/src/index.js';

async function seed() {
  if (process.env.NODE_ENV === 'production' && process.env.SEED_ALLOW_PRODUCTION !== 'true') {
    throw new Error('Refusing to seed demo data in production (set SEED_ALLOW_PRODUCTION=true to override).');
  }
  // Never ship known passwords: take them from env, or generate random ones and print once.
  const adminEmail = process.env.SEED_ADMIN_EMAIL || adminEmail;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(18).toString('base64url');
  const ownerPassword = process.env.SEED_OWNER_PASSWORD || crypto.randomBytes(18).toString('base64url');
  if (!process.env.SEED_ADMIN_PASSWORD) console.log(`[seed] Generated platform admin password (shown once): ${adminPassword}`);
  if (!process.env.SEED_OWNER_PASSWORD) console.log(`[seed] Generated demo owner password (shown once): ${ownerPassword}`);

  console.log('[seed] Initializing database schema...');
  await initializeDatabaseSchema();

  // Provisioning runs on the ADMIN (schema owner) connection, like a real onboarding job.
  const db = getAdminDb();

  console.log('[seed] Creating platform admin user...');
  const adminPasswordHash = await hashPassword(adminPassword);
  let [platformAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (!platformAdmin) {
    const [createdAdmin] = await db
      .insert(users)
      .values({
        email: adminEmail,
        name: 'Platform Superadmin',
        passwordHash: adminPasswordHash,
        isPlatformAdmin: true,
      })
      .returning();
    platformAdmin = createdAdmin;
  } else {
    await db
      .update(users)
      .set({ passwordHash: adminPasswordHash, isPlatformAdmin: true })
      .where(eq(users.email, adminEmail));
  }

  console.log('[seed] Creating demo tenant: Realty Pros...');
  let [demoTenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, 'realty-pros'))
    .limit(1);

  if (!demoTenant) {
    const [createdTenant] = await db
      .insert(tenants)
      .values({
        slug: 'realty-pros',
        name: 'Realty Pros Luxury Estates',
        tier: 'standard',
        config: {
          activePack: 'realty',
          enabledModules: ['cms', 'crm'],
          features: {
            aiAssistant: true,
          },
        },
      })
      .returning();
    demoTenant = createdTenant;
  }

  console.log('[seed] Creating tenant owner user...');
  const ownerPasswordHash = await hashPassword(ownerPassword);
  let [tenantOwner] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'sarah@realtypros.com'))
    .limit(1);

  if (!tenantOwner) {
    const [createdOwner] = await db
      .insert(users)
      .values({
        email: 'sarah@realtypros.com',
        name: 'Sarah Connor',
        passwordHash: ownerPasswordHash,
        isPlatformAdmin: false,
      })
      .returning();
    tenantOwner = createdOwner;

    // Create owner membership
    await withTenantDb(demoTenant!.id, (tx) =>
      tx.insert(memberships).values({
        tenantId: demoTenant!.id,
        userId: tenantOwner!.id,
        principalType: 'tenant_admin',
        role: 'owner',
      }),
    );
  }

  // Seed sample Realty Property ContentType scoped to tenant
  console.log('[seed] Seeding property listing content type for Realty Pros...');
  await withTenantDb(demoTenant!.id, async (tx) => {
    let [propType] = await tx
      .select()
      .from(contentTypes)
      .where(eq(contentTypes.slug, 'property'))
      .limit(1);

    if (!propType) {
      const [newType] = await tx
        .insert(contentTypes)
        .values({
          tenantId: demoTenant!.id,
          slug: 'property',
          name: 'Real Estate Property',
          description: 'Luxury estate property listings with dynamic specifications',
          schemaJson: {
            fields: [
              { key: 'title', label: 'Property Title', type: 'string', required: true },
              { key: 'price', label: 'Listing Price ($)', type: 'number', required: true },
              { key: 'bedrooms', label: 'Bedrooms', type: 'number', required: true },
              { key: 'bathrooms', label: 'Bathrooms', type: 'number', required: true },
              { key: 'location', label: 'City / Neighborhood', type: 'string', required: true },
              {
                key: 'status',
                label: 'Status',
                type: 'select',
                options: ['available', 'under_offer', 'sold'],
                required: true,
              },
            ],
          },
        })
        .returning();
      propType = newType;

      // Seed a sample property record
      await tx.insert(records).values({
        tenantId: demoTenant!.id,
        contentTypeId: propType!.id,
        slug: 'oceanview-villa-malibu',
        status: 'published',
        data: {
          title: 'Oceanview Villa Malibu',
          price: 4850000,
          bedrooms: 5,
          bathrooms: 6,
          location: 'Malibu, CA',
          status: 'available',
        },
        createdBy: tenantOwner!.id,
      });
    }
  });

  console.log('[seed] Database seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Platform Admin:  hello@zexcore.com.ng  / admin1234');
  console.log('Tenant Owner:    sarah@realtypros.com / owner1234');
  console.log('Tenant Slug:     realty-pros');
  console.log('----------------------------------------------------');

  await closeDatabaseConnection();
}

seed().catch((err) => {
  console.error('[seed] Error during seed:', err);
  process.exit(1);
});
