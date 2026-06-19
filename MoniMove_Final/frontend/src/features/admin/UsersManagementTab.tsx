'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, Trash2, RefreshCw, Cpu } from 'lucide-react';
import {
  getAllUsers,
  updateUserRole,
  updateUserDevices,
  deleteUser,
  listDevices,
  UserProfile,
  DeviceListItem,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function UsersManagementTab() {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allDevices, setAllDevices] = useState<DeviceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, devicesData] = await Promise.all([getAllUsers(), listDevices()]);
      setUsers(usersData);
      setAllDevices(devicesData);
      setError(null);
    } catch {
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (email: string, role: 'user' | 'admin') => {
    setSaving(email);
    try {
      const updated = await updateUserRole(email, role);
      setUsers((prev) => prev.map((u) => (u.email === email ? updated : u)));
      if (email === currentUser?.email) await refreshUser();
    } catch {
      alert('Cập nhật quyền thất bại');
    } finally {
      setSaving(null);
    }
  };

  const handleDeviceToggle = async (email: string, deviceId: string, checked: boolean) => {
    const target = users.find((u) => u.email === email);
    if (!target) return;

    const newDeviceIds = checked
      ? [...target.deviceIds, deviceId]
      : target.deviceIds.filter((id) => id !== deviceId);

    setSaving(email);
    try {
      const updated = await updateUserDevices(email, newDeviceIds);
      setUsers((prev) => prev.map((u) => (u.email === email ? updated : u)));
      if (email === currentUser?.email) await refreshUser();
    } catch {
      alert('Cập nhật thiết bị thất bại');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`Xóa tài khoản ${email}?`)) return;

    setSaving(email);
    try {
      await deleteUser(email);
      setUsers((prev) => prev.filter((u) => u.email !== email));
    } catch {
      alert('Xóa tài khoản thất bại');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#00b494]" />
            Quản lý tài khoản
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
            Phân quyền Admin/User và cấp quyền truy cập thiết bị cho từng người dùng.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
          <p className="text-xs font-semibold text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.email}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={u.role}
                    disabled={saving === u.email || u.email === currentUser?.email}
                    onChange={(e) => handleRoleChange(u.email, e.target.value as 'user' | 'admin')}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b494]/20"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button
                    onClick={() => setExpandedEmail(expandedEmail === u.email ? null : u.email)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Cpu className="h-3.5 w-3.5" />
                    {u.deviceIds.length} thiết bị
                  </button>

                  {u.email !== currentUser?.email && (
                    <button
                      onClick={() => handleDelete(u.email)}
                      disabled={saving === u.email}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              {expandedEmail === u.email && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Thiết bị được cấp quyền
                  </p>
                  {u.role === 'admin' ? (
                    <p className="text-xs text-emerald-600 font-semibold">Admin có quyền truy cập tất cả thiết bị</p>
                  ) : allDevices.length === 0 ? (
                    <p className="text-xs text-slate-400">Chưa có thiết bị trong hệ thống</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {allDevices.map((d) => (
                        <label
                          key={d.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100"
                        >
                          <input
                            type="checkbox"
                            checked={u.deviceIds.includes(d.id)}
                            disabled={saving === u.email}
                            onChange={(e) => handleDeviceToggle(u.email, d.id, e.target.checked)}
                            className="rounded border-slate-300 text-[#00b494] focus:ring-[#00b494]"
                          />
                          {d.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
