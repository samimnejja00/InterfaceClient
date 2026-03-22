# Quick Start Guide - PrestaTrack Client Interface

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages listed in `package.json`:
- React 18.2.0
- React Router DOM 6.20.0
- Axios 1.6.0

### 2. Start Development Server
```bash
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

### 3. Build for Production
```bash
npm build
```

This creates an optimized production build in the `build/` folder.

## Default Login Credentials

For testing purposes, you can use any email/password:
- **Email:** user@example.com
- **Password:** (any value)

The appwill simulate a successful login and display sample data.

## Navigation Guide

After login, you'll access:

1. **Dashboard** (/)
   - Overview of all requests
   - Quick actions
   - Status summary

2. **My Requests** (/my-requests)
   - Complete list of all requests
   - Filtering and search
   - Request status tracking

3. **Create Request** (/create-request)
   - Submit new benefit requests
   - Upload documents
   - Select request type and amount

4. **Request Details** (/request-details/:requestId)
   - View full request information
   - See uploaded documents
   - Track processing timeline

## File Structure Overview

```
src/
├── pages/           # Page components (main views)
├── components/      # Reusable components
├── styles/          # CSS styling for all components
├── App.js          # Main app routing
└── index.js        # React entry point
```

## Key Features

### Authentication
- Login page with validation
- Protected routes (redirect to login if not authenticated)
- Client information display in navigation

### Request Management
- Create new requests with document upload
- View all requests with filters
- Track request status in real-time
- Download submitted documents

### Responsive Design
- Works on desktop, tablet, and mobile
- Hamburger menu for mobile navigation
- Optimized layouts for all screen sizes

## Demo Data

The application includes sample data for testing:

- 5 sample requests with different statuses
- Various request types (Withdrawal, Advance, Transfer)
- Sample documents for each request
- Timeline showing request processing steps

## Troubleshooting

### Port 3000 Already in Use
```bash
npm start -- --port 3001
```

### Clear Node Modules
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
Ensure you're using Node.js v14 or higher:
```bash
node --version
```

## API Integration

To connect to your backend API:

1. Create `src/api/` folder
2. Create service files for API calls
3. Update components to use API responses instead of mock data
4. Add environment variables in `.env` file

Example:
```javascript
// src/api/requests.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL
});

export const fetchRequests = (clientId) => {
  return API.get(`/requests/${clientId}`);
};
```

## Performance Optimization

- React Router for efficient page navigation
- Component-level state management
- CSS variables for theming
- Lazy loading ready (for future implementation)

## Browser DevTools

Open DevTools (F12) to:
- Inspect component structure
- Monitor performance
- Check console for any issues
- Debug using React DevTools extension (recommended)

## Deployment

See README.md for production deployment instructions.

---

**Need Help?** Check the README.md file for comprehensive documentation.
