# CitiZen API

A citizen engagement platform API built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication System**
  - Google OAuth integration
  - Email/Password authentication
  - JWT-based token system
  - Password management
- **User Management**
  - Role-based access control (Citizen, MLA Staff, Department, Department Staff)
  - User verification system
- **Issue Management**
  - Issue creation and tracking
  - Department assignment
  - Status updates
  - Voting system
- **Location Management**
  - Constituency and Panchayat management
  - Ward-based organization

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Google OAuth credentials

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```env
   # Server Configuration
   PORT=3000

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/citizen_db

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here

   # Environment
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication Routes

#### 1. Signup with Google

```
POST /api/auth/signup/google
```

**Body:**

```json
{
  "accessToken": "google_access_token",
  "email": "user@example.com",
  "name": "John Doe",
  "phone_number": "1234567890"
}
```

#### 2. Set Password (for Google users)

```
POST /api/auth/set-password
```

**Headers:** `Authorization: Bearer <jwt_token>`
**Body:**

```json
{
  "password": "new_password"
}
```

#### 3. Signup with Email and Password

```
POST /api/auth/signup/email
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone_number": "1234567890"
}
```

#### 4. Login with Google

```
POST /api/auth/login/google
```

**Body:**

```json
{
  "accessToken": "google_access_token",
  "email": "user@example.com"
}
```

#### 5. Login with Email and Password

```
POST /api/auth/login/email
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 6. Change Password

```
POST /api/auth/change-password
```

**Headers:** `Authorization: Bearer <jwt_token>`
**Body:**

```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

#### 7. Get Current User

```
GET /api/auth/me
```

**Headers:** `Authorization: Bearer <jwt_token>`

## Authentication Flow

### Google Signup Flow:

1. User signs up with Google (`/signup/google`)
2. User sets a password (`/set-password`)
3. User can now login with either Google or email/password

### Email Signup Flow:

1. User signs up with email and password (`/signup/email`)
2. User can login with email/password immediately

### Login Options:

- Users who signed up with Google can login with either method
- Users who signed up with email can only login with email/password until they link a Google account

## Database Models

- **users** - User accounts with roles and authentication
- **departments** - Government departments
- **department_employees** - Employee-department relationships
- **constituency** - Electoral constituencies
- **panchayat** - Local government units
- **user_details** - User location information
- **issues** - Citizen issues and complaints
- **votes** - Issue voting system
- **notifications** - User notifications

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Project Structure

```
src/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Express middleware
├── utils/           # Utility functions
└── app.ts          # Main application file
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Google OAuth verification
- Input validation
- CORS configuration
- Environment variable management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
