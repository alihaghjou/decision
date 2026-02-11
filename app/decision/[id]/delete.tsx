"use client"
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useParams } from "next/navigation";

export default function DeleteFollowupButton({followup}: {followup: Id<"followups">}) {
    const {has, isSignedIn} = useAuth()
    const { organization } = useOrganization();
    const orgId = organization?.id || "";
    const deleteFollowup = useMutation(api.followups.remove)

    if (!isSignedIn || !has({role: "org:admin"})) {
        return <p>You do not have permission to delete this followup.</p>
    }

    return <Button
        className="bg-red-500 text-white px-4 py-2 rounded-md"
        onClick={() => deleteFollowup({followupId: followup, orgId: orgId})}
    >
        Delete followup
    </Button>
}