import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Intelligent Config Generator Endpoint
app.post("/api/ai/generate-config", async (req, res) => {
  try {
    const { deviceType, vendor, requirement, existingConfig } = req.body;
    const ai = getGeminiClient();

    const prompt = `你是一位专业的网络工程师兼网络安全专家。请根据以下要求生成标准、安全的网络设备配置CLI脚本或JSON配置模板。

设备类型：${deviceType || "Router/Switch"}
厂商：${vendor || "Cisco / Huawei / H3C"}
用户配置需求：${requirement || "基础接口与VLAN配置"}
${existingConfig ? `现有配置参考：\n${existingConfig}` : ""}

请输出 JSON 格式，包含以下字段：
1. "templateName": 建议的模板名称
2. "description": 模板功能说明
3. "vendor": 适用于哪家厂商
4. "cliCommands": 标准命令行配置内容（分行 CLI 代码）
5. "securityNotes": 安全与优化注意事项说明`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json({ success: true, result: JSON.parse(response.text || "{}") });
  } catch (error: any) {
    console.error("AI Config Generation Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI configuration",
    });
  }
});

// AI Device Status Diagnosis & Optimization Suggestion
app.post("/api/ai/diagnose-device", async (req, res) => {
  try {
    const { deviceName, model, ip, status, cpuUsage, memoryUsage, trafficMetrics, logs } = req.body;
    const ai = getGeminiClient();

    const prompt = `分析网络设备运行状态并提供专业的故障排除与性能优化建议：

设备名称：${deviceName}
型号：${model}
IP地址：${ip}
当前状态：${status}
CPU利用率：${cpuUsage}%
内存利用率：${memoryUsage}%
流量与丢包指标：${JSON.stringify(trafficMetrics || {})}
近期相关事件日志：${JSON.stringify(logs || [])}

请返回 JSON 格式：
1. "healthScore": 0-100 健康度评分
2. "statusSummary": 总结设备当前健康状况
3. "risks": [潜在风险与异常点]
4. "recommendations": [具体的优化与排错修复建议]
5. "securityAdvice": 安全防护与固件更新建议`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json({ success: true, result: JSON.parse(response.text || "{}") });
  } catch (error: any) {
    console.error("AI Diagnosis Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze device health",
    });
  }
});

// AI Audit Log Analysis
app.post("/api/ai/audit-report", async (req, res) => {
  try {
    const { auditLogs } = req.body;
    const ai = getGeminiClient();

    const prompt = `请对以下系统审计日志进行安全与合规性审查分析，并生成摘要报告：

审计日志数据：
${JSON.stringify(auditLogs, null, 2)}

请返回 JSON 格式：
1. "summary": 总体操作审计概况
2. "highRiskEvents": 高风险事件列表及威胁等级
3. "complianceStatus": 合规性状态评估
4. "actionableInsights": 给运维团队的安全策略优化建议`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json({ success: true, result: JSON.parse(response.text || "{}") });
  } catch (error: any) {
    console.error("AI Audit Analysis Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze audit logs",
    });
  }
});

// Start Express / Vite Integration
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

main();
