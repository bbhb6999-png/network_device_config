import React, { useState } from "react";
import { Device, EventLog, UserRole } from "../types";
import {
  Activity,
  Wifi,
  Radio,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  Layers,
  List,
  Grid,
  Zap,
  Server,
  Filter,
} from "lucide-react";

interface NetworkMonitoringProps {
  devices: Device[];
  eventLogs: EventLog[];
  userRole: UserRole;
  onResolveEvent: (eventId: string) => void;
  onClearLogs: () => void;
}

export const NetworkMonitoring: React.FC<NetworkMonitoringProps> = ({
  devices,
  eventLogs,
  userRole,
  onResolveEvent,
  onClearLogs,
}) => {
  const canDelete = userRole === "SUPER_ADMIN";

  // Active View Switch: "topology" | "charts" | "events"
  const [activeView, setActiveView] = useState<"topology" | "charts" | "events">("topology");
  const [eventFilter, setEventFilter] = useState<string>("ALL");

  // Simulated live traffic curve data
  const trafficPoints = [
    { time: "09:00", rx: 320, tx: 280, latency: 2.1 },
    { time: "09:05", rx: 410, tx: 350, latency: 2.4 },
    { time: "09:10", rx: 580, tx: 490, latency: 3.8 },
    { time: "09:15", rx: 890, tx: 720, latency: 8.5 },
    { time: "09:20", rx: 620, tx: 510, latency: 4.1 },
    { time: "09:25", rx: 450, tx: 390, latency: 2.8 },
    { time: "09:30", rx: 510, tx: 430, latency: 3.2 },
  ];

  const filteredEvents = eventLogs.filter((e) => {
    if (eventFilter === "ALL") return true;
    return e.level === eventFilter;
  });

  const handleExportMetricsReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalControlledDevices: devices.length,
        avgCpuUsage: Math.round(devices.reduce((a, b) => a + b.cpuUsage, 0) / devices.length),
        avgMemUsage: Math.round(devices.reduce((a, b) => a + b.memoryUsage, 0) / devices.length),
        activeEventsCount: eventLogs.filter((e) => !e.resolved).length,
      },
      devicesMetrics: devices.map((d) => ({
        id: d.id,
        name: d.name,
        ip: d.ip,
        status: d.status,
        cpu: `${d.cpuUsage}%`,
        mem: `${d.memoryUsage}%`,
      })),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `网络监控数据报告_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">网络实时监控</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            图形化感知全网网络流量、丢包率、Ping 响应延迟及网络拓扑结构。提供异常告警日志与指标报表导出。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMetricsReport}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>导出监控数据</span>
          </button>

          {canDelete && (
            <button
              onClick={() => {
                if (confirm("确认清空历史告警日志记录？")) {
                  onClearLogs();
                }
              }}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium border border-rose-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空日志</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">平均网络延迟 (Ping)</div>
            <div className="text-xl font-bold text-slate-800 font-mono mt-1">3.2 ms</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">极佳 (低于10ms)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">当前全网吞吐速率</div>
            <div className="text-xl font-bold text-slate-800 font-mono mt-1">1.42 Gbps</div>
            <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Rx: 780Mb / Tx: 640Mb</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">链路丢包率 (Packet Loss)</div>
            <div className="text-xl font-bold text-slate-800 font-mono mt-1">0.02 %</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">丢包率极低 (无网塞)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Wifi className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">带宽平均利用率</div>
            <div className="text-xl font-bold text-slate-800 font-mono mt-1">38.5 %</div>
            <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">主干容量充裕</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* View Switch Controls */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView("topology")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === "topology"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 bg-white border border-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>网络图形拓扑视图</span>
          </button>

          <button
            onClick={() => setActiveView("charts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === "charts"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 bg-white border border-slate-100"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>实时流量趋势图</span>
          </button>

          <button
            onClick={() => setActiveView("events")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === "events"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 bg-white border border-slate-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>事件与告警日志 ({eventLogs.filter((e) => !e.resolved).length})</span>
          </button>
        </div>
      </div>

      {/* View 1: SVG Interactive Network Topology */}
      {activeView === "topology" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>全网链路与节点拓扑结构 (可视化连线)</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> 正常在线</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> 预警</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400"></span> 离线/故障</span>
            </div>
          </div>

          {/* SVG Topology Diagram */}
          <div className="w-full h-80 bg-slate-950/80 rounded-xl border border-slate-800 relative flex items-center justify-center p-4">
            <svg className="w-full h-full absolute inset-0 pointer-events-none">
              {/* Lines connecting Core Router to Core Switches */}
              <line x1="50%" y1="20%" x2="25%" y2="50%" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
              <line x1="50%" y1="20%" x2="50%" y2="50%" stroke="#6366f1" strokeWidth="2" />
              <line x1="50%" y1="20%" x2="75%" y2="50%" stroke="#f59e0b" strokeWidth="2" />

              {/* Lines connecting Switches to Gateways/APs */}
              <line x1="25%" y1="50%" x2="20%" y2="80%" stroke="#10b981" strokeWidth="1.5" />
              <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#f43f5e" strokeWidth="1.5" />
              <line x1="75%" y1="50%" x2="80%" y2="80%" stroke="#64748b" strokeWidth="1.5" />
            </svg>

            {/* Core Layer Node */}
            <div className="absolute top-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-500/20">
                <Server className="w-6 h-6" />
              </div>
              <span className="mt-1 text-xs font-bold text-white">Core-Router-01</span>
              <span className="text-[9px] font-mono text-indigo-300">10.0.0.1</span>
            </div>

            {/* Aggregation Layer Nodes */}
            <div className="absolute top-[45%] left-[22%] -translate-x-1/2 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <span className="mt-1 text-xs font-semibold text-slate-200">HQ-Switch-Core-A</span>
              <span className="text-[9px] font-mono text-slate-400">10.0.1.10</span>
            </div>

            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <span className="mt-1 text-xs font-semibold text-amber-300">Border-FW-Master</span>
              <span className="text-[9px] font-mono text-amber-400">10.0.0.254</span>
            </div>

            <div className="absolute top-[45%] left-[78%] -translate-x-1/2 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-300 flex items-center justify-center shadow-md">
                <Server className="w-5 h-5" />
              </div>
              <span className="mt-1 text-xs font-semibold text-slate-300">DC-LoadBalancer</span>
              <span className="text-[9px] font-mono text-slate-400">10.0.0.50</span>
            </div>

            {/* Access Layer Nodes */}
            <div className="absolute bottom-[8%] left-[18%] -translate-x-1/2 flex flex-col items-center group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <span className="mt-1 text-[11px] text-slate-300">Branch-GW-Shanghai</span>
            </div>

            <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center animate-bounce">
                <Wifi className="w-4 h-4" />
              </div>
              <span className="mt-1 text-[11px] text-rose-400 font-bold">HQ-WLAN-AC01 (Fault)</span>
            </div>

            <div className="absolute bottom-[8%] left-[82%] -translate-x-1/2 flex flex-col items-center group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <span className="mt-1 text-[11px] text-slate-500">Branch-Shenzhen (Offline)</span>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Live Traffic Curves */}
      {activeView === "charts" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">全网流量 (Mbps) 与 Latency (ms) 实时采样折线图</span>
            <span className="text-[10px] text-slate-400 font-mono">采样间隔: 5秒</span>
          </div>

          <div className="space-y-3 text-xs">
            {trafficPoints.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-12 font-mono text-slate-400 text-[10px]">{p.time}</span>
                <div className="flex-1 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden flex">
                    <div className="bg-indigo-600 h-full" style={{ width: `${p.rx / 10}%` }}></div>
                    <div className="bg-blue-500 h-full" style={{ width: `${p.tx / 10}%` }}></div>
                  </div>
                  <span className="text-indigo-600 font-mono text-[10px] w-28 text-right font-bold">
                    Rx: {p.rx}M / Tx: {p.tx}M
                  </span>
                  <span className="text-slate-500 font-mono text-[10px] w-16 text-right font-medium">
                    {p.latency} ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: Alarm & Event Logs */}
      {activeView === "events" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold text-slate-600">级别筛选:</span>
              <button
                onClick={() => setEventFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${eventFilter === "ALL" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                全部 ({eventLogs.length})
              </button>
              <button
                onClick={() => setEventFilter("critical")}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${eventFilter === "critical" ? "bg-rose-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                严重告警
              </button>
              <button
                onClick={() => setEventFilter("warning")}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${eventFilter === "warning" ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                性能预警
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all text-xs ${
                  evt.resolved
                    ? "bg-slate-50 border-slate-200 text-slate-500"
                    : evt.level === "critical"
                    ? "bg-rose-50/80 border-rose-200/80 text-rose-900"
                    : "bg-amber-50/80 border-amber-200/80 text-amber-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      evt.level === "critical" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">{evt.title}</span>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">[{evt.deviceName}]</span>
                      <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                    </div>
                    <p className="text-slate-600">{evt.message}</p>
                  </div>
                </div>

                {!evt.resolved ? (
                  <button
                    onClick={() => onResolveEvent(evt.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shrink-0 cursor-pointer shadow-sm"
                  >
                    标记为已解决
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-mono font-bold shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 已消除
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
