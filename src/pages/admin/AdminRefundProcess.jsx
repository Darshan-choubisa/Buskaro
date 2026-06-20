import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CreditCard, User, Bus, Calendar, 
  MapPin, Clock, Ticket, ShieldAlert, Award, 
  BadgeCheck, ChevronRight, RefreshCw, AlertTriangle,
  Loader2, Info, CheckCircle2, ShieldCheck
} from 'lucide-react';
import api from '../../utils/api';
import { calculateRefundPolicyFromBooking } from '../../utils/refundPolicy';
import toast from 'react-hot-toast';

// ─── Refund policy explainer ────────────────────────────────────────────────
function getPolicyExplanation(refund, booking) {
  const totalAmount = refund?.originalFare || booking?.totalAmount || 0;
  const refundPct   = refund?.computedRefundPercentage ?? refund?.refundPercentage ?? refund?.percentage ?? 0;

  const cancelledAt  = refund?.createdAt || booking?.cancelledAt;
  const bookingCreated = booking?.bookingDate || booking?.createdAt;
  const journeyDate    = booking?.trip?.date;

  let daysBooked = null;
  let daysCancelled = null;

  if (journeyDate && bookingCreated) {
    const departure = new Date(journeyDate);
    departure.setHours(0, 0, 0, 0);
    daysBooked = (departure.getTime() - new Date(bookingCreated).getTime()) / (1000 * 60 * 60 * 24);
  }
  if (journeyDate && cancelledAt) {
    const departure = new Date(journeyDate);
    departure.setHours(23, 59, 59, 999);
    daysCancelled = (departure.getTime() - new Date(cancelledAt).getTime()) / (1000 * 60 * 60 * 24);
  }

  const rule100 = daysBooked !== null && daysCancelled !== null && daysBooked >= 5 && daysCancelled >= 3;
  const appliedRule = refundPct === 100 ? '100%' : '50%';

  return { daysBooked, daysCancelled, appliedRule, rule100, refundPct, totalAmount };
}

const money = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDateTime = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return String(d); }
};

export default function AdminRefundProcess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    const fetchRefundDetails = async () => {
      try {
        const res = await api.get(`/refunds/${id}`);
        setRefund(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load refund details.');
        navigate('/admin/refunds');
      } finally {
        setLoading(false);
      }
    };
    fetchRefundDetails();
  }, [id, navigate]);

  const handleProcessRefund = async () => {
    setProcessing(true);
    const toastId = toast.loading('Initiating Razorpay Refund payment...');
    try {
      const res = await api.post(`/refunds/${id}/process`);
      setSuccessResult(res.data);
      toast.success('Refund processed successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund.', { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-sm font-medium">Fetching refund context...</p>
      </div>
    );
  }

  if (!refund) return null;

  const b = refund.bookingId;
  const t = b?.trip;
  const paymentMethod = b?.payment?.paymentMethod || 'Razorpay';
  const paymentStatus = b?.payment?.paymentStatus || 'Captured';
  const paidAt = b?.payment?.paidAt || b?.createdAt;
  const razorpayPaymentId = b?.payment?.razorpayPaymentId || b?.razorpayPaymentId || refund.razorpayPaymentId;
  const policy = calculateRefundPolicyFromBooking(b);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Success Overlay state */}
      <AnimatePresence>
        {successResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded p-6 sm:p-10 w-full max-w-lg text-center shadow-lg relative overflow-hidden"
            >
              {/* Success Ring */}
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
                <BadgeCheck size={44} className="text-emerald-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">Refund Successful</h2>
              <p className="text-slate-500 text-sm mb-8">
                The calculated refund amount has been successfully processed.
              </p>

              {/* Breakdown detail list */}
              <div className="bg-slate-50 border border-slate-200 rounded p-5 text-left space-y-3.5 mb-8">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Refund ID</span>
                  <span className="font-mono font-bold text-slate-800">{refund.refundId}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Razorpay Refund ID</span>
                  <span className="font-mono font-bold text-emerald-600 break-all">{successResult.transactionReference}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Booking ID</span>
                  <span className="font-mono font-bold text-indigo-600">{b?.bookingId || `BK-${b?._id?.slice(-5).toUpperCase()}`}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Passenger Name</span>
                  <span className="font-bold text-slate-800">{refund.userId?.name || '—'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Refund Amount</span>
                  <span className="font-black text-emerald-600 text-base">{money(refund.computedRefundAmount ?? refund.refundAmount ?? policy.refundAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Refund Date</span>
                  <span className="font-medium text-slate-700">{fmtDateTime(new Date())}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/admin/refunds')}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded text-sm font-bold text-white shadow-sm transition-all"
              >
                Return to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <button 
          onClick={() => navigate('/admin/refunds')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-xs font-bold uppercase tracking-wider mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Refunds
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-teal-50 border border-teal-200 flex items-center justify-center">
            <CreditCard size={18} className="text-teal-600" />
          </div>
          Refund Processing Gateway
        </h1>
        <p className="text-slate-500 text-sm mt-1">Review transaction context and process instant merchant payout</p>
      </div>

      <div className="max-w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Summary Cards */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Customer & Booking Information */}
          <div className="bg-white border border-slate-200 rounded p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-200">
              <User size={15} className="text-indigo-600" /> Customer & Booking Context
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Name</span>
                <span className="text-sm font-bold text-slate-700">{refund.userId?.name || '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</span>
                <span className="text-sm font-bold text-slate-600 truncate block">{refund.userId?.email || '—'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bus Route</span>
                <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                  {t?.from || '—'} <ChevronRight size={12} className="text-slate-400" /> {t?.to || '—'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Journey Date</span>
                <span className="text-sm font-bold text-slate-600">{t?.date ? new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seats Booked</span>
                <span className="text-sm font-bold text-indigo-600 font-mono">{b?.seats?.join(', ') || '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Travel Class</span>
                <span className="text-sm font-bold text-slate-600">{b?.busClass || 'AC Coach'}</span>
              </div>
            </div>
          </div>

          {/* Payment Gateway Information */}
          <div className="bg-white border border-slate-200 rounded p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-200">
              <ShieldAlert size={15} className="text-indigo-600" /> Payment Gateway Context
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-50 px-4 py-3.5 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Razorpay Payment ID</span>
                <span className="font-mono text-xs font-bold text-slate-800">{razorpayPaymentId || 'N/A (Demo Sandbox)'}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 px-4 py-3.5 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider">Razorpay Order ID</span>
                <span className="font-mono text-xs font-bold text-slate-700">{b?.payment?.razorpayOrderId || b?.razorpayOrderId || '—'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gateway Status</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-wider">{paymentStatus}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Method</span>
                <span className="text-xs font-bold text-slate-700">{paymentMethod}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Paid At</span>
                <span className="text-xs text-slate-500">{fmtDateTime(paidAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Process / Refund Action Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400"></div>
            
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 text-center">
              Refund Breakdown
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-3.5 pb-6 border-b border-slate-200 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Original Fare</span>
                <span className="text-slate-700 font-bold">{money(refund.originalFare)}</span>
              </div>
              <div className="flex justify-between">
                <span>Refund Percentage</span>
                <span className="text-emerald-600 font-bold">{refund.computedRefundPercentage ?? refund.refundPercentage ?? refund.percentage ?? policy.refundPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Cancellation Charge</span>
                <span className="text-rose-600 font-bold">- {money(refund.computedCancellationCharges ?? refund.cancellationCharges ?? policy.cancellationCharges)}</span>
              </div>
            </div>

            {/* Policy Applied Section */}
            {(() => {
              const policy = getPolicyExplanation(refund, b);
              return (
                <div className="py-4 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Info size={12} className="text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancellation Policy Applied</span>
                  </div>
                  <div className={`rounded p-3 border text-xs space-y-2 ${
                    policy.refundPct === 100
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className={`flex items-center gap-1.5 font-bold ${
                      policy.refundPct === 100 ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {policy.refundPct === 100
                        ? <CheckCircle2 size={13} />
                        : <AlertTriangle size={13} />}
                      {policy.refundPct === 100
                        ? 'Full Refund Rule (100%)'
                        : 'Partial Refund Rule (50%)'}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${
                      policy.refundPct === 100 ? 'text-emerald-800' : 'text-amber-800'
                    }`}>
                      {policy.refundPct === 100
                        ? 'Ticket was booked ≥5 days before departure AND cancelled ≥3 days before departure — full refund applies.'
                        : 'Conditions for full refund were not met (booked <5 days ahead, or cancelled <3 days before departure) — 50% refund applies.'}
                    </p>
                    {policy.daysBooked !== null && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-white/70 rounded p-2 text-center">
                          <div className="text-[10px] text-slate-500">Days before departure<br/>when booked</div>
                          <div className={`text-sm font-bold mt-0.5 ${
                            policy.daysBooked >= 5 ? 'text-emerald-600' : 'text-amber-600'
                          }`}>{policy.daysBooked.toFixed(1)}d
                            <span className="text-[10px] ml-1 font-normal">{policy.daysBooked >= 5 ? '✓ ≥5' : '✗ <5'}</span>
                          </div>
                        </div>
                        <div className="bg-white/70 rounded p-2 text-center">
                          <div className="text-[10px] text-slate-500">Days before departure<br/>when cancelled</div>
                          <div className={`text-sm font-bold mt-0.5 ${
                            policy.daysCancelled !== null && policy.daysCancelled >= 3 ? 'text-emerald-600' : 'text-amber-600'
                          }`}>{policy.daysCancelled !== null ? policy.daysCancelled.toFixed(1) + 'd' : '—'}
                            {policy.daysCancelled !== null && (
                              <span className="text-[10px] ml-1 font-normal">{policy.daysCancelled >= 3 ? '✓ ≥3' : '✗ <3'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 px-1">
                    Policy: Booked ≥5 days ahead + Cancel ≥3 days ahead → 100% refund. All other cases → 50%.
                  </div>
                </div>
              );
            })()}

            {/* Final Refund Amount */}
            <div className="py-6 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Refund Eligible</span>
              <span className="text-3xl font-black text-emerald-600 tracking-tight">{money(refund.computedRefundAmount ?? refund.refundAmount ?? policy.refundAmount)}</span>
            </div>

            {/* Warning Details */}
            <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-6 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-800 leading-relaxed font-semibold">
                WARNING: This triggers an immediate transaction request. Please verify the credentials match before proceeding.
              </p>
            </div>

            <button
              onClick={handleProcessRefund}
              disabled={processing || refund.status === 'refunded'}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Initiating...
                </>
              ) : 'Confirm & Process Payout'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
