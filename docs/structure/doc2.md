# CleanOver Frontend - Workspace Structure

## Project Overview
This is a Next.js application with TypeScript, following a modular architecture pattern with role-based organization.

## Architecture Pattern
```
-- app -> define pages
-----pageA
-- modules
-----pageA
--stores
-----modules
-------pageA
--------- actions.ts
--------- index.ts
--------- selectors.ts
--------- types.ts
```

## Top-level Structure
```
cleanover_frontend/
├── .env.development
├── .env.local
├── .gitignore
├── .npmrc
├── .nvmrc
├── .prettierignore
├── .prettierrc
├── azure-pipelines-dev.yml
├── azure-pipelines-prod.yml
├── codegen.ts
├── cypress.config.ts
├── env.template
├── generate-prod-env.sh
├── next.config.mjs
├── next-env.d.ts
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
├── tsconfig.json
├── cypress/                    # E2E testing
├── docs/                      # Documentation
├── public/                    # Static assets
└── src/                       # Source code
    ├── api-service/          # GraphQL API layer
    ├── app/                  # Next.js App Router pages
    ├── components/           # Reusable UI components
    ├── core/                 # Core utilities
    ├── layout/               # Layout components
    ├── modules/              # Feature modules
    ├── store/                # Redux state management
    ├── styles/               # Global styles
    ├── theme/                # Theme configuration
    ├── types/                # TypeScript type definitions
    ├── utils/                # Utility functions
    └── variables/            # Constants and variables
```

## 1. App Directory Structure (src/app/)
*Next.js App Router - Defines application routes and pages*

```
src/app/
├── AppWrappers.tsx
├── error.tsx
├── favicon.ico
├── globals.css
├── head.tsx
├── layout.tsx
├── not-found.tsx
├── page.tsx
├── admin/                           # Admin dashboard routes
│   ├── financial-management/
│   │   ├── rates/
│   │   │   ├── page.tsx
│   │   │   ├── chargeback-rates/
│   │   │   │   └── page.tsx
│   │   │   └── holiday-rates/
│   │   │       └── page.tsx
│   │   ├── invoice-snapshots/
│   │   │   ├── page.tsx
│   │   │   └── homeowners/
│   │   │       └── page.tsx
│   │   └── reports-details/
│   │       ├── page.tsx
│   │       └── homeowner/
│   │           └── page.tsx
│   ├── general/
│   │   └── jobs/
│   │       ├── audit/
│   │       │   └── page.tsx
│   │       ├── clean/
│   │       │   └── page.tsx
│   │       ├── maintenance/
│   │       │   └── page.tsx
│   │       └── independence/
│   │           └── page.tsx
│   └── jobs-management/
│       ├── bug-reports/
│       ├── checklists/
│       ├── schedule/
│       │   └── page.tsx
│       └── warehouse-dispatch/
│           └── page.tsx
├── group-admin/                     # Group admin routes
├── staff/                           # Staff dashboard routes
├── public/                          # Public routes
├── public-demo/                     # Demo routes
└── auth/                            # Authentication routes
```

## 2. Modules Directory Structure (src/modules/)
*Feature-based business logic and components*

```
src/modules/
├── admin/
│   ├── financial-management/
│   │   ├── chargeback-rate/
│   │   ├── rates/
│   │   │   └── components/
│   │   └── invoice-snapshots/
│   │       └── components/
│   ├── general/
│   │   └── jobs/
│   │       └── pages/
│   │           ├── audit/
│   │           ├── clean/
│   │           ├── maintenance/
│   │           └── independence/
│   └── jobs-management/
│       ├── checklists/
│       │   └── components/
│       ├── schedule/
│       │   └── components/
│       └── tickets-v2/
│           └── components/
├── group-admin/
├── staff/
├── public/
└── auth/
```

## 3. Store Directory Structure (src/store/)
*Redux state management with modular slices*

```
src/store/
├── index.ts                         # Store configuration
├── rootReducer.ts                   # Root reducer
└── modules/
    ├── admin/
    │   ├── financial-management/
    │   │   ├── chargeback-rate/
    │   │   │   ├── actions.ts       # Action creators
    │   │   │   ├── index.ts         # Reducer slice
    │   │   │   ├── selectors.ts     # State selectors
    │   │   │   └── types.ts         # TypeScript types
    │   │   └── rates/
    │   │       ├── actions.ts
    │   │       ├── index.ts
    │   │       ├── selectors.ts
    │   │       └── types.ts
    │   ├── general/
    │   │   └── jobs/
    │   │       └── pages/
    │   │           ├── audit/
    │   │           │   ├── actions.ts
    │   │           │   ├── index.ts
    │   │           │   ├── selectors.ts
    │   │           │   └── types.ts
    │   │           ├── clean/
    │   │           ├── maintenance/
    │   │           └── independence/
    │   └── jobs-management/
    │       ├── schedule/
    │       │   ├── actions/
    │       │   ├── selectors/
    │       │   │   └── schedule.ts
    │       │   ├── index.ts
    │       │   └── types.ts
    │       ├── tickets-v2/
    │       └── resolution-cases/
    ├── group-admin/
    ├── staff/
    ├── public/
    ├── auth/
    ├── app/
    └── biz/
```

