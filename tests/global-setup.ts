// Installs schema, RLS, security functions and grants ONCE before any test file runs.
// Requires ADMIN_DATABASE_URL (schema owner) and DATABASE_URL (restricted runtime role).
export default async function setup() {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  const core = await import('../packages/core/src/index.js');
  await core.initializeDatabaseSchema();
  await core.closeDatabaseConnection();
}
