# TechTrainer Server

A comprehensive Node.js backend server for the TechTrainer fitness application, built with Express.js and MongoDB.

## Features

- 🔐 JWT-based authentication with refresh tokens
- 👤 User management with role-based access control
- 💪 Comprehensive fitness tracking system
- 📊 Workout logging and progress tracking
- 🎯 Goal setting and achievement tracking
- 📱 Support ticket system
- 👨‍💼 Admin dashboard functionality
- 🔒 Security middleware (rate limiting, XSS protection, etc.)
- 📝 Structured logging with Winston
- 📤 File upload support with Cloudinary integration
- 📧 Email notification system
- 🌐 CORS configuration for cross-origin requests

## Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, XSS protection, Rate limiting
- **Logging**: Winston with file rotation
- **File Upload**: Multer with Cloudinary
- **Email**: Nodemailer
- **Validation**: Express Validator
- **Environment**: dotenv

## Project Structure

```text
server/
├── src/
│   ├── config/
│   │   └── config.js           # Environment configuration
│   ├── controllers/
│   │   └── WorkoutLogController.js
│   ├── middleware/
│   │   ├── adminAuth.js        # Admin authentication
│   │   ├── auth.js             # User authentication
│   │   └── errorHandler.js     # Global error handling
│   ├── models/
│   │   ├── SupportTicket.js    # Support ticket schema
│   │   ├── User.js             # User schema
│   │   ├── Workout.js          # Workout schema
│   │   └── WorkoutLog.js       # Workout log schema
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication endpoints
│   │   ├── chatRoutes.js       # Chat/support endpoints
│   │   ├── supportRoutes.js    # Support system endpoints
│   │   ├── userRoutes.js       # User management endpoints
│   │   ├── workoutRoutes.js    # Workout endpoints
│   │   └── WorkoutLogRoutes.js # Workout logging endpoints
│   └── utils/
│       ├── ApiResFormat.js     # Standardized API responses
│       ├── DatabaseHelp.js     # Database utilities
│       └── LoggerUtils.js      # Logging utilities
├── logs/                       # Log files (auto-generated)
├── uploads/                    # File uploads (auto-generated)
├── .env                        # Environment variables
├── .env.example               # Environment template
├── package.json               # Dependencies and scripts
└── server.js                  # Main server entry point
```

## Quick Start

### 1. Prerequisites

- Node.js (>=18.0.0)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to server directory
cd server

# Install dependencies
npm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# Key variables to set:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string
# - EMAIL_USER and EMAIL_PASSWORD: For email notifications
```

### 4. Database Setup

```bash
# Test database connection
npm run test:db

# Seed initial data (optional)
npm run seed
```

### 5. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Debug mode
npm run dev:debug
```

The server will start on `http://localhost:5000` (or the PORT specified in your .env file).

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start with nodemon for development
- `npm run dev:debug` - Start with debug logging enabled
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run seed` - Seed the database with initial data
- `npm run migrate` - Run database migrations
- `npm run test:db` - Test database connection

## Environment Variables

| Variable                | Description               | Default     |
| ----------------------- | ------------------------- | ----------- |
| `NODE_ENV`              | Environment mode          | development |
| `PORT`                  | Server port               | 5000        |
| `MONGO_URI`             | MongoDB connection string | Required    |
| `JWT_SECRET`            | JWT signing secret        | Required    |
| `JWT_EXPIRES_IN`        | JWT expiration time       | 7d          |
| `EMAIL_USER`            | Email service username    | Optional    |
| `EMAIL_PASSWORD`        | Email service password    | Optional    |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name     | Optional    |
| `CLOUDINARY_API_KEY`    | Cloudinary API key        | Optional    |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret     | Optional    |

See `.env.example` for the complete list of available configuration options.

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Delete user account
- `GET /api/users` - Get all users (admin only)

### Workouts

- `GET /api/workouts` - Get workout plans
- `POST /api/workouts` - Create workout plan
- `GET /api/workouts/:id` - Get specific workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Workout Logs

- `GET /api/workout-logs` - Get user's workout logs
- `POST /api/workout-logs` - Log a workout
- `GET /api/workout-logs/:id` - Get specific workout log
- `PUT /api/workout-logs/:id` - Update workout log
- `DELETE /api/workout-logs/:id` - Delete workout log

### Support System

- `GET /api/support/tickets` - Get support tickets
- `POST /api/support/tickets` - Create support ticket
- `PUT /api/support/tickets/:id` - Update ticket status
- `GET /api/support/chat` - Chat endpoints

## Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **XSS Protection**: Sanitizes user input
- **MongoDB Injection Prevention**: Uses express-mongo-sanitize
- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configurable cross-origin resource sharing
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Input Validation**: Express Validator for request validation

## Logging

The server uses Winston for structured logging with:

- **Console logging**: For development
- **File logging**: Rotating log files
- **Error logging**: Separate error log file
- **HTTP request logging**: Morgan middleware
- **Service-specific loggers**: Auth, database, etc.

Logs are stored in the `logs/` directory with automatic rotation.

## Error Handling

Comprehensive error handling includes:

- **Custom error classes**: ApiError for consistent error responses
- **Async error wrapper**: Catches async/await errors
- **Database error handling**: MongoDB-specific error handling
- **Validation error formatting**: Clean validation error responses
- **Development vs Production**: Different error detail levels

## File Uploads

File upload support with:

- **Multer middleware**: Handle multipart/form-data
- **Cloudinary integration**: Cloud storage for images
- **File type validation**: Configurable allowed file types
- **Size limits**: Configurable file size limits
- **Local fallback**: Store files locally if Cloudinary unavailable

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email [support@techtrainer.com](mailto:support@techtrainer.com) or create an issue in the repository.
