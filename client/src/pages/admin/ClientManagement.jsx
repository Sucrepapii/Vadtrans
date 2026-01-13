import React, { useState } from "react";
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

const ClientManagement = () => {
  const [activeTab, setActiveTab] = useState("companies");
  const [searchTerm, setSearchTerm] = useState("");

  const companies = [
    {
      id: 1,
      name: "Swift Transport",
      type: "Bus",
      status: "verified",
      trips: 1200,
      rating: 4.8,
      joined: "2023-01-15",
    },
    {
      id: 2,
      name: "Sky Airlines",
      type: "Flight",
      status: "verified",
      trips: 850,
      rating: 4.9,
      joined: "2023-03-22",
    },
    {
      id: 3,
      name: "Rail Express",
      type: "Train",
      status: "verified",
      trips: 2100,
      rating: 4.7,
      joined: "2022-11-08",
    },
    {
      id: 4,
      name: "Metro Bus",
      type: "Bus",
      status: "pending",
      trips: 0,
      rating: 0,
      joined: "2024-01-10",
    },
  ];

  const customers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 555-0001",
      bookings: 12,
      joined: "2023-06-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 555-0002",
      bookings: 8,
      joined: "2023-08-22",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1 555-0003",
      bookings: 15,
      joined: "2023-05-10",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      phone: "+1 555-0004",
      bookings: 5,
      joined: "2023-12-01",
    },
  ];

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
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Trips
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Rating
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
                    {companies.map((company) => (
                      <tr
                        key={company.id}
                        className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {company.name}
                        </td>
                        <td className="px-4 py-3 text-sm">{company.type}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              company.status === "verified"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {company.status === "verified" ? (
                              <span className="flex items-center gap-1">
                                <FaCheckCircle /> Verified
                              </span>
                            ) : (
                              "Pending"
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{company.trips}</td>
                        <td className="px-4 py-3 text-sm">
                          ★ {company.rating || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">{company.joined}</td>
                        <td className="px-4 py-3">
                          <Button variant="text" className="text-sm">
                            <FaEye /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
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
                        Bookings
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
                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {customer.name}
                        </td>
                        <td className="px-4 py-3 text-sm">{customer.email}</td>
                        <td className="px-4 py-3 text-sm">{customer.phone}</td>
                        <td className="px-4 py-3 text-sm">
                          {customer.bookings}
                        </td>
                        <td className="px-4 py-3 text-sm">{customer.joined}</td>
                        <td className="px-4 py-3">
                          <Button variant="text" className="text-sm">
                            <FaEye /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
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
