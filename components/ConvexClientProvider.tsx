"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { OrganizationSwitcher, useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <header className="sticky mb-4 top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        <Link href="/">
          <h1 className="text-xl font-bold">Decisions</h1>
        </Link>
        <div className="flex justify-center items-center gap-4">
          <UserButton />
          <OrganizationSwitcher />
        </div>
      </header>
      {children}
    </ConvexProviderWithClerk>
  );
}
