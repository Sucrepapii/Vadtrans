import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { FaArrowRight, FaFileAlt } from "react-icons/fa";

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleNext = () => {
    if (!isAuthenticated) {
      navigate("/signup?role=company&redirect=/company/profile");
    } else {
      navigate("/company/profile");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-3xl">
          <h1 className="text-2xl font-raleway font-bold text-charcoal mb-2">
            Document Upload
          </h1>
          <p className="text-neutral-600 mb-8">
            Complete your verification by uploading required documents
          </p>

          <Card className="mb-6 text-center py-12">
            <FaFileAlt className="text-6xl text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Upload from your Dashboard
            </h2>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              We've updated our document verification process. You can now upload all your required driver, vehicle, and company documents directly from your profile dashboard.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto mb-8 text-left">
              <h4 className="font-semibold text-blue-900 mb-2">
                Required Documents include:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 columns-2">
                <li>• CAC Certificate</li>
                <li>• TIN</li>
                <li>• Driver's License</li>
                <li>• National ID / NIN</li>
                <li>• Vehicle License</li>
                <li>• Road Worthiness</li>
                <li>• Vehicle Photos</li>
                <li>• Guarantor Info</li>
              </ul>
            </div>

            <Button variant="primary" onClick={handleNext} className="w-full max-w-xs mx-auto">
              <div className="flex items-center justify-center gap-2">
                <span>Go to Profile</span>
                <FaArrowRight />
              </div>
            </Button>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocumentUpload;

