import React, { useState, useEffect, useCallback } from 'react';
import { Bus, Search, Plus, Edit, Trash2, Loader2, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

const AdminBuses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    busName: '',
    type: 'AC Seater',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    duration: '',
    price: '',
    availableSeats: '40',
    totalSeats: '40',
    date: '',
    features: []
  });

  const handleEditClick = (bus) => {
    setEditingBus(bus);
    setFormData({
      busName: bus.busName,
      type: bus.type,
      from: bus.from,
      to: bus.to,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      duration: bus.duration,
      price: String(bus.price),
      availableSeats: String(bus.availableSeats),
      totalSeats: String(bus.totalSeats),
      date: bus.date ? new Date(bus.date).toISOString().slice(0, 10) : '',
      features: bus.features || []
    });
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingBus(null);
    setFormData({
      busName: '',
      type: 'AC Seater',
      from: '',
      to: '',
      departureTime: '',
      arrivalTime: '',
      duration: '',
      price: '',
      availableSeats: '40',
      totalSeats: '40',
      date: '',
      features: []
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBus(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((prev) => {
        const next = searchTerm.trim();
        if (prev !== next) {
          setPage(1);
        }
        return next;
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }

      const response = await api.get(`/admin/trips?${params.toString()}`);
      setBuses(response.data.data || []);
      setPagination(response.data.pagination || { page, limit: PAGE_SIZE, total: 0, pages: 1 });
    } catch (error) {
      console.error('Error fetching buses:', error);
      toast.error('Failed to load buses');
      setBuses([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? [...prev[name], value] : prev[name].filter(f => f !== value)) : value
    }));
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({ ...prev, date: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.busName || !formData.from || !formData.to || !formData.departureTime || !formData.arrivalTime || !formData.duration || !formData.price || !formData.date) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      const payload = {
        busName: formData.busName,
        type: formData.type,
        from: formData.from,
        to: formData.to,
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        duration: formData.duration,
        price: parseFloat(formData.price),
        availableSeats: parseInt(formData.availableSeats),
        totalSeats: parseInt(formData.totalSeats),
        date: new Date(formData.date),
        features: formData.features
      };

      if (editingBus) {
        response = await api.put(`/trips/${editingBus._id}`, payload);
      } else {
        response = await api.post('/trips', payload);
      }

      if (response.data.success) {
        toast.success(editingBus ? 'Bus trip updated successfully!' : 'Bus trip added successfully!');
        setShowModal(false);
        setEditingBus(null);
        setFormData({
          busName: '',
          type: 'AC Seater',
          from: '',
          to: '',
          departureTime: '',
          arrivalTime: '',
          duration: '',
          price: '',
          availableSeats: '40',
          totalSeats: '40',
          date: '',
          features: []
        });
        fetchBuses();
        if (!editingBus) {
          setPage(1);
        }
      }
    } catch (error) {
      console.error('Error saving bus:', error);
      const errMsg = error.response?.data?.message || 'Failed to save bus trip';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus trip?')) {
      try {
        await api.delete(`/trips/${id}`);
        toast.success('Bus trip deleted successfully!');
        fetchBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
        toast.error('Failed to delete bus trip');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bus Fleet</h1>
          <p className="text-slate-500 text-sm">Manage routes and schedules</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Plus size={16} />
          Add Bus
        </button>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search fleet..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-sm font-medium">Loading fleet...</p>
          </div>
        ) : buses.length > 0 ? (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/30">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bus Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Route</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Seats</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buses.map((bus) => (
                  <tr key={bus._id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800">{bus.busName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{bus.type}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="font-medium">{bus.from}</span>
                        <ArrowRight size={12} className="text-slate-300" />
                        <span className="font-medium">{bus.to}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[11px]">
                        <p className="font-bold text-slate-700">{bus.departureTime} - {bus.arrivalTime}</p>
                        <p className="text-slate-400">{new Date(bus.date).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-900">₹{bus.price}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[10px] text-emerald-600 font-bold">{bus.availableSeats}/{bus.totalSeats}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleEditClick(bus)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600 transition-all"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(bus._id)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
              –{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} trips
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded disabled:opacity-40 hover:bg-white transition-all"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                disabled={page >= pagination.pages || loading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded disabled:opacity-40 hover:bg-white transition-all"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Bus size={32} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">{debouncedSearch ? 'No buses match your search.' : 'No buses found.'}</p>
          </div>
        )}
      </div>

      {/* Add Bus Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">{editingBus ? 'Edit Bus Trip' : 'Add New Bus Trip'}</h2>
              <button 
                onClick={handleCloseModal}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bus Name <span className="text-red-500">*</span></label>
                  <input type="text" name="busName" value={formData.busName} onChange={handleInputChange} placeholder="e.g., Mumbai Express" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bus Type <span className="text-red-500">*</span></label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
                    <option>AC Seater</option>
                    <option>AC Sleeper</option>
                    <option>Non-AC Seater</option>
                    <option>Non-AC Sleeper</option>
                    <option>Shivneri AC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">From <span className="text-red-500">*</span></label>
                  <input type="text" name="from" value={formData.from} onChange={handleInputChange} placeholder="e.g., Mumbai" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">To <span className="text-red-500">*</span></label>
                  <input type="text" name="to" value={formData.to} onChange={handleInputChange} placeholder="e.g., Pune" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Departure Time <span className="text-red-500">*</span></label>
                  <input type="time" name="departureTime" value={formData.departureTime} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Arrival Time <span className="text-red-500">*</span></label>
                  <input type="time" name="arrivalTime" value={formData.arrivalTime} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duration <span className="text-red-500">*</span></label>
                  <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="e.g., 3H 15M" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Price (₹) <span className="text-red-500">*</span></label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="e.g., 500" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Total Seats <span className="text-red-500">*</span></label>
                  <input type="number" name="totalSeats" value={formData.totalSeats} onChange={handleInputChange} placeholder="e.g., 40" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Available Seats <span className="text-red-500">*</span></label>
                  <input type="number" name="availableSeats" value={formData.availableSeats} onChange={handleInputChange} placeholder="e.g., 40" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date <span className="text-red-500">*</span></label>
                  <input type="date" name="date" value={formData.date} onChange={handleDateChange} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Features (Optional)</label>
                <div className="flex flex-wrap gap-4">
                  {['WiFi', 'AC', 'Pillow', 'Charging Port', 'Reading Light', 'CCTV', 'GPS Tracking'].map(feature => (
                    <label key={feature} className="flex items-center gap-2">
                      <input type="checkbox" name="features" value={feature} checked={formData.features.includes(feature)} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2">
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editingBus ? (
                    <Edit size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {submitting ? (editingBus ? 'Saving...' : 'Adding...') : (editingBus ? 'Save Changes' : 'Add Bus')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBuses;
