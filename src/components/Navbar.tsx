import React, { useState } from "react";
import { User } from "../types";
import {
  Shield,
  Bell,
  LogOut,
  HelpCircle,
  X,
  Lock,
  Search,
} from "lucide-react";

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenHelp: () => void;
  activeTabTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenHelp,
  activeTabTitle,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const mockNotifications = [
    { id: "n1", title: "高危告警: 无线控制器 CPU 突破 95%", text: "设备 HQ-WLAN-AC01 出现异常高负载", time: "10分钟前", level: "warning" },
    { id: "n2", title: "AI 配置生成完成", text: "华为 NetEngine OSPF/BGP 模板构建完毕", time: "1小时前", level: "info" },
    { id: "n3", title: "例行安全审计记录", text: "李华 导出了最近7天的系统操作审计报告", time: "昨天", level: "info" },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-30">
      {/* Left: Title & Status */}
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-slate-800">{activeTabTitle}</h1>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded uppercase tracking-wider">
          已连接
        </span>
      </div>

      {/* Right Actions, Search & User Profile */}
      <div className="flex items-center space-x-6">
        {/* Search bar */}
        <div className="relative hidden md:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索设备或日志..."
            className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all outline-none"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
        </div>

        {/* Manual Button */}
        <button
          onClick={onOpenHelp}
          className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
          title="打开系统操作手册"
        >
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span className="hidden sm:inline">操作手册</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all relative"
            title="通知中心"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-4 text-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="font-bold text-slate-800">系统告警与预警</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        {currentUser && (
          <div className="flex items-center space-x-3 border-l pl-6 border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                {currentUser.role === "SUPER_ADMIN"
                  ? "超级管理员"
                  : currentUser.role === "NETWORK_ENGINEER"
                  ? "网络运维工程师"
                  : currentUser.role === "AUDITOR"
                  ? "安全审计员"
                  : "观察员"}
              </p>
            </div>

            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500">
                {currentUser.name.charAt(0)}
              </div>
            )}

            {/* Logout Trigger */}
            <button
              onClick={() => setShowConfirmLogout(true)}
              className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in duration-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">确认注销登录？</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              注销会话将清理当前的临时凭证与操作会话，保护您的全网配置安全。
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowConfirmLogout(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all"
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

