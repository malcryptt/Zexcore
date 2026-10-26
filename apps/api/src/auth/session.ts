import {
  and, eq, memberships, withTenantDb, resolveTenant, listUserWorkspaces, signAuthToken, type LoginUser,
} from '@zexcore/core';

export type SessionResult =
  | { kind: 'ok'; token: string; user: { id: string; email: string; name: string; isPlatformAdmin: boolean } }
  | { kind: 'choose'; workspaces: { slug: string; name: string }[] }
  | { kind: 'denied' };

/** Shared by password and Google sign-in: pick the workspace, verify membership, mint the token. */
export async function startSession(user: LoginUser, tenantSlug?: string): Promise<SessionResult> {
  let slug = tenantSlug;
  if (!slug && !user.is_platform_admin) {
    const workspaces = await listUserWorkspaces(user.id);
    if (workspaces.length > 1) return { kind: 'choose', workspaces: workspaces.map((w) => ({ slug: w.slug, name: w.name })) };
    slug = workspaces[0]?.slug;
  }

  let tenantId: string | undefined;
  let role: 'owner' | 'admin' | 'member' | 'viewer' | undefined;
  if (slug) {
    const t = await resolveTenant({ slug });
    if (!t) return { kind: 'denied' };
    // Membership is mandatory: proving who you are does not grant access to a workspace you don't belong to.
    const [m] = await withTenantDb(t.id, async (tx) =>
      tx.select().from(memberships).where(and(eq(memberships.tenantId, t.id), eq(memberships.userId, user.id))).limit(1),
    );
    if (!m && !user.is_platform_admin) return { kind: 'denied' };
    tenantId = t.id;
    role = m?.role as typeof role;
  }

  const token = signAuthToken({
    userId: user.id, tenantId, role,
    principalType: user.is_platform_admin ? 'platform_admin' : 'tenant_user',
    isPlatformAdmin: user.is_platform_admin,
  });
  return { kind: 'ok', token, user: { id: user.id, email: user.email, name: user.name, isPlatformAdmin: user.is_platform_admin } };
}
