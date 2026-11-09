# ARCHITECTURE.MD — System Architecture, Rust Data Schema, & API Spec (Alibi Vault)

## 1. High-Level System Architecture

```mermaid
flowchart LR
    subgraph Browser["Browser Client (Single-Page UI)"]
        UI["3-Column Cyber-Noir UI"]
        FCK["Function Call Key (localStorage)<br/>Zero-Popup Gameplay Signer"]
        Wallet["NEAR Wallet Selector<br/>(One-Time Deposit Only)"]
    end

    subgraph Backend["Thin API Route (/api/tee-interrogate)"]
        TEE["NEAR AI Cloud TEE<br/>• POST /v1/privacy/redact<br/>• POST /v1/chat/completions (z-ai/glm-5.3-flash)<br/>• GET /v1/signature/{chat_id}"]
    end

    subgraph NEAR["NEAR Testnet (v1.alibivault.testnet)"]
        SC["Main Rust Smart Contract (near-sdk 5.29.1)<br/>• Internal NEAR Balances (deposit/withdraw)<br/>• NEP-245 Evidence Inventory & Supply<br/>• Suspect State, Alibi Defense, & Proportional Vault<br/>• NEP-171 + NEP-177 Dynamic SVG Badge Renderer"]
        Sub["Suspect Identity Sub-Account<br/>(vex.v1.alibivault.testnet)"]
    end

    Wallet -- "1. deposit() [Payable once]" --> SC
    FCK -- "2. Signless RPC Calls (~1.2s, 0 Popups)<br/>claim_starter_clues / trade_with_informant / interrogate_suspect" --> SC
    UI -- "3. Fetch Suspect AI Rebuttal & TEE Attestation" --> TEE
    TEE -- "4. Return Signed Proof (chat_id, sig)" --> UI
    FCK -- "5. record_tee_statement(chat_id, sig)" --> SC
    SC -. "Optional Identity Spawn" .-> Sub


Architectural Invariants
1. Parent Contract Holds All Funds: All NEAR deposited via deposit() and accumulated in bounty_jackpot_yocto or informant_reserve_yocto remains inside the parent contract (v1.alibivault.testnet).

2. Signless Session Key Workflow:

    A. When the user connects their wallet and calls deposit(), an AddKey action (or separate one-time setup) authorizes a FunctionCall access key stored in browser localStorage pointing to v1.alibivault.testnet with an allowance of 0.25 NEAR for gas.

    B. All subsequent gameplay calls (claim_starter_clues, trade_with_informant, update_alibi_meta, interrogate_suspect, record_tee_statement) are signed directly in the browser using near-api-js InMemorySigner with zero wallet popups.


2. Smart Contract Data Schema (contract/src/lib.rs)
Use near-sdk = "5.29.1" with #[near(contract_state)] and #[near(serializers = [json, borsh])]

use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, LookupSet, UnorderedMap};
use near_sdk::json_types::U128;
use near_sdk::{env, near, AccountId, NearToken, PanicOnDefault, Promise};

#[near(serializers = [json, borsh])]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum ClueType {
    Cctv = 0,   // Digital CCTV Footage ("clue:cctv")
    Ledger = 1, // Offshore Dark Ledger ("clue:ledger")
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum BadgeRank {
    Rookie,         // 0 Cases Cracked — Slate Grey SVG (#64748b)
    Inspector,      // 1..2 Cases Cracked — Amber Gold SVG (#f59e0b)
    ChiefDetective, // >= 3 Cases Cracked — Emerald Neon SVG (#10b981)
}

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct SuspectCase {
    pub case_number: u32,
    pub suspect_id: String,               // e.g., "vex"
    pub suspect_name: String,             // e.g., "Vex the Phantom"
    pub sub_account_id: AccountId,        // e.g., "vex.v1.alibivault.testnet"
    pub current_composure: u32,           // Starts at 1000
    pub max_composure: u32,               // Starts at 1000, +200 per new case
    pub bounty_jackpot_yocto: u128,       // Active jackpot pool in yoctoNEAR
    pub informant_reserve_yocto: u128,    // 10% fee reserve for informant buybacks
    pub alibi_defense_bps: [u16; 2],      // [Cctv, Ledger] — ALWAYS sums to 9000 bps
    pub buyback_multiplier_bps: [u16; 2], // Default [10000, 20000] (1x, 2x)
    pub total_case_damage: u64,           // Sum of all mental damage dealt in current case
    pub interrogations_survived: u32,
    pub last_suspect_quote: String,       // Latest dialogue / rebuttal
    pub last_tee_chat_id: String,         // Latest verified NEAR AI Cloud TEE chat_id
    pub last_tee_signature: String,       // Latest ECDSA signature from /v1/signature/{chat_id}
}

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct DetectiveProfile {
    pub account_id: AccountId,
    pub internal_balance_yocto: u128,     // Deposit balance for signless warrant fees
    pub claimed_starter: bool,            // Anti-sybil flag (true after 1st claim)
    pub clues: [u64; 2],                  // NEP-245 balances: [clue:cctv, clue:ledger]
    pub cases_cracked: u32,               // Number of final confessions triggered
    pub total_damage_dealt: u64,          // Lifetime mental damage dealt
    pub total_bounty_won_yocto: u128,     // Lifetime NEAR won from vaults
    pub badge_rank: BadgeRank,            // Current NEP-171 Badge Rank
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct AlibiVaultContract {
    pub owner_id: AccountId,
    pub active_case: SuspectCase,
    pub warrant_fee_yocto: u128,                          // Default: 0.1 NEAR (10^23 yoctoNEAR)
    pub clue_supplies: [u64; 2],                          // Total circulating [clue:cctv, clue:ledger]
    pub detectives: LookupMap<AccountId, DetectiveProfile>,
    pub case_damage_by_detective: UnorderedMap<AccountId, u64>, // Reset when case cracks
    pub used_tee_chat_ids: LookupSet<String>,             // Anti-replay set for TEE proofs
}

3. Smart Contract Methods Specification
3.1 Initialization & Payable Methods
#[init] pub fn new(owner_id: AccountId) -> Self

Initializes active_case as Case #1 ("Vex the Phantom", current_composure: 1000, max_composure: 1000, alibi_defense_bps: [4500, 4500], bounty_jackpot_yocto: 0).

Sets warrant_fee_yocto = 100_000_000_000_000_000_000_000 (0.1 NEAR).

#[payable] pub fn deposit(&mut self)

Credits env::attached_deposit().as_yoctonear() to caller's DetectiveProfile.internal_balance_yocto.

If the caller allocates > 0.2 NEAR on initial setup and active_case.bounty_jackpot_yocto == 0, optionally seed 50% into bounty_jackpot_yocto or provide a dedicated #[payable] pub fn seed_bounty_vault(&mut self) method so judges immediately see a large initial jackpot (e.g., 5.0 NEAR).

pub fn withdraw(&mut self, amount: Option<U128>) -> Promise

Checks profile.internal_balance_yocto >= withdraw_amount.

Checks-Effects-Interactions: Subtracts withdraw_amount from profile.internal_balance_yocto and saves self.detectives before calling Promise::new(caller).transfer(NearToken::from_yoctonear(withdraw_amount)).

.2 Signless Gameplay Call Methods (Non-Payable — Function Call Key Compatible)
pub fn claim_starter_clues(&mut self)

Asserts !profile.claimed_starter ("Starter clues already claimed").

Sets profile.claimed_starter = true.

Mints 2 units of ClueType::Cctv (profile.clues[0] += 2, self.clue_supplies[0] += 2).

Calls self.internal_recalculate_alibi_defense() automatically so the CCTV Alibi Defense immediately reflects the new supply.

pub fn trade_with_informant(&mut self, burn_clue: ClueType, mint_clue: ClueType)

Asserts burn_clue != mint_clue.

Asserts profile.clues[burn_clue as usize] >= 2 ("Need at least 2 clues to trade with Informant").

Executes NEP-245 burn & mint:

profile.clues[burn_clue as usize] -= 2;

self.clue_supplies[burn_clue as usize] -= 2;

profile.clues[mint_clue as usize] += 1;

self.clue_supplies[mint_clue as usize] += 1;

Emits standard NEP-245 log events (EVENT_JSON:{"standard":"nep245","version":"1.0.0","event":"mt_burn",...} and mt_mint) for NearBlocks visibility.

Calls self.internal_recalculate_alibi_defense().

pub fn update_alibi_meta(&mut self)

Public wrapper around self.internal_recalculate_alibi_defense() using the exact formula in PRD.MD:

Reads s0 = self.clue_supplies[0] as u128, s1 = self.clue_supplies[1] as u128.

If s0 + s1 == 0, sets alibi_defense_bps = [4500, 4500].

Otherwise:

share0_bps = (s0 * 10000) / (s0 + s1)

raw0_bps = (share0_bps * 9000) / 10000

clamped0 = raw0_bps.clamp(1000, 8000) as u16

clamped1 = 9000 - clamped0

self.active_case.alibi_defense_bps = [clamped0, clamped1]

pub fn interrogate_suspect(&mut self, clue: ClueType, tactics: [u8; 3]) -> InterrogationOutcome

Asserts profile.clues[clue as usize] >= 1 ("You do not hold this evidence clue").

Asserts profile.internal_balance_yocto >= self.warrant_fee_yocto ("Insufficient internal balance for Warrant Fee. Please deposit NEAR first.").

Deduct Warrant Fee Upfront:

profile.internal_balance_yocto -= self.warrant_fee_yocto;

let to_jackpot = (self.warrant_fee_yocto * 90) / 100;

let to_reserve = self.warrant_fee_yocto - to_jackpot;

self.active_case.bounty_jackpot_yocto += to_jackpot;

self.active_case.informant_reserve_yocto += to_reserve;

Compute 3-Turn Mental Damage:

Base power = 450 (tuned so 1–2 well-targeted Ledger interrogations can crack a 1000 Composure Suspect during a live 90-second demo).

Defense = self.active_case.alibi_defense_bps[clue as usize] as u64.

Map each tactic t in tactics: 0 -> 10500, 1 -> 11000, 2 -> 11500 (default 10000). Average the 3 tactic multipliers, and add +1000 bps synergy bonus if tactics[0] != tactics[1] && tactics[1] != tactics[2] && tactics[0] != tactics[2].

Pseudo-random variance from env::random_seed(): let rand_bps = 9000 + ((seed[0] as u64) * 256 + (seed[1] as u64)) % 2001;.

Calculate damage = max(10, base * (10000 - defense) * tactic_bps * rand_bps / 10000^3).

Record Damage & Check Vault Crack:

Update case_damage_by_detective for caller and active_case.total_case_damage.

If damage < active_case.current_composure:

active_case.current_composure -= damage as u32;

active_case.interrogations_survived += 1;

Return InterrogationOutcome { cracked: false, damage_dealt: damage as u32, ... }.

If damage >= active_case.current_composure (VAULT CRACKED!):

Distribute jackpot = active_case.bounty_jackpot_yocto:

final_bonus = jackpot / 10; (10% to caller.internal_balance_yocto).

pool_90 = jackpot - final_bonus;

Iterate over self.case_damage_by_detective: credit (pool_90 * d_dmg) / total_case_damage to each detective's internal_balance_yocto and total_bounty_won_yocto.

Upgrade caller badge: caller.cases_cracked += 1, update badge_rank.

Advance Case: case_number += 1, max_composure += 200, current_composure = max_composure, bounty_jackpot_yocto = 0, clear case_damage_by_detective.

Return InterrogationOutcome { cracked: true, jackpot_won: U128(jackpot), ... }.

pub fn record_tee_statement(&mut self, suspect_quote: String, buyback_multiplier_bps: [u16; 2], chat_id: String, tee_signature: String)

Asserts !self.used_tee_chat_ids.contains(&chat_id) ("TEE chat_id already used").

Inserts chat_id into used_tee_chat_ids.

Clamps each buyback_multiplier_bps to [10000, 40000] (1.0x to 4.0x).

Updates active_case.last_suspect_quote, active_case.last_tee_chat_id, and active_case.last_tee_signature.

3.3 View Methods (JSON Responses for Frontend)
pub fn get_dashboard_state(&self, account_id: Option<AccountId>) -> DashboardView

Single batched view call returning:

active_case (with U128 formatted strings for bounty_jackpot_yocto and informant_reserve_yocto),

clue_supplies: [u64; 2],

detective_profile (if account_id is provided),

caller_case_damage: u64 and estimated_payout_yocto: U128,

badge_svg_data_uri: String (the rendered data:image/svg+xml;base64,... NEP-177 image for the detective's badge).

pub fn nft_token(&self, token_id: String) -> Option<JsonBadgeToken>

Standard NEP-171 + NEP-177 metadata view where token_id is the detective's AccountId, returning media: "data:image/svg+xml;base64,..." dynamically generated from their DetectiveProfile.

4. NEAR AI Cloud TEE Integration Spec (web/src/app/api/tee/route.ts)
When the player executes an interrogation or clicks "Request TEE Suspect Statement", the backend route executes this 3-step pipeline against NEAR AI Cloud:

Step 1 — PII Redaction (POST https://cloud-api.near.ai/v1/privacy/redact):

Strips any accidental personal identifiers from the interrogation prompt payload.

Step 2 — Deterministic Enclave Inference (POST https://cloud-api.near.ai/v1/chat/completions):

Model: z-ai/glm-5.3-flash

Temperature: 0.2

System Prompt:
You are Vex the Phantom, a cyber-noir master thief being interrogated by a detective.
Respond strictly in JSON: {"suspect_quote": "...", "buyback_multiplier_bps": [cctv_bps, ledger_bps]}
Keep suspect_quote under 160 characters. If cracked=true, confess in panic. If cracked=false, mock their evidence.

Step 3 — Enclave Hardware Signature (GET https://cloud-api.near.ai/v1/signature/{chat_id}):

Retrieves { signing_address, signature, text } from the TEE hardware enclave.

Graceful Fallback Rule: If NEAR_AI_API_KEY is not configured in .env.local during local offline testing, the API route MUST return a deterministic signed mock payload with a clear mode: "simulated-tee" flag so the UI never crashes during judge testing.

```
