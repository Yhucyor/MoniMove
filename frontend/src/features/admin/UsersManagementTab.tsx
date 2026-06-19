"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Trash2,
  RefreshCw,
  Cpu,
  Search,
  UserCircle,
  Settings,
  Mail,
  Eye,
} from "lucide-react";
import {
  getAllUsers,
  updateUserRole,
  updateUserDevices,
  deleteUser,
  listDevices,
  UserProfile,
  DeviceListItem,
} from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import UserDetailModal from "./UserDetailModal";

export default function UsersManagementTab() {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allDevices, setAllDevices] = useState<DeviceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<UserProfile | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, devicesData] = await Promise.all([
        getAllUsers(),
        listDevices(),
      ]);
      setUsers(usersData);
      setAllDevices(devicesData);
      setError(null);
    } catch {
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (email: string, role: "user" | "admin") => {
    setSaving(email);
    try {
      const updated = await updateUserRole(email, role);
      setUsers((prev) => prev.map((u) => (u.email === email ? updated : u)));
      if (email === currentUser?.email) await refreshUser();
    } catch {
      alert("Cập nhật quyền thất bại");
    } finally {
      setSaving(null);
    }
  };

  const handleDeviceToggle = async (
    email: string,
    deviceId: string,
    checked: boolean,
  ) => {
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
      alert("Cập nhật thiết bị thất bại");
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (email: string) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa tài khoản ${email}? Hành động này không thể hoàn tác.`,
      )
    )
      return;

    setSaving(email);
    try {
      await deleteUser(email);
      setUsers((prev) => prev.filter((u) => u.email !== email));
    } catch {
      alert("Xóa tài khoản thất bại");
    } finally {
      setSaving(null);
    }
  };

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.length - adminCount;

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* User Detail Modal */}
      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
        />
      )}

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            Quản lý tài khoản
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Phân quyền Admin/User và cấp quyền truy cập thiết bị cho từng người
            dùng.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow-md active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`}
          />
          Làm mới
        </button>
      </div>

      {/* ─── Stats row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tổng tài khoản
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? "—" : users.length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-50/20 p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
              Quản trị viên (Admin)
            </p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">
              {loading ? "—" : adminCount}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-50/20 p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <UserCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
              Người dùng (User)
            </p>
            <p className="text-2xl font-black text-blue-600 mt-0.5">
              {loading ? "—" : userCount}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Filter & Search ─── */}
      {!loading && users.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            {(["all", "admin", "user"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterRole === role
                    ? role === "admin"
                      ? "bg-amber-500 text-white shadow-sm"
                      : role === "user"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-slate-800 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {role === "all"
                  ? "Tất cả"
                  : role === "admin"
                    ? "Quản trị viên"
                    : "Người dùng"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Error ─── */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="mt-1 text-xs font-bold text-red-600 underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* ─── Users List ─── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-48 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-10 bg-slate-50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200 rounded-[24px] bg-white/50 text-center">
          <Search className="h-8 w-8 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-600">
            Không tìm thấy người dùng
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredUsers.map((u) => {
            const initials = u.name
              ? u.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(-2)
                  .join("")
                  .toUpperCase()
              : "U";
            const isCurrentUser = u.email === currentUser?.email;
            const isExpanded = expandedEmail === u.email;

            return (
              <div
                key={u.email}
                className={`relative rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md ${isExpanded ? "border-purple-200 ring-4 ring-purple-50/50" : "border-slate-200/60"}`}
              >
                {/* User Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 blur-md opacity-20" />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold shadow-sm">
                        {initials}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-base font-extrabold text-slate-900 truncate">
                          {u.name}
                        </p>
                        {isCurrentUser && (
                          <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 border border-slate-200">
                            Bạn
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border ${u.role === "admin" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}
                        >
                          {u.role === "admin" ? (
                            <Shield className="h-2.5 w-2.5" />
                          ) : (
                            <UserCircle className="h-2.5 w-2.5" />
                          )}
                          {u.role === "admin" ? "Admin" : "User"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{u.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDetailUser(u)}
                      className="p-2 rounded-xl border border-blue-100 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                      title="Xem chi tiết tài khoản"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleDelete(u.email)}
                        disabled={saving === u.email}
                        className="p-2 rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 disabled:opacity-50 transition-colors"
                        title="Xóa người dùng"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Role & Devices Configuration Panel */}
                <div className="px-5 pb-5 pt-1">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
                    {/* Role Select */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700">
                          Quyền hạn:
                        </span>
                      </div>
                      <select
                        value={u.role}
                        disabled={saving === u.email || isCurrentUser}
                        onChange={(e) =>
                          handleRoleChange(
                            u.email,
                            e.target.value as "user" | "admin",
                          )
                        }
                        className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-60 shadow-sm"
                      >
                        <option value="user">Người dùng (User)</option>
                        <option value="admin">Quản trị viên (Admin)</option>
                      </select>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Devices Config */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-700">
                            Thiết bị được phép truy cập:
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setExpandedEmail(isExpanded ? null : u.email)
                          }
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors ${isExpanded ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
                        >
                          {isExpanded
                            ? "Thu gọn"
                            : `Chỉnh sửa (${u.deviceIds.length})`}
                        </button>
                      </div>

                      {/* Expanded Device List */}
                      {isExpanded && (
                        <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                          {u.role === "admin" ? (
                            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 font-medium flex items-center gap-2">
                              <Shield className="h-4 w-4 text-amber-500" />
                              Quản trị viên mặc định có quyền truy cập tất cả
                              thiết bị trong hệ thống.
                            </div>
                          ) : allDevices.length === 0 ? (
                            <div className="rounded-lg bg-slate-100 p-3 text-xs text-slate-500 text-center">
                              Chưa có thiết bị nào trong hệ thống.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {allDevices.map((d) => (
                                <label
                                  key={d.id}
                                  className={`flex items-center gap-3 rounded-xl border p-2.5 cursor-pointer transition-all ${u.deviceIds.includes(d.id) ? "border-purple-200 bg-purple-50 shadow-sm" : "border-slate-200 bg-white hover:border-purple-200"}`}
                                >
                                  <div className="relative flex items-center justify-center">
                                    <input
                                      type="checkbox"
                                      checked={u.deviceIds.includes(d.id)}
                                      disabled={saving === u.email}
                                      onChange={(e) =>
                                        handleDeviceToggle(
                                          u.email,
                                          d.id,
                                          e.target.checked,
                                        )
                                      }
                                      className="peer sr-only"
                                    />
                                    <div className="h-4 w-4 rounded border-2 border-slate-300 peer-checked:border-purple-500 peer-checked:bg-purple-500 transition-colors"></div>
                                    <svg
                                      className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                                      viewBox="0 0 14 14"
                                      fill="none"
                                    >
                                      <path
                                        d="M3 8L6 11L11 3.5"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        stroke="currentColor"
                                      ></path>
                                    </svg>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-bold text-slate-800 truncate">
                                      {d.name}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-mono truncate">
                                      {d.id}
                                    </p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
