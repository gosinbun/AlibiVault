# PRD.MD — Product Requirements Document (Alibi Vault)

## 1. Product Overview & Elevator Pitch
**Alibi Vault** is a tactical cyber-noir detective game and self-balancing evidence economy built on NEAR. 

> **One-Liner Pitch:**
> *"Every Suspect is an Autonomous Bounty Vault and Counter-Meta Mastermind running inside NEAR AI Cloud TEE. Interrogate signlessly with zero wallet popups, trade leaked evidence with underground informants (`NEP-245`), watch the Suspect dynamically adapt their alibis against over-used clues without a developer patch, and crack the vault to upgrade your Dynamic Detective Badge NFT (`NEP-171`)."*

### Core Problems Solved
1. **Static Meta & Evidence Inflation:** In typical strategy games, once players discover the strongest item/clue, everyone uses it, ruining the game balance and forcing manual developer patches. In Alibi Vault, when too many detectives hold the same type of evidence, the Suspect automatically builds immunity (Alibi Defense) against it.
2. **Fake NPCs Without Real Balance Sheets:** Traditional game bosses/suspects generate rewards out of thin air. In Alibi Vault, every failed interrogation fee goes directly into the Suspect's Bounty Vault, growing a real on-chain jackpot.
3. **Wallet Popup Friction:** Blockchain games fail when every click triggers a wallet extension popup. Alibi Vault combines a one-time Internal Balance deposit with a browser `Function Call Key` so all gameplay actions execute in ~1 second with zero popups.

---

## 2. User Roles & Core Loop

### Player Roles
| Role | Primary Action | Economic Motivation | Implementation Tier |
| :--- | :--- | :--- | :--- |
| **Detective (Raider)** | Pays Warrant Fee, selects clue & 3 interrogation tactics to break Suspect's composure | Wins proportional share of the Bounty Vault Jackpot + upgrades Detective Badge NFT | **Tier 1 (MVP)** |
| **Informant Trader (Blacksmith)** | Trades 2 over-supplied clues (`mt_burn`) to the Underground Informant for 1 rare clue (`mt_mint`) | Acquires rare anti-meta clues to bypass Suspect's high Alibi Defense or sells to buyback | **Tier 1 (MVP)** |
| **Syndicate Backer (House)** | Stakes NEAR into the Suspect's vault | Earns dividends from failed interrogation Warrant Fees | **Tier 3 (Roadmap)** |

### 60-Second Core Gameplay Loop
1. **Instant Signless Onboarding:** Player clicks **"Start Investigation (Signless Session)"** -> browser creates a `Function Call Key`, deposits a small NEAR balance once (`deposit`), and claims a free starter evidence pack (`claim_starter_clues`).
2. **Inspect the Meta Radar:** Player sees that `clue:cctv` makes up **75%** of all server evidence, causing Suspect **Vex the Phantom** to raise **CCTV Alibi Defense to 75%**, while **Dark Ledger Alibi Defense is only 15% (Weak Spot!)**.
3. **Underground Informant Trade (Inflation Sink):** Instead of failing with `clue:cctv`, the player clicks **"Trade with Informant: Burn 2 CCTV -> Mint 1 Dark Ledger"**. The on-chain supply of `clue:cctv` drops immediately.
4. **3-Turn Tactical Interrogation:** Player equips `clue:ledger`, selects 3 psychological tactics (*Press*, *Bluff*, *Expose*), and launches the interrogation (`interrogate_suspect`).
5. **Vault Crack & Proportional Payout:** Vex's mental composure drops to `0`. The contract automatically distributes the Bounty Vault (**10%** Final Confession Bonus to the final interrogator + **90%** distributed proportionally to all detectives based on mental damage contributed), evolves the player's **Dynamic SVG Detective Badge NFT**, and unlocks the next Case!

---

## 3. Detailed Game Mechanics & Mathematical Formulas

### 3.1 Evidence Multi-Tokens (`NEP-245`)
- **Tier 1 MVP Clues (2 Types):**
  - `clue:cctv` (*Digital CCTV Footage*) — Base Power: `300`
  - `clue:ledger` (*Offshore Dark Ledger*) — Base Power: `300`
