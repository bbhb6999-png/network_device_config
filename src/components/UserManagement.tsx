import React, { useState } from "react";
import { User, UserRole, RolePermission } from "../types";
import { ROLE_PERMISSIONS } from "../data/mockData";
import {
  Users,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Lock,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Key,
  Sliders,
  X,
  RotateCcw,
  Clock,
  ShieldAlert,
} from "lucide-react";

interface UserManagementProps {
  users: User[];
  currentUser: User | null;
  onAddUser: (user: Omit<User, "id">) => void;
  onEditUser: (user: User) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  onAddUser,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
}) => {
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const [activeTab, setActiveTab] = useState<"users" | "permissions" | "settings">("users");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // New User Form State
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    role: "NETWORK_ENGINEER" as UserRole,
    email: "",
    password: "",
  });

  // System Settings State
  const [sysSettings, setSysSettings] = useState({
    minPasswordLength: 8,
    requireSpecialChar: true,
    sessionTimeoutMinutes: 30,
    maxFailedAttempts: 5,
  });

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.name) return;
    onAddUser({
      username: formData.username,
      name: formData.name,
      role: formData.role,
      email: formData.email || `${formData.username}@netconfig.com`,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      status: "active",
      lastLogin: "刚刚",
      ip: "192.168.1.150",
    });
    setShowAddModal(false);
    setFormData({ username: "", name: "", role: "NETWORK_ENGINEER", email: "", password: "" });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onEditUser(editingUser);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">用户与角色权限管理</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            配置系统用户账号、角色分配、细粒度功能权限矩阵与登录安全策略。确保分权制衡与账号安全。
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>添加新用户</span>
          </button>
        )}
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white border border-slate-100"
          }`}
        >
          用户列表 ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "permissions"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white border border-slate-100"
          }`}
        >
          角色与权限控制矩阵
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white border border-slate-100"
          }`}
        >
          账号密码与登录策略
        </button>
      </div>

      {/* View 1: Users List */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-between text-xs">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索用户名 / 姓名 / 邮箱..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl py-2 pl-9 pr-3 text-slate-800 text-xs focus:outline-none"
              />
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              共计 {filteredUsers.length} 个账户
            </span>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">用户信息</th>
                    <th className="py-3 px-4">分配角色</th>
                    <th className="py-3 px-4">账号状态</th>
                    <th className="py-3 px-4">最后登录时间</th>
                    <th className="py-3 px-4">登录 IP</th>
                    <th className="py-3 px-4 text-center">操作与状态冻结</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-100" />
                          <div>
                            <div className="font-bold text-slate-800">{u.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">@{u.username}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.role === "SUPER_ADMIN"
                              ? "bg-purple-50 text-purple-700 border border-purple-100"
                              : u.role === "NETWORK_ENGINEER"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              : u.role === "AUDITOR"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.role === "SUPER_ADMIN"
                            ? "超级管理员"
                            : u.role === "NETWORK_ENGINEER"
                            ? "运维工程师"
                            : u.role === "AUDITOR"
                            ? "安全审计员"
                            : "访客"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {u.status === "active" ? "正常启用" : "已冻结/禁用"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400">{u.lastLogin}</td>
                      <td className="py-3 px-4 font-mono text-indigo-600 font-semibold">{u.ip}</td>

                      <td className="py-3 px-4 text-center">
                        {isSuperAdmin && u.id !== currentUser?.id && (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="编辑信息"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onToggleUserStatus(u.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                u.status === "active"
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
                              }`}
                            >
                              {u.status === "active" ? "禁用账号" : "恢复解冻"}
                            </button>

                            <button
                              onClick={() => onDeleteUser(u.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Role Permissions Matrix */}
      {activeTab === "permissions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLE_PERMISSIONS.map((perm) => (
            <div
              key={perm.role}
              className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{perm.roleName}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{perm.role}</p>
                </div>
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">{perm.description}</p>

              <div className="space-y-1.5 text-xs pt-1">
                {Object.entries(perm.permissions).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="text-slate-700 font-medium">
                      {key === "deviceManage"
                        ? "设备编辑/维护"
                        : key === "deviceDelete"
                        ? "高危设备删除"
                        : key === "configEdit"
                        ? "模板编辑"
                        : key === "configApply"
                        ? "批量配置下发"
                        : key === "firmwareUpdate"
                        ? "固件升级与回滚"
                        : key === "userManage"
                        ? "用户账户管理"
                        : "审计日志核查"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        value ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {value ? "允许 (Allow)" : "禁止 (Deny)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 3: System Settings */}
      {activeTab === "settings" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4 max-w-xl text-xs">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>安全策略与密码规则控制</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">最小密码长度</label>
              <input
                type="number"
                value={sysSettings.minPasswordLength}
                onChange={(e) => setSysSettings({ ...sysSettings, minPasswordLength: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">会话超时时间 (分钟)</label>
              <input
                type="number"
                value={sysSettings.sessionTimeoutMinutes}
                onChange={(e) => setSysSettings({ ...sysSettings, sessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-slate-700 font-medium">强制包含特殊字符与数字</span>
              <input
                type="checkbox"
                checked={sysSettings.requireSpecialChar}
                onChange={(e) => setSysSettings({ ...sysSettings, requireSpecialChar: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-0"
              />
            </div>

            <button
              onClick={() => alert("系统安全策略更新保存成功！")}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
            >
              保存策略修改
            </button>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>新增用户</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">登录账号 *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="例: engineer_wang"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">真实姓名 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 王强"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">分配系统角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="SUPER_ADMIN">超级管理员</option>
                  <option value="NETWORK_ENGINEER">运维工程师</option>
                  <option value="AUDITOR">安全审计员</option>
                  <option value="GUEST">访客观察员</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                >
                  提交新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-600" />
                <span>编辑用户信息</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">真实姓名</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">分配角色</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="SUPER_ADMIN">超级管理员</option>
                  <option value="NETWORK_ENGINEER">运维工程师</option>
                  <option value="AUDITOR">安全审计员</option>
                  <option value="GUEST">访客观察员</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                >
                  保存更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
