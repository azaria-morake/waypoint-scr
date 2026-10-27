"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Check,
  CheckCheck,
  Phone,
  Video,
  Clock,
  Shirt,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
} from "lucide-react";

interface WhatsAppMessage {
  sender: string;
  sender_name: string;
  text: string;
  timestamp: string;
}

interface WhatsAppReconModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttireExtracted?: (attire: string) => void;
}

export const WhatsAppReconModal: React.FC<WhatsAppReconModalProps> = ({
  isOpen,
  onClose,
  onAttireExtracted,
}) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [extractedAttire, setExtractedAttire] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!isOpen) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/v1/recon/session`);
        if (res.ok) {
          const data = await res.json();
          if (data.is_active && data.messages.length > 0) {
            setMessages(data.messages);
            setIsComplete(data.is_complete);
            setExtractedAttire(data.extracted_attire);
          } else {
            handleRestart();
          }
        }
      } catch (e) {
        setMessages([
          {
            sender: "AGENT",
            sender_name: "Waypoint Emergency Recon",
            text: "Sawubona Zanele, this is Waypoint Emergency Response verifying a transit alert for your sister Thandiwe Ndlovu. Can you describe what clothing or hoodie she was wearing when she left today?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          {
            sender: "CITIZEN",
            sender_name: "Zanele Ndlovu",
            text: "Hello! She was wearing her black hoodie with the yellow reflective trim, and grey denim jeans. Is she okay?!",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          {
            sender: "AGENT",
            sender_name: "Waypoint Emergency Recon",
            text: "Received: Black hoodie with yellow reflective trim & grey denim jeans. Transmitting to Sector 2 patrol vehicles immediately. Stay by your phone.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsComplete(true);
        const demoAttire = "Black hoodie with yellow reflective trim, grey denim jeans";
        setExtractedAttire({ attire_description: demoAttire });
        if (onAttireExtracted) onAttireExtracted(demoAttire);
      }
    };

    fetchSession();
  }, [isOpen]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText;
    setInputText("");
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: WhatsAppMessage = {
      sender: "AGENT",
      sender_name: "Waypoint Officer Dispatch",
      text: userText,
      timestamp: nowTime,
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/v1/recon/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, sender: "AGENT" }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setIsComplete(data.is_complete);
        if (data.extracted_attire) {
          setExtractedAttire(data.extracted_attire);
          if (onAttireExtracted) {
            onAttireExtracted(data.extracted_attire.attire_description);
          }
        }
      }
    } catch (e) {
      setTimeout(() => {
        const reply: WhatsAppMessage = {
          sender: "CITIZEN",
          sender_name: "Zanele Ndlovu",
          text: "Yes, black hoodie with yellow trim, grey jeans and black sneakers. Please let me know as soon as units find her!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, reply]);
        setIsComplete(true);
      }, 900);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/recon/start`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setIsComplete(false);
        setExtractedAttire(null);
      }
    } catch (e) {}
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.85)",
        padding: "16px",
      }}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: "540px",
          height: "640px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
          border: "2px solid #75776f",
        }}
      >
        {/* Header */}
        <div className="panel-header" style={{ padding: "10px 16px", background: "#101415" }}>
          <div className="panel-title">
            <MessageSquare size={16} style={{ color: "#20cbb0" }} />
            <span style={{ color: "#fff" }}>WHATSAPP RECON&nbsp;&nbsp;//&nbsp;&nbsp;ZANELE NDLOVU</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="status-pill green" style={{ padding: "2px 6px", fontSize: "8px" }}>ONLINE</span>
            <button
              type="button"
              onClick={handleRestart}
              className="quick"
              title="Reset conversation thread"
              style={{ padding: "4px 8px", fontSize: "9px" }}
            >
              <RotateCcw size={12} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="quick"
              style={{ padding: "4px 8px", fontSize: "9px" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Legal & Contact Sub-bar */}
        <div
          style={{
            padding: "8px 14px",
            background: "#081c18",
            borderBottom: "1px solid #078e76",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: "9px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#20cbb0" }}>
            <ShieldCheck size={13} />
            <span>CONTACT: +27 82 555 0198 (Sister)</span>
          </div>
          <span style={{ color: "var(--amber)" }}>POPIA SEC 11(1)(d) VITAL INTERESTS</span>
        </div>

        {/* Message Thread Area */}
        <div
          ref={messagesContainerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            background: "#0c1012",
          }}
        >
          {messages.map((msg, i) => {
            const isAgent = msg.sender === "AGENT";

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isAgent ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  alignSelf: isAgent ? "flex-end" : "flex-start",
                }}
              >
                <div style={{ display: "flex", gap: "8px", marginBottom: "2px", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)" }}>
                  <b style={{ color: isAgent ? "#20cbb0" : "var(--amber)" }}>{msg.sender_name}</b>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  style={{
                    padding: "10px 14px",
                    background: isAgent ? "#0a2a22" : "#181d20",
                    border: isAgent ? "1px solid #078e76" : "1px solid #3c403d",
                    color: "#fff",
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    fontSize: "10px",
                    lineHeight: 1.5,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Extracted Attire Banner if complete */}
        {isComplete && extractedAttire && (
          <div
            style={{
              padding: "10px 14px",
              background: "#06201b",
              borderTop: "1px solid #078e76",
              borderBottom: "1px solid #078e76",
              fontFamily: "var(--font-ibm-plex-mono), monospace",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#20cbb0" }}>
                ✓ EXTRACTED ATTIRE INTEL CONFIRMED:
              </span>
              <span className="status-pill green" style={{ padding: "1px 6px", fontSize: "7px" }}>PUSHED TO CAD</span>
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#fff", marginTop: "3px" }}>
              &ldquo;{extractedAttire.attire_description}&rdquo;
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div style={{ padding: "10px 14px", borderTop: "1.5px solid #444844", background: "#101415", display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type WhatsApp message to next-of-kin..."
            style={{
              flex: 1,
              background: "#0c1012",
              border: "1px solid #555750",
              padding: "8px 12px",
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: "11px",
              color: "#fff",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="quick"
            style={{ borderColor: "#078e76", color: "#20cbb0", padding: "8px 14px" }}
          >
            <span>SEND</span>
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
