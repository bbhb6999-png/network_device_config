import React, { useState } from "react";
import {
  User,
  Device,
  ConfigTemplate,
  Firmware,
  FirmwareUpdateLog,
  EventLog,
  AuditLog,
  DeviceGroup,
} from "./types";
import {
  INITIAL_USERS,
  INITIAL_DEVICES,
  INITIAL_TEMPLATES,
  INITIAL_FIRMWARES,
  INITIAL_FIRMWARE_LOGS,
  INITIAL_EVENT_LOGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_GROUPS,
  INITIAL_NOTIFICATIONS,
} from "./data/mockData";

import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { LoginPage } from "./components/LoginPage";
import { SystemOverview } from "./components/SystemOverview";
import { DeviceManagement } from "./components/DeviceManagement";
import { TemplateManagement } from "./components/TemplateManagement";
import { FirmwareManagement } from "./components/FirmwareManagement";
import { NetworkMonitoring } from "./components/NetworkMonitoring";
import { UserManagement } from "./components/UserManagement";
import { AuditLogs } from "./components/AuditLogs";
import { AiDiagnosisModal } from "./components/AiDiagnosisModal";

export default function App() {
  // Current Authentication State (defaults to null to display login screen first)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Core Data States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [groups, setGroups] = useState<DeviceGroup[]>(INITIAL_GROUPS);
  const [templates, setTemplates] = useState<ConfigTemplate[]>(INITIAL_TEMPLATES);
  const [firmwares, setFirmwares] = useState<Firmware[]>(INITIAL_FIRMWARES);
  const [firmwareLogs, setFirmwareLogs] = useState<FirmwareUpdateLog[]>(INITIAL_FIRMWARE_LOGS);
  const [eventLogs, setEventLogs] = useState<EventLog[]>(INITIAL_EVENT_LOGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Global AI Diagnosis Modal Target State
  const [aiDiagnosisDevice, setAiDiagnosisDevice] = useState<Device | null>(null);

  // Helper to append audit log
  const addAuditRecord = (actionType: string, targetDevice: string, details: string, status: "success" | "failed" = "success") => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: "LOG-" + Math.floor(1000 + Math.random() * 9000),
      operator: currentUser.name,
      actionType,
      targetDevice,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      clientIp: currentUser.ip || "192.168.1.100",
      status,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Login handler
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab("overview");
    addAuditRecord("用户登录", "网络智能配置平台", `用户 ${user.name} (@${user.username}) 成功登录系统`);
  };

  // Logout handler
  const handleLogout = () => {
    if (currentUser) {
      addAuditRecord("用户登出", "网络智能配置平台", `用户 ${currentUser.name} 退出登录`);
    }
    setCurrentUser(null);
  };

  // Device Management Handlers
  const handleAddDevice = (deviceData: Omit<Device, "id">) => {
    const newId = "DEV-00" + (devices.length + 1);
    const newDevice: Device = { ...deviceData, id: newId };
    setDevices((prev) => [newDevice, ...prev]);
    addAuditRecord("设备新增", newDevice.name, `手动新增 ${newDevice.vendor} ${newDevice.model} 设备 (IP: ${newDevice.ip})`);
  };

  const handleEditDevice = (updated: Device) => {
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    addAuditRecord("设备修改", updated.name, `修改设备 ${updated.name} 基本参数及物理位置信息 (${updated.location})`);
  };

  const handleDeleteDevice = (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    if (target) {
      addAuditRecord("设备删除", target.name, `高危操作：从平台控制台中彻底抹除设备 ${target.name} (${target.ip})`, "success");
    }
  };

  const handleImportDevices = (imported: Device[]) => {
    const withIds = imported.map((d, i) => ({
      ...d,
      id: d.id || `DEV-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
    setDevices((prev) => [...withIds, ...prev]);
    addAuditRecord("设备批量导入", `${withIds.length} 台设备`, `通过 JSON 数据解析方式批量载入 ${withIds.length} 台设备节点`);
  };

  // Template Handlers
  const handleAddTemplate = (templateData: Omit<ConfigTemplate, "id">) => {
    const newTmpl: ConfigTemplate = {
      ...templateData,
      id: "T-" + Math.floor(1000 + Math.random() * 9000),
    };
    setTemplates((prev) => [newTmpl, ...prev]);
    addAuditRecord("模板新增", newTmpl.name, `创建针对 ${newTmpl.vendor} 设备的标准化配置模板: ${newTmpl.name}`);
  };

  const handleEditTemplate = (updated: ConfigTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    addAuditRecord("模板编辑", updated.name, `编辑配置模板 ${updated.name} 的命令行指令与参数变量`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const target = templates.find((t) => t.id === templateId);
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    if (target) {
      addAuditRecord("模板删除", target.name, `删除配置模板 ${target.name}`);
    }
  };

  const handleApplyTemplateToDevices = (
    template: ConfigTemplate,
    selectedDeviceIds: string[],
    varValues: Record<string, string>
  ) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (selectedDeviceIds.includes(d.id)) {
          return {
            ...d,
            configStatus: "synced",
            lastSyncTime: new Date().toISOString().replace("T", " ").substring(0, 19),
          };
        }
        return d;
      })
    );
    addAuditRecord(
      "配置下发",
      `${selectedDeviceIds.length} 台设备`,
      `应用模板 [${template.name}] 批量推送 CLI 脚本到目标设备: ${selectedDeviceIds.join(", ")}，参数: ${JSON.stringify(varValues)}`
    );
  };

  // Firmware Handlers
  const handleAddFirmware = (fwData: Omit<Firmware, "id">) => {
    const newFw: Firmware = {
      ...fwData,
      id: "FW-" + Math.floor(1000 + Math.random() * 9000),
    };
    setFirmwares((prev) => [newFw, ...prev]);
    addAuditRecord("固件上传", newFw.version, `上传 ${newFw.vendor} 硬件固件镜像包 (版本: ${newFw.version})`);
  };

  const handleUpgradeDeviceFirmware = (deviceId: string, targetVersion: string) => {
    const targetDev = devices.find((d) => d.id === deviceId);
    if (!targetDev) return;

    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, firmwareVersion: targetVersion } : d))
    );

    const newLog: FirmwareUpdateLog = {
      id: "LOG-FW-" + Math.floor(1000 + Math.random() * 9000),
      deviceId: targetDev.id,
      deviceName: targetDev.name,
      deviceModel: targetDev.model,
      fromVersion: targetDev.firmwareVersion,
      toVersion: targetVersion,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator: currentUser?.name || "管理员",
      status: "success",
      details: "全流程 TFTP 协议刷写镜像完成，重引导 BootROM 并通过 SHA256 校验",
    };
    setFirmwareLogs((prev) => [newLog, ...prev]);
    addAuditRecord("固件升级", targetDev.name, `设备固件平滑刷写由 ${targetDev.firmwareVersion} 升级至 ${targetVersion}`);
  };

  const handleRollbackDeviceFirmware = (deviceId: string, previousVersion: string) => {
    const targetDev = devices.find((d) => d.id === deviceId);
    if (!targetDev) return;

    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, firmwareVersion: previousVersion } : d))
    );

    const newLog: FirmwareUpdateLog = {
      id: "LOG-ROLLBACK-" + Math.floor(1000 + Math.random() * 9000),
      deviceId: targetDev.id,
      deviceName: targetDev.name,
      deviceModel: targetDev.model,
      fromVersion: targetDev.firmwareVersion,
      toVersion: previousVersion,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator: currentUser?.name || "管理员",
      status: "rolled_back",
      details: "设备由于异常触发一键平滑回滚策略，还原备份 Boot 镜像",
    };
    setFirmwareLogs((prev) => [newLog, ...prev]);
    addAuditRecord("固件回滚", targetDev.name, `一键执行设备固件回滚镜像还原，恢复版本: ${previousVersion}`);
  };

  // Event & Monitoring Handlers
  const handleResolveEvent = (eventId: string) => {
    setEventLogs((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, resolved: true } : e))
    );
  };

  const handleClearEventLogs = () => {
    setEventLogs([]);
    addAuditRecord("日志清理", "网络告警表", "清空历史网络实时告警事件记录");
  };

  // User Management Handlers
  const handleAddUser = (userData: Omit<User, "id">) => {
    const newUser: User = { ...userData, id: "U-00" + (users.length + 1) };
    setUsers((prev) => [...prev, newUser]);
    addAuditRecord("用户新增", newUser.username, `新建账户 ${newUser.name} (@${newUser.username})，赋予角色: ${newUser.role}`);
  };

  const handleEditUser = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    addAuditRecord("用户修改", updated.username, `修改账户 ${updated.name} 的系统角色与信息`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === "active" ? "disabled" : "active";
          addAuditRecord("账户冻结状态变更", u.username, `修改账户 ${u.name} 状态为: ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (target) {
      addAuditRecord("用户删除", target.username, `删除用户账户 ${target.name} (@${target.username})`);
    }
  };

  const handleClearAuditLogs = () => {
    setAuditLogs([]);
  };

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTabTitle={
          activeTab === "overview"
            ? "系统概览"
            : activeTab === "devices"
            ? "设备清单管理"
            : activeTab === "templates"
            ? "配置模板库"
            : activeTab === "firmware"
            ? "固件版本控制"
            : activeTab === "monitoring"
            ? "实时网络监控"
            : activeTab === "users"
            ? "用户权限管理"
            : "系统审计日志"
        }
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab as any} onTabChange={(tab) => setActiveTab(tab)} userRole={currentUser.role} />

        {/* Center Content View Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto min-w-0 bg-slate-50 space-y-6">
          {activeTab === "overview" && (
            <SystemOverview
              devices={devices}
              templates={templates}
              eventLogs={eventLogs}
              auditLogs={auditLogs}
              groups={groups}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAiDiagnosis={(device) => setAiDiagnosisDevice(device)}
            />
          )}

          {activeTab === "devices" && (
            <DeviceManagement
              devices={devices}
              groups={groups}
              userRole={currentUser.role}
              onAddDevice={handleAddDevice}
              onEditDevice={handleEditDevice}
              onDeleteDevice={handleDeleteDevice}
              onImportDevices={handleImportDevices}
              onOpenAiDiagnosis={(device) => setAiDiagnosisDevice(device)}
            />
          )}

          {activeTab === "templates" && (
            <TemplateManagement
              templates={templates}
              devices={devices}
              userRole={currentUser.role}
              onAddTemplate={handleAddTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onApplyTemplateToDevices={handleApplyTemplateToDevices}
            />
          )}

          {activeTab === "firmware" && (
            <FirmwareManagement
              firmwares={firmwares}
              firmwareLogs={firmwareLogs}
              devices={devices}
              userRole={currentUser.role}
              onAddFirmware={handleAddFirmware}
              onUpgradeDeviceFirmware={handleUpgradeDeviceFirmware}
              onRollbackDeviceFirmware={handleRollbackDeviceFirmware}
            />
          )}

          {activeTab === "monitoring" && (
            <NetworkMonitoring
              devices={devices}
              eventLogs={eventLogs}
              userRole={currentUser.role}
              onResolveEvent={handleResolveEvent}
              onClearLogs={handleClearEventLogs}
            />
          )}

          {activeTab === "users" && (
            currentUser.role === "SUPER_ADMIN" ? (
              <UserManagement
                users={users}
                currentUser={currentUser}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onToggleUserStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
              />
            ) : (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4 max-w-lg mx-auto mt-12">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-bold text-lg border border-rose-100">
                  !
                </div>
                <h3 className="text-base font-bold text-slate-800">访问受限</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  “用户权限管理”模块仅对系统超级管理员（SUPER_ADMIN）开放。当前账号权限不足。
                </p>
                <button
                  onClick={() => setActiveTab("overview")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  返回控制面板
                </button>
              </div>
            )
          )}

          {activeTab === "audit" && (
            <AuditLogs
              auditLogs={auditLogs}
              userRole={currentUser.role}
              onClearLogs={handleClearAuditLogs}
            />
          )}
        </main>
      </div>

      {/* Gemini AI Diagnosis Modal */}
      {aiDiagnosisDevice && (
        <AiDiagnosisModal
          device={aiDiagnosisDevice}
          onClose={() => setAiDiagnosisDevice(null)}
        />
      )}
    </div>
  );
}
