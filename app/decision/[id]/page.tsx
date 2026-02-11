"use client";

import OrgGate from "@/components/OrgGate";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useOrganization } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { convexToJson, jsonToConvex } from "convex/values";
import { useParams } from "next/navigation";

import DeleteFollowupButton from "./delete";
import CreateFollowup from "./createFollowup";
import CreateComment from "./createComment";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateFollowup from "./updateFollowup";

function asDecisionId(decisionIdParam: string): Id<"decisions"> {
  return jsonToConvex(convexToJson(decisionIdParam)) as Id<"decisions">;
}

export default function DecisionPage() {
  const pageParams = useParams();
  const decisionIdParam = pageParams.id;
  
  // Type guard to ensure we have a valid string
  if (!decisionIdParam || typeof decisionIdParam !== 'string') {
    return <div>Invalid decision ID</div>;
  }
  
  const decisionId: Id<"decisions"> = asDecisionId(decisionIdParam);

  const { organization, memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
  });
  const orgId = organization?.id || "";

  const decision = useQuery(api.decisions.get, {
    orgId,
    decisionId,
  });

  const followups = useQuery(api.followups.listByDecision, {
    orgId,
    decisionId,
  });

  const comments = useQuery(api.comments.listByDecision, {
    orgId,
    decisionId,
  });

  const followupStatusUpdate = useMutation(api.followups.setStatus);

  // Create a lookup function for user IDs to names/emails
  const getUserDisplay = (userId: string | undefined) => {
    if (!userId) return "Unassigned";

    const member = memberships?.data?.find(
      (m) => m.publicUserData?.userId === userId
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

  // Format date for display
  const formatDueDate = (timestamp: number | undefined) => {
    if (!timestamp) return "No due date";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <OrgGate>
      <main className="min-h-screen p-6 md:p-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          {/* Decision Header */}
          {decision === undefined ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{decision?.title}</CardTitle>
                <CardDescription>
                  Decision overview and related activity
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* FOLLOW-UPS */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Follow-ups</h2>
            </div>

            <CreateFollowup decisionId={decisionId} orgId={orgId} />

            <Separator />

            {/* Loading */}
            {followups === undefined && (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            )}

            {/* Empty */}
            {followups?.length === 0 && (
              <Card className="text-center py-8">
                <CardHeader>
                  <CardTitle>No follow-ups yet</CardTitle>
                  <CardDescription>
                    Track next steps by creating follow-ups.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* List */}
            {followups?.map((f) => (
              <Card key={f._id} className="transition-all hover:shadow-md p-2">
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-lg">{f.title}</p>

                      <p className="text-sm text-muted-foreground">
                        Assigned to: {getUserDisplay(f.assigneeId)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDueDate(f.dueAt)}
                      </p>

                      <Badge
                        variant={
                          f.status === "done"
                            ? "default"
                            : f.status === "inProgress"
                              ? "secondary"
                              : "outline"
                        }
                        className="w-fit capitalize"
                      >
                        {f.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        followupStatusUpdate({
                          followupId: f._id,
                          status: "done",
                          orgId,
                        })
                      }
                    >
                      Mark as Done
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        followupStatusUpdate({
                          followupId: f._id,
                          status: "inProgress",
                          orgId,
                        })
                      }
                    >
                      In Progress
                    </Button>

                    <UpdateFollowup
                      followupData={f}
                      orgId={orgId}
                      followupId={f._id}
                    />

                    <DeleteFollowupButton followup={f._id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* COMMENTS */}
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">Comments</h2>

            <CreateComment decisionId={decisionId} orgId={orgId} />

            <Separator />

            {/* Loading */}
            {comments === undefined && (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            )}

            {/* Empty */}
            {comments?.length === 0 && (
              <Card className="text-center py-8">
                <CardHeader>
                  <CardTitle>No comments yet</CardTitle>
                  <CardDescription>Start the discussion.</CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* List */}
            {comments?.map((c) => (
              <Card key={c._id} className="bg-background border-muted">
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed">{c.body}</p>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </main>
    </OrgGate>
  );
}