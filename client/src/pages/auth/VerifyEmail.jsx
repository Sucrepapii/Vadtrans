import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verify = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus("success");
        setMessage("Email verified successfully! You can now login.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed or token expired"
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          {status === "verifying" && (
            <div className="flex flex-col items-center">
              <FaSpinner className="text-4xl text-primary animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-charcoal mb-2">
                Verifying Email...
              </h2>
              <p className="text-neutral-600">Please wait a moment.</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <FaCheckCircle className="text-5xl text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-charcoal mb-2">
                Verified!
              </h2>
              <p className="text-neutral-600 mb-6">{message}</p>
              <Link
                to="/auth"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                Go to Login
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <FaTimesCircle className="text-5xl text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-charcoal mb-2">Failed</h2>
              <p className="text-neutral-600 mb-6">{message}</p>
              <Link
                to="/"
                className="text-primary hover:underline transition-colors">
                Return to Home
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