## 4. Components Directory Structure (src/components/)
*Reusable UI components organized by functionality*

```
src/components/
├── Logo.tsx
├── NoSSR.tsx
├── SearchComponent.tsx
├── SizeObserver.tsx
├── TagBadge.tsx
├── UploadImage.tsx
├── @global/                         # Global components
├── access-denied/
├── ag-grid/                         # Data grid components
│   └── PaginationControls.tsx
├── avatar/
├── button/
├── checklist/
│   └── table/
│       └── editor/
│           └── FolderEditor.tsx
├── clientOnly/
├── colors/
├── comingSoon/
├── dateTimePicker/
├── dialog/
├── drawer/
├── dropdown/
├── editor/
├── filter/
├── filter-job/
├── footer/
├── form/
├── form-engine/
│   └── form-render/
│       └── ExampleEmbeddedForm.tsx
├── headerBreadcrumbs/
├── htmlParser/
├── icons/
├── image/
├── issue-detail/
├── job/
├── label/
├── lightbox/
├── link/
├── loading/
├── media/
├── my-icon/
├── notes/
├── page/
├── progress/
├── protectedComponent/
├── rating/
├── scrollbar/
├── select/
├── selectAutocomplete/
├── selectStatusTicket/
├── selectTagTicket/
├── selectTicketType/
├── selectUsers/
├── staff-render/
├── staff-select/
├── streaming/
└── typography/
```

## 5. API Service Structure (src/api-service/)
*GraphQL API layer and code generation*

```
src/api-service/
├── index.ts                         # API service exports
├── schema.graphqls                  # GraphQL schema
├── generated/                       # Auto-generated GraphQL code
└── modules/                         # API service modules
```

## 6. Additional Directories

### Public Assets (public/)
```
public/
├── next.svg
├── vercel.svg
├── favicon/
│   └── logo.svg
├── fonts/
│   └── dm-sans/
├── icons/
│   ├── airbnb-icon.svg
│   ├── badge.svg
│   ├── checked.svg
│   ├── cleaning-icon.svg
│   └── ... (more icons)
├── img/
│   ├── hero.png
│   ├── auth/
│   ├── avatars/
│   ├── background/
│   ├── dashboards/
│   └── ... (more image folders)
└── svg/
    ├── facebook-icon.svg
    ├── google-icon.svg
    └── twitter-icon.svg
```

### Testing (cypress/)
```
cypress/
├── e2e/
│   ├── auth/
│   └── dashboard/
├── fixtures/
│   ├── example.json
│   └── shared/
├── support/
│   ├── commands.ts
│   └── e2e.ts
└── utils/
    └── graphql-test-utils.ts
```

### Documentation (docs/)
```
docs/
├── find.MD
├── lodash.MD
├── naming-component.MD
├── rrule-date-utc-logic.md
├── rules.MD
├── sort.md
└── template-component.MD
```

## Key Architecture Patterns

### 1. Page-Module-Store Alignment
Each page follows this pattern:
- **Page**: `src/app/[role]/[feature]/page.tsx` - Defines the route
- **Module**: `src/modules/[role]/[feature]/` - Contains business logic and components
- **Store**: `src/store/modules/[role]/[feature]/` - Manages state

### 2. Store Module Structure
Each store module contains:
- `actions.ts` - Redux action creators
- `index.ts` - Main reducer slice
- `selectors.ts` - State selector functions
- `types.ts` - TypeScript type definitions

### 3. Role-Based Organization
The application is organized by user roles:
- **admin** - Administrator dashboard and features
- **group-admin** - Group administrator features
- **staff** - Staff member dashboard
- **public** - Public-facing pages
- **auth** - Authentication flows

### 4. Component Organization
Components are organized by:
- **Functionality** - Grouped by what they do (form, button, dialog)
- **Reusability** - Shared components in root level
- **Feature-specific** - Components specific to modules within module folders

## Technology Stack
- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **API**: GraphQL with code generation
- **Testing**: Cypress for E2E testing
- **Build Tools**: PostCSS, ESLint, Prettier

## Development Workflow
1. **Pages** are defined in `src/app/` using Next.js App Router
2. **Business Logic** is implemented in corresponding `src/modules/`
3. **State Management** is handled through Redux slices in `src/store/modules/`
4. **Components** are built reusably in `src/components/`
5. **API Integration** through GraphQL services in `src/api-service/`
