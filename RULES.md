# RULES.MD — AI Coding Agent Guardrails & Execution Rules (Alibi Vault)

> **CRITICAL INSTRUCTION FOR AI AGENT (ANTIGRAVITY):**
> You MUST read and strictly obey every rule in this document before creating files, writing code, or running terminal commands. Do NOT deviate from these architectural, security, and scoping constraints.

---

## 1. Project Identity & Core Objective

- **Project Name:** Alibi Vault (Autonomous AI Suspect Bounty Vault & Counter-Meta Evidence Economy on NEAR).
- **Hackathon Tracks:**
  1. `Games With Real Economies` (Primary)[cite: 2]
  2. `Privacy & Private AI` (NEAR AI Cloud TEE)[cite: 1, 2]
  3. `NFTs That Do Something` (Dynamic SVG Detective Badge)[cite: 1, 2]
- **Target Network:** NEAR Testnet (`testnet`).

---

## 2. Strict Tiered Execution Priority (Scope Control)

You MUST build and verify the project in strict sequential tiers. **NEVER** write Tier 2 or Tier 3 code until Tier 1 is 100% compiled, unit-tested, and working.

- **TIER 1 (MANDATORY MVP — Build First):**
  - 1 Active Suspect Case (Case #1: "Vex the Phantom", while Case #2 & #3 are displayed as locked roadmap cases)[cite: 3].
  - 2 Evidence Clues managed on-chain (`clue:cctv` and `clue:ledger`)[cite: 3].
  - Internal NEAR balance accounting (`deposit` and `withdraw`) so all gameplay actions execute **without wallet popups** via `Function Call Keys`[cite: 3].
  - Starter clue claim (`claim_starter_clues` — strictly once per account, non-sellable)[cite: 3].
  - Underground Informant Trade (`trade_with_informant`: burn 2 over-supplied clues -> mint 1 rare clue).
  - Deterministic Alibi Defense calculation with renormalization (`update_alibi_meta`: total defense across the 2 clues MUST equal `9000 bps`, clamped between `1000 bps` [10%] and `8000 bps` [80%])[cite: 3].
  - 3-Turn Tactical Interrogation (`interrogate_suspect`) with upfront Warrant Fee deduction and proportional Bounty Vault payout (**90% proportional to total mental damage dealt + 10% Final Confession / Last-Hit bonus**)[cite: 3].
  - Single-page 3-column Web UI connected to NEAR Testnet with clickable NearBlocks Explorer transaction links.

- **TIER 2 (HIGH-VALUE ADDON — Build Only After Tier 1 Passes):**
  - `NEAR AI Cloud TEE` connector (`z-ai/glm-5.3-flash`, `/v1/privacy/redact`, and `/v1/signature/{chat_id}`) for Suspect interrogation dialogue/taunts and attested Informant buyback multipliers[cite: 1, 2, 3].
  - Dynamic SVG Detective Badge NFT (`NEP-171` + `NEP-177` inline base64 SVG rendered directly from contract state)[cite: 1].

- **TIER 3 (PITCH / OPTIONAL ROADMAP — Do Not Block MVP On This):**
  - Syndicate Backer liquidity staking & dividend distribution[cite: 2, 3].
  - Informant active buyback execution from reserve pool[cite: 3].

---

## 3. Non-Negotiable Smart Contract Security & Architecture Rules

1. **SDK Version & Serialization:**
   - Use `near-sdk = "5.29.1"` in `Cargo.toml`[cite: 1, 2].
   - Use modern `#[near(contract_state)]` and `#[near(serializers = [json, borsh])]` macros[cite: 1, 2].
   - Use `U128` (`near_sdk::json_types::U128`) for all yoctoNEAR monetary inputs/outputs in JSON view/call methods to prevent JavaScript `Number` overflow[cite: 1, 2].

2. **All Funds MUST Stay in the Parent Contract (NO Locked Sub-Account Funds):**
   - **CRITICAL:** Never transfer the Bounty Vault jackpot or user deposits into a keyless sub-account[cite: 3]. A sub-account without deployed code or keys cannot send funds back to winners[cite: 1, 3].
   - Keep 100% of NEAR funds inside the main contract (`v1.alibivault.testnet`)[cite: 3]. If a Suspect sub-account (`vex.v1.alibivault.testnet`) is spawned, it is strictly for on-chain identity/explorer display with minimal storage balance[cite: 3].

3. **Zero Wallet Popups During Gameplay (Internal Balance + Function Call Key):**
   - In NEAR, a `Function Call Key` CANNOT attach NEAR deposits (`#[payable]`) to transactions[cite: 3].
   - Therefore, ONLY `deposit()` and optional `spawn_suspect_identity()` may be `#[payable]`[cite: 1, 2, 3].
   - All core gameplay methods (`claim_starter_clues`, `trade_with_informant`, `update_alibi_meta`, `interrogate_suspect`) MUST be **non-payable** and deduct costs from the player's internal `balances: LookupMap<AccountId, u128>` state[cite: 3].

4. **Checks-Effects-Interactions (Reentrancy Protection):**
   - In `withdraw()` or any payout function, you MUST update and zero-out the user's internal state/balance **BEFORE** executing `Promise::new(receiver).transfer(...)`[cite: 3].

5. **On-Chain Supply Source of Truth:**
   - Never accept clue supply numbers as parameters from the frontend UI (which can be spoofed)[cite: 3].
   - The contract MUST read `clue_total_supply` directly from its own internal `NEP-245` state when computing Alibi Defense percentages[cite: 2, 3].

6. **AI Proposes, Contract Disposes (Deterministic Invariants):**
   - Never allow the AI/TEE or external caller to arbitrarily drain funds or set 100% immunity[cite: 2, 3].
   - The Rust contract MUST clamp every Alibi Defense between `1000 bps` (10%) and `8000 bps` (80%) and renormalize so that the sum across active clues equals `9000 bps` (for 2 clues), guaranteeing at least one clue always has $\le 45\%$ (`4500 bps`) defense[cite: 3].

7. **Anti-Exploit Mechanics:**
   - **Anti-Offchain Simulation:** Deduct the Warrant Fee (`warrant_fee_yocto`) upfront on every `interrogate_suspect` call (win or lose) and apply a pseudo-random variance (`90%–110%` derived from `env::random_seed()`) so players cannot simulate guaranteed wins off-chain for free[cite: 3].
   - **Anti-Snipe Jackpot:** Track `damage_by_detective` per case. When Suspect composure reaches `0`, credit **10%** of `bounty_jackpot` to the final attacker and distribute **90%** proportionally across all detectives who dealt mental damage in that case[cite: 3].
   - **Anti-Sybil Starter Clues:** `claim_starter_clues()` can only be called once per `AccountId`[cite: 3].
   - **Anti-Replay TEE Proofs:** Store every used `chat_id` in `used_chat_ids: LookupSet<String>` so a `NEAR AI Cloud TEE` signature can never be replayed[cite: 1].

---

## 4. Repository Directory Structure

Maintain a clean, flat monorepo structure:

```text
alibi-vault/
├── RULES.MD
├── PRD.MD
├── ARCHITECTURE.MD
├── DESIGN.MD
├── contract/                 # Rust Smart Contract (near-sdk 5.29.1)
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs            # Keep contract modular or in a clean single lib.rs
├── web/                      # Single-page Frontend + Thin TEE API Route
│   ├── package.json
│   ├── .env.example
│   └── src/
└── scripts/
    └── verify-alibivault.sh  # CLI verification script for judges



5. Agent Workflow & Verification Protocol
1.Step-by-Step Execution: Complete one phase at a time. After writing the Rust contract in contract/, immediately run cargo test to verify all unit tests pass before touching web/[cite: 3].

2. No Heavy 3D Assets: Do NOT install Three.js, Unity, or heavy external image assets[cite: 2, 3]. Use crisp Tailwind/CSS styling and inline Dynamic SVG graphics as specified in DESIGN.MD[cite: 1, 2, 3].

3. Always Expose Verifiable Proof: Every on-chain action in the UI MUST record and display a clickable link to https://testnet.nearblocks.io/txns/{tx_hash} so hackathon judges can verify real Testnet execution in one click[cite: 1, 2, 3].
```
