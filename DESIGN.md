# DESIGN.MD — Anti-Slop Cyber-Noir UI/UX & Dynamic SVG Spec (Alibi Vault)

> **CRITICAL UI/UX CONSTRAINT FOR AI AGENT (ANTIGRAVITY) — ZERO AI SLOP POLICY:**
> You are STRICTLY FORBIDDEN from generating generic "AI Slop" or cookie-cutter SaaS/Web3 templates.
>
> - **BANNED PATTERNS:** No purple-to-blue neon gradients, no generic `rounded-2xl` floating glassmorphic cards with blurry blobs in the background, no standard Inter/Roboto SaaS dashboards, no marketing hero sections ("Welcome to Alibi Vault!"), no lucide-react icon soup, and no fake placeholder buttons.
> - **MANDATORY AESTHETIC:** Build a tactile **Classified Police Interrogation Terminal & Cyber-Noir Case File OS** (inspired by _Disco Elysium_, _Papers, Please_, and _ Her Story_ CRT terminals). Use sharp 1px exposed structural borders, high-contrast manila/amber/crimson dossier accents on deep carbon-ink surfaces, monospace telemetry typography, stamped classification badges (`[CLASSIFIED // CASE #01]`), and zero page scrolling (100vh locked tactical workspace).

---

## 1. Visual Direction, Color Tokens, & Typography

### 1.1 Color Palette (Tactile Noir Dossier & CRT Terminal)

Define these exact CSS variables in `globals.css`:

- `--bg-void`: `#090A0C` (Deep interrogation room shadow — main viewport background)
- `--bg-panel`: `#111318` (Dark metal filing cabinet surface)
- `--bg-dossier`: `#181B22` (Elevated evidence card surface)
- `--border-hairline`: `#262A34` (1px crisp structural grid line — NO soft drop shadows)
- `--border-active`: `#D97706` (Amber dossier highlight border)
- `--text-primary`: `#ECE8DF` (Warm archival paper white — never pure `#FFFFFF`)
- `--text-muted`: `#8A8F9E` (Stamped metadata grey)
- `--accent-amber`: `#F59E0B` (Bounty Vault gold, active warrant, & weak-spot indicator)
- `--accent-crimson`: `#E11D48` (High Alibi Defense alert, CCTV inflation warning, & Suspect stress)
- `--accent-emerald`: `#10B981` (Signless Session Active, Verified TEE Attestation, & Low Alibi Defense target)

### 1.2 Typography Pairing (Google Fonts)

Import in layout head:

- **Display / Headers (`--font-display`):** `'Space Grotesk'` or `'Syne'` (Bold, uppercase, tight tracking `-0.03em`, used for Case Headers, Suspect Name, and Bounty Jackpot figures).
- **Telemetry / Numbers / Transcripts (`--font-mono`):** `'JetBrains Mono'` or `'IBM Plex Mono'` (Used for all bps percentages, NEAR balances, `tx_hash` receipts, TEE signatures, and Suspect dialogue).
- **Body (`--font-sans`):** `'Plus Jakarta Sans'` or `'DM Sans'` (Clean, high-legibility UI labels).

### 1.3 Anti-Slop Structural Rules

1. **Exposed Hairline Grid:** Separate all 3 main columns with visible `1px solid var(--border-hairline)` borders instead of floating cards with huge margins.
2. **Corner Brackets & Stamps:** Use CSS pseudo-elements (`::before`, `::after`) to render tactical 6px corner crosshairs (`+` or L-brackets) on the Suspect Interrogation Panel and Evidence Radar.
3. **Zero Marketing Fluff:** Launch directly into the live 3-Column Interrogation Terminal. Do NOT build a landing page, navbar menu, or footer.

---

## 2. Single-Screen 3-Column Layout Architecture (`100vh` Desktop Grid)

The entire application lives on a single unified screen divided into a **Top Telemetry Bar (`56px` height)** and a **12-Column CSS Grid Main Workspace (`calc(100vh - 56px)`)**:

