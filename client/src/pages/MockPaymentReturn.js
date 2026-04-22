import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

/**
 * MockPaymentReturn - Simulates Khalti payment callback for local testing
 * This page is reached when using LOCAL_PAYMENT_MOCK mode
 */
const MockPaymentReturn = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const verifyMockPayment = async () => {
      try {
        // Get the payment details from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const pidx = urlParams.get("pidx") || localStorage.getItem("mockPaymentPidx");

        if (!pidx) {
          setError("No payment ID found. Please initiate payment again.");
          setLoading(false);
          return;
        }

        console.log("🎭 Mock Payment Return - Verifying payment:", pidx);

        // Call the payment verification endpoint
        const response = await API.post(
          "/api/payments/verify",
          { pidx, bookingId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        setPaymentData(response.data);

        // Automatically redirect to success page after 2 seconds
        setTimeout(() => {
          navigate(`/bookings/${bookingId}`, {
            state: {
              paymentSuccess: true,
              message: "Payment verified successfully!"
            }
          });
        }, 2000);
      } catch (err) {
        console.error("❌ Mock Payment Verification Error:", err);
        setError(err.response?.data?.message || "Payment verification failed");
        setLoading(false);
      }
    };

    verifyMockPayment();
  }, [bookingId, navigate]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.spinner}></div>
          <h2>🎭 Mock Payment Processing...</h2>
          <p>Verifying your payment locally (mock mode)</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>❌ Payment Failed</h2>
          <p>{error}</p>
          <button
            style={styles.button}
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (paymentData) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>✅ Payment Verified!</h2>
          <p>Your payment has been processed successfully.</p>
          <p style={styles.small}>Redirecting to booking details...</p>
        </div>
      </div>
    );
  }

  return null;
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5"
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "400px"
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px"
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "20px"
  },
  small: {
    fontSize: "12px",
    color: "#999",
    marginTop: "10px"
  }
};

export default MockPaymentReturn;
