"use client"
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
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import z from "zod";

// const schema = z.object({
//   title: z.string().min(1, "Title required"),
//   decision: z.string().min(1, "Decision required"),
//   rationale: z.string().min(1, "Rationale required"),
//   tags: z.string().optional().or(z.literal("")),
//   context: z.string().optional().or(z.literal("")),
// });

export default function CreateDecision({ orgId }: { orgId: string }) {
  const createDecision = useMutation(api.decisions.create);

  const form = useForm({
    defaultValues: {
      title: "",
      decision: "",
      rationale: "",
      tags: "",
      context: "",
    },
    onSubmit: ({ value }) => {
      createDecision({
        orgId: orgId,
        title: value.title,
        decision: value.decision,
        rationale: value.rationale,
        tags: value.tags.split(",").map((tag) => tag.trim()),
        context: value.context,
      });
      form.reset();
    },
  });

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Create Decision</Button>
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
              <DialogTitle>Create Decision</DialogTitle>
              <DialogDescription>
                Create a new decision record.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
              <form.Field
                name="title"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Title</FieldLabel>
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
              <form.Field
                name="decision"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Decision</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="We will remove the login button and replace it with a link to the login page."
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="rationale"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Rationale</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="This will simplify the login process and reduce confusion for users."
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="tags"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="authentication, mobile, ui"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="context"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="mb-4">
                      <FieldLabel htmlFor={field.name}>Context</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Users have reported that the login button is not working on mobile devices."
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
            <DialogFooter className="gap-2 p-2">
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
