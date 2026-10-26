"use client";

import React, { useState, useEffect } from "react";
import { Crosshair } from "lucide-react";
import { NotificationTray, NotificationItem } from "./NotificationTray";

interface BoloConsoleHeaderProps {
  notifications?: NotificationItem[];
  onOpenBoloYoung?: () => void;
  onClearNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  isWsConnected?: boolean;
}

export const BoloConsoleHeader: React.FC<BoloConsoleHeaderProps> = ({
  notifications = [],
  onOpenBoloYoung = () => {},
  onClearNotification = () => {},
  onClearAllNotifications = () => {},
  isWsConnected = true,
}) => {
  const [timeStr, setTimeStr] = useState<string>("OCT 26 2026  22:26");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const m = months[now.getMonth()];
      const d = String(now.getDate()).padStart(2, "0");
      const y = now.getFullYear();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setTimeStr(`${m} ${d} ${y}   ${hh}:${mm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <Crosshair size={39} strokeWidth={2.5} />
          <span />
        </div>

        <div className="brand-name">
          <h1>BOLO CONSOLE</h1>
          <div>
            TACTICAL AI GUARDIAN
            <span className="divider">|</span>
            SECTOR 2 CORRIDOR WATCHDOG
          </div>
        </div>
      </div>

      <div className="system-meta">
        <div className="system-status">
          <span />
          {isWsConnected ? "SYSTEM ONLINE" : "CONNECTING..."}
        </div>
        <div>{timeStr}</div>
      </div>

      <div className="hackathon">
        FNB AOTY HACKATHON 2026
        <br />
        ARTIFICIAL STAR
      </div>

      {/* Integrated Notification Tray */}
      <div style={{ marginLeft: "18px" }}>
        <NotificationTray
          notifications={notifications}
          onOpenBoloYoung={onOpenBoloYoung}
          onClearNotification={onClearNotification}
          onClearAll={onClearAllNotifications}
        />
      </div>
    </header>
  );
};
