import React, { useState, useEffect } from "react";
import { User } from "../types";
import { INITIAL_USERS } from "../data/mockData";
import {
  Server,
  Lock,
  User as UserIcon,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface LoginPageProps {
  onLogin?: (user: User) => void;
  onLoginSuccess?: (user: User) => void;
  users?: User[];
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onLoginSuccess,
  users = INITIAL_USERS,
}) => {
  const userList = users && users.length > 0 ? users : INITIAL_USERS;
  const [selectedUsername, setSelectedUsername] = useState(userList[0]?.username || "admin");
  const [password, setPassword] = useState("Admin@2026!");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginCallback = onLogin || onLoginSuccess || (() => {});

  // Update selectedUsername if userList changes
  useEffect(() => {
    if (!userList.some((u) => u.username === selectedUsername)) {
      setSelectedUsername(userList[0]?.username || "admin");
    }
  }, [userList, selectedUsername]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    setTimeout(() => {
      const foundUser = userList.find(
        (u) => u.username.toLowerCase() === selectedUsername.trim().toLowerCase()
      );

      if (foundUser) {
        if (foundUser.status === "disabled") {
          setErrorMsg("该账号已被冻结/禁用，请联系超级管理员解冻");
          setIsSubmitting(false);
          return;
        }
        setIsSubmitting(false);
        loginCallback(foundUser);
      } else {
        setErrorMsg("所选账号不存在或密码不匹配，请核对后重试");
        setIsSubmitting(false);
      }
    }, 400);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "超级管理员";
      case "NETWORK_ENGINEER":
        return "运维工程师";
      case "AUDITOR":
        return "安全审计员";
      case "GUEST":
        return "访客观察员";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle decorative background gradient */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 relative z-10">
        {/* Logo & Heading */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-600/20 text-white">
            <Server className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mb-1.5">
            网络设备智能配置平台
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            企业级网络自动化配置、设备监控与安全管控系统
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              登录账号
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedUsername}
                onChange={(e) => {
                  setSelectedUsername(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 pl-10 pr-8 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer appearance-none"
              >
                {userList.map((user) => (
                  <option key={user.id} value={user.username}>
                    {user.name} (@{user.username}) - {getRoleLabel(user.role)}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              登录口令 / 密码
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="请输入登录密码"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-6"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <>
                <span>安全登录系统</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <p className="text-[10px] text-slate-400 text-center mt-8 pt-4 border-t border-slate-100">
          © 2026 网络设备智能配置平台. 保留所有权利.
        </p>
      </div>
    </div>
  );
};
