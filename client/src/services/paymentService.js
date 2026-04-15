import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const paymentService = {
  /**
   * Initiate a payment with Khalti for a booking
   * @param bookingId - The ID of the booking to pay for
   * @returns Promise with payment details including payment_url
   */
  initiatePayment: async (bookingId) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/initiate`,
        { bookingId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Payment initiation error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Verify payment status after user returns from Khalti
   * @param pidx - Payment ID from Khalti
   * @param bookingId - The booking ID
   * @returns Promise with payment verification details
   */
  verifyPayment: async (pidx, bookingId) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/verify`,
        { pidx, bookingId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Payment verification error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get payment details for a specific booking
   * @param bookingId - The booking ID
   * @returns Promise with payment details
   */
  getPaymentByBooking: async (bookingId) => {
    try {
      const response = await axios.get(
        `${API_URL}/payments/booking/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Get payment error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all payments for the current user
   * @param status - Optional filter by payment status (initiated, pending, completed, failed, cancelled, refunded)
   * @returns Promise with array of payment objects
   */
  getUserPayments: async (status = null) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };
      
      const url = status
        ? `${API_URL}/payments/my?status=${status}`
        : `${API_URL}/payments/my`;
      
      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      console.error("Get user payments error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cancel a pending payment
   * @param paymentId - The payment ID to cancel
   * @returns Promise with cancellation confirmation
   */
  cancelPayment: async (paymentId) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/${paymentId}/cancel`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Cancel payment error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get payment URL for redirecting user to Khalti
   * This is extracted from the initiate payment response
   * @param pidx - Payment ID from Khalti
   * @returns The Khalti payment URL
   */
  getPaymentURL: (pidx) => {
    const isSandbox = process.env.REACT_APP_KHALTI_MODE === "sandbox";
    const sandbox_url = `https://test-pay.khalti.com/?pidx=${pidx}`;
    const production_url = `https://pay.khalti.com/?pidx=${pidx}`;
    return isSandbox ? sandbox_url : production_url;
  }
};

export default paymentService;
