import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  FaSearch,
  FaUsers,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
} from "react-icons/fa";
import { adminAPI } from "../../services/api";
import { toast } from "react-toastify";

const ClientManagement = () => {
  const [activeTab, setActiveTab] = useState("companies");
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch companies
      const companiesResponse = await adminAPI.getAllUsers({ role: "company" });
      if (companiesResponse.data.success) {
        setCompanies(companiesResponse.data.data);
      }

      // Fetch travelers (customers)
      const customersResponse = await adminAPI.getAllUsers({
        role: "traveler",
      });
      if (customersResponse.data.success) {
        setCustomers(customersResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-neutral-200 px-8 py-6">
          <h1 className="text-3xl font-raleway font-bold text-charcoal">
            Client Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage companies and customers
          </p>
        </div>

        <div className="p-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("companies")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "companies"
                  ? "bg-primary text-white"
                  : "bg-white text-neutral-600 hover:bg-neutral-100"
              }`}>
              <FaBuilding />
              <span>Companies ({companies.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "customers"
                  ? "bg-primary text-white"
                  : "bg-white text-neutral-600 hover:bg-neutral-100"
              }`}>
              <FaUsers />
              <span>Customers ({customers.length})</span>
            </button>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FaSearch}
            />
          </Card>

          {/* Companies Table */}
          {activeTab === "companies" && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-4 py-8 text-center text-neutral-500">
                          Loading companies...
                        </td>
                      </tr>
                    ) : companies.length > 0 ? (
                      companies.map((company) => (
                        <tr
                          key={company.id}
                          className="hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            {company.name}
                          </td>
                          <td className="px-4 py-3 text-sm">{company.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                company.verificationStatus === "verified"
                                  ? "bg-green-100 text-green-800"
                                  : company.verificationStatus === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                              {company.verificationStatus === "verified" ? (
                                <span className="flex items-center gap-1">
                                  <FaCheckCircle /> Verified
                                </span>
                              ) : company.verificationStatus === "rejected" ? (
                                <span className="flex items-center gap-1">
                                  <FaTimesCircle /> Rejected
                                </span>
                              ) : (
                                "Pending"
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {company.phone || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(company.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="text" className="text-sm">
                              <FaEye /> View
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-4 py-8 text-center text-neutral-500">
                          No companies registered yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Customers Table */}
          {activeTab === "customers" && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-8 text-center text-neutral-500">
                          Loading customers...
                        </td>
                      </tr>
                    ) : customers.length > 0 ? (
                      customers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            {customer.name}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {customer.email}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {customer.phone || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="text" className="text-sm">
                              <FaEye /> View
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-8 text-center text-neutral-500">
                          No customers registered yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientManagement;
