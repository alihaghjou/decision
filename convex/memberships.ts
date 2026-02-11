import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOrgMember, requireIdentity, assert, isAdmin } from "./authz";

export const getMyRole = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    const { role } = await requireOrgMember(ctx, orgId, "org:member");
    return role;
  },
});

export const list = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    await requireOrgMember(ctx, orgId, "org:admin");
    return await ctx.db
      .query("memberships")
      .withIndex("byOrg", (q) => q.eq("orgId", orgId))
      .collect();
  },
});

/**
 * Lazy membership:
 * If the user is in the Clerk org (enforced in your UI) but missing in Convex,
 * create them as "member".
 */
export const ensureMyMembership = mutation({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    const { userId } = await requireIdentity(ctx);

    const existing = await ctx.db
      .query("memberships")
      .withIndex("byOrgUser", (q) => q.eq("orgId", orgId).eq("userId", userId))
      .unique();

    if (existing) return existing;

    const now = Date.now();
    const id = await ctx.db.insert("memberships", {
      orgId,
      userId,
      role: "org:member",
      createdAt: now,
    });

    return await ctx.db.get(id);
  },
});

/**
 * First-run onboarding:
 * If org has no memberships yet, current user becomes "admin".
 * If already initialized, returns caller's membership (or null if not present).
 */
export const initializeOrg = mutation({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    const { userId } = await requireIdentity(ctx);

    const any = await ctx.db
      .query("memberships")
      .withIndex("byOrg", (q) => q.eq("orgId", orgId))
      .first();

    if (any) {
      return await ctx.db
        .query("memberships")
        .withIndex("byOrgUser", (q) => q.eq("orgId", orgId).eq("userId", userId))
        .unique();
    }

    const now = Date.now();
    const id = await ctx.db.insert("memberships", {
      orgId,
      userId,
      role: "org:admin",
      createdAt: now,
    });

    return await ctx.db.get(id);
  },
});

export const setRole = mutation({
  args: {
    orgId: v.string(),
    targetUserId: v.string(),
    role: v.union(v.literal("org:member"), v.literal("org:admin")),
  },
  handler: async (ctx, { orgId, targetUserId, role }) => {
    const me = await requireOrgMember(ctx, orgId, "org:admin");
    assert(isAdmin(me.role), "Insufficient permissions");

    const target = await ctx.db
      .query("memberships")
      .withIndex("byOrgUser", (q) => q.eq("orgId", orgId).eq("userId", targetUserId))
      .unique();

    assert(target, "Target user is not a member");

    await ctx.db.patch(target._id, { role });
    return await ctx.db.get(target._id);
  },
});

export const remove = mutation({
  args: { orgId: v.string(), targetUserId: v.string() },
  handler: async (ctx, { orgId, targetUserId }) => {
    const me = await requireOrgMember(ctx, orgId, "org:admin");
    assert(isAdmin(me.role), "Insufficient permissions");
    assert(me.userId !== targetUserId, "Admin cannot remove themselves");

    const target = await ctx.db
      .query("memberships")
      .withIndex("byOrgUser", (q) => q.eq("orgId", orgId).eq("userId", targetUserId))
      .unique();

    assert(target, "Target user is not a member");

    await ctx.db.delete(target._id);
    return { ok: true };
  },
});