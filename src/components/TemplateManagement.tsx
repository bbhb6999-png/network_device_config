import React, { useState } from "react";
import { ConfigTemplate, Device, VendorType, DeviceType, UserRole } from "../types";
import {
  FileCode,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Send,
  Sparkles,
  Download,
  Upload,
  Copy,
  Check,
  X,
  Play,
  Terminal,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface TemplateManagementProps {
  templates: ConfigTemplate[];
  devices: Device[];
  userRole: UserRole;
  onAddTemplate: (template: Omit<ConfigTemplate, "id">) => void;
  onEditTemplate: (template: ConfigTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onApplyTemplateToDevices: (template: ConfigTemplate, selectedDeviceIds: string[], varValues: Record<string, string>) => void;
}

export const TemplateManagement: React.FC<TemplateManagementProps> = ({
  templates,
  devices,
  userRole,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onApplyTemplateToDevices,
}) => {
  const canEdit = userRole === "SUPER_ADMIN" || userRole === "NETWORK_ENGINEER";

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string>("ALL");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ConfigTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ConfigTemplate | null>(null);
  const [applyTemplate, setApplyTemplate] = useState<ConfigTemplate | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // AI Generator Form
  const [aiVendor, setAiVendor] = useState<VendorType>("Huawei");
  const [aiDeviceType, setAiDeviceType] = useState<DeviceType>("Router");
  const [aiRequirement, setAiRequirement] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Apply Template States
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [applyLogs, setApplyLogs] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // New Template Form State
  const [formData, setFormData] = useState({
    name: "",
    vendor: "Huawei" as VendorType,
    deviceType: "Router" as DeviceType,
    description: "",
    status: "active" as const,
    version: "v1.0",
    author: "网络管理员",
    commands: "",
    variablesStr: "VLAN_ID, IP_ADDR, SUBNET_MASK",
  });

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = selectedVendor === "ALL" || t.vendor === selectedVendor;
    return matchesSearch && matchesVendor;
  });

  // Handle Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.commands) return;
    const variables = formData.variablesStr
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    onAddTemplate({
      name: formData.name,
      vendor: formData.vendor,
      deviceType: formData.deviceType,
      description: formData.description,
      createdDate: new Date().toISOString().slice(0, 10),
      updatedDate: new Date().toISOString().slice(0, 10),
      status: formData.status,
      version: formData.version,
      author: formData.author,
      commands: formData.commands,
      variables,
    });
    setShowAddModal(false);
  };

  // Handle AI Generator
  const handleGenerateAiConfig = async () => {
    if (!aiRequirement.trim()) return;
    setAiGenerating(true);
    setAiResult(null);

    try {
      const res = await fetch("/api/ai/generate-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor: aiVendor,
          deviceType: aiDeviceType,
          requirement: aiRequirement,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.result);
      } else {
        alert("AI 配置生成失败: " + data.error);
      }
    } catch (e: any) {
      alert("通信异常: " + e.message);
    } finally {
      setAiGenerating(false);
    }
  };

  // Save AI Result as New Template
  const handleSaveAiAsTemplate = () => {
    if (!aiResult) return;
    onAddTemplate({
      name: aiResult.templateName || "AI 生成" + aiVendor + "配置模板",
      vendor: aiVendor,
      deviceType: aiDeviceType,
      description: aiResult.description || aiRequirement,
      createdDate: new Date().toISOString().slice(0, 10),
      updatedDate: new Date().toISOString().slice(0, 10),
      status: "active",
      version: "v1.0-AI",
      author: "Gemini AI Engine",
      commands: aiResult.cliCommands || "",
      variables: ["IP_ADDR", "VLAN_ID"],
    });
    setShowAiModal(false);
    setAiResult(null);
  };

  // Start Apply Wizard
  const handleStartApply = (template: ConfigTemplate) => {
    setApplyTemplate(template);
    setSelectedDeviceIds([]);
    setIsApplying(false);
    setApplyLogs([]);
    const initialVars: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialVars[v] = "";
    });
    setVarValues(initialVars);
  };

  // Execute Apply Simulation
  const handleExecuteApply = () => {
    if (selectedDeviceIds.length === 0) {
      alert("请至少选择一台目标设备！");
      return;
    }
    setIsApplying(true);
    setApplyLogs(["[系统消息] 正在建立 SSH 智能下发通道..."]);

    setTimeout(() => {
      setApplyLogs((prev) => [...prev, `[准备阶段] 正在解析模板变量，获取变量列表: ${JSON.stringify(varValues)}`]);
    }, 600);

    setTimeout(() => {
      setApplyLogs((prev) => [...prev, `[校验阶段] 检查 ${selectedDeviceIds.length} 台设备的软件固件兼容性与闪存空间...`]);
    }, 1200);

    setTimeout(() => {
      setApplyLogs((prev) => [...prev, `[下发阶段] 正在逐条推送 CLI 命令脚本... 状态 100% OK`]);
    }, 2000);

    setTimeout(() => {
      setApplyLogs((prev) => [...prev, `[完成] 配置应用成功，已自动更新设备的配置同步状态 (synced)！`]);
      setIsApplying(false);
      onApplyTemplateToDevices(applyTemplate!, selectedDeviceIds, varValues);
    }, 2800);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">配置模板管理</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            定义、预置与重用标准化命令行配置。支持参数占位符替换、批量一键下发及 AI 自动化配置生成。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>AI 智能生成配置</span>
          </button>

          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>新建配置模板</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索模板名称 / 描述关键词..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">品牌筛选:</span>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">全部厂商</option>
            <option value="Huawei">华为 (Huawei)</option>
            <option value="Cisco">思科 (Cisco)</option>
            <option value="H3C">华三 (H3C)</option>
            <option value="Ruijie">锐捷 (Ruijie)</option>
            <option value="F5">F5 Networks</option>
          </select>
        </div>
      </div>

      {/* Template Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
                    {template.vendor} / {template.deviceType}
                  </span>
                  <h3 className="font-bold text-sm text-slate-800 mt-2 group-hover:text-indigo-600 transition-colors">
                    {template.name}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">
                  {template.version}
                </span>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {template.description}
              </p>

              {/* Variables List */}
              <div className="flex flex-wrap gap-1 pt-1">
                {template.variables.map((v) => (
                  <span
                    key={v}
                    className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Metadata & Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-[10px] text-slate-400">
                更新: <span className="font-mono text-slate-600">{template.updatedDate}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="预览命令行脚本"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {canEdit && (
                  <button
                    onClick={() => handleStartApply(template)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] shadow-sm flex items-center gap-1"
                    title="下发此模板到设备"
                  >
                    <Send className="w-3 h-3" />
                    <span>应用下发</span>
                  </button>
                )}

                {canEdit && (
                  <button
                    onClick={() => onDeleteTemplate(template.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 transition-colors"
                    title="删除模板"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Config Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-2xl w-full my-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Gemini AI 智能网络配置生成器</h3>
                  <p className="text-[11px] text-slate-500">使用自然语言需求自动生成符合生产标准的 CLI 命令</p>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">目标厂商</label>
                  <select
                    value={aiVendor}
                    onChange={(e) => setAiVendor(e.target.value as VendorType)}
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
                  <label className="block text-slate-700 font-semibold mb-1">设备类型</label>
                  <select
                    value={aiDeviceType}
                    onChange={(e) => setAiDeviceType(e.target.value as DeviceType)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Router">路由器 (Router)</option>
                    <option value="Switch">交换机 (Switch)</option>
                    <option value="Firewall">防火墙 (Firewall)</option>
                    <option value="Wireless_AP">无线AC/AP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  用自然语言输入您的网络配置需求
                </label>
                <textarea
                  rows={3}
                  value={aiRequirement}
                  onChange={(e) => setAiRequirement(e.target.value)}
                  placeholder="例如: 配置开启 OSPF 进程 100，区域 0 宣告 192.168.10.0/24 网段，并且开启 SSH v2 远程安全管理访问及 802.1Q VLAN 100..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-3 text-slate-800 placeholder-slate-400"
                />
              </div>

              <button
                onClick={handleGenerateAiConfig}
                disabled={aiGenerating || !aiRequirement.trim()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {aiGenerating ? (
                  <>
                    <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>AI 深度生成脚本中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>立即生成标准配置脚本</span>
                  </>
                )}
              </button>

              {aiResult && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700">{aiResult.templateName || "生成的 CLI 命令"}</span>
                    <button
                      onClick={() => copyToClipboard(aiResult.cliCommands)}
                      className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 font-medium text-xs"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? "已复制" : "复制"}</span>
                    </button>
                  </div>

                  <pre className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {aiResult.cliCommands}
                  </pre>

                  {aiResult.securityNotes && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                      <strong>安全提示:</strong> {aiResult.securityNotes}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={handleSaveAiAsTemplate}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                    >
                      保存为正式配置模板
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>模板预览 - {previewTemplate.name}</span>
              </h3>
              <button onClick={() => setPreviewTemplate(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto max-h-80 whitespace-pre-wrap leading-relaxed">
              {previewTemplate.commands}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Template Modal */}
      {applyTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-xl w-full my-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                <span>应用模板下发 - {applyTemplate.name}</span>
              </h3>
              <button onClick={() => setApplyTemplate(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select Target Devices */}
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  1. 选择目标应用设备 (已兼容 {applyTemplate.vendor})
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {devices.map((d) => (
                    <label
                      key={d.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:border-slate-300 cursor-pointer text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedDeviceIds.includes(d.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDeviceIds([...selectedDeviceIds, d.id]);
                            } else {
                              setSelectedDeviceIds(selectedDeviceIds.filter((id) => id !== d.id));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="font-semibold">{d.name}</span>
                        <span className="text-[10px] text-slate-400">({d.ip})</span>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">{d.vendor}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Input Variables */}
              {applyTemplate.variables.length > 0 && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    2. 设置变量占位符替换参数
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {applyTemplate.variables.map((v) => (
                      <div key={v}>
                        <label className="block text-[10px] font-mono text-slate-500 mb-0.5">{`{{${v}}}`}</label>
                        <input
                          type="text"
                          value={varValues[v] || ""}
                          onChange={(e) => setVarValues({ ...varValues, [v]: e.target.value })}
                          placeholder={`输入 ${v} 值`}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg p-2 text-slate-800 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execution Progress Logs */}
              {applyLogs.length > 0 && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 font-mono text-[11px] max-h-32 overflow-y-auto">
                  {applyLogs.map((log, idx) => (
                    <div key={idx} className="text-emerald-400">{log}</div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setApplyTemplate(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  onClick={handleExecuteApply}
                  disabled={isApplying || selectedDeviceIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isApplying ? (
                    <>
                      <span className="inline-block animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                      <span>正在下发...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>执行批量下发</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-xl w-full my-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>新建配置模板</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">模板名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 思科Cat9500核心交换机端口隔离模板"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">适用厂商</label>
                  <select
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value as VendorType })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Huawei">华为 (Huawei)</option>
                    <option value="Cisco">思科 (Cisco)</option>
                    <option value="H3C">华三 (H3C)</option>
                    <option value="Ruijie">锐捷 (Ruijie)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">设备类型</label>
                  <select
                    value={formData.deviceType}
                    onChange={(e) => setFormData({ ...formData, deviceType: e.target.value as DeviceType })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Router">路由器 (Router)</option>
                    <option value="Switch">交换机 (Switch)</option>
                    <option value="Firewall">防火墙 (Firewall)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">变量占位符 (逗号分隔)</label>
                <input
                  type="text"
                  value={formData.variablesStr}
                  onChange={(e) => setFormData({ ...formData, variablesStr: e.target.value })}
                  placeholder="例: VLAN_ID, IP_ADDR"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl p-2.5 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">CLI 命令行配置 *</label>
                <textarea
                  rows={6}
                  required
                  value={formData.commands}
                  onChange={(e) => setFormData({ ...formData, commands: e.target.value })}
                  placeholder={`sysname Router-01\nvlan {{VLAN_ID}}\ninterface GigabitEthernet0/0/1\n ip address {{IP_ADDR}} 255.255.255.0`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
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
                  保存创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
