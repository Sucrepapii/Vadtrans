# Vadtrans Transportation Platform - Implementation Plan

A comprehensive transportation booking platform with mobile interfaces for travelers and companies, plus a desktop admin dashboard.

## User Review Required

> [!IMPORTANT] > **Scope Clarification**: This is a large application with multiple user roles and features. The initial implementation will include:
>
> - Complete frontend UI for all three user types (Travelers, Companies, Admin)
> - Basic backend API structure with authentication
> - Mock data for demonstration purposes
>
> **Database**: Would you prefer:
>
> - MongoDB (NoSQL, flexible schema)
> - PostgreSQL (SQL, structured data)
> - SQLite (lightweight, file-based for development)

> [!WARNING] > **Design Fidelity**: Based on the Figma analysis, I'll implement the core screens. Some screens may need additional details. Please review the proposed screens list below and let me know if any critical screens are missing.

## Proposed Changes

### Project Structure

```
vadtrans/
├── client/                 # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   │   ├── travelers/ # Traveler-facing pages
│   │   │   ├── company/   # Company-facing pages
│   │   │   └── admin/     # Admin dashboard pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React context for state management
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                # Node.js + Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Express middleware
│   │   └── server.js      # Server entry point
│   └── package.json
└── README.md
```

---

### Component: Frontend Setup

#### [NEW] [package.json](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/package.json)

- React 18 with Vite for fast development
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Additional libraries: react-icons, date-fns

#### [NEW] [tailwind.config.js](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/tailwind.config.js)

- Custom color palette based on Figma design:
  - Primary Red: `#E31E24` (for CTAs and highlights)
  - Charcoal/Black: `#1A1A1A` (for headers and text)
  - Neutral grays for backgrounds
- Custom fonts: Raleway (headings), Poppins (body)
- Custom border radius for buttons (~20px)

---

### Component: Shared UI Components

#### [NEW] [Button.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/components/Button.jsx)

- Primary (red fill), Secondary (white stroke), and Text variants
- Consistent rounded corners and hover states

#### [NEW] [Input.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/components/Input.jsx)

- Clean input fields with labels
- Error state handling
- Icon support

#### [NEW] [Card.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/components/Card.jsx)

- Reusable card component for content sections
- Shadow and border variants

#### [NEW] [Navbar.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/components/Navbar.jsx)

- Mobile navigation with hamburger menu
- Desktop navigation for admin

#### [NEW] [Footer.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/components/Footer.jsx)

- Social links and company information
- Consistent across mobile pages

---

### Component: Travelers Features (Mobile)

#### [NEW] [LandingPage.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/travelers/LandingPage.jsx)

- Hero section with search functionality
- "About VadTrans" section
- Featured transport companies
- Footer with social links

#### [NEW] [SignIn.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/travelers/SignIn.jsx)

- Email/password login form
- Social login options
- Link to sign up

#### [NEW] [SignUp.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/travelers/SignUp.jsx)

- Registration form with validation
- Terms and conditions checkbox

#### [NEW] [Payment.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/travelers/Payment.jsx)

- Multi-step payment flow (5 pages)
- Payment method selection
- Booking confirmation

#### [NEW] [Tracking.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/travelers/Tracking.jsx)

- Real-time tracking interface
- Trip details and status

#### [NEW] [Notifications.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/travelers/Notifications.jsx)

- List of user notifications
- Read/unread states

---

### Component: Transportation Company Features (Mobile)

#### [NEW] [CompanyLanding.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/company/CompanyLanding.jsx)

- "List your company" landing page
- Benefits and call-to-action

#### [NEW] [DocumentUpload.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/company/DocumentUpload.jsx)

- 4-step document upload wizard
- File upload with validation
- Progress indicator

#### [NEW] [TicketsManagement.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/company/TicketsManagement.jsx)

- List of company tickets
- Create/edit ticket functionality

#### [NEW] [CompanyProfile.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/company/CompanyProfile.jsx)

- Company information display
- Edit profile functionality

---

### Component: Admin Features (Desktop)

#### [NEW] [AdminDashboard.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/admin/AdminDashboard.jsx)

- Summary cards with key statistics
- Recent activity overview
- Quick action buttons

#### [NEW] [ClientManagement.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/admin/ClientManagement.jsx)

- Data tables for companies and customers
- Search and filter functionality
- CRUD operations

#### [NEW] [FareManagement.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/admin/FareManagement.jsx)

- Fare configuration interface
- Route-based pricing

#### [NEW] [TicketManagement.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/admin/TicketManagement.jsx)

- View all tickets across platform
- Status management

#### [NEW] [FAQManagement.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/admin/FAQManagement.jsx)

- Create/edit FAQ entries
- Category management

#### [NEW] [EmailNotifications.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/pages/admin/EmailNotifications.jsx)

- Email template management
- Send notifications to users

#### [NEW] [Sidebar.jsx](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/client/src/components/admin/Sidebar.jsx)

- Persistent vertical navigation for admin
- Active state indicators

---

### Component: Backend API

#### [NEW] [server.js](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/server/src/server.js)

- Express server setup
- CORS configuration
- Middleware setup (body-parser, morgan)
- Database connection

#### [NEW] [auth.routes.js](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/server/src/routes/auth.routes.js)

- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- GET `/api/auth/me` - Get current user

#### [NEW] [booking.routes.js](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/server/src/routes/booking.routes.js)

- GET `/api/bookings` - Get user bookings
- POST `/api/bookings` - Create booking
- GET `/api/bookings/:id` - Get booking details
- PUT `/api/bookings/:id` - Update booking

#### [NEW] [company.routes.js](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/server/src/routes/company.routes.js)

- POST `/api/companies` - Register company
- GET `/api/companies` - Get all companies
- GET `/api/companies/:id` - Get company details
- PUT `/api/companies/:id` - Update company
- POST `/api/companies/:id/documents` - Upload documents

#### [NEW] [admin.routes.js](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/server/src/routes/admin.routes.js)

- GET `/api/admin/stats` - Dashboard statistics
- GET `/api/admin/users` - Get all users
- GET `/api/admin/companies` - Get all companies
- PUT `/api/admin/fares` - Update fares
- POST `/api/admin/faqs` - Create FAQ

#### [NEW] [User.model.js](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/server/src/models/User.model.js)

- User schema with authentication fields
- Role-based access (traveler, company, admin)

#### [NEW] [Company.model.js](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/server/src/models/Company.model.js)

- Company information schema
- Document storage references

#### [NEW] [Booking.model.js](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/server/src/models/Booking.model.js)

- Booking details schema
- Payment status tracking

---

### Component: Configuration Files

#### [NEW] [README.md](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/README.md)

- Project overview
- Setup instructions
- API documentation
- Development workflow

#### [NEW] [.env.example](file:///C:/Users/icmas/.gemini/antigravity/scratch/vadtrans/server/.env.example)

- Environment variable template
- Database connection strings
- JWT secret configuration

## Verification Plan

### Automated Tests

```bash
# Start backend server
cd server && npm run dev

# Start frontend development server
cd client && npm run dev
```

### Manual Verification

1. **Travelers Flow**: Navigate through landing → sign up → search → booking → payment → tracking
2. **Company Flow**: Register company → upload documents → manage tickets
3. **Admin Flow**: View dashboard → manage clients → configure fares → create FAQs
4. **Responsive Design**: Test mobile screens on different viewport sizes
5. **API Integration**: Verify all API endpoints respond correctly

### Browser Testing

- Test on Chrome, Firefox, Safari
- Verify mobile responsiveness (375px, 414px widths)
- Test admin dashboard on desktop (1920px, 1440px widths)
