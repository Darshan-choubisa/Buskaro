import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Bus, 
  Ticket, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  ExternalLink,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  ReceiptText
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, sub, isLoading }) => (
  <div className="bg-white px-4 py-4 rounded border border-slate-200 shadow-sm flex items-start justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{title}</p>
        {isLoading ? (
          <div className="h-6 w-24 bg-slate-100 animate-pulse rounded mt-1"></div>
        ) : (
          <h3 className="text-lg font-bold text-slate-800 leading-none mt-0.5">{value}</h3>
        )}
        {sub && !isLoading && (
          <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  </div>
);

const RevenueRow = ({ label, value, color, bg, isLoading, bold }) => (
  <div className={`flex items-center justify-between px-4 py-3 ${bg || ''}`}>
    <span className={`text-sm ${bold ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{label}</span>
    {isLoading ? (
      <div className="h-4 w-20 bg-slate-100 animate-pulse rounded"></div>
    ) : (
      <span className={`text-sm font-bold ${color || 'text-slate-800'}`}>{value}</span>
    )}
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/stats');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExport = () => {
    if (!data) {
      toast.error('No dashboard data available to export');
      return;
    }

    const s = data.stats || {};
    const csvRows = [];
    csvRows.push('--- SYSTEM OVERVIEW REPORT ---');
    csvRows.push(`Generated On,${new Date().toLocaleString()}`);
    csvRows.push('');
    csvRows.push('KEY METRIC,VALUE');
    csvRows.push(`Gross Revenue,₹${s.grossRevenue || 0}`);
    csvRows.push(`Total Refunded,₹${s.totalRefunded || 0}`);
    csvRows.push(`Pending Refund Amount,₹${s.pendingRefundAmount || 0}`);
    csvRows.push(`Net Revenue (Kept),₹${s.totalRevenue || 0}`);
    csvRows.push(`Total Bookings,${s.totalBookings || 0}`);
    csvRows.push(`Confirmed Bookings,${s.confirmedCount || 0}`);
    csvRows.push(`Cancelled Bookings,${s.cancelledCount || 0}`);
    csvRows.push(`Total Users,${s.totalUsers || 0}`);
    csvRows.push(`Total Buses/Trips,${s.totalTrips || 0}`);
    csvRows.push('');
    csvRows.push('--- RECENT TRANSACTIONS ---');
    csvRows.push('Transaction ID,Customer Name,Bus/Operator,Amount,Status');

    if (data.recentBookings && data.recentBookings.length > 0) {
      data.recentBookings.forEach(booking => {
        csvRows.push([
          booking._id,
          booking.user?.name || '',
          booking.trip?.operator || '',
          `₹${booking.totalAmount}`,
          booking.status
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
      });
    } else {
      csvRows.push('No transactions available');
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully!');
  };

  const s = data?.stats || {};

  const statCards = [
    {
      title: 'Net Revenue',
      value: `₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      sub: s.grossRevenue ? `Gross ₹${s.grossRevenue.toLocaleString('en-IN')}` : null,
    },
    {
      title: 'Total Bookings',
      value: (s.totalBookings || 0).toLocaleString(),
      icon: Ticket,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      sub: s.confirmedCount !== undefined ? `${s.confirmedCount} confirmed · ${s.cancelledCount || 0} cancelled` : null,
    },
    {
      title: 'Total Users',
      value: (s.totalUsers || 0).toLocaleString(),
      icon: Users,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
    },
    {
      title: 'Total Buses',
      value: (s.totalTrips || 0).toLocaleString(),
      icon: Bus,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">System performance and overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
          >
            Export
          </button>
          <button className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm">
            Create Trip
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} isLoading={loading} />
        ))}
      </div>

      {/* Revenue Breakdown + Refund Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ReceiptText size={15} className="text-slate-500" />
              <h2 className="text-sm font-bold text-slate-800">Revenue Breakdown</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live</span>
          </div>
          <div className="divide-y divide-slate-100">
            <RevenueRow
              label="Gross Revenue Collected"
              value={`₹${(s.grossRevenue || 0).toLocaleString('en-IN')}`}
              color="text-slate-700"
              isLoading={loading}
            />
            <RevenueRow
              label="Total Refunded to Customers"
              value={`- ₹${(s.totalRefunded || 0).toLocaleString('en-IN')}`}
              color="text-rose-600"
              isLoading={loading}
            />
            <RevenueRow
              label="Cancellation Fees Earned"
              value={`₹${(s.cancellationChargesEarned || 0).toLocaleString('en-IN')}`}
              color="text-amber-600"
              isLoading={loading}
            />
            <RevenueRow
              label="Pending Refund Outflow"
              value={`₹${(s.pendingRefundAmount || 0).toLocaleString('en-IN')}`}
              color="text-orange-500"
              isLoading={loading}
            />
            <RevenueRow
              label="Net Revenue (Kept)"
              value={`₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`}
              color="text-emerald-600"
              bg="bg-emerald-50/40"
              bold={true}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <Ticket size={15} className="text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">Booking Summary</h2>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-sm text-slate-600">Confirmed Bookings</span>
              </div>
              {loading ? (
                <div className="h-4 w-12 bg-slate-100 animate-pulse rounded"></div>
              ) : (
                <span className="text-sm font-bold text-emerald-600">{s.confirmedCount || 0}</span>
              )}
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <XCircle size={14} className="text-rose-500" />
                <span className="text-sm text-slate-600">Cancelled Bookings</span>
              </div>
              {loading ? (
                <div className="h-4 w-12 bg-slate-100 animate-pulse rounded"></div>
              ) : (
                <span className="text-sm font-bold text-rose-600">{s.cancelledCount || 0}</span>
              )}
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-amber-500" />
                <span className="text-sm text-slate-600">Pending Refund Requests</span>
              </div>
              {loading ? (
                <div className="h-4 w-12 bg-slate-100 animate-pulse rounded"></div>
              ) : (
                <span className="text-sm font-bold text-amber-600">{s.pendingRefundCount || 0}</span>
              )}
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <ArrowDownLeft size={14} className="text-indigo-500" />
                <span className="text-sm text-slate-600">Total Refunds Processed</span>
              </div>
              {loading ? (
                <div className="h-4 w-12 bg-slate-100 animate-pulse rounded"></div>
              ) : (
                <span className="text-sm font-bold text-indigo-600">
                  ₹{(s.totalRefunded || 0).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {(s.pendingRefundCount > 0) && !loading && (
              <div className="px-4 py-3 bg-amber-50/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-700 font-medium">
                    {s.pendingRefundCount} refund{s.pendingRefundCount > 1 ? 's' : ''} awaiting action
                  </span>
                  <button
                    onClick={() => navigate('/admin/refunds')}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    Review <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800">Recent Transactions</h2>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1"
          >
            View All <ExternalLink size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/30">
                <th className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bus</th>
                <th className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan="5" className="px-4 py-3">
                      <div className="h-3 bg-slate-50 animate-pulse rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : data?.recentBookings?.length > 0 ? (
                data.recentBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50/30 transition-all">
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">#{booking._id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{booking.user?.name || 'User'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{booking.trip?.operator || 'Bus'}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">₹{booking.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        booking.status === 'confirmed' ? 'text-emerald-700 bg-emerald-50' :
                        booking.status === 'pending'   ? 'text-amber-700 bg-amber-50' :
                        'text-rose-700 bg-rose-50'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-slate-400 text-sm">No recent data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
