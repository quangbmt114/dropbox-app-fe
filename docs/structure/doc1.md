
# CleanOver Frontend

## Project Structure

This Next.js application follows a modular architecture pattern with role-based organization:

### Architecture Pattern
```
src/
├── app/                    # Next.js App Router - Define pages
│   ├── admin/
│   ├── group-admin/
│   ├── staff/
│   ├── public/
│   └── auth/
├── modules/                # Business logic and components
│   ├── admin/
│   ├── group-admin/
│   ├── staff/
│   ├── public/
│   └── auth/
└── store/                  # Redux state management
    └── modules/
        ├── admin/
        ├── group-admin/
        ├── staff/
        ├── public/
        └── auth/
```

### Page-Module-Store Alignment

Each feature follows this consistent pattern:

```
-- app -> define pages
-----pageA
-- modules
-----pageA  
-- stores
-----modules
-------pageA
--------- actions.ts     # Redux action creators
--------- index.ts       # Main reducer slice  
--------- selectors.ts   # State selector functions
--------- types.ts       # TypeScript type definitions
```

### Example Structure

For an admin chargeback rate feature:
- **Page**: `src/app/admin/chargeback-rate/page.tsx`
- **Module**: `src/modules/admin/chargeback-rate/`
- **Store**: `src/store/modules/admin/chargeback-rate/`

### Role-Based Organization

- **admin** - Administrator dashboard and features
- **group-admin** - Group administrator features  
- **staff** - Staff member dashboard
- **public** - Public-facing pages
- **auth** - Authentication flows

---

## Development

### Build and run like production:

```bash
yarn build
yarn start:static
```

### Dev

```bash
yarn dev
```

## References

- [tailwind component](https://tailwindui.com/)
- [tailwind animation](https://www.tailwindcss-animated.com/configurator.html)
- [tailwindcss-forms](https://github.com/tailwindlabs/tailwindcss-forms)
- [chakra-ui component](https://chakra-ui.com/docs/components)
- [useForm](https://react-hook-form.com/get-started)
- [aggrid](https://www.ag-grid.com/react-data-grid/getting-started/)

### Ag-Grid

For more information, please refer to the [Ag-Grid 31.3.4 documentation](https://www.ag-grid.com/archive/31.3.4/react-data-grid/getting-started/).
