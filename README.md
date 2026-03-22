# PrestaTrack - Client Interface (Espace Client)

A modern React-based client portal for PrestaTrack, an internal system for managing life insurance benefit requests. This interface allows clients to submit, track, and manage their benefit requests online.

## Features

✅ **Client Authentication**
- Secure login page with form validation
- Session-based authentication state management

✅ **Dashboard**
- Personalized welcome message with client information
- Quick action buttons for common tasks
- Request status summary with visual indicators
- Recent requests display
- Quick tips section

✅ **Create Request**
- Three request types: Withdrawal, Advance, Transfer
- Amount input with currency formatting
- Optional description field
- Multiple document upload support
- File validation and management
- Form validation with error messages

✅ **My Requests**
- Comprehensive list of all client requests
- Filter by status (Pending, In Review, Approved, Rejected)
- Filter by request type (Withdrawal, Advance, Transfer)
- Search functionality by request ID or description
- Responsive table view with quick actions

✅ **Request Details**
- Complete request information display
- Status badge with visual indicators
- Document list with download capability
- Processing timeline showing request progress
- Contact support information

✅ **Navigation**
- Sticky responsive navigation bar
- Mobile-friendly hamburger menu
- Quick links to main sections
- User profile with logout functionality

✅ **Design**
- Clean, professional interface
- Fully responsive (desktop, tablet, mobile)
- Consistent color scheme and typography
- Smooth transitions and hover states
- Accessibility-friendly components

## Project Structure

```
Interface Client/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── Dashboard.js
│   │   ├── CreateRequest.js
│   │   ├── MyRequests.js
│   │   └── RequestDetails.js
│   ├── components/
│   │   ├── Navigation.js
│   │   ├── StatusSummary.js
│   │   ├── RecentRequests.js
│   │   ├── RequestTable.js
│   │   ├── FilterPanel.js
│   │   ├── StatusTimeline.js
│   │   └── DocumentsList.js
│   ├── styles/
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── LoginPage.css
│   │   ├── Dashboard.css
│   │   ├── CreateRequest.css
│   │   ├── Navigation.css
│   │   ├── MyRequests.css
│   │   ├── RequestTable.css
│   │   ├── FilterPanel.css
│   │   ├── StatusSummary.css
│   │   ├── RecentRequests.css
│   │   ├── RequestDetails.css
│   │   ├── StatusTimeline.css
│   │   └── DocumentsList.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd "Interface Client"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the Application

### Development Mode
```bash
npm start
```
The application will open at `http://localhost:3000`

### Build for Production
```bash
npm build
```

### Test
```bash
npm test
```

## Technology Stack

- **React 18.2.0** - UI framework
- **React Router DOM 6.20.0** - Client-side routing
- **Axios 1.6.0** - HTTP client (for future API integration)
- **React Scripts 5.0.1** - Build tools

## Key Components

### Pages

1. **LoginPage.js**
   - Email/password authentication form
   - Form validation
   - Error handling
   - Simulated login with 1.5s delay

2. **Dashboard.js**
   - Welcome message with client info
   - Quick action buttons
   - Status summary cards
   - Recent requests preview
   - Tips section

3. **CreateRequest.js**
   - Request type selection
   - Amount input with validation
   - Textarea for description
   - Multi-file upload with validation
   - Document management (add/remove)
   - Form submission with success/error messages

4. **MyRequests.js**
   - Complete requests list with filtering
   - Status and type filters
   - Search functionality
   - Request table with action links
   - Empty state handling

5. **RequestDetails.js**
   - Request summary card
   - Full request information
   - Documents list with download capability
   - Processing timeline
   - Support contact section

### Components

1. **Navigation.js**
   - Sticky header navigation
   - Responsive mobile menu
   - User profile section
   - Logout functionality

2. **StatusSummary.js**
   - Visual card-based status display
   - Animated progress indicators
   - Total request count
   - Hover effects

3. **RecentRequests.js**
   - Table displaying recent requests
   - Status badges
   - View details links

4. **RequestTable.js**
   - Full requests table
   - Sortable columns
   - Status indicators
   - Action links

5. **FilterPanel.js**
   - Search input
   - Status filter dropdown
   - Type filter dropdown
   - Reset filters button

6. **StatusTimeline.js**
   - Visual timeline representation
   - Status marker indicators
   - Animated progress marker
   - Date/time information

7. **DocumentsList.js**
   - Document display in table format
   - Download buttons
   - File size display
   - Upload date tracking

## Styling

The application uses a custom CSS system with CSS variables for theming:

- **Color Palette:**
  - Primary: #2563eb (Blue)
  - Secondary: #10b981 (Green)
  - Danger: #ef4444 (Red)
  - Warning: #f59e0b (Orange)

- **Status Colors:**
  - Pending: #f59e0b (Orange)
  - In Review: #3b82f6 (Blue)
  - Approved: #10b981 (Green)
  - Rejected: #ef4444 (Red)

- **Responsive Breakpoints:**
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## Current Features (Mock Data)

The application currently uses mock data for demonstration purposes:

- Login accepts any email/password combination
- Simulated authentication state
- Hardcoded request data for display
- Mock document lists and timelines

## Future Enhancements

- [ ] Backend API integration
- [ ] Real authentication with JWT tokens
- [ ] Database integration for persistent data
- [ ] File upload to cloud storage
- [ ] Email notifications
- [ ] Admin dashboard for request management
- [ ] Advanced analytics and reporting
- [ ] Request templates
- [ ] Message/chat support
- [ ] Request history and archiving
- [ ] Multi-language support (French/English)
- [ ] Dark mode theme

## Environment Variables

Create a `.env` file in the root directory (if using API):

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000
```

## API Integration Guide

To connect to a backend API, update the following:

1. Create an `api` folder with service files
2. Use axios to make HTTP requests
3. Update components to use real data from the API instead of mock data
4. Implement proper error handling and loading states

Example:
```javascript
// api/requestService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getRequests = async (clientId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/requests/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Internal use only - PrestaTrack System

## Support

For technical support or feature requests, contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** March 2024
