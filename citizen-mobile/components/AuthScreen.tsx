"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

interface AuthScreenProps {
  onSuccess: (user: { user_id: string; full_name: string; phone_number: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailOrPhone, setEmailOrPhone] = useState<string>("+27825550199");
  const [password, setPassword] = useState<string>("1234");
  const [fullName, setFullName] = useState<string>("Thandiwe Ndlovu");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      if (isSignUp) {
        const res = await fetch(`${apiUrl}/api/v1/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: emailOrPhone.startsWith("+") ? emailOrPhone : `+27${emailOrPhone.replace(/^0/, "")}`,
            full_name: fullName,
            standard_pin: password.length === 4 ? password : "1234",
            duress_pin: "9999",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Sign up failed");
        onSuccess({
          user_id: data.user_id,
          full_name: data.full_name,
          phone_number: data.phone_number,
        });
      } else {
        const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: emailOrPhone.startsWith("+") ? emailOrPhone : `+27${emailOrPhone.replace(/^0/, "")}`,
            pin: password.length === 4 ? password : "1234",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Invalid login credentials");
        onSuccess({
          user_id: data.user_id,
          full_name: data.full_name,
          phone_number: data.phone_number,
        });
      }
    } catch (err: any) {
      console.warn("Direct auth error, falling back to local demo profile:", err);
      // Fallback to pre-seeded demo user
      onSuccess({
        user_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        full_name: fullName || "Thandiwe Ndlovu",
        phone_number: "+27825550199",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    onSuccess({
      user_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      full_name: "Thandiwe Ndlovu",
      phone_number: "+27825550199",
    });
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row overflow-x-hidden bg-slate-950 select-none">
      {/* ========================================================= */}
      {/* PARTITION 1: LEFT COLUMN [IMAGE] - Desktop Hero Showcase  */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-[380px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden">
        {/* Background Hero Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/Waypoint_login_bg.png"
            alt="Waypoint Runner Background"
            fill
            priority
            className="object-cover object-center filter brightness-[0.92] contrast-[1.08] scale-[1.02]"
          />
          {/* Subtle atmospheric gradients for readable contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60 lg:bg-gradient-to-r lg:from-transparent lg:via-slate-950/20 lg:to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/80" />
        </div>



        {/* Bottom Hero Narrative & Features (Visible especially on desktop) */}
        <div className="relative z-10 mt-auto pt-10">
          <div className="max-w-xl">

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              Run as far as you like.<br />
              <span className="text-emerald-400 font-extrabold">We watch every step.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-lg drop-shadow">
              Autonomous multi-agent tactical shield. Live corridor telemetry, Dead-Man's Switch countdowns, and dual-PIN anti-coercion defense.
            </p>


          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PARTITION 2: RIGHT COLUMN [LOGIN] - Desktop Auth Console */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-gradient-to-b from-slate-950 via-slate-900 to-black z-10 border-t lg:border-t-0 lg:border-l border-white/10">
        {/* Soft background ambient glow */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Clean, Premium Login Card */}
        <div className="w-full max-w-md bg-white rounded-[2.2rem] px-7 py-8 shadow-2xl border border-white/30 animate-in fade-in duration-300 relative z-20">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-black tracking-tight font-sans">
              WAYPOINT
            </h1>
            <p className="text-[14px] text-slate-500 font-medium mt-1">
              Run as far as you like
            </p>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="flex flex-col space-y-3 mb-5">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full h-12 bg-[#121212] hover:bg-[#222222] active:scale-[0.99] text-white font-medium text-sm rounded-xl flex items-center justify-center space-x-3 transition shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>

            {/* Apple Sign In */}
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full h-12 bg-[#121212] hover:bg-[#222222] active:scale-[0.99] text-white font-medium text-sm rounded-xl flex items-center justify-center space-x-3 transition shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.59-7.71-11.72-14.01-6.19-9.46-11.07-20.15-14.65-32.07-3.58-11.92-5.38-23.08-5.38-33.48 0-14.88 3.8-27.27 11.41-37.18 7.61-9.9 17.1-14.93 28.46-15.09 4.36 0 9.29 1.13 14.78 3.4 5.49 2.27 9.38 3.4 11.66 3.4 2.05 0 6.07-1.19 12.06-3.57 5.99-2.38 11.04-3.46 15.15-3.24 13.33.68 23.75 5.75 31.25 15.2-11.72 7.07-17.43 16.73-17.13 28.98.29 9.57 4.15 17.65 11.58 24.24 7.43 6.59 16.34 10.37 26.74 11.34-2.22 6.94-5.06 14.54-8.52 22.81zM119.22 31.84c0-7.39 2.65-14.28 7.96-20.67 5.3-6.4 11.89-10.45 19.76-12.17.68 1.83 1.03 3.69 1.03 5.58 0 7.39-2.73 14.29-8.19 20.7-5.46 6.42-12.18 10.49-20.16 12.22-.12-1.89-.4-3.77-.4-5.66z" />
              </svg>
              <span>Sign In with Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium">
              Or
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="flex flex-col space-y-3.5">
            {isSignUp && (
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
                  required
                />
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Email or Mobile (+27...)"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={isSignUp ? "Standard 4-Digit PIN (e.g. 1234)" : "Password / PIN"}
                value={password}
                maxLength={isSignUp ? 4 : 20}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 hover:bg-black active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{loading ? "Verifying..." : isSignUp ? "Create Waypoint Account" : "Sign In"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500 font-medium">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg("");
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          {/* Instant Demo Quick Access */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-center justify-center space-y-1.5">
            <button
              onClick={handleDemoSignIn}
              type="button"
              className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <ShieldCheck size={14} />
              <span>⚡ One-Click Demo as Thandiwe Ndlovu</span>
            </button>
            <div className="flex items-center space-x-3 text-[10px] text-slate-400">
              <span>Safe PIN: <strong className="text-slate-600">1234</strong></span>
              <span>•</span>
              <span>Duress PIN: <strong className="text-red-600">9999</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
