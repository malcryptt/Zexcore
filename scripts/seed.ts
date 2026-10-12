import {
  initializeDatabaseSchema,
  getDb,
  closeDatabaseConnection,
  tenants,
  users,
  memberships,
  contentTypes,
  records,
  hashPassword,
  eq,
  sql,
  withTenantDb,
} from '../packages/core/src/index.js';

async function seed() {
  console.log('[seed] Initializing database schema...');
  await initializeDatabaseSchema();

  const db = getDb();

  // Bypass RLS during platform seed provisioning
  await db.execute(sql`SELECT set_config('app.bypass_rls', 'on', false)`);

  console.log('[seed] Creating platform admin user...');
  const adminPasswordHash = await hashPassword('admin1234');
  let [platformAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@zexlabs.com'))
    .limit(1);

  if (!platformAdmin) {
    const [createdAdmin] = await db
      .insert(users)
      .values({
        email: 'admin@zexlabs.com',
        name: 'Platform Superadmin',
        passwordHash: adminPasswordHash,
        isPlatformAdmin: true,
      })
      .returning();
    platformAdmin = createdAdmin;
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
  const ownerPasswordHash = await hashPassword('owner1234');
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
    await db.insert(memberships).values({
      tenantId: demoTenant!.id,
      userId: tenantOwner!.id,
      principalType: 'tenant_admin',
      role: 'owner',
    });
  }

  // Re-lock RLS
  await db.execute(sql`SELECT set_config('app.bypass_rls', 'off', false)`);

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
  console.log('Platform Admin:  admin@zexlabs.com  / admin1234');
  console.log('Tenant Owner:    sarah@realtypros.com / owner1234');
  console.log('Tenant Slug:     realty-pros');
  console.log('----------------------------------------------------');

  await closeDatabaseConnection();
}

seed().catch((err) => {
  console.error('[seed] Error during seed:', err);
  process.exit(1);
});
