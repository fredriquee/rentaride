import API from "../api";

const API_URL = API.defaults.baseURL;

const paymentService = {
  /**
   * Initiate a payment with Khalti for a booking
   * @param bookingId - The ID of the booking to pay for
   * @returns Promise with payment details including payment_url
   */
  initiatePayment: async (bookingId) => {
    try {
      const response = await API.post(
        `/payments/initiate`,
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
      const response = await API.post(
        `/payments/verify`,
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
      const response = await API.get(
        `/payments/booking/${bookingId}`,
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
        ? `/payments/my?status=${status}`
        : `/payments/my`;
      
      const response = await API.get(url, config);
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
      const response = await API.post(
        `/payments/${paymentId}/cancel`,
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
  },

  // ========== eSewa Payment Methods ==========

  /**
   * Initiate a payment with eSewa for a booking
   * @param bookingId - The ID of the booking to pay for
   * @returns Promise with payment data and eSewa URL
   */
  initiateESewaPayment: async (bookingId) => {
    try {
      const response = await API.post(
        `/payments/esewa/initiate`,
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
      console.error("eSewa payment initiation error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Verify eSewa payment status
   * @param oid - Order ID (purchase_order_id)
   * @param refId - Reference ID (transaction_uuid) from eSewa
   * @returns Promise with payment verification details
   */
  verifyESewaPayment: async (oid, refId) => {
    try {
      const response = await API.post(
        `/payments/esewa/verify`,
        { oid, refId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("eSewa payment verification error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Build eSewa payment form
   * @param paymentData - Payment data from initiate response
   * @returns Form HTML string ready to submit
   */
  buildESewaForm: (paymentData) => {
    const { amt, psc, pdc, txAmt, tAmt, pid, scd, su, fu, signature } = paymentData;
    
    const form = `
      <form id="esewaForm" method="POST" action="https://uat.esewa.com.np/epay/main">
        <input type="hidden" id="amt" name="amt" value="${amt}">
        <input type="hidden" id="psc" name="psc" value="${psc}">
        <input type="hidden" id="pdc" name="pdc" value="${pdc}">
        <input type="hidden" id="txAmt" name="txAmt" value="${txAmt}">
        <input type="hidden" id="tAmt" name="tAmt" value="${tAmt}">
        <input type="hidden" id="pid" name="pid" value="${pid}">
        <input type="hidden" id="scd" name="scd" value="${scd}">
        <input type="hidden" id="su" name="su" value="${su}">
        <input type="hidden" id="fu" name="fu" value="${fu}">
        <input type="hidden" id="signature" name="signature" value="${signature}">
      </form>
    `;
    return form;
  }
};

export default paymentService;
