import React, { useState } from "react";
import { Firmware, FirmwareUpdateLog, Device, VendorType, UserRole } from "../types";
import {
  HardDrive,
  Upload,
  Download,
  RefreshCw,
  RotateCcw,
  GitCompare,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Play,
  X,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";

interface FirmwareManagementProps {
  firmwares: Firmware[];
  firmwareLogs: FirmwareUpdateLog[];
  devices: Device[];
  userRole: UserRole;
  onAddFirmware: (firmware: Omit<Firmware, "id">) => void;
  onUpgradeDeviceFirmware: (deviceId: string, targetVersion: string) => void;
  onRollbackDeviceFirmware: (deviceId: string, previousVersion: string) => void;
}

export const FirmwareManagement: React.FC<FirmwareManagementProps> = ({
  firmwares,
  firmwareLogs,
  devices,
  userRole,
  onAddFirmware,
  onUpgradeDeviceFirmware,
  onRollbackDeviceFirmware,
}) => {
  const canOperate = userRole === "SUPER_ADMIN" || userRole === "NETWORK_ENGINEER";

  // Active Tab View: "firmwares" | "history" | "compare"
  const [activeSubTab, setActiveSubTab] = useState<"firmwares" | "history" | "compare">("firmwares");

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUpgradeWizard, setShowUpgradeWizard] = useState<Firmware | null>(null);

  // Upgrade Wizard States
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState(0);
  const [upgradeLogs, setUpgradeLogs] = useState<string[]>([]);

  // Rollback Modal
  const [rollbackDevice, setRollbackDevice] = useState<Device | null>(null);

  // Version Compare State
  const [compareV1, setCompareV1] = useState<string>(firmwares[0]?.id || "");
  const [compareV2, setCompareV2] = useState<string>(firmwares[1]?.id || "");

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    version: "V800R022C00",
    vendor: "Huawei" as VendorType,
    compatibleModels: ["NetEngine 8000 M14", "NetEngine 8000 F1A"],
    releaseDate: new Date().toISOString().slice(0, 10),
    fileSize: "910 MB",
    checksum: "SHA256: 9b2c8a7e1f43829...",
    status: "stable" as const,
    description: "最新增强特性版本，补齐OSPFv3安全套件",
    downloadUrl: "/firmware/HW_V800R022.bin",
    releaseNotesStr: "提高多路径转发吞吐量\n解决偶发网卡硬件掉线",
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFirmware({
      version: uploadData.version,
      vendor: uploadData.vendor,
      compatibleModels: uploadData.compatibleModels,
      releaseDate: uploadData.releaseDate,
      fileSize: uploadData.fileSize,
      checksum: uploadData.checksum,
      status: uploadData.status,
      description: uploadData.description,
      downloadUrl: uploadData.downloadUrl,
      releaseNotes: uploadData.releaseNotesStr.split("\n").filter((n) => n.trim().length > 0),
    });
    setShowUploadModal(false);
  };

  const handleExecuteUpgrade = () => {
    if (!selectedDeviceId || !showUpgradeWizard) return;
    setIsUpgrading(true);
    setUpgradeStep(1);
    setUpgradeLogs(["[1/4] 开始对目标设备执行预检：闪存可用空间 > 1.5GB (通过)"]);

    setTimeout(() => {
      setUpgradeStep(2);
      setUpgradeLogs((prev) => [...prev, `[2/4] 通过 TFTP/SFTP 协议安全上传固件二进制包 ${showUpgradeWizard.version}...`]);
    }, 1200);

    setTimeout(() => {
      setUpgradeStep(3);
      setUpgradeLogs((prev) => [...prev, `[3/4] 验证固件 SHA256 校验和 [${showUpgradeWizard.checksum.slice(0, 20)}...] ... 校验一致!`]);
    }, 2200);

    setTimeout(() => {
      setUpgradeStep(4);
      setUpgradeLogs((prev) => [...prev, `[4/4] 写入主固件 Boot ROM 引导项并重置引导顺序，重启设备成功！`]);
      setIsUpgrading(false);
      onUpgradeDeviceFirmware(selectedDeviceId, showUpgradeWizard.version);
    }, 3200);
  };

  const handleExecuteRollback = () => {
    if (!rollbackDevice) return;
    onRollbackDeviceFirmware(rollbackDevice.id, "V800R020C10");
    setRollbackDevice(null);
    alert("设备已成功执行平滑回滚镜像，恢复至上一稳定版本!");
  };

  const fw1 = firmwares.find((f) => f.id === compareV1) || firmwares[0];
  const fw2 = firmwares.find((f) => f.id === compareV2) || firmwares[1];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">固件版本管理</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            集中式控制全网设备固件版本。支持新版本固件上传、兼容性预检、自动化升级、一键平滑回滚与版本差异对比。
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canOperate && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>上传固件文件</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveSubTab("firmwares")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "firmwares"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white border border-slate-100"
          }`}
        >
          固件版本仓库 ({firmwares.length})
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "history"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white border border-slate-100"
          }`}
        >
          升级与回滚日志 ({firmwareLogs.length})
        </button>
        <button
          onClick={() => setActiveSubTab("compare")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "compare"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white border border-slate-100"
          }`}
        >
          版本功能差异对比
        </button>
      </div>

      {/* View 1: Firmware List */}
      {activeSubTab === "firmwares" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {firmwares.map((fw) => (
            <div
              key={fw.id}
              className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
                    {fw.vendor}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {fw.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-800 font-mono tracking-tight">
                  {fw.version}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">{fw.description}</p>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                  <div className="text-slate-500 font-semibold">兼容型号:</div>
                  <div className="text-slate-700 font-mono flex flex-wrap gap-1">
                    {fw.compatibleModels.map((m) => (
                      <span key={m} className="px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {fw.checksum}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">文件大小: {fw.fileSize}</span>

                <div className="flex items-center gap-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`开始安全下载固件文件: ${fw.version} (${fw.fileSize})`);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="下载固件备份"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {canOperate && (
                    <button
                      onClick={() => {
                        setShowUpgradeWizard(fw);
                        setUpgradeStep(0);
                        setUpgradeLogs([]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>下发升级</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 2: Update History Logs */}
      {activeSubTab === "history" && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">更新时间</th>
                  <th className="py-3 px-4">目标设备</th>
                  <th className="py-3 px-4">起始版本 → 目标版本</th>
                  <th className="py-3 px-4">升级结果</th>
                  <th className="py-3 px-4">操作员</th>
                  <th className="py-3 px-4">详细说明</th>
                  <th className="py-3 px-4 text-center">快捷操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {firmwareLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{log.deviceName}</div>
                      <div className="text-[10px] text-slate-400">{log.deviceModel}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-slate-400">{log.fromVersion}</span>
                      <span className="text-indigo-600 font-bold mx-1">→</span>
                      <span className="text-indigo-700 font-bold">{log.toVersion}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.status === "success"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : log.status === "failed"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {log.status === "success" ? "升级成功" : log.status === "failed" ? "升级失败" : "已回滚"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{log.operator}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs">{log.details}</td>
                    <td className="py-3 px-4 text-center">
                      {canOperate && (
                        <button
                          onClick={() => {
                            const targetDev = devices.find((d) => d.id === log.deviceId) || devices[0];
                            setRollbackDevice(targetDev);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 text-[10px] font-medium transition-all flex items-center gap-1 mx-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>一键回滚</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Version Compare */}
      {activeSubTab === "compare" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">对比基准版本 A</label>
              <select
                value={compareV1}
                onChange={(e) => setCompareV1(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800 font-mono"
              >
                {firmwares.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.version} ({f.vendor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">目标升级版本 B</label>
              <select
                value={compareV2}
                onChange={(e) => setCompareV2(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800 font-mono"
              >
                {firmwares.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.version} ({f.vendor})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Version A Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-indigo-700 font-mono text-sm">{fw1?.version}</span>
                <span className="text-[10px] text-slate-400">{fw1?.releaseDate}</span>
              </div>
              <p className="text-slate-600">{fw1?.description}</p>
              <div className="space-y-1">
                <div className="font-semibold text-slate-500">特性与修补补丁:</div>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {fw1?.releaseNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Version B Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-indigo-700 font-mono text-sm">{fw2?.version}</span>
                <span className="text-[10px] text-slate-400">{fw2?.releaseDate}</span>
              </div>
              <p className="text-slate-600">{fw2?.description}</p>
              <div className="space-y-1">
                <div className="font-semibold text-slate-500">特性与修补补丁:</div>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {fw2?.releaseNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Wizard Modal */}
      {showUpgradeWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <span>固件平滑升级向导 - {showUpgradeWizard.version}</span>
              </h3>
              <button onClick={() => setShowUpgradeWizard(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">选择待升级的目标硬件设备</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="">-- 请选择匹配厂商的设备 --</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.ip}) - 当前版本: {d.firmwareVersion}
                    </option>
                  ))}
                </select>
              </div>

              {upgradeLogs.length > 0 && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 font-mono text-[11px] max-h-36 overflow-y-auto">
                  {upgradeLogs.map((log, i) => (
                    <div key={i} className="text-emerald-400">
                      {log}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowUpgradeWizard(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200"
                >
                  关闭
                </button>
                <button
                  onClick={handleExecuteUpgrade}
                  disabled={isUpgrading || !selectedDeviceId}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpgrading ? (
                    <>
                      <span className="inline-block animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                      <span>正在升级...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>开始升级流程</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Confirm Modal */}
      {rollbackDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">确认对该设备执行固件回滚？</h3>
            <p className="text-xs text-slate-500">
              设备 <strong className="text-indigo-600">{rollbackDevice.name}</strong> 将恢复至上一稳定镜像版本 (V800R020C10)。
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRollbackDevice(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={handleExecuteRollback}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
              >
                确认回滚
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Firmware Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>上传新版本固件</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">固件版本号 *</label>
                  <input
                    type="text"
                    required
                    value={uploadData.version}
                    onChange={(e) => setUploadData({ ...uploadData, version: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">厂商类别</label>
                  <select
                    value={uploadData.vendor}
                    onChange={(e) => setUploadData({ ...uploadData, vendor: e.target.value as VendorType })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Huawei">华为 (Huawei)</option>
                    <option value="Cisco">思科 (Cisco)</option>
                    <option value="H3C">华三 (H3C)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">更新补丁说明 (分行书写)</label>
                <textarea
                  rows={3}
                  value={uploadData.releaseNotesStr}
                  onChange={(e) => setUploadData({ ...uploadData, releaseNotesStr: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                >
                  上传固件
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
