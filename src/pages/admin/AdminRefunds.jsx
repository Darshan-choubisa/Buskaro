import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee, Clock, CheckCircle2, XCircle, RefreshCw,
  Eye, ThumbsUp, ThumbsDown, CreditCard, Search, ChevronLeft,
  ChevronRight, AlertTriangle, X, User, Bus, Calendar,
  MapPin, Ticket, FileText, BadgeCheck, Filter, Loader2, Info,
} from 'lucide-react';
import api from '../../utils/api';
import { calculateRefundPolicyFromBooking } from '../../utils/refundPolicy';
import toast from 'react-hot-toast';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const money = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return String(d); }
};

const fmtDateTime = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return String(d); }
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200',
    icon: <Clock size={11} />,
  },
  requested: { // backward compatibility
    label: 'Pending',
    bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200',
    icon: <Clock size={11} />,
  },
  approved: {
    label: 'Approved',
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200',
    icon: <CheckCircle2 size={11} />,
  },
  processing: {
    label: 'Processing',
    bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200',
    icon: <RefreshCw size={11} className="animate-spin" />,
  },
  refunded: {
    label: 'Refunded',
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
    icon: <BadgeCheck size={11} />,
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200',
    icon: <XCircle size={11} />,
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200',
    icon: <AlertTriangle size={11} />,
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const STAT_COLORS = {
  'border-amber-500/30': { bg: 'bg-amber-50', text: 'text-amber-600' },
  'border-blue-500/30': { bg: 'bg-blue-50', text: 'text-blue-600' },
  'border-emerald-500/30': { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  'border-rose-500/30': { bg: 'bg-rose-50', text: 'text-rose-600' }
};

const StatCard = ({ icon, label, value, sub, color }) => {
  const colors = STAT_COLORS[color] || { bg: 'bg-indigo-50', text: 'text-indigo-600' };
  return (
    <div className="bg-white px-4 py-3 rounded border border-slate-200 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${colors.bg} ${colors.text}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{label}</p>
        <h3 className="text-lg font-bold text-slate-800 leading-none mt-0.5">{value}</h3>
        {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
};

// ─── Booking Detail Modal ─────────────────────────────────────────────────────

const BookingModal = ({ refund, onClose }) => {
  if (!refund) return null;
  const b = refund.bookingId;
  const t = b?.trip;
  const policy = calculateRefundPolicyFromBooking(b);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded border border-slate-200 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-lg"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" />
            Booking Details
          </h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4 text-slate-700">
          {/* Refund ID */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Refund ID</div>
            <div className="font-mono text-sm font-bold text-indigo-600">{refund.refundId}</div>
            <div className="text-[9px] text-slate-500 mt-1">Booking: {b?._id || '—'}</div>
          </div>

          {/* Passenger */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><User size={9} /> Passenger</div>
              <div className="text-sm font-bold text-slate-800">{refund.userId?.name || '—'}</div>
              <div className="text-[10px] text-slate-500">{refund.userId?.email || '—'}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Bus size={9} /> Bus</div>
              <div className="text-sm font-bold text-slate-800">{t?.busName || t?.operator || '—'}</div>
              <div className="text-[10px] text-slate-500">{t?.from} → {t?.to}</div>
            </div>
          </div>

          {/* Journey */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={9} /> Journey Date</div>
              <div className="text-sm font-bold text-slate-800">{fmtDate(t?.date)}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Ticket size={9} /> Seats</div>
              <div className="text-sm font-bold text-slate-800">{b?.seats?.join(', ') || '—'}</div>
            </div>
          </div>

          {/* Passengers list */}
          {b?.passengers?.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Passengers</div>
              <div className="flex flex-wrap gap-2">
                {b.passengers.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded px-2 py-1">
                    <span className="text-[10px] text-indigo-600 font-bold">S{p.seatNumber}</span>
                    <span className="text-xs text-slate-600">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancellation reason */}
          {refund.reason && (
            <div className="bg-rose-50 border border-rose-200 rounded p-3">
              <div className="text-[9px] font-bold text-rose-700 uppercase tracking-widest mb-1">Cancellation Reason</div>
              <div className="text-sm text-rose-900">{refund.reason}</div>
            </div>
          )}

          {/* Refund Policy Applied */}
          {(refund.refundPercentage !== undefined || refund.percentage !== undefined || refund.computedRefundPercentage !== undefined) && (
            <div className={`rounded p-3 border ${
              (refund.computedRefundPercentage ?? refund.refundPercentage ?? refund.percentage) === 100
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Info size={11} className="text-indigo-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Refund Policy Applied</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${
                  (refund.computedRefundPercentage ?? refund.refundPercentage ?? refund.percentage) === 100 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {(refund.computedRefundPercentage ?? refund.refundPercentage ?? refund.percentage) === 100
                    ? '✓ Full Refund Rule — booked ≥5 days ahead, cancelled ≥3 days before'
                    : '⚠ Partial Refund — conditions for full refund were not met'}
                </span>
                <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                  (refund.computedRefundPercentage ?? refund.refundPercentage ?? refund.percentage) === 100
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>{refund.computedRefundPercentage ?? refund.refundPercentage ?? refund.percentage}% Refund</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="bg-white/60 rounded p-2">
                  <div className="text-[9px] text-slate-500">Original Fare</div>
                  <div className="text-xs font-bold text-slate-800">{money(refund.originalFare || b?.totalAmount)}</div>
                </div>
                <div className="bg-white/60 rounded p-2">
                  <div className="text-[9px] text-slate-500">Cancellation Charge</div>
                  <div className="text-xs font-bold text-rose-600">- {money(refund.computedCancellationCharges ?? refund.cancellationCharges)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Admin info */}
          {refund.approvedBy && (
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Admin Action</div>
              <div className="text-xs text-slate-600">By: <span className="font-bold text-slate-800">{refund.approvedBy?.name || 'Admin'}</span></div>
              <div className="text-xs text-slate-500">At: {fmtDateTime(refund.approvedAt)}</div>
            </div>
          )}

          {/* Transaction reference */}
          {refund.transactionReference && (
            <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
              <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Transaction Reference</div>
              <div className="font-mono text-sm text-emerald-800 break-all">{refund.transactionReference}</div>
              <div className="text-[10px] text-slate-500 mt-1">Processed: {fmtDateTime(refund.refundedAt)}</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Reject Modal ─────────────────────────────────────────────────────────────

const RejectModal = ({ refund, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded border border-slate-200 w-full max-w-md shadow-lg"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-rose-600 flex items-center gap-2">
            <XCircle size={16} /> Reject Refund
          </h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            You are about to reject the refund of <strong className="text-rose-600">{money(refund?.amount)}</strong> for booking <strong className="text-indigo-600 font-mono">{refund?.refundId}</strong>.
            Please provide a reason.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (required)…"
            rows={3}
            className="w-full bg-white border border-slate-300 rounded px-4 py-3 text-sm text-slate-800 resize-none focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-colors placeholder:text-slate-400"
          />
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(reason)}
              disabled={!reason.trim() || loading}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors"
            >
              {loading ? 'Rejecting…' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Process Refund Modal ─────────────────────────────────────────────────────

const ProcessModal = ({ refund, onClose, onConfirm, loading, result }) => {
  if (!refund) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded border border-slate-200 w-full max-w-md shadow-lg"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
            <CreditCard size={16} /> Process Refund Payment
          </h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {result ? (
            // ── Success Result ──
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <BadgeCheck size={32} className="text-emerald-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Refund Processed!</h4>
              <p className="text-sm text-slate-600 mb-4">
                {result.isDemo ? 'Mock refund' : 'Razorpay refund'} of <strong className="text-emerald-600">{money(refund.amount)}</strong> processed successfully.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-left">
                <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Transaction Reference</div>
                <div className="font-mono text-sm text-emerald-800 break-all">{result.transactionReference}</div>
                {result.isDemo && (
                  <div className="text-[10px] text-amber-700 mt-2 flex items-center gap-1">
                    <AlertTriangle size={10} /> Demo mode: no actual money was transferred
                  </div>
                )}
              </div>
              <button onClick={onClose} className="mt-4 w-full py-2 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded text-sm font-medium text-slate-800 transition-colors">
                Close
              </button>
            </div>
          ) : (
            // ── Confirmation ──
            <>
              <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Refund Amount</div>
                    <div className="text-2xl font-bold text-emerald-600">{money(refund.amount)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Refund ID</div>
                    <div className="font-mono text-sm text-slate-800">{refund.refundId}</div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Passenger</span>
                    <span className="text-slate-800 font-medium">{refund.userId?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Original Fare</span>
                    <span className="text-slate-800 font-medium">{money(refund.originalFare)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Refund %</span>
                    <span className="text-emerald-600 font-bold">{refund.percentage}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-5 flex items-start gap-2">
                <AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  This will initiate a real payment transfer (or a mock transfer in demo mode). This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded text-sm font-medium text-white transition-all shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : 'Process Refund'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all',        label: 'All Refunds' },
  { key: 'pending',    label: 'Pending' },
  { key: 'approved',  label: 'Approved' },
  { key: 'processing', label: 'Processing' },
  { key: 'refunded',  label: 'Refunded' },
  { key: 'rejected',  label: 'Rejected' },
  { key: 'failed',    label: 'Failed' },
];

export default function AdminRefunds() {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab]   = useState('all');
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [actionLoading, setActionLoading] = useState(null);

  // Modals
  const [viewModal,    setViewModal]    = useState(null); // refund object
  const [rejectModal,  setRejectModal]  = useState(null);
  const [processModal, setProcessModal] = useState(null);
  const [processResult, setProcessResult] = useState(null);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, status: activeTab });
      const res = await api.get(`/refunds?${params}`);
      setRefunds(res.data.data || []);
      setStats(res.data.stats || null);
      setPagination(res.data.pagination || { pages: 1, total: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load refunds.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleApprove = async (refund) => {
    setActionLoading(refund._id + '_approve');
    try {
      await api.put(`/refunds/${refund._id}/approve`);
      toast.success('Refund approved! Redirecting to processing gateway...');
      // Redirect to the dedicated processing page
      setTimeout(() => {
        navigate(`/admin/refunds/${refund._id}/process`);
      }, 500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve refund.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (rejectionReason) => {
    if (!rejectModal) return;
    setActionLoading(rejectModal._id + '_reject');
    try {
      await api.put(`/refunds/${rejectModal._id}/reject`, { rejectionReason });
      toast.success('Refund rejected.');
      setRejectModal(null);
      fetchRefunds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject refund.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcessConfirm = async () => {
    if (!processModal) return;
    setActionLoading(processModal._id + '_process');
    try {
      const res = await api.post(`/refunds/${processModal._id}/process`);
      setProcessResult(res.data);
      toast.success('Refund payment processed!');
      fetchRefunds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund.');
    } finally {
      setActionLoading(null);
    }
  };

  const closeProcessModal = () => {
    setProcessModal(null);
    setProcessResult(null);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Refund Management</h1>
          <p className="text-slate-500 text-sm">Review, approve, reject and process customer refunds</p>
        </div>
        <button
          onClick={fetchRefunds}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Clock size={18} className="text-amber-600" />}
            label="Pending Refunds"
            value={stats.totalPending}
            sub={`${money(stats.totalAmountPending)} awaiting`}
            color="border-amber-500/30"
          />
          <StatCard
            icon={<CheckCircle2 size={18} className="text-blue-600" />}
            label="Approved"
            value={stats.totalApproved}
            sub="Ready to process"
            color="border-blue-500/30"
          />
          <StatCard
            icon={<BadgeCheck size={18} className="text-emerald-600" />}
            label="Refunded"
            value={stats.totalRefunded}
            sub={money(stats.totalAmountRefunded)}
            color="border-emerald-500/30"
          />
          <StatCard
            icon={<XCircle size={18} className="text-rose-600" />}
            label="Rejected"
            value={stats.totalRejected}
            sub="Declined requests"
            color="border-rose-500/30"
          />
        </div>
      )}

      {/* ── Filter Tabs ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-200 rounded p-1 w-fit shadow-sm">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Refund / Booking ID</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Passenger / Email</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Route / Bus</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Journey Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Original Fare</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Refund Amt</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Razorpay Refund ID</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Loader2 className="animate-spin text-indigo-500" size={32} />
                      <p className="text-sm font-medium">Fetching refunds...</p>
                    </div>
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-20 text-center bg-white">
                    <IndianRupee size={40} className="text-slate-300 mx-auto mb-3" />
                    <div className="text-slate-500 text-sm font-medium">No refunds found</div>
                    <div className="text-slate-400 text-xs mt-1">
                      {activeTab === 'all' ? 'Refund requests will appear here after ticket cancellations.' : `No ${activeTab} refunds.`}
                    </div>
                  </td>
                </tr>
              ) : (
                refunds.map((refund) => {
                  const trip = refund.bookingId?.trip;
                  const bookingVisualId = refund.bookingId?.bookingId || (refund.bookingId?._id ? `BK-${refund.bookingId._id.slice(-5).toUpperCase()}` : '—');
                  const isApproving = actionLoading === refund._id + '_approve';
                  return (
                    <tr key={refund._id} className="hover:bg-slate-50/30 transition-all">
                      {/* Refund ID & Booking ID */}
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold text-indigo-600">{refund.refundId || '—'}</div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">BK ID: {bookingVisualId}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{fmtDate(refund.createdAt)}</div>
                      </td>

                      {/* Passenger */}
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{refund.userId?.name || '—'}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{refund.userId?.email || '—'}</div>
                      </td>

                      {/* Route */}
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <span>{trip?.from || '—'}</span>
                          <ChevronRight size={10} className="text-slate-400" />
                          <span>{trip?.to || '—'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{trip?.busName || trip?.operator || '—'}</div>
                      </td>

                      {/* Journey Date */}
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {fmtDate(trip?.date)}
                      </td>

                      {/* Original Fare */}
                      <td className="px-4 py-3 text-xs font-bold text-slate-700">
                        {money(refund.originalFare)}
                      </td>

                      {/* Refund Amount */}
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold text-slate-900">{money(refund.computedRefundAmount ?? refund.refundAmount ?? refund.amount)}</div>
                        <div className="text-[10px] text-slate-500">{refund.computedRefundPercentage ?? refund.refundPercentage ?? refund.percentage}%</div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={refund.status} />
                      </td>

                      {/* Razorpay Refund ID */}
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500 max-w-[110px] truncate" title={refund.razorpayRefundId || refund.transactionReference || '—'}>
                        {refund.razorpayRefundId || refund.transactionReference || '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* View */}
                          <button
                            onClick={() => setViewModal(refund)}
                            title="View Details"
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 border border-slate-200 transition-all"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Approve (pending or requested only) */}
                          {['pending', 'requested'].includes(refund.status) && (
                            <button
                              onClick={() => handleApprove(refund)}
                              disabled={isApproving}
                              title="Approve Refund"
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded text-blue-600 border border-blue-200 transition-all disabled:opacity-50"
                            >
                              {isApproving
                                ? <span className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin inline-block" />
                                : <ThumbsUp size={13} />}
                            </button>
                          )}

                          {/* Reject (pending, requested or approved) */}
                          {['pending', 'requested', 'approved', 'processing'].includes(refund.status) && (
                            <button
                              onClick={() => setRejectModal(refund)}
                              title="Reject Refund"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded text-rose-600 border border-rose-200 transition-all"
                            >
                              <ThumbsDown size={13} />
                            </button>
                          )}

                          {/* Process (approved only) */}
                          {refund.status === 'approved' && (
                            <button
                              onClick={() => navigate(`/admin/refunds/${refund._id}/process`)}
                              title="Process Refund Payment"
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded text-[10px] font-bold text-emerald-700 border border-emerald-200 transition-all"
                            >
                              <CreditCard size={11} />
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing page {page} of {pagination.pages} ({pagination.total} total)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 bg-white border border-slate-300 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="p-1.5 bg-white border border-slate-300 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewModal && (
          <BookingModal refund={viewModal} onClose={() => setViewModal(null)} />
        )}
        {rejectModal && (
          <RejectModal
            refund={rejectModal}
            onClose={() => setRejectModal(null)}
            onConfirm={handleRejectConfirm}
            loading={actionLoading === rejectModal._id + '_reject'}
          />
        )}
        {processModal && (
          <ProcessModal
            refund={processModal}
            onClose={closeProcessModal}
            onConfirm={handleProcessConfirm}
            loading={actionLoading === processModal._id + '_process'}
            result={processResult}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
