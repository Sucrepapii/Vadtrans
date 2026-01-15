import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  FaUser,
  FaTicketAlt,
  FaFileInvoice,
  FaUpload,
  FaCheckCircle,
  FaSpinner,
  FaTrash,
  FaFileAlt,
} from "react-icons/fa";

const DocumentsTab = ({ user, onRefresh }) => {
  const [uploading, setUploading] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState(
    user?.documents || []
  );

  const API_BASE =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

  const documentTypes = [
    {
      type: "business_registration",
      label: "Business Registration",
      description: "Certificate of Incorporation, Business License",
    },
    {
      type: "vehicle_permits",
      label: "Vehicle Permits",
      description: "Vehicle Registration, Operating Permits",
    },
    {
      type: "insurance",
      label: "Insurance Certificates",
      description: "Vehicle Insurance, Passenger Liability",
    },
    {
      type: "other",
      label: "Other Documents",
      description: "Additional supporting documents",
    },
  ];

  useEffect(() => {
    console.log("👤 User prop received:", user);
    console.log("📋 User.documents:", user?.documents);
    setUploadedDocuments(user?.documents || []);
  }, [user]);

  const handleFileUpload = async (file, documentType) => {
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    try {
      setUploading(documentType);
      const response = await authAPI.uploadDocument(file, documentType);

      if (response.data.success) {
        console.log("✅ Upload successful! Response:", response.data);
        toast.success("Document uploaded successfully!");

        // Manually update the local state with the new document
        const newDocument = response.data.document;
        console.log("📄 New document to add:", newDocument);

        setUploadedDocuments((prevDocs) => {
          console.log("📋 Previous documents:", prevDocs);
          const filtered = prevDocs.filter((doc) => doc.type !== documentType);
          const updated = [...filtered, newDocument];
          console.log("📋 Updated documents:", updated);
          return updated;
        });

        // Removed: onRefresh causes race condition - fetches stale data before DB update commits
        // The local state update above is sufficient for immediate UI update
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDocument = async (documentType) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await authAPI.deleteDocument(documentType);

      if (response.data.success) {
        toast.success("Document deleted successfully!");

        // Manually update the local state
        setUploadedDocuments((prevDocs) =>
          prevDocs.filter((doc) => doc.type !== documentType)
        );

        // Removed: onRefresh causes race condition
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete document");
    }
  };

  const getDocumentByType = (type) => {
    return uploadedDocuments?.find((doc) => doc.type === type);
  };

  console.log("🔄 Rendering. uploadedDocuments:", uploadedDocuments);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Company Documents</h2>
        <span className="text-xs text-neutral-600">
          Required for verification
        </span>
      </div>

      <div className="space-y-4">
        {documentTypes.map((docType) => {
          const existingDoc = getDocumentByType(docType.type);
          const isUploading = uploading === docType.type;

          return (
            <div
              key={docType.type}
              className="border border-neutral-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1">{docType.label}</h3>
                  <p className="text-xs text-neutral-600">
                    {docType.description}
                  </p>

                  {existingDoc && (
                    <div className="mt-2 flex items-center gap-2">
                      <FaCheckCircle className="text-green-600 text-sm" />
                      <span className="text-xs text-green-700">
                        {existingDoc.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        •{" "}
                        {new Date(existingDoc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {existingDoc ? (
                    <>
                      <input
                        type="file"
                        id={`update-${docType.type}`}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileUpload(e.target.files[0], docType.type)
                        }
                        disabled={isUploading}
                      />
                      <label
                        htmlFor={`update-${docType.type}`}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm border-2 ${
                          isUploading
                            ? "bg-neutral-100 text-neutral-600 border-neutral-300 cursor-not-allowed"
                            : "bg-white text-primary border-primary hover:bg-neutral-50 cursor-pointer"
                        }`}>
                        {isUploading ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <FaUpload />
                            <span>Update</span>
                          </>
                        )}
                      </label>
                      <button
                        onClick={() => handleDeleteDocument(docType.type)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm border-2 border-red-500 text-red-600 hover:bg-red-50">
                        <FaTrash />
                        <span>Delete</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="file"
                        id={`file-${docType.type}`}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileUpload(e.target.files[0], docType.type)
                        }
                        disabled={isUploading}
                      />
                      <label
                        htmlFor={`file-${docType.type}`}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                          isUploading
                            ? "bg-neutral-300 text-neutral-600 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary-dark active:scale-95 cursor-pointer"
                        }`}>
                        {isUploading ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <FaUpload />
                            <span>Upload</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> All documents must be in PDF, JPG, or PNG
          format (max 5MB). Documents are required for company verification by
          the admin team.
        </p>
      </div>
    </Card>
  );
};

export default DocumentsTab;
