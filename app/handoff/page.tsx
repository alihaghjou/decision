"use client";
import OrgGate from "@/components/OrgGate";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function HandOff() {
  const { organization, memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
  });
  const orgId = organization?.id?? "";
  const handoffData = useQuery(api.handoff.get, { orgId: orgId });

  // Create a lookup map for user IDs to names/emails
  const getUserDisplay = (userId: string) => {
    const member = memberships?.data?.find(
      (m) => m.publicUserData?.userId === userId,
    );

    if (member && member.publicUserData) {
      const { firstName, lastName, identifier } = member.publicUserData;

      // Try to build a full name
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
      if (firstName) {
        return firstName;
      }
      // Fall back to email/identifier
      return identifier || userId;
    }

    return userId;
  };

  // Get all assignee keys except 'unassigned'
  const assignees = handoffData?.openFollowupsGroupedByAssignee
    ? Object.keys(handoffData.openFollowupsGroupedByAssignee).filter(
        (key) => key !== "unassigned",
      )
    : [];

  const unassignedTasks =
    handoffData?.openFollowupsGroupedByAssignee?.unassigned || [];

  return (
    <OrgGate>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Handoff Report</h1>
          <Badge variant="secondary" className="text-sm">
            Last {handoffData?.days || 0} days
          </Badge>
        </div>

        {/* Status Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue Tasks
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {handoffData?.overdueCount || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {handoffData?.dueSoonCount || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Recent Decisions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Recent Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {handoffData?.recentDecisions?.length ? (
              <ul className="space-y-2">
                {handoffData.recentDecisions.map((decision, i) => (
                  <li
                    key={i}
                    className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm"
                  >
                    {decision.decision}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent decisions
              </p>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Open Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Open Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Assigned Tasks - Iterate through all assignees */}
            {assignees.length > 0
              ? assignees.map((assigneeId) => {
                  const tasks =
                    handoffData?.openFollowupsGroupedByAssignee[assigneeId];
                  if (!tasks?.length) return null;

                  return (
                    <div key={assigneeId}>
                      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {getUserDisplay(assigneeId)}
                      </h3>
                      <ul className="space-y-2">
                        {tasks.map((task, i) => (
                          <li
                            key={task._id || i}
                            className="flex items-center gap-2 rounded-md border bg-background p-3 hover:bg-accent transition-colors"
                          >
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span className="text-sm">{task.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              : null}

            {/* Unassigned Tasks */}
            {unassignedTasks.length > 0 ? (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Unassigned
                </h3>
                <ul className="space-y-2">
                  {unassignedTasks.map((task, i) => (
                    <li
                      key={task._id || i}
                      className="flex items-center gap-2 rounded-md border bg-background p-3 hover:bg-accent transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      <span className="text-sm">{task.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              !assignees.length && (
                <p className="text-sm text-muted-foreground">No open tasks</p>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </OrgGate>
  );
}
