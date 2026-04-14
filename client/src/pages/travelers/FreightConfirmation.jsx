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
  FaShieldAlt,
  FaSearch,
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
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary transition-colors font-medium">
              <FaArrowLeft className="text-xs" />
              Return Home
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-primary transition-colors">
                <FaPrint />
                Print
              </button>
              <div className="h-4 w-px bg-neutral-200 mx-2" />
              <button 
                onClick={handleDownloadWaybill}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-primary transition-colors">
                <FaDownload />
                PDF
              </button>
            </div>
          </div>

          {/* Success Hero Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden mb-8">
            <div className="bg-emerald-500 p-8 text-center text-white relative overflow-hidden">
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 shadow-xl">
                  <FaCheckCircle className="text-3xl text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-raleway font-black mb-2">
                  Shipment Confirmed
                </h1>
                <p className="text-white/80 font-medium max-w-md mx-auto">
                  Thank you for choosing VadTrans. Your cargo has been successfully booked with {companyName}.
                </p>
              </div>
            </div>
            
            <div className="p-8 text-center border-b border-neutral-50">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-3">
                Tracking Number
              </p>
              <div className="inline-flex items-center gap-3 bg-neutral-50 border border-neutral-100 px-6 py-3 rounded-2xl">
                <span className="text-2xl sm:text-3xl font-mono font-black text-neutral-800 tracking-wider">
                  {bookingId}
                </span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(bookingId);
                    toast.success("Tracking ID copied!");
                  }}
                  className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-neutral-400 hover:text-primary">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-neutral-50 bg-neutral-50/30">
              <div className="p-4 text-center">
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Status</p>
                <p className="text-xs font-black text-emerald-600 uppercase tracking-wider">Booked</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Payment</p>
                <p className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                  {paymentMethod === "paystack" ? "Paid" : "On Delivery"}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Weight</p>
                <p className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                  {cargoDetails?.items?.reduce((acc, i) => acc + parseFloat(i.weight || 0) * (i.quantity || 1), 0) || cargoDetails?.weight || 0} kg
                </p>
              </div>
            </div>
          </div>

          {/* Waybill Content Wrapper */}
          <div id="waybill-content" className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <FaTruck className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">
                    Digital Waybill
                  </h3>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                    Issued by {companyName} • {dateStr}
                  </p>
                </div>
              </div>

              {/* Route Banner */}
              <div className="flex items-center justify-between bg-neutral-900 rounded-2xl px-8 py-6 text-white mb-8 border-b-4 border-primary">
                <div className="text-left">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Origin</p>
                  <p className="font-black text-xl">{trip?.from}</p>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 relative">
                  <div className="w-full h-px bg-white/20 dashed" />
                  <FaArrowRight className="text-primary absolute" size={16} />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Destination</p>
                  <p className="font-black text-xl">{trip?.to}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contacts */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sender (Consignor)
                    </h4>
                    <p className="font-black text-neutral-800 text-lg">{senderDetails?.name}</p>
                    <div className="flex items-start gap-2 mt-2 text-sm text-neutral-500">
                      <FaMapMarkerAlt className="mt-1 text-neutral-300" />
                      <span>{senderDetails?.address}</span>
                    </div>
                    <p className="text-xs font-bold text-neutral-400 mt-2">
                      {senderDetails?.phone} | {senderDetails?.email}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-neutral-50">
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Receiver (Consignee)
                    </h4>
                    <p className="font-black text-neutral-800 text-lg">{receiverDetails?.name}</p>
                    <div className="flex items-start gap-2 mt-2 text-sm text-neutral-500">
                      <FaMapMarkerAlt className="mt-1 text-neutral-300" />
                      <span>{receiverDetails?.address}</span>
                    </div>
                    <p className="text-xs font-bold text-neutral-400 mt-2">
                      {receiverDetails?.phone} | {receiverDetails?.email}
                    </p>
                  </div>
                </div>

                {/* Cargo Details */}
                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 shadow-inner">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaBox className="text-primary text-xs" /> Cargo Itemized List
                  </h4>
                  <div className="space-y-3">
                    {cargoDetails?.items?.map((item, idx) => (
                      <div key={idx} className="bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-white">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-black text-neutral-800">{item.description}</p>
                          {item.isFragile && (
                            <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Fragile</span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          {item.type} • {item.quantity} Unit{item.quantity > 1 ? 's' : ''} • {item.weight} kg
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Grand Total</span>
                      <span className="font-black text-lg text-primary">₦{Number(totalAmount).toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] font-medium text-neutral-400 text-right">
                      Inclusive of handling & VAT
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="mt-8 bg-neutral-900 rounded-3xl p-8 text-white shadow-xl shadow-neutral-900/10 border-b-4 border-primary">
            <h2 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3">
              <FaShieldAlt className="text-primary" />
              What Happens Next?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-primary">1</div>
                <p className="text-xs text-white/70 font-medium leading-relaxed">
                  A digital waybill and tracking summary has been sent to your registered email address.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-primary">2</div>
                <p className="text-xs text-white/70 font-medium leading-relaxed">
                  The carrier will contact you via phone within the hour to coordinate shipment pickup.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-primary">3</div>
                <p className="text-xs text-white/70 font-medium leading-relaxed">
                  You can track your real-time cargo status using the tracking ID provided above.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <button 
              onClick={handleDownloadWaybill}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3">
              <FaDownload strokeWidth={2.5} />
              Download Waybill
            </button>
            <button
              onClick={() => navigate("/tracking")}
              className="w-full py-4 bg-white text-neutral-800 border border-neutral-200 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center justify-center gap-3">
              <FaSearch />
              Track Status
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FreightConfirmation;

