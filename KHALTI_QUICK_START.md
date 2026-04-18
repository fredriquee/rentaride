# Khalti Payment Integration - Implementation Checklist

A quick reference guide for implementing Khalti payments in RentaRide.

## ✅ Backend Files Created/Modified

- [x] **Payment Model** (`/server/models/Payment.js`)
  - Complete MongoDB schema with Khalti payment fields
  - Tracks payment status, transaction IDs, amounts, and timestamps

- [x] **Payment Controller** (`/server/controllers/paymentController.js`)
  - `initiatePayment()` - Start payment with Khalti
  - `verifyPayment()` - Verify payment after user returns
  - `handlePaymentCallback()` - Handle Khalti's return callback
  - `getPaymentByBooking()` - Retrieve payment by booking
  - `getUserPayments()` - Get all user's payments
  - `cancelPayment()` - Cancel pending payment

- [x] **Payment Routes** (`/server/routes/paymentRoutes.js`)
  - POST `/api/payments/initiate` - Initiate payment
  - POST `/api/payments/verify` - Verify payment
  - GET `/api/payments/callback` - Khalti callback handler
  - GET `/api/payments/booking/:bookingId` - Get booking payment
  - GET `/api/payments/my` - Get user payments
  - POST `/api/payments/:paymentId/cancel` - Cancel payment

- [x] **Server.js Updated**
  - Added payment routes to Express app
  - Routes mounted at `/api/payments`

- [x] **Booking Model Updated** (`/server/models/Booking.js`)
  - Added `paymentId` field to link bookings with payments

## ✅ Frontend Files Created

- [x] **Payment Service** (`/client/src/services/paymentService.js`)
  - `initiatePayment()` - Start payment process
  - `verifyPayment()` - Verify payment with server
  - `getPaymentByBooking()` - Get payment data
  - `getUserPayments()` - List user payments
  - `cancelPayment()` - Cancel pending payment
  - `getPaymentURL()` - Generate payment URL

- [x] **Payment Page Component** (`/client/src/pages/PaymentPage.js`)
  - Full payment UI at `/payment/:bookingId`
  - Shows payment status (pending, completed, failed)
  - Redirect to Khalti payment portal
  - Payment verification after return
  - Receipt download functionality

## 📋 Quick Setup Steps

### 1. Install Dependencies
```bash
# Server - axios is likely already installed, but verify:
cd server
npm install axios

# No new dependencies needed for frontend (axios already there)
```

### 2. Environment Configuration

**Create `/server/.env`:**
```env
KHALTI_SECRET_KEY=your_sandbox_secret_key_here
KHALTI_MERCHANT_NAME=RentaRide
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/rentaride
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

**Create `/client/.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_KHALTI_MODE=sandbox
```

### 3. Get Khalti Credentials

1. Signup: https://test-admin.khalti.com/#/join/merchant
2. OTP: 987654
3. Login and go to Settings → API Keys
4. Copy your Secret Key and paste in `.env`

### 4. Add Route to App.js

```javascript
// In client/src/App.js - add this route
import PaymentPage from "./pages/PaymentPage";

<Route path="/payment/:bookingId" element={<PaymentPage />} />
```

### 5. Add Payment Button to Your Booking List

Update `/client/src/pages/MyBookings.js` to include:
```javascript
import { useNavigate } from "react-router-dom";

// Inside your booking card:
{booking.status === "confirmed" && !booking.paymentId && (
  <button
    onClick={() => navigate(`/payment/${booking._id}`)}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
  >
    Pay Now
  </button>
)}
```

### 6. Test the Flow

1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd client && npm start`
3. Create a booking
4. Click "Pay Now"
5. Use test Khalti ID: **9800000000**
6. MPIN: **1111**
7. OTP: **987654**

## 🔗 Integration Points

### Where to Add Payment UI

1. **After Booking Confirmation**
   - Show "Pay Now" button once booking is "confirmed"
   - Links to `/payment/:bookingId`

2. **In My Bookings**
   - Add payment status indicator
   - Show payment button if payment pending

3. **In Booking Details**
   - Display payment status
   - Option to retry payment if failed

4. **Dashboard**
   - Show payment statistics
   - List recent payments

## 🧪 Test Scenarios

### Successful Payment
- Use Khalti ID: 9800000000
- MPIN: 1111
- OTP: 987654
- Expected: Payment marked as "completed", booking becomes "confirmed"

### Cancelled Payment
- Don't complete payment, click "Cancel"
- Expected: Redirect to return URL with `status=User canceled`

### Pending Payment
- Network interruption during payment
- Expected: Payment marked as "pending", can verify later

## 📊 Payment Status Flow

```
initiated → pending → completed
              ↓
            failed
              ↓
          cancelled
```

## 🚀 For Production

1. Sign up at https://admin.khalti.com/ (production account)
2. Get production Secret Key
3. Update `.env`:
   ```env
   KHALTI_SECRET_KEY=your_production_secret_key
   NODE_ENV=production
   FRONTEND_URL=https://yourdomain.com
   ```
4. Deploy frontend and backend
5. Test with real credentials

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `/server/models/Payment.js` | Database schema |
| `/server/controllers/paymentController.js` | Payment logic |
| `/server/routes/paymentRoutes.js` | API endpoints |
| `/client/src/services/paymentService.js` | Frontend API calls |
| `/client/src/pages/PaymentPage.js` | Payment UI |
| `KHALTI_SETUP_GUIDE.md` | Detailed setup guide |

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Invalid token" | Check KHALTI_SECRET_KEY in .env |
| "return_url is invalid" | Update FRONTEND_URL in .env |
| Payment stays pending | Manually call verify endpoint |
| CORS errors | Check CORS_ORIGIN in .env |
| Payment page not found | Add route to App.js |
| "Cannot read dailyRate" | Ensure vehicle schema has pricing field |

## 🔐 Security Notes

- Never commit .env files to git
- Use different keys for sandbox and production
- Always verify payment with Khalti server
- Store payment records securely
- Log all payment transactions
- Use HTTPS in production

## 📞 Support

- Khalti Docs: https://docs.khalti.com/
- Khalti Support: support@khalti.com
- Full Setup Guide: `KHALTI_SETUP_GUIDE.md`

---

## Summary

You now have a complete Khalti payment integration with:
- ✓ Backend API endpoints
- ✓ Database models and relationships
- ✓ Frontend UI components
- ✓ Payment service layer
- ✓ Complete documentation

**Next Step:** Copy the `.env` values from Khalti, then test the integration!
