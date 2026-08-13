import React, { useState } from "react";
import { AuditLog, UserRole } from "../types";
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Sparkles,
  ShieldAlert,
  Info,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Terminal,
} from "lucide-react";

interface AuditLogsProps {
  auditLogs: AuditLog[];
  userRole: UserRole;
  onClearLogs: () => void;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({
  auditLogs,
  userRole,
  onClearLogs,
}) => {
  const canClear = userRole === "SUPER_ADMIN" || userRole === "AUDITOR";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLog | null>(null);

  // AI Audit Analysis Modal State
  const [showAiReportModal, setShowAiReportModal] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAuditReport, setAiAuditReport] = useState<any>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const operator = log.operator || log.username || "系统";
    const target = log.targetDevice || log.target || "全网节点";
    const matchesSearch =
      operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === "ALL" || log.actionType === selectedAction;
    return matchesSearch && matchesAction;
  });

  // Export Audit CSV / JSON
  const handleExportCSV = () => {
    const headers = ["ID", "操作员", "动作类型", "目标设备", "操作时间", "客户端IP", "结果", "详细日志"];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.operator || l.username || "系统",
      l.actionType,
      l.targetDevice || l.target || "全网节点",
      l.timestamp,
      l.clientIp || l.ip || "127.0.0.1",
      l.status || "success",
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `网络平台审计日志_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run AI Security Audit Analysis
  const handleRunAiAudit = async () => {
    setShowAiReportModal(true);
    setAiAnalyzing(true);
    setAiAuditReport(null);

    try {
      const res = await fetch("/api/ai/audit-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: auditLogs }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAuditReport(data.report);
      } else {
        alert("AI 审计报告生成失败: " + data.error);
      }
    } catch (e: any) {
      alert("通信异常: " + e.message);
    } finally {
      setAiAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">操作审计日志</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            不可篡改的全量高危配置变更记录、登录事件与命令轨迹。支持防抵赖核查与 AI 智能安全风险穿透分析。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAiAudit}
            className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>AI 合规安全审计报告</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>导出 CSV</span>
          </button>

          {canClear && (
            <button
              onClick={() => {
                if (confirm("确认清空过期的审计日志？(建议保留备查)")) {
                  onClearLogs();
                }
              }}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium border border-rose-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清理历史</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="检索操作员 / 目标设备 / 配置指令..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl py-2 pl-9 pr-3 text-slate-800 text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">操作类型:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl py-2 px-3 text-slate-800 text-xs focus:outline-none"
          >
            <option value="ALL">全部动作类型</option>
            <option value="配置下发">配置下发 (Config)</option>
            <option value="固件升级">固件升级 (Upgrade)</option>
            <option value="设备删除">设备删除 (Delete)</option>
            <option value="用户登录">用户登录 (Login)</option>
          </select>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">操作时间</th>
                <th className="py-3 px-4">操作员</th>
                <th className="py-3 px-4">动作类别</th>
                <th className="py-3 px-4">目标受控设备</th>
                <th className="py-3 px-4">操作结果</th>
                <th className="py-3 px-4">客户端 IP</th>
                <th className="py-3 px-4">详细轨迹说明</th>
                <th className="py-3 px-4 text-center">详情</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{log.operator || log.username || "系统"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        log.actionType === "配置下发" || log.actionType === "APPLY_CONFIG"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          : log.actionType === "固件升级" || log.actionType === "FIRMWARE_UPGRADE"
                          ? "bg-purple-50 text-purple-700 border border-purple-100"
                          : log.actionType === "设备删除" || log.actionType === "DELETE"
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-indigo-600 font-bold">{log.targetDevice || log.target || "全网节点"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        log.status === "success" || !log.status
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}
                    >
                      {log.status === "failed" ? "失败/拒绝" : "成功"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{log.clientIp || log.ip || "127.0.0.1"}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{log.details}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedLogDetail(log)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      title="查看原始指令与上下文"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>审计日志命令明细 #{selectedLogDetail.id}</span>
              </h3>
              <button onClick={() => setSelectedLogDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>操作员: <span className="text-slate-900 font-bold">{selectedLogDetail.operator || selectedLogDetail.username || "系统"}</span></div>
                <div>时间: <span className="text-slate-500 font-mono">{selectedLogDetail.timestamp}</span></div>
                <div>目标设备: <span className="text-indigo-600 font-mono font-bold">{selectedLogDetail.targetDevice || selectedLogDetail.target || "全网节点"}</span></div>
                <div>来源 IP: <span className="text-slate-500 font-mono">{selectedLogDetail.clientIp || selectedLogDetail.ip || "127.0.0.1"}</span></div>
              </div>

              <div>
                <div className="font-semibold text-slate-600 mb-1">变更的 CLI 指令明细:</div>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                  {selectedLogDetail.details}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedLogDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Audit Analysis Modal */}
      {showAiReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-2xl w-full my-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-800">Gemini AI 智能安全与合规审计报告</h3>
              </div>
              <button onClick={() => setShowAiReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {aiAnalyzing ? (
              <div className="py-12 text-center space-y-3">
                <span className="inline-block animate-spin w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full"></span>
                <p className="text-xs text-slate-600">Gemini AI 正在穿透分析全量操作行为轨迹与高危命令模式...</p>
              </div>
            ) : aiAuditReport ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-700 font-semibold">总体安全态势评分</span>
                  <span className="text-lg font-extrabold text-emerald-600 font-mono">
                    {aiAuditReport.securityScore} / 100
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="font-bold text-indigo-700">审计摘要:</span>
                  <p className="text-slate-700 leading-relaxed">{aiAuditReport.summary}</p>
                </div>

                {aiAuditReport.unauthorizedAttempts && aiAuditReport.unauthorizedAttempts.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 space-y-2 text-rose-900">
                    <span className="font-bold flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      高危/未经授权的命令变动企图:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-[11px]">
                      {aiAuditReport.unauthorizedAttempts.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAuditReport.recommendations && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="font-bold text-emerald-700">合规优化改进建议:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {aiAuditReport.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAiReportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                关闭报告
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
