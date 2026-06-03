import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Bus, 
  Ticket, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Loader2,
  ExternalLink
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, isLoading }) => (
  <div className="bg-white px-4 py-3 rounded border border-slate-200 shadow-sm flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-slate-500 text-[12px] font-semibold uppercase tracking-wider">{title}</p>
        {isLoading ? (
          <div className="h-6 w-20 bg-slate-100 animate-pulse rounded mt-0.5"></div>
        ) : (
          <h3 className="text-lg font-bold text-slate-800 leading-none mt-0.5">{value}</h3>
        )}
      </div>
    </div>
    {!isLoading && (
      <div className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
        {trend === 'up' ? '+' : '-'}{trendValue}%
      </div>
    )}
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
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

    fetchDashboardData();
  }, []);

  const handleExport = () => {
    if (!data) {
      toast.error('No dashboard data available to export');
      return;
    }

    const csvRows = [];

    // Title / Header
    csvRows.push('--- SYSTEM OVERVIEW REPORT ---');
    csvRows.push(`Generated On,${new Date().toLocaleString()}`);
    csvRows.push('');

    // Key Statistics
    csvRows.push('KEY METRIC,VALUE');
    csvRows.push(`Total Revenue,₹${data.stats?.totalRevenue || 0}`);
    csvRows.push(`Total Bookings,${data.stats?.totalBookings || 0}`);
    csvRows.push(`Total Users,${data.stats?.totalUsers || 0}`);
    csvRows.push(`Total Buses/Trips,${data.stats?.totalTrips || 0}`);
    csvRows.push('');

    // Recent Transactions
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
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','));
      });
    } else {
      csvRows.push('No transactions available');
    }

    const csvContent = csvRows.join('\n');

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard_report_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Dashboard summary report exported successfully!');
    } catch (error) {
      console.error('Dashboard Export Error:', error);
      toast.error('Failed to export dashboard data');
    }
  };

  const stats = [
    { title: 'Revenue', value: `₹${data?.stats?.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, trend: 'up', trendValue: '12' },
    { title: 'Bookings', value: data?.stats?.totalBookings?.toLocaleString() || 0, icon: Ticket, trend: 'up', trendValue: '8' },
    { title: 'Users', value: data?.stats?.totalUsers?.toLocaleString() || 0, icon: Users, trend: 'up', trendValue: '15' },
    { title: 'Buses', value: data?.stats?.totalTrips?.toLocaleString() || 0, icon: Bus, trend: 'down', trendValue: '3' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">System performance and overview</p>
        </div>
        <div className="flex gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} isLoading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800">Recent Transactions</h2>
            <button className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1">
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
                          booking.status === 'pending' ? 'text-amber-700 bg-amber-50' :
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

        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800">Route Load</h2>
          </div>
          <div className="p-4 space-y-4">
            {[
              { name: 'Mumbai - Pune', load: 85, color: 'bg-indigo-600' },
              { name: 'Delhi - Jaipur', load: 72, color: 'bg-indigo-500' },
              { name: 'Bangalore - Goa', load: 64, color: 'bg-indigo-400' },
              { name: 'Hyderabad - Vizag', load: 45, color: 'bg-indigo-300' },
            ].map((route, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-slate-600">{route.name}</span>
                  <span className="text-xs font-bold text-slate-800">{route.load}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${route.color}`} style={{ width: `${route.load}%` }}></div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-indigo-600" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Next Sync</span>
                </div>
                <p className="text-xs font-bold text-slate-700">Scheduled: Today, 11:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
