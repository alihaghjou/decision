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
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";

export default function CreateComment({
  orgId,
  decisionId,
}: {
  orgId: string;
  decisionId: Id<"decisions">;
}) {
  const createComment = useMutation(api.comments.create);

  const form = useForm({
    defaultValues: {
      body: "",
    },
    onSubmit: ({ value }) => {
      createComment({
        orgId: orgId,
        decisionId: decisionId,
        body: value.body,
      });
      form.reset();
    },
  });

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Create Comment</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <form
            id="create-decision-form"
            onSubmit={(e) => {
              console.log("Submitting form");
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <DialogHeader className="mb-3">
              <DialogTitle>Create Comment</DialogTitle>
              <DialogDescription>
                Create a new decision record.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
              <form.Field
                name="body"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="mb-4">
                      <FieldLabel htmlFor={field.name}>Comment</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Login button not working on mobile"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
            <DialogFooter className="gap-2 p-2 mt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <>
                    <Button type="submit" disabled={!canSubmit}>
                      {isSubmitting ? "..." : "Submit"}
                    </Button>
                    <Button
                      type="reset"
                      onClick={(e) => {
                        // Avoid unexpected resets of form elements (especially <select> elements)
                        e.preventDefault();
                        form.reset();
                      }}
                    >
                      Reset
                    </Button>
                  </>
                )}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
