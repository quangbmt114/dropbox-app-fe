# Dropbox Clone - Frontend

A modern Next.js frontend application for a file storage and sharing platform.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (Strict Mode)
- **React 18**

## Project Structure

```
dropbox-fe/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── login/             # Login page
│   │   └── page.tsx
│   ├── register/          # Register page
│   │   └── page.tsx
│   └── dashboard/         # Protected dashboard
│       └── page.tsx
├── components/            # Reusable React components
│   └── withAuth.tsx       # HOC for route protection
├── lib/                   # Utility functions and configurations
│   ├── api.ts            # API client with auth support
│   └── auth.ts           # Authentication utilities
├── .env.local            # Local environment variables (not in git)
├── .env.example          # Example environment variables
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Create `.env.local` file:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

Or manually create `.env.local` with:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build the production application:

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Authentication System

### Overview

The application implements a simple token-based authentication system:

1. **Login/Register** - User authenticates via `/auth/login` or `/auth/register`
2. **Token Storage** - Access token is saved in `localStorage`
3. **Auto-Injection** - Token is automatically included in all API requests via `Authorization: Bearer <token>` header
4. **Route Protection** - Dashboard page checks authentication status and fetches user data

### Pages

- **`/`** - Home page with health check and navigation links
- **`/login`** - Login form
- **`/register`** - Registration form with password confirmation
- **`/dashboard`** - Protected page displaying user email (requires authentication)

### Authentication Flow

```
1. User visits /login or /register
2. User submits credentials
3. API returns { accessToken, user }
4. Token is saved to localStorage
5. User is redirected to /dashboard
6. Dashboard fetches /users/me (with token in header)
7. User email is displayed
```

### Logout Flow

```
1. User clicks logout button
2. Token is removed from localStorage
3. User is redirected to /login
```

## API Client

The API client is located in `lib/api.ts` and provides:

- **Automatic token injection** - Reads from localStorage and adds to Authorization header
- **GET, POST, PUT, DELETE** methods
- **Centralized error handling**
- **TypeScript support with generics**
- **Pre-built auth methods**: `login()`, `register()`, `getCurrentUser()`

### Usage Example

```typescript
import { login, getCurrentUser, get, post } from '@/lib/api'

// Login
const response = await login({ 
  email: 'user@example.com', 
  password: 'password123' 
})

if (response.data?.accessToken) {
  saveToken(response.data.accessToken)
}

// Get current user (token automatically included)
const user = await getCurrentUser()

// Custom authenticated request
const files = await get('/api/files')
```

## Authentication Utilities

Located in `lib/auth.ts`:

```typescript
import { saveToken, getToken, removeToken, isAuthenticated, logout } from '@/lib/auth'

// Save token after login
saveToken('your-token-here')

// Check if user is authenticated
if (isAuthenticated()) {
  // User is logged in
}

// Logout (removes token and redirects)
logout()
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: `http://localhost:8000`)

## Features

### Implemented

- ✅ Next.js App Router setup
- ✅ TypeScript with strict mode
- ✅ API client with automatic token injection
- ✅ Environment variable configuration
- ✅ Authentication system (login/register/logout)
- ✅ Token-based authentication with localStorage
- ✅ Protected dashboard route
- ✅ User profile display (`/users/me`)
- ✅ Clean folder structure

### Not Implemented

- ⏳ UI Styling Framework (intentionally kept minimal)
- ⏳ File upload/download functionality
- ⏳ File sharing features

## API Endpoints Used

- `GET /health` - Health check
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /users/me` - Get current user (requires authentication)

## TypeScript Configuration

The project uses strict TypeScript configuration:

- Strict mode enabled
- Full type checking
- No implicit any
- ESNext target support

## Security Notes

- Tokens are stored in `localStorage` (simple approach, not cookies)
- No external authentication libraries used
- Authorization header format: `Bearer <token>`
- Protected routes redirect to `/login` if not authenticated
- 401 responses trigger automatic logout

## Next Steps

1. Add UI styling framework (e.g., Tailwind CSS, shadcn/ui)
2. Build file management components
3. Add file upload functionality
4. Implement sharing features
5. Add refresh token mechanism
6. Consider moving to httpOnly cookies for better security
