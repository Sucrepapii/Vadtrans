import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Card from "../../components/Card";
import {
  FaCheckCircle,
  FaUpload,
  FaFileAlt,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";

const DocumentUpload = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessRegistration: null,
    vehiclePermits: null,
    insurance: null,
    taxId: "",
  });

  const steps = [
    {
      number: 1,
      title: "Business Registration",
      description: "Upload your business registration certificate",
    },
    {
      number: 2,
      title: "Vehicle Permits",
      description: "Upload vehicle permits and licenses",
    },
    {
      number: 3,
      title: "Insurance",
      description: "Upload insurance certificates",
    },
    {
      number: 4,
      title: "Tax Information",
      description: "Provide tax identification number",
    },
  ];

  const handleFileChange = (field, file) => {
    setFormData({ ...formData, [field]: file });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit all documents
      navigate("/company/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                id="businessReg"
                className="hidden"
                onChange={(e) =>
                  handleFileChange("businessRegistration", e.target.files[0])
                }
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label htmlFor="businessReg" className="cursor-pointer">
                <FaUpload className="text-4xl text-neutral-400 mx-auto mb-3" />
                <p className="font-semibold mb-1">
                  {formData.businessRegistration
                    ? formData.businessRegistration.name
                    : "Click to upload"}
                </p>
                <p className="text-sm text-neutral-600">
                  PDF, JPG, or PNG (max 5MB)
                </p>
              </label>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Required Documents:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Certificate of Incorporation</li>
                <li>• Business License</li>
                <li>• Company Registration Number</li>
              </ul>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                id="vehiclePermits"
                className="hidden"
                onChange={(e) =>
                  handleFileChange("vehiclePermits", e.target.files[0])
                }
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label htmlFor="vehiclePermits" className="cursor-pointer">
                <FaUpload className="text-4xl text-neutral-400 mx-auto mb-3" />
                <p className="font-semibold mb-1">
                  {formData.vehiclePermits
                    ? formData.vehiclePermits.name
                    : "Click to upload"}
                </p>
                <p className="text-sm text-neutral-600">
                  PDF, JPG, or PNG (max 5MB)
                </p>
              </label>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Required Documents:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Vehicle Registration Documents</li>
                <li>• Operating Permits</li>
                <li>• Safety Inspection Certificates</li>
              </ul>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                id="insurance"
                className="hidden"
                onChange={(e) =>
                  handleFileChange("insurance", e.target.files[0])
                }
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label htmlFor="insurance" className="cursor-pointer">
                <FaUpload className="text-4xl text-neutral-400 mx-auto mb-3" />
                <p className="font-semibold mb-1">
                  {formData.insurance
                    ? formData.insurance.name
                    : "Click to upload"}
                </p>
                <p className="text-sm text-neutral-600">
                  PDF, JPG, or PNG (max 5MB)
                </p>
              </label>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Required Documents:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Comprehensive Vehicle Insurance</li>
                <li>• Passenger Liability Insurance</li>
                <li>• Third-Party Insurance</li>
              </ul>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <Input
              label="Tax Identification Number"
              name="taxId"
              placeholder="Enter your TIN"
              value={formData.taxId}
              onChange={(e) =>
                setFormData({ ...formData, taxId: e.target.value })
              }
              icon={FaFileAlt}
              required
            />
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">
                Almost Done!
              </h4>
              <p className="text-sm text-green-800">
                Once you submit, our team will review your documents within
                24-48 hours. You'll receive an email notification once your
                company is verified.
              </p>
            </div>
          </div>
        );
      default:
        return null;
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
            Complete all steps to verify your company
          </p>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 ${
                        step.number < currentStep
                          ? "bg-green-600 text-white"
                          : step.number === currentStep
                          ? "bg-primary text-white"
                          : "bg-neutral-200 text-neutral-600"
                      }`}>
                      {step.number < currentStep ? (
                        <FaCheckCircle />
                      ) : (
                        step.number
                      )}
                    </div>
                    <p className="text-xs text-center font-medium hidden md:block">
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step.number < currentStep
                          ? "bg-green-600"
                          : "bg-neutral-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-neutral-600 mb-6">
              {steps[currentStep - 1].description}
            </p>
            {renderStepContent()}
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <Button
                variant="secondary"
                onClick={handleBack}
                className="flex-1">
                <div className="flex items-center justify-center gap-2">
                  <FaArrowLeft />
                  <span>Back</span>
                </div>
              </Button>
            )}
            <Button variant="primary" onClick={handleNext} className="flex-1">
              <div className="flex items-center justify-center gap-2">
                <span>{currentStep === 4 ? "Submit" : "Next"}</span>
                {currentStep < 4 && <FaArrowRight />}
              </div>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocumentUpload;
