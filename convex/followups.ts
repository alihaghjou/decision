import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOrgMember, assert } from "./authz";

export const listByDecision = query({
  args: { orgId: v.string(), decisionId: v.id("decisions") },
  handler: async (ctx, { orgId, decisionId }) => {
    await requireOrgMember(ctx, orgId, "org:member");

    const decision = await ctx.db.get(decisionId);
    assert(decision, "Decision not found");
    assert(decision.orgId === orgId, "Access denied");

    return await ctx.db
      .query("followups")
      .withIndex("byOrdDecision", (q) => q.eq("orgId", orgId).eq("decisionId", decisionId))
      .collect();
  },
});

export const listOpen = query({
  args: {
    orgId: v.string(),
    assigneeId: v.optional(v.string()),
    dueBefore: v.optional(v.number()),
    includeOverdue: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { orgId, assigneeId, dueBefore, includeOverdue, limit }) => {
    await requireOrgMember(ctx, orgId, "org:member");

    const lim = Math.min(Math.max(limit ?? 100, 1), 300);
    const now = Date.now();
    const includeOv = includeOverdue ?? true;

    const open = await ctx.db
      .query("followups")
      .withIndex("byOrgStatusDueAt", (q) => q.eq("orgId", orgId).eq("status", "open"))
      .collect();

    const inProg = await ctx.db
      .query("followups")
      .withIndex("byOrgStatusDueAt", (q) => q.eq("orgId", orgId).eq("status", "inProgress"))
      .collect();

    let items = [...open, ...inProg];

    if (assigneeId) items = items.filter((f) => f.assigneeId === assigneeId);
    if (dueBefore != null) items = items.filter((f) => (f.dueAt ?? Infinity) <= dueBefore);
    if (!includeOv) items = items.filter((f) => (f.dueAt ?? Infinity) >= now);

    items.sort(
      (a, b) =>
        (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity) || a.createdAt - b.createdAt
    );

    return items.slice(0, lim);
  },
});

export const create = mutation({
  args: {
    orgId: v.string(),
    decisionId: v.id("decisions"),
    title: v.string(),
    assigneeId: v.optional(v.string()),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, { orgId, decisionId, title, assigneeId, dueAt }) => {
    const { userId } = await requireOrgMember(ctx, orgId, "org:member");

    const decision = await ctx.db.get(decisionId);
    assert(decision, "Decision not found");
    assert(decision.orgId === orgId, "Access denied");

    const now = Date.now();
    const id = await ctx.db.insert("followups", {
      orgId,
      decisionId,
      title: title.trim(),
      assigneeId,
      dueAt,
      status: "open",
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

export const setStatus = mutation({
  args: {
    orgId: v.string(),
    followupId: v.id("followups"),
    status: v.union(v.literal("open"), v.literal("inProgress"), v.literal("done")),
  },
  handler: async (ctx, { orgId, followupId, status }) => {
    const me = await requireOrgMember(ctx, orgId, "org:member");

    const f = await ctx.db.get(followupId);
    assert(f, "Follow-up not found");
    assert(f.orgId === orgId, "Access denied");

    const can =
      me.role === "org:admin" ||
      (f.assigneeId != null && f.assigneeId === me.userId) ||
      f.createdBy === me.userId;

    assert(can, "You cannot update this follow-up");

    await ctx.db.patch(followupId, { status, updatedAt: Date.now() });
    return await ctx.db.get(followupId);
  },
});

export const update = mutation({
  args: {
    orgId: v.string(),
    followupId: v.id("followups"),
    patch: v.object({
      title: v.optional(v.string()),
      assigneeId: v.optional(v.string()),
      dueAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { orgId, followupId, patch }) => {
    const me = await requireOrgMember(ctx, orgId, "org:member");

    const f = await ctx.db.get(followupId);
    assert(f, "Follow-up not found");
    assert(f.orgId === orgId, "Access denied");

    assert(me.role === "org:admin" || f.createdBy === me.userId, "You cannot edit this follow-up");

    await ctx.db.patch(followupId, {
      ...patch,
      title: patch.title ? patch.title.trim() : undefined,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(followupId);
  },
});

export const remove = mutation({
  args: { orgId: v.string(), followupId: v.id("followups") },
  handler: async (ctx, { orgId, followupId }) => {
    const me = await requireOrgMember(ctx, orgId, "org:member");

    const f = await ctx.db.get(followupId);
    assert(f, "Follow-up not found");
    assert(f.orgId === orgId, "Access denied");

    assert(me.role === "org:admin" || f.createdBy === me.userId, "You cannot delete this follow-up");

    await ctx.db.delete(followupId);
    return { ok: true };
  },
});