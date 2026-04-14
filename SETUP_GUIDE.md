# Getting Started Guide for RentaRide Development

A comprehensive guide to set up and run RentaRide locally for development.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Running the Application](#running-the-application)
4. [Testing User Flows](#testing-user-flows)
5. [Common Issues & Solutions](#common-issues--solutions)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js 14+** - [Download](https://nodejs.org/)
- **npm 6+** - Comes with Node.js
- **MongoDB** - Either:
  - MongoDB Atlas (Cloud) - [Create free account](https://www.mongodb.com/cloud/atlas)
  - MongoDB Community Edition (Local) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

### Recommended
- **VS Code** - [Download](https://code.visualstudio.com/)
- **Postman** - [Download](https://www.postman.com/) (for API testing)
- **MongoDB Compass** - [Download](https://www.mongodb.com/products/tools/compass) (for database visualization)

### Verify Installation

```bash
# Check Node.js
node --version  # Should be v14 or higher

# Check npm
npm --version   # Should be 6 or higher

# Check Git
git --version
```

## Initial Setup

### Step 1: Clone the Repository

```bash
# Clone the repo
git clone <your-repository-url>

# Navigate to project directory
cd "FINAL YEAR PROJECT"

# Initialize git (if not already done)
git init
```

### Step 2: Configure MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended for Beginners)

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (select "M0 Free tier")
4. Add IP address (or allow all: 0.0.0.0/0 for development)
5. Create a database user with username and password
6. Get connection string:
   - Click "Connect" → "Connect your application"
   - Choose "Node.js" driver
   - Copy the connection string
7. Replace `<username>` and `<password>` in the string

Example connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/rentaride?retryWrites=true&w=majority
```

#### Option B: MongoDB Community (Local)

```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Windows - Download and run installer
# See: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/

# Start MongoDB
mongod

# In another terminal, verify connection
mongo  # or mongosh (newer versions)
```

### Step 3: Backend Setup

```bash
# Navigate to server directory
cd server

# Copy environment template
cp .env.example .env

# Edit .env with your values
# On Windows (PowerShell): notepad .env
# On macOS/Linux: nano .env

# Required environment variables to set:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rentaride
# JWT_SECRET=choose_a_strong_random_secret_key_here
# PORT=5000
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:3000

# Install dependencies
npm install

# Verify installation
npm list
```

### Step 4: Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Verify installation
npm list

# Check that Tailwind CSS is configured
ls -la public/
ls src/index.css
```

### Step 5: Create Admin User (Optional)

```bash
# From server directory
cd server

# Create seed data (admin user)
node seedAdmin.js

# You should see: "Admin user created or already exists"
# Admin credentials:
# Email: admin@rentaride.com
# Password: admin123
```

## Running the Application

### Terminal Setup

You'll need **3 separate terminal windows** for development:

1. **Terminal 1: Backend Server**
2. **Terminal 2: Frontend Development Server**
3. **Terminal 3: MongoDB** (if using local MongoDB)

### Option 1: Run Everything

#### Terminal 1 - MongoDB (if using local)
```bash
mongod
```

#### Terminal 2 - Backend
```bash
cd server
npm run dev

# You should see:
# MongoDB Connected
# Server running on port 5000
```

#### Terminal 3 - Frontend
```bash
cd client
npm start

# Browser should open to http://localhost:3000
# If not, manually navigate to http://localhost:3000
```

### Option 2: Run with npm Concurrently (Root Level)

```bash
# From project root (requires npm 7+)
npm run dev

# This will start both client and server concurrently
# Note: MongoDB still needs to run separately
```

## Testing User Flows

### 1. Test User Registration

1. Open `http://localhost:3000`
2. Click "Register"
3. Fill in form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: User (default)
4. Click Register
5. Should redirect to home page and show user in navbar

### 2. Test Owner Registration & Add Vehicle

1. Click "Register"
2. Fill form:
   - Name: Vehicle Owner
   - Email: owner@example.com
   - Password: password123
   - Role: **Owner** (select from dropdown)
3. Register
4. Click "Add Vehicle" in navbar
5. Fill vehicle form:
   - Name: Toyota Camry
   - Model: 2023
   - Price/Day: 50
6. Submit
7. Return to home - new vehicle should appear

### 3. Test Booking Flow

1. Login as regular user
2. Browse vehicles on home page
3. Click "Book Now" on a vehicle
4. Fill booking dates (ensure they don't overlap)
5. Submit booking
6. Verify booking appears in "My Bookings"

### 4. Test Owner Dashboard

1. Login as owner
2. Click calendar icon in navbar
3. View pending bookings
4. Approve or reject a booking
5. Check notification badge updates

### 5. Test Admin Dashboard

1. Login with admin account:
   - Email: admin@rentaride.com
   - Password: admin123
2. Click shield icon in navbar
3. View system statistics
4. View all users and vehicles

### 6. Test Authorization

Try accessing protected routes directly:
- `/owner-dashboard` as regular user → should redirect to home
- `/superadmin` as owner → should redirect to home
- `/add-vehicle` as user → should redirect to home

## Common Issues & Solutions

### Issue: "MongoDB Connection Error"

**Solutions:**
1. Check MongoDB URI in `.env`
2. Verify MongoDB Atlas:
   - Go to Network Access → add your IP
   - Check database user credentials
3. If using local MongoDB, ensure `mongod` is running
4. Check internet connection

### Issue: "Port 5000 already in use"

**Solutions:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000    # Windows
lsof -i :5000                   # macOS/Linux

# Kill the process
taskkill /PID <PID> /F          # Windows
kill -9 <PID>                   # macOS/Linux

# Or change port in .env
PORT=5001
```

### Issue: "CORS Error when making API calls"

**Solutions:**
1. Check that backend is running on port 5000
2. Verify API URL in frontend matches backend port
3. Check CORS_ORIGIN in server `.env` (should be http://localhost:3000)

```bash
# Frontend API URL (src files should use):
http://localhost:5000/api
```

### Issue: "npm dependencies won't install"

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: "Black screen on http://localhost:3000"

**Solutions:**
1. Check frontend terminal for errors
2. Try hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
3. Clear browser cache
4. Check browser console (F12) for JavaScript errors

### Issue: "Email already exists" during registration

**Solution:** Email is already registered. Use a different email address.

### Issue: "Invalid token" or logged out unexpectedly

**Solutions:**
1. Tokens expire after 30 days (configurable)
2. Login again to get new token
3. Check browser localStorage for `token` key
4. Clear browser storage and login fresh

## Development Workflow

### 1. Making Backend Changes

```bash
# In server terminal (running npm run dev)
# Changes automatically reload with nodemon
# If not automatic, restart: Ctrl+C then npm run dev
```

### 2. Making Frontend Changes

```bash
# Changes automatically reload
# Just save file in editor
# Browser should reflect changes within seconds
```

### 3. Database Changes

Use MongoDB Compass to visualize:
1. Download MongoDB Compass
2. Connect with your MongoDB URI
3. Browse collections visually
4. Can also edit documents directly

## Debugging

### Enable Verbose Logging

Backend (server/.env):
```env
NODE_ENV=development  # Already enables morgan logging
```

Frontend Console:
```javascript
// In any component or pages
console.log(auth)  // See auth state
console.log(data)  // See API responses
```

### Using Postman for API Testing

1. Download and install Postman
2. Import endpoints from [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
3. Set `Authorization` header with token for protected routes
4. Test API directly

Example:
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

## Next Steps

After successful setup:

1. **Read Documentation:**
   - [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) - All API endpoints
   - [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) - Database structure
   - [README.md](../README.md) - Project overview

2. **Explore Code Structure:**
   - `/server/controllers` - Business logic
   - `/server/models` - Database schemas
   - `/server/middleware` - Validation & auth
   - `/client/pages` - React pages
   - `/client/components` - Reusable components

3. **Start Developing:**
   - Create feature branches: `git checkout -b feature/my-feature`
   - Make changes and test locally
   - Commit: `git commit -m "Add feature"`
   - Push: `git push origin feature/my-feature`

4. **Run Tests** (when implemented):
   ```bash
   cd client
   npm test
   
   cd ../server
   npm test
   ```

## Getting Help

- Check terminal error messages
- See [Common Issues](#common-issues--solutions) section
- Check [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) for endpoint details
- Check browser console (F12) for client-side errors
- Review git history: `git log --oneline`

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/)

---

Happy coding! 🚀
