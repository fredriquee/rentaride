# RentaRide

A modern MERN stack vehicle rental system with authentication, booking management, and admin dashboard.

## Features

- **User Authentication** - JWT-based authentication with role-based access control
- **Vehicle Management** - Owners can list and manage vehicles
- **Booking System** - Users can browse, book, and request to cancel bookings
- **Booking Approval** - Owners approve or reject pending bookings
- **Double Booking Prevention** - System prevents overlapping bookings on same vehicle
- **Dark Mode** - Full dark mode support with theme toggle
- **Input Validation** - Server-side and client-side validation
- **Security** - CORS protection, rate limiting, helmet security headers
- **Error Handling** - Comprehensive error boundaries and error middleware

## Tech Stack

- **Frontend:** React.js 19, React Router v7, Tailwind CSS, Lucide Icons
- **Backend:** Express.js, Node.js, MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, CORS, bcryptjs, Rate Limiting, Input Validation

## Project Structure

```
project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/        # Auth & Theme context
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── server.js
│   └── package.json
├── API_DOCUMENTATION.md    # API endpoints reference
├── DATABASE_SCHEMA.md      # Database schema documentation
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (Atlas or local instance)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "FINAL YEAR PROJECT"
```

### 2. Backend Setup

```bash
cd server

# Copy environment variables template
cp .env.example .env

# Configure .env with your MongoDB URI and JWT secret
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rentaride
# JWT_SECRET=your_secret_key_here
# PORT=5000

# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Or start production server
npm start
```

The backend will run on `http://localhost:5000` by default.

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will open at `http://localhost:3000`.

### 4. Database Initialization (Optional)

To seed an admin user:

```bash
cd server
node seedAdmin.js
```

This creates an admin account for super admin dashboard access.

## Environment Variables

### Server (.env)

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/rentaride

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production

# CORS (optional, defaults to localhost:3000)
CORS_ORIGIN=http://localhost:3000
```

See `server/.env.example` for all available options.

## API Documentation

For detailed API endpoints and usage, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Examples

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

**Get All Vehicles:**
```bash
curl http://localhost:5000/api/vehicles
```

**Create Booking:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "vehicle_id",
    "startDate": "2026-04-15T00:00:00Z",
    "endDate": "2026-04-17T00:00:00Z"
  }'
```

## Database Schema

For detailed database structure and relationships, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

## User Roles

### Regular User
- Browse available vehicles
- Create bookings
- View own bookings
- Request booking cancellation

### Vehicle Owner
- List and manage vehicles
- View bookings for their vehicles
- Approve or reject pending bookings
- Dashboard with booking notifications

### Super Admin
- View all users and vehicles
- Access system statistics
- Dashboard with system overview

## Security Features

- **CORS Protection:** Restricted to configured domains
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Request Validation:** All inputs validated and sanitized
- **Password Encryption:** Passwords hashed with bcryptjs
- **JWT Authentication:** Secure token-based authentication
- **Security Headers:** Helmet.js for HTTP headers
- **Request Size Limits:** Maximum 10KB per request

## Running Tests

```bash
# Frontend tests
cd client
npm test

# Backend tests (to be implemented)
cd server
npm test
```

## Development Scripts

### Backend
```bash
npm run dev    # Start with auto-reload (nodemon)
npm start      # Start production server
```

### Frontend
```bash
npm start      # Start development server
npm build      # Build for production
npm test       # Run tests
```

## Deployment

### Backend Deployment

1. Set environment variables in production environment
2. Install dependencies: `npm install`
3. Build if needed, then run: `npm start`
4. Consider using process managers like PM2

### Frontend Deployment

1. Build production bundle: `npm run build`
2. Deploy the `build/` directory to hosting service
3. Ensure API endpoint is configured for production backend

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB URI is correct
- Check MongoDB Atlas IP whitelist includes your machine
- Ensure credentials are correct

### CORS Errors
- Check `CORS_ORIGIN` environment variable
- Ensure frontend URL matches configured origin

### Port Already in Use
- Change PORT in .env file
- Or kill existing process: `lsof -ti:5000 | xargs kill -9`

### JWT Token Expired
- Tokens expire after 30 days
- Users need to login again for new token
- Update `expiresIn` in `server/controllers/authController.js` to change duration

## Contributing

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Open a pull request

## License

ISC

## Support

For issues or questions, please open an issue in the repository.

## Future Enhancements

- [ ] Email notifications for bookings
- [ ] Payment integration (Stripe)
- [ ] Vehicle reviews and ratings
- [ ] Advanced search and filters
- [ ] Real-time updates with WebSockets
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Booking history and reports
