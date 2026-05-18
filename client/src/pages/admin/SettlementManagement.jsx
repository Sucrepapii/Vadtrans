import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { FaMoneyBillWave, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api"; // Ensure custom earnings routes are called via api

const SettlementManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settlingId, setSettlingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/earnings/companies");
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to load company earnings");
    } finally {
      setLoading(false);
    }
  };

  const handleSettleClick = (companyId, companyName, amount) => {
    if (amount <= 0) {
      toast.info("Balance is already zero.");
      return;
    }
    setSelectedCompany({ id: companyId, name: companyName, amount });
    setShowModal(true);
  };

  const confirmSettle = async () => {
    if (!selectedCompany) return;
    
    try {
      setShowModal(false);
      setSettlingId(selectedCompany.id);
      const response = await api.put(`/earnings/companies/${selectedCompany.id}/settle`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchEarnings(); // Refresh the list
      }
    } catch (error) {
      console.error("Error settling earnings:", error);
      toast.error(error.response?.data?.message || "Failed to settle earnings");
    } finally {
      setSettlingId(null);
      setSelectedCompany(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 z-40 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-raleway font-bold text-gray-900">
              Company Settlements
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Manage payouts and daily earnings for transport companies.
            </p>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          <Card className="p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-lg">
                Pending Payouts
              </h3>
              <Button onClick={fetchEarnings} variant="outline" size="sm">
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-3xl text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
                    <tr>
                      <th className="px-6 py-4">Company Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Pending Bookings</th>
                      <th className="px-6 py-4">Unpaid Balance</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {company.name}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {company.email}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {company.pendingBookingsCount}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            ₦{company.pendingBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {company.pendingBalance > 0 ? (
                              <Button
                                onClick={() => handleSettleClick(company.id, company.name, company.pendingBalance)}
                                disabled={settlingId === company.id}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 ml-auto"
                                size="sm"
                              >
                                {settlingId === company.id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaCheckCircle />
                                )}
                                Mark as Paid
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm font-semibold italic">Settled</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No transport companies found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Payout</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to mark <span className="font-bold text-green-600">₦{selectedCompany.amount.toLocaleString()}</span> as paid to <span className="font-bold text-gray-900">{selectedCompany.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedCompany(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSettle}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-6"
              >
                Yes, Mark as Paid
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettlementManagement;
