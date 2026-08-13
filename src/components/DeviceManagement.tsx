import React, { useState } from "react";
import { Device, DeviceStatus, DeviceType, VendorType, DeviceGroup, UserRole } from "../types";
import {
  Server,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Upload,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Layers,
  Sparkles,
  Info,
  X,
  FileSpreadsheet,
  HelpCircle,
  Activity,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface DeviceManagementProps {
  devices: Device[];
  groups: DeviceGroup[];
  userRole: UserRole;
  onAddDevice: (device: Omit<Device, "id">) => void;
  onEditDevice: (device: Device) => void;
  onDeleteDevice: (deviceId: string) => void;
  onImportDevices: (imported: Device[]) => void;
  onOpenAiDiagnosis: (device: Device) => void;
}

export const DeviceManagement: React.FC<DeviceManagementProps> = ({
  devices,
  groups,
  userRole,
  onAddDevice,
  onEditDevice,
  onDeleteDevice,
  onImportDevices,
  onOpenAiDiagnosis,
}) => {
  const canEdit = userRole === "SUPER_ADMIN" || userRole === "NETWORK_ENGINEER";
  const canDelete = userRole === "SUPER_ADMIN";

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedVendor, setSelectedVendor] = useState<string>("ALL");
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [selectedDeviceDetail, setSelectedDeviceDetail] = useState<Device | null>(null);
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");

  // New Device Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "Router" as DeviceType,
    vendor: "Huawei" as VendorType,
    model: "NetEngine 8000",
    ip: "10.0.0.100",
    mac: "00:11:22:33:44:55",
    location: "北京数据中心-机架A",
    status: "online" as DeviceStatus,
    group: groups[0]?.name || "核心数据中心 (DC-Core)",
    firmwareVersion: "V800R021",
    cpuUsage: 15,
    memoryUsage: 30,
    uptime: "1天 00小时",
    configStatus: "synced" as const,
    lastSyncTime: new Date().toISOString().replace("T", " ").substring(0, 19),
    portsCount: 24,
    activePorts: 12,
  });

  // Filter logic
  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ip.includes(searchTerm) ||
      d.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "ALL" || d.type === selectedType;
    const matchesStatus = selectedStatus === "ALL" || d.status === selectedStatus;
    const matchesVendor = selectedVendor === "ALL" || d.vendor === selectedVendor;
    const matchesGroup = selectedGroup === "ALL" || d.group === selectedGroup;

    return matchesSearch && matchesType && matchesStatus && matchesVendor && matchesGroup;
  });

  // Submit Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ip) return;
    onAddDevice(formData);
    setShowAddModal(false);
    resetForm();
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    onEditDevice(editingDevice);
    setEditingDevice(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Router",
      vendor: "Huawei",
      model: "NetEngine 8000",
      ip: "10.0.0.100",
      mac: "00:11:22:33:44:55",
      location: "北京数据中心-机架A",
      status: "online",
      group: groups[0]?.name || "核心数据中心 (DC-Core)",
      firmwareVersion: "V800R021",
      cpuUsage: 15,
      memoryUsage: 30,
      uptime: "1天 00小时",
      configStatus: "synced",
      lastSyncTime: new Date().toISOString().replace("T", " ").substring(0, 19),
      portsCount: 24,
      activePorts: 12,
    });
  };

  // Export CSV / JSON
  const handleExportCSV = () => {
    const headers = ["ID", "设备名称", "类型", "厂商", "型号", "IP地址", "MAC地址", "机房位置", "状态", "所属分组", "固件版本", "CPU利用率(%)", "内存利用率(%)"];
    const rows = filteredDevices.map((d) => [
      d.id,
      d.name,
      d.type,
      d.vendor,
      d.model,
      d.ip,
      d.mac,
      d.location,
      d.status,
      d.group,
      d.firmwareVersion,
      d.cpuUsage,
      d.memoryUsage,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `网络设备清单_导出_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredDevices, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `网络设备清单_导出_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Batch Import Submit
  const handleImportSubmit = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed)) {
        onImportDevices(parsed);
        setShowImportModal(false);
        setImportJsonText("");
      } else {
        alert("格式错误：请输入有效的 JSON 设备数组");
      }
    } catch (e) {
      alert("JSON 解析失败，请检查语法格式");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">设备清单管理</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            汇总与集中管理受控路由器、交换机、防火墙等关键网络节点。支持多维查询、导入导出及分组管理。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>新增设备</span>
            </button>
          )}

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>批量导入</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all flex items-center gap-1.5"
              title="导出 CSV 文件"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>导出 CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all flex items-center gap-1.5"
              title="导出 JSON 文件"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-condition Filter Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>高级组合检索与多维筛选</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            匹配记录: <strong className="text-indigo-600 font-bold">{filteredDevices.length}</strong> / {devices.length} 台
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索名称 / IP / 型号 / 位置..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Device Type Select */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">全部设备类型</option>
              <option value="Router">路由器 (Router)</option>
              <option value="Switch">交换机 (Switch)</option>
              <option value="Firewall">防火墙 (Firewall)</option>
              <option value="Wireless_AP">无线AC/AP (Wireless)</option>
              <option value="Load_Balancer">负载均衡器 (F5)</option>
              <option value="Gateway">接入网关 (Gateway)</option>
            </select>
          </div>

          {/* Status Select */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">全部运行状态</option>
              <option value="online">正常在线 (Online)</option>
              <option value="warning">性能预警 (Warning)</option>
              <option value="fault">故障告警 (Fault)</option>
              <option value="offline">设备离线 (Offline)</option>
            </select>
          </div>

          {/* Vendor Select */}
          <div>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">全部分组/厂商</option>
              <option value="Huawei">华为 (Huawei)</option>
              <option value="Cisco">思科 (Cisco)</option>
              <option value="H3C">华三 (H3C)</option>
              <option value="Ruijie">锐捷 (Ruijie)</option>
              <option value="F5">F5 Networks</option>
            </select>
          </div>

          {/* Group Select */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">全部分组</option>
              {groups.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
              <tr>
                <th className="py-3 px-4">设备名称 / 型号</th>
                <th className="py-3 px-4">类型 / 厂商</th>
                <th className="py-3 px-4">IP / MAC 地址</th>
                <th className="py-3 px-4">部署机房位置</th>
                <th className="py-3 px-4">运行状态</th>
                <th className="py-3 px-4">CPU / 内存利用率</th>
                <th className="py-3 px-4">配置同步</th>
                <th className="py-3 px-4 text-center">操作与诊断</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    未检索到符合条件的设备记录
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{device.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{device.model}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">{device.type}</div>
                      <span className="inline-block px-1.5 py-0.2 text-[10px] rounded bg-slate-100 text-slate-500 border border-slate-200">
                        {device.vendor}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="text-indigo-600 font-bold">{device.ip}</div>
                      <div className="text-[10px] text-slate-400">{device.mac}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{device.location}</div>
                      <div className="text-[10px] text-slate-400">{device.group}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          device.status === "online"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : device.status === "warning"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-rose-50 text-rose-700 border border-rose-200/60"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            device.status === "online"
                              ? "bg-emerald-500"
                              : device.status === "warning"
                              ? "bg-amber-500"
                              : "bg-rose-500 animate-ping"
                          }`}
                        ></span>
                        {device.status === "online"
                          ? "正常在线"
                          : device.status === "warning"
                          ? "性能预警"
                          : "故障/离线"}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              device.cpuUsage > 80 ? "bg-rose-500" : device.cpuUsage > 50 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${device.cpuUsage}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] text-slate-700 font-bold">{device.cpuUsage}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400">内存: {device.memoryUsage}%</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          device.configStatus === "synced"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            : device.configStatus === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        {device.configStatus === "synced"
                          ? "已同步"
                          : device.configStatus === "pending"
                          ? "待更新"
                          : "同步失败"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedDeviceDetail(device)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="查看设备详情与端口"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenAiDiagnosis(device)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 text-[10px] font-bold transition-all inline-flex items-center gap-1"
                          title="使用 Gemini AI 进行智能健康诊断"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>AI 诊断</span>
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => setEditingDevice(device)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="编辑设备基本信息"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => setDeletingDeviceId(device.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 transition-colors"
                            title="删除设备"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-xl w-full my-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>手动新增网络设备</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">设备名称 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例: Core-Router-02"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">IP 地址 *</label>
                  <input
                    type="text"
                    required
                    value={formData.ip}
                    onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                    placeholder="10.0.0.X"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">设备类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DeviceType })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Router">路由器 (Router)</option>
                    <option value="Switch">交换机 (Switch)</option>
                    <option value="Firewall">防火墙 (Firewall)</option>
                    <option value="Wireless_AP">无线AC/AP</option>
                    <option value="Load_Balancer">负载均衡器</option>
                    <option value="Gateway">接入网关</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">厂商品牌</label>
                  <select
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value as VendorType })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Huawei">华为 (Huawei)</option>
                    <option value="Cisco">思科 (Cisco)</option>
                    <option value="H3C">华三 (H3C)</option>
                    <option value="Ruijie">锐捷 (Ruijie)</option>
                    <option value="F5">F5 Networks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">硬件型号</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="例: Catalyst 9500"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">MAC 地址</label>
                  <input
                    type="text"
                    value={formData.mac}
                    onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">所属分组</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">机房/机架位置</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="例: 总部大楼5F-IT主机房"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  提交新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Device Modal */}
      {editingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-xl w-full my-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-600" />
                <span>编辑设备信息 - {editingDevice.name}</span>
              </h3>
              <button onClick={() => setEditingDevice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">设备名称</label>
                  <input
                    type="text"
                    required
                    value={editingDevice.name}
                    onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">IP 地址</label>
                  <input
                    type="text"
                    required
                    value={editingDevice.ip}
                    onChange={(e) => setEditingDevice({ ...editingDevice, ip: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">运行状态</label>
                  <select
                    value={editingDevice.status}
                    onChange={(e) => setEditingDevice({ ...editingDevice, status: e.target.value as DeviceStatus })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="online">正常在线 (online)</option>
                    <option value="warning">性能预警 (warning)</option>
                    <option value="fault">故障告警 (fault)</option>
                    <option value="offline">设备离线 (offline)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">所属分组</label>
                  <select
                    value={editingDevice.group}
                    onChange={(e) => setEditingDevice({ ...editingDevice, group: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">机房/物理位置</label>
                <input
                  type="text"
                  value={editingDevice.location}
                  onChange={(e) => setEditingDevice({ ...editingDevice, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDevice(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  保存更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Device Confirm */}
      {deletingDeviceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200/60">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">确认删除该设备记录？</h3>
            <p className="text-xs text-slate-500">
              此操作不可逆。删除后该设备将脱离智能配置控制台托管。
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingDeviceId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onDeleteDevice(deletingDeviceId);
                  setDeletingDeviceId(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Detail Drawer */}
      {selectedDeviceDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border-l border-slate-100 w-full max-w-md h-full p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">{selectedDeviceDetail.name}</h3>
                <p className="text-xs text-indigo-600 font-mono font-bold">{selectedDeviceDetail.ip}</p>
              </div>
              <button
                onClick={() => setSelectedDeviceDetail(null)}
                className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="text-slate-700 font-bold">硬件与软件概况</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>类型: <span className="text-slate-800 font-semibold">{selectedDeviceDetail.type}</span></div>
                  <div>厂商: <span className="text-slate-800 font-semibold">{selectedDeviceDetail.vendor}</span></div>
                  <div>型号: <span className="text-slate-800 font-semibold">{selectedDeviceDetail.model}</span></div>
                  <div>固件: <span className="text-indigo-600 font-mono font-bold">{selectedDeviceDetail.firmwareVersion}</span></div>
                  <div>MAC: <span className="text-slate-500 font-mono">{selectedDeviceDetail.mac}</span></div>
                  <div>运行时长: <span className="text-slate-700">{selectedDeviceDetail.uptime}</span></div>
                </div>
              </div>

              {selectedDeviceDetail.ports && selectedDeviceDetail.ports.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-slate-700 font-bold">核心物理接口状态</div>
                  <div className="space-y-1.5">
                    {selectedDeviceDetail.ports.map((port) => (
                      <div
                        key={port.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200/60 flex items-center justify-between text-[11px]"
                      >
                        <div className="font-mono text-slate-800 font-semibold">{port.name}</div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              port.status === "up" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {port.status.toUpperCase()}
                          </span>
                          <span className="text-slate-400 font-mono">Rx: {port.trafficRx}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  const dev = selectedDeviceDetail;
                  setSelectedDeviceDetail(null);
                  onOpenAiDiagnosis(dev);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>发起 Gemini AI 深度健康诊查</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>批量导入设备数据 (JSON)</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              请粘贴符合规范的设备对象 JSON 数组文本，格式如下：
            </p>

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder={`[
  {
    "name": "Branch-Switch-01",
    "type": "Switch",
    "vendor": "Huawei",
    "model": "S5735-L",
    "ip": "10.4.0.1",
    "mac": "00:11:22:33:44:99",
    "location": "广州分公司",
    "status": "online",
    "group": "分支机构接入 (Branch-Access)"
  }
]`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-indigo-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
