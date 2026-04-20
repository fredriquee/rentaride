# RentaRide

A vehicle rental platform where people can list their vehicles for rent and others can browse, book, and pay for rentals. It's built with the MERN stack and includes features like user authentication, booking management, payment processing through Khalti, and separate dashboards for renters, owners, and admins.

## What Can You Do?

### As a Renter (User)
- Sign up and log in with email and password
- Browse all available vehicles in your area with filters (location, vehicle type, fuel type, price range)
- See vehicle details including photos, owner contact info (name, email, phone), and pricing
- Book a vehicle by selecting dates and get instant price calculation
- View all your bookings with status updates (pending, confirmed, cancelled, completed)
- See the vehicle picture and owner details in your bookings so you know who to contact
- Request to cancel bookings if plans change
- Make payments through Khalti when your booking is confirmed
- Switch to Owner mode if you want to list your own vehicles
- Toggle between dark and light mode
- See your password while typing during login or registration

### As an Owner
- List your vehicles with photos, pricing, location, and details (fuel type, vehicle type)
- Edit vehicle information anytime
- See all booking requests from renters
- Approve or reject bookings
- View renter information to contact them if needed
- Mark vehicles as available, unavailable, or under maintenance
- Check your Owner Dashboard for booking notifications

### As an Admin
- Access Super Admin Dashboard to see system overview
- View all users and vehicles on the platform
- Check booking statistics and system reports

## Technologies Used

- **Frontend:** React, Tailwind CSS, React Router, Lucide Icons
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT tokens
- **Payments:** Khalti payment gateway
- **Security:** Password hashing, CORS, JWT validation

## Folder Structure

```
project/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── pages/            # All page components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Auth and Theme context
│   │   └── services/         # API calls
│   └── package.json
├── server/                    # Backend API
│   ├── controllers/          # Business logic
│   ├── models/               # Database schemas
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth, validation, error handling
│   └── package.json
└── README.md
```

## How to Run

### Prerequisites
- Node.js installed
- MongoDB connection (local or MongoDB Atlas)
- npm or yarn

### Setting Up the Backend

1. Go to server folder:
```bash
cd server
```

2. Create a `.env` file with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secret_key
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

3. Install dependencies and start:
```bash
npm install
npm run dev
```

The backend will run on `http://localhost:5000`

### Setting Up the Frontend

1. Go to client folder:
```bash
cd client
```

2. Install dependencies and start:
```bash
npm install
npm start
```

The app will open at `http://mandipdas.com.np`

