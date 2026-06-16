# Personal Tasks & Notes App — MVP Specification

## 1. Product Vision

Build a small, personal, offline-first web app for managing tasks and notes.

The app is for one user only. It should not become a generic productivity platform. Every feature must support the owner’s workflow directly.

Core principle:

> Small, adaptable software that fits my workflow exactly.

## 2. Primary Goals

- Replace the Microsoft To Do interface with a simpler custom workflow.
- Keep Microsoft To Do as the source of truth for tasks.
- Store notes as readable files in the app's default OneDrive application folder.
- Work in browser on desktop and mobile.
- Work offline.
- Avoid backend infrastructure.
- Keep the app simple enough to maintain personally.

## 3. Non-Goals

Not included in MVP:

- Multi-user support
- Collaboration
- Sharing
- Backend database
- Custom notifications
- Full-text search
- Wiki links / backlinks
- Project management
- Task subtasks/checklists
- Note rename/move
- Images in notes
- Encryption
- Password manager
- SSH key store

## 4. High-Level Architecture

The app is a Progressive Web App.

### Client

- React
- TypeScript
- PWA
- IndexedDB
- Service Worker
- Microsoft Graph integration

### Backend

None.

### Sources of Truth

| Data        | Source of truth                               |
| ----------- | --------------------------------------------- |
| Tasks       | Microsoft To Do                               |
| Notes       | Files in the OneDrive application folder      |
| Inbox       | Root of the OneDrive application folder       |
| Projects    | Subfolders in the OneDrive application folder |
| Local cache | IndexedDB                                     |

IndexedDB is only a cache and offline working store.

## 5. Authentication

MVP uses Microsoft login only.

Authentication should use MSAL.

MSAL is responsible for:

- login
- consent
- account state
- token acquisition
- token refresh / silent renewal where available

The app requires Microsoft Graph access to:

- Microsoft To Do
- OneDrive application folder only

OneDrive access should use the least privileged app-folder scope available for the account type, such as `Files.ReadWrite.AppFolder`.

Future secure note types may use a separate passphrase, but encryption is out of MVP.

## 6. Navigation

Default desktop landing page: **Today tasks**.

Default mobile landing page: **Navigation**.

Navigation:

`Notes` and `Projects` are section headings only. They are not clickable navigation destinations.

```text
Today
Later
Backlog

Notes:
Inbox
Starred

Projects:
Project 1
Project 2
Project 3
```

## 7. Tasks

### 7.1 Task Source

Tasks are stored in Microsoft To Do.

MVP uses the default Microsoft To Do task list only.

Other Microsoft To Do task lists are not shown or managed in MVP.

### 7.2 Task Fields

Supported fields:

- title
- notes/body
- due date
- priority
- status

Completion is represented by `status = completed`.

Backlog is represented by `status = deferred`.

Excluded from MVP:

- subtasks/checklists
- attachments
- custom tags
- reminders management

Microsoft To Do official apps remain responsible for reminders and notifications.

### 7.3 Task Views

#### Today

Contains:

```text
status != Deferred
AND
(due date <= today OR due date is empty)
```

Meaning:

> Active commitments requiring attention now.

#### Later

Contains:

```text
status != Deferred
AND
due date > today
```

Meaning:

> Scheduled future work.

#### Backlog

Contains:

```text
status = Deferred
```

Meaning:

> Explicitly deferred work.

### 7.4 Task Sorting

#### Today

Sort by:

1. Priority: high → normal → low
2. Due date: oldest first
3. Tasks without due date
4. Title, then local task ID as stable tie-breakers

#### Later

Sort by:

1. Due date ascending
2. Priority
3. Title, then local task ID as stable tie-breakers

#### Backlog

Sort by:

1. Priority
2. Due date
3. Tasks without due date
4. Title, then local task ID as stable tie-breakers

### 7.5 Desktop Task Actions

Desktop must support task actions through buttons or menus:

- Complete
- Move to Today
- Move to Tomorrow
- Move to Next Week
- Move to Next Month
- Defer to Backlog
- Edit task details

Reschedule shortcut behavior:

- Move to Today: set due date to today
- Move to Tomorrow: set due date to tomorrow
- Move to Next Week: set due date to the next Monday
- Move to Next Month: set due date to the 1st of the next month

### 7.6 Offline Task Behavior

The app supports offline:

- create task
- edit task
- complete task
- reschedule task
- defer task

Offline changes are stored locally and synchronized later.

Multiple offline changes to the same task collapse into the latest local task state.

Individual unsynced tasks are not visually marked. Sync status is global.

## 8. Notes

### 8.1 Note Storage

Notes are stored as files in the app's default OneDrive application folder.

The app should request access only to its own OneDrive application folder, not the user's full OneDrive.

Files should remain readable and editable outside the app.

The root of the application folder is the Inbox. Notes stored directly in the root appear in the Inbox view.

### 8.2 Projects

A project is a single-level subfolder inside the OneDrive application folder.

MVP behavior:

- App discovers project folders from subfolders of the OneDrive application folder.
- App does not create projects.
- App does not rename projects.
- App does not delete projects.
- Nested project folders are not supported.
- Notes in the application folder root belong to Inbox, not to a project.