- **Starter Pack (`claim_starter_clues`):**
  - Grants `2x clue:cctv` to a new detective (strictly 1 claim per `AccountId`).
  - This intentionally creates an initial server oversupply of `clue:cctv` so judges immediately witness high CCTV Alibi Defense and the need to use the Underground Informant.

### 3.2 Underground Informant Trade (`trade_with_informant`)
- **Rule:** Burns **2 units** of an over-supplied clue (`burn_clue_id`) from the caller's inventory (`mt_burn`) and mints **1 unit** of the target counter-meta clue (`mint_clue_id`) (`mt_mint`).
- **Effect:** Directly reduces the circulating supply of the inflated clue on-chain, shifting the Suspect's Alibi Defense on the next meta update.

### 3.3 Adaptive Alibi Defense Formula (With Renormalization)
For the 2 active clues ($i \in \{0, 1\}$, where $0 = \text{cctv}$ and $1 = \text{ledger}$), the contract reads on-chain supplies $S_0, S_1$ and computes:

1. **Supply Share (in basis points, $10000 = 100\%$):**
   $$\text{ShareBps}_i = \frac{S_i \times 10000}{\max(S_0 + S_1, 1)}$$
   *(If $S_0 + S_1 = 0$, default both shares to $5000\text{ bps}$).*

2. **Raw Target Alibi Defense (Multiplier = $1.35\times$):**
   $$\text{RawDefenseBps}_i = \frac{\text{ShareBps}_i \times 9000}{10000}$$

3. **Clamping & Exact Renormalization (`Total = 9000 bps`):**
   - Clamp $\text{DefenseBps}_0$ to the range $[1000, 8000]$ (10% minimum, 80% maximum).
   - Set $\text{DefenseBps}_1 = 9000 - \text{DefenseBps}_0$.
   - **Mathematical Guarantee:** The sum of both Alibi Defenses is always strictly `9000 bps` (average 45%), and at least one clue is **always $\le 4500\text{ bps}$ (45% defense)**, ensuring the Suspect is never unbreakable.

### 3.4 3-Turn Tactical Interrogation & Mental Damage Calculation
When a player calls `interrogate_suspect(clue_id, tactics: [u8; 3])`:

1. **Upfront Warrant Fee Deduction:**
   - Deduct `warrant_fee_yocto` (default: `0.1 NEAR` = $10^{23}\text{ yoctoNEAR}$) from the player's internal balance immediately.
   - Split the fee: **90%** added to `case.bounty_jackpot_yocto`, **10%** added to `case.informant_reserve_yocto`.

2. **Tactical Stance Multipliers (3 Turns):**
   Each turn $t \in \{0, 1, 2\}$ uses a tactic code:
   - `0 = Press (Gertak)` $\rightarrow$ Multiplier: `10500 bps` ($1.05\times$)
   - `1 = Bluff (Jebak)` $\rightarrow$ Multiplier: `11000 bps` ($1.10\times$)
   - `2 = Expose (Bongkar Fakta)` $\rightarrow$ Multiplier: `11500 bps` ($1.15\times$)
   - **Combo Synergy Bonus:** If all 3 turns use distinct tactics (e.g., `[0, 1, 2]`), apply an extra $+10\%$ (`11000 bps`) synergy bonus; otherwise divide total base power equally across the 3 turns.

3. **Pseudo-Random Variance (`90%–110%`):**
   - Derive a deterministic random factor from `env::random_seed()`:
     $$\text{RandBps} = 9000 + (\text{seed\_byte} \bmod 2001) \quad \in [9000, 11000]$$

4. **Total Mental Composure Damage:**
   $$\text{EffectiveDamage} = \left\lfloor \text{BasePower} \times \frac{10000 - \text{AlibiDefenseBps}_{\text{clue}}}{10000} \times \frac{\text{AvgTacticBps}}{10000} \times \frac{\text{RandBps}}{10000} \right\rfloor$$
   *(Minimum damage per interrogation is clamped to `10` so every valid attempt records progress).*

