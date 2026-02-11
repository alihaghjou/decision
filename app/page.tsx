"use client";

import { Authenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import OrgGate from "@/components/OrgGate";
import Link from "next/link";
import CreateDecision from "./createDecision";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <OrgGate>
      <main className="min-h-screen p-6 md:p-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Divide Your Decisions
            </h1>
            <p className="text-muted-foreground">
              Manage and review organizational decisions
            </p>
          </div>

          <Authenticated>
            <Content />
          </Authenticated>
        </div>
      </main>
    </OrgGate>
  );
}

function Content() {
  const { organization } = useOrganization();
  const orgId = organization?.id || "";
  const decisions = useQuery(api.decisions.list, { orgId });

  return (
    <div className="flex flex-col gap-6">
      {/* Create Decision */}
      <CreateDecision orgId={orgId} />

      <Separator />

      {/* Loading State */}
      {decisions === undefined && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {decisions?.length === 0 && (
        <Card className="text-center py-10">
          <CardHeader>
            <CardTitle>No decisions yet</CardTitle>
            <CardDescription>
              Create your first decision to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Decisions List */}
      {decisions?.map((d) => (
        <Card
          key={d._id}
          className="transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <CardHeader>
            <Link href={`/decision/${d._id}`} className="group">
              <CardTitle className="group-hover:underline">
                {d.title}
              </CardTitle>
            </Link>
            <CardDescription>{d.decision}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Rationale */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {d.rationale}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {d.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full px-3"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