Example:

```text
Inbox Note.md
Shopping.list.md
Client A/
Client B/
House Renovation/
Development KB/
PC Setup KB/
Travel History/
```

### 8.3 Note Types

MVP supports two note types:

1. Markdown note
2. List note

### 8.4 Markdown Notes

Markdown notes are stored as `.md` files.

The editor should be WYSIWYG-first.

Raw markdown/source editing may be added later but is not required for MVP.

Example:

```markdown
---
type: markdown
starred: true
---

# PostgreSQL Notes

Content here.
```

### 8.5 List Notes

List notes are a separate file type.

Recommended MVP format: `.list.md`.

List files remain human-readable and editable outside the app.

Example:

```markdown
---
type: list
starred: false
---

## Bathroom

- [ ] Mirror
- [ ] Towels

## Kitchen

- [x] Faucet
- [ ] LED strip
```

### 8.6 List Note Features

List notes support:

- groups
- list items
- checkbox status
- reorder groups
- reorder items within a group
- move items between groups
- desktop drag-and-drop
- mobile touch drag-and-drop

List item fields:

- text
- completed

No priority, due date, notes, links, tags, or attachments.

### 8.7 Starred Notes

Only individual notes can be starred.

Starred status is stored inside the markdown file frontmatter.

Example:

```yaml
---
type: markdown
starred: true
---
```

Starred view shows starred notes from all projects.

### 8.8 Note Metadata

Stored in frontmatter:

- type
- starred

Not stored in frontmatter:

- created date
- updated date
- file size

The app relies on OneDrive metadata for timestamps.

In IndexedDB, frontmatter values are stored as normalized note fields, not as a nested frontmatter object.

### 8.9 Note Creation Flow

User flow:

```text
Open Notes
Open project folder
Click Create
Select note type
Enter file name
Click Create
Start editing immediately
```

### 8.10 Save Behavior

Auto-save only.

No required manual Save button.

Show status:

- Saving…
- Saved
- Offline changes
- Sync failed

### 8.11 Delete Behavior

Deleting a note deletes the file from OneDrive.

Recovery is handled through OneDrive Recycle Bin.

No custom app recycle bin.

## 9. Synchronization

### 9.1 Sync Model

Hybrid sync:

- automatic sync while the app is open and online
- manual “Sync now” action
- visible global sync status

Statuses:

- Synced
- Syncing
- Offline
- Offline changes
- Sync failed

Sync should run:

- on app startup when online
- when network connectivity returns
- when the user triggers Sync now
- 30 seconds after the latest local pending write while online
- every 60 minutes while the app is open, online, and signed in
- when the tab becomes visible again if the last successful sync is older than one minute

The app uses a local-wins conflict strategy for both tasks and notes:

- Tasks: last-write-wins
- Notes: local pending edits overwrite the remote OneDrive file during sync

### 9.2 Task Sync

The app supports offline task changes:

- create task
- edit task
- complete task
- reschedule task
- defer task

Offline task changes are stored in IndexedDB.

For each task, the app only needs to retain the latest local task state before sync.

When sync runs, the latest local task state is written to Microsoft To Do.

Task conflicts use last-write-wins.

No task conflict UI is required for MVP.

If a locally changed task was deleted remotely before sync, the app should keep the local unsynced state and show global Sync failed status.

Task reads use Microsoft Graph task delta queries for both initial load and later synchronization.

The app stores the latest task delta link per default Microsoft To Do list.

Initial task sync calls the task delta endpoint without a saved delta link.

Later task sync calls the saved delta link and applies only returned creates, updates, and delete tombstones.

### 9.3 Note Sync and Recovery

If the same note is changed locally and remotely, the latest local pending note state is authoritative for MVP sync.

When sync runs, local pending note edits are written over the remote OneDrive file. The app does not create conflict copies and does not provide merge UI in MVP.

Users can manually recover overwritten remote changes using OneDrive file version history.

The app supports offline note browsing and editing using IndexedDB cache.

When online returns, local changes sync to OneDrive.

### 9.4 PWA Behavior

Use `vite-plugin-pwa` for PWA integration.

The service worker should precache:

- app shell
- compiled static assets
- offline fallback page or route

The service worker should not cache authenticated Microsoft Graph API responses.

Persistent task and note data must be stored in IndexedDB, not in the service worker cache.

Offline edits are stored in IndexedDB and synchronized by app code.

The Background Sync API is optional and not required for MVP.

App updates should apply on next reload or next app start. A custom update prompt is not required for MVP.

The app manifest should define:

- app name
- short name
- standalone display mode
- theme color
- background color
- required install icons

## 10. UI Principles

- Fast startup
- Today view first
- Minimal screens
- Minimal settings
- No unnecessary dashboards
- No generic productivity bloat
- Mobile and desktop both first-class
- Simple flat task lists
- Folder-first notes browsing

### 10.1 Desktop Layout

Desktop uses a persistent three-column layout:

