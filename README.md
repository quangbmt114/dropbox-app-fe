# Dropbox Clone - Frontend

Next.js 14 application with TypeScript, Redux, Chakra UI, and auto-generated API client.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server (port 4000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Chakra UI
- **State Management**: Redux Toolkit + Redux Persist
- **Form Handling**: React Hook Form + Yup
- **API Client**: Auto-generated from OpenAPI (TypeScript Axios)
- **File Upload**: Chunked upload support (with pause/resume)
- **Date/Time**: Day.js with timezone support
- **Utilities**: Lodash (tree-shaken imports)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── modules/               # Feature modules
│   ├── auth/             # Authentication
│   └── dashboard/        # Dashboard & file management
├── components/           # Shared components
├── store/               # Redux store
├── api-service/         # API client
│   ├── client.ts        # Axios client
│   ├── generated/       # Auto-generated from backend
│   └── modules/
│       └── index.ts     # Unified API client
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── constants/           # Constants & configurations
```

## 🌐 API Client

### Auto-Generated from Backend

```bash
# Update API client when backend changes
npm run update:api
```

### Usage

```typescript
import { api } from '@/api-service';

// Authentication
await api.auth.login(email, password);
await api.auth.register(email, password, name);

// Files
await api.files.upload(file);
await api.files.getAll();
await api.files.delete(fileId);

// Chunked upload (for large files)
await api.chunks.uploadChunk(...);
await api.chunks.complete(...);

// Helpers
const url = api.helpers.getFileUrl(file);
```

## 📦 File Upload

### Automatic Strategy Selection

- **< 10MB**: Direct upload
- **10-100MB**: Sequential chunking (5MB chunks)
- **100-500MB**: Parallel chunking (10MB chunks, 3 parallel)
- **> 500MB**: Aggressive parallel (10MB chunks, 5 parallel)

### Features

- ✅ Automatic chunking for large files
- ✅ Progress tracking with speed & ETA
- ✅ Pause/Resume support
- ✅ Auto-retry on failure
- ✅ Parallel chunk uploads

## 🔐 Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:7002
NEXT_PUBLIC_CLIENT_PORT=4000
```

## 📝 Available Scripts

```bash
npm run dev              # Development server (port 4000)
npm run build           # Production build
npm run start           # Production server
npm run lint            # ESLint
npm run download:schema # Download OpenAPI schema
npm run generate:api    # Generate API client
npm run update:api      # Download + Generate
npm run clean:api       # Clean generated files
```

## 🎨 Features

- ✅ Authentication (Login/Register)
- ✅ File upload (direct & chunked)
- ✅ File management (view, delete, download)
- ✅ File preview (images, videos)
- ✅ Storage statistics
- ✅ Grid/List view toggle
- ✅ Progress tracking for uploads
- ✅ Responsive design
- ✅ Type-safe API client
- ✅ Auto-generated types from backend

## 🔄 Update API Client

When backend API changes:

```bash
# Make sure backend is running on port 7002
npm run update:api
```

This will:
1. Download OpenAPI schema from backend
2. Generate TypeScript client
3. Update types automatically

## 📚 Key Files

- `src/api-service/modules/index.ts` - Unified API client
- `src/hooks/useChunkUpload.ts` - Chunked upload hook
- `src/utils/chunkUploader.ts` - Chunk upload logic
- `src/utils/format.ts` - Formatting utilities
- `src/constants/api.ts` - API endpoint constants

## 🏗️ Build

```bash
npm run build
```

Output:
- Static pages: 8 routes
- Dashboard bundle: ~40 kB
- Total First Load JS: ~110 kB

## 🔗 Backend

Backend should run on `http://localhost:7002`

Required endpoints:
- `/auth/login`
- `/auth/register`
- `/files/upload`
- `/files`
- `/files/:id`
- OpenAPI spec at `/api-json`

---

**Built with ❤️ using Next.js & TypeScript**
