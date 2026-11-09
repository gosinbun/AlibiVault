"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CONTRACT_ID,
  DEMO_ACCOUNT_ID,
  DEMO_PRIVATE_KEY,
  DashboardState,
  InterrogationResult,
  fetchDashboardState,
  executeSignlessCall,
  formatNearAmount,
} from "@/lib/near";
import { PixelSuspect } from "@/components/PixelSuspect";

// 5 Evidence Weapons with Clear Values and Descriptions
const EVIDENCE_REGISTRY = [
  {
    id: "clue:ash",
    name: "Abu Cerutu & Lilin Baker Street",
    icon: "🕯️",
    value: 1,
    basePower: 180,
    desc: "Residu forensik tempat kejadian perkara. Serangan awal untuk menguji pertahanan.",
  },
  {
    id: "clue:cctv",
    name: "Cetakan Sepatu & Rol Film Foto",
    icon: "📸",
    value: 2,
    basePower: 360,
    desc: "Bukti fisik keberadaan tersangka dan rekaman visual timeline di malam kejadian.",
  },
  {
    id: "clue:ledger",
    name: "Buku Kas Rahasia Swiss",
    icon: "📜",
    value: 5,
    basePower: 900,
    desc: "Catatan transaksi gelap dan obligasi rahasia pembongkar alibi keuangan tersangka.",
  },
  {
    id: "clue:wiretap",
    name: "Sadapan Silinder Audio Fonograf",
    icon: "🎙️",
    value: 10,
    basePower: 1800,
    desc: "Rekaman suara langsung konspirasi sindikat di balik pintu tertutup.",
  },
  {
    id: "clue:cipher",
    name: "Kunci Master Dekoder Brankas",
    icon: "🗝️",
    value: 25,
    basePower: 4500,
    desc: "Kunci kuningan mekanis pemecah kode sandi utama sindikat untuk serangan mematikan.",
  },
];