1. Sidebar: navigation sections and destinations
2. List column: tasks or notes for the selected destination
3. Content column: selected task details or selected note editor/viewer

The sidebar controls scope. The list column shows the items in that scope. The content column shows the currently selected item.

Opening an item must not navigate away from the list on desktop. The list should preserve scroll position and selection while the content column changes.

If no item is selected, the content column shows an empty state appropriate to the current view.

### 10.2 Mobile Layout

Mobile uses a drill-in layout:

```text
Navigation -> List -> Content
```

The navigation screen is the mobile root route.

Users can move back from content to list and from list to navigation.

### 10.3 Tablet Layout

Tablet may use either:

- the desktop three-column layout when space allows
- a two-column layout when space is constrained

Two-column tablet layouts should prioritize showing the list and content together after a navigation destination is selected.

## 11. MVP Build Priorities

### Phase 1 — App Shell and Local Foundation

- Vite, React, TypeScript setup
- TanStack Router file-based routes
- Tailwind CSS and shadcn/ui setup
- Desktop three-column layout
- Mobile drill-in layout
- Main navigation sections and destinations
- IndexedDB schema with Dexie
- Zod schemas for local records and frontmatter
- Global sync status model

### Phase 2 — Microsoft Integration Foundation

- MSAL authentication
- Microsoft Graph permission scopes
- Direct Microsoft Graph API wrapper
- Default Microsoft To Do task list discovery
- OneDrive application folder access
- Graph response normalization with Zod
- Online initial load for tasks and notes metadata

### Phase 3 — Tasks Vertical Slice

- Today / Later / Backlog task views
- Task sorting rules
- Task detail editor using TanStack Form
- Complete/reschedule/defer actions
- Move to Today / Tomorrow / Next Week / Next Month
- Offline task state storage in IndexedDB
- Task sync using last-write-wins

### Phase 4 — Notes Vertical Slice

- Inbox notes from the OneDrive application folder root
- Project discovery from application folder subfolders
- Starred notes parsed from file frontmatter and cached as local note fields
- Note list and selected note content pane
- Create markdown note
- Edit markdown notes with TipTap
- Auto-save to IndexedDB and OneDrive

### Phase 5 — Sync and PWA Hardening

- Offline note browsing and editing
- Local-wins note sync with OneDrive version history recovery
- Manual Sync now
- Sync on app startup
- Sync when network connectivity returns
- Sync error handling and recovery states
- PWA manifest
- Service worker app-shell precaching
- Offline fallback route
- Basic installability verification

### Phase 6 — Nice to Have

- Create list note
- Edit list notes
- List note drag-and-drop with dnd-kit
- Mobile swipe actions:
  - Today:
    - Swipe right: complete task
    - Swipe left: set due date to tomorrow
  - Later:
    - Swipe right: move to Today
    - Swipe left: defer to Backlog
  - Backlog:
    - Swipe right: move to Today
    - Swipe left: no action

## 12. Recommended Technology Choices

### Frontend

- React
- TypeScript
- Vite
- TanStack Router with file-based routing
- Router-only client-side mode; no SSR
- TanStack Form for forms
- Zod for schema validation
- Tailwind CSS
- shadcn/ui components based on Base UI
- IndexedDB via Dexie
- vite-plugin-pwa
- MSAL for Microsoft authentication
- Direct Microsoft Graph API wrapper

### Markdown Editing

Use TipTap with markdown serialization.

Selection criteria:

- WYSIWYG editing
- Markdown file output
- mobile usability
- low complexity
- maintainability

### Forms and Validation

Use TanStack Form for form state and submission.

Use Zod schemas for:

- form values
- note frontmatter
- Microsoft Graph response normalization
- IndexedDB records
- offline sync payloads

TipTap editor state is managed by TipTap, not TanStack Form. Validate and serialize editor content at save and sync boundaries.

### Drag-and-Drop

Candidate options:

- dnd-kit

Use for list note group/item ordering.

## 13. Key Risks

### Microsoft Graph API limitations

Some Microsoft To Do features may not map perfectly through Graph.

Mitigation:

- keep MVP task model simple
- avoid subtasks/checklists
- avoid custom reminders
- use standard To Do fields only

### Offline sync complexity

Offline support introduces conflict handling and local state reconciliation.

Mitigation:

- tasks use last-write-wins
- notes use local-wins sync and OneDrive version history for recovery
- global sync status
- avoid per-item sync UI

### WYSIWYG Markdown complexity

Markdown round-tripping can become messy.

Mitigation:

- keep supported markdown subset modest
- avoid images in MVP
- avoid advanced markdown extensions initially

### Scope creep

The biggest product risk is adding too many productivity features.

Mitigation:

- no feature enters MVP unless it directly supports the owner’s workflow

## 14. MVP Success Criteria

The MVP is successful if:

- The app opens to Today quickly.
- Tasks can be managed faster than in Microsoft To Do.
- Today / Later / Backlog workflow feels natural.
- Notes can be browsed by project folder.
- Markdown and list notes remain readable in OneDrive.
- App works offline for common daily actions.
- Sync is reliable enough for personal use.
- Codebase remains understandable and maintainable by one developer.
