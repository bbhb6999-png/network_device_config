import React, { useState, useEffect } from "react";
import { Device } from "../types";
import { Sparkles, Activity, ShieldCheck, AlertTriangle, CheckCircle2, X, RefreshCw, Cpu, HardDrive } from "lucide-react";

interface AiDiagnosisModalProps {
  device: Device | null;
  onClose: () => void;
}

export const AiDiagnosisModal: React.FC<AiDiagnosisModalProps> = ({ device, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState<any>(null);

  useEffect(() => {
    if (!device) return;
    runDiagnosis();
  }, [device]);

  const runDiagnosis = async () => {
    if (!device) return;
    setLoading(true);
    setDiagnosis(null);

    try {
      const res = await fetch("/api/ai/diagnose-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device }),
      });
      const data = await res.json();
      if (data.success) {
        setDiagnosis(data.diagnosis);
      } else {
        alert("AI 诊断处理超时: " + data.error);
      }
    } catch (e: any) {
      alert("网络请求失败: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!device) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gemini AI 设备深度健康诊断</h3>
              <p className="text-xs text-slate-400 font-mono">
                {device.name} ({device.ip}) - {device.vendor} {device.model}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-4">
            <span className="inline-block animate-spin w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full"></span>
            <p className="text-xs text-slate-300">
              Gemini AI 正分析 CPU/内存指标、端口收发流量、拓扑路由表及 Syslog 日志...
            </p>
          </div>
        ) : diagnosis ? (
          <div className="space-y-4 text-xs">
            {/* Score Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-400 font-medium">综合运行健康度评级</div>
                <div className="text-lg font-bold text-slate-100 mt-1">{diagnosis.overallHealth}</div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">得分</span>
                <div
                  className={`text-2xl font-extrabold font-mono ${
                    diagnosis.healthScore >= 85
                      ? "text-emerald-400"
                      : diagnosis.healthScore >= 60
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {diagnosis.healthScore} / 100
                </div>
              </div>
            </div>

            {/* Identified Issues */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                智能识别出的性能瓶颈与潜在隐患:
              </span>
              <ul className="space-y-1.5 text-slate-300 pt-1">
                {diagnosis.identifiedIssues?.map((issue: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                AI 专家针对性修复与优化方案:
              </span>
              <ul className="space-y-1.5 text-slate-300 pt-1">
                {diagnosis.recommendedActions?.map((action: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={runDiagnosis}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重新诊断</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20"
          >
            关闭诊断
          </button>
        </div>
      </div>
    </div>
  );
};
