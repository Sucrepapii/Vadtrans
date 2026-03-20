import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import { FaSearch, FaEye, FaTimes } from "react-icons/fa";
import { shipmentAPI } from "../../services/api";
import { toast } from "react-toastify";

const ShipmentManagement = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await shipmentAPI.getAllShipments();
      if (response.data.success) {
        setShipments(response.data.shipments);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await shipmentAPI.updateShipmentStatus(id, {
        trackingStatus: newStatus,
      });
      if (response.data.success) {
        toast.success("Shipment status updated");
        fetchShipments();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleView = (shipment) => {
    setSelectedShipment(shipment);
    setIsModalOpen(true);
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      (shipment.trackingId &&
        shipment.trackingId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (shipment.sender?.name &&
        shipment.sender.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      selectedStatus === "all" || shipment.trackingStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "pickup":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const columns = [
    {
      key: "trackingId",
      label: "Tracking ID",
      sortable: true,
      render: (value) => <span className="font-mono font-medium">{value}</span>,
    },
    {
      key: "sender",
      label: "Sender",
      sortable: true,
      render: (_, row) => row.sender?.name || row.senderDetails?.name || "N/A",
    },
    {
      key: "company",
      label: "Transport Company",
      sortable: true,
      render: (_, row) => row.trip?.company?.name || "N/A",
    },
    {
      key: "route",
      label: "Route",
      render: (_, row) =>
        row.trip ? `${row.trip.from} - ${row.trip.to}` : "N/A",
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (_, row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "cargo",
      label: "Cargo Spec",
      render: (_, row) => row.cargoDetails?.description || "N/A",
    },
    {
      key: "totalAmount",
      label: "Amount",
      sortable: true,
      render: (value) => `₦${parseFloat(value || 0).toLocaleString()}`,
    },
    {
      key: "trackingStatus",
      label: "Status",
      render: (value, row) => (
        <select
          value={value}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer outline-none appearance-none ${getStatusColor(
            value,
          )}`}>
          <option
            value="pending_approval"
            className="bg-white text-black text-sm">
            Pending Approval
          </option>
          <option value="pickup" className="bg-white text-black text-sm">
            Pickup
          </option>
          <option value="in_transit" className="bg-white text-black text-sm">
            In Transit
          </option>
          <option value="arrived" className="bg-white text-black text-sm">
            Arrived
          </option>
          <option value="delivered" className="bg-white text-black text-sm">
            Delivered
          </option>
          <option value="cancelled" className="bg-white text-black text-sm">
            Cancelled
          </option>
        </select>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            variant="text"
            className="text-blue-600"
            onClick={() => handleView(row)}>
            <FaEye />
          </Button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Calculate statistics from real data
  const stats = {
    total: shipments.length,
    delivered: shipments.filter((s) => s.trackingStatus === "delivered").length,
    inTransit: shipments.filter((s) => s.trackingStatus === "in_transit")
      .length,
    pending: shipments.filter((s) => s.trackingStatus === "pending_approval")
      .length,
    revenue: shipments
      .filter(
        (s) => s.paymentStatus === "paid" || s.trackingStatus === "delivered",
      )
      .reduce((sum, s) => sum + (parseFloat(s.totalAmount) || 0), 0),
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-neutral-200 px-8 py-6">
          <h1 className="text-3xl font-raleway font-bold text-charcoal">
            Shipment Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Monitor and track all freight shipments on Vadtrans
          </p>
        </div>

        <div className="p-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <h3 className="text-sm text-neutral-600 mb-1">Total Shipments</h3>
              <p className="text-3xl font-bold text-charcoal">{stats.total}</p>
            </Card>
            <Card>
              <h3 className="text-sm text-neutral-600 mb-1">Delivered</h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.delivered}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm text-neutral-600 mb-1">In Transit</h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.inTransit}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm text-neutral-600 mb-1">Total Value</h3>
              <p className="text-3xl font-bold text-primary">
                ₦{stats.revenue.toLocaleString()}
              </p>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by Tracking ID or Sender Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">All Status</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="pickup">Pickup</option>
                <option value="in_transit">In Transit</option>
                <option value="arrived">Arrived</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </Card>

          {/* Shipments Table */}
          <Card>
            {loading ? (
              <div className="py-12 text-center text-neutral-500">
                Loading shipments...
              </div>
            ) : paginatedShipments.length > 0 ? (
              <>
                <Table columns={columns} data={paginatedShipments} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredShipments.length}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </>
            ) : (
              <div className="py-12 text-center text-neutral-500">
                No shipments found
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Shipment Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedShipment && (
          <div className="p-6 max-w-lg mx-auto overflow-y-auto max-h-[80vh]">
            <h2 className="text-2xl font-bold mb-4 font-raleway text-charcoal">
              Shipment Specifics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Tracking ID</span>
                <span className="font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded">
                  {selectedShipment.trackingId}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Sender / User</span>
                <span className="font-medium">
                  {selectedShipment.sender?.name ||
                    selectedShipment.senderDetails?.name ||
                    "N/A"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Route</span>
                <span className="font-medium text-right">
                  {selectedShipment.trip?.from} ➔ {selectedShipment.trip?.to}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Payment Status</span>
                <span
                  className={`font-medium capitalize ${selectedShipment.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                  {selectedShipment.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Total Amount</span>
                <span className="font-bold text-primary">
                  ₦
                  {parseFloat(
                    selectedShipment.totalAmount || 0,
                  ).toLocaleString()}
                </span>
              </div>

              <div className="mt-4 bg-neutral-50 p-4 rounded-lg">
                <h3 className="font-bold text-neutral-700 mb-2">
                  Cargo Details
                </h3>
                <p className="text-sm">
                  <strong>Description:</strong>{" "}
                  {selectedShipment.cargoDetails?.description}
                </p>
                <p className="text-sm">
                  <strong>Weight:</strong>{" "}
                  {selectedShipment.cargoDetails?.weight} kg
                </p>
                <p className="text-sm">
                  <strong>Declared Value:</strong> ₦
                  {selectedShipment.cargoDetails?.value}
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShipmentManagement;
