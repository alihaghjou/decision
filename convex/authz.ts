import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

export type Role = "org:member" | "org:admin";

const ROLE_RANK: Record<Role, number> = {
  "org:member": 1,
  "org:admin": 2,
};

export function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new ConvexError(message);
}

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const ident = await ctx.auth.getUserIdentity();
  assert(ident?.subject, "Not authenticated");
  return { userId: ident.subject };
}

export async function requireOrgMember(
  ctx: QueryCtx | MutationCtx,
  orgId: string,
  minRole: Role = "org:member"
) {
  const { userId } = await requireIdentity(ctx);

  const membership = await ctx.db
    .query("memberships")
    .withIndex("byOrgUser", (q) => q.eq("orgId", orgId).eq("userId", userId))
    .unique();

  assert(membership, "You are not a member of this organization");
  assert(
    ROLE_RANK[membership.role] >= ROLE_RANK[minRole],
    "Insufficient permissions"
  );

  return {
    userId,
    orgId,
    role: membership.role as Role,
    membershipId: membership._id,
  };
}

export function isAdmin(role: Role) {
  return role === "org:admin";
}

export function canEditDecision(role: Role, decisionCreatedBy: string, userId: string) {
  return role === "org:admin" || decisionCreatedBy === userId;
}