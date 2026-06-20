import React, { useState, useEffect } from 'react';
import { Ticket, Search, Filter, Download, MoreVertical, Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/admin/bookings');
        setBookings(response.data.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleExport = () => {
    if (bookings.length === 0) {
      toast.error('No bookings to export');
      return;
    }

    const headers = [
      'Booking ID',
      'Customer Name',
      'Customer Email',
      'Bus Operator',
      'From',
      'To',
      'Seats',
      'Total Amount',
      'Status',
      'Booking Date'
    ];

    const rows = bookings.map(booking => [
      booking._id,
      booking.user?.name || '',
      booking.user?.email || '',
      booking.trip?.operator || '',
      booking.trip?.from || '',
      booking.trip?.to || '',
      booking.seats ? booking.seats.join(', ') : '',
      `₹${booking.totalAmount}`,
      booking.status,
      booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(value => {
          const stringValue = typeof value === 'string' ? value : String(value);
          const escaped = stringValue.replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ].join('\n');

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Bookings exported successfully!');
    } catch (error) {
      console.error('CSV Export Error:', error);
      toast.error('Failed to export bookings');
    }
  };

  const filteredBookings = bookings.filter(booking => 
    booking._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 text-sm">Manage ticket reservations</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID or User..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-all">
            <Filter size={14} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-sm font-medium">Fetching bookings...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/30">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bus / Route</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50/30 transition-all group">
                      <td className="px-4 py-3 text-xs font-mono text-indigo-600 font-bold uppercase">
                        #{booking._id.slice(-6)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">
                        {booking.user?.name || 'User'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {booking.trip?.operator || 'Bus'}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900">
                        ₹{booking.totalAmount}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          booking.status === 'confirmed' ? 'text-emerald-700 bg-emerald-50' :
                          booking.status === 'pending' ? 'text-amber-700 bg-amber-50' :
                          'text-rose-700 bg-rose-50'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-all">
                            <Eye size={14} />
                          </button>
                          <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-all">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-slate-400 text-sm">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
