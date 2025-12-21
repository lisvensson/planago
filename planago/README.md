# 🗺️ Planago

A smart travel‑planning app built with Remix, React, and Better Auth.  
Generate personalized day plans based on location, time frame, and activity preferences.

---

## 📚 Table of Contents

- [🚀 Getting Started](#-getting-started)
- [🌐 API Endpoints](#-api-endpoints)
  - [✅ Authentication (UI Route)](#-authentication-ui-route)
  - [✅ Create & Generate Plan](#-create--generate-plan)
  - [✅ Saved Plan](#-saved-plan)
  - [✅ Saved Plans Overview Page](#-saved-plans-overview-page)
  - [✅ Edit Plan](#-edit-plan)
  - [✅ Account Settings](#-account-settings)
- [🧭 Application Flow](#-application-flow)
- [🛠️ Tech Stack](#-tech-stack)

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```
git clone https://github.com/Medieinstitutet/fsu24d-examensarbetet-lisvensson.git
cd fsu24d-examensarbetet-lisvensson
```

### 2. Install dependencies

```
npm install
```

### 3. Create your environment file

```
cp .env.example .env
```

Then fill in the required environment variables (authentication keys, database URL, API keys, etc.).

### 4. Run the development server

```
npm run dev
```

The app will be available at:
http://localhost:5173

## 🌐 API Endpoints

Below is a complete overview of the key Remix routes used in Planago, structured as a clear reference guide.

## ✅ Authentication (UI Route)

### [GET] `/logga-in`

**Description:**  
Displays the login page where the user chooses an authentication provider.

**Behavior:**  
This route does not use a loader or action.  
Authentication is triggered client‑side via Better Auth.

**User can choose:**

- Continue with Google
- Continue with Microsoft

**Response:**  
Rendered HTML page with:

- App logo
- Login explanation
- Buttons for Google and Microsoft login

**Notes:**

- Authentication is handled entirely via Better Auth, which manges OAuth redirects, sessions and provider integration
- After successful login, the provider redirects the user to `/planago/skapa-resplan`

---

## ✅ Create & Generate Plan

### [GET] `/planago/skapa-resplan`

**Description:**  
Displays the filter form where the user can generate a new travel plan.

**User selects:**

- Location
- Time frame
- Activity types

**Response:**  
Rendered HTML page with the filter form.

---

### [GET] `/planago/skapa-resplan?location=X&timeFrame=Y&activityType=A…`

**Description:**  
The loader fetches activities based on the selected filters.

**Response:**

- Fetches activities from Google Places API and Google Geocoding API
- Generates a suggested plan
- Displays the plan to the user

---

### [POST] `/planago/skapa-resplan?location=X&timeFrame=Y&activityType=A…`

**Description:**  
Saves a generated plan to the database.

**Body example:**

```json
{
  "title": "Resplan för utflykt till Stockholm",
  "location": "Stockholm",
  "timeFrame": "Heldag",
  "activityTypes": ["Mat & Dryck", "Museum", "Äventyr & Friluftsliv"],
  "activities": [
    {
      "link": "https://maps.google.com/?cid=9394152137714159215&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
      "name": "Berzelii Park",
      "time": "10:00",
      "address": "111 47 Stockholm, Sweden",
      "category": "activity"
    },
    {
      "link": "https://maps.google.com/?cid=1447246973164410148&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
      "name": "Villa Godthem",
      "time": "12:30",
      "address": "Rosendalsvägen 9, 115 21 Stockholm, Sweden",
      "category": "food"
    },
    {
      "link": "https://maps.google.com/?cid=9893566190910365859&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
      "name": "The Viking Museum",
      "time": "14:00",
      "address": "Djurgårdsstrand 15, 115 21 Stockholm, Sweden",
      "category": "activity"
    },
    {
      "link": "https://maps.google.com/?cid=3339590537646505426&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
      "name": "Cane Rum Society",
      "time": "18:00",
      "address": "Ninni Kronbergs g 1, 171 64 Solna, Sweden",
      "category": "food"
    }
  ]
}
```

**Response:**

- Requires authentication
- Saves the plan
- Redirects to `/planago/resplan/:planId`

---

## ✅ Saved Plan

### [GET] `/planago/resplan/:planId`

**Description:**  
Displays a single saved plan.

**Response:**

- Fetches the plan by `planId`
- Renders a detailed view
- Loader ensures the plan belongs to the authenticated user

---

### [POST] `/planago/resplan/:planId` — Delete Plan

**Description:**  
Deletes a single travel plan belonging to the authenticated user.

**Request (form data):**

```json
{
  "intent": "delete"
}
```

**Behavior:**

- Requires authentication
- Loader verifies the plan exists and belongs to the user
- Action deletes the plan if:
  - `plan.id === params.planId`
  - `plan.userId === userSession.user.id`

**Response (success):**  
Redirects to `/konto/sparade-resplaner`

**Response (fail):**

```json
{ "error": "Could not delete your plan." }
```

---

## ✅ Saved Plans Overview Page

### [GET] `/konto/sparade-resplaner`

**Description:**  
Lists all saved plans for the authenticated user.

**Response:**  
Rendered HTML list of the user’s saved plans.

---

### [POST] `/konto/sparade-resplaner` — Delete Plan

**Description:**  
Deletes a saved plan from the user’s list of saved plans.

**Request (form data):**

```json
{
  "intent": "delete",
  "planId": "..."
}
```

**Behavior:**

- Requires authentication
- Deletes the plan only if it belongs to the logged‑in user

**Response (success):**  
Redirects back to `/konto/sparade-resplaner`

**Response (fail):**

```json
{ "error": "Could not delete the plan." }
```

---

## ✅ Edit Plan

### [GET] `/planago/redigera-resplan/:planId`

**Description:**  
Displays the edit form for a saved plan.

**Response:**

- Fetches the plan
- Pre‑fills the form
- Renders the edit view

---

### [GET] `/planago/redigera-resplan/:planId?location=X&timeFrame=Y&activityType=A…`

**Description:**  
The loader fetches new activities based on the selected filters.

**Response:**

- Fetches activities from Google Places API and Google Geocoding API
- Generates an updated suggested plan
- Displays the plan to the user

---

### [POST] `/planago/redigera-resplan/:planId?location=X&timeFrame=Y&activityType=A…`

**Description:**  
Updates an existing plan.

**Body example:**

```json
{
  "title": "Resplan för utflykt till Stockholm",
  "location": "Stockholm",
  "timeFrame": "Halvdag (förmiddag)",
  "activityTypes": ["Mat & Dryck", "Barnvänligt"],
  "activities": [
    {
      "link": "https://maps.google.com/?cid=9235742671082109763",
      "name": "Leo's Lekland",
      "time": "10:00",
      "address": "Mätslingan 2, 187 66 Stockholm, Sweden",
      "category": "activity"
    },
    {
      "link": "https://maps.google.com/?cid=17910249130159124712&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
      "name": "Boulebar Rådhuset",
      "time": "12:00",
      "address": "Nere i T-Banan, Hantverkargatan 8, 112 25 Stockholm, Sweden",
      "category": "food"
    }
  ]
}
```

**Response:**

- Updates the plan
- Redirects to `/planago/resplan/:planId`

---

## ✅ Account Settings

### [GET] `/konto/installningar`

**Description:**  
Fetches the authenticated user’s account data.

**Response:**  
Returns:

- `id`
- `email`
- `name`
- `image`

**Errors:**

- `401 Not authenticated`
- `500 Failed to fetch user data`

---

### [POST] `/konto/installningar` — Update Name

**Description:**  
Updates the user’s display name.

**Body example:**

```json
{
  "intent": "updateName",
  "name": "New Name"
}
```

**Response (success):**

```json
{ "success": true }
```

**Response (fail):**

```json
{ "error": "Invalid name" }
```

**Notes:**

- Requires authentication
- Name must be a non‑empty string
- Updates `updatedAt` timestamp

---

### [POST] `/konto/installningar` — Delete Account

**Description:**  
Permanently deletes the authenticated user’s account.

**Body example:**

```json
{
  "intent": "deleteAccount"
}
```

**Response (success):**  
Redirects to `/logga-in`

**Response (fail):**

```json
{ "error": "Could not perform action" }
```

**Notes:**

- Requires authentication
- Deletes the user record
- All saved plans belonging to the user are also removed
- This action cannot be undone

## 🧭 Application Flow

A simplified overview of how users interact with Planago from login to plan management.

### 1. User logs in

- Chooses Google or Microsoft as authentication provider
- Better Auth handles OAuth flow and session creation
- User is redirected to `/planago/skapa-resplan`

### 2. User creates a plan

- Selects:
  - Location
  - Time frame
  - Activity types
- Loader fetches activities from Google Places & Geocoding APIs
- A suggested plan is generated and displayed

### 3. User saves the plan

- Plan is stored in the database
- Plan becomes visible under **Saved Plans** (`/konto/sparade-resplaner`)

### 4. User manages their plans

- **Edit plan**
  - Opens `/planago/redigera-resplan/:planId`
  - User can update filters and regenerate activities
- **Delete plan**
  - Triggered via delete button
  - Confirmation dialog shown
  - Plan is removed from the database

### 5. User manages their account

- Update display name
- Delete account (permanently removes user + all saved plans)

### 6. User logs out

- Session is cleared
- User is redirected to `/logga-in`

## 🛠️ Tech Stack

A modern, full‑stack setup built for performance, type safety, and a smooth developer experience.

### ✅ Framework & UI

- **Remix** — full‑stack web framework (loaders, actions, routing)
- **React** — component‑based UI
- **Tailwind CSS** — utility‑first styling with custom theme colors

### ✅ Authentication

- **Better Auth** — handles OAuth, sessions, and provider integration
- **Google & Microsoft** — social login providers

### ✅ Data & Server

- **Drizzle ORM** — type‑safe database queries
- **PostgreSQL** — primary database (can be swapped for any SQL DB)

### ✅ Developer Experience

- **TypeScript** — full type safety across server + client
- **ESLint & Prettier** — consistent formatting and linting
- **Vite** — fast dev server and build tooling
