# RentaRide Database Schema

## Overview
RentaRide uses MongoDB with Mongoose. The database contains three main collections: Users, Vehicles, and Bookings.

---

## Collections

### 1. Users Collection

**Purpose:** Store user account information

**Schema:**
```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // Not returned by default
  },
  role: {
    type: String,
    enum: ["user", "owner", "admin"],
    default: "user"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:**
- `email` (unique)

**Roles:**
- `user`: Regular user who can browse and book vehicles
- `owner`: Can list vehicles and manage bookings
- `admin`: Super admin with access to all system data

---

### 2. Vehicles Collection

**Purpose:** Store vehicle listings

**Schema:**
```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  model: {
    type: String,
    required: true
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  available: {
    type: Boolean,
    default: true
  },
  owner: {
    type: ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:**
- `owner` (for querying owner's vehicles)
- `available` (for filtering available vehicles)

**Notes:**
- `available` is updated based on existing bookings
- Linked to User collection via `owner` field

---

### 3. Bookings Collection

**Purpose:** Store vehicle booking records

**Schema:**
```javascript
{
  _id: ObjectId,
  user: {
    type: ObjectId,
    ref: "User",
    required: true
  },
  vehicle: {
    type: ObjectId,
    ref: "Vehicle",
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancellation_requested", "cancelled"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:**
- `user` (for querying user's bookings)
- `vehicle` (for querying vehicle's bookings)
- `status` (for filtering by status)
- Compound index on `vehicle`, `startDate`, `endDate` (for overlap detection)

**Booking Statuses:**
- `pending`: Awaiting owner approval
- `approved`: Owner has approved the booking
- `rejected`: Owner has rejected the booking
- `cancellation_requested`: User requested cancellation
- `cancelled`: Booking has been cancelled

**Business Rules:**
- Total price is calculated as: `(endDate - startDate) * pricePerDay`
- A vehicle cannot have overlapping approved bookings
- Dates must be in ISO 8601 format

---

## Relationships

```
┌─────────────┐
│   Users     │
└─────────────┘
      ▲
      │ (1:N) owner
      │
┌─────────────┐
│  Vehicles   │
└─────────────┘
      ▲
      │ (1:N) vehicle
      │
┌─────────────┐
│  Bookings   │
└─────────────┘
      │
      │ (N:1) user
      ▼
┌─────────────┐
│   Users     │
└─────────────┘
```

---

## Example Queries

### Find all vehicles by owner
```javascript
Vehicles.find({ owner: userId })
```

### Find overlapping bookings for a vehicle
```javascript
Bookings.find({
  vehicle: vehicleId,
  status: "approved",
  startDate: { $lt: endDate },
  endDate: { $gt: startDate }
})
```

### Get pending bookings for owner
```javascript
Bookings.aggregate([
  { $match: { status: "pending" } },
  { $lookup: { from: "vehicles", localField: "vehicle", foreignField: "_id", as: "vehicleData" } },
  { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userData" } },
  { $match: { "vehicleData.owner": ownerId } }
])
```

---

## Data Integrity Notes

1. **Cascade Handling:** Deleting a user or vehicle may affect related bookings
2. **Date Validation:** Always validate that `endDate > startDate`
3. **Double Booking Prevention:** Check for overlapping bookings before approval
4. **Payment Calculation:** Total price must be recalculated on date changes
5. **Status Transitions:** Only certain status transitions should be allowed (e.g., pending → approved/rejected, not pending → cancelled directly)

---

## Performance Considerations

1. Create indexes on frequently queried fields
2. Use `.lean()` for read-only queries
3. Implement pagination for large result sets
4. Consider caching booking calendars

---

## Backup Strategy

Regularly backup MongoDB data:
```bash
mongodump --uri "mongodb+srv://user:password@cluster.mongodb.net/rentaride"
```

Restore from backup:
```bash
mongorestore --uri "mongodb+srv://user:password@cluster.mongodb.net/rentaride" dump/rentaride
```
