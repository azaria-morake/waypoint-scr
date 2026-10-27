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
    <div style={{ position: "relative" }}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="quick"
        style={{
          padding: "6px 10px",
          position: "relative",
          borderColor: unreadCount > 0 ? "var(--red)" : "#555750",
          color: unreadCount > 0 ? "var(--red)" : "#181816",
        }}
        title="BOLO Young Notification Tray"
      >
        <Bell size={16} style={{ color: unreadCount > 0 ? "var(--red)" : "#181816" }} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              minWidth: "18px",
              height: "18px",
              padding: "0 3px",
              background: "var(--red)",
              color: "#fff",
              borderRadius: "9px",
              fontSize: "11px",
              fontWeight: 900,
              display: "grid",
              placeItems: "center",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notification Tray Drawer */}
      {isOpen && (
        <div
          className="panel"
          style={{
            position: "absolute",
            right: 0,
            top: "42px",
            width: "380px",
            maxHeight: "500px",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            border: "1.5px solid #75776f",
            background: "#0c1012",
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
          }}
        >
          <div className="panel-header" style={{ padding: "10px 14px" }}>
            <div className="panel-title" style={{ fontSize: "14px" }}>
              <Bell size={15} style={{ color: "var(--amber)" }} />
              <span style={{ fontSize: "13px", fontWeight: 700 }}>TACTICAL NOTIFICATIONS</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  style={{ background: "transparent", border: 0, color: "var(--muted)", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                  CLEAR ALL
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: "transparent", border: 0, color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "28px", textAlign: "center", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "13px", color: "var(--muted)" }}>
                No active tactical dispatches. Sector is quiet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    border: "1px solid #3c403d",
                    borderLeft: `3px solid ${n.type === "CRITICAL" ? "var(--red)" : n.type === "SUCCESS" ? "var(--green)" : "var(--cyan)"}`,
                    padding: "10px 12px",
                    background: "#101415",
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className={`status-pill ${n.type === "CRITICAL" ? "red" : n.type === "SUCCESS" ? "green" : "blue"}`} style={{ padding: "2px 7px", fontSize: "11px" }}>
                      {n.type}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>{n.timestamp}</span>
                  </div>

                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginTop: "6px" }}>
                    {n.title}
                  </div>
                  <p style={{ margin: "4px 0 8px", fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
                    {n.message}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "1px solid #282c2a" }}>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>{n.source}</span>
                    {n.actionType === "OPEN_BOLO" && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenBoloYoung();
                          setIsOpen(false);
                        }}
                        className="quick"
                        style={{ padding: "4px 8px", fontSize: "11px", fontWeight: 600 }}
                      >
                        <span>VIEW DISPATCH</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
