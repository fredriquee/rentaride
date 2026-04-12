import { useEffect, useState } from "react";
import axios from "axios";

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/bookings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        setBookings(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking._id}
            style={{
              border: "1px solid gray",
              margin: "10px",
              padding: "10px"
            }}
          >
            {/* ✅ SAFE CHECK HERE */}
            {booking.vehicle ? (
              <>
                <h3>{booking.vehicle.title}</h3>
                <p>Type: {booking.vehicle.type}</p>
                <p>Price: Rs {booking.vehicle.pricePerDay}</p>
                <p>Location: {booking.vehicle.location}</p>
              </>
            ) : (
              <p style={{ color: "red" }}>
                Vehicle not available anymore
              </p>
            )}

            <p>Start: {new Date(booking.startDate).toDateString()}</p>
            <p>End: {new Date(booking.endDate).toDateString()}</p>
            <p>Status: {booking.status}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyBookings;