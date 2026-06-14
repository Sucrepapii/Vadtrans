import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ConfirmationModal from "../../components/ConfirmationModal";
import {
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaFileAlt,
  FaSpinner,
  FaFilter,
  FaEdit,
  FaCheck,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { adminAPI } from "../../services/api";
import { toast } from "react-toastify";

const CompanyManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = API_URL.replace("/api", ""); // Get base URL for static files

  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, verified, rejected
  const [viewingDocuments, setViewingDocuments] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    companyId: null,
    companyName: "",
  });
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [newEmailValue, setNewEmailValue] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [verificationComment, setVerificationComment] = useState("");
  const [promptingDocs, setPromptingDocs] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [filter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") {
        params.verificationStatus = filter;
      }
      const response = await adminAPI.getCompanies(params);
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (companyId) => {
    if (!newEmailValue.trim()) return;
    try {
      setIsSavingEmail(true);
      const response = await adminAPI.updateUser(companyId, {
        email: newEmailValue,
      });
      if (response.data.success) {
        toast.success("Email updated successfully");
        setCompanies(
          companies.map((c) =>
            c.id === companyId ? { ...c, email: newEmailValue } : c,
          ),
        );
        setEditingEmailId(null);
      }
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error(error.response?.data?.message || "Failed to update email");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleApprove = async (companyId, comment) => {
    try {
      setProcessingId(companyId);
      const response = await adminAPI.approveCompany(companyId, comment);
      if (response.data.success) {
        toast.success("Company approved successfully!");
        setConfirmModal({
          isOpen: false,
          type: null,
          companyId: null,
          companyName: "",
        });
        setVerificationComment("");
        fetchCompanies();
      }
    } catch (error) {
      console.error("Error approving company:", error);
      toast.error(error.response?.data?.message || "Failed to approve company");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (companyId, comment) => {
    try {
      setProcessingId(companyId);
      const response = await adminAPI.rejectCompany(companyId, comment);
      if (response.data.success) {
        toast.success("Company rejected successfully!");
        setConfirmModal({
          isOpen: false,
          type: null,
          companyId: null,
          companyName: "",
        });
        setVerificationComment("");
        fetchCompanies();
      }
    } catch (error) {
      console.error("Error rejecting company:", error);
      toast.error(error.response?.data?.message || "Failed to reject company");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      setProcessingId(companyId);
      const response = await adminAPI.deleteUser(companyId);
      if (response.data.success) {
        toast.success(response.data.message || "Company deleted successfully");
        setConfirmModal({
          isOpen: false,
          type: null,
          companyId: null,
          companyName: "",
        });
        setCompanies(companies.filter((c) => c.id !== companyId));
      }
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error(error.response?.data?.message || "Failed to delete company");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePromptMissingDocs = async () => {
    try {
      setPromptingDocs(true);
      const response = await adminAPI.promptDocs();
      if (response.data.success) {
        toast.success(response.data.message || "Prompt emails sent successfully!");
      }
    } catch (error) {
      console.error("Error prompting drivers:", error);
      toast.error(error.response?.data?.message || "Failed to prompt drivers");
    } finally {
      setPromptingDocs(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: FaSpinner,
        label: "Pending",
      },
      verified: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: FaCheckCircle,
        label: "Verified",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: FaTimesCircle,
        label: "Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className={status === "pending" ? "animate-spin" : ""} />
        {config.label}
      </span>
    );
  };

  const filterButtons = [
    { value: "all", label: "All Companies" },
    { value: "pending", label: "Pending" },
    { value: "verified", label: "Verified" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-raleway font-bold text-charcoal">
              Company Management
            </h1>
            <p className="text-neutral-600 mt-1">
              Review and approve transport company registrations
            </p>
          </div>
          <Button
            onClick={handlePromptMissingDocs}
            disabled={promptingDocs}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold whitespace-nowrap">
            <div className="flex items-center gap-2">
              {promptingDocs ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaEnvelope />
              )}
              <span>Prompt Missing Documents</span>
            </div>
          </Button>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Filters */}
          <Card className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <FaFilter className="text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700 mr-2">
                Filter:
              </span>
              {filterButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === btn.value
                      ? "bg-primary text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}>
                  {btn.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Companies List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-4xl text-primary" />
            </div>
          ) : companies.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <FaBuilding className="text-6xl text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">No companies found</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6">
              {companies.map((company) => (
                <Card
                  key={company.id}
                  className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Company Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-charcoal flex items-center gap-2">
                            <FaBuilding className="text-primary" />
                            {company.name}
                          </h3>
                          <p className="text-sm text-neutral-600 mt-1">
                            Registered on{" "}
                            {new Date(company.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(company.verificationStatus)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm h-8">
                          <FaEnvelope className="text-neutral-500" />
                          {editingEmailId === company.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="email"
                                value={newEmailValue}
                                onChange={(e) =>
                                  setNewEmailValue(e.target.value)
                                }
                                className="border border-neutral-300 rounded px-2 py-1 text-sm w-48 focus:outline-none focus:border-primary"
                                disabled={isSavingEmail}
                                autoFocus
                              />
                              <button
                                onClick={() => handleEmailUpdate(company.id)}
                                disabled={isSavingEmail}
                                className="text-green-600 hover:text-green-700 p-1"
                                title="Save">
                                {isSavingEmail ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaCheck />
                                )}
                              </button>
                              <button
                                onClick={() => setEditingEmailId(null)}
                                disabled={isSavingEmail}
                                className="text-red-600 hover:text-red-700 p-1"
                                title="Cancel">
                                <FaTimes />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <span className="text-neutral-700">
                                {company.email}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingEmailId(company.id);
                                  setNewEmailValue(company.email);
                                }}
                                className="text-neutral-400 hover:text-primary transition-colors"
                                title="Edit Email">
                                <FaEdit />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FaPhone className="text-neutral-500" />
                          <span className="text-neutral-700">
                            {company.phone || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FaMapMarkerAlt className="text-neutral-500" />
                          <span className="text-neutral-700">
                            {company.address || "No address provided"}
                          </span>
                        </div>
                        {company.businessRegNo && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaFileAlt className="text-neutral-500" />
                            <span className="text-neutral-700">
                              Reg: {company.businessRegNo}
                            </span>
                          </div>
                        )}
                        {company.bankDetails && (
                          <div className="col-span-full mt-2 pt-2 border-t border-neutral-100">
                            <p className="text-sm font-semibold text-neutral-800 mb-1">
                              Bank Information
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="text-sm">
                                <span className="text-neutral-500">Bank: </span>
                                <span className="text-neutral-700">
                                  {company.bankDetails.bankName || "N/A"}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-neutral-500">
                                  Account No:{" "}
                                </span>
                                <span className="text-neutral-700">
                                  {company.bankDetails.accountNumber || "N/A"}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-neutral-500">
                                  Account Name:{" "}
                                </span>
                                <span className="text-neutral-700">
                                  {company.bankDetails.accountName || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {company.description && (
                        <div className="pt-3 border-t border-neutral-200">
                          <p className="text-sm text-neutral-700">
                            {company.description}
                          </p>
                        </div>
                      )}

                      {company.verificationComment && (
                        <div className={`mt-3 p-3 rounded-lg border text-sm ${
                          company.verificationStatus === 'rejected' 
                            ? 'bg-red-50 border-red-100 text-red-700' 
                            : 'bg-green-50 border-green-100 text-green-700'
                        }`}>
                          <p className="font-semibold mb-1">Admin Comment:</p>
                          <p>{company.verificationComment}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:min-w-[200px]">
                      {company.documents && company.documents.length > 0 && (
                        <Button
                          variant="secondary"
                          onClick={() => setViewingDocuments(company)}
                          className="w-full">
                          <div className="flex items-center justify-center gap-2">
                            <FaEye />
                            <span>
                              View Documents ({company.documents.length})
                            </span>
                          </div>
                        </Button>
                      )}

                      {company.verificationStatus === "pending" && (
                        <>
                          <Button
                            variant="primary"
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                type: "approve",
                                companyId: company.id,
                                companyName: company.name,
                              })
                            }
                            disabled={processingId === company.id}
                            className="w-full">
                            <div className="flex items-center justify-center gap-2">
                              {processingId === company.id ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaCheckCircle />
                              )}
                              <span>Approve</span>
                            </div>
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                type: "reject",
                                companyId: company.id,
                                companyName: company.name,
                              })
                            }
                            disabled={processingId === company.id}
                            className="w-full text-red-600 hover:bg-red-50">
                            <div className="flex items-center justify-center gap-2">
                              {processingId === company.id ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaTimesCircle />
                              )}
                              <span>Reject</span>
                            </div>
                          </Button>
                        </>
                      )}

                      <Button
                        variant="secondary"
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            type: "delete",
                            companyId: company.id,
                            companyName: company.name,
                          })
                        }
                        disabled={processingId === company.id}
                        className="w-full text-red-600 hover:bg-neutral-100 border-red-200">
                        <div className="flex items-center justify-center gap-2">
                          {processingId === company.id && confirmModal.type === "delete" ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaTrash />
                          )}
                          <span>Delete Company</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Documents Modal */}
      {viewingDocuments && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingDocuments(null)}>
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Documents - {viewingDocuments.name}
              </h3>
              <button
                onClick={() => setViewingDocuments(null)}
                className="text-neutral-500 hover:text-charcoal">
                <FaTimesCircle className="text-2xl" />
              </button>
            </div>

            {viewingDocuments.documents &&
            viewingDocuments.documents.length > 0 ? (
              <div className="space-y-3">
                {viewingDocuments.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="border border-neutral-200 rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="text-primary text-2xl" />
                        <div>
                          <p className="font-medium">{doc.name || doc.type}</p>
                          <p className="text-sm text-neutral-600">
                            {doc.type} •{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`${BASE_URL}${doc.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark font-medium text-sm">
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-600 py-8">
                No documents uploaded
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          setConfirmModal({
            isOpen: false,
            type: null,
            companyId: null,
            companyName: "",
          });
          setVerificationComment("");
        }}
        onConfirm={() => {
          if (confirmModal.type === "approve") {
            handleApprove(confirmModal.companyId, verificationComment);
          } else if (confirmModal.type === "reject") {
            handleReject(confirmModal.companyId, verificationComment);
          } else if (confirmModal.type === "delete") {
            handleDeleteCompany(confirmModal.companyId);
          }
        }}
        title={
          confirmModal.type === "approve"
            ? "Approve Company"
            : confirmModal.type === "reject"
            ? "Reject Company"
            : "Delete Company"
        }
        message={
          confirmModal.type === "approve"
            ? `Are you sure you want to approve "${confirmModal.companyName}"? This will allow them to list trips and accept bookings.`
            : confirmModal.type === "reject"
            ? `Are you sure you want to reject "${confirmModal.companyName}"? They will need to resubmit their application.`
            : `Are you sure you want to PERMANENTLY delete "${confirmModal.companyName}"? This will delete all their trips, bookings, and associated records. This action cannot be undone.`
        }
        confirmText={
          confirmModal.type === "approve"
            ? "Approve"
            : confirmModal.type === "reject"
            ? "Reject"
            : "Delete Permanently"
        }
        cancelText="Cancel"
        type={confirmModal.type === "approve" ? "success" : "danger"}
        isProcessing={processingId === confirmModal.companyId}
      >
        {(confirmModal.type === "approve" || confirmModal.type === "reject") && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              {confirmModal.type === "approve"
                ? "Approval Message (Optional)"
                : "Reason for Rejection"}
            </label>
            <textarea
              value={verificationComment}
              onChange={(e) => setVerificationComment(e.target.value)}
              placeholder={
                confirmModal.type === "approve"
                  ? "Add a welcoming message or instructions..."
                  : "Please explain why the application was rejected..."
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm min-h-[100px]"
              required={confirmModal.type === "reject"}
            />
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default CompanyManagement;
