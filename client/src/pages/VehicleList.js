import { useEffect, useState } from "react";
import axios from "axios";

function VehicleList() {
  const [vehicles, setVehicles] = useState([]);

  // 🔹 Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/vehicles");
        setVehicles(res.data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  // 🔹 Booking function (FIXED)
  const handleBooking = async (vehicleId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/bookings",
        {
          vehicle: vehicleId,
          startDate: new Date(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Booking successful!");

    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Available Vehicles</h2>

      {vehicles.map((v) => (
        <div
          key={v._id}
          style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px"
          }}
        >
          <h3>{v.title}</h3>
          <p>Type: {v.type}</p>
          <p>Price: Rs {v.pricePerDay}</p>
          <p>Location: {v.location}</p>

          <button onClick={() => handleBooking(v._id)}>
            Book Now
          </button>
        </div>
      ))}
    </div>
  );
}

export default VehicleList;