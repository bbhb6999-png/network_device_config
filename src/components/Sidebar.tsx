import React from "react";
import {
  Server,
  FileCode,
  HardDrive,
  Activity,
  Users,
  ShieldCheck,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";

export type NavTab =
  | "overview"
  | "devices"
  | "templates"
  | "firmware"
  | "monitoring"
  | "users"
  | "audit"
  | "help";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const menuItems = [
    {
      id: "overview" as NavTab,
      label: "控制面板",
      icon: LayoutDashboard,
    },
    {
      id: "devices" as NavTab,
      label: "设备清单管理",
      icon: Server,
    },
    {
      id: "templates" as NavTab,
      label: "配置模板库",
      icon: FileCode,
    },
    {
      id: "firmware" as NavTab,
      label: "固件版本控制",
      icon: HardDrive,
    },
    {
      id: "monitoring" as NavTab,
      label: "实时网络监控",
      icon: Activity,
    },
    {
      id: "users" as NavTab,
      label: "用户权限管理",
      icon: Users,
    },
    {
      id: "audit" as NavTab,
      label: "系统审计日志",
      icon: ShieldCheck,
    },
    {
      id: "help" as NavTab,
      label: "系统操作手册",
      icon: HelpCircle,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-full text-slate-300 shrink-0">
      {/* Brand Header */}
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">NP</span>
        </div>
        <span className="font-bold text-white text-lg tracking-tight">智能配置平台</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-left ${
                isActive
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Security Alert Box */}
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center space-x-3 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0"></div>
          <span className="text-xs text-red-400 font-medium truncate">2个高危安全预警</span>
        </div>
      </div>
    </aside>
  );
};

