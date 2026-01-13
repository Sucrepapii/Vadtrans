import React, { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import {
  FaTicketAlt,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

const TicketManagement = () => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      company: "Swift Transport",
      route: "Lagos - Abuja",
      type: "bus",
      price: 45,
      status: "active",
      bookings: 125,
    },
    {
      id: 2,
      company: "Sky Airlines",
      route: "Lagos - Port Harcourt",
      type: "flight",
      price: 280,
      status: "active",
      bookings: 89,
    },
    {
      id: 3,
      company: "Rail Express",
      route: "Abuja - Kano",
      type: "train",
      price: 55,
      status: "inactive",
      bookings: 45,
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || ticket.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "company",
      label: "Company",
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "route",
      label: "Route",
      sortable: true,
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <span className="capitalize px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs">
          {value}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value) => `₦${value}`,
    },
    {
      key: "bookings",
      label: "Bookings",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-neutral-100 text-neutral-800"
          }`}>
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="text" className="text-blue-600">
            <FaEdit />
          </Button>
          <Button variant="text" className="text-red-600">
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-neutral-200 px-8 py-6">
          <h1 className="text-3xl font-raleway font-bold text-charcoal">
            Ticket Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage all tickets across the platform
          </p>
        </div>

        <div className="p-8">
          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by company or route..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Tickets Table */}
          <Card>
            <Table columns={columns} data={paginatedTickets} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredTickets.length}
              onItemsPerPageChange={setItemsPerPage}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketManagement;
