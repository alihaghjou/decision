import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOrgMember, assert } from "./authz";

export const listByDecision = query({
  args: {
    orgId: v.string(),
    decisionId: v.id("decisions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { orgId, decisionId, limit }) => {
    await requireOrgMember(ctx, orgId, "org:member");

    const decision = await ctx.db.get(decisionId);
    assert(decision, "Decision not found");
    assert(decision.orgId === orgId, "Access denied");

    const lim = Math.min(Math.max(limit ?? 200, 1), 500);

    return await ctx.db
      .query("comments")
      .withIndex("byOrgDesicionCreatedAt", (q) =>
        q.eq("orgId", orgId).eq("decisionId", decisionId)
      )
      .order("asc")
      .take(lim);
  },
});

export const create = mutation({
  args: { orgId: v.string(), decisionId: v.id("decisions"), body: v.string() },
  handler: async (ctx, { orgId, decisionId, body }) => {
    const { userId } = await requireOrgMember(ctx, orgId, "org:member");

    const decision = await ctx.db.get(decisionId);
    assert(decision, "Decision not found");
    assert(decision.orgId === orgId, "Access denied");

    const text = body.trim();
    assert(text.length > 0, "Comment is empty");

    const id = await ctx.db.insert("comments", {
      orgId,
      decisionId,
      authorId: userId,
      body: text,
      createdAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { orgId: v.string(), commentId: v.id("comments") },
  handler: async (ctx, { orgId, commentId }) => {
    const me = await requireOrgMember(ctx, orgId, "org:member");

    const c = await ctx.db.get(commentId);
    assert(c, "Comment not found");
    assert(c.orgId === orgId, "Access denied");

    assert(me.role === "org:admin" || c.authorId === me.userId, "You cannot delete this comment");

    await ctx.db.delete(commentId);
    return { ok: true };
  },
});