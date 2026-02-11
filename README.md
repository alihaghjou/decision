# Decision Tracking System

A collaborative decision-tracking and follow-up management application built with Next.js, Convex, and Clerk authentication.

## Features

### 🎯 Decision Management
- Create and track organizational decisions
- View detailed decision pages with full context
- Organize decisions by organization

### ✅ Follow-up Tracking
- Create follow-ups for each decision
- Assign tasks to team members
- Set due dates and track progress
- Update follow-up status (To Do, In Progress, Done)
- Visual status indicators with color-coded badges

### 📊 Handoff Reports
- Dashboard view of all open tasks
- Overdue and due-soon task counts
- Recent decisions overview
- Tasks grouped by assignee
- Unassigned tasks section

### 💬 Comments & Collaboration
- Add comments to decisions
- Track discussion history
- Collaborative decision-making

### 👥 Team Management
- Organization-based access control
- Member assignment system
- Display names and emails for assignees
- Infinite scrolling member lists

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Convex (real-time backend)
- **Authentication**: Clerk (organization management)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Form Management**: TanStack Form
- **Icons**: Lucide React

## Project Structure

```
app/
├── decision/
│   └── [id]/
│       ├── page.tsx              # Decision detail page
│       ├── createFollowup.tsx    # Create follow-up dialog
│       ├── updateFollowup.tsx    # Update follow-up dialog
│       ├── createComment.tsx     # Create comment form
│       └── delete.tsx            # Delete follow-up button
├── handoff/
│   └── page.tsx                  # Handoff dashboard
└── layout.tsx                    # Root layout with providers

components/
├── ui/                           # shadcn/ui components
│   ├── card.tsx
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   ├── separator.tsx
│   └── skeleton.tsx
└── OrgGate.tsx                   # Organization access guard

convex/
├── decisions.ts                  # Decision queries/mutations
├── followups.ts                  # Follow-up queries/mutations
├── comments.ts                   # Comment queries/mutations
└── handoff.ts                    # Handoff report queries
```

## Key Components

### Decision Page (`app/decision/[id]/page.tsx`)
Displays a single decision with:
- Decision title and description
- List of follow-ups with status tracking
- Action buttons (Mark as Done, In Progress, Update, Delete)
- Comments section
- Real-time updates via Convex

### Handoff Dashboard (`app/handoff/page.tsx`)
Overview dashboard showing:
- Overdue and due-soon task counts
- Recent decisions (configurable time period)
- Tasks grouped by assignee (with name resolution)
- Unassigned tasks section
- Status cards with visual indicators

### Follow-up Dialogs
**Create Follow-up** (`createFollowup.tsx`):
- Title input
- Assignee selection (organization members)
- Due date picker
- Form validation

**Update Follow-up** (`updateFollowup.tsx`):
- Pre-populated form with existing data
- Same fields as create dialog
- Controlled dialog state

### User Display Resolution
Converts Clerk user IDs to friendly display names:
1. First Name + Last Name
2. First Name only
3. Email/Identifier
4. User ID (fallback)

## Data Models

### Decision
```typescript
{
  _id: Id<"decisions">,
  orgId: string,
  title: string,
  _creationTime: number
}
```

### Follow-up
```typescript
{
  _id: Id<"followup">,
  orgId: string,
  decisionId: Id<"decisions">,
  title: string,
  assigneeId?: string,
  dueAt?: number,
  status: "todo" | "inProgress" | "done",
  _creationTime: number
}
```

### Comment
```typescript
{
  _id: Id<"comments">,
  orgId: string,
  decisionId: Id<"decisions">,
  body: string,
  _creationTime: number
}
```

### Handoff Report
```typescript
{
  days: number,
  overdueCount: number,
  dueSoonCount: number,
  recentDecisions: Array<{
    decision: string,
    _creationTime: number
  }>,
  openFollowupsGroupedByAssignee: {
    [assigneeId: string]: Array<{
      _id: Id<"followup">,
      title: string,
      dueAt?: number
    }>,
    unassigned: Array<...>
  }
}
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Clerk account
- Convex account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_***
CLERK_SECRET_KEY=sk_***
NEXT_PUBLIC_CONVEX_URL=https://***convex.cloud
```

4. Run Convex setup:
```bash
npx convex dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a Decision
1. Navigate to the decisions page
2. Click "Create Decision"
3. Enter decision details
4. Submit the form

### Managing Follow-ups
1. Open a decision detail page
2. Click "Create Followup"
3. Fill in:
   - Title
   - Assignee (optional)
   - Due date (optional)
4. Track status with action buttons
5. Update or delete as needed

### Viewing Handoff Report
1. Navigate to `/handoff`
2. View overdue and due-soon counts
3. Review recent decisions
4. Check assigned and unassigned tasks
5. Tasks are automatically grouped by assignee

### Adding Comments
1. Open a decision detail page
2. Scroll to comments section
3. Enter comment text
4. Submit

## Organization Features

### Access Control
- All data is scoped to organizations
- Users must be part of an organization to access
- `OrgGate` component enforces organization membership

### Member Management
- Automatic member fetching with infinite scroll
- Real-time member list updates
- Name resolution for all user references

## Styling & UI

### Design System
- Uses shadcn/ui components for consistency
- Tailwind CSS for custom styling
- Responsive design (mobile-first)
- Dark mode support

### Color Coding
- **Overdue tasks**: Red (destructive)
- **Due soon**: Orange
- **Done status**: Default badge
- **In Progress**: Secondary badge
- **To Do**: Outline badge

### Status Indicators
- Circular status dots
- Color-coded badges
- Icon indicators (Clock, AlertCircle, CheckCircle2)

## Real-time Features

### Convex Integration
- Automatic UI updates on data changes
- Optimistic updates for mutations
- Real-time collaboration
- No manual refresh needed

### Loading States
- Skeleton loaders for async data
- Smooth transitions
- Progressive enhancement

## Error Handling

- Type guards for route parameters
- Graceful fallbacks for missing data
- User-friendly error messages
- Form validation

## Performance Optimizations

- Infinite scroll for large member lists
- Conditional rendering
- Efficient data queries
- Memoized user display resolution

## Future Enhancements

- [ ] Search and filter functionality
- [ ] Email notifications for due dates
- [ ] Decision templates
- [ ] Bulk operations
- [ ] Export reports (PDF, CSV)
- [ ] Analytics dashboard
- [ ] Task dependencies
- [ ] Recurring follow-ups
- [ ] File attachments
- [ ] @mentions in comments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: [your contact info]

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend by [Convex](https://convex.dev/)
- Auth by [Clerk](https://clerk.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)