import { auth, clerkClient } from '@clerk/nextjs/server'
import { OrganizationSwitcher, useOrganization } from '@clerk/nextjs'

export default async function Page() {
    const requiredOrgName = 'Acme Corp'
  const { isAuthenticated, orgId, has } = await auth()

  // Check if the user is authenticated
  if (!isAuthenticated) return <p>You must be signed in to access this page.</p>

  // Check if there is an Active Organization
  if (!orgId) return <p>Set an Active Organization to access this page.</p>

  // Check if the user has the `org:admin` Role
  if (!has({ role: 'org:admin' })) return <p>You must be an admin to access this page.</p>

  // Initialize the JS Backend SDK
  // This varies depending on the SDK you're using
  // https://clerk.com/docs/js-backend/getting-started/quickstart
  const client = await clerkClient()

  // Use the `getOrganization()` method to get the Backend `Organization` object
  const organization = await client.organizations.getOrganization({ organizationId: orgId })

  // Check if Organization name matches (e.g. 'Acme Corp')
  if (organization.name !== requiredOrgName)
    return (
      <p>
        This page is only accessible in the <strong>{requiredOrgName}</strong> Organization. Switch
        to the <strong>{requiredOrgName}</strong> Organization to access this page.
      </p>
    )

  return (
    <p>
      You are currently signed in as an <strong>admin</strong> in the{' '}
      <strong>{organization.name}</strong> Organization.
    </p>
  )
}