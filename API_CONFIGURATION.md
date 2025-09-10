# API Configuration Setup

This document explains how to configure the backend API URL for the frontend application.

## Environment Variables

The frontend application uses the `NEXT_PUBLIC_API_URL` environment variable to determine the backend API URL.

### Setting up the Environment Variable

1. **Create a `.env.local` file** in the `frontend` directory:
   ```bash
   cd frontend
   touch .env.local
   ```

2. **Add the following content** to the `.env.local` file:
   ```env
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:5001
   
   # Optional: Database URL (if needed for direct database access)
   # DATABASE_URL=postgresql://username:password@localhost:5432/pos_db
   
   # Optional: JWT Secret (if needed)
   # JWT_SECRET=your-secret-key-here
   ```

3. **Restart your development server** after creating the `.env.local` file:
   ```bash
   npm run dev
   ```

## Default Configuration

If no `NEXT_PUBLIC_API_URL` is set, the application will default to `http://localhost:5001` (the default backend port).

## API Configuration File

The API configuration is centralized in `app/config/api.js` which provides:

- `api(path)` - Creates full API URLs
- `getApiBase()` - Gets the base API URL
- `getAuthHeaders(token)` - Creates headers with optional auth token
- `getAuthHeadersFromStorage()` - Gets headers with auth token from localStorage/sessionStorage

## Usage in Components

Instead of manually creating API URLs, use the centralized configuration:

```javascript
import { api, getAuthHeadersFromStorage } from "../config/api";

// Make API calls
const response = await fetch(api("/api/products"), {
  headers: getAuthHeadersFromStorage(),
});
```

## Backend Server

Make sure your backend server is running on the configured port (default: 5001). The backend server configuration is in `backend/src/index.js`.

## Production Deployment

For production deployment, set the `NEXT_PUBLIC_API_URL` environment variable in your deployment platform (Vercel, Netlify, etc.) to point to your production backend URL.

Example for production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```
