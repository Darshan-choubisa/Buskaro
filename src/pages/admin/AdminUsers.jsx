import React, { useState, useEffect } from 'react';
import { Users, Search, MoreHorizontal, Mail, Calendar, Ban, Trash2, Loader2, User as UserIcon } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId, currentBlockedStatus) => {
    const action = currentBlockedStatus ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }
    
    try {
      const response = await api.put(`/admin/users/${userId}/block`);
      if (response.data.success) {
        toast.success(response.data.message);
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, isBlocked: !currentBlockedStatus } : user
          )
        );
      }
    } catch (error) {
      console.error(`Error toggling block for user ${userId}:`, error);
      const errorMsg = error.response?.data?.message || `Failed to ${action} user`;
      toast.error(errorMsg);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their bookings and cannot be undone.')) {
      return;
    }
    
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        toast.success(response.data.message || 'User deleted successfully');
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      }
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      const errorMsg = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMsg);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Directory</h1>
          <p className="text-slate-500 text-sm">Manage user accounts and permissions</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm flex items-center gap-2">
          <Users size={16} className="text-indigo-600" />
          <span className="text-sm font-bold text-slate-700">{loading ? '--' : users.length} Users</span>
        </div>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter users..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-sm font-medium">Fetching directory...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/30">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail size={12} className="text-slate-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.isBlocked 
                          ? 'text-rose-700 bg-rose-50' 
                          : 'text-emerald-700 bg-emerald-50'
                      }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                          className={`p-1.5 hover:bg-slate-100 rounded transition-all ${
                            user.isBlocked ? 'text-amber-600 hover:text-amber-700' : 'text-slate-500 hover:text-rose-600'
                          }`}
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          <Ban size={14} className={user.isBlocked ? "fill-amber-500/10" : ""} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600 transition-all"
                          title="Delete User"
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
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users size={32} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
