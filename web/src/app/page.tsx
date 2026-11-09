"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CONTRACT_ID,
  DEMO_ACCOUNT_ID,
  DashboardState,
  fetchDashboardState,
  formatNearAmount,
} from "@/lib/near";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ImpeccableLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<DashboardState | null>(null);

  useEffect(() => {
    fetchDashboardState(DEMO_ACCOUNT_ID)
      .then((data) => setState(data))
      .catch((err) => console.warn("Landing page state poll:", err));
  }, []);

  const activeCase = state?.active_case;
  const jackpotNear = formatNearAmount(activeCase?.bounty_jackpot_yocto || "1025000000000000000000000", 2);

  // GSAP Animations (using official @gsap/react useGSAP hook and ScrollTrigger)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Hero Entrance Timeline (Kinetic slide without gating opacity at 0)
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".hero-status", {
          y: -12,
          duration: 0.5,
          clearProps: "all",
        })
          .from(
            ".hero-title",
            {
              y: 30,
              duration: 0.7,
              clearProps: "all",
            },
            "-=0.2"
          )
          .from(
            ".hero-description",
            {
              y: 20,
              duration: 0.6,
              clearProps: "all",
            },
            "-=0.3"
          )
          .from(
            ".hero-cta",
            {
              y: 15,
              stagger: 0.1,
              duration: 0.5,
              clearProps: "all",
            },
            "-=0.3"
          )
          .from(
            ".hero-telemetry",
            {
              y: 20,
              duration: 0.6,
              clearProps: "all",
            },
            "-=0.2"
          );

        // 2. ScrollTrigger: Pillars Section
        gsap.from(".pillar-card", {
          scrollTrigger: {
            trigger: "#pillars",
            start: "top 85%",
          },
          y: 35,
          stagger: 0.15,
          duration: 0.7,
          ease: "power2.out",
          clearProps: "all",
        });

        // 3. ScrollTrigger: Suspects Section
        gsap.from(".suspect-item", {
          scrollTrigger: {
            trigger: "#suspects",
            start: "top 85%",
          },
          y: 35,
          stagger: 0.15,
          duration: 0.7,
          ease: "power2.out",
          clearProps: "all",
        });

        // 4. ScrollTrigger: Evidence Items
        gsap.from(".evidence-col", {
          scrollTrigger: {
            trigger: "#economy",
            start: "top 85%",
          },
          y: 30,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "all",
        });

        // 5. ScrollTrigger: Architecture Panel
        gsap.from("#architecture-panel", {
          scrollTrigger: {
            trigger: "#architecture",
            start: "top 85%",
          },
          y: 30,
          duration: 0.7,
          ease: "power2.out",
          clearProps: "all",
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-ground text-white selection:bg-gold selection:text-ground overflow-x-hidden"
    >
      {/* ========================================================================= */}
      {/* 1. EDITORIAL HEADER & NAVIGATION                                          */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-ground/90 backdrop-blur-md border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-md border border-hairline-strong bg-surface flex items-center justify-center text-lg">
              🔍
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-widest text-white uppercase font-mono">
                ALIBI VAULT
              </span>
              <span className="text-xs font-mono text-mint tracking-wider uppercase">
                Scotland Yard 221B // NEAR Testnet
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Clean & Spacious) */}
          <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-slate-300">
            <a href="#pillars" className="hover:text-gold transition-colors">
              Pilar Protokol
            </a>
            <a href="#suspects" className="hover:text-gold transition-colors">
              Dossier Sindikat
            </a>
            <a href="#economy" className="hover:text-gold transition-colors">
              Pasar Bukti
            </a>
            <a href="#architecture" className="hover:text-gold transition-colors">
              Arsitektur TEE
            </a>
          </nav>

          {/* Primary Action Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/terminal"
              className="px-5 py-2.5 rounded-lg bg-gold text-ground font-bold text-xs uppercase tracking-wider hover:bg-gold/90 transition shadow-subtle flex items-center gap-2"
            >
              <span>Buka Terminal</span>
              <span className="text-sm">↗</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (Impeccable Anti-Slop Compliant)                          */}
      {/* ========================================================================= */}
      <section className="relative pt-44 pb-28 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Status indicator (Static & Honest - No pulse anti-pattern) */}
        <div className="hero-status inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-hairline text-xs font-mono text-gold mb-8">
          <span className="w-2 h-2 rounded-full bg-gold" />
          <span>AUTONOMOUS ON-CHAIN AI SUSPECT BOUNTY VAULT</span>
        </div>

        {/* Grand Headline (Solid Colors - No gradient text anti-pattern) */}
        <h1 className="hero-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-editorial font-bold tracking-tight leading-[1.08] text-white max-w-5xl">
          Where Alibis Break On NEAR Protocol.
        </h1>

        {/* Subtitle with High-Contrast Legible Body Font */}
        <p className="hero-description mt-8 text-lg sm:text-xl text-slate-300 max-w-[62ch] font-normal leading-relaxed">
          Sindikat kriminal otonom yang menguasai brankasnya sendiri di smart contract. Diinterogasi
          melalui hardware enclave rahasia <strong className="text-white">AMD SEV-SNP</strong> dengan
          pembagian hadiah bounty 90/10 dan eksekusi instan tanpa pop-up dompet.
        </p>

        {/* CTA Group (Spacious & Neutral Elevation) */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-5">
          <Link
            href="/terminal"
            className="hero-cta w-full sm:w-auto px-8 py-4 rounded-xl bg-gold text-ground font-bold text-sm uppercase tracking-wider hover:bg-gold/90 transition shadow-subtle flex items-center justify-center gap-3"
          >
            <span>Masuk Meja Interogasi 221B</span>
            <span className="text-base">→</span>
          </Link>

          <a
            href="#pillars"
            className="hero-cta w-full sm:w-auto px-8 py-4 rounded-xl bg-surface border border-hairline text-white font-bold text-sm hover:border-hairline-strong transition flex items-center justify-center gap-2"
          >
            <span>Pelajari Protokol</span>
            <span>↓</span>
          </a>
        </div>

        {/* Live On-Chain Telemetry Strip (Flat Single Container - No nested cards) */}
        <div className="hero-telemetry mt-20 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-surface border border-hairline shadow-subtle">
          <div className="text-left p-2">
            <span className="text-xs font-mono text-slate-400 uppercase block">Active Bounty Pool</span>
            <span className="text-2xl font-bold font-mono text-gold mt-1 block">
              {jackpotNear} NEAR
            </span>
          </div>

          <div className="text-left p-2 border-l border-hairline">
            <span className="text-xs font-mono text-slate-400 uppercase block">Target Aktif</span>
            <span className="text-base font-bold text-white mt-1 block truncate">
              {activeCase?.suspect_name || "Vex the Phantom"}
            </span>
          </div>

          <div className="text-left p-2 border-l border-hairline">
            <span className="text-xs font-mono text-slate-400 uppercase block">Hardware Enclave</span>
            <span className="text-sm font-bold text-mint mt-1 block flex items-center gap-1.5">
              <span>🔒</span> AMD SEV-SNP
            </span>
          </div>

          <div className="text-left p-2 border-l border-hairline">
            <span className="text-xs font-mono text-slate-400 uppercase block">Wallet Pop-ups</span>
            <span className="text-base font-bold text-white mt-1 block">
              0 (Signless Key)
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE THREE PILLARS (Awwwards 3-Column Editorial Grid)                   */}
      {/* ========================================================================= */}
      <section id="pillars" className="py-28 px-6 sm:px-12 max-w-7xl mx-auto border-t border-hairline">
        <div className="mb-16 text-center sm:text-left">
          <h2 className="text-3xl sm:text-5xl font-editorial font-bold text-white tracking-tight">
            Tiga Pilar Arsitektur Alibi Vault
          </h2>
          <p className="mt-3 text-base text-slate-300 max-w-[60ch]">
            Fondasi teknis yang menghubungkan ekonomi game, komputasi AI privat, dan utilitas token digital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pilar 1 */}
          <div className="pillar-card p-8 rounded-2xl bg-surface border border-hairline flex flex-col justify-between hover:border-hairline-strong transition shadow-subtle">
            <div>
              <div className="flex items-start gap-3.5 mb-4">
                <span className="text-2xl mt-0.5 select-none" aria-hidden="true">💰</span>
                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                  Autonomous Bounty Vault & Bagi Hasil 90/10
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-[55ch]">
                Tersangka memegang brankas dana kaburnya sendiri di smart contract. Setiap interogasi memungut
                biaya warrant fee yang langsung menambah jackpot. Saat tersangka menyerah, 90% brankas dibagikan
                proporsional ke seluruh detektif penyumbang damage, dan 10% menjadi bonus final blow bagi penakluk akhir.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-hairline text-xs font-mono text-slate-400">
              Contract Enforced • Zero House Cut
            </div>
          </div>

          {/* Pilar 2 */}
          <div className="pillar-card p-8 rounded-2xl bg-surface border border-hairline flex flex-col justify-between hover:border-hairline-strong transition shadow-subtle">
            <div>
              <div className="flex items-start gap-3.5 mb-4">
                <span className="text-2xl mt-0.5 select-none" aria-hidden="true">🔒</span>
                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                  NEAR AI Cloud TEE Hardware Enclave
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-[55ch]">
                Model LLM tersangka berjalan di dalam enclave komputasi rahasia AMD SEV-SNP. Seluruh data identitas
                detektif disaring melalui Zero-Knowledge PII Redaction. Pengakuan bersalah diverifikasi dengan
                tanda tangan digital ECDSA yang membuktikan keaslian proses secara on-chain.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-hairline text-xs font-mono text-mint">
              Hardware Attested • Anti-Replay Proofs
            </div>
          </div>

          {/* Pilar 3 */}
          <div className="pillar-card p-8 rounded-2xl bg-surface border border-hairline flex flex-col justify-between hover:border-hairline-strong transition shadow-subtle">
            <div>
              <div className="flex items-start gap-3.5 mb-4">
                <span className="text-2xl mt-0.5 select-none" aria-hidden="true">🎖️</span>
                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                  Lencana Detektif On-Chain Dinamis
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-[55ch]">
                Kredensial Scotland Yard berstandar NEP-171 & NEP-177 dirender langsung dari bytecode smart contract
                sebagai gambar vektor SVG murni tanpa ketergantungan server hosting atau IPFS luar. Lencana otomatis
                naik tingkat seiring kasus yang Anda pecahkan: Rookie, Inspector, hingga Chief Detective.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-hairline text-xs font-mono text-brick">
              100% On-Chain SVG • Zero IPFS Lag
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SUSPECT SYNDICATE SHOWCASE (Flat Hierarchy - No Nested Cards)          */}
      {/* ========================================================================= */}
      <section id="suspects" className="py-28 px-6 sm:px-12 max-w-7xl mx-auto border-t border-hairline">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-editorial font-bold text-white tracking-tight">
              Tiga Tersangka Sindikat Kriminal
            </h2>
            <p className="mt-3 text-base text-slate-300 max-w-[58ch]">
              Setiap tersangka memiliki ketahanan mental bertingkat, kondisi psikologis dinamis, dan alibi spesifik.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Suspect 1 */}
          <div className="suspect-item p-8 rounded-2xl bg-surface border-2 border-gold/50 flex flex-col justify-between shadow-subtle">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-ground text-gold border border-gold/40 uppercase">
                  Kasus #01 • Target Aktif
                </span>
                <span className="text-xs font-mono text-slate-300">1,000 HP</span>
              </div>

              {/* Crisp Suspect Sprite Presentation */}
              <div className="w-full py-8 flex justify-center bg-ground rounded-xl border border-hairline mb-5">
                <svg
                  viewBox="0 0 32 36"
                  className="w-24 h-28"
                  shapeRendering="crispEdges"
                  style={{ imageRendering: "pixelated" }}
                >
                  <rect x="7" y="2" width="18" height="2" fill="#1f2942" />
                  <rect x="9" y="4" width="14" height="4" fill="#2a1d17" />
                  <rect x="9" y="7" width="14" height="2" fill="#e05e26" />
                  <rect x="5" y="8" width="22" height="2" fill="#1f2942" />
                  <rect x="10" y="10" width="12" height="10" fill="#261d18" />
                  <rect x="10" y="10" width="12" height="3" fill="#160f0c" />
                  <rect x="11" y="13" width="4" height="3" fill="#f1c84b" />
                  <rect x="12" y="14" width="2" height="1" fill="#ffffff" />
                  <rect x="17" y="13" width="4" height="2" fill="#1f2942" />
                  <rect x="18" y="13" width="2" height="1" fill="#7dd3c7" />
                  <rect x="7" y="18" width="18" height="4" fill="#1f2942" />
                  <rect x="11" y="19" width="10" height="3" fill="#4b5b81" />
                  <rect x="15" y="20" width="2" height="2" fill="#e05e26" />
                  <rect x="6" y="22" width="20" height="12" fill="#1c1512" />
                  <rect x="9" y="22" width="14" height="12" fill="#2a1d17" />
                  <rect x="15" y="24" width="2" height="2" fill="#f1c84b" />
                  <rect x="15" y="28" width="2" height="2" fill="#f1c84b" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-white">Vex the Phantom</h3>
              <span className="text-xs font-mono text-gold block mt-1">Pencopet Ulung & Penadah Sindikat</span>
              <p className="text-sm text-slate-300 mt-4 leading-relaxed font-normal max-w-[50ch]">
                Memiliki alibi fisik yang telah dipersiapkan matang. Namun audit finansial dan berkas kunci brankas
                menjadi titik celah mematikan yang meruntuhkan pertahanannya.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Demeanor:</span>
              <span className="text-gold font-bold">Arrogant & Dismissive</span>
            </div>
          </div>

          {/* Suspect 2 */}
          <div className="suspect-item p-8 rounded-2xl bg-surface border border-hairline flex flex-col justify-between opacity-85 shadow-subtle">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-ground text-slate-400 border border-hairline uppercase">
                  Kasus #02 • Terkunci
                </span>
                <span className="text-xs font-mono text-slate-400">1,200 HP</span>
              </div>

              <div className="w-full py-8 flex justify-center bg-ground rounded-xl border border-hairline mb-5">
                <svg
                  viewBox="0 0 32 36"
                  className="w-24 h-28"
                  shapeRendering="crispEdges"
                  style={{ imageRendering: "pixelated" }}
                >
                  <rect x="10" y="1" width="12" height="8" fill="#160f0c" />
                  <rect x="10" y="8" width="12" height="2" fill="#f1c84b" />
                  <rect x="6" y="10" width="20" height="2" fill="#160f0c" />
                  <rect x="10" y="12" width="12" height="8" fill="#e0c7a8" />
                  <rect x="10" y="17" width="12" height="4" fill="#ffffff" />
                  <rect x="11" y="14" width="3" height="3" fill="#7dd3c7" stroke="#f1c84b" strokeWidth="0.5" />
                  <rect x="17" y="14" width="3" height="3" fill="#7dd3c7" stroke="#f1c84b" strokeWidth="0.5" />
                  <rect x="19" y="18" width="6" height="2" fill="#362820" />
                  <rect x="24" y="16" width="3" height="4" fill="#e05e26" />
                  <rect x="6" y="21" width="20" height="13" fill="#1f2942" />
                  <rect x="13" y="21" width="6" height="6" fill="#ffffff" />
                  <rect x="10" y="28" width="12" height="1" fill="#f1c84b" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-white">Cipher the Broker</h3>
              <span className="text-xs font-mono text-slate-400 block mt-1">Bankir Gelap & Pengendali Arus Kas</span>
              <p className="text-sm text-slate-300 mt-4 leading-relaxed font-normal max-w-[50ch]">
                Kebal terhadap tuduhan pembukuan karena berlindung di balik kerahasiaan bank Swiss. Lemah terhadap
                bukti visual rol film dan jejak kaki di dermaga.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Demeanor:</span>
              <span className="text-slate-400 font-bold">Stoic & Cold</span>
            </div>
          </div>

          {/* Suspect 3 */}
          <div className="suspect-item p-8 rounded-2xl bg-surface border border-hairline flex flex-col justify-between opacity-85 shadow-subtle">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-ground text-slate-400 border border-hairline uppercase">
                  Kasus #03 • Terkunci
                </span>
                <span className="text-xs font-mono text-slate-400">1,400 HP</span>
              </div>

              <div className="w-full py-8 flex justify-center bg-ground rounded-xl border border-hairline mb-5">
                <svg
                  viewBox="0 0 32 36"
                  className="w-24 h-28"
                  shapeRendering="crispEdges"
                  style={{ imageRendering: "pixelated" }}
                >
                  <rect x="9" y="3" width="14" height="6" rx="2" fill="#241b16" />
                  <rect x="6" y="8" width="20" height="2" fill="#160f0c" />
                  <rect x="10" y="10" width="12" height="9" fill="#cbb497" />
                  <rect x="11" y="12" width="4" height="4" fill="#f1c84b" stroke="#e05e26" strokeWidth="0.5" />
                  <rect x="12" y="13" width="2" height="2" fill="#7dd3c7" />
                  <rect x="17" y="13" width="3" height="2" fill="#160f0c" />
                  <rect x="7" y="19" width="18" height="5" fill="#32241c" />
                  <rect x="12" y="19" width="8" height="4" fill="#4b5b81" />
                  <rect x="15" y="20" width="2" height="4" fill="#f1c84b" />
                  <rect x="6" y="24" width="20" height="10" fill="#1f2942" />
                  <rect x="13" y="24" width="6" height="10" fill="#241b16" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-white">The Architect</h3>
              <span className="text-xs font-mono text-slate-400 block mt-1">Dalang Otak Kriminal Sindikat</span>
              <p className="text-sm text-slate-300 mt-4 leading-relaxed font-normal max-w-[50ch]">
                Mengendalikan sindikat dari bayang-bayang. Alibi fisiknya terlindung rapi, namun sadapan fonograf
                dan kunci dekoder mekanis utama dapat membungkamnya seketika.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Demeanor:</span>
              <span className="text-slate-400 font-bold">Paranoid & High-Strung</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. EVIDENCE ECONOMY (NEP-245 Token Supply Balancing)                      */}
      {/* ========================================================================= */}
      <section id="economy" className="py-28 px-6 sm:px-12 max-w-7xl mx-auto border-t border-hairline">
        <div className="mb-16">
          <h2 className="text-3xl sm:text-5xl font-editorial font-bold text-white tracking-tight">
            Lima Tingkat Bukti & Pasar Barter Informan
          </h2>
          <p className="mt-3 text-base text-slate-300 max-w-[62ch] font-normal leading-relaxed">
            Semakin banyak detektif menggunakan satu jenis bukti, alibi tersangka akan beradaptasi dan semakin kebal
            terhadap bukti tersebut. Detektif harus berspekulasi, menyisir TKP, atau menukar bukti di informan pasar gelap.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              tier: "Tier 1",
              icon: "🕯️",
              name: "Abu Cerutu & Lilin",
              pts: "1 Pt",
              power: "180 HP",
              desc: "Residu TKP Baker Street. Uji pertahanan awal.",
            },
            {
              tier: "Tier 2",
              icon: "📸",
              name: "Jejak Sepatu & Film",
              pts: "2 Pts",
              power: "360 HP",
              desc: "Rekaman visual timeline dan jejak lumpur fisik.",
            },
            {
              tier: "Tier 3",
              icon: "📜",
              name: "Buku Kas Swiss",
              pts: "5 Pts",
              power: "900 HP",
              desc: "Audit finansial rahasia obligasi Zurich.",
            },
            {
              tier: "Tier 4",
              icon: "🎙️",
              name: "Sadapan Fonograf",
              pts: "10 Pts",
              power: "1,800 HP",
              desc: "Rekaman silinder suara konspirasi sindikat.",
            },
            {
              tier: "Tier 5",
              icon: "🗝️",
              name: "Kunci Master Brankas",
              pts: "25 Pts",
              power: "4,500 HP",
              desc: "Dekoder kuningan pemecah alibi utama.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="evidence-col p-6 rounded-2xl bg-surface border border-hairline flex flex-col justify-between hover:border-hairline-strong transition shadow-subtle"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-ground text-gold border border-hairline">
                    {item.tier}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">{item.name}</h3>
                <p className="text-xs text-slate-300 font-normal leading-relaxed mt-2">{item.desc}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-hairline flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Nilai: <strong className="text-white">{item.pts}</strong></span>
                <span className="text-mint font-bold">{item.power}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PROTOCOL ARCHITECTURE & VERIFIED CONTRACT                              */}
      {/* ========================================================================= */}
      <section id="architecture" className="py-28 px-6 sm:px-12 max-w-7xl mx-auto border-t border-hairline">
        <div
          id="architecture-panel"
          className="p-8 sm:p-12 rounded-3xl bg-surface border border-hairline shadow-subtle flex flex-col lg:flex-row items-center justify-between gap-10"
        >
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-white tracking-tight">
              Diverifikasi Penuh di NEAR Testnet
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-[56ch]">
              Seluruh logika alibi, vault damage, pembagian hadiah 90/10, dan minting NFT lencana SVG dieksekusi
              oleh Smart Contract Rust di jaringan publik NEAR. Tidak ada manipulasi server sentral.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-ground border border-hairline flex items-center justify-between">
                <span className="text-slate-400">CONTRACT ACCOUNT:</span>
                <span className="text-gold font-bold">{CONTRACT_ID}</span>
              </div>
              <div className="p-3 rounded-xl bg-ground border border-hairline flex items-center justify-between">
                <span className="text-slate-400">RPC NODE:</span>
                <span className="text-white font-mono">FastNEAR (test.rpc.fastnear.com)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full sm:w-auto">
            <a
              href={`https://testnet.nearblocks.io/address/${CONTRACT_ID}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-4 rounded-xl bg-ground border border-hairline text-white font-mono text-xs font-bold hover:border-hairline-strong transition text-center flex items-center justify-center gap-2"
            >
              <span>Lihat di NearBlocks Explorer</span>
              <span>↗</span>
            </a>
            <Link
              href="/terminal"
              className="px-8 py-4 rounded-xl bg-gold text-ground font-bold text-sm uppercase tracking-wider hover:bg-gold/90 transition shadow-subtle text-center flex items-center justify-center gap-2"
            >
              <span>Mulai Interogasi Sekarang</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. GRAND EDITORIAL FOOTER                                                 */}
      {/* ========================================================================= */}
      <footer className="border-t border-hairline py-16 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="text-base">🔍</span>
          <span className="text-white font-bold">ALIBI VAULT // SCOTLAND YARD 221B</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">NEAR Hackathon 2026</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/terminal" className="text-gold hover:underline font-bold">
            Terminal Interogasi
          </Link>
          <a
            href={`https://testnet.nearblocks.io/address/${CONTRACT_ID}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition"
          >
            NearBlocks
          </a>
          <a
            href="https://cloud.near.ai"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition"
          >
            NEAR AI Cloud
          </a>
        </div>
      </footer>
    </div>
  );
}
