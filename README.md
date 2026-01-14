# FarmRent AI Backend Server

Backend API server for FarmRent AI application with MongoDB database and email notifications.

## Features

- RESTful API endpoints for landlords and farmers
- MongoDB database for storing posts and interests
- Email notifications using Nodemailer
- Automatic matching between farmers and landlords
- CORS enabled for frontend integration

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/farmrent
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
DEFAULT_ADMIN_EMAIL=admin@farmrent.ai
DEFAULT_ADMIN_PASSWORD=admin123
EMAIL_SERVICE=gmail
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Note:** The server automatically creates a super admin on startup if one doesn't exist. You can configure the default credentials using `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` environment variables. **Important:** Change the default password after first login in production!

**Note:** For MongoDB Atlas (cloud), use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farmrent
```

### 3. Gmail Setup (if using Gmail)

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "FarmRent AI" as the name
   - Copy the generated 16-character password
   - Use this password in your `.env` file (not your regular Gmail password)

### 4. Alternative Email Services

You can use other email services like SendGrid, Mailgun, etc.:

```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### POST `/api/landlord`

Post land details as a landlord.

**Request Body:**
```json
{
  "county": "Champaign",
  "spi": 136,
  "acres": 100,
  "asking_price": 250,
  "email": "landlord@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Landlord post created successfully",
  "id": 1
}
```

### POST `/api/farmer`

Express interest as a farmer. Automatically matches with landlords and sends email notifications.

**Request Body:**
```json
{
  "county": "Champaign",
  "offered_price": 260,
  "email": "farmer@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Farmer interest submitted successfully",
  "matches": 2
}
```

### POST `/api/signup`

Newsletter signup.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for signing up!"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "FarmRent API is running"
}
```

## Admin Panel API Endpoints

All admin endpoints require JWT authentication via Bearer token in the Authorization header (except login).

### POST `/api/admin/login`

Admin login endpoint.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin_123",
    "email": "admin@example.com"
  }
}
```

### GET `/api/admin/signups`

Get all newsletter signups (requires authentication). Supports pagination.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/admin/signups?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "email": "user@example.com",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET `/api/admin/landlords`

Get all landlord posts (requires authentication). Supports pagination.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/admin/landlords?page=2&limit=25
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "county": "Cook",
      "spi": 124,
      "acres": 100,
      "asking_price": 250,
      "email": "landlord@example.com",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET `/api/admin/farmers`

Get all farmer interests (requires authentication). Supports pagination.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/admin/farmers?page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "county": "Cook",
      "offered_price": 250,
      "email": "farmer@example.com",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 78,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET `/api/admin/stats`

Get dashboard statistics (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSignups": 150,
    "totalLandlords": 45,
    "totalFarmers": 78
  }
}
```

## Database

The application uses MongoDB to store data. Make sure MongoDB is installed and running on your system, or use MongoDB Atlas (cloud).

### Local MongoDB Setup

1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # macOS (using Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   # MongoDB should start automatically as a service
   ```

### MongoDB Collections

The database contains four collections:

- `landlords`: Stores landlord posts with county, SPI, acres, asking price, and email
- `farmers`: Stores farmer interests with county, offered price, and email
- `signups`: Stores newsletter signup emails
- `admins`: Stores admin user accounts (email and hashed password)

Collections are automatically created when data is first inserted.

### Creating an Admin User

**Automatic Super Admin Creation:**
The server automatically creates a super admin when it starts if one doesn't exist. The default credentials are:
- Email: `admin@farmrent.ai` (or set via `DEFAULT_ADMIN_EMAIL`)
- Password: `admin123` (or set via `DEFAULT_ADMIN_PASSWORD`)

**Manual Admin Creation (Optional):**
To manually create additional admin users, use the provided script:

```bash
node create-admin.js <email> <password>
```

Example:
```bash
node create-admin.js admin@example.com mypassword123
```

**Important:** 
- Make sure to set a strong `JWT_SECRET` in your `.env` file for production
- Change the default admin password after first login in production environments

## Email Notifications

When a farmer expresses interest:
1. The system finds all landlords in the same county with an asking price <= the farmer's offered price
2. Email notifications are sent to all matched landlords
3. The email includes the farmer's contact information and offer details

## Frontend Integration

Update your React app's `.env` file to point to the backend:

```env
REACT_APP_API_URL=http://localhost:3001
```

Or update the API_BASE_URL in the React components if you're using a different backend URL.

## Project Structure

```
farmrent-backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── adminController.js    # Admin route handlers
│   ├── farmerController.js   # Farmer route handlers
│   ├── landlordController.js # Landlord route handlers
│   └── signupController.js   # Signup route handlers
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── Admin.js             # Admin model
│   ├── Farmer.js            # Farmer model
│   ├── Landlord.js          # Landlord model
│   └── Signup.js            # Signup model
├── routes/
│   ├── adminRoutes.js       # Admin API routes
│   └── publicRoutes.js      # Public API routes
├── services/
│   ├── adminService.js      # Admin business logic (with pagination)
│   ├── farmerService.js     # Farmer business logic
│   ├── landlordService.js   # Landlord business logic
│   └── signupService.js     # Signup business logic
├── utils/
│   └── initAdmin.js         # Super admin initialization utility
├── server.js                # Main server file
└── package.json
```

## Production Deployment

1. Set `NODE_ENV=production` in your `.env` file
2. Use MongoDB Atlas or a managed MongoDB service for production
3. Set `MONGODB_URI` to your production database connection string
4. Consider using a production email service (SendGrid, Mailgun, etc.)
5. Set up proper environment variables on your hosting platform
6. Use a process manager like PM2 for Node.js applications

## Troubleshooting

### Email not sending?

- Check your email credentials in `.env`
- For Gmail, make sure you're using an App Password, not your regular password
- Check the server logs for email errors
- Verify your email service configuration

### Database errors?

- Make sure MongoDB is installed and running
- Check your `MONGODB_URI` in `.env` file
- For local MongoDB, ensure the service is running: `mongod` or `brew services start mongodb-community`
- For MongoDB Atlas, verify your connection string and network access settings
- Review server logs for specific error messages

### CORS issues?

- The server has CORS enabled by default
- If you need to restrict origins, update the CORS configuration in `server.js`

