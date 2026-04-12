import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MyBookings from "./pages/MyBookings";
import VehicleList from "./pages/VehicleList";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out");
    window.location.reload(); // refresh UI
  };

  return (
    <Router>
      <div style={{ textAlign: "center" }}>
        <h1>RentaRide</h1>

        {/* NAVBAR */}
        <div style={{ marginBottom: "20px" }}>
          <Link to="/">Home</Link> |{" "}
          <Link to="/my-bookings">My Bookings</Link> |{" "}

          {!token ? (
            <>
              <Link to="/login">Login</Link> |{" "}
              <Link to="/register">Register</Link>
            </>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}
        </div>

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<VehicleList />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;