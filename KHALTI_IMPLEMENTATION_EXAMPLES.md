# Khalti Payment Integration - Example Implementation Pattern

This file shows example code snippets for integrating Khalti payment button into your existing pages.

## Example 1: Add Payment Button to MyBookings Page

Update your `/client/src/pages/MyBookings.js`:

```javascript
import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";

function MyBookings() {
  const navigate = useNavigate();
  // ... existing code ...

  return (
    // ... existing JSX ...
    
    {/* Inside your booking card */}
    <div className="booking-card">
      {/* ... existing booking details ... */}
      
      {/* Booking Status and Payment Section */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-400">
            Status
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            booking.status === "completed"
              ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
              : booking.status === "confirmed"
              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
              : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200"
          }`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        {/* Show payment button if booking is confirmed and not paid */}
        {booking.status === "confirmed" && !booking.paymentId && (
          <button
            onClick={() => navigate(`/payment/${booking._id}`)}
            className="w-full mt-4 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CreditCard size={20} />
            Pay with Khalti
          </button>
        )}

        {/* Show payment status if already paid */}
        {booking.paymentId && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Payment Completed
            </p>
          </div>
        )}

        {/* Show action buttons based on status */}
        {booking.status === "pending" && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            Waiting for owner approval...
          </p>
        )}

        {booking.status === "cancellation_requested" && (
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 text-center">
            Cancellation pending...
          </p>
        )}
      </div>
    </div>
  );
}
```

## Example 2: Booking Status Flow

Here's how the booking and payment workflow works:

```
BOOKING FLOW:
=============

User creates booking
    ↓
Owner approves
    ↓
Booking status: "confirmed"
    ↓
"Pay with Khalti" button appears
    ↓
User clicks payment button
    ↓
Redirects to /payment/:bookingId
    ↓
User initiates payment
    ↓
Redirected to Khalti payment portal
    ↓
User completes payment
    ↓
Khalti redirects back
    ↓
Backend verifies payment
    ↓
Booking confirmed + Payment completed
```

## Example 3: Complete Booking Card Component

```javascript
import React from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, MapPin, Calendar, Car, X, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

function BookingCard({ booking, onStatusChange }) {
  const navigate = useNavigate();
  const [cancelling, setCancelling] = React.useState(false);

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/bookings/${booking._id}/request-cancellation`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Cancellation requested");
      onStatusChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancellation failed");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header with Status Badge */}
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 p-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {booking.vehicle?.make} {booking.vehicle?.model}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {booking.vehicle?.year}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
          booking.status === "completed"
            ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
            : booking.status === "confirmed"
            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
            : booking.status === "pending"
            ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200"
            : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200"
        }`}>
          {booking.status.toUpperCase()}
        </span>
      </div>

      {/* Booking Details */}
      <div className="p-6 space-y-4">
        {/* Dates */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar size={16} className="text-blue-600" />
            <span>
              {new Date(booking.startDate).toLocaleDateString()} to{" "}
              {new Date(booking.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin size={16} className="text-blue-600" />
          <span>{booking.vehicle?.location}</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Rs {booking.vehicle?.dailyRate * ((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))}
          </span>
        </div>

        {/* Payment Status */}
        {booking.paymentId && (
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <CheckCircle size={16} />
            Payment Completed
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          {booking.status === "confirmed" && !booking.paymentId && (
            <button
              onClick={() => navigate(`/payment/${booking._id}`)}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Pay Now
            </button>
          )}

          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="flex-1 border-2 border-red-600 text-red-600 dark:text-red-400 py-2 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          )}
        </div>

        {/* Info Messages */}
        {booking.status === "pending" && (
          <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 text-center">
            Waiting for owner approval...
          </p>
        )}

        {booking.cancellationReason && (
          <div className="text-xs bg-gray-50 dark:bg-gray-700 p-3 rounded text-gray-700 dark:text-gray-300">
            <strong>Cancellation reason:</strong> {booking.cancellationReason}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingCard;
```

## Example 4: Payment Flow in MyBookings

```javascript
// /client/src/pages/MyBookings.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import BookingCard from "../components/BookingCard";

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/bookings/my",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setBookings(res.data.data || res.data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = () => {
    if (filter === "all") return bookings;
    return bookings.filter(b => b.status === filter);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Bookings</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "pending", "confirmed", "completed", "cancelled"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings().length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No {filter !== "all" ? filter : ""} bookings found.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings().map(booking => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onStatusChange={fetchBookings}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
```

## Key Integration Points

1. **After booking confirmation** - Show payment button
2. **In payment page** - Handle payment flow
3. **After payment** - Update booking status
4. **In user dashboard** - Show payment history

## Environment Setup Reminder

Make sure these are set in your `.env` files:

**Backend (.env in /server):**
```
KHALTI_SECRET_KEY=your_sandbox_key
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env in /client):**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_KHALTI_MODE=sandbox
```

Then restart both servers!
