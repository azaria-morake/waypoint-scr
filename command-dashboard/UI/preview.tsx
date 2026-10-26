"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Car,
  ChevronRight,
  CircleDot,
  Crosshair,
  FileText,
  Gauge,
  Headphones,
  Layers,
  Lock,
  Map,
  MapPin,
  Menu,
  MessageSquare,
  Navigation,
  Radio,
  ScanLine,
  Send,
  Settings,
  Shield,
  Siren,
  Target,
  Users,
  Wifi,
  X,
  Zap,
} from "lucide-react";

const incidents = [
  {
    level: "HIGH",
    title: "POSSIBLE GBV - DISTRESS SIGNAL",
    location: "Katlehong, Gauteng",
    distance: "4.2 km",
    time: "22:23",
    detail: "Subject sent SOS via Waypoint. Audio stream active.",
  },
  {
    level: "MED",
    title: "SUSPICIOUS VEHICLE",
    location: "Vosloorus, Gauteng",
    distance: "7.8 km",
    time: "22:17",
    detail: "Plate: BZ 74 PL GP. Moving north. No units on scene.",
  },
  {
    level: "LOW",
    title: "THEFT IN PROGRESS",
    location: "Thokoza, Gauteng",
    distance: "12.1 km",
    time: "22:03",
    detail: "Citizen report via app. Units dispatched.",
  },
];

const agents = [
  ["BOLO Young", "EN ROUTE", "Katlehong", "3 min"],
  ["Agent 01", "ON SITE", "Vosloorus", "6 min"],
  ["Agent 02", "PATROLLING", "Thokoza", "12 min"],
  ["Agent 03", "AVAILABLE", "Sector 2", "—"],
];

function StatusPill({
  children,
  type = "neutral",
}: {
  children: React.ReactNode;
  type?: "red" | "orange" | "green" | "blue" | "neutral";
}) {
  return <span className={`status-pill ${type}`}>{children}</span>;
}

