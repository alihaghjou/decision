import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireOrgMember } from "./authz";

export const get = query({
  args: { orgId: v.string(), days: v.optional(v.number()) },
  handler: async (ctx, { orgId, days }) => {
    await requireOrgMember(ctx, orgId, "org:member");

    const windowDays = Math.min(Math.max(days ?? 7, 1), 60);
    const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;

    const recentDecisions = await ctx.db
      .query("decisions")
      .withIndex("byOrgCreatedAt", (q) => q.eq("orgId", orgId).gte("createdAt", cutoff))
      .order("desc")
      .collect();

    const open = await ctx.db
      .query("followups")
      .withIndex("byOrgStatusDueAt", (q) => q.eq("orgId", orgId).eq("status", "open"))
      .collect();

    const inProg = await ctx.db
      .query("followups")
      .withIndex("byOrgStatusDueAt", (q) => q.eq("orgId", orgId).eq("status", "inProgress"))
      .collect();

    const openFollowups = [...open, ...inProg];

    const now = Date.now();
    const in48h = now + 48 * 60 * 60 * 1000;

    const overdueCount = openFollowups.filter((f) => (f.dueAt ?? Infinity) < now).length;
    const dueSoonCount = openFollowups.filter((f) => {
      const d = f.dueAt ?? Infinity;
      return d >= now && d <= in48h;
    }).length;

    const grouped: Record<string, typeof openFollowups> = {};
    for (const f of openFollowups) {
      const key = f.assigneeId ?? "unassigned";
      (grouped[key] ??= []).push(f);
    }

    for (const key of Object.keys(grouped)) {
      grouped[key].sort(
        (a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity) || a.createdAt - b.createdAt
      );
    }

    return {
      recentDecisions,
      openFollowupsGroupedByAssignee: grouped,
      overdueCount,
      dueSoonCount,
      days: windowDays,
    };
  },
});