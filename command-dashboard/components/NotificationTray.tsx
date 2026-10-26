"use client";

import React, { useState } from "react";
import {
  Bell,
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Bot,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export interface NotificationItem {
  id: string;
  timestamp: string;
  type: "CRITICAL" | "SUCCESS" | "INFO";
  title: string;
  message: string;
  source: string;
  actionType?: "OPEN_BOLO" | "OPEN_WHATSAPP";
}

interface NotificationTrayProps {
  notifications: NotificationItem[];
  onOpenBoloYoung: () => void;
  onOpenWhatsApp?: () => void;
  onClearNotification: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationTray: React.FC<NotificationTrayProps> = ({
  notifications,
  onOpenBoloYoung,
  onOpenWhatsApp,
  onClearNotification,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const unreadCount = notifications.length;

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white shadow-md pointer-events-auto transition cursor-pointer flex items-center justify-center"
        title="BOLO Young Notification Tray"
      >
        <Bell className="w-4 h-4 text-amber-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white font-black text-[10px] flex items-center justify-center shadow-lg border border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notification Tray Drawer */}
      {isOpen && (
        <div className="fixed left-72 top-3.5 w-80 sm:w-96 bg-slate-900/98 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl z-[9999] p-4 text-slate-100 animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                BOLO Young Notifications
              </h4>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-[10px] text-slate-400 hover:text-slate-200 font-mono"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto space-y-2.5 pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <Sparkles className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
                <p>Notification tray is quiet.</p>
                <p className="text-[10px] text-slate-500 mt-0.5">BOLO Young will alert you on anomalies.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border text-xs transition relative ${
                    n.type === "CRITICAL"
                      ? "bg-red-950/30 border-red-500/40 text-red-200"
                      : n.type === "SUCCESS"
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                      : "bg-slate-950 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] flex items-center space-x-1.5">
                      {n.type === "CRITICAL" ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      ) : n.type === "SUCCESS" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span>{n.title}</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{n.timestamp}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">{n.message}</p>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500">{n.source}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          if (n.actionType === "OPEN_WHATSAPP" && onOpenWhatsApp) {
                            onOpenWhatsApp();
                          } else {
                            onOpenBoloYoung();
                          }
                        }}
                        className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                      >
                        <span>View Console</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onClearNotification(n.id)}
                        className="text-[9px] text-slate-400 hover:text-slate-200"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenBoloYoung();
              }}
              className="text-amber-400 font-bold hover:underline flex items-center space-x-1"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Full BOLO Console</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                window.open("/bolo-young", "BoloYoungC4iConsole", "width=1280,height=820");
              }}
              className="text-cyan-400 font-bold hover:underline flex items-center space-x-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Popout Window</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
