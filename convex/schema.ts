import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  memberships: defineTable({
    orgId: v.string(),
    userId: v.string(),
    role: v.union(v.literal("org:admin"), v.literal("org:member")),
    createdAt: v.number(),
  }).index("byOrg", ["orgId"]).index("byOrgUser", ["orgId", "userId"]),
  decisions: defineTable({
    orgId: v.string(),
    title: v.string(),
    context: v.optional(v.string()),
    createdAt: v.number(),
    decision: v.string(),
    rationale: v.optional(v.string()),
    tags: v.array(v.string()),
    createdBy: v.string(),
    updatedAt: v.optional(v.number()),
  }).index("byOrgCreatedAt", ["orgId", "createdAt"]).index("byOrgCreatedAtCreatedBy", ["orgId", "createdAt", "createdBy"]),
  followups: defineTable({
    orgId: v.string(),
    decisionId: v.id("decisions"),
    title: v.string(),
    assigneeId: v.optional(v.string()),
    createdAt: v.number(),
    dueAt: v.optional(v.number()),
    status: v.union(v.literal("open"), v.literal("done"), v.literal("inProgress")),
    createdBy: v.string(),
    updatedAt: v.optional(v.number()),
  }).index("byOrdDecision", ["orgId", "decisionId"]).index("byOrgStatusDueAt", ["orgId", "status", "dueAt"]).index("byOrgAssigneeStatusDueAt", ["orgId", "assigneeId", "status", "dueAt"]),
  comments: defineTable({
    orgId: v.string(),
    decisionId: v.id("decisions"),
    authorId: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("byOrgDesicionCreatedAt", ["orgId", "decisionId", "createdAt"]),
});
