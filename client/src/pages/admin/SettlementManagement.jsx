import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  FaMoneyBillWave,
  FaSpinner,
  FaCheckCircle,
  FaExchangeAlt,
  FaHistory,
  FaSearch,
  FaExclamationTriangle,
  FaSyncAlt,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaShieldAlt,
  FaTimes,
  FaLock,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { financeAPI } from "../../services/api";

const SettlementManagement = () => {
  const [activeTab, setActiveTab] = useState("payables"); // 'payables' | 'ledger' | 'payouts'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Overview metrics
  const [overview, setOverview] = useState({
    grossInflow: 0,
    platformCommission: 0,
    gatewayFees: 0,
    payoutsDisbursed: 0,
    escrowHeld: 0,
    eligiblePayables: 0,
    successPayoutsCount: 0,
    failedPayoutsCount: 0,
  });

  // Payables state
  const [payables, setPayables] = useState([]);
  const [payablesFilter, setPayablesFilter] = useState("all");
  const [payablesSearch, setPayablesSearch] = useState("");
  const [executingPayableId, setExecutingPayableId] = useState(null);
  const [selectedPayableForPayout, setSelectedPayableForPayout] = useState(null);

  // Ledger state
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState("");
  const [ledgerSearch, setLedgerSearch] = useState("");

  // Payouts state
  const [payouts, setPayouts] = useState([]);
  const [payoutsFilter, setPayoutsFilter] = useState("all");

  // Fetch all initial data
  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [overviewRes, payablesRes, ledgerRes, payoutsRes] = await Promise.allSettled([
        financeAPI.getOverview(),
        financeAPI.getPayables({ status: payablesFilter !== "all" ? payablesFilter : undefined, search: payablesSearch || undefined }),
        financeAPI.getLedger({ entryType: ledgerTypeFilter || undefined, search: ledgerSearch || undefined }),
        financeAPI.getPayouts({ status: payoutsFilter !== "all" ? payoutsFilter : undefined }),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value.data.success) {
        const raw = overviewRes.value.data.data;
        const m = raw.metrics || raw;
        setOverview({
          grossInflow: Number(m.grossInflow ?? m.totalGrossVolume ?? 0),
          platformCommission: Number(m.platformCommission ?? m.totalVadtransRevenue ?? 0),
          gatewayFees: Number(m.gatewayFees ?? m.totalGatewayFees ?? 0),
          payoutsDisbursed: Number(m.payoutsDisbursed ?? m.totalDisbursedAmount ?? 0),
          escrowHeld: Number(m.escrowHeld ?? m.totalEscrowBalance ?? 0),
          eligiblePayables: Number(m.eligiblePayables ?? m.pendingPayablesCount ?? 0),
          successPayoutsCount: Number(m.successPayoutsCount ?? m.totalPayoutsCount ?? 0),
          failedPayoutsCount: Number(m.failedPayoutsCount ?? 0),
        });
      }
      if (payablesRes.status === "fulfilled" && payablesRes.value.data.success) {
        setPayables(payablesRes.value.data.data.payables || []);
      }
      if (ledgerRes.status === "fulfilled" && ledgerRes.value.data.success) {
        const raw = ledgerRes.value.data.data;
        setLedgerEntries(raw.ledgerEntries || raw.entries || []);
      }
      if (payoutsRes.status === "fulfilled" && payoutsRes.value.data.success) {
        setPayouts(payoutsRes.value.data.data.payouts || []);
      }
    } catch (error) {
      console.error("Error loading financial data:", error);
      toast.error("Failed to load financial operations data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [payablesFilter, payablesSearch, ledgerTypeFilter, ledgerSearch, payoutsFilter]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle manual payout trigger
  const handleTriggerPayout = async () => {
    if (!selectedPayableForPayout) return;
    try {
      setExecutingPayableId(selectedPayableForPayout.id);
      setSelectedPayableForPayout(null);
      const res = await financeAPI.triggerPayout(selectedPayableForPayout.id);
      if (res.data.success) {
        toast.success(res.data.message || "Payout transfer initiated successfully!");
        loadDashboardData();
      }
    } catch (err) {
      console.error("Payout initiation error:", err);
      toast.error(err.response?.data?.message || "Failed to initiate automated transfer");
    } finally {
      setExecutingPayableId(null);
    }
  };

  const formatNaira = (val) => {
    const num = Number(val) || 0;
    return `₦${num.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
      case "paid":
      case "success":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <FaCheckCircle className="text-emerald-600 text-[10px]" /> Paid / Success
          </span>
        );
      case "eligible":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <FaSyncAlt className="text-blue-600 text-[10px]" /> Eligible for Payout
          </span>
        );
      case "payout_queued":
      case "processing":
      case "queued":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">
            <FaSpinner className="animate-spin text-purple-600 text-[10px]" /> Transfer Queued
          </span>
        );
      case "pending_trip":
      case "escrow_held":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <FaLock className="text-amber-600 text-[10px]" /> Escrow Held
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <FaExclamationTriangle className="text-red-600 text-[10px]" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 sm:px-8 py-5 z-40 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FaShieldAlt className="text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-raleway font-bold text-gray-900">
                  Financial & Automated Payout Engine
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Automated marketplace payments, Paystack escrow ledger, and direct NUBAN transfers.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={loadDashboardData}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 text-gray-700 text-xs py-2 px-3.5"
            >
              <FaSyncAlt className={`${refreshing ? "animate-spin text-emerald-600" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh Ledger"}</span>
            </Button>
          </div>
        </div>

        <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Gross Inflow */}
            <Card className="p-5 bg-white border border-gray-200/80 shadow-sm rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Gross Inflow</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FaMoneyBillWave size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {formatNaira(overview.grossInflow)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <FaArrowUp className="text-emerald-500" /> Total payments received
              </p>
            </Card>

            {/* Vadtrans Revenue */}
            <Card className="p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/15 border-0 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Vadtrans Revenue</span>
                <div className="p-2 bg-white/20 text-white rounded-xl">
                  <FaWallet size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {formatNaira(overview.platformCommission)}
              </p>
              <p className="text-[11px] text-emerald-100/80 mt-1">
                10% Marketplace Commission
              </p>
            </Card>

            {/* Gateway Fees */}
            <Card className="p-5 bg-white border border-gray-200/80 shadow-sm rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Gateway Fees</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <FaExchangeAlt size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {formatNaira(overview.gatewayFees)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Paystack transaction fees
              </p>
            </Card>

            {/* Disbursed Payouts */}
            <Card className="p-5 bg-white border border-gray-200/80 shadow-sm rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Disbursed Payouts</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <FaCheckCircle size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {formatNaira(overview.payoutsDisbursed)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <FaArrowDown className="text-purple-500" /> {overview.successPayoutsCount || 0} transfers paid out
              </p>
            </Card>

            {/* Escrow Balance */}
            <Card className="p-5 bg-white border border-gray-200/80 shadow-sm rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Held in Escrow</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <FaLock size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-700 tracking-tight">
                {formatNaira(overview.escrowHeld)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Awaiting trip completion
              </p>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 bg-white px-6 rounded-t-2xl shadow-sm">
            <button
              onClick={() => setActiveTab("payables")}
              className={`py-4 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === "payables"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <FaMoneyBillWave />
              <span>Provider Payables & Payouts</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {payables.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("ledger")}
              className={`py-4 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === "ledger"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <FaHistory />
              <span>Transaction Ledger (Audit Trail)</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {ledgerEntries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("payouts")}
              className={`py-4 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === "payouts"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <FaExchangeAlt />
              <span>Paystack Transfers History</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {payouts.length}
              </span>
            </button>
          </div>

          {/* TAB 1: PROVIDER PAYABLES */}
          {activeTab === "payables" && (
            <Card className="p-6 bg-white border border-gray-200/80 shadow-sm rounded-b-2xl rounded-t-none">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-72">
                    <FaSearch className="absolute left-3.5 top-3 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search ref, provider, payable ID..."
                      value={payablesSearch}
                      onChange={(e) => setPayablesSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={payablesFilter}
                    onChange={(e) => setPayablesFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending_trip">Escrow Held (Trip Pending)</option>
                    <option value="eligible">Eligible for Payout</option>
                    <option value="queued">Transfer Queued</option>
                    <option value="paid">Paid / Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong>{payables.length}</strong> marketplace payables
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <FaSpinner className="animate-spin text-3xl text-emerald-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      <tr>
                        <th className="px-5 py-3.5">Payable ID & Date</th>
                        <th className="px-5 py-3.5">Booking / Ride Ref</th>
                        <th className="px-5 py-3.5">Provider / Driver</th>
                        <th className="px-5 py-3.5">Gross Amount</th>
                        <th className="px-5 py-3.5">Vadtrans (10%)</th>
                        <th className="px-5 py-3.5">Net Driver Payable</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Automated Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payables.length > 0 ? (
                        payables.map((payable) => (
                          <tr key={payable.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-4 font-mono font-semibold text-gray-900">
                              <div>{payable.payableId}</div>
                              <span className="text-[10px] text-gray-400 font-normal">
                                {new Date(payable.createdAt).toLocaleDateString("en-NG", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </td>

                            <td className="px-5 py-4 font-semibold text-gray-700">
                              {payable.booking ? (
                                <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                                  Shared #{payable.booking.id}
                                </span>
                              ) : payable.privateRide ? (
                                <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                                  Private #{payable.privateRide.id}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <div className="font-bold text-gray-900">
                                {payable.provider?.name || `Driver #${payable.providerId}`}
                              </div>
                              <div className="text-[11px] text-gray-500">
                                {payable.provider?.email}
                              </div>
                              {payable.provider?.bankDetails?.accountNumber ? (
                                <div className="text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5 font-mono">
                                  <FaCheckCircle className="text-emerald-500" />
                                  {payable.provider.bankDetails.bankName} - {payable.provider.bankDetails.accountNumber}
                                </div>
                              ) : (
                                <div className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5">
                                  <FaExclamationTriangle /> Bank not verified
                                </div>
                              )}
                            </td>

                            <td className="px-5 py-4 font-medium text-gray-700">
                              {formatNaira(payable.grossAmount)}
                            </td>

                            <td className="px-5 py-4 font-semibold text-emerald-600">
                              {formatNaira(payable.commissionAmount)}
                            </td>

                            <td className="px-5 py-4 font-bold text-gray-900 text-sm">
                              {formatNaira(payable.netPayableAmount || payable.netAmount)}
                            </td>

                            <td className="px-5 py-4">
                              {getStatusBadge(payable.status)}
                            </td>

                            <td className="px-5 py-4 text-right">
                              {payable.status === "eligible" || payable.status === "failed" ? (
                                <Button
                                  onClick={() => setSelectedPayableForPayout(payable)}
                                  disabled={executingPayableId === payable.id}
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 ml-auto shadow-sm"
                                >
                                  {executingPayableId === payable.id ? (
                                    <FaSpinner className="animate-spin text-xs" />
                                  ) : (
                                    <FaMoneyBillWave className="text-xs" />
                                  )}
                                  <span>{payable.status === "failed" ? "Retry Transfer" : "Disburse Payout"}</span>
                                </Button>
                              ) : payable.status === "completed" ? (
                                <div className="text-right">
                                  <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                                    <FaCheckCircle /> Transferred
                                  </span>
                                  {payable.payout?.payoutReference && (
                                    <span className="text-[9px] font-mono text-gray-400 block">
                                      {payable.payout.payoutReference}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-400 font-medium italic">
                                  Automated on Trip End
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center text-gray-400 font-medium">
                            No provider payables match your filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* TAB 2: AUDIT LEDGER */}
          {activeTab === "ledger" && (
            <Card className="p-6 bg-white border border-gray-200/80 shadow-sm rounded-b-2xl rounded-t-none">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-72">
                    <FaSearch className="absolute left-3.5 top-3 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search ledger ID, description..."
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={ledgerTypeFilter}
                    onChange={(e) => setLedgerTypeFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 font-medium"
                  >
                    <option value="">All Entry Types</option>
                    <option value="PAYMENT_INFLOW">Payment Inflow</option>
                    <option value="COMMISSION_REVENUE">Commission Revenue</option>
                    <option value="GATEWAY_FEE">Gateway Fee</option>
                    <option value="PROVIDER_PAYABLE_CREDIT">Provider Payable Credit</option>
                    <option value="PAYOUT_DISBURSEMENT">Payout Disbursement</option>
                  </select>
                </div>

                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong>{ledgerEntries.length}</strong> double-entry ledger records
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <FaSpinner className="animate-spin text-3xl text-emerald-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      <tr>
                        <th className="px-5 py-3.5">Ledger ID & Date</th>
                        <th className="px-5 py-3.5">Direction</th>
                        <th className="px-5 py-3.5">Entry Type</th>
                        <th className="px-5 py-3.5">Amount</th>
                        <th className="px-5 py-3.5">Description</th>
                        <th className="px-5 py-3.5">Associated Entity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ledgerEntries.length > 0 ? (
                        ledgerEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5 font-mono font-semibold text-gray-900">
                              <div>{entry.ledgerId}</div>
                              <span className="text-[10px] text-gray-400 font-normal">
                                {new Date(entry.createdAt).toLocaleString("en-NG", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </span>
                            </td>

                            <td className="px-5 py-3.5">
                              {entry.direction === "CREDIT" ? (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                  <FaArrowUp className="text-[10px]" /> CREDIT
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded text-[11px]">
                                  <FaArrowDown className="text-[10px]" /> DEBIT
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-gray-700">
                              {entry.entryType}
                            </td>

                            <td className="px-5 py-3.5 font-bold text-gray-900">
                              {formatNaira(entry.amount)}
                            </td>

                            <td className="px-5 py-3.5 text-gray-600 max-w-sm leading-relaxed">
                              {entry.description}
                            </td>

                            <td className="px-5 py-3.5 text-gray-500 font-mono text-[11px]">
                              {entry.bookingId
                                ? `Booking #${entry.bookingId}`
                                : entry.privateRideId
                                ? `Ride #${entry.privateRideId}`
                                : entry.payoutId
                                ? `Payout #${entry.payoutId}`
                                : "—"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium">
                            No ledger entries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* TAB 3: PAYSTACK TRANSFERS */}
          {activeTab === "payouts" && (
            <Card className="p-6 bg-white border border-gray-200/80 shadow-sm rounded-b-2xl rounded-t-none">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <select
                    value={payoutsFilter}
                    onChange={(e) => setPayoutsFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 font-medium"
                  >
                    <option value="all">All Transfer Statuses</option>
                    <option value="success">Success</option>
                    <option value="processing">Processing</option>
                    <option value="queued">Queued</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong>{payouts.length}</strong> Paystack transfer records
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <FaSpinner className="animate-spin text-3xl text-emerald-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      <tr>
                        <th className="px-5 py-3.5">Payout Reference</th>
                        <th className="px-5 py-3.5">Recipient Name & Bank</th>
                        <th className="px-5 py-3.5">NUBAN Account</th>
                        <th className="px-5 py-3.5">Transfer Code</th>
                        <th className="px-5 py-3.5">Amount</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Date & Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payouts.length > 0 ? (
                        payouts.map((payout) => (
                          <tr key={payout.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5 font-mono font-semibold text-gray-900">
                              {payout.payoutReference}
                            </td>

                            <td className="px-5 py-3.5 font-semibold text-gray-800">
                              <div>{payout.accountName || payout.provider?.name || "Recipient"}</div>
                              <span className="text-[11px] text-gray-500 font-normal">
                                {payout.bankName || "Bank"}
                              </span>
                            </td>

                            <td className="px-5 py-3.5 font-mono font-bold text-gray-700">
                              {payout.accountNumber || "—"}
                            </td>

                            <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500">
                              {payout.transferCode || "—"}
                            </td>

                            <td className="px-5 py-3.5 font-bold text-gray-900 text-sm">
                              {formatNaira(payout.amount)}
                            </td>

                            <td className="px-5 py-3.5">
                              {getStatusBadge(payout.status)}
                            </td>

                            <td className="px-5 py-3.5 text-gray-500 text-[11px]">
                              <div>
                                {new Date(payout.createdAt).toLocaleString("en-NG", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </div>
                              {payout.errorMessage && (
                                <span className="text-red-500 text-[10px] block mt-0.5">
                                  {payout.errorMessage}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">
                            No Paystack transfer records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Manual Automated Payout Trigger */}
      {selectedPayableForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border-0">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <FaShieldAlt className="text-xl" />
                <h3 className="text-lg font-bold text-gray-900">Initiate Automated Payout</h3>
              </div>
              <button
                onClick={() => setSelectedPayableForPayout(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              This will automatically initiate a live Paystack bank transfer for this completed booking directly to the provider's verified NUBAN account.
            </p>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2 mb-6 text-xs border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Provider:</span>
                <span className="font-bold text-gray-900">{selectedPayableForPayout.provider?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bank:</span>
                <span className="font-medium text-gray-800">
                  {selectedPayableForPayout.provider?.bankDetails?.bankName} ({selectedPayableForPayout.provider?.bankDetails?.accountNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gross Booking:</span>
                <span className="font-medium text-gray-800">{formatNaira(selectedPayableForPayout.grossAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vadtrans Cut (10%):</span>
                <span className="font-medium text-emerald-600">{formatNaira(selectedPayableForPayout.commissionAmount)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
                <span className="text-gray-900">Net Disbursed Amount:</span>
                <span className="text-emerald-700">{formatNaira(selectedPayableForPayout.netPayableAmount || selectedPayableForPayout.netAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPayableForPayout(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTriggerPayout}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 shadow-md flex items-center gap-2"
              >
                <FaCheckCircle /> Confirm & Disburse Now
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettlementManagement;
