# GlobeTrotter

**A personalized, multi-city travel planning application.**

GlobeTrotter lets authenticated users build multi-city itineraries, assign stop dates and activities, estimate and visualize budgets, discover cities and activities, reorder plans, switch between list and calendar views, and share or publish trips for others to copy. The design deliberately avoids unnecessary services and AI components, favoring a direct, requirements-traceable architecture.

## Tech Stack

**Frontend**
- React + TypeScript, built with Vite
- Tailwind CSS + shadcn/ui for styling and accessible UI primitives
- TanStack Query for server state, caching, and mutation handling
- dnd-kit for drag-and-drop reordering of stops/activities
- Recharts for budget/cost visualization
- FullCalendar (Standard) for the calendar view; the vertical timeline is a custom React list

**Backend**
- Supabase for:
  - PostgreSQL (relational persistence)
  - Auth (email/password, session/JWT, password recovery)
  - Storage (cover photos, profile photos, activity images)
  - Row-Level Security (RLS) for private / shared / public authorization

No custom application server, no realtime collaboration, and no ML/recommendation engine are part of the required baseline — these are explicitly optional future extensions.

## Core Concepts

- **Trip** — a user-owned trip with a name, date range, description, budget, currency, and visibility (`private` / `shared` / `public`).
- **Trip Stop** — an ordered city stop within a trip, with arrival/departure dates.
- **Activity** — a catalog item tied to a city (type, duration, estimated cost).
- **Stop Activity** — a scheduled instance of an activity within a stop (date, time, cost, position).
- **Expense Item** — a categorized cost entry (`transport`, `stay`, `activity`, `meal`) tied to a trip and optionally a stop.
- **Trip Share** — grants a specific user read access to a non-public trip.
- **Saved Destination** — a user's bookmarked city.

Visibility is enforced at the database layer via RLS, not just in the UI — a modified client cannot bypass authorization.

## Screens / Functional Requirements

| ID | Screen | Summary |
|----|--------|---------|
| FR1 | Login / Signup | Email/password auth, forgot-password flow, validation |
| FR2 | Dashboard | Welcome, recent/upcoming trips, Plan New Trip, recommendations, budget highlights |
| FR3 | Create Trip | Name, dates, description, optional cover photo |
| FR4 | My Trips | Trip cards with date range, destination count, view/edit/delete |
| FR5 | Itinerary Builder | Add stops, pick city + dates, assign activities, reorder cities |
| FR6 | Itinerary View | Day-wise/city-grouped layout, cost per activity block, list/calendar toggle |
| FR7 | City Search | Search + region filter, city metadata (country, cost index, popularity) |
| FR8 | Activity Search | Filter by type/cost/duration, descriptions, images |
| FR9 | Budget | Total estimate, category breakdown, pie/bar charts, daily average, over-budget alerts |
| FR10 | Calendar / Timeline | Calendar or vertical timeline, expandable days, drag-to-reorder |
| FR11 | Shared / Public View | Public URL, read-only summary, Copy Trip, social sharing |
| FR12 | Profile / Settings | Name/photo/email, language, saved destinations, privacy, account deletion |
| FR13 | Admin / Analytics | *(Optional)* usage dashboard, popular cities/activities, user management |

## Architecture

```
Traveler (Desktop / Mobile Browser)
        │
        ▼
React + TypeScript UI (Vite build)
Tailwind + shadcn/ui, TanStack Query
        │
        ▼
Supabase Client (typed queries/mutations)
        │
   ┌────┼─────────────┬───────────────┐
   ▼    ▼              ▼               ▼
PostgreSQL   Supabase Auth   Supabase Storage   (Realtime — optional, unused)
(trips,      (email/password, (cover/profile/
 stops,       recovery)       activity images)
 activities,
 costs, RLS)
```

The frontend talks directly to Supabase's generated data APIs, protected entirely by PostgreSQL RLS — no intermediate application server is required for the baseline scope.

## Database Schema (summary)

- `profiles` — id (FK → Auth user), name, photo_path, language
- `trips` — id, owner_id, name, description, start_date, end_date, budget_amount, currency, cover_path, visibility, public_slug
- `cities` — id, name, country, region, cost_index, popularity, image_path
- `trip_stops` — id, trip_id, city_id, arrival_date, departure_date, position
- `activities` — id, city_id, name, type, description, duration, estimated_cost, image_path
- `stop_activities` — id, stop_id, activity_id, scheduled_date, start_time, estimated_cost, position, notes
- `expense_items` — id, trip_id, stop_id (nullable), date, category, label, amount
- `trip_shares` — (trip_id, shared_with_user_id)
- `saved_destinations` — (user_id, city_id)

Constraints: trip/stop end dates must not precede start dates; costs and budgets must be non-negative. Copy Trip is performed as a single atomic transaction (trip + stops + activities + expenses).

## Row-Level Security Policies (representative)

- Owners can select/insert/update/delete their own trips.
- A trip is selectable if the requester owns it, it's public, or it's shared with them via `trip_shares`.
- Child rows (stops, activities, expenses) inherit selectability from their parent trip; mutation requires trip ownership.
- Catalog tables (`cities`, `activities`) are readable by all users but not client-writable.
- Profiles are readable/writable only by their owner, except minimal fields intentionally exposed on public itineraries.
- Public pages read from a restricted view that omits private profile fields and share records.
- Public itinerary URLs use high-entropy slugs; "public" is an explicit opt-in setting, never the default.

## Budget Calculation

Total cost for a trip is a deterministic aggregation, not a prediction:

```
Ct = Σ(expense_items.amount) + Σ(scheduled_activities.estimatedCost)
```

Activity costs stay in `stop_activities` and are unioned into cost reporting via a database view (avoiding double-counting against `expense_items`). Average cost per day divides the total by trip duration. "Over budget" day flags are based on an explicit daily-budget heuristic, labeled in the UI as a planning aid rather than a hard financial limit.

## Non-Functional Requirements

- Responsive on desktop and mobile
- Accessible controls (keyboard operation, focus order, contrast, dialog focus trapping)
- Transactional integrity for multi-row updates (reorder, copy trip)
- Authorization enforced at the data layer (RLS), not just in the UI
- Predictable loading/error states
- Typed, maintainable components

## Explicitly Out of Scope (Baseline)

- Automated route optimization / itinerary generation
- Machine-learning-based recommendations
- Supabase Realtime / simultaneous collaborative editing
- Booking transport or accommodation
- Offline navigation
- Admin/analytics dashboard (optional, deferred)

## Evaluation Plan

No performance or usability numbers are claimed until the app is built and measured. Planned evaluation dimensions: functional pass rate (FR1–FR12), authorization tests (owner / non-owner / shared / anonymous access attempts), page load and interaction timing, API/database query time under increasing row counts, calendar interaction responsiveness, search latency, moderated usability tasks, accessibility checks, and data-integrity/constraint tests.

## Project Status

This README reflects the design/architecture phase (requirements analysis, schema, RLS model, and technology justification).