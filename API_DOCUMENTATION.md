# RentaRide API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication Endpoints

#### Register User
- **Method:** `POST`
- **Route:** `/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "string (required, max 100)",
    "email": "string (required, valid email)",
    "password": "string (required, min 6)",
    "role": "string (optional: 'user' or 'owner', default: 'user')"
  }
  ```
- **Response (201):**
  ```json
  {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "token": "string"
  }
  ```

#### Login User
- **Method:** `POST`
- **Route:** `/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "string (required)",
    "password": "string (required)"
  }
  ```
- **Response (200):**
  ```json
  {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "token": "string"
  }
  ```

---

### Vehicle Endpoints

#### Get All Vehicles
- **Method:** `GET`
- **Route:** `/vehicles`
- **Access:** Public
- **Response (200):**
  ```json
  [
    {
      "_id": "string",
      "name": "string",
      "model": "string",
      "pricePerDay": "number",
      "available": "boolean",
      "owner": "string (user ID)",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
  ]
  ```

#### Add Vehicle
- **Method:** `POST`
- **Route:** `/vehicles`
- **Access:** Private (Owner only)
- **Request Body:**
  ```json
  {
    "name": "string (required, max 100)",
    "model": "string (required)",
    "pricePerDay": "number (required, positive)",
    "available": "boolean (optional, default: true)"
  }
  ```
- **Response (201):**
  ```json
  {
    "_id": "string",
    "name": "string",
    "model": "string",
    "pricePerDay": "number",
    "available": "boolean",
    "owner": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

#### Delete Vehicle
- **Method:** `DELETE`
- **Route:** `/vehicles/:id`
- **Access:** Private (Owner only)
- **Response (200):**
  ```json
  {
    "message": "Vehicle deleted successfully"
  }
  ```

---

### Booking Endpoints

#### Create Booking
- **Method:** `POST`
- **Route:** `/bookings`
- **Access:** Private
- **Request Body:**
  ```json
  {
    "vehicleId": "string (valid MongoDB ID)",
    "startDate": "string (ISO 8601 format)",
    "endDate": "string (ISO 8601 format)"
  }
  ```
- **Response (201):**
  ```json
  {
    "_id": "string",
    "user": "string (user ID)",
    "vehicle": "string (vehicle ID)",
    "startDate": "string",
    "endDate": "string",
    "status": "pending",
    "totalPrice": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

#### Get User Bookings
- **Method:** `GET`
- **Route:** `/bookings/my`
- **Access:** Private
- **Response (200):**
  ```json
  [
    {
      "_id": "string",
      "user": "object (user details)",
      "vehicle": "object (vehicle details)",
      "startDate": "string",
      "endDate": "string",
      "status": "string",
      "totalPrice": "number",
      "createdAt": "string"
    }
  ]
  ```

#### Get Owner Bookings
- **Method:** `GET`
- **Route:** `/bookings/owner`
- **Access:** Private (Owner only)
- **Response (200):** Array of bookings for owner's vehicles

#### Get Owner Notifications
- **Method:** `GET`
- **Route:** `/bookings/owner/notifications`
- **Access:** Private (Owner only)
- **Response (200):**
  ```json
  {
    "count": "number"
  }
  ```

#### Update Booking Status
- **Method:** `PUT`
- **Route:** `/bookings/:id`
- **Access:** Private (Owner only)
- **Request Body:**
  ```json
  {
    "status": "string (approved or rejected)"
  }
  ```
- **Response (200):** Updated booking object

#### Request Cancellation
- **Method:** `PUT`
- **Route:** `/bookings/:id/request-cancellation`
- **Access:** Private
- **Response (200):** Updated booking object

---

### Admin Endpoints

#### Get All Users
- **Method:** `GET`
- **Route:** `/admin/users`
- **Access:** Private (Admin only)
- **Response (200):** Array of all users

#### Get Dashboard Stats
- **Method:** `GET`
- **Route:** `/admin/stats`
- **Access:** Private (Admin only)
- **Response (200):**
  ```json
  {
    "totalUsers": "number",
    "totalVehicles": "number",
    "totalBookings": "number",
    "totalRevenue": "number"
  }
  ```

---

## Error Responses

All errors follow this format:
```json
{
  "message": "Error description",
  "errors": ["Validation errors if applicable"]
}
```

### Common Status Codes
- **200:** Success
- **201:** Created
- **400:** Bad Request (validation errors)
- **401:** Unauthorized (invalid token)
- **403:** Forbidden (insufficient permissions)
- **404:** Not Found
- **429:** Too Many Requests (rate limited)
- **500:** Internal Server Error

---

## Rate Limiting

API requests are rate-limited to 100 requests per 15 minutes per IP address.

---

## Environment Variables

See `.env.example` for required environment variables.
