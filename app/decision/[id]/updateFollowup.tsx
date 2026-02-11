"use client";
import { Button } from "@/components/ui/button";
import {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Dialog,
} from "@/components/ui/dialog";
import {
  FieldGroup,
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { useEffect } from "react";

interface FollowupData {
  title: string;
  assigneeId?: string;
  dueAt?: number;
}

export default function UpdateFollowup({
  orgId,
  followupId,
  followupData,
}: {
  orgId: string;
  followupId: Id<"followups">;
  followupData: FollowupData;
}) {
  const { memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
  });

  const updateFollowup = useMutation(api.followups.update);

  const form = useForm({
    defaultValues: {
      title: followupData.title || "",
      assigneeId: followupData.assigneeId || "unassigned",
      dueAt: followupData.dueAt
        ? new Date(followupData.dueAt).toISOString().split("T")[0]
        : "",
    },
    onSubmit: async ({ value }) => {
      updateFollowup({
        orgId,
        followupId,
        patch: {
          title: value.title || undefined,
          assigneeId:
            value.assigneeId && value.assigneeId !== "unassigned"
              ? value.assigneeId
              : undefined,
          dueAt: value.dueAt ? new Date(value.dueAt).getTime() : undefined,
        },
      });
    },
  });

  // Update form values when followup data changes
  useEffect(() => {
    form.setFieldValue("title", followupData.title || "");
    form.setFieldValue("assigneeId", followupData.assigneeId || "unassigned");
    form.setFieldValue(
      "dueAt",
      followupData.dueAt
        ? new Date(followupData.dueAt).toISOString().split("T")[0]
        : "",
    );
  }, [followupData]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Update Followup</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <DialogHeader className="mb-3">
            <DialogTitle>Update Followup</DialogTitle>
            <DialogDescription>
              Update an existing follow-up record.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="space-y-4">
            {/* TITLE */}
            <form.Field
              name="title"
              children={(field) => (
                <Field>
                  <FieldLabel>Title</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
            {/* ASSIGNEE SELECT */}
            <form.Field
              name="assigneeId"
              children={(field) => (
                <Field>
                  <FieldLabel>Assignee</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {memberships?.data?.map((membership) => (
                        <SelectItem
                          key={membership.id}
                          value={
                            membership.publicUserData?.userId || membership.id
                          }
                        >
                          {membership.publicUserData?.identifier ||
                            membership.publicUserData?.firstName ||
                            "Unknown Member"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            {/* DUE DATE */}
            <form.Field
              name="dueAt"
              children={(field) => (
                <Field>
                  <FieldLabel>Due Date</FieldLabel>
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-6 gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
