# Khalti Payment Integration Guide

This guide will help you set up and integrate Khalti payment gateway into the RentaRide application.

## Table of Contents
1. [Sandbox Setup](#sandbox-setup)
2. [Environment Variables](#environment-variables)
3. [Backend Configuration](#backend-configuration)
4. [Frontend Configuration](#frontend-configuration)
5. [Testing the Integration](#testing-the-integration)
6. [Production Deployment](#production-deployment)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## Sandbox Setup

### Step 1: Create a Khalti Merchant Account (Sandbox)

1. Visit [Khalti Sandbox Admin](https://test-admin.khalti.com/#/join/merchant)
2. Sign up as a merchant
3. Use **987654** as the OTP for sandbox environment
4. Fill in your business details and complete registration

### Step 2: Get Your API Keys

1. After registration, log in to [Khalti Test Admin](https://test-admin.khalti.com/)
2. Navigate to **Settings** → **API Keys** (or Credentials)
3. Copy your **Secret Key** - you'll need this for `KHALTI_SECRET_KEY`
4. Note your **Merchant Name** for `KHALTI_MERCHANT_NAME`

### Step 3: Test Credentials

For testing payments in sandbox mode, use these credentials:

**Test Khalti IDs:**
- 9800000000
- 9800000001
- 9800000002
- 9800000003
- 9800000004
- 9800000005

**Test MPIN:** 1111

**Test OTP:** 987654

---

## Environment Variables

### Server (.env file in `/server` directory)

```env
# Khalti Payment Configuration
KHALTI_SECRET_KEY=<Your_Sandbox_Secret_Key>
KHALTI_MERCHANT_NAME=RentaRide
NODE_ENV=development

# Make sure these are also set
MONGO_URI=mongodb://localhost:27017/rentaride
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
PORT=5000
```

**Where to get each value:**
- `KHALTI_SECRET_KEY`: From Khalti Test Admin → Settings → API Keys
- `KHALTI_MERCHANT_NAME`: Your merchant name (can be any name)
- `NODE_ENV`: Set to `development` for sandbox, `production` for live
- `FRONTEND_URL`: Your React app URL (localhost for development)

### Client (.env file in `/client` directory)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_KHALTI_MODE=sandbox
```

---

## Backend Configuration

### Files Already Created:

1. **`/server/models/Payment.js`** - Payment schema with Khalti fields
2. **`/server/controllers/paymentController.js`** - Payment handler functions
3. **`/server/routes/paymentRoutes.js`** - Payment API routes
4. **`/server/server.js`** - Updated to include payment routes

### Payment Endpoints Available:

#### 1. Initiate Payment
```
POST /api/payments/initiate
```
**Body:**
```json
{
  "bookingId": "booking_object_id"
}
```
**Response:**
```json
{
  "success": true,
  "pidx": "unique_payment_id",
  "payment_url": "https://test-pay.khalti.com/?pidx=...",
  "expires_at": "2023-05-25T16:26:16.471649+05:45",
  "expires_in": 1800,
  "payment": {
    "id": "payment_object_id",
    "amount": 5000,
    "amountInPaisa": 500000
  }
}
```

#### 2. Verify Payment
```
POST /api/payments/verify
```
**Body:**
```json
{
  "pidx": "unique_payment_id",
  "bookingId": "booking_object_id"
}
```
**Response:**
```json
{
  "success": true,
  "status": "Completed",
  "payment": {
    "id": "payment_id",
    "pidx": "...",
    "status": "completed",
    "transaction_id": "...")
  }
}
```

#### 3. Get User Payments
```
GET /api/payments/my
```
**Response:**
```json
{
  "success": true,
  "count": 5,
  "payments": [...]
}
```

---

## Frontend Configuration

### Files Already Created:

1. **`/client/src/services/paymentService.js`** - API service for payments
2. **`/client/src/pages/PaymentPage.js`** - Payment UI component

### Integration in Your App:

#### Option 1: From Booking Page

Add a "Pay Now" button in your MyBookings page:

```javascript
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const navigate = useNavigate();
  
  // In your booking item render:
  {booking.status === "confirmed" && !booking.paymentId && (
    <button
      onClick={() => navigate(`/payment/${booking._id}`)}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      Pay Now
    </button>
  )}
}
```

#### Option 2: Add Route to Your App.js

```javascript
import PaymentPage from "./pages/PaymentPage";

function App() {
  return (
    <Routes>
      {/* ... other routes */}
      <Route path="/payment/:bookingId" element={<PaymentPage />} />
    </Routes>
  );
}
```

#### Option 3: Use Payment Service Directly

```javascript
import paymentService from "../services/paymentService";

// Initiate payment
const handlePay = async (bookingId) => {
  try {
    const response = await paymentService.initiatePayment(bookingId);
    // Redirect user to payment URL
    window.location.href = response.payment_url;
  } catch (error) {
    console.error("Payment failed:", error);
  }
};
```

---

## Testing the Integration

### Step 1: Start Your Application

```bash
# Terminal 1 - Backend
cd server
npm install  # if needed
npm run dev  # or npm start

# Terminal 2 - Frontend
cd client
npm install  # if needed
npm start
```

### Step 2: Create a Test Booking

1. Login to your application
2. Switch to "Renter" mode (if applicable)
3. Select a vehicle and create a booking
4. Complete booking (backend should create it in "pending" status)

### Step 3: Initiate Payment

1. Navigate to your booking
2. Click "Pay Now" or go directly to `/payment/{bookingId}`
3. Click "Pay with Khalti" button
4. You'll be redirected to Khalti test payment portal

### Step 4: Complete Test Payment

1. On Khalti payment page, select a payment method
2. Use one of the test Khalti IDs (9800000000-9800000005)
3. Enter MPIN: 1111
4. Enter OTP: 987654
5. Complete payment

### Step 5: Verify Payment

1. You'll be redirected back to your app
2. Server automatically verifies with Khalti
3. Booking status updates to "confirmed"
4. Payment status updates to "completed"

---

## Production Deployment

### Step 1: Create Production Account

1. Visit [Khalti Admin](https://admin.khalti.com/)
2. Sign up/login with production account
3. Complete KYC verification

### Step 2: Get Production Credentials

1. Copy your **Live Secret Key** from Settings → API Keys
2. Note the **Merchant Code** if required

### Step 3: Update Environment Variables

```env
# In /server/.env
KHALTI_SECRET_KEY=<Your_Production_Secret_Key>
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# In /client/.env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_KHALTI_MODE=production
```

### Step 4: Deploy

- Ensure your backend and frontend are deployed to production URLs
- Update `FRONTEND_URL` in backend `.env` to match your production domain
- Khalti will use your `return_url` (automatically generated) for redirects

---

## API Endpoints Reference

### Payment Endpoints

All endpoints require `Authorization: Bearer <token>` header except where noted.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/payments/initiate` | Start payment process | Private |
| POST | `/api/payments/verify` | Verify payment with Khalti | Private |
| GET | `/api/payments/callback` | Handle Khalti callback | Public |
| GET | `/api/payments/booking/:bookingId` | Get payment for booking | Private |
| GET | `/api/payments/my` | Get user's payments | Private |
| POST | `/api/payments/:paymentId/cancel` | Cancel pending payment | Private |

### Database Schema

**Payment Collection:**
```javascript
{
  _id: ObjectId,
  booking: ObjectId, // Reference to Booking
  user: ObjectId, // Reference to User
  amount: Number, // Amount in Rs
  amountInPaisa: Number, // Amount in Paisa (1 Rs = 100 paisa)
  currency: String, // "NPR"
  status: String, // "initiated", "pending", "completed", "failed", "cancelled", "refunded"
  
  // Khalti fields
  pidx: String, // Khalti payment ID
  payment_url: String, // Khalti payment URL
  transaction_id: String, // Khalti transaction ID
  tidx: String, // Transaction index
  khalti_mobile: String, // Khalti ID used for payment
  
  // Order details
  purchase_order_id: String, // Unique order ID
  purchase_order_name: String, // Order name
  amount_breakdown: Array, // Details of amount
  
  // Timestamps
  createdAt: Date,
  paymentInitiatedAt: Date,
  paymentCompletedAt: Date,
  updatedAt: Date
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid token" or "Authentication credentials were not provided"
**Solution:** 
- Make sure `KHALTI_SECRET_KEY` is correct in your `.env`
- Verify the key is prefixed with "Key " in the header (done automatically in controller)

#### 2. "return_url is invalid"
**Solution:**
- Update `FRONTEND_URL` in `.env` to match your actual frontend URL
- For localhost, use `http://localhost:3000`
- For production, use your full domain (must be accessible)

#### 3. Payment stays in "pending" status
**Solution:**
- Call the verify endpoint manually
- Check if Khalti actually processed the payment in their dashboard
- May be a network issue - try again in a few moments

#### 4. Browser shows "Cannot GET /payment/:bookingId"
**Solution:**
- Make sure you added the route in your App.js:
```javascript
<Route path="/payment/:bookingId" element={<PaymentPage />} />
```

#### 5. "CORS error" when calling payment API
**Solution:**
- Verify `CORS_ORIGIN` in server `.env` matches your frontend URL
- In server.js, check CORS is configured correctly

#### 6. Amount is showing as 0 or wrong value
**Solution:**
- Make sure the booking vehicle has `dailyRate` or `pricePerDay` field
- Verify booking dates are set correctly
- Check payment calculation in paymentController

### Debug Mode

To enable detailed logging, add to your server `.env`:
```env
DEBUG=khalti:*
LOG_LEVEL=debug
```

Then check server console for detailed payment logs.

---

## Additional Resources

- [Khalti Official Documentation](https://docs.khalti.com/)
- [Khalti API Docs](https://docs.khalti.com/khalti-epayment/)
- [Khalti Sandbox Testing](https://docs.khalti.com/khalti-epayment/#getting-started)
- [Khalti GitHub](https://github.com/khalti)

---

## Support

For issues specific to your integration:
1. Check the Khalti documentation
2. Review server console logs for error messages
3. Verify all environment variables are set correctly
4. Test with Khalti's test credentials first
5. Contact Khalti support: support@khalti.com

For issues with the RentaRide payment integration specifically, check the code comments and error handling in:
- `/server/controllers/paymentController.js`
- `/client/src/services/paymentService.js`
- `/client/src/pages/PaymentPage.js`
