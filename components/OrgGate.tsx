"use client"
import { api } from "@/convex/_generated/api";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrgGate({ children }: { children: React.ReactNode }) {
    const { isSignedIn } = useAuth()
    const { organization, isLoaded } = useOrganization();
    const orgId = organization?.id || "";
    const member = useMutation(api.memberships.ensureMyMembership);
    const initializeOrg = useMutation(api.memberships.initializeOrg);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isSignedIn) {
        throw redirect("/sign");
    }

    useEffect(() => {
        if (!isLoaded) return;
        if (!orgId) return
        let cancelled = false;

        async function run() {
            try {
                setError(null)
                const res = await initializeOrg({ orgId });
                if (!res) {
                    await member({ orgId });
                }
                if (!cancelled) setReady(true);
            } catch (e) {
                if (!cancelled) setError((e as Error).message);
            }
        }
        run()
        return () => {
            cancelled = true;
        }
    }, [orgId, initializeOrg, member, isLoaded]);

    if (!isLoaded) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;
    if(!orgId) return <div className="text-red-500">No organization found. Please create an organization in Clerk dashboard.</div>
    if (!ready) return <div>Loading organization...</div>;
    return <>{children}</>;
}
    
