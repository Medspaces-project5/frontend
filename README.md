# MedSpaces Patient Portal (Frontend)

Client application interface for Patient/End-User registration, appointment management, payments checkout, and visit feedbacks.

---

## 1. Frontend Overview
The MedSpaces Frontend provides a responsive portal for patients to:
- **Registration & OTP Signup**: Signup forms triggering 6-digit OTP verification codes delivered via email.
- **Onboarding & Authentication**: Secure JWT session initialization.
- **Patient Dashboard**: Real-time overview cards displaying upcoming appointments, today's queue tokens, and outstanding payment amounts.
- **Profile Configuration**: Form interface to update names, phone numbers, and manage notification consent preferences (Email, SMS, WhatsApp).
- **Appointments Tracker**: Tabbed sections to review upcoming schedules and past visit history.
- **Payments checkout**: Razorpay Widget integration to pay consultation fees online, request manual cash payments, and download receipt invoices.
- **Visit Feedback**: A public feedback review interface (`/feedback/:token`) letting patients rate doctor visits and leave comments without needing to log in.

---

## 2. Technology Stack
- **Framework**: React (v19.2.8)
- **Programming Language**: JavaScript (Vite SPA template)
- **Styling**: Tailwind CSS (v4.3.3) and Custom CSS
- **Routing**: React Router DOM (v7.18.2)
- **State Management**: Zustand (v5.0.14)
- **API Client**: Axios (v1.19.0)
- **Icon Assets**: Lucide React (v1.28.0)
- **Build Tools**: Vite (v8.2.0)
- **Code Linter**: Oxlint (v1.75.0)

---

## 3. Frontend Architecture
The patient web application codebase is structured as follows under `/src`:
- `/components`: Shared modular components (e.g. `Card.jsx`, `Skeleton.jsx`, `Toast.jsx`, `NavigationShell.jsx`, `Toggle.jsx`).
- `/pages`: Main page wrappers (e.g., `PatientHome.jsx`, `MyAppointments.jsx`, `MyBills.jsx`, `PatientProfilePatient.jsx`, `RateYourVisit.jsx`, `Login.jsx`, `PatientSignUp.jsx`, `VerifyOtp.jsx`).
- `/services`: Houses axios HTTP endpoints client config (`api.js`).
- `/store`: Zustand global state managers (`authStore.js`).
- `App.jsx`: Declares the patient route guard boundaries and element tree.
- `index.css`: Tailwind entry point.

---

## 4. Patient User Workflow
1. **Signup/OTP**: A new patient inputs name/email/phone. They verify their registration via a 6-digit OTP email.
2. **Login**: Authenticates using email/password. Role verification gates access to `/patient/*` paths.
3. **Home Dashboard**: Displays an operational overview card (such as wait times, queue tokens, and due balances).
4. **Checkout/Actions**: The patient reviews billing entries, completes Razorpay checkouts, or rates a completed visit.

---

## 5. API Integration & Routing
- **Base Endpoint**: Mapped through `VITE_API_BASE_URL` (usually `http://localhost:5000` during development).
- **Authentication**: JWT token headers are managed via state persistence in `authStore.js` and synced to `localStorage`.
- **Protected Routes**: Gated using a `<RouteGuard>` component that rejects non-patient roles.

---

## 6. Environment Variables
Create a `.env` file in the `frontend/` directory matching the following structure:

| Variable | Purpose | Required/Optional |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base API Endpoint URL of the MedSpaces backend | Required |

---

## 7. Development Setup

### 1. Clone the repository and navigate to Frontend folder
```bash
git clone <REPOSITORY_URL>
cd medspaces-module1/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file from the example:
```bash
cp .env.example .env
```

### 4. Running the Frontend Locally
```bash
npm run dev
```
The application will start on a local development port (typically `http://localhost:5173`).

### 5. Production Compilation
- **Compile Production Bundles**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```

---

## 8. Performance Optimizations
We recently completed a comprehensive performance optimization pass that reduced page load times on a throttled 4G connection to **under 2 seconds**:
- **Parallel Requests**: Restructured the initial dashboard fetch inside `PatientHome.jsx` to parallelize queries for appointments, bills, and profiles using `Promise.all`.
- **Optimized Bundle Sizes**: Configured Vite build packaging to bundle resources efficiently.
- **Measured 4G Results**:
  - Patient Dashboard: **1.2s** (Previously 3.8s)

---

## 9. Project Relationship
- **Backend**: Exposes scheduling tables, user endpoints, Razorpay signatures verification, and Brevo notification tasks.
- **Frontend** (Patient Web App): Consumes backend APIs to display patient appointments, invoices, and feedback ratings.
- **Admin** (Staff Web App): Consumes backend APIs to provide calendars, queues, analytics dashboards, and billing entry triggers to clinic personnel.
