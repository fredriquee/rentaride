import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CreditCard, CheckCircle, AlertCircle, Loader, Home, Download } from "lucide-react";
import paymentService from "../services/paymentService";
import { useAuth } from "../context/AuthContext";

function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    pidx: null,
    payment_url: null,
    amount: 0
  });

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Get payment info via booking
        const paymentData = await paymentService.getPaymentByBooking(bookingId);
        setPayment(paymentData.payment);
        setLoading(false);
      } catch (err) {
        // Payment might not exist yet, that's ok
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [bookingId]);

  const handleInitiatePayment = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      const response = await paymentService.initiatePayment(bookingId);
      
      if (response.success) {
        setPaymentDetails({
          pidx: response.pidx,
          payment_url: response.payment_url,
          amount: response.payment.amount
        });
        
        toast.success("Payment initiated successfully!");
        
        // Redirect to Khalti payment portal
        setTimeout(() => {
          window.location.href = response.payment_url;
        }, 1500);
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      setError(err.message || "Failed to initiate payment");
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentDetails.pidx) {
      setError("Missing payment ID. Please initiate payment again.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await paymentService.verifyPayment(paymentDetails.pidx, bookingId);
      
      if (response.payment.status === "completed") {
        setPayment(response.payment);
        toast.success("Payment verified successfully!");
      } else if (response.payment.status === "pending") {
        setError("Payment is pending. Please wait for confirmation.");
        toast.loading("Verifying payment...");
      } else {
        setError(`Payment ${response.payment.status}. Please try again.`);
        toast.error(`Payment ${response.payment.status}`);
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      setError(err.message || "Failed to verify payment");
      toast.error(err.message || "Failed to verify payment");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!payment?._id) return;

    if (!window.confirm("Are you sure you want to cancel this payment?")) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await paymentService.cancelPayment(payment._id);
      setPayment(null);
      setPaymentDetails({ pidx: null, payment_url: null, amount: 0 });
      toast.success("Payment cancelled successfully");
    } catch (err) {
      console.error("Cancel payment error:", err);
      setError(err.message || "Failed to cancel payment");
      toast.error(err.message || "Failed to cancel payment");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin">
            <Loader size={48} className="text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border dark:border-gray-700 border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard size={32} />
            <h1 className="text-3xl font-bold">Payment</h1>
          </div>
          <p className="text-blue-100">Complete your booking payment securely with Khalti</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          {/* Payment Status */}
          {payment && (
            <div className={`p-6 rounded-2xl border-2 ${
              payment.status === "completed"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : payment.status === "pending"
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}>
              <div className="flex items-start gap-3">
                {payment.status === "completed" && (
                  <>
                    <CheckCircle className="text-green-600 dark:text-green-400 mt-1 shrink-0" size={24} />
                    <div>
                      <h3 className="font-bold text-green-900 dark:text-green-200">Payment Successful</h3>
                      <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                        Your payment has been processed successfully.
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-300 mt-2">
                        Transaction ID: <span className="font-mono bg-green-100 dark:bg-green-900 px-2 py-1 rounded">{payment.transaction_id}</span>
                      </p>
                    </div>
                  </>
                )}
                {payment.status === "pending" && (
                  <>
                    <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-1 shrink-0" size={24} />
                    <div>
                      <h3 className="font-bold text-yellow-900 dark:text-yellow-200">Payment Pending</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                        Your payment is being processed. Please wait for confirmation.
                      </p>
                    </div>
                  </>
                )}
                {payment.status !== "completed" && payment.status !== "pending" && (
                  <>
                    <AlertCircle className="text-red-600 dark:text-red-400 mt-1 shrink-0" size={24} />
                    <div>
                      <h3 className="font-bold text-red-900 dark:text-red-200">Payment {payment.status}</h3>
                      <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                        Please try again or contact support.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Payment Amount */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Amount to Pay
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {paymentDetails.amount ? `Rs ${paymentDetails.amount}` : "Loading..."}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {paymentDetails.amount ? `${paymentDetails.amount * 100} paisa` : ""}
            </p>
          </div>

          {/* Khalti Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
              <CreditCard size={20} />
              About Khalti Payment
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li>✓ Secure payment gateway</li>
              <li>✓ Multiple payment methods (Khalti ID, Bank, Merchants)</li>
              <li>✓ Instant payment confirmation</li>
              <li>✓ Safe and encrypted transactions</li>
            </ul>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {payment?.status === "completed" ? (
              <>
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Home size={20} />
                  Back to Bookings
                </button>
                <button
                  onClick={() => {
                    // Generate simple receipt
                    const receipt = `
Payment Receipt
================
Booking ID: ${bookingId}
Transaction ID: ${payment.transaction_id}
Amount: Rs ${paymentDetails.amount}
Status: ${payment.status}
Date: ${new Date().toLocaleString()}
                    `;
                    // In a real app, you'd generate a PDF
                    const element = document.createElement("a");
                    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(receipt));
                    element.setAttribute("download", `receipt_${payment.transaction_id}.txt`);
                    element.style.display = "none";
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="flex-1 border-2 border-blue-600 text-blue-600 dark:text-blue-400 py-4 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-gray-700 transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Receipt
                </button>
              </>
            ) : payment?.status === "pending" ? (
              <>
                <button
                  onClick={handleVerifyPayment}
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <Loader size={20} className="animate-spin" />
                  ) : (
                    "Verify Payment"
                  )}
                </button>
                <button
                  onClick={handleCancelPayment}
                  disabled={processing}
                  className="flex-1 border-2 border-red-600 text-red-600 dark:text-red-400 py-4 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-gray-700 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleInitiatePayment}
                disabled={processing}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Pay with Khalti
                  </>
                )}
              </button>
            )}
          </div>

          {/* Sandbox Notice */}
          <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl text-sm text-orange-800 dark:text-orange-300">
            <strong>Test Mode:</strong> You're in sandbox mode. Use test credentials to complete payment. 
            <a href="https://docs.khalti.com/khalti-epayment/" target="_blank" rel="noopener noreferrer" className="underline ml-1">
              Learn more
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