### 3.5 Proportional Vault Payout (Anti-Chip & Snipe)
- Every interrogation adds `EffectiveDamage` to `damage_by_detective[caller]` and `total_case_damage`.
- **If `EffectiveDamage < suspect.current_composure` (Suspect Holds Out):**
  - `suspect.current_composure -= EffectiveDamage`.
  - Interrogation ends; Warrant Fee remains locked in the Bounty Vault.
- **If `EffectiveDamage >= suspect.current_composure` (Suspect Cracks / Confesses!):**
  - `suspect.current_composure = 0`.
  - Let $J = \text{bounty\_jackpot\_yocto}$.
  - **Final Confession Bonus (10%):** Credited directly to the internal balance of the caller who dealt the final blow:
    $$\text{FinalBonus} = \lfloor 0.10 \times J \rfloor$$
  - **Proportional Investigation Share (90%):** For every detective $d$ who contributed damage $D_d$ in the current case:
    $$\text{Share}_d = \left\lfloor (J - \text{FinalBonus}) \times \frac{D_d}{\text{total\_case\_damage}} \right\rfloor$$
    Credited directly to each detective's internal balance (`balances[d]`).
  - **Badge Evolution & Case Progression:**
    - Caller's Detective Badge NFT (`NEP-171`) increments `cases_cracked += 1`, updates rank (`Rookie` $\rightarrow$ `Inspector` $\rightarrow$ `Chief Detective`), and updates its on-chain Dynamic SVG (`NEP-177`).
    - Case resets/advances to the next Suspect tier (`case_number += 1`, `max_composure` scales up by $+200$, and damage contributions reset for the new case).

---

## 4. Role of `NEAR AI Cloud TEE` (Tier 2 Integration)
Because the Alibi Defense formula is strictly enforced by the Rust contract for fairness, `NEAR AI Cloud TEE` (`z-ai/glm-5.3-flash`) is assigned tasks that require genuine AI reasoning and privacy:
1. **Zero-Exposure Interrogation Transcript (`/v1/privacy/redact` + `/v1/chat/completions`):**
   - Redacts player PII and generates a contextual, in-character Suspect response (either a smug alibi rebuttal when Composure > 0, or a panicked confession when Composure == 0) based on the clue and tactics used.
2. **Attested Informant Market Signal (`/v1/signature/{chat_id}`):**
   - Evaluates server clue inflation and signs a recommended Informant Buyback Multiplier (`1x` to `4x` within contract bounds) with a verifiable hardware enclave signature (`chat_id`, `signing_address`, `signature`).

---

## 5. 90-Second Judge Demo Script (Acceptance Criteria)
The finished application MUST allow a judge or presenter to execute this exact 90-second flow on a single screen:
1. **0–15s (Signless Setup):** Click **"1-Click Signless Investigation"** $\rightarrow$ session key created, deposit `1 NEAR` to internal balance, and claim `2x CCTV Footage` with zero subsequent popups.
2. **15–35s (Show the Meta Problem):** Point to the **Server Evidence Radar** showing `CCTV Footage` is over-supplied (75%+), giving Suspect **Vex the Phantom** a massive **75% CCTV Alibi Defense**.
3. **35–55s (Underground Informant Trade):** Click **"Trade with Informant (Burn 2 CCTV $\rightarrow$ Mint 1 Dark Ledger)"**. Show `CCTV` supply dropping on-chain and `Dark Ledger` appearing in inventory.
4. **55–75s (Crack the Alibi Vault):** Select `Dark Ledger` (which targets Vex's **15% weak spot**), pick 3 tactics (*Press $\rightarrow$ Bluff $\rightarrow$ Expose*), and click **"Launch Interrogation"** (zero wallet popup!). Watch Vex's Composure hit `0`, the AI Suspect confess, and the **Bounty Jackpot** payout land in the player's balance.
5. **75–90s (On-Chain Proof & Dynamic NFT):** Show the **Detective Badge SVG NFT** automatically upgrading to **GOLD INSPECTOR** on-screen and click the **NearBlocks Explorer** transaction link to prove live NEAR Testnet execution.