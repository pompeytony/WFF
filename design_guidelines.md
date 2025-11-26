# Fantasy Football League Admin Interface - Design Guidelines

## Design Approach
**Design System Selection:** Linear-inspired productivity interface with Material Design data components. This combination provides the clean aesthetics of modern SaaS tools with robust table/form patterns needed for bulk operations.

**Key Principles:**
- Information clarity over decoration
- Efficient bulk operation workflows
- Clear visual hierarchy for complex data sets
- Scannable layouts for quick admin tasks

## Typography System
- **Primary Font:** Inter (Google Fonts)
- **Monospace Font:** JetBrains Mono (for scores, stats, IDs)

**Hierarchy:**
- Page Headers: text-3xl font-semibold
- Section Headers: text-xl font-semibold
- Subsections: text-lg font-medium
- Body/Labels: text-sm font-medium
- Data Values: text-sm font-normal
- Helper Text: text-xs text-gray-500

## Layout System
**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 for consistency
- Component padding: p-4 to p-6
- Section spacing: mb-6 to mb-8
- Form gaps: gap-4
- Table cell padding: p-4

**Container Structure:**
- Max-width: max-w-7xl for main content area
- Sidebar navigation: w-64 fixed left
- Main content: ml-64 with px-8 py-6

## Core Layout Structure

**Top Navigation Bar:**
- Fixed header with league selector dropdown, admin name/avatar, notification bell
- Height: h-16
- Contains breadcrumb navigation for context

**Sidebar Navigation:**
- Sections: Dashboard, Fixtures, Results, Players, Teams, Bulk Operations, Settings
- Active state indication with subtle background treatment
- Icon + label pattern using Heroicons

**Main Content Area:**
- Tabbed interface for bulk operation categories (Fixtures, Results, Players)
- Each tab reveals operation-specific tools and data tables

## Component Library

**Bulk Operation Cards:**
- Large action cards (300px height) in 2-column grid for desktop, stack on mobile
- Each card: Icon, title, description, "Start Bulk Edit" button
- Cards for: Bulk Fixture Upload, Batch Result Entry, Player Data Import, Mass Team Updates

**Data Tables:**
- Sticky header row with column sorting indicators
- Checkbox column for row selection
- Alternating subtle row backgrounds for scannability
- Compact row height with p-4 cell padding
- Action column (right-aligned) with icon buttons
- Pagination controls below table

**Bulk Edit Panel:**
- Slide-out drawer (w-96) from right side
- Header: "Editing X items" with close button
- Form fields with clear labels
- Preview of changes before commit
- Action buttons: Cancel (ghost), Apply Changes (primary)

**Forms:**
- Grouped fields with dividing borders
- Label above input pattern
- Help text below inputs when needed
- Required field indicators (asterisk)
- Date pickers, dropdowns, and text inputs styled consistently

**Selection Controls:**
- "Select All" checkbox in table headers
- Bulk action toolbar appears when items selected, fixed to top of content
- Shows count: "12 items selected" with action buttons

**Status Indicators:**
- Pills/badges for fixture status (Scheduled, In Progress, Completed)
- Color-coded by semantic meaning
- Small size: px-2 py-1 text-xs rounded-full

**Filter Bar:**
- Horizontal bar above tables with quick filter chips
- Dropdowns for date ranges, teams, status
- Search input with icon
- Clear all filters button

## Page-Specific Layouts

**Dashboard Overview:**
- 4-column stat cards at top (Total Fixtures, Pending Results, Active Players, Teams)
- Recent activity feed
- Quick action buttons for common bulk operations

**Bulk Fixtures Page:**
- CSV upload zone (drag-drop area with icon, h-48)
- Fixture template download link
- Table preview of parsed data with validation indicators
- Field mapping interface for CSV columns to database fields

**Bulk Results Page:**
- Game week selector dropdown
- Table showing all fixtures for selected week
- Inline editing cells for scores
- "Copy from previous week" helper function
- Batch save all changes button (prominent, top-right)

**Bulk Players Page:**
- Search/filter bar to find players
- Multi-select table with player details
- Bulk edit sidebar for: Position, Team, Injury Status, Price
- Import/export CSV functionality

## Icons
**Library:** Heroicons (CDN)
- Navigation: ViewGrid, Calendar, Trophy, Users, Database, Cog
- Actions: Upload, Download, Edit, Trash, Check, X
- Data: ArrowUp/Down (sorting), Funnel (filter)

## Images
**No hero image** - This is a data-focused admin tool where immediate access to operations is priority.

**Dashboard accent:** Optional decorative illustration (300x200px) in empty state when no recent activity - football-themed line art

## Interactions
- Table row hover: subtle background change
- Button states: standard modern SaaS patterns
- Loading states: skeleton screens for tables, spinners for buttons
- Toast notifications for operation success/failure (top-right)
- Modal confirmations for destructive bulk actions

## Responsive Behavior
- Desktop (lg+): Full sidebar + multi-column layouts
- Tablet (md): Collapsible sidebar, 2-column grids become single
- Mobile: Hamburger menu, all cards stack, tables scroll horizontally with sticky first column