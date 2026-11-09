"use client";

import React, { useState, useEffect } from "react";

interface PixelSuspectProps {
  suspectId: string;
  suspectName: string;
  currentComposure: number;
  maxComposure: number;
  stance: number; // 0 = Arrogant, 1 = Stoic, 2 = Paranoid
  lastQuote: string;
  isInterrogating?: boolean;
}

export function PixelSuspect({
  suspectId,
  suspectName,
  currentComposure,
  maxComposure,
  stance,
  lastQuote,
  isInterrogating = false,
}: PixelSuspectProps) {
  const [damaged, setDamaged] = useState(false);
  const [prevComposure, setPrevComposure] = useState(currentComposure);

  // Trigger damage shake effect whenever composure drops
  useEffect(() => {
    if (currentComposure < prevComposure) {
      setDamaged(true);
      const timer = setTimeout(() => setDamaged(false), 900);
      return () => clearTimeout(timer);
    }
    setPrevComposure(currentComposure);
  }, [currentComposure, prevComposure]);

  const percentage = Math.max(0, Math.min(100, Math.round((currentComposure / (maxComposure || 1000)) * 100)));
  const isCracked = currentComposure === 0;

  // Stance metadata (Clean, readable text)
  const stanceInfo = [
    {
      title: "Arrogant & Dismissive",
      icon: "🎭",
      desc: "Lemah terhadap Expose (+18% DMG), Kebal terhadap Press (-12% DMG).",
      badgeColor: "border border-ronchi/60 text-ronchi bg-[#281b15]",
    },
    {
      title: "Stoic & Cold",
      icon: "🗿",
      desc: "Lemah terhadap Press (+18% DMG), Kebal terhadap Bluff (-12% DMG).",
      badgeColor: "border border-[#7b9c9d]/60 text-[#8ec2c4] bg-[#132d2e]",
    },
    {
      title: "Paranoid & High-Strung",
      icon: "👁️",
      desc: "Lemah terhadap Bluff (+18% DMG), Kebal terhadap Expose (-12% DMG).",
      badgeColor: "border border-[#d15b29]/60 text-[#f48554] bg-[#38160c]",
    },
  ][stance % 3];

  // Health bar color transition
  const getHealthColor = () => {
    if (percentage > 60) return "bg-grannysmith";
    if (percentage > 25) return "bg-ronchi";
    return "bg-piper";
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-lg mx-auto select-none">
      {/* Suspect Speech Bubble (Clean, readable typography) */}
      <div className="relative mb-4 w-full bg-[#1b130f] border-2 border-ronchi/50 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#3d2a1f] pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ronchi">
              Pernyataan Tersangka
            </span>
            <span className="text-xs font-mono text-[#8ec2c4] bg-[#140e0b] px-2 py-0.5 rounded border border-[#7b9c9d]/40">
              🔒 Enclave AI Verified
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            {isCracked ? "● MENGAKU BERSALAH" : "● DI MEJA SAKSI"}
          </span>
        </div>
        <p className="text-sm font-medium text-white leading-relaxed italic">
          "{lastQuote || "Kabut London menyembunyikan semua jejak. Kamu tidak punya bukti apa pun padaku, detektif..."}"
        </p>
        {/* Speech Bubble Arrow */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-ronchi/50" />
      </div>

      {/* Character Pixel Stage Box */}
      <div
        className={`relative w-56 h-60 bg-[#160f0c] border-2 border-ronchi/40 rounded-t-2xl p-3 flex flex-col items-center justify-end overflow-hidden shadow-2xl transition-transform ${
          damaged ? "animate-bounce scale-95 brightness-125" : ""
        } ${isInterrogating ? "brightness-110" : ""}`}
      >
        {/* Ambient Steam / Smoke Pixel particles */}
        <div className="absolute top-3 left-8 w-2 h-2 bg-grannysmith/50 rounded-none animate-ping" />
        <div className="absolute top-5 right-10 w-2 h-2 bg-ronchi/40 rounded-none animate-pulse" />

        {/* Sweat drops when damaged or low composure */}
        {(damaged || percentage < 30) && !isCracked && (
          <div className="absolute top-12 right-12 flex flex-col gap-1 animate-pulse">
            <span className="text-base leading-none">💧</span>
          </div>
        )}

        {/* Crisp Pixel Character SVG Canvas */}
        <div
          className={`w-44 h-52 flex items-center justify-center transition-all ${
            isCracked ? "opacity-60 rotate-6 translate-y-3" : "animate-[pulse_4s_ease-in-out_infinite]"
          }`}
          style={{ imageRendering: "pixelated" }}
        >
          {suspectId === "vex" ? (
            /* VEX THE PHANTOM: Shadowy Thief with Fedora & Glowing Eye */
            <svg
              viewBox="0 0 32 36"
              className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]"
              shapeRendering="crispEdges"
            >
              {/* Fedora Hat */}
              <rect x="7" y="2" width="18" height="2" fill="#1f2942" />
              <rect x="9" y="4" width="14" height="4" fill="#2a1d17" />
              <rect x="9" y="7" width="14" height="2" fill="#e05e26" />
              <rect x="5" y="8" width="22" height="2" fill="#1f2942" />

              {/* Head & Mask */}
              <rect x="10" y="10" width="12" height="10" fill="#261d18" />
              <rect x="10" y="10" width="12" height="3" fill="#160f0c" />

              {/* Eyes */}
              {isCracked ? (
                <>
                  <rect x="12" y="13" width="2" height="2" fill="#7dd3c7" />
                  <rect x="18" y="13" width="2" height="2" fill="#7dd3c7" />
                  <line x1="12" y1="13" x2="14" y2="15" stroke="#ffffff" strokeWidth="0.5" />
                  <line x1="18" y1="13" x2="20" y2="15" stroke="#ffffff" strokeWidth="0.5" />
                </>
              ) : (
                <>
                  {/* Monocle Eye (Ronchi Gold Glow) */}
                  <rect x="11" y="13" width="4" height="3" fill="#f1c84b" />
                  <rect x="12" y="14" width="2" height="1" fill="#ffffff" />
                  {/* Dark Eye */}
                  <rect x="17" y="13" width="4" height="2" fill="#1f2942" />
                  <rect x="18" y="13" width="2" height="1" fill="#7dd3c7" />
                </>
              )}

              {/* High Collar Coat */}
              <rect x="7" y="18" width="18" height="4" fill="#1f2942" />
              <rect x="11" y="19" width="10" height="3" fill="#4b5b81" />
              <rect x="15" y="20" width="2" height="2" fill="#e05e26" />

              {/* Trenchcoat Body */}
              <rect x="6" y="22" width="20" height="12" fill="#1c1512" />
              <rect x="9" y="22" width="14" height="12" fill="#2a1d17" />
              {/* Brass Coat Buttons */}
              <rect x="15" y="24" width="2" height="2" fill="#f1c84b" />
              <rect x="15" y="28" width="2" height="2" fill="#f1c84b" />

              {/* Shoulders */}
              <rect x="4" y="23" width="3" height="8" fill="#1f2942" />
              <rect x="25" y="23" width="3" height="8" fill="#1f2942" />
            </svg>
          ) : suspectId === "cipher" ? (
            /* CIPHER THE BROKER: Victorian Syndicate Banker with Top Hat & Spectacles */
            <svg
              viewBox="0 0 32 36"
              className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]"
              shapeRendering="crispEdges"
            >
              {/* Tall Top Hat */}
              <rect x="10" y="1" width="12" height="8" fill="#160f0c" />
              <rect x="10" y="8" width="12" height="2" fill="#f1c84b" />
              <rect x="6" y="10" width="20" height="2" fill="#160f0c" />

              {/* Face & White Beard */}
              <rect x="10" y="12" width="12" height="8" fill="#e0c7a8" />
              <rect x="10" y="17" width="12" height="4" fill="#ffffff" />

              {/* Round Spectacles */}
              <rect x="11" y="14" width="3" height="3" fill="#7dd3c7" stroke="#f1c84b" strokeWidth="0.5" />
              <rect x="17" y="14" width="3" height="3" fill="#7dd3c7" stroke="#f1c84b" strokeWidth="0.5" />
              <line x1="14" y1="15" x2="17" y2="15" stroke="#f1c84b" strokeWidth="0.5" />

              {/* Smoking Pipe with Pixel Smoke */}
              <rect x="19" y="18" width="6" height="2" fill="#362820" />
              <rect x="24" y="16" width="3" height="4" fill="#e05e26" />
              <rect x="25" y="13" width="2" height="2" fill="#ffffff" className="animate-ping" />

              {/* Velvet Suit & Cravat */}
              <rect x="6" y="21" width="20" height="13" fill="#1f2942" />
              <rect x="13" y="21" width="6" height="6" fill="#ffffff" />
              <rect x="15" y="22" width="2" height="5" fill="#e05e26" />
              {/* Gold Watch Chain */}
              <rect x="10" y="28" width="12" height="1" fill="#f1c84b" />
            </svg>
          ) : (
            /* THE ARCHITECT: Mastermind with Steampunk Bowler & Mechanical Eye */
            <svg
              viewBox="0 0 32 36"
              className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]"
              shapeRendering="crispEdges"
            >
              {/* Bowler Hat */}
              <rect x="9" y="3" width="14" height="6" rx="2" fill="#241b16" />
              <rect x="6" y="8" width="20" height="2" fill="#160f0c" />

              {/* Face & Shadow */}
              <rect x="10" y="10" width="12" height="9" fill="#cbb497" />

              {/* Mechanical Brass Eye */}
              <rect x="11" y="12" width="4" height="4" fill="#f1c84b" stroke="#e05e26" strokeWidth="0.5" />
              <rect x="12" y="13" width="2" height="2" fill="#7dd3c7" />
              <rect x="17" y="13" width="3" height="2" fill="#160f0c" />

              {/* Steampunk Collar */}
              <rect x="7" y="19" width="18" height="5" fill="#32241c" />
              <rect x="12" y="19" width="8" height="4" fill="#4b5b81" />
              <rect x="15" y="20" width="2" height="4" fill="#f1c84b" />

              {/* Vest & Gears */}
              <rect x="6" y="24" width="20" height="10" fill="#1f2942" />
              <rect x="13" y="24" width="6" height="10" fill="#241b16" />
              <rect x="15" y="26" width="2" height="2" fill="#f1c84b" />
              <rect x="15" y="30" width="2" height="2" fill="#e05e26" />
            </svg>
          )}
        </div>

        {/* Suspect Nameplate */}
        <div className="w-full bg-[#1b130f] border-t border-ronchi/40 py-1.5 text-center">
          <span className="text-sm font-bold text-ronchi tracking-wide uppercase">
            {suspectName}
          </span>
        </div>
      </div>

      {/* Dynamic Health & Composure Bar */}
      <div className="w-full bg-[#1b130f] border-2 border-t-0 border-ronchi/40 rounded-b-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-[#8ec2c4] font-bold uppercase tracking-wider">
            Ketahanan Mental Tersangka
          </span>
          <span className="text-white font-bold text-sm">
            {currentComposure} / {maxComposure} HP ({percentage}%)
          </span>
        </div>

        {/* Meter Gauge Container */}
        <div className="relative w-full h-5 bg-[#0e0806] border border-[#4a3426] rounded-md p-0.5 overflow-hidden">
          <div
            className={`h-full rounded transition-all duration-500 ${getHealthColor()}`}
            style={{ width: `${percentage}%` }}
          />
          {/* Gauge Tick Overlays */}
          <div className="absolute inset-0 flex justify-between pointer-events-none px-3 opacity-25">
            <div className="w-px h-full bg-white" />
            <div className="w-px h-full bg-white" />
            <div className="w-px h-full bg-white" />
            <div className="w-px h-full bg-white" />
          </div>
        </div>

        {/* Dynamic Psychological Stance & Mind Games Indicator */}
        <div className="mt-3 pt-3 border-t border-[#3d2a1f] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{stanceInfo.icon}</span>
            <div>
              <div className="text-xs font-bold text-white uppercase">
                {stanceInfo.title}
              </div>
              <div className="text-xs text-slate-300 font-mono mt-0.5">
                {stanceInfo.desc}
              </div>
            </div>
          </div>
          <span className={`text-xs font-mono font-bold px-2 py-1 rounded border uppercase shrink-0 text-center ${stanceInfo.badgeColor}`}>
            Kondisi Saat Ini
          </span>
        </div>
      </div>
    </div>
  );
}
