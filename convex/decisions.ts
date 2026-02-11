import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOrgMember, canEditDecision, assert } from "./authz";

export const list = query({
  args: {
    orgId: v.string(),
    tag: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { orgId, tag, createdBy, limit }) => {
    await requireOrgMember(ctx, orgId, "org:member");

    const lim = Math.min(Math.max(limit ?? 50, 1), 200);

    const results = await ctx.db
      .query("decisions")
      .withIndex("byOrgCreatedAt", (q) => q.eq("orgId", orgId))
      .order("desc")
      .take(lim * 3);

    let filtered = results;
    if (createdBy) filtered = filtered.filter((d) => d.createdBy === createdBy);
    if (tag) filtered = filtered.filter((d) => d.tags.includes(tag));

    return filtered.slice(0, lim);
  },
});

export const get = query({
  args: { orgId: v.string(), decisionId: v.id("decisions") },
  handler: async (ctx, { orgId, decisionId }) => {
    await requireOrgMember(ctx, orgId, "org:member");

    const d = await ctx.db.get(decisionId);
    assert(d, "Decision not found");
    assert(d.orgId === orgId, "Access denied");
    return d;
  },
});

export const recent = query({
  args: { orgId: v.string(), days: v.optional(v.number()) },
  handler: async (ctx, { orgId, days }) => {
    await requireOrgMember(ctx, orgId, "org:member");

    const windowDays = Math.min(Math.max(days ?? 7, 1), 60);
    const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query("decisions")
      .withIndex("byOrgCreatedAt", (q) => q.eq("orgId", orgId).gte("createdAt", cutoff))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
    context: v.optional(v.string()),
    decision: v.string(),
    rationale: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { orgId, title, context, decision, rationale, tags }) => {
    const { userId } = await requireOrgMember(ctx, orgId, "org:member");
    const now = Date.now();

    const id = await ctx.db.insert("decisions", {
      orgId,
      title: title.trim(),
      context: context?.trim(),
      decision: decision.trim(),
      rationale: rationale?.trim(),
      tags: (tags ?? []).map((t) => t.trim()).filter(Boolean),
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    orgId: v.string(),
    decisionId: v.id("decisions"),
    patch: v.object({
      title: v.optional(v.string()),
      context: v.optional(v.string()),
      decision: v.optional(v.string()),
      rationale: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { orgId, decisionId, patch }) => {
    const me = await requireOrgMember(ctx, orgId, "org:member");

    const d = await ctx.db.get(decisionId);
    assert(d, "Decision not found");
    assert(d.orgId === orgId, "Access denied");

    assert(canEditDecision(me.role, d.createdBy, me.userId), "Cannot edit this decision");

    await ctx.db.patch(decisionId, {
      ...patch,
      tags: patch.tags ? patch.tags.map((t) => t.trim()).filter(Boolean) : undefined,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(decisionId);
  },
});

export const remove = mutation({
  args: { orgId: v.string(), decisionId: v.id("decisions") },
  handler: async (ctx, { orgId, decisionId }) => {
    await requireOrgMember(ctx, orgId, "org:admin");

    const d = await ctx.db.get(decisionId);
    assert(d, "Decision not found");
    assert(d.orgId === orgId, "Access denied");

    const fups = await ctx.db
      .query("followups")
      .withIndex("byOrdDecision", (q) => q.eq("orgId", orgId).eq("decisionId", decisionId))
      .collect();
    for (const f of fups) await ctx.db.delete(f._id);

    const comments = await ctx.db
      .query("comments")
      .withIndex("byOrgDesicionCreatedAt", (q) =>
        q.eq("orgId", orgId).eq("decisionId", decisionId)
      )
      .collect();
    for (const c of comments) await ctx.db.delete(c._id);

    await ctx.db.delete(decisionId);
    return { ok: true };
  },
});