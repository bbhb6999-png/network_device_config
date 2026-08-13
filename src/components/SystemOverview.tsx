import React from "react";
import { Device, ConfigTemplate, EventLog, AuditLog, DeviceGroup } from "../types";
import {
  Server,
  Activity,
  FileCode,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface SystemOverviewProps {
  devices: Device[];
  templates: ConfigTemplate[];
  eventLogs: EventLog[];
  auditLogs: AuditLog[];
  groups: DeviceGroup[];
  onNavigate: (tab: any) => void;
  onOpenAiDiagnosis: (device: Device) => void;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({
  devices,
  templates,
  eventLogs,
  auditLogs,
  groups,
  onNavigate,
  onOpenAiDiagnosis,
}) => {
  const totalDevices = devices.length;
  const onlineCount = devices.filter((d) => d.status === "online").length;
  const warningCount = devices.filter((d) => d.status === "warning").length;
  const faultCount = devices.filter((d) => d.status === "fault" || d.status === "offline").length;
  const onlineRate = totalDevices > 0 ? Math.round((onlineCount / totalDevices) * 100) : 0;

  const pendingConfigs = devices.filter((d) => d.configStatus === "pending" || d.configStatus === "failed").length;
  const criticalEvents = eventLogs.filter((e) => e.level === "critical" && !e.resolved).length;

  const avgCpu = Math.round(
    devices.reduce((acc, curr) => acc + curr.cpuUsage, 0) / (totalDevices || 1)
  );

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">活跃设备总数</p>
          <div className="flex items-end justify-between">
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold tracking-tight text-slate-800">{totalDevices}</span>
              <span className="text-emerald-500 text-sm font-medium">+{onlineRate}% 在线</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">平均响应时延</p>
          <div className="flex items-end justify-between">
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold tracking-tight text-slate-800">12ms</span>
              <span className="text-blue-500 text-sm font-medium">稳定</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">待更新固件 / 配置</p>
          <div className="flex items-end justify-between">
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold tracking-tight text-amber-500">{pendingConfigs}</span>
              <span className="text-slate-400 text-xs">/ {totalDevices}台</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">未解决严重事件</p>
          <div className="flex items-end justify-between">
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold tracking-tight text-rose-600">{criticalEvents}</span>
              <span className="text-slate-400 text-xs">{faultCount > 0 ? `${faultCount}台异常` : "运行安全"}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Traffic Monitor & Smart Optimization Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Realtime Traffic Monitoring Bar Visual */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <div>
              <h2 className="font-bold text-slate-800 text-base">全网实时流量监测与拓扑指标</h2>
              <p className="text-xs text-slate-400 mt-0.5">24小时实时数据与核心节点吞吐量</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">过去24小时</span>
              <button
                onClick={() => onNavigate("monitoring")}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all"
              >
                深入监控 →
              </button>
            </div>
          </div>

          <div className="h-44 flex items-end space-x-3 pt-4 px-2">
            <div className="flex-1 bg-indigo-100 rounded-t-lg transition-all hover:bg-indigo-200" style={{ height: "40%" }} title="02:00 - 40%"></div>
            <div className="flex-1 bg-indigo-200 rounded-t-lg transition-all hover:bg-indigo-300" style={{ height: "55%" }} title="04:00 - 55%"></div>
            <div className="flex-1 bg-indigo-300 rounded-t-lg transition-all hover:bg-indigo-400" style={{ height: "75%" }} title="06:00 - 75%"></div>
            <div className="flex-1 bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600" style={{ height: "60%" }} title="08:00 - 60%"></div>
            <div className="flex-1 bg-indigo-400 rounded-t-lg transition-all hover:bg-indigo-500" style={{ height: "85%" }} title="10:00 - 85%"></div>
            <div className="flex-1 bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-700 shadow-sm" style={{ height: "95%" }} title="12:00 - 95%"></div>
            <div className="flex-1 bg-indigo-200 rounded-t-lg transition-all hover:bg-indigo-300" style={{ height: "45%" }} title="14:00 - 45%"></div>
            <div className="flex-1 bg-indigo-300 rounded-t-lg transition-all hover:bg-indigo-400" style={{ height: "35%" }} title="16:00 - 35%"></div>
            <div className="flex-1 bg-indigo-100 rounded-t-lg transition-all hover:bg-indigo-200" style={{ height: "25%" }} title="18:00 - 25%"></div>
            <div className="flex-1 bg-indigo-400 rounded-t-lg transition-all hover:bg-indigo-500" style={{ height: "50%" }} title="20:00 - 50%"></div>
          </div>

          {/* Quick core device health table */}
          <div className="pt-2">
            <h3 className="font-bold text-xs text-slate-700 mb-2">核心节点实时快照</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                  <tr>
                    <th className="py-2 px-3">设备名称</th>
                    <th className="py-2 px-3">IP 地址</th>
                    <th className="py-2 px-3">运行状态</th>
                    <th className="py-2 px-3">CPU利用率</th>
                    <th className="py-2 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {devices.slice(0, 4).map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-2 px-3 font-semibold text-slate-800">{d.name}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{d.ip}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === "online"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : d.status === "warning"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-rose-50 text-rose-700 border border-rose-200/60"
                        }`}>
                          {d.status === "online" ? "正常" : d.status === "warning" ? "预警" : "故障"}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-medium">{d.cpuUsage}%</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => onOpenAiDiagnosis(d)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> AI 诊断
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Smart Optimization Suggestions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col p-6">
          <h2 className="font-bold text-slate-800 text-base mb-4">智能优化建议</h2>
          <div className="space-y-4 flex-1">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs font-bold text-amber-800 mb-1">带宽瓶颈检测</p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                节点 CORE-SW-01 流量负载已达 85%，建议下发 QoS 队列平滑策略。
              </p>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <p className="text-xs font-bold text-indigo-800 mb-1">固件自动同步</p>
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                检测到 4 台边缘交换机仍处于旧版本，建议批量推送 V2.4.1 镜像升级。
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-xs font-bold text-emerald-800 mb-1">安全审计提醒</p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                本周合规报告已生成，包含 18 项配置变更记录，无高危未授权访问。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Audit Log Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-base">最近审计日志</h2>
          <button
            onClick={() => onNavigate("audit")}
            className="text-indigo-600 text-xs font-bold hover:underline"
          >
            查看全部日志
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
              <tr>
                <th className="px-6 py-3">时间</th>
                <th className="px-6 py-3">操作用户</th>
                <th className="px-6 py-3">操作类型</th>
                <th className="px-6 py-3">受影响设备</th>
                <th className="px-6 py-3 text-right">状态</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600 divide-y divide-slate-50">
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-6 py-3 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="px-6 py-3 font-bold text-slate-800">{log.operator}</td>
                  <td className="px-6 py-3">{log.actionType}</td>
                  <td className="px-6 py-3">{log.targetDevice}</td>
                  <td className="px-6 py-3 text-right font-bold text-emerald-600">
                    {log.status === "success" ? "成功" : "失败"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

