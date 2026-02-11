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

export default function CreateFollowup({
  orgId,
  decisionId,
}: {
  orgId: string;
  decisionId: Id<"decisions">;
}) {
  const { organization, memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
  });

  const createFollowup = useMutation(api.followups.create);

  const form = useForm({
    defaultValues: {
      title: "",
      assigneeId: "",
      dueAt: "",
    },
    onSubmit: ({ value }) => {
      createFollowup({
        orgId,
        decisionId,
        title: value.title,
        assigneeId: value.assigneeId && value.assigneeId !== "unassigned" 
          ? value.assigneeId 
          : undefined,
        dueAt: value.dueAt
          ? new Date(value.dueAt).getTime()
          : undefined,
      });
      form.reset();
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Followup</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <DialogHeader className="mb-3">
            <DialogTitle>Create Followup</DialogTitle>
            <DialogDescription>
              Create a new follow-up record.
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
                    onChange={(e) =>
                      field.handleChange(e.target.value)
                    }
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
                    onValueChange={(v) =>
                      field.handleChange(v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {memberships?.data?.map((membership) => (
                        <SelectItem
                          key={membership.id}
                          value={membership.publicUserData?.userId || membership.id}
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
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value
                      )
                    }
                  />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-6 gap-2">
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}