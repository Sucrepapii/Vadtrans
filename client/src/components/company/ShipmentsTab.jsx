import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { shipmentAPI } from "../../services/api";
import Card from "../Card";
import {
  FaBox,
  FaSpinner,
  FaCalendarAlt,
  FaCheckCircle,
  FaTruck,
  FaUser,
  FaInfoCircle,
} from "react-icons/fa";

const ShipmentsTab = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await shipmentAPI.getCompanyShipments();
      setShipments(response.data.shipments || []);
    } catch (error) {
      console.error("Error fetching company shipments:", error);
      toast.error("Failed to load shipments list");
    } finally {
      setLoading(false);
    }
  };

  const updateShipmentStatus = async (id, newStatus) => {
    try {
      if (newStatus === "select_status") return;
      const response = await shipmentAPI.updateShipmentStatus(id, {
        trackingStatus: newStatus,
      });
      if (response.data.success) {
        toast.success("Shipment status updated!");
        fetchShipments();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

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

  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return <span className="text-sm font-medium text-green-600">Paid</span>;
      case "pending":
        return (
          <span className="text-sm font-medium text-amber-600">Pending</span>
        );
      case "refunded":
        return (
          <span className="text-sm font-medium text-neutral-500">Refunded</span>
        );
      default:
        return (
          <span className="text-sm font-medium text-neutral-600">{status}</span>
        );
    }
  };

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-3xl text-primary mb-4" />
        <p className="text-neutral-500">Loading company shipments...</p>
      </Card>
    );
  }

  if (shipments.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-center">
        <FaBox className="text-4xl text-neutral-300 mb-4" />
        <h3 className="text-lg font-semibold text-charcoal mb-2">
          No Shipments Yet
        </h3>
        <p className="text-neutral-500 max-w-md">
          When customers book freight shipments for your transport vehicles,
          their details will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-charcoal">
          Freight Shipments
        </h2>
        <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
          Total: {shipments.length}
        </span>
      </div>

      <div className="grid gap-4">
        {shipments.map((shipment) => (
          <Card
            key={shipment.id}
            className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Trip & Shipment Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <FaBox className="text-primary text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal flex items-center gap-2">
                        {shipment.trackingId}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(
                            shipment.trackingStatus,
                          )}`}>
                          {shipment.trackingStatus}
                        </span>
                      </p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                        <FaTruck className="text-[10px]" />
                        {shipment.trip
                          ? `${shipment.trip.from} \u2192 ${shipment.trip.to}`
                          : "Trip Unavailable"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <label className="text-xs text-neutral-500">
                      Update Status:
                    </label>
                    <select
                      value={shipment.trackingStatus}
                      onChange={(e) =>
                        updateShipmentStatus(shipment.id, e.target.value)
                      }
                      className="text-xs border border-neutral-300 rounded px-2 py-1 outline-none focus:border-primary">
                      <option value="pending_approval">Pending Approval</option>
                      <option value="pickup">Pickup</option>
                      <option value="in_transit">In Transit</option>
                      <option value="arrived">Arrived</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Sender & Receiver Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sender */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                      <FaUser className="text-neutral-400" /> Sender / User
                    </h4>
                    <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                      <p className="font-medium text-charcoal text-sm">
                        {shipment.senderDetails?.name ||
                          shipment.sender?.name ||
                          "N/A"}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {shipment.senderDetails?.phone ||
                          shipment.sender?.phone ||
                          "No Phone"}
                      </p>
                      {shipment.senderDetails?.address && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {shipment.senderDetails.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Receiver */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                      <FaUser className="text-neutral-400" /> Receiver
                    </h4>
                    <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                      <p className="font-medium text-charcoal text-sm">
                        {shipment.receiverDetails?.name || "N/A"}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {shipment.receiverDetails?.phone || "No Phone"}
                      </p>
                      {shipment.receiverDetails?.address && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {shipment.receiverDetails.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cargo Specifically */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                    <FaInfoCircle className="text-neutral-400" /> Cargo
                    Description
                  </h4>
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 text-sm text-neutral-700">
                    <p>
                      <strong>Items:</strong>{" "}
                      {shipment.cargoDetails?.description || "N/A"}
                    </p>
                    <p className="mt-1">
                      <strong>Weight:</strong> {shipment.cargoDetails?.weight}{" "}
                      kg
                    </p>
                    {shipment.cargoDetails?.value && (
                      <p className="mt-1">
                        <strong>Declared Value:</strong> \u20A6
                        {parseFloat(
                          shipment.cargoDetails.value,
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="md:w-64 bg-neutral-50 rounded-xl p-4 flex flex-col justify-between border border-neutral-100">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-neutral-700 border-b border-neutral-200 pb-2">
                    Payment Details
                  </h4>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-600">Method:</span>
                    <span className="font-medium capitalize">
                      {shipment.paymentMethod || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-600">Status:</span>
                    {getPaymentBadge(shipment.paymentStatus)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
                    <FaCalendarAlt />
                    {new Date(shipment.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-neutral-600">
                      Total Charged
                    </span>
                    <p className="text-xl font-bold font-raleway text-primary">
                      \u20A6
                      {parseFloat(shipment.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShipmentsTab;
