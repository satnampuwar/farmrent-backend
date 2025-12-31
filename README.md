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
EMAIL_SERVICE=gmail
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASSWORD=your-app-password
```

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

The database contains two collections:

- `landlords`: Stores landlord posts with county, SPI, acres, asking price, and email
- `farmers`: Stores farmer interests with county, offered price, and email

Collections are automatically created when data is first inserted.

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