```text
+--------------------------------------------------------------------------------------------------+
| [CASE FILE #01 // VEX.V1.ALIBIVAULT.TESTNET]   [SESSION KEY: ACTIVE ●]  [WALLET BAL: 1.80 NEAR]  |
|                                                [+ DEPOSIT NEAR]         [WITHDRAW WINNINGS]      |
+------------------------------+------------------------------------+------------------------------+
| COL 1: EVIDENCE & INFORMANT  | COL 2: INTERROGATION CHAMBER       | COL 3: BADGE & CHAIN LEDGER  |
| (4 Grid Columns / ~30% Width)| (5 Grid Columns / ~42% Width)      | (3 Grid Columns / ~28% Width)|
|                              |                                    |                              |
| [SECTION A: SERVER RADAR]    | [SECTION A: SUSPECT & BOUNTY VAULT]| [SECTION A: NEP-177 BADGE]   |
| • Live NEP-245 Supply Bars   | • Suspect Dossier Card (SVG mugshot| • Live On-Chain SVG Badge    |
|   - clue:cctv   (75% OVER)   |   with reactive stress pulse)      |   rendered directly from     |
|   - clue:ledger (25% RARE)   | • Composure Bar: 420 / 1000 HP     |   contract nft_token()       |
|                              | • BOUNTY VAULT: 18.50 NEAR         |                              |
| [SECTION B: YOUR EVIDENCE]   | • Alibi Defense Matrix:            | [SECTION B: CASE PAYOUT]     |
| • Inventory Count Badges     |   - CCTV Alibi:   75% [RESISTANT]  | • Your Mental Damage: 580    |
| • [CLAIM STARTER CLUES (1x)] |   - Ledger Alibi: 15% [VULNERABLE] | • Your Vault Share: 58.0%    |
|                              |                                    | • Est. Payout: ~10.73 NEAR   |
| [SECTION C: THE INFORMANT]   | [SECTION B: 3-TURN TACTICAL DESK]  |                              |
| • "The Shadow" Black Market  | • Select Clue: [CCTV] vs [LEDGER]  | [SECTION C: CASE TOWER]      |
| • Burn 2x Inflated Clues ->  | • Turn 1: [PRESS] [BLUFF] [EXPOSE] | • Case #1: Vex [ACTIVE]      |
|   Mint 1x Counter-Meta Clue  | • Turn 2: [PRESS] [BLUFF] [EXPOSE] | • Case #2: Cipher [LOCKED]   |
| • [EXECUTE INFORMANT TRADE]  | • Turn 3: [PRESS] [BLUFF] [EXPOSE] | • Case #3: Architect [LOCKED]|
|   (Signless, 0 Wallet Popup) | • [LAUNCH INTERROGATION (0.1 NEAR)]|                              |
|                              |                                    | [SECTION D: NEARBLOCKS FEED] |
|                              | [SECTION C: TEE TRANSCRIPT LOG]    | • Clickable tx_hash receipts |
|                              | • Typewriter quote from z-ai/glm   |   with TEE signature badge   |
|                              | • Attested chat_id & signature     |                              |
+------------------------------+------------------------------------+------------------------------+

3. Component-by-Component Specifications
3.1 Top Telemetry Header Bar
Left: Project emblem [ALIBI VAULT // TERMINAL v1.0] + Active Contract pill linking to https://testnet.nearblocks.io/address/v1.alibivault.testnet.

Center: Signless Session Status Indicator:

When active: Emerald pulsing dot ● SIGNLESS SESSION KEY ACTIVE (0 POPUPS) showing the truncated local public key (ed25519:...).

When inactive: High-contrast Amber button [⚡ ACTIVATE 1-CLICK INVESTIGATION SESSION] that connects wallet, adds the FunctionCall access key to localStorage, and deposits 1.0 NEAR in one flow.

Right: Detective's internal_balance_yocto formatted in NEAR (2 decimal places), plus compact [+ DEPOSIT] and [WITHDRAW] buttons.

3.2 Column 1 (Left): Server Evidence Radar & Underground Informant
Server-Wide NEP-245 Supply Telemetry:

Displays total circulating units of clue:cctv and clue:ledger read directly from on-chain state.

Horizontal segmented meter showing exact percentage share. If a clue exceeds 60% supply share, display a crimson stamp: [LEAKED META // SUSPECT ADAPTED].

Detective Evidence Locker (Player Inventory):

Two tactile dossier slots showing the player's current balance of CCTV Footage and Offshore Dark Ledger.

Button: [🔍 CLAIM STARTER CLUES (2x CCTV — FREE)]. Disabled with a [CLAIMED ✓] stamp once profile.claimed_starter == true.

Underground Informant ("The Shadow" — Inflation Sink):

Styled like an encrypted wiretap terminal.

Displays dynamic market hint: "Too many cops are waving CCTV tapes. Bring me 2x CCTV Footage to shred (mt_burn), and I'll hand over 1x Offshore Dark Ledger (mt_mint)."

Primary Action Button: [🕶️ SHRED 2x CCTV → ACQUIRE 1x DARK LEDGER].

Executes trade_with_informant via the browser Function Call Key with an inline loading spinner (~1.2s) and zero wallet popup.

3.3 Column 2 (Center): The Interrogation Chamber & TEE Transcript
Suspect Dossier & Live Bounty Vault Banner:

Top split banner:

Left: Suspect identity CASE #01: VEX THE PHANTOM (vex.v1.alibivault.testnet) with an inline SVG cyber-noir silhouette whose stroke color shifts from Slate to Amber to Crimson as Composure drops.

Right: Huge monospace counter for BOUNTY VAULT JACKPOT (e.g., 18.50 NEAR) + a small [+ SEED VAULT] button so judges can top up the jackpot at any time.

Mental Composure Bar: Segmented industrial progress bar (current_composure / max_composure).

Alibi Defense Matrix (Side-by-Side Comparison):

CCTV Alibi Defense: e.g., 75.0% (7500 bps) — colored Crimson (#E11D48) with badge [HIGH ALIBI RESISTANCE].

Dark Ledger Alibi Defense: e.g., 15.0% (1500 bps) — colored Emerald (#10B981) with blinking badge [🎯 ALIBI WEAK SPOT].

3-Turn Tactical Interrogation Desk:

Step 1 — Equip Evidence: 2 radio cards ([📹 PRESENT CCTV FOOTAGE] vs [📒 PRESENT DARK LEDGER]). Automatically highlights expected base effectiveness based on current Alibi Defense.

Step 2 — Sequence 3 Psychological Tactics: 3 compact rows (Turn 1, Turn 2, Turn 3), each with 3 toggle pills:

[0: PRESS (1.05x)] · [1: BLUFF (1.10x)] · [2: EXPOSE (1.15x)]

Displays a live [⚡ +10% FULL COMBO SYNERGY ACTIVE] badge when all 3 turns use distinct tactics ([0, 1, 2]).

Step 3 — Execute Button: Full-width high-contrast Amber tactical button:

[🚨 LAUNCH 3-TURN INTERROGATION — WARRANT FEE: 0.1 NEAR (SIGNLESS)]

NEAR AI Cloud TEE Live Transcript & Attestation Box:

Terminal readout box displaying the Suspect's latest dialogue (last_suspect_quote) in typewriter monospace font.

Below the quote, render a verifiable cryptographic proof strip:

[🔒 TEE ENCLAVE: z-ai/glm-5.3-flash]

[PII REDACTED ✓]

[CHAT ID: chatcmpl-...]

[SIGNATURE: 0x8f3a...c91b] (with a toggleable modal/drawer showing the raw JSON attestation from /v1/signature/{chat_id}).

3.4 Column 3 (Right): Dynamic SVG Badge, Proportional Share, & NearBlocks Feed
Live On-Chain Detective Badge (NEP-171 + NEP-177 SVG):

Renders the exact <img src={dashboard.badge_svg_data_uri} /> returned by the smart contract's view method.

Includes a button [🔎 INSPECT ON-CHAIN NEP-177 METADATA] so judges can verify the SVG is generated inside the Rust contract.

Proportional Vault Share Calculator (Anti-Snipe Transparency):

Displays:

Your Damage Dealt (Case #1): {caller_case_damage} pts ({share_pct}% of total team pressure)

Your Projected Vault Cut: {estimated_payout} NEAR (explaining: 90% split by damage contribution + 10% Final Confession bonus).

Case Progression Tower (Spire Roadmap):

Compact vertical stepper:

● CASE #01: VEX THE PHANTOM (Active — Composure 1000)

🔒 CASE #02: CIPHER THE BROKER (Unlocks when Vex cracks — Composure 1200)

🔒 CASE #03: THE ARCHITECT (Locked — Composure 1400)

Live NearBlocks Transaction Ledger:

Scrollable list of the session's executed transactions (deposit, claim_starter_clues, trade_with_informant, interrogate_suspect, record_tee_statement).

Every entry shows action name, timestamp, mental damage / supply delta, and a direct external link:[TX: 9x8f...3a2b ↗ NearBlocks] pointing to https://testnet.nearblocks.io/txns/{tx_hash}.

4. On-Chain Dynamic SVG Specification (NEP-177 Rust Renderer)
The Rust smart contract MUST generate a self-contained, sharp vector SVG (400x240 viewBox, under 2.5 KB raw size) inside render_badge_svg(&profile) and encode it as data:image/svg+xml;base64,....

Dynamic Visual States Based on BadgeRank:
BadgeRank::Rookie (0 Cases Cracked):

Primary Stroke / Accent: #64748B (Slate Steel)

Clearance Stamp: PROBATIONARY DETECTIVE // LEVEL 01

BadgeRank::Inspector (1..=2 Cases Cracked):

Primary Stroke / Accent: #F59E0B (Amber Gold)

Clearance Stamp: GOLD INSPECTOR // VAULT BREAKER

BadgeRank::ChiefDetective (>= 3 Cases Cracked):

Primary Stroke / Accent: #10B981 (Emerald Neon)

Clearance Stamp: CHIEF DETECTIVE // SOVEREIGN INVESTIGATOR

Required SVG Template Structure (to implement in contract/src/lib.rs):
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
  <rect width="400" height="240" fill="#090A0C" stroke="{ACCENT_COLOR}" stroke-width="2" />
  <rect x="8" y="8" width="384" height="224" fill="#111318" stroke="#262A34" stroke-width="1" />
  <!-- Top Classification Header -->
  <rect x="8" y="8" width="384" height="32" fill="{ACCENT_COLOR}" fill-opacity="0.15" />
  <text x="20" y="29" fill="{ACCENT_COLOR}" font-family="monospace" font-size="11" font-weight="bold">
    ALIBI VAULT // NEP-171 CREDENTIAL // {RANK_TITLE}
  </text>
  <!-- Detective Identity & Stats -->
  <text x="20" y="68" fill="#ECE8DF" font-family="monospace" font-size="16" font-weight="bold">
    AGENT: {ACCOUNT_ID}
  </text>
  <line x1="20" y1="82" x2="380" y2="82" stroke="#262A34" stroke-width="1" />
  <text x="20" y="110" fill="#8A8F9E" font-family="monospace" font-size="11">CASES CRACKED</text>
  <text x="20" y="130" fill="{ACCENT_COLOR}" font-family="monospace" font-size="20" font-weight="bold">{CASES_CRACKED}</text>
  <text x="155" y="110" fill="#8A8F9E" font-family="monospace" font-size="11">MENTAL DMG DEALT</text>
  <text x="155" y="130" fill="#ECE8DF" font-family="monospace" font-size="20" font-weight="bold">{TOTAL_DAMAGE}</text>
  <text x="300" y="110" fill="#8A8F9E" font-family="monospace" font-size="11">BOUNTY WON</text>
  <text x="300" y="130" fill="#10B981" font-family="monospace" font-size="18" font-weight="bold">{BOUNTY_NEAR} N</text>
  <!-- Bottom Inventory & Attestation Footer -->
  <rect x="20" y="155" width="360" height="60" fill="#090A0C" stroke="#262A34" stroke-width="1" />
  <text x="32" y="178" fill="#8A8F9E" font-family="monospace" font-size="11">
    EVIDENCE LOCKER (NEP-245): CCTV [{CCTV_COUNT}] | DARK LEDGER [{LEDGER_COUNT}]
  </text>
  <text x="32" y="200" fill="{ACCENT_COLOR}" font-family="monospace" font-size="10">
    STATUS: VERIFIED ON NEAR TESTNET // DYNAMIC NEP-177 SVG
  </text>
</svg>


5. Interactive Feedback & Micro-States (Mandatory UX Polish)
Instant Damage Floaters & Breakdown Toast: When interrogate_suspect resolves, display an immediate breakdown in the Chamber:[BASE: 450] × [ALIBI VULNERABILITY: 85%] × [COMBO: 1.21x] = -462 MENTAL COMPOSURE!

Vault Crack Celebration Overlay: When cracked == true, trigger a high-contrast CASE CRACKED // CONFESSION SIGNED dossier stamp across the Suspect card showing the exact Final Bonus (10%) + Proportional Damage Share (90%) credited to the player's internal balance, and automatically refresh the NEP-177 Detective Badge SVG to show the new rank.

One-Click Judge Demo Reset / Seed Helper: Include a subtle [⚙️ JUDGE DEMO TOOLS] bar in the bottom-right corner allowing a judge to:

Seed +5 NEAR to Bounty Vault

Simulate Server CCTV Inflation (+6 CCTV)
so any judge testing the live URL can reproduce the full 90-second counter-meta loop anytime.
```
