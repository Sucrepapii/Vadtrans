import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Card from "../../components/Card";
import {
  FaCheckCircle,
  FaDownload,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBox,
  FaTruck,
  FaArrowLeft,
  FaPrint,
  FaArrowRight,
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const FreightConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    trip,
    freightDetails,
    totalAmount,
    paymentMethod,
    bookingId, // Note: For freight, this is the Tracking ID
    searchParams,
  } = location.state || {};

  const handleDownloadWaybill = async () => {
    const element = document.getElementById("waybill-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`VadTrans-Waybill-${bookingId}.pdf`);
      toast.success("Waybill downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download waybill");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const companyName =
    typeof trip?.company === "object"
      ? trip.company.name
      : trip?.company || "Vadtrans";
  const { senderDetails, receiverDetails, cargoDetails } = freightDetails || {};
  const dateStr =
    searchParams?.date ||
    trip?.departureDate ||
    new Date().toLocaleDateString();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-6 sm:py-8 px-4">
        <div className="container-custom max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate("/")}
                className="flex items-center gap-2">
                <FaArrowLeft />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <h1 className="text-2xl sm:text-3xl font-raleway font-bold text-charcoal">
                Shipment Details
              </h1>
            </div>
            <Button
              variant="secondary"
              onClick={handlePrint}
              className="flex items-center gap-2">
              <FaPrint />
              <span className="hidden sm:inline">Print Waybill</span>
            </Button>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <FaCheckCircle className="text-3xl text-green-600 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-green-900 text-lg">
                Shipment Confirmed!
              </h2>
              <p className="text-green-700 text-sm">
                Your tracking ID:{" "}
                <span className="font-mono font-bold text-lg bg-green-200 px-2 py-0.5 rounded ml-1">
                  {bookingId}
                </span>
              </p>
            </div>
          </div>

          {/* Waybill Content for PDF */}
          <div id="waybill-content">
            <Card className="p-4 sm:p-6 mb-6">
              {/* Header Info */}
              <div className="bg-white border-2 border-neutral-200 rounded-lg p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaTruck className="text-3xl text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg uppercase tracking-wide">
                        Digital Waybill
                      </h3>
                      <p className="text-sm text-neutral-600 font-bold">
                        Issuer: {companyName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Date: {dateStr}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                      Tracking Number
                    </p>
                    <p className="text-xl font-mono font-bold">{bookingId}</p>
                  </div>
                </div>

                {/* Transportation Flow */}
                <div className="flex items-center justify-between bg-neutral-50 px-6 py-4 rounded-lg mt-6">
                  <div className="text-center w-1/3">
                    <p className="text-xs text-neutral-500 uppercase mb-1">
                      Origin
                    </p>
                    <p className="font-bold text-lg">{trip?.from}</p>
                  </div>
                  <div className="w-1/3 flex justify-center text-primary">
                    <FaArrowRight size={24} />
                  </div>
                  <div className="text-center w-1/3">
                    <p className="text-xs text-neutral-500 uppercase mb-1">
                      Destination
                    </p>
                    <p className="font-bold text-lg">{trip?.to}</p>
                  </div>
                </div>
              </div>

              {/* Waybill Data Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-6">
                  <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200">
                    <p className="text-xs text-neutral-500 font-bold uppercase mb-3 flex items-center gap-2">
                      Sender (Consignor)
                    </p>
                    <p className="font-bold text-lg">{senderDetails?.name}</p>
                    <p className="text-sm flex items-center gap-2 mt-2">
                      <FaMapMarkerAlt className="text-neutral-400" />{" "}
                      {senderDetails?.address}
                    </p>
                    <p className="text-sm mt-1">
                      {senderDetails?.phone} | {senderDetails?.email}
                    </p>
                  </div>

                  <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200">
                    <p className="text-xs text-neutral-500 font-bold uppercase mb-3 flex items-center gap-2">
                      Receiver (Consignee)
                    </p>
                    <p className="font-bold text-lg">{receiverDetails?.name}</p>
                    <p className="text-sm flex items-center gap-2 mt-2">
                      <FaMapMarkerAlt className="text-neutral-400" />{" "}
                      {receiverDetails?.address}
                    </p>
                    <p className="text-sm mt-1">
                      {receiverDetails?.phone} | {receiverDetails?.email}
                    </p>
                  </div>
                </div>

                {/* Cargo Details & Costs */}
                <div className="space-y-6">
                  <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200">
                    <p className="text-xs text-neutral-500 font-bold uppercase mb-3 flex items-center gap-2">
                      <FaBox className="text-primary" /> Cargo Specs
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <p className="text-sm font-medium">
                          {cargoDetails?.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Weight</p>
                        <p className="font-semibold">
                          {cargoDetails?.weight} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">
                          Declared Value
                        </p>
                        <p className="font-semibold">
                          ₦{Number(cargoDetails?.value || 0).toLocaleString()}
                        </p>
                      </div>
                      {cargoDetails?.dimensions && (
                        <div className="col-span-2">
                          <p className="text-xs text-neutral-500">Dimensions</p>
                          <p className="font-semibold text-sm">
                            {cargoDetails.dimensions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-neutral-800 text-white p-5 rounded-lg">
                    <p className="text-xs text-neutral-400 font-bold uppercase mb-3">
                      Billing Summary
                    </p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-neutral-300">
                        Total Charges
                      </span>
                      <span className="font-bold text-xl">
                        ₦{Number(totalAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-neutral-600 pt-2 mt-2">
                      <span className="text-neutral-400">Status</span>
                      <span
                        className={`font-semibold uppercase ${paymentMethod === "paystack" ? "text-green-400" : "text-yellow-400"}`}>
                        {paymentMethod === "paystack"
                          ? "PAID"
                          : "PAY ON DELIVERY"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center border-t pt-4">
                <p className="text-xs text-neutral-500">
                  This is a system generated digital waybill. For support,
                  please contact help@vadtrans.com
                </p>
              </div>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="mb-6 bg-blue-50 border border-blue-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FaEnvelope className="text-blue-600" />
              What's Next?
            </h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  Your tracking link and digital waybill have been emailed to
                  you.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  Provide the Tracking Number ({bookingId}) to the receiver so
                  they can track the cargo.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  The transport company will contact you shortly to confirm
                  pickup / drop-off proceedings.
                </span>
              </li>
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="primary" fullWidth onClick={handleDownloadWaybill}>
              <div className="flex items-center justify-center gap-2">
                <FaDownload />
                <span>Download Waybill</span>
              </div>
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate("/tracking")}>
              Track Shipment Now
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FreightConfirmation;