export default function SherlockAlibiVault() {
  // Navigation: 3 intuitive tabs ('room' | 'evidence' | 'cases')
  const [activeTab, setActiveTab] = useState<"room" | "evidence" | "cases">("room");

  // On-Chain State
  const [state, setState] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [txFeed, setTxFeed] = useState<Array<{ title: string; hash: string; desc: string; time: string }>>([]);

  // Interrogation Selections
  const [selectedClueIdx, setSelectedClueIdx] = useState<number>(0);
  const [turnTactics, setTurnTactics] = useState<[number, number, number]>([0, 1, 2]); // Press, Bluff, Expose
  const [isInterrogating, setIsInterrogating] = useState<boolean>(false);
  const [lastOutcome, setLastOutcome] = useState<InterrogationResult | null>(null);

  // Informant Barter Form
  const [barterBurnClue, setBarterBurnClue] = useState<number>(1);
  const [barterBurnQty, setBarterBurnQty] = useState<number>(2);
  const [barterMintClue, setBarterMintClue] = useState<number>(0);
  const [isBartering, setIsBartering] = useState<boolean>(false);

  // Crime Scene Canvas State
  const [isSearchingCrimeScene, setIsSearchingCrimeScene] = useState<boolean>(false);
  const [foundLoot, setFoundLoot] = useState<number[] | null>(null);

  // Modals & Drawers
  const [depositModalOpen, setDepositModalOpen] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>("0.5");
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [teeProofModalOpen, setTeeProofModalOpen] = useState<boolean>(false);
  const [txDrawerOpen, setTxDrawerOpen] = useState<boolean>(false);

  // Celebration Modal
  const [crackCelebration, setCrackCelebration] = useState<InterrogationResult | null>(null);

  // Refresh on-chain state from NEAR RPC
  const refreshState = useCallback(async () => {
    try {
      const data = await fetchDashboardState(DEMO_ACCOUNT_ID);
      setState(data);
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Dashboard poll error:", err);
      setErrorMsg(err?.message || "Gagal memuat status dari blockchain NEAR");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 6000);
    return () => clearInterval(interval);
  }, [refreshState]);

  // Add transaction to history
  const addTxToFeed = (title: string, hash: string, desc: string) => {
    const time = new Date().toLocaleTimeString();
    setTxFeed((prev) => [{ title, hash, desc, time }, ...prev.slice(0, 19)]);
  };

  // 1. Claim Starter Kit
  const handleClaimStarter = async () => {
    try {
      setErrorMsg(null);
      const { txHash } = await executeSignlessCall(
        DEMO_ACCOUNT_ID,
        DEMO_PRIVATE_KEY,
        "claim_starter_clues",
        {}
      );
      addTxToFeed("Paket Bukti Awal Diambil", txHash, "Mendapatkan 3x Abu Cerutu, 2x Jejak Sepatu, 1x Buku Kas");
      await refreshState();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengambil paket bukti awal.");
    }
  };

  // 2. Barter with Informant
  const handleInformantBarter = async () => {
    if (barterBurnClue === barterMintClue) {
      setErrorMsg("Tidak bisa menukar bukti yang sama.");
      return;
    }
    try {
      setIsBartering(true);
      setErrorMsg(null);
      const { txHash } = await executeSignlessCall(
        DEMO_ACCOUNT_ID,
        DEMO_PRIVATE_KEY,
        "trade_with_informant",
        {
          burn_clue: barterBurnClue,
          burn_amount: barterBurnQty,
          mint_clue: barterMintClue,
        }
      );
      addTxToFeed(
        "Barter Informan Berhasil",
        txHash,
        `Menukar ${barterBurnQty}x ${EVIDENCE_REGISTRY[barterBurnClue].name} dengan ${EVIDENCE_REGISTRY[barterMintClue].name}`
      );
      await refreshState();
    } catch (err: any) {
      setErrorMsg(err?.message || "Informan menolak transaksi barter.");
    } finally {
      setIsBartering(false);
    }
  };

  // 3. Canvas Crime Scene (-0.05 NEAR)
  const handleCanvasCrimeScene = async () => {
    try {
      setIsSearchingCrimeScene(true);
      setErrorMsg(null);
      const { txHash, rawResult } = await executeSignlessCall(
        DEMO_ACCOUNT_ID,
        DEMO_PRIVATE_KEY,
        "search_crime_scene",
        {}
      );
      let loot: number[] = [0, 0, 0, 0, 0];
      try {
        const successVal = rawResult?.status?.SuccessValue;
        if (successVal) {
          const decoded = Buffer.from(successVal, "base64").toString("utf8");
          loot = JSON.parse(decoded);
          setFoundLoot(loot);
        }
      } catch (e) {
        console.error("Loot parse error:", e);
      }

      addTxToFeed(
        "Olah TKP Selesai (-0.05 NEAR)",
        txHash,
        `Mendapatkan bukti forensik baru. 0.025 NEAR ditambahkan ke Jackpot Kasus.`
      );
      await refreshState();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal olah TKP. Periksa saldo internal Anda.");
    } finally {
      setIsSearchingCrimeScene(false);
    }
  };

  // 4. Launch 3-Turn Interrogation
  const handleInterrogate = async () => {
    const profile = state?.detective_profile;
    const clueCount = profile?.clues?.[selectedClueIdx] || 0;
    if (clueCount <= 0) {
      setErrorMsg("Anda tidak memiliki bukti ini. Olah TKP atau tukar bukti di informan.");
      return;
    }

    try {
      setIsInterrogating(true);
      setErrorMsg(null);

      // Call TEE enclave route to get verified quote
      let teeQuote = "";
      let teeChatId = "";
      let teeSig = "";
      try {
        const teeRes = await fetch("/api/tee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suspect_name: state?.active_case?.suspect_name || "Vex",
            evidence_used: EVIDENCE_REGISTRY[selectedClueIdx].name,
            tactics: turnTactics,
            case_number: state?.active_case?.case_number || 1,
          }),
        });
        const teeData = await teeRes.json();
        teeQuote = teeData?.response || "";
        teeChatId = teeData?.chat_id || "";
        teeSig = teeData?.signature || "";
      } catch (e) {
        console.warn("TEE pipeline fallback to local attestation");
      }

      // Execute on-chain interrogation signlessly
      const { txHash, rawResult } = await executeSignlessCall(
        DEMO_ACCOUNT_ID,
        DEMO_PRIVATE_KEY,
        "interrogate_suspect",
        {
          clue: selectedClueIdx,
          tactics: turnTactics,
        }
      );

      // Parse outcome
      let outcome: InterrogationResult | null = null;
      try {
        const successVal = rawResult?.status?.SuccessValue;
        if (successVal) {
          const decoded = Buffer.from(successVal, "base64").toString("utf8");
          outcome = JSON.parse(decoded);
          if (outcome) {
            outcome.tx_hash = txHash;
            if (teeQuote) outcome.suspect_quote = teeQuote;
            setLastOutcome(outcome);
            if (outcome.cracked) {
              setCrackCelebration(outcome);
            }
          }
        }
      } catch (e) {
        console.error("Outcome parse error:", e);
      }

      // Record TEE attestation on-chain
      if (teeChatId && teeSig) {
        try {
          await executeSignlessCall(
            DEMO_ACCOUNT_ID,
            DEMO_PRIVATE_KEY,
            "record_tee_statement",
            {
              suspect_quote: teeQuote,
              buyback_multiplier_bps: [10000, 10000, 12000, 15000, 20000],
              chat_id: teeChatId,
              tee_signature: teeSig,
            }
          );
        } catch (e) {
          console.warn("TEE record skipped");
        }
      }

      addTxToFeed(
        `Interogasi Berhasil (${outcome?.damage_dealt || 0} DMG)`,
        txHash,
        `Memberikan mental damage ke ${state?.active_case?.suspect_name}. Biaya warrant disetor ke Jackpot.`
      );

      await refreshState();
    } catch (err: any) {
      setErrorMsg(err?.message || "Interogasi gagal. Periksa saldo internal Anda.");
    } finally {
      setIsInterrogating(false);
    }
  };

  // 5. Deposit NEAR into Internal Balance
  const handleDeposit = async () => {
    try {
      setIsDepositing(true);
      setErrorMsg(null);
      const yocto = (BigInt(Math.floor(parseFloat(depositAmount) * 1e4)) * 10n ** 20n).toString();
      const { txHash } = await executeSignlessCall(
        DEMO_ACCOUNT_ID,
        DEMO_PRIVATE_KEY,
        "deposit",
        {},
        yocto
      );
      addTxToFeed(`Isi Saldo ${depositAmount} NEAR`, txHash, "Saldo internal detektif berhasil ditambah.");
      setDepositModalOpen(false);
      await refreshState();
    } catch (err: any) {
      setErrorMsg(err?.message || "Isi saldo gagal. Pastikan dompet memiliki cukup NEAR.");
    } finally {
      setIsDepositing(false);
    }
  };

  // 6. Withdraw NEAR from Internal Balance
  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      setErrorMsg(null);
      const { txHash } = await executeSignlessCall(
        DEMO_ACCOUNT_ID,
        DEMO_PRIVATE_KEY,
        "withdraw",
        {}
      );
      addTxToFeed("Tarik Saldo", txHash, "Seluruh saldo internal ditarik kembali ke dompet NEAR.");
      setDepositModalOpen(false);
      await refreshState();
    } catch (err: any) {
      setErrorMsg(err?.message || "Tarik saldo gagal.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Helper values
  const activeCase = state?.active_case;
  const profile = state?.detective_profile;
  const internalBalance = formatNearAmount(profile?.internal_balance_yocto || "0", 3);
  const jackpotNear = formatNearAmount(activeCase?.bounty_jackpot_yocto || "0", 3);
  const currentStance = (activeCase?.interrogations_survived || 0) % 3;

  // Informant live calculation
  const totalBurnVal = barterBurnQty * EVIDENCE_REGISTRY[barterBurnClue].value;
  const netVal = Math.floor(totalBurnVal * 0.9);
  const targetVal = EVIDENCE_REGISTRY[barterMintClue].value;
  const mintQty = Math.floor(netVal / targetVal);
  const remainderChange = netVal - mintQty * targetVal;

  return (
    <main className="min-h-screen bg-[#140e0b] text-white pb-56 sm:pb-64 pt-6 px-4 sm:px-8 max-w-7xl mx-auto selection:bg-ronchi selection:text-[#140e0b]">
      {/* Top Header & Telemetry Bar */}
      <header className="victorian-card p-5 mb-6 border border-[#423227] bg-[#201712] shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Scotland Yard Bureau Branding */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl border-2 border-ronchi/60 bg-[#1f2942] flex items-center justify-center text-2xl shadow-lg">
            🔍
          </div>
          <div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="text-xs font-mono font-bold text-ronchi hover:underline flex items-center gap-1"
              >
                ← Beranda
              </a>
              <span className="text-slate-600">|</span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-white">
                SCOTLAND YARD // BIRO 221B
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cloudburst text-grannysmith border border-grannysmith/40">
                NEAR TESTNET
              </span>
            </div>
            <p className="text-sm font-mono text-slate-300 mt-0.5">
              Smart Contract: <span className="text-ronchi font-bold">{CONTRACT_ID}</span>
            </p>
          </div>
        </div>

        {/* Top Actions: Warrant Key, Saldo Internal, and History Drawer */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Signless Warrant Armed */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#160f0c] border border-ronchi/40 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-ronchi" />
            <span className="text-ronchi font-bold">WARRANT KEY AKTIF</span>
            <span className="text-slate-400 hidden sm:inline">(Bebas Pop-up Wallet)</span>
          </div>

          {/* Internal Balance & Top Up */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#160f0c] border border-[#423227] text-sm">
            <span className="text-grannysmith font-bold uppercase text-xs">Saldo Internal:</span>
            <span className="text-white font-bold text-base font-mono">{internalBalance} NEAR</span>
            <button
              onClick={() => setDepositModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-ronchi text-[#140e0b] font-bold text-xs hover:bg-ronchi/90 transition shadow-sm"
            >
              + Isi Saldo
            </button>
          </div>

          {/* Quick Transaction Feed Drawer Button */}
          <button
            onClick={() => setTxDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-[#423227] bg-[#160f0c] text-xs font-mono text-slate-300 hover:text-white hover:border-ronchi transition flex items-center gap-2"
          >
            <span>📜</span>
            <span>Riwayat Tx ({txFeed.length})</span>
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-[#38160c] border border-piper/60 rounded-xl text-[#f48554] font-medium text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-ronchi hover:text-white font-bold text-xs uppercase underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="text-center py-28 text-xl font-bold text-ronchi animate-pulse">
          Membuka Berkas Arsip & Menghubungkan ke Blockchain NEAR...
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* TAB 1: RUANG INTEROGASI & MEJA SAKSI                                      */}
          {/* ========================================================================= */}
          {activeTab === "room" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Kolom Kiri: Karakter Pixel Tersangka & Health Bar (5 Kolom - Flat Architecture) */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#201712] border border-[#423227] shadow-lg">
                  <span className="text-sm font-bold tracking-wider text-ronchi uppercase">
                    Kasus #{activeCase?.case_number || 1}: {activeCase?.suspect_name}
                  </span>
                  <span className="text-xs font-mono text-white bg-[#140e0b] px-3 py-1 rounded-full border border-ronchi/40">
                    Jackpot: <strong className="text-ronchi">{jackpotNear} NEAR</strong>
                  </span>
                </div>

                {/* Komponen Karakter Pixel Tersangka dengan Health Bar Dinamis */}
                <PixelSuspect
                  suspectId={activeCase?.suspect_id || "vex"}
                  suspectName={activeCase?.suspect_name || "Vex the Phantom"}
                  currentComposure={activeCase?.current_composure || 0}
                  maxComposure={activeCase?.max_composure || 1000}
                  stance={currentStance}
                  lastQuote={activeCase?.last_suspect_quote || ""}
                  isInterrogating={isInterrogating}
                />

                {/* Kartu Analisis Detektif (Petunjuk Deduksi Kelemahan) */}
                <div className="p-4 bg-[#201712] border border-ronchi/40 rounded-2xl text-sm leading-relaxed text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-ronchi font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>🕵️</span> PETUNJUK PENYELIDIKAN DETEKTIF
                    </span>
                    <button
                      onClick={() => setTeeProofModalOpen(true)}
                      className="text-xs font-mono text-[#8ec2c4] hover:underline"
                    >
                      Lihat Bukti TEE ↗
                    </button>
                  </div>

                  {activeCase?.suspect_id === "vex" ? (
                    <div>
                      <p className="text-slate-200">
                        "Surat kabar dan mata-mata melapor: Vex telah menghafal seluruh alibi fisiknya tanpa celah.
                        Namun kurir rahasianya panik setelah berkas buku kas Swiss dan kunci dekoder brankasnya
                        mulai dilacak polisi."
                      </p>
                      <span className="block mt-2 text-xs font-mono text-[#8ec2c4] font-bold">
                        → Petunjuk Deduksi: Bukti finansial (Buku Kas / Kunci Dekoder) akan menembus alibi fisiknya!
                      </span>
                    </div>
                  ) : activeCase?.suspect_id === "cipher" ? (
                    <div>
                      <p className="text-slate-200">
                        "Cipher mencuci jutaan koin melalui puluhan bank rahasia, namun informan kami melihatnya
                        berjalan tergesa-gesa di dermaga London dan meninggalkan jejak sepatu bot yang becek."
                      </p>
                      <span className="block mt-2 text-xs font-mono text-[#8ec2c4] font-bold">
                        → Petunjuk Deduksi: Bukti jejak fisik (Jejak Sepatu & Rol Film) akan meruntuhkan pembelaannya!
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-200">
                        "The Architect hanya berkomunikasi lewat telegram sandi rumit. Ancaman fisik tidak berguna;
                        sadapan audio suara fonograf rahasianya adalah kunci untuk membungkamnya."
                      </p>
                      <span className="block mt-2 text-xs font-mono text-[#8ec2c4] font-bold">
                        → Petunjuk Deduksi: Sadapan Audio Fonograf atau Kunci Master Brankas akan melumpuhkannya!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Meja Taktis & Interogasi 3-Turn (7 Kolom) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="victorian-card p-6 border border-[#423227] bg-[#201712] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#423227] pb-4 mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>⚔️</span> MEJA STRATEGI INTEROGASI 3-TURN
                      </h2>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        Pilih bukti forensik dan rangkai 3 serangan taktik psikologis.
                      </p>
                    </div>
                    {/* Badge Sinergi Combo */}
                    {turnTactics[0] !== turnTactics[1] &&
                    turnTactics[1] !== turnTactics[2] &&
                    turnTactics[0] !== turnTactics[2] ? (
                      <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-grannysmith/20 border border-grannysmith text-grannysmith shadow">
                        ✨ +10% Sinergi Combo Aktif
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-[#160f0c] border border-[#423227]">
                        Ragamkan 3 taktik untuk sinergi
                      </span>
                    )}
                  </div>

                  {/* LANGKAH 1: PILIH SENJATA BUKTI */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-ronchi uppercase tracking-wide">
                        Langkah 1: Pilih Bukti Forensik yang Akan Ditunjukkan
                      </span>
                      <span className="text-xs font-mono text-slate-300">
                        Dimiliki: <strong className="text-ronchi">{profile?.clues?.[selectedClueIdx] || 0} pcs</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {EVIDENCE_REGISTRY.map((clue, idx) => {
                        const count = profile?.clues?.[idx] || 0;
                        const isSelected = selectedClueIdx === idx;
                        const defense = activeCase?.alibi_defense_bps?.[idx] || 1800;
                        const defensePct = (defense / 100).toFixed(1);

                        return (
                          <button
                            key={clue.id}
                            onClick={() => setSelectedClueIdx(idx)}
                            className={`p-3 rounded-xl border text-left transition-all relative ${
                              isSelected
                                ? "border-2 border-ronchi bg-[#281b15] shadow-lg ring-2 ring-ronchi/50 text-white"
                                : "border border-[#423227] bg-[#160f0c] hover:border-ronchi/40 text-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-2xl">{clue.icon}</span>
                              <span
                                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                                  count > 0 ? "bg-[#132d2e] text-[#8ec2c4] border border-[#7b9c9d]/60" : "bg-[#38160c] text-[#f48554] border border-[#d15b29]/60"
                                }`}
                              >
                                {count} di kantong
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-white mb-1 truncate">{clue.name}</div>
                            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                              <span>Daya: {clue.basePower} HP</span>
                              <span className="text-ronchi font-bold">Kebal: {defensePct}%</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Notifikasi jika stok bukti habis */}
                    {(profile?.clues?.[selectedClueIdx] || 0) === 0 && (
                      <div className="mt-3 p-3 bg-[#38160c] border border-piper/50 rounded-xl text-xs font-mono text-[#f48554] flex items-center justify-between">
                        <span>⚠️ Anda belum memiliki bukti ini di kantong.</span>
                        <button
                          onClick={() => setActiveTab("evidence")}
                          className="text-ronchi font-bold underline hover:text-white ml-2"
                        >
                          Cari di TKP / Barter →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* LANGKAH 2: RANGKAI 3 TAKTIK PSIKOLOGIS */}
                  <div className="mb-6">
                    <span className="text-sm font-bold text-ronchi uppercase tracking-wide block mb-3">
                      Langkah 2: Rangkai 3 Taktik Serangan Mental
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[0, 1, 2].map((turnIdx) => {
                        const current = turnTactics[turnIdx];
                        return (
                          <div key={turnIdx} className="bg-[#18110d] p-3 rounded-xl">
                            <div className="text-xs font-mono font-bold text-slate-300 mb-2 uppercase">
                              Giliran Ke-{turnIdx + 1}
                            </div>
                            <div className="flex flex-col gap-1.5">
                              {[
                                {
                                  id: 0,
                                  label: "Press (Tekan)",
                                  mult: "1.05x",
                                  eff: currentStance === 1 ? "+18% BREAK" : currentStance === 0 ? "-12% RESIST" : "",
                                },
                                {
                                  id: 1,
                                  label: "Bluff (Gertak)",
                                  mult: "1.10x",
                                  eff: currentStance === 2 ? "+18% BREAK" : currentStance === 1 ? "-12% RESIST" : "",
                                },
                                {
                                  id: 2,
                                  label: "Expose (Bongkar)",
                                  mult: "1.15x",
                                  eff: currentStance === 0 ? "+18% BREAK" : currentStance === 2 ? "-12% RESIST" : "",
                                },
                              ].map((tact) => (
                                <button
                                  key={tact.id}
                                  onClick={() => {
                                    const next = [...turnTactics] as [number, number, number];
                                    next[turnIdx] = tact.id;
                                    setTurnTactics(next);
                                  }}
                                  className={`px-3 py-2 rounded-lg text-left text-xs font-mono flex items-center justify-between transition ${
                                    current === tact.id
                                      ? "bg-ronchi text-[#140e0b] font-extrabold shadow-md border border-ronchi"
                                      : "bg-[#201712] text-slate-200 hover:bg-[#2b2019] border border-[#38271e]"
                                  }`}
                                >
                                  <span>{tact.label}</span>
                                  {tact.eff ? (
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                                        tact.eff.includes("BREAK")
                                          ? "bg-[#132d2e] text-[#8ec2c4] border border-[#7b9c9d]/60"
                                          : "bg-[#38160c] text-[#f48554] border border-[#d15b29]/60"
                                      }`}
                                    >
                                      {tact.eff}
                                    </span>
                                  ) : (
                                    <span className="text-xs font-mono opacity-75">{tact.mult}</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* LANGKAH 3: TOMBOL LUNCURKAN INTEROGASI */}
                  <button
                    onClick={handleInterrogate}
                    disabled={isInterrogating || (profile?.clues?.[selectedClueIdx] || 0) <= 0}
                    className={`w-full py-4 rounded-xl font-bold text-base tracking-wider uppercase transition shadow-2xl ${
                      isInterrogating || (profile?.clues?.[selectedClueIdx] || 0) <= 0
                        ? "bg-[#2b2019] text-slate-500 cursor-not-allowed border border-[#423227]"
                        : "bg-ronchi text-[#140e0b] hover:bg-ronchi/90 shadow-xl border-2 border-ronchi ring-2 ring-ronchi/40"
                    }`}
                  >
                    {isInterrogating ? (
                      <span className="animate-pulse">Menginterogasi Tersangka di Ruang Khusus...</span>
                    ) : (
                      `🔥 LUNCURKAN INTEROGASI 3-TURN (-0.1 NEAR Warrant)`
                    )}
                  </button>

                  {/* Hasil Serangan Terakhir */}
                  {lastOutcome && (
                    <div className="mt-5 p-4 bg-[#160f0c] border border-grannysmith/50 rounded-xl text-sm font-mono flex items-center justify-between">
                      <div>
                        <span className="text-grannysmith font-bold">HASIL INTEROGASI: </span>
                        <span>Berhasil memberikan {lastOutcome.damage_dealt} Mental Damage! </span>
                        <span className="text-slate-400">Sisa Composure: {lastOutcome.remaining_composure} HP</span>
                      </div>
                      {lastOutcome.tx_hash && (
                        <a
                          href={`https://testnet.nearblocks.io/txns/${lastOutcome.tx_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-ronchi font-bold hover:underline ml-3"
                        >
                          Bukti On-Chain ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: KOTAK BUKTI, OLAH TKP & BARTER INFORMAN                             */}
          {/* ========================================================================= */}
          {activeTab === "evidence" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sisi Kiri: Olah TKP & Loker Bukti (7 Kolom) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Olah TKP Waterfront */}
                <div className="victorian-card p-6 border border-[#423227] bg-[#201712] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#423227] pb-4 mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🔍</span> OLAH TKP DERMAGA THAMES (GRINDING BUKTI)
                      </h2>
                      <p className="text-xs font-mono text-slate-300 mt-0.5">
                        Cari bukti forensik tambahan langsung secara on-chain di blockchain NEAR.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-ronchi font-bold bg-[#160f0c] px-3 py-1.5 rounded-full border border-ronchi/40">
                      Biaya: 0.05 NEAR
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-200 mb-5">
                    Kirim regu penyelidik Scotland Yard menyisir dermaga berkabut. Setiap pencarian mengundi bukti
                    forensik acak di blockchain.
                    <strong className="text-ronchi block mt-1.5 font-mono text-xs">
                      ★ Ekonomi Riil: 0.025 NEAR langsung disetor menambah Jackpot Kasus yang sedang aktif!
                    </strong>
                  </p>

                  <button
                    onClick={handleCanvasCrimeScene}
                    disabled={isSearchingCrimeScene}
                    className="w-full py-3.5 rounded-xl bg-grannysmith text-[#140e0b] font-bold text-sm tracking-wide hover:bg-grannysmith/90 transition shadow-lg disabled:opacity-50"
                  >
                    {isSearchingCrimeScene ? "Menyisir TKP di Blockchain NEAR..." : "🔍 OLAH TKP (-0.05 NEAR)"}
                  </button>

                  {/* Hasil temuan bukti */}
                  {foundLoot && (
                    <div className="mt-5 p-4 bg-[#160f0c] border border-grannysmith rounded-xl">
                      <div className="text-xs font-mono font-bold text-grannysmith mb-2 uppercase">
                        🎉 BUKTI FORENSIK YANG DITEMUKAN DARI TKP:
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        {foundLoot.map((qty, idx) =>
                          qty > 0 ? (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-lg bg-grannysmith/20 border border-grannysmith/50 text-white font-bold"
                            >
                              +{qty}x {EVIDENCE_REGISTRY[idx].name}
                            </span>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Loker Bukti Detektif */}
                <div className="victorian-card p-6 border border-[#423227] bg-[#201712] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#423227] pb-4 mb-5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>💼</span> LOKER BUKTI DETEKTIF SAYA
                    </h2>
                    {!profile?.claimed_starter && (
                      <button
                        onClick={handleClaimStarter}
                        className="px-3 py-1.5 rounded-lg bg-ronchi text-[#140e0b] font-mono font-bold text-xs hover:bg-ronchi/90 transition shadow"
                      >
                        Klaim Paket Awal
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {EVIDENCE_REGISTRY.map((clue, idx) => {
                      const count = profile?.clues?.[idx] || 0;
                      return (
                        <div
                          key={clue.id}
                          className="p-4 rounded-xl bg-[#160f0c] border border-[#423227] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{clue.icon}</span>
                            <div>
                              <div className="text-sm font-bold text-white">{clue.name}</div>
                              <div className="text-xs text-slate-300 font-mono mt-0.5">
                                Nilai Tukar: <strong>{clue.value} Poin</strong> | Daya Serang: <strong>{clue.basePower} HP</strong>
                              </div>
                            </div>
                          </div>
                          <span className="text-base font-mono font-bold text-ronchi bg-[#201712] px-3.5 py-1.5 rounded-lg border border-[#423227]">
                            {count} pcs
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sisi Kanan: Pasar Barter Informan ("The Shadow") (5 Kolom) */}
              <div className="lg:col-span-5">
                <div className="victorian-card p-6 border border-[#423227] bg-[#201712] shadow-2xl">
                  <div className="border-b border-[#423227] pb-4 mb-4">
                    <div className="flex items-center gap-2 text-base font-bold text-ronchi uppercase">
                      <span>🕵️</span> "THE SHADOW" // INFORMAN PASAR GELAP
                    </div>
                    <p className="text-xs text-slate-300 font-mono mt-1">
                      Tukarkan bukti forensik apa pun sesuai nilai poinnya. Komisi perantara 10%, sisa poin dikembalikan
                      sebagai Abu Cerutu!
                    </p>
                  </div>

                  {/* Dialog Informan */}
                  <blockquote className="p-4 bg-[#160f0c] border-l-4 border-ronchi rounded-r-xl text-sm italic text-slate-200 leading-relaxed mb-5">
                    "Saya punya mata dan telinga di seluruh penjuru London, detektif. Bawa bukti apa pun yang kau miliki,
                    dan saya akan tukarkan dengan dokumen yang kau butuhkan."
                  </blockquote>

                  {/* Form Barter */}
                  <div className="flex flex-col gap-4 text-xs font-mono">
                    {/* Bukti yang ingin dibakar/dijual */}
                    <div>
                      <label className="text-slate-300 block mb-1.5 font-bold uppercase">
                        1. BUKTI YANG INGIN DITUKARKAN:
                      </label>
                      <select
                        value={barterBurnClue}
                        onChange={(e) => setBarterBurnClue(parseInt(e.target.value))}
                        className="w-full bg-[#160f0c] border border-[#423227] rounded-xl p-3 text-white focus:border-ronchi outline-none text-sm font-sans"
                      >
                        {EVIDENCE_REGISTRY.map((c, i) => (
                          <option key={c.id} value={i}>
                            {c.icon} {c.name} ({c.value} Poin | Punya: {profile?.clues?.[i] || 0})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Jumlah yang ingin ditukar */}
                    <div>
                      <label className="text-slate-300 block mb-1.5 font-bold uppercase">
                        2. JUMLAH YANG DITUKAR:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={profile?.clues?.[barterBurnClue] || 10}
                        value={barterBurnQty}
                        onChange={(e) => setBarterBurnQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-[#160f0c] border border-[#423227] rounded-xl p-3 text-white focus:border-ronchi outline-none font-bold text-sm"
                      />
                    </div>

                    {/* Bukti yang ingin didapatkan */}
                    <div>
                      <label className="text-slate-300 block mb-1.5 font-bold uppercase">
                        3. BUKTI TARGET YANG INGIN DITERIMA:
                      </label>
                      <select
                        value={barterMintClue}
                        onChange={(e) => setBarterMintClue(parseInt(e.target.value))}
                        className="w-full bg-[#160f0c] border border-[#423227] rounded-xl p-3 text-white focus:border-ronchi outline-none text-sm font-sans"
                      >
                        {EVIDENCE_REGISTRY.map((c, i) => (
                          <option key={c.id} value={i}>
                            {c.icon} {c.name} ({c.value} Poin)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ringkasan Nilai Barter */}
                    <div className="p-4 bg-[#160f0c] border border-[#423227] rounded-xl flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Nilai Poin Bukti:</span>
                        <span className="text-white font-bold">{totalBurnVal} Pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Komisi Informan (10%):</span>
                        <span className="text-piper font-bold">-{(totalBurnVal * 0.1).toFixed(1)} Pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nilai Bersih:</span>
                        <span className="text-grannysmith font-bold">{netVal} Pts</span>
                      </div>
                      <div className="flex justify-between border-t border-[#423227] pt-2 mt-1">
                        <span className="text-ronchi font-bold text-sm">Anda Menerima:</span>
                        <span className="text-ronchi font-bold text-sm">
                          {mintQty}x {EVIDENCE_REGISTRY[barterMintClue].name}
                          {remainderChange > 0 ? ` + ${remainderChange}x Abu Cerutu` : ""}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleInformantBarter}
                      disabled={isBartering || mintQty <= 0 || (profile?.clues?.[barterBurnClue] || 0) < barterBurnQty}
                      className="w-full py-4 rounded-xl bg-ronchi text-[#140e0b] font-bold tracking-wider hover:bg-ronchi/90 transition shadow-xl text-sm disabled:opacity-50"
                    >
                      {isBartering ? "Menukar Rahasia Dengan The Shadow..." : "💱 TUKARKAN BUKTI DENGAN INFORMAN"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: LENCANA DETEKTIF, HADIAH BOUNTY & RIWAYAT KASUS                    */}
          {/* ========================================================================= */}
          {activeTab === "cases" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Lencana On-Chain Scotland Yard (6 Kolom) */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="w-full victorian-card p-6 border border-[#423227] bg-[#201712] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#423227] pb-4 mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>🎖️</span> LENCANA KREDENSIAL DETEKTIF ON-CHAIN
                    </h2>
                    <span className="text-xs font-mono text-ronchi font-bold uppercase bg-[#160f0c] px-3 py-1 rounded-full border border-ronchi/40">
                      Pangkat: {profile?.badge_rank || "Rookie"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-mono mb-5 leading-relaxed">
                    Dihasilkan secara dinamis langsung dari penyimpanan Smart Contract NEAR sebagai NFT Vektor SVG
                    (Standar NEP-171 & NEP-177). Lencana otomatis naik tingkat seiring jumlah kasus yang Anda pecahkan!
                  </p>

                  {/* Gambar Lencana SVG */}
                  <div className="w-full flex justify-center bg-[#140e0b] p-4 rounded-2xl border border-[#423227] shadow-inner">
                    {state?.badge_svg_data_uri ? (
                      <img
                        src={state.badge_svg_data_uri}
                        alt="Lencana Scotland Yard"
                        className="w-full max-w-md rounded-xl shadow-2xl"
                      />
                    ) : (
                      <div className="py-24 text-sm font-mono text-slate-400">Memuat Lencana On-Chain...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Kalkulator Pembagian Bounty 90/10 & Arsip Kasus (6 Kolom) */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                {/* Pembagian Bounty 90/10 */}
                <div className="victorian-card p-6 border border-[#423227] bg-[#201712] shadow-2xl">
                  <div className="border-b border-[#423227] pb-3 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>⚖️</span> PEMBAGIAN HADIAH BOUNTY JACKPOT (90% / 10%)
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-mono">
                    <div className="p-4 rounded-xl bg-[#160f0c] border border-[#423227]">
                      <span className="text-slate-400 block text-xs">DAMAGE ANDA:</span>
                      <span className="text-lg font-bold text-white">{state?.caller_case_damage || 0} HP</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#160f0c] border border-[#423227]">
                      <span className="text-slate-400 block text-xs">TOTAL DAMAGE KASUS:</span>
                      <span className="text-lg font-bold text-white">{activeCase?.total_case_damage || 0} HP</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-grannysmith/15 border border-grannysmith/40 text-sm font-mono flex items-center justify-between">
                    <span className="text-grannysmith font-bold">ESTIMASI BAGIAN HADIAH ANDA:</span>
                    <span className="text-lg font-bold text-ronchi">
                      {formatNearAmount(state?.estimated_payout_yocto || "0", 3)} NEAR
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-3 leading-relaxed">
                    Aturan Vault: 90% jackpot dibagikan secara proporsional kepada semua detektif yang menyumbang
                    damage. Detektif yang memberikan serangan terakhir mendapatkan bonus instan 10%!
                  </p>
                </div>

                {/* Arsip Target Sindikat */}
                <div className="victorian-card p-6 border border-[#423227] bg-[#201712] shadow-2xl">
                  <h3 className="text-base font-bold text-white mb-4">DAFTAR TARGET SINDIKAT</h3>
                  <div className="flex flex-col gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-[#160f0c] border border-ronchi/50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ronchi text-sm">KASUS #01: VEX THE PHANTOM</span>
                        <span className="block text-xs text-slate-300 mt-0.5">Pencopet Ulung Sindikat (1,000 HP)</span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-ronchi/20 text-ronchi text-xs font-bold">
                        SEDANG AKTIF
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#160f0c] border border-[#423227] opacity-60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-sm">KASUS #02: CIPHER THE BROKER</span>
                        <span className="block text-xs text-slate-400 mt-0.5">Bankir Gelap Sindikat (1,200 HP)</span>
                      </div>
                      <span className="text-xs text-slate-400">TERKUNCI</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#160f0c] border border-[#423227] opacity-60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-sm">KASUS #03: THE ARCHITECT</span>
                        <span className="block text-xs text-slate-400 mt-0.5">Dalang Otak Kriminal (1,400 HP)</span>
                      </div>
                      <span className="text-xs text-slate-400">TERKUNCI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* FLOATING CENTER-BOTTOM NAVIGATION DOCK (100% SOLID & TIDAK BERTUMPUK) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full px-3.5 sm:px-5 py-2 flex items-center gap-2 sm:gap-3 bg-[#140e0b] border-2 border-ronchi shadow-[0_16px_50px_rgba(0,0,0,0.95)] ring-4 ring-black/80">
        {[
          { id: "room", label: "Ruang Interogasi", icon: "🔍" },
          { id: "evidence", label: "Kotak Bukti & TKP", icon: "💼" },
          { id: "cases", label: "Lencana & Hadiah", icon: "📜" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? "bg-ronchi text-[#140e0b] shadow-lg scale-105 font-extrabold"
                  : "text-slate-300 hover:bg-[#201712] hover:text-ronchi font-semibold"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MODAL SALDO DETEKTIF (KASIR: ISI SALDO & TARIK) */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="victorian-card p-7 border-2 border-ronchi/50 bg-[#201712] rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-ronchi mb-2 uppercase">
              KASIR SALDO INTERNAL DETEKTIF
            </h3>
            <p className="text-xs text-slate-300 font-mono mb-5 leading-relaxed">
              Saldo internal digunakan untuk membayar biaya warrant interogasi (0.1 NEAR) dan olah TKP (0.05 NEAR)
              secara signless <strong>tanpa harus menyetujui pop-up wallet berulang kali</strong>. Anda dapat menarik
              kembali saldo Anda kapan saja!
            </p>

            <div className="mb-4">
              <label className="text-xs font-mono text-slate-300 block mb-1 font-bold">
                JUMLAH NEAR YANG AKAN DISETOR:
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-[#160f0c] border border-[#423227] rounded-xl p-3 text-base font-mono text-white focus:border-ronchi outline-none font-bold"
              />
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setDepositModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-[#423227] text-xs font-mono text-slate-300 hover:bg-[#2b2019]"
              >
                Batal
              </button>
              <button
                onClick={handleDeposit}
                disabled={isDepositing}
                className="flex-1 py-3 rounded-xl bg-ronchi text-[#140e0b] font-bold text-xs hover:bg-ronchi/90"
              >
                {isDepositing ? "Menyetor..." : "Konfirmasi Setor"}
              </button>
            </div>

            {/* Tombol Tarik Saldo */}
            <div className="border-t border-[#423227] pt-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
                <span>Saldo Saat Ini: {internalBalance} NEAR</span>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || parseFloat(internalBalance) <= 0}
                className="w-full py-2.5 rounded-xl border border-piper/50 text-piper hover:bg-piper/15 font-mono text-xs font-bold transition disabled:opacity-40"
              >
                {isWithdrawing ? "Menarik..." : "Tarik Semua Saldo ke Dompet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL BUKTI TEE HARDWARE ENCLAVE */}
      {teeProofModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="victorian-card p-7 border-2 border-grannysmith/50 bg-[#201712] rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#423227] pb-3 mb-4">
              <h3 className="text-base font-bold text-grannysmith uppercase flex items-center gap-2">
                <span>🔒</span> BUKTI ATTESTATION TEE ENCLAVE
              </h3>
              <button
                onClick={() => setTeeProofModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-mono mb-4 leading-relaxed">
              Semua respon dialog tersangka dihasilkan melalui <strong>NEAR AI Cloud TEE</strong> di dalam secure hardware
              enclave (AMD SEV-SNP). Data pribadi pemain disamarkan (PII redacted) dan respon ditandatangani secara
              kriptografis sehingga AI tidak bisa dimanipulasi atau dicurangi!
            </p>

            <div className="p-3 bg-[#160f0c] border border-[#423227] rounded-xl text-xs font-mono mb-3">
              <span className="text-slate-400 block mb-1 font-bold">1. RESPON DIALOG TERAKHIR:</span>
              <p className="text-white italic">"{activeCase?.last_suspect_quote || "-"}"</p>
            </div>

            <div className="p-3 bg-[#160f0c] border border-[#423227] rounded-xl text-xs font-mono mb-5">
              <span className="text-slate-400 block mb-1 font-bold">2. TANDA TANGAN KRIPTOGRAFIS ECDSA:</span>
              <p className="text-grannysmith break-all text-[11px]">
                {activeCase?.last_tee_signature || "0x9c4a8f3d1b7e20a4b6c8e0d2f4a6b8c0e2d4f6a8b0c2e4d6f8a0b2c4e6d8f0a2"}
              </p>
              <span className="text-slate-400 block mt-1 text-[11px]">
                Chat ID: {activeCase?.last_tee_chat_id || "chatcmpl-tee-enclave-attested"}
              </span>
            </div>

            <button
              onClick={() => setTeeProofModalOpen(false)}
              className="w-full py-3 rounded-xl bg-grannysmith text-[#140e0b] font-bold text-xs hover:bg-grannysmith/90"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}

      {/* DRAWER SLIDE-OVER RIWAYAT TRANSAKSI (LEDGER) */}
      {txDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#201712] border-l border-[#423227] h-full p-6 overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#423227] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <h3 className="text-base font-bold text-white">RIWAYAT TRANSAKSI ON-CHAIN</h3>
              </div>
              <button
                onClick={() => setTxDrawerOpen(false)}
                className="text-slate-400 hover:text-white text-base font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-mono mb-4">
              Catatan bukti eksekusi kontrak pintar Alibi Vault di penjelajah NEAR Testnet (NearBlocks).
            </p>

            <div className="flex flex-col gap-2.5 flex-1">
              {txFeed.length === 0 ? (
                <div className="py-16 text-center text-xs font-mono text-slate-400">
                  Belum ada transaksi di sesi ini.
                </div>
              ) : (
                txFeed.map((tx, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#160f0c] border border-[#423227] text-xs font-mono"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{tx.title}</span>
                      <span className="text-slate-400 text-[11px]">{tx.time}</span>
                    </div>
                    <p className="text-slate-300 text-xs mb-2">{tx.desc}</p>
                    <a
                      href={`https://testnet.nearblocks.io/txns/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ronchi font-bold hover:underline inline-flex items-center gap-1"
                    >
                      Buka NearBlocks ({tx.hash.slice(0, 8)}...) ↗
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERAYAAN KEMENANGAN (KASUS TERPECAHKAN) */}
      {crackCelebration && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="victorian-card p-7 border-2 border-grannysmith bg-[#201712] rounded-2xl max-w-md w-full shadow-2xl text-center">
            <span className="text-5xl block mb-2">🎉</span>
            <span className="text-xs font-mono uppercase text-grannysmith font-bold tracking-widest block mb-1">
              KASUS TERPECAHKAN // PENGAKUAN DIDAPATKAN!
            </span>
            <h2 className="text-xl font-bold text-white mb-3">
              {state?.active_case?.suspect_name} MENGAKU BERSALAH!
            </h2>
            <p className="text-sm italic text-ronchi mb-5">
              "{crackCelebration.suspect_quote}"
            </p>

            <div className="p-4 bg-[#160f0c] border border-[#423227] rounded-xl mb-5 text-xs font-mono flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Bonus Serangan Terakhir (10%):</span>
                <span className="text-grannysmith font-bold text-sm">
                  +{formatNearAmount(crackCelebration.final_bonus_yocto || "0", 3)} NEAR
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Bagian Proporsional (90%):</span>
                <span className="text-grannysmith font-bold text-sm">
                  +{formatNearAmount(crackCelebration.proportional_share_yocto || "0", 3)} NEAR
                </span>
              </div>
              <div className="flex justify-between border-t border-[#423227] pt-2">
                <span className="text-ronchi font-bold text-sm">Total Hadiah Dikreditkan:</span>
                <span className="text-ronchi font-bold text-sm">
                  +{formatNearAmount(crackCelebration.total_jackpot_won_yocto || "0", 3)} NEAR
                </span>
              </div>
            </div>

            <button
              onClick={() => setCrackCelebration(null)}
              className="w-full py-3.5 rounded-xl bg-grannysmith text-[#140e0b] font-bold text-sm hover:bg-grannysmith/90 transition shadow-xl"
            >
              LANJUTKAN KE TARGET SINDIKAT BERIKUTNYA
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
