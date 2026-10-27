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
        <Bell size={14} style={{ color: unreadCount > 0 ? "var(--red)" : "#181816" }} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              width: "16px",
              height: "16px",
              background: "var(--red)",
              color: "#fff",
              borderRadius: "50%",
              fontSize: "8px",
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
            width: "360px",
            maxHeight: "480px",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            border: "1.5px solid #75776f",
            background: "#0c1012",
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
          }}
        >
          <div className="panel-header" style={{ padding: "8px 12px" }}>
            <div className="panel-title">
              <Bell size={13} style={{ color: "var(--amber)" }} />
              <span style={{ fontSize: "10px" }}>TACTICAL NOTIFICATIONS</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  style={{ background: "transparent", border: 0, color: "var(--muted)", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", cursor: "pointer" }}
                >
                  CLEAR ALL
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: "transparent", border: 0, color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)" }}>
                No active tactical dispatches. Sector is quiet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    border: "1px solid #3c403d",
                    borderLeft: `3px solid ${n.type === "CRITICAL" ? "var(--red)" : n.type === "SUCCESS" ? "var(--green)" : "var(--cyan)"}`,
                    padding: "8px 10px",
                    background: "#101415",
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className={`status-pill ${n.type === "CRITICAL" ? "red" : n.type === "SUCCESS" ? "green" : "blue"}`} style={{ padding: "1px 5px", fontSize: "7px" }}>
                      {n.type}
                    </span>
                    <span style={{ fontSize: "7px", color: "var(--muted)" }}>{n.timestamp}</span>
                  </div>

                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                    {n.title}
                  </div>
                  <p style={{ margin: "2px 0 6px", fontSize: "9px", color: "var(--muted)", lineHeight: 1.4 }}>
                    {n.message}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px", borderTop: "1px solid #282c2a" }}>
                    <span style={{ fontSize: "8px", color: "var(--muted)" }}>{n.source}</span>
                    {n.actionType === "OPEN_BOLO" && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenBoloYoung();
                          setIsOpen(false);
                        }}
                        className="quick"
                        style={{ padding: "2px 6px", fontSize: "8px" }}
                      >
                        <span>VIEW DISPATCH</span>
                        <ArrowRight size={10} />
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
