"use client"
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function SignInForm() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) {
    throw redirect("/");
  }
  return (
    <>
      <div className="flex flex-col gap-8 w-96 mx-auto">
        <p>Log in to see the numbers</p>
        <SignInButton mode="modal">
          <Button>
            Sign in
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button>
            Sign up
          </Button>
        </SignUpButton>
      </div>
    </>
  );
}