function Panel({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">
          {icon}
          <span>{title}</span>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function TacticalMap() {
  return (
    <div className="map">
      <div className="map-grid" />

      <div className="road road-a" />
      <div className="road road-b" />
      <div className="road road-c" />
      <div className="road road-d" />
      <div className="road road-e" />

      <div className="map-label label-katlehong">Katlehong</div>
      <div className="map-label label-vosloorus">Vosloorus</div>
      <div className="map-label label-thokoza">Thokoza</div>

      <div className="north">
        <span>N</span>
        <div />
      </div>

      <div className="geofence outer">
        <div className="geofence middle">
          <div className="incident-core">
            <div className="core-dot" />
          </div>
        </div>
      </div>

      <div className="route">
        <div className="route-segment one" />
        <div className="route-segment two" />
        <div className="route-segment three" />
        <div className="route-arrow" />
      </div>

      <div className="mobile-unit unit-a">
        <Car size={15} />
      </div>
      <div className="mobile-unit unit-b">
        <Car size={15} />
      </div>
      <div className="mobile-unit unit-c">
        <Car size={15} />
      </div>
      <div className="mobile-unit unit-d">
        <Car size={15} />
      </div>

      <div className="bolo-marker">
        <Target size={18} />
      </div>

      <div className="map-legend">
        <div>
          <span className="legend-dot red-dot" />
          Incident Location
        </div>
        <div>
          <span className="legend-ring" />
          Geofence (20km)
        </div>
        <div>
          <span className="legend-route" />
          Agent Route
        </div>
        <div>
          <Car size={14} />
          Mobile Unit
        </div>
        <div>
          <span className="legend-triangle" />
          BOLO Young
        </div>
      </div>

      <div className="map-scale">
        <span>2 km</span>
        <div />
      </div>
    </div>
  );
}

export default function Page() {
  const [activeNav, setActiveNav] = useState("LIVE MAP");
  const [incidentOpen, setIncidentOpen] = useState(true);

  return (
    <main className="console">
      {/* TOP BRAND BAR */}
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
            SYSTEM ONLINE
          </div>
          <div>OCT 26 2026&nbsp;&nbsp; 22:26</div>
        </div>

        <div className="hackathon">
          FNB AOTY HACKATHON 2026
          <br />
          ARTIFICIAL STAR
        </div>
      </header>

      <div className="workspace">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-heading">
            <Siren size={25} />
            <span>CONSOLE</span>
          </div>

          <nav>
            {[
              [Map, "LIVE MAP"],
              [AlertTriangle, "INCIDENTS"],
              [Users, "AGENTS"],
              [Navigation, "JOURNEYS"],
              [BarChart3, "ANALYTICS"],
              [Settings, "SETTINGS"],
            ].map(([Icon, label]) => (
              <button
                key={label as string}
                className={`nav-item ${
                  activeNav === label ? "active" : ""
                }`}
                onClick={() => setActiveNav(label as string)}
              >
                <Icon size={21} />
                <span>{label as string}</span>

                {label === "INCIDENTS" && (
                  <b className="incident-count">3</b>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-spacer" />

          <div className="waypoint-card">
            <div className="waypoint-status">
              <span />
              WAYPOINT SECURE
            </div>
            <small>CITIZEN APP ONLINE</small>
          </div>

          <div className="sidebar-motto">
            SAFER COMMUNITIES.
            <br />
            STRONGER TOGETHER.
            <div />
          </div>
        </aside>

        {/* MAIN */}
        <div className="main-content">
          {/* INCIDENT STRIP */}
          {incidentOpen && (
            <div className="incident-strip">
              <div className="incident-symbol">
                <AlertTriangle size={26} />
              </div>

              <div className="incident-copy">
                <span>ACTIVE INCIDENT</span>
                <strong>POSSIBLE GBV - DISTRESS SIGNAL</strong>
                <small>
                  Katlehong, Gauteng&nbsp;&nbsp;•&nbsp;&nbsp;4.2 km
                  &nbsp;&nbsp;•&nbsp;&nbsp;3 min ago
                </small>
              </div>

              <button className="details-button">
                VIEW DETAILS
                <ChevronRight size={18} />
              </button>

              <button
                className="close-incident"
                onClick={() => setIncidentOpen(false)}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* ACTIONS */}
          <div className="action-row">
            <button className="action-button whatsapp">
              <MessageSquare size={21} />
              <span>
                WHATSAPP
                <br />
                RECON
              </span>
            </button>

            <button className="action-button">
              <Navigation size={21} />
              <span>
                OPEN IN NEW
                <br />
                WINDOW
              </span>
            </button>

            <button className="action-button tactical">
              <MapPin size={21} />
              <span>
                LIVE TACTICAL
                <br />
                MAP
              </span>
            </button>
          </div>

          {/* MAP + RIGHT COLUMN */}
          <div className="dashboard-grid">
            <div className="primary-column">
              <TacticalMap />

              {/* BOLO COMMAND BAR */}
              <div className="bolo-command">
                <div className="bolo-icon">
                  <Activity size={28} />
                </div>

                <div className="bolo-info">
                  <div>
                    BOLO YOUNG
                    <StatusPill type="green">ACTIVE</StatusPill>
                  </div>
                  <small>Traffic Control AI Guardian</small>
                </div>

                <div className="command-divider" />

                <div className="command-message">
                  “Unit 01, confirm visual on suspect.
                  <br />
                  Maintain 2 block perimeter.”
                </div>

                <div className="command-time">
                  22:26:41
                  <Activity size={16} />
                </div>
              </div>

              {/* BOTTOM CONTROL ROW */}
              <div className="bottom-grid">
                <Panel title="QUICK ACTIONS" icon={<Zap size={17} />}>
                  <div className="quick-actions">
                    <button className="quick danger">
                      <AlertTriangle size={17} />
                      PANIC
                    </button>
                    <button className="quick">
                      <Siren size={17} />
                      DISPATCH
                    </button>
                    <button className="quick">
                      <FileText size={17} />
                      LOG INCIDENT
                    </button>
                    <button className="quick">
                      <MapPin size={17} />
                      SHARE LOCATION
                    </button>
                  </div>
                </Panel>

                <Panel title="SYSTEM METRICS" icon={<BarChart3 size={17} />}>
                  <div className="metrics">
                    <Metric label="ACTIVE AGENTS" value="4/6" />
                    <Metric label="AVG. RESPONSE" value="2.8 min" />
                    <Metric label="CITIZEN REPORTS" value="12 (24h)" />
                    <Metric label="UPTIME" value="99.9%" />
                  </div>
                </Panel>

                <Panel
                  title="POPIA / PRIVACY"
                  icon={<Shield size={17} />}
                  action={<StatusPill type="green">● COMPLIANT</StatusPill>}
                >
                  <div className="privacy">
                    <div>Zero-Knowledge Architecture</div>
                    <div>End-to-End Encryption</div>
                    <div>No Personal Data Storage</div>
                  </div>
                </Panel>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <aside className="right-column">
              <Panel
                title="LIVE INCIDENT FEED"
                icon={<Radio size={17} />}
                action={<StatusPill type="green">● AUTO-REFRESH</StatusPill>}
              >
                <div className="incident-feed">
                  {incidents.map((incident) => (
                    <div className="feed-item" key={incident.title}>
                      <div className="feed-top">
                        <span
                          className={`severity ${incident.level.toLowerCase()}`}
                        >
                          {incident.level}
                        </span>
                        <strong>{incident.title}</strong>
                        <time>{incident.time}</time>
                      </div>

                      <div className="feed-location">
                        {incident.location}&nbsp;&nbsp;•&nbsp;&nbsp;
                        {incident.distance}
                      </div>

                      <p>{incident.detail}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel
                title="AGENT STATUS"
                icon={<Users size={17} />}
                action={<StatusPill type="neutral">4 ACTIVE</StatusPill>}
              >
                <div className="agent-table">
                  <div className="table-head">
                    <span>AGENT</span>
                    <span>STATUS</span>
                    <span>LOCATION</span>
                    <span>ETA</span>
                  </div>

                  {agents.map(([name, status, location, eta], index) => (
                    <div className="agent-row" key={name}>
                      <span className="agent-name">
                        {index === 0 ? (
                          <Target size={15} />
                        ) : (
                          <Car size={15} />
                        )}
                        {name}
                      </span>

                      <StatusPill
                        type={
                          status === "ON SITE"
                            ? "green"
                            : status === "EN ROUTE"
                            ? "orange"
                            : status === "PATROLLING"
                            ? "blue"
                            : "neutral"
                        }
                      >
                        {status}
                      </StatusPill>

                      <span>{location}</span>
                      <span>{eta}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </aside>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <span>BOLO CONSOLE&nbsp;&nbsp;//&nbsp;&nbsp;OPERATOR DASHBOARD</span>
        <span>
          FNB AOTY HACKATHON 2026&nbsp;&nbsp;
          <b>//</b>&nbsp;&nbsp;ARTIFICIAL STAR
        </span>
      </footer>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap");

        :root {
          --paper: #f4efe6;
          --card: #ebe4d5;
          --ink: #181816;
          --panel: #0d1112;
          --panel-2: #131719;
          --border: #555750;
          --red: #d9381e;
          --orange: #e6681b;
          --amber: #eba823;
          --teal: #1e5e5a;
          --green: #2b8a64;
          --cyan: #25c9ad;
          --muted: #9b9d96;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          min-height: 100%;
          background: var(--paper);
          color: var(--paper);
          font-family: "Space Grotesk", sans-serif;
        }

        button {
          font: inherit;
        }

        .console {
          min-height: 100vh;
          background: var(--paper);
          color: var(--paper);
          display: flex;
          flex-direction: column;
        }

        /* --------------------------------
           TOP BAR
        -------------------------------- */

        .topbar {
          height: 88px;
          flex-shrink: 0;
          background: var(--paper);
          color: var(--ink);
          display: flex;
          align-items: center;
          padding: 0 30px;
          border-bottom: 3px solid var(--ink);
        }

        .brand {
          display: flex;
          align-items: center;
          min-width: 0;
          flex: 1;
        }

        .brand-mark {
          width: 58px;
          height: 58px;
          margin-right: 16px;
          position: relative;
          display: grid;
          place-items: center;
        }

        .brand-mark svg {
          position: absolute;
          inset: 0;
          width: 58px;
          height: 58px;
        }

        .brand-mark span {
          position: absolute;
          width: 11px;
          height: 11px;
          background: var(--red);
          border-radius: 50%;
          box-shadow: 0 0 0 4px var(--orange);
        }

        .brand-name {
          border-left: 2px solid var(--ink);
          padding-left: 18px;
        }

        .brand-name h1 {
          margin: 0;
          font-family: "Space Grotesk", sans-serif;
          font-size: 33px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: -0.04em;
        }

        .brand-name div {
          margin-top: 7px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .divider {
          margin: 0 10px;
          color: var(--orange);
        }

        .system-meta {
          border-left: 2px solid var(--ink);
          padding-left: 25px;
          margin-right: 28px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          line-height: 1.9;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        .system-status {
          font-weight: 700;
        }

        .system-status span {
          display: inline-block;
          width: 13px;
          height: 13px;
          margin-right: 9px;
          vertical-align: -2px;
          background: #24bd83;
        }

        .hackathon {
          border-left: 2px solid var(--ink);
          padding-left: 25px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          font-weight: 600;
          line-height: 1.8;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        /* --------------------------------
           WORKSPACE
        -------------------------------- */

        .workspace {
          flex: 1;
          min-height: 0;
          display: flex;
          background: var(--panel);
        }

        /* --------------------------------
           SIDEBAR
        -------------------------------- */

        .sidebar {
          width: 263px;
          flex-shrink: 0;
          background: #0b0e0f;
          border-right: 2px solid #555750;
          padding: 22px 14px;
          display: flex;
          flex-direction: column;
        }

        .sidebar-heading {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 13px 22px;
          color: var(--amber);
          font-family: "IBM Plex Mono", monospace;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.08em;
        }

        .sidebar-heading svg {
          color: var(--amber);
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          position: relative;
          height: 58px;
          border: 0;
          background: transparent;
          color: #e8e5dc;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 0 18px;
          text-align: left;
          font-family: "IBM Plex Mono", monospace;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .nav-item:hover {
          background: #181c1d;
        }

        .nav-item.active {
          background: #66310f;
          color: var(--amber);
          border-left: 10px solid var(--orange);
          padding-left: 8px;
        }

        .nav-item svg {
          flex-shrink: 0;
        }

        .incident-count {
          margin-left: auto;
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          background: var(--red);
          color: white;
          border-radius: 50%;
          font-size: 11px;
        }

        .sidebar-spacer {
          flex: 1;
          min-height: 30px;
        }

        .waypoint-card {
          border: 1px solid #73766f;
          padding: 16px;
          margin: 0 9px 18px;
        }

        .waypoint-status {
          font-family: "IBM Plex Mono", monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .waypoint-status span {
          display: inline-block;
          width: 10px;
          height: 10px;
          margin-right: 9px;
          background: #20c48a;
          border-radius: 50%;
        }

        .waypoint-card small {
          display: block;
          margin-top: 6px;
          color: #aaa99f;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
        }

        .sidebar-motto {
          border: 1px solid #65675f;
          padding: 20px;
          margin: 0 9px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.7;
          letter-spacing: 0.08em;
        }

        .sidebar-motto div {
          width: 50px;
          height: 3px;
          background: var(--orange);
          margin-top: 12px;
        }

        /* --------------------------------
           MAIN
        -------------------------------- */

        .main-content {
          flex: 1;
          min-width: 0;
          padding: 13px 15px 15px;
          overflow: auto;
          background: #0e1213;
        }

        .incident-strip {
          min-height: 86px;
          border: 2px solid #f0b8ad;
          background: linear-gradient(
            90deg,
            #d62e18 0%,
            #bd2917 70%,
            #a82415 100%
          );
          display: flex;
          align-items: center;
          padding: 12px 17px;
          position: relative;
        }

        .incident-symbol {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.14);
          margin-right: 16px;
        }

        .incident-copy {
          display: flex;
          flex-direction: column;
        }

        .incident-copy span {
          color: #180c08;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          font-weight: 700;
        }

        .incident-copy strong {
          font-family: "IBM Plex Mono", monospace;
          font-size: 17px;
          letter-spacing: 0.03em;
        }

        .incident-copy small {
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          margin-top: 3px;
        }

        .details-button {
          margin-left: auto;
          border: 0;
          background: #17110d;
          color: var(--orange);
          padding: 13px 15px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .close-incident {
          display: none;
        }

        .action-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin: 13px 0;
        }

        .action-button {
          min-height: 73px;
          border: 1.5px solid #73766f;
          background: #101516;
          color: #f0eee8;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
        }

        .action-button:hover {
          background: #1b2021;
        }

        .action-button.whatsapp {
          border-color: #078e76;
          color: #20cbb0;
        }

        .action-button.tactical {
          border-color: #5b52be;
          color: #aaa5ff;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 2.15fr) minmax(370px, 1fr);
          gap: 13px;
        }

        .primary-column,
        .right-column {
          min-width: 0;
        }

        .right-column {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        /* --------------------------------
           MAP
        -------------------------------- */

        .map {
          height: 448px;
          position: relative;
          overflow: hidden;
          border: 2px solid #e9e7df;
          background:
            radial-gradient(
              circle at 52% 53%,
              rgba(98, 100, 96, 0.25),
              transparent 25%
            ),
            #101415;
        }

        .map-grid {
          position: absolute;
          inset: 0;
          opacity: 0.25;
          background-image:
            linear-gradient(#5e625f 1px, transparent 1px),
            linear-gradient(90deg, #5e625f 1px, transparent 1px);
          background-size: 45px 45px;
          transform: rotate(-7deg) scale(1.2);
        }

        .road {
          position: absolute;
          height: 3px;
          background: #3d4241;
          transform-origin: left center;
          box-shadow: 0 0 0 1px #151919;
        }

        .road-a {
          width: 800px;
          left: -80px;
          top: 290px;
          transform: rotate(-19deg);
        }

        .road-b {
          width: 600px;
          left: 170px;
          top: 60px;
          transform: rotate(62deg);
        }

        .road-c {
          width: 700px;
          left: 280px;
          top: 420px;
          transform: rotate(-54deg);
        }

        .road-d {
          width: 600px;
          left: -20px;
          top: 120px;
          transform: rotate(13deg);
        }

        .road-e {
          width: 650px;
          left: 350px;
          top: 160px;
          transform: rotate(27deg);
        }

        .map-label {
          position: absolute;
          color: #e5e4dd;
          font-size: 14px;
          font-weight: 600;
        }

        .label-katlehong {
          left: 48%;
          top: 45%;
        }

        .label-vosloorus {
          right: 8%;
          top: 18%;
        }

        .label-thokoza {
          left: 11%;
          top: 51%;
        }

        .north {
          position: absolute;
          left: 24px;
          top: 19px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 14px;
          font-weight: 700;
        }

        .north div {
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-bottom: 13px solid white;
          margin: 2px auto 0;
        }

        .geofence {
          position: absolute;
          left: 52%;
          top: 53%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          display: grid;
          place-items: center;
        }

        .geofence.outer {
          width: 340px;
          height: 340px;
          border: 2px solid #ff3e24;
          background: rgba(194, 43, 27, 0.18);
          box-shadow:
            inset 0 0 35px rgba(255, 54, 29, 0.09),
            0 0 15px rgba(255, 54, 29, 0.08);
        }

        .geofence.middle {
          width: 148px;
          height: 148px;
          border: 2px dashed #ff3e24;
          background: rgba(95, 22, 17, 0.2);
        }

        .incident-core {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid rgba(255, 69, 43, 0.35);
          display: grid;
          place-items: center;
          box-shadow: 0 0 25px rgba(255, 57, 33, 0.25);
        }

        .core-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f5f2e9;
          border: 6px solid var(--red);
          box-shadow: 0 0 18px rgba(255, 67, 41, 0.8);
        }

        .route {
          position: absolute;
          left: 52%;
          top: 53%;
          width: 170px;
          height: 100px;
          transform: translate(-5%, 0) rotate(-42deg);
        }

        .route-segment {
          position: absolute;
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            var(--amber) 0 9px,
            transparent 9px 14px
          );
        }

        .route-segment.one {
          width: 50px;
          left: 0;
          top: 50px;
        }

        .route-segment.two {
          width: 65px;
          left: 44px;
          top: 50px;
        }

        .route-segment.three {
          width: 70px;
          left: 101px;
          top: 50px;
        }

        .route-arrow {
          position: absolute;
          right: 0;
          top: 43px;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-left: 15px solid var(--amber);
        }

        .mobile-unit {
          position: absolute;
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #0b2625;
          color: #3ad7bd;
          box-shadow: 0 0 0 2px rgba(37, 201, 173, 0.08);
        }

        .unit-a {
          left: 36%;
          top: 32%;
        }

        .unit-b {
          left: 57%;
          top: 32%;
        }

        .unit-c {
          left: 55%;
          top: 53%;
        }

        .unit-d {
          left: 43%;
          top: 74%;
        }

        .bolo-marker {
          position: absolute;
          left: 31%;
          top: 66%;
          color: var(--amber);
        }

        .map-legend {
          position: absolute;
          right: 14px;
          bottom: 12px;
          width: 198px;
          padding: 12px;
          border: 1px solid #6b6e68;
          background: rgba(9, 13, 14, 0.92);
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          line-height: 2.5;
        }

        .map-legend div {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .legend-dot {
          width: 13px;
          height: 13px;
          border-radius: 50%;
        }

        .red-dot {
          background: var(--red);
          border: 3px solid #f2eee4;
        }

        .legend-ring {
          width: 19px;
          height: 19px;
          border: 2px solid var(--red);
          border-radius: 50%;
        }

        .legend-route {
          width: 20px;
          border-top: 2px dashed var(--amber);
        }

        .legend-triangle {
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 12px solid var(--amber);
        }

        .map-scale {
          position: absolute;
          left: 22px;
          bottom: 15px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
        }

        .map-scale div {
          width: 130px;
          border-top: 3px solid white;
          position: relative;
          margin-top: 3px;
        }

        .map-scale div::before,
        .map-scale div::after {
          content: "";
          position: absolute;
          height: 8px;
          border-left: 2px solid white;
          top: -5px;
        }

        .map-scale div::before {
          left: 0;
        }

        .map-scale div::after {
          right: 0;
        }

        /* --------------------------------
           PANELS
        -------------------------------- */

        .panel {
          background: var(--panel-2);
          border: 1.5px solid #75776f;
          min-width: 0;
        }

        .panel-header {
          min-height: 43px;
          padding: 0 15px;
          border-bottom: 1px solid #444844;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 11px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .panel-title svg {
          color: var(--amber);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 9px;
          border: 1px solid currentColor;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .status-pill.red {
          color: #ff6754;
        }

        .status-pill.orange {
          color: var(--amber);
        }

        .status-pill.green {
          color: #18d49e;
        }

        .status-pill.blue {
          color: #20c7d0;
        }

        .status-pill.neutral {
          color: #aeb3b0;
        }

        /* --------------------------------
           BOLO BAR
        -------------------------------- */

        .bolo-command {
          height: 77px;
          margin-top: 13px;
          border: 1.5px solid #74766f;
          background: #0d1213;
          display: flex;
          align-items: center;
          padding: 0 15px;
        }

        .bolo-icon {
          color: #21d4b4;
          margin-right: 13px;
        }

        .bolo-info {
          min-width: 190px;
        }

        .bolo-info > div {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 13px;
          font-weight: 700;
        }

        .bolo-info small {
          display: block;
          margin-top: 6px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          color: #c4c7c1;
        }

        .command-divider {
          height: 44px;
          border-left: 1px solid #555953;
          margin: 0 25px;
        }

        .command-message {
          flex: 1;
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          line-height: 1.65;
        }

        .command-time {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #a8aaa4;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
        }

        .command-time svg {
          color: #20cdb0;
        }

        /* --------------------------------
           FEED
        -------------------------------- */

        .feed-item {
          padding: 12px 14px;
          border-bottom: 1px solid #494d49;
        }

        .feed-item:last-child {
          border-bottom: 0;
        }

        .feed-top {
          display: grid;
          grid-template-columns: 68px 1fr auto;
          align-items: center;
          gap: 10px;
        }

        .severity {
          width: 55px;
          padding: 6px 0;
          text-align: center;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          font-weight: 700;
        }

        .severity.high {
          background: #f13b29;
        }

        .severity.med {
          background: #f0a91c;
          color: #17130b;
        }

        .severity.low {
          background: #22c79c;
          color: #071712;
        }

        .feed-top strong {
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.03em;
        }

        .feed-top time {
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          color: #aaa;
        }

        .feed-location {
          margin: 7px 0 3px 78px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          color: #dddcd4;
        }

        .feed-item p {
          margin: 0 0 0 78px;
          color: #a9aca6;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          line-height: 1.5;
        }

        /* --------------------------------
           AGENTS
        -------------------------------- */

        .agent-table {
          padding: 8px 12px 11px;
        }

        .table-head,
        .agent-row {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 40px;
          align-items: center;
          gap: 8px;
        }

        .table-head {
          padding: 5px 0 7px;
          color: #92958e;
          font-family: "IBM Plex Mono", monospace;
          font-size: 8px;
        }

        .agent-row {
          min-height: 39px;
          border-top: 1px solid #3c403d;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
        }

        .agent-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .agent-name svg {
          color: #21d1b1;
        }

        .agent-row:first-of-type .agent-name svg {
          color: var(--amber);
        }

        /* --------------------------------
           BOTTOM
        -------------------------------- */

        .bottom-grid {
          display: grid;
          grid-template-columns: 1.3fr 1.05fr 1fr;
          gap: 13px;
          margin-top: 13px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 7px;
          padding: 10px;
        }

        .quick {
          min-height: 43px;
          border: 1px solid #7a7d76;
          background: #121718;
          color: #eeeae1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .quick:hover {
          background: #202525;
        }

        .quick.danger {
          border-color: var(--red);
          color: #ff8171;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          padding: 8px 10px 10px;
        }

        .metric {
          padding: 8px;
          border-right: 1px solid #454944;
          border-bottom: 1px solid #454944;
        }

        .metric:nth-child(2n) {
          border-right: 0;
        }

        .metric:nth-child(3),
        .metric:nth-child(4) {
          border-bottom: 0;
        }

        .metric-label {
          display: block;
          color: #969991;
          font-family: "IBM Plex Mono", monospace;
          font-size: 7px;
          line-height: 1.3;
        }

        .metric-value {
          display: block;
          margin-top: 5px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 14px;
          font-weight: 600;
        }

        .privacy {
          padding: 11px 14px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          line-height: 1.8;
          color: #d0d1ca;
        }

        /* --------------------------------
           FOOTER
        -------------------------------- */

        footer {
          height: 34px;
          flex-shrink: 0;
          background: var(--paper);
          color: var(--ink);
          border-top: 2px solid var(--ink);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        footer b {
          color: var(--orange);
        }

        /* --------------------------------
           RESPONSIVE
        -------------------------------- */

        @media (max-width: 1200px) {
          .sidebar {
            width: 220px;
          }

          .brand-name h1 {
            font-size: 27px;
          }

          .system-meta {
            display: none;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .right-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 800px) {
          .topbar {
            padding: 0 15px;
          }

          .brand-name div,
          .hackathon {
            display: none;
          }

          .brand-name h1 {
            font-size: 22px;
          }

          .sidebar {
            width: 70px;
            padding: 15px 8px;
          }

          .sidebar-heading span,
          .nav-item span,
          .waypoint-card,
          .sidebar-motto {
            display: none;
          }

          .sidebar-heading {
            justify-content: center;
            padding: 8px 0 20px;
          }

          .nav-item {
            justify-content: center;
            padding: 0;
          }

          .nav-item.active {
            padding-left: 0;
            border-left: 4px solid var(--orange);
          }

          .incident-count {
            position: absolute;
            top: 7px;
            right: 4px;
            width: 17px;
            height: 17px;
            font-size: 8px;
          }

          .main-content {
            padding: 10px;
          }

          .action-row {
            grid-template-columns: 1fr;
          }

          .right-column {
            grid-template-columns: 1fr;
          }

          .map {
            height: 400px;
          }

          .incident-copy strong {
            font-size: 13px;
          }

          .command-message {
            display: none;
          }

          .command-divider {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );
}