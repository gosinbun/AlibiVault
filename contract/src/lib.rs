use near_sdk::collections::{LookupMap, LookupSet, UnorderedMap};
use near_sdk::json_types::U128;
use near_sdk::{env, near, AccountId, NearToken, PanicOnDefault, Promise};

pub const CLUE_VALUES: [u64; 5] = [1, 2, 5, 10, 25];

pub const CLUE_IDS: [&str; 5] = [
    "clue:ash",     // Baker Street Pipe Ash & Wax (Value: 1)
    "clue:cctv",    // London Footprint & CCTV Reel (Value: 2)
    "clue:ledger",  // Offshore Cipher Ledger (Value: 5)
    "clue:wiretap", // Wax Cylinder Audio Wiretap (Value: 10)
    "clue:cipher",  // Master Brass Cipher Key (Value: 25)
];

#[near(serializers = [json, borsh])]
#[borsh(use_discriminant = false)]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum ClueType {
    Ash,
    Cctv,
    Ledger,
    Wiretap,
    Cipher,
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum BadgeRank {
    Rookie,         // 0 Cases Cracked — Slate Grey SVG
    Inspector,      // 1..2 Cases Cracked — Amber Gold SVG
    ChiefDetective, // >= 3 Cases Cracked — Emerald Neon SVG
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug, PartialEq)]
pub struct SuspectCase {
    pub case_number: u32,
    pub suspect_id: String,               // e.g., "vex"
    pub suspect_name: String,             // e.g., "Vex the Phantom"
    pub sub_account_id: AccountId,        // e.g., "vex.alibivault-yuhnkm.testnet"
    pub current_composure: u32,           // Starts at 1000
    pub max_composure: u32,               // Starts at 1000, +200 per new case
    pub bounty_jackpot_yocto: u128,       // Active jackpot pool in yoctoNEAR
    pub informant_reserve_yocto: u128,    // 10% fee reserve for informant buybacks
    pub alibi_defense_bps: [u16; 5],      // [Ash, Cctv, Ledger, Wiretap, Cipher] — sums to 9000 bps
    pub buyback_multiplier_bps: [u16; 5], // Default [10000, 10000, 12000, 15000, 20000]
    pub total_case_damage: u64,           // Sum of all mental damage dealt in current case
    pub interrogations_survived: u32,
    pub last_suspect_quote: String,       // Latest dialogue / rebuttal
    pub last_tee_chat_id: String,         // Latest verified NEAR AI Cloud TEE chat_id
    pub last_tee_signature: String,       // Latest ECDSA signature from /v1/signature/{chat_id}
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug, PartialEq)]
pub struct DetectiveProfile {
    pub account_id: AccountId,
    pub internal_balance_yocto: u128,     // Deposit balance for signless warrant fees
    pub claimed_starter: bool,            // Anti-sybil flag (true after 1st claim)
    pub clues: [u64; 5],                  // NEP-245 balances: [Ash, Cctv, Ledger, Wiretap, Cipher]
    pub cases_cracked: u32,               // Number of final confessions triggered
    pub total_damage_dealt: u64,          // Lifetime mental damage dealt
    pub total_bounty_won_yocto: u128,     // Lifetime NEAR won from vaults
    pub badge_rank: BadgeRank,            // Current NEP-171 Badge Rank
}

#[near(serializers = [json])]
#[derive(Clone, Debug)]
pub struct InterrogationOutcome {
    pub cracked: bool,
    pub damage_dealt: u32,
    pub remaining_composure: u32,
    pub final_bonus_yocto: U128,
    pub proportional_share_yocto: U128,
    pub total_jackpot_won_yocto: U128,
    pub new_case_number: u32,
    pub suspect_quote: String,
}

#[near(serializers = [json])]
#[derive(Clone, Debug)]
pub struct SuspectCaseView {
    pub case_number: u32,
    pub suspect_id: String,
    pub suspect_name: String,
    pub sub_account_id: AccountId,
    pub current_composure: u32,
    pub max_composure: u32,
    pub bounty_jackpot_yocto: U128,
    pub informant_reserve_yocto: U128,
    pub alibi_defense_bps: [u16; 5],
    pub buyback_multiplier_bps: [u16; 5],
    pub total_case_damage: u64,
    pub interrogations_survived: u32,
    pub last_suspect_quote: String,
    pub last_tee_chat_id: String,
    pub last_tee_signature: String,
}

#[near(serializers = [json])]
#[derive(Clone, Debug)]
pub struct DetectiveProfileView {
    pub account_id: AccountId,
    pub internal_balance_yocto: U128,
    pub claimed_starter: bool,
    pub clues: [u64; 5],
    pub cases_cracked: u32,
    pub total_damage_dealt: u64,
    pub total_bounty_won_yocto: U128,
    pub badge_rank: BadgeRank,
}

#[near(serializers = [json])]
#[derive(Clone, Debug)]
pub struct DashboardView {
    pub active_case: SuspectCaseView,
    pub clue_supplies: [u64; 5],
    pub detective_profile: Option<DetectiveProfileView>,
    pub caller_case_damage: u64,
    pub estimated_payout_yocto: U128,
    pub badge_svg_data_uri: String,
}

#[near(serializers = [json])]
#[derive(Clone, Debug)]
pub struct TokenMetadata {
    pub title: Option<String>,
    pub description: Option<String>,
    pub media: Option<String>,
    pub media_hash: Option<String>,
    pub copies: Option<u64>,
    pub issued_at: Option<u64>,
    pub expires_at: Option<u64>,
    pub starts_at: Option<u64>,
    pub updated_at: Option<u64>,
    pub extra: Option<String>,
    pub reference: Option<String>,
    pub reference_hash: Option<String>,
}

#[near(serializers = [json])]
#[derive(Clone, Debug)]
pub struct JsonBadgeToken {
    pub token_id: String,
    pub owner_id: AccountId,
    pub metadata: TokenMetadata,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct AlibiVaultContract {
    pub owner_id: AccountId,
    pub active_case: SuspectCase,
    pub warrant_fee_yocto: u128,                                // Default: 0.1 NEAR (10^23 yoctoNEAR)
    pub clue_supplies: [u64; 5],                                // Total circulating [Ash, Cctv, Ledger, Wiretap, Cipher]
    pub detectives: LookupMap<AccountId, DetectiveProfile>,
    pub case_damage_by_detective: UnorderedMap<AccountId, u64>, // Reset when case cracks
    pub used_tee_chat_ids: LookupSet<String>,                   // Anti-replay set for TEE proofs
}

fn base64_encode(input: &[u8]) -> String {
    const CHARSET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity((input.len() + 2) / 3 * 4);
    for chunk in input.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;
        out.push(CHARSET[((triple >> 18) & 0x3F) as usize] as char);
        out.push(CHARSET[((triple >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            out.push(CHARSET[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
        if chunk.len() > 2 {
            out.push(CHARSET[(triple & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
    }
    out
}

#[near]
impl AlibiVaultContract {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        let current_account = env::current_account_id();
        let sub_account_id: AccountId = format!("vex.{}", current_account)
            .parse()
            .unwrap_or_else(|_| current_account.clone());

        let active_case = SuspectCase {
            case_number: 1,
            suspect_id: "vex".to_string(),
            suspect_name: "Vex the Phantom".to_string(),
            sub_account_id,
            current_composure: 1000,
            max_composure: 1000,
            bounty_jackpot_yocto: 0,
            informant_reserve_yocto: 0,
            alibi_defense_bps: [1800, 1800, 1800, 1800, 1800],
            buyback_multiplier_bps: [10000, 10000, 12000, 15000, 20000],
            total_case_damage: 0,
            interrogations_survived: 0,
            last_suspect_quote: "You have nothing on me, detective. My alibi is airtight.".to_string(),
            last_tee_chat_id: String::new(),
            last_tee_signature: String::new(),
        };

        Self {
            owner_id,
            active_case,
            warrant_fee_yocto: 100_000_000_000_000_000_000_000, // 0.1 NEAR
            clue_supplies: [0, 0, 0, 0, 0],
            detectives: LookupMap::new(b"x"),
            case_damage_by_detective: UnorderedMap::new(b"y"),
            used_tee_chat_ids: LookupSet::new(b"z"),
        }
    }

    #[init(ignore_state)]
    pub fn reinit(owner_id: AccountId) -> Self {
        let current_account = env::current_account_id();
        let sub_account_id: AccountId = format!("vex.{}", current_account)
            .parse()
            .unwrap_or_else(|_| current_account.clone());

        let active_case = SuspectCase {
            case_number: 1,
            suspect_id: "vex".to_string(),
            suspect_name: "Vex the Phantom".to_string(),
            sub_account_id,
            current_composure: 1000,
            max_composure: 1000,
            bounty_jackpot_yocto: 1_000_000_000_000_000_000_000_000, // 1 NEAR initial jackpot
            informant_reserve_yocto: 200_000_000_000_000_000_000_000,
            alibi_defense_bps: [1800, 1800, 1800, 1800, 1800],
            buyback_multiplier_bps: [10000, 10000, 12000, 15000, 20000],
            total_case_damage: 0,
            interrogations_survived: 0,
            last_suspect_quote: "The foggy streets of London hide all sins. What evidence do you possess, inspector?".to_string(),
            last_tee_chat_id: String::new(),
            last_tee_signature: String::new(),
        };

        Self {
            owner_id,
            active_case,
            warrant_fee_yocto: 100_000_000_000_000_000_000_000, // 0.1 NEAR
            clue_supplies: [0, 0, 0, 0, 0],
            detectives: LookupMap::new(b"x"),
            case_damage_by_detective: UnorderedMap::new(b"y"),
            used_tee_chat_ids: LookupSet::new(b"z"),
        }
    }

    // -------------------------------------------------------------------------
    // Internal Balance Accounting (Payable / Withdraw)
    // -------------------------------------------------------------------------

    #[payable]
    pub fn deposit(&mut self) {
        let deposit_amount = env::attached_deposit().as_yoctonear();
        assert!(deposit_amount > 0, "Attached deposit must be greater than 0");

        let caller = env::predecessor_account_id();
        let mut profile = self.internal_get_or_create_profile(&caller);
        profile.internal_balance_yocto += deposit_amount;
        self.detectives.insert(&caller, &profile);

        env::log_str(&format!(
            "Internal deposit of {} yoctoNEAR credited to {}",
            deposit_amount, caller
        ));
    }

    #[payable]
    pub fn seed_bounty_vault(&mut self) {
        let seed_amount = env::attached_deposit().as_yoctonear();
        assert!(seed_amount > 0, "Seed amount must be greater than 0");
        self.active_case.bounty_jackpot_yocto += seed_amount;

        env::log_str(&format!(
            "Bounty vault seeded with {} yoctoNEAR. Current jackpot: {}",
            seed_amount, self.active_case.bounty_jackpot_yocto
        ));
    }

    pub fn withdraw(&mut self, amount: Option<U128>) -> Promise {
        let caller = env::predecessor_account_id();
        let mut profile = self
            .detectives
            .get(&caller)
            .expect("Detective profile not found");

        let withdraw_amount = match amount {
            Some(requested) => requested.0,
            None => profile.internal_balance_yocto,
        };

        assert!(withdraw_amount > 0, "Withdrawal amount must be greater than 0");
        assert!(
            profile.internal_balance_yocto >= withdraw_amount,
            "Insufficient internal balance to withdraw"
        );

        profile.internal_balance_yocto -= withdraw_amount;
        self.detectives.insert(&caller, &profile);

        Promise::new(caller).transfer(NearToken::from_yoctonear(withdraw_amount))
    }

    // -------------------------------------------------------------------------
    // Signless Gameplay Methods (Non-Payable — Function Call Key Compatible)
    // -------------------------------------------------------------------------

    pub fn claim_starter_clues(&mut self) {
        let caller = env::predecessor_account_id();
        let mut profile = self.internal_get_or_create_profile(&caller);

        assert!(
            !profile.claimed_starter,
            "Starter clues already claimed by this account"
        );

        profile.claimed_starter = true;
        // Starter detective kit: 3 Pipe Ash, 2 London Footprints, 1 Cipher Ledger
        profile.clues[0] += 3;
        profile.clues[1] += 2;
        profile.clues[2] += 1;

        self.clue_supplies[0] += 3;
        self.clue_supplies[1] += 2;
        self.clue_supplies[2] += 1;

        self.detectives.insert(&caller, &profile);
        self.internal_recalculate_alibi_defense();

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"nep245\",\"version\":\"1.0.0\",\"event\":\"mt_mint\",\"data\":[{{\"owner_id\":\"{}\",\"token_ids\":[\"clue:ash\",\"clue:cctv\",\"clue:ledger\"],\"amounts\":[\"3\",\"2\",\"1\"]}}]}}",
            caller
        ));
    }

    pub fn trade_with_informant(&mut self, burn_clue: u8, burn_amount: u64, mint_clue: u8) {
        assert!(burn_clue < 5 && mint_clue < 5, "Invalid clue index (0..4)");
        assert!(burn_clue != mint_clue, "Cannot trade identical clue types");
        assert!(burn_amount > 0, "Burn amount must be greater than 0");

        let burn_idx = burn_clue as usize;
        let mint_idx = mint_clue as usize;

        let caller = env::predecessor_account_id();
        let mut profile = self.internal_get_or_create_profile(&caller);

        assert!(
            profile.clues[burn_idx] >= burn_amount,
            "Insufficient evidence balance to trade with Informant"
        );
        assert!(
            self.clue_supplies[burn_idx] >= burn_amount,
            "Circulating supply underflow protection"
        );

        let total_burn_val = burn_amount * CLUE_VALUES[burn_idx];
        // Informant takes 10% commission fee (90% exchange value)
        let net_val = (total_burn_val * 90) / 100;
        let target_val = CLUE_VALUES[mint_idx];
        let mint_amount = net_val / target_val;

        assert!(
            mint_amount > 0,
            "Trade value is too low to acquire at least 1 unit of requested evidence"
        );

        let remainder_val = net_val - (mint_amount * target_val);

        profile.clues[burn_idx] -= burn_amount;
        self.clue_supplies[burn_idx] -= burn_amount;

        profile.clues[mint_idx] += mint_amount;
        self.clue_supplies[mint_idx] += mint_amount;

        // Change returned in Pipe Ash (value 1) so detective loses zero fractional points
        if remainder_val > 0 {
            profile.clues[0] += remainder_val;
            self.clue_supplies[0] += remainder_val;
        }

        self.detectives.insert(&caller, &profile);
        self.internal_recalculate_alibi_defense();

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"nep245\",\"version\":\"1.0.0\",\"event\":\"mt_burn\",\"data\":[{{\"owner_id\":\"{}\",\"token_ids\":[\"{}\"],\"amounts\":[\"{}\"]}}]}}",
            caller, CLUE_IDS[burn_idx], burn_amount
        ));
        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"nep245\",\"version\":\"1.0.0\",\"event\":\"mt_mint\",\"data\":[{{\"owner_id\":\"{}\",\"token_ids\":[\"{}\"],\"amounts\":[\"{}\"]}}]}}",
            caller, CLUE_IDS[mint_idx], mint_amount
        ));
    }

    pub fn update_alibi_meta(&mut self) {
        self.internal_recalculate_alibi_defense();
    }

    pub fn interrogate_suspect(&mut self, clue: u8, tactics: [u8; 3]) -> InterrogationOutcome {
        assert!(clue < 5, "Invalid clue index (0..4)");
        let clue_idx = clue as usize;

        let caller = env::predecessor_account_id();
        let mut profile = self.internal_get_or_create_profile(&caller);

        assert!(
            profile.clues[clue_idx] >= 1,
            "You do not hold this evidence clue"
        );
        assert!(
            profile.internal_balance_yocto >= self.warrant_fee_yocto,
            "Insufficient internal balance for Warrant Fee. Please deposit NEAR first."
        );

        // Deduct Warrant Fee upfront (Anti-offchain simulation)
        profile.internal_balance_yocto -= self.warrant_fee_yocto;
        let to_jackpot = (self.warrant_fee_yocto * 90) / 100;
        let to_reserve = self.warrant_fee_yocto - to_jackpot;
        self.active_case.bounty_jackpot_yocto += to_jackpot;
        self.active_case.informant_reserve_yocto += to_reserve;

        // Consume 1 unit of the used evidence clue
        profile.clues[clue_idx] -= 1;
        self.clue_supplies[clue_idx] = self.clue_supplies[clue_idx].saturating_sub(1);

        // Base damage scales with clue value tier (150 to 3750)
        let base_power: u64 = CLUE_VALUES[clue_idx] * 180;
        let defense_bps = self.active_case.alibi_defense_bps[clue_idx] as u64;
        let vuln_bps = 10000u64.saturating_sub(defense_bps);

        let tactic_mult = |t: u8| -> u64 {
            match t {
                0 => 10500, // Press (1.05x)
                1 => 11000, // Bluff (1.10x)
                2 => 11500, // Expose (1.15x)
                _ => 10000,
            }
        };

        let t0 = tactic_mult(tactics[0]);
        let t1 = tactic_mult(tactics[1]);
        let t2 = tactic_mult(tactics[2]);
        let avg_tactic_bps = (t0 + t1 + t2) / 3;

        let synergy_bps = if tactics[0] != tactics[1]
            && tactics[1] != tactics[2]
            && tactics[0] != tactics[2]
        {
            1000 // +10% synergy bonus for varied 3-turn sequence
        } else {
            0
        };
        let base_tactic_bps = avg_tactic_bps + synergy_bps;

        // Dynamic Psychological Stance Mind Games
        // 0 = Arrogant (Weak to Expose #2, Resists Press #0)
        // 1 = Stoic (Weak to Press #0, Resists Bluff #1)
        // 2 = Paranoid (Weak to Bluff #1, Resists Expose #2)
        let stance = (self.active_case.interrogations_survived as usize) % 3;
        let mut stance_mod_bps: i64 = 0;
        for t in tactics {
            match stance {
                0 => {
                    if t == 2 { stance_mod_bps += 600; } // Expose breaks arrogance
                    if t == 0 { stance_mod_bps -= 400; } // Press resisted
                }
                1 => {
                    if t == 0 { stance_mod_bps += 600; } // Press breaks stoicism
                    if t == 1 { stance_mod_bps -= 400; } // Bluff ignored
                }
                _ => {
                    if t == 1 { stance_mod_bps += 600; } // Bluff rattles paranoia
                    if t == 2 { stance_mod_bps -= 400; } // Expose shuts them down
                }
            }
        }
        let effective_tactic_bps = (base_tactic_bps as i64 + stance_mod_bps).max(5000) as u64;

        // Pseudo-random variance (90%..=110%)
        let seed = env::random_seed();
        let seed_val = if seed.len() >= 2 {
            (seed[0] as u64) * 256 + (seed[1] as u64)
        } else {
            0
        };
        let rand_bps = 9000 + (seed_val % 2001);

        // Mental damage formula
        let raw_damage =
            (base_power * vuln_bps * effective_tactic_bps * rand_bps) / 1_000_000_000_000;
        let damage = std::cmp::max(10, raw_damage as u32);

        profile.total_damage_dealt += damage as u64;

        let prev_caller_case_dmg = self.case_damage_by_detective.get(&caller).unwrap_or(0);
        let new_caller_case_dmg = prev_caller_case_dmg + damage as u64;
        self.case_damage_by_detective
            .insert(&caller, &new_caller_case_dmg);
        self.active_case.total_case_damage += damage as u64;

        if damage < self.active_case.current_composure {
            self.active_case.current_composure -= damage;
            self.active_case.interrogations_survived += 1;
            let quote = format!(
                "My composure holds strong against your evidence! (Remaining Composure: {})",
                self.active_case.current_composure
            );
            self.active_case.last_suspect_quote = quote.clone();
            self.detectives.insert(&caller, &profile);
            self.internal_recalculate_alibi_defense();

            InterrogationOutcome {
                cracked: false,
                damage_dealt: damage,
                remaining_composure: self.active_case.current_composure,
                final_bonus_yocto: U128(0),
                proportional_share_yocto: U128(0),
                total_jackpot_won_yocto: U128(0),
                new_case_number: self.active_case.case_number,
                suspect_quote: quote,
            }
        } else {
            // Suspect Cracks! Vault payout distribution
            self.active_case.current_composure = 0;
            let jackpot = self.active_case.bounty_jackpot_yocto;
            let final_bonus = jackpot / 10; // 10% Final Confession Bonus
            let pool_90 = jackpot - final_bonus;
            let total_dmg = self.active_case.total_case_damage;

            let mut caller_share: u128 = 0;

            // Distribute 90% proportionally to all detectives who dealt damage
            let damage_entries = self.case_damage_by_detective.to_vec();
            for (det_id, dmg) in damage_entries {
                let share = if total_dmg > 0 {
                    (pool_90 * (dmg as u128)) / (total_dmg as u128)
                } else {
                    0
                };

                let mut det_profile = if det_id == caller {
                    caller_share = share;
                    profile.clone()
                } else {
                    self.internal_get_or_create_profile(&det_id)
                };

                let mut total_credit = share;
                if det_id == caller {
                    total_credit += final_bonus;
                    det_profile.cases_cracked += 1;
                    det_profile.badge_rank = Self::compute_badge_rank(det_profile.cases_cracked);
                }

                det_profile.internal_balance_yocto += total_credit;
                det_profile.total_bounty_won_yocto += total_credit;

                if det_id == caller {
                    profile = det_profile.clone();
                }
                self.detectives.insert(&det_id, &det_profile);
            }

            let caller_total_won = caller_share + final_bonus;
            let old_case_num = self.active_case.case_number;

            // Reset case damage mapping for the new case
            self.case_damage_by_detective.clear();

            // Advance to next suspect tier
            self.active_case.case_number += 1;
            self.active_case.max_composure += 200;
            self.active_case.current_composure = self.active_case.max_composure;
            self.active_case.bounty_jackpot_yocto = 0;
            self.active_case.total_case_damage = 0;
            self.active_case.interrogations_survived = 0;

            match self.active_case.case_number {
                2 => {
                    self.active_case.suspect_id = "cipher".to_string();
                    self.active_case.suspect_name = "Cipher the Broker".to_string();
                }
                3 => {
                    self.active_case.suspect_id = "architect".to_string();
                    self.active_case.suspect_name = "The Architect".to_string();
                }
                _ => {
                    self.active_case.suspect_id =
                        format!("suspect_{}", self.active_case.case_number);
                    self.active_case.suspect_name =
                        format!("Syndicate Mastermind #{}", self.active_case.case_number);
                }
            }

            let quote = format!(
                "I confess! The vault is yours... (Case #{} Cracked!)",
                old_case_num
            );
            self.active_case.last_suspect_quote = quote.clone();
            self.internal_recalculate_alibi_defense();

            InterrogationOutcome {
                cracked: true,
                damage_dealt: damage,
                remaining_composure: 0,
                final_bonus_yocto: U128(final_bonus),
                proportional_share_yocto: U128(caller_share),
                total_jackpot_won_yocto: U128(caller_total_won),
                new_case_number: self.active_case.case_number,
                suspect_quote: quote,
            }
        }
    }

    pub fn record_tee_statement(
        &mut self,
        suspect_quote: String,
        buyback_multiplier_bps: [u16; 5],
        chat_id: String,
        tee_signature: String,
    ) {
        assert!(
            !self.used_tee_chat_ids.contains(&chat_id),
            "TEE chat_id already used (anti-replay protection)"
        );

        self.used_tee_chat_ids.insert(&chat_id);
        let mut clamped = [10000u16; 5];
        for i in 0..5 {
            clamped[i] = buyback_multiplier_bps[i].clamp(10000, 40000);
        }

        self.active_case.last_suspect_quote = suspect_quote;
        self.active_case.last_tee_chat_id = chat_id;
        self.active_case.last_tee_signature = tee_signature;
        self.active_case.buyback_multiplier_bps = clamped;
    }

    // -------------------------------------------------------------------------
    // Crime Scene Grinding & Judge Demo Helper Methods
    // -------------------------------------------------------------------------

    pub fn search_crime_scene(&mut self) -> [u64; 5] {
        let caller = env::predecessor_account_id();
        let mut profile = self.internal_get_or_create_profile(&caller);

        let search_cost = 50_000_000_000_000_000_000_000; // 0.05 NEAR
        assert!(
            profile.internal_balance_yocto >= search_cost,
            "Need at least 0.05 NEAR internal balance to canvas crime scene"
        );
        profile.internal_balance_yocto -= search_cost;

        let to_jackpot = search_cost / 2;
        let to_reserve = search_cost - to_jackpot;
        self.active_case.bounty_jackpot_yocto += to_jackpot;
        self.active_case.informant_reserve_yocto += to_reserve;

        let seed = env::random_seed();
        let roll = if !seed.is_empty() { (seed[0] as usize) % 100 } else { 42 };

        let found: [u64; 5] = if roll < 35 {
            [3, 1, 0, 0, 0] // 3 Ash + 1 CCTV
        } else if roll < 65 {
            [1, 2, 0, 0, 0] // 1 Ash + 2 CCTV
        } else if roll < 83 {
            [2, 0, 1, 0, 0] // 2 Ash + 1 Swiss Ledger
        } else if roll < 95 {
            [0, 1, 0, 1, 0] // 1 CCTV + 1 Wiretap Audio Cylinder
        } else {
            [0, 0, 1, 0, 1] // JACKPOT: 1 Ledger + 1 Master Cipher Key!
        };

        for i in 0..5 {
            profile.clues[i] += found[i];
            self.clue_supplies[i] += found[i];
        }

        self.detectives.insert(&caller, &profile);
        self.internal_recalculate_alibi_defense();

        env::log_str(&format!(
            "Crime scene search by {}: Found {:?} (Roll: {})",
            caller, found, roll
        ));

        found
    }

    pub fn judge_grant_clues(&mut self, clue_amounts: [u64; 5]) {
        let caller = env::predecessor_account_id();
        let mut profile = self.internal_get_or_create_profile(&caller);
        for i in 0..5 {
            profile.clues[i] += clue_amounts[i];
            self.clue_supplies[i] += clue_amounts[i];
        }
        self.detectives.insert(&caller, &profile);
        self.internal_recalculate_alibi_defense();
        env::log_str(&format!(
            "Judge demo: Granted {:?} evidence to {}",
            clue_amounts, caller
        ));
    }

    pub fn set_warrant_fee(&mut self, fee_yocto: U128) {
        assert_eq!(
            env::predecessor_account_id(),
            self.owner_id,
            "Only owner can change warrant fee"
        );
        self.warrant_fee_yocto = fee_yocto.0;
    }

    // -------------------------------------------------------------------------
    // View Methods
    // -------------------------------------------------------------------------

    pub fn get_dashboard_state(&self, account_id: Option<AccountId>) -> DashboardView {
        let (det_view, caller_case_dmg, est_payout, badge_svg) = match account_id {
            Some(ref id) => {
                let prof = self.internal_get_profile_view(id);
                let case_dmg = self.case_damage_by_detective.get(id).unwrap_or(0);
                let est_share = if self.active_case.total_case_damage > 0 {
                    let pool_90 = (self.active_case.bounty_jackpot_yocto * 90) / 100;
                    (pool_90 * (case_dmg as u128)) / (self.active_case.total_case_damage as u128)
                } else {
                    0
                };
                let badge = if let Some(p) = self.detectives.get(id) {
                    self.render_badge_svg(&p)
                } else {
                    self.render_badge_svg(&DetectiveProfile {
                        account_id: id.clone(),
                        internal_balance_yocto: 0,
                        claimed_starter: false,
                        clues: [0, 0, 0, 0, 0],
                        cases_cracked: 0,
                        total_damage_dealt: 0,
                        total_bounty_won_yocto: 0,
                        badge_rank: BadgeRank::Rookie,
                    })
                };
                (prof, case_dmg, U128(est_share), badge)
            }
            None => {
                let dummy = DetectiveProfile {
                    account_id: "detective.testnet".parse().unwrap(),
                    internal_balance_yocto: 0,
                    claimed_starter: false,
                    clues: [0, 0, 0, 0, 0],
                    cases_cracked: 0,
                    total_damage_dealt: 0,
                    total_bounty_won_yocto: 0,
                    badge_rank: BadgeRank::Rookie,
                };
                (None, 0, U128(0), self.render_badge_svg(&dummy))
            }
        };

        DashboardView {
            active_case: self.get_active_case(),
            clue_supplies: self.clue_supplies,
            detective_profile: det_view,
            caller_case_damage: caller_case_dmg,
            estimated_payout_yocto: est_payout,
            badge_svg_data_uri: badge_svg,
        }
    }

    pub fn nft_token(&self, token_id: String) -> Option<JsonBadgeToken> {
        let account_id: AccountId = token_id.parse().ok()?;
        let profile = self.detectives.get(&account_id)?;
        let media_uri = self.render_badge_svg(&profile);

        let title = match profile.badge_rank {
            BadgeRank::Rookie => "Scotland Yard Detective Badge — Rookie",
            BadgeRank::Inspector => "Scotland Yard Detective Badge — Inspector",
            BadgeRank::ChiefDetective => "Scotland Yard Detective Badge — Chief Detective",
        };

        Some(JsonBadgeToken {
            token_id,
            owner_id: profile.account_id.clone(),
            metadata: TokenMetadata {
                title: Some(title.to_string()),
                description: Some(
                    "Dynamic On-Chain SVG Detective Credential for Alibi Vault (NEP-171 + NEP-177)"
                        .to_string(),
                ),
                media: Some(media_uri),
                media_hash: None,
                copies: Some(1),
                issued_at: None,
                expires_at: None,
                starts_at: None,
                updated_at: None,
                extra: Some(format!(
                    r#"{{"cases_cracked":{},"total_damage":{},"rank":"{:?}"}}"#,
                    profile.cases_cracked, profile.total_damage_dealt, profile.badge_rank
                )),
                reference: None,
                reference_hash: None,
            },
        })
    }

    pub fn get_detective_profile(&self, account_id: AccountId) -> Option<DetectiveProfileView> {
        self.internal_get_profile_view(&account_id)
    }

    pub fn get_active_case(&self) -> SuspectCaseView {
        SuspectCaseView {
            case_number: self.active_case.case_number,
            suspect_id: self.active_case.suspect_id.clone(),
            suspect_name: self.active_case.suspect_name.clone(),
            sub_account_id: self.active_case.sub_account_id.clone(),
            current_composure: self.active_case.current_composure,
            max_composure: self.active_case.max_composure,
            bounty_jackpot_yocto: U128(self.active_case.bounty_jackpot_yocto),
            informant_reserve_yocto: U128(self.active_case.informant_reserve_yocto),
            alibi_defense_bps: self.active_case.alibi_defense_bps,
            buyback_multiplier_bps: self.active_case.buyback_multiplier_bps,
            total_case_damage: self.active_case.total_case_damage,
            interrogations_survived: self.active_case.interrogations_survived,
            last_suspect_quote: self.active_case.last_suspect_quote.clone(),
            last_tee_chat_id: self.active_case.last_tee_chat_id.clone(),
            last_tee_signature: self.active_case.last_tee_signature.clone(),
        }
    }

    // -------------------------------------------------------------------------
    // Internal Helper Methods
    // -------------------------------------------------------------------------

    fn internal_get_or_create_profile(&mut self, account_id: &AccountId) -> DetectiveProfile {
        if let Some(profile) = self.detectives.get(account_id) {
            profile
        } else {
            DetectiveProfile {
                account_id: account_id.clone(),
                internal_balance_yocto: 0,
                claimed_starter: false,
                clues: [0, 0, 0, 0, 0],
                cases_cracked: 0,
                total_damage_dealt: 0,
                total_bounty_won_yocto: 0,
                badge_rank: BadgeRank::Rookie,
            }
        }
    }

    fn internal_get_profile_view(&self, account_id: &AccountId) -> Option<DetectiveProfileView> {
        self.detectives.get(account_id).map(|p| DetectiveProfileView {
            account_id: p.account_id,
            internal_balance_yocto: U128(p.internal_balance_yocto),
            claimed_starter: p.claimed_starter,
            clues: p.clues,
            cases_cracked: p.cases_cracked,
            total_damage_dealt: p.total_damage_dealt,
            total_bounty_won_yocto: U128(p.total_bounty_won_yocto),
            badge_rank: p.badge_rank,
        })
    }

    fn internal_recalculate_alibi_defense(&mut self) {
        let total_supply: u64 = self.clue_supplies.iter().sum();
        if total_supply == 0 {
            self.active_case.alibi_defense_bps = [1800, 1800, 1800, 1800, 1800];
            return;
        }

        // Each clue's defense is proportional to its market circulation (sums to 9000 bps)
        let mut raw_bps = [0u32; 5];
        let mut sum_raw = 0u32;
        for i in 0..5 {
            let s = self.clue_supplies[i] as u32;
            let share = (s * 9000) / (total_supply as u32);
            let clamped = share.clamp(300, 4500);
            raw_bps[i] = clamped;
            sum_raw += clamped;
        }

        // Normalize strictly to 9000 bps
        let mut final_bps = [1800u16; 5];
        let mut distributed = 0u16;
        for i in 0..4 {
            let norm = ((raw_bps[i] as u64 * 9000) / (sum_raw as u64)) as u16;
            final_bps[i] = norm;
            distributed += norm;
        }
        final_bps[4] = 9000u16.saturating_sub(distributed);
        self.active_case.alibi_defense_bps = final_bps;
    }

    pub fn compute_badge_rank(cases_cracked: u32) -> BadgeRank {
        if cases_cracked >= 3 {
            BadgeRank::ChiefDetective
        } else if cases_cracked >= 1 {
            BadgeRank::Inspector
        } else {
            BadgeRank::Rookie
        }
    }

    pub fn render_badge_svg(&self, profile: &DetectiveProfile) -> String {
        let (accent_color, rank_title) = match profile.badge_rank {
            BadgeRank::Rookie => ("#7B9C9D", "SCOTLAND YARD // PROBATIONARY DETECTIVE"),
            BadgeRank::Inspector => ("#F1C84B", "SCOTLAND YARD // INSPECTOR CREDENTIAL"),
            BadgeRank::ChiefDetective => ("#D15B29", "SCOTLAND YARD // CHIEF INVESTIGATOR"),
        };

        let yocto_per_near: u128 = 1_000_000_000_000_000_000_000_000;
        let whole_near = profile.total_bounty_won_yocto / yocto_per_near;
        let fraction = (profile.total_bounty_won_yocto % yocto_per_near) / (yocto_per_near / 100);
        let bounty_near_str = format!("{}.{:02}", whole_near, fraction);

        let svg = format!(
            r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 250" width="420" height="250">
  <rect width="420" height="250" fill="#16110E" stroke="{}" stroke-width="2" rx="6" />
  <rect x="8" y="8" width="404" height="234" fill="#1F2942" stroke="#4B5B81" stroke-width="1" rx="4" />
  <!-- Victorian Header Ribbon -->
  <rect x="8" y="8" width="404" height="34" fill="{}" fill-opacity="0.2" />
  <text x="20" y="30" fill="{}" font-family="serif" font-size="12" font-weight="bold" letter-spacing="1">
    BAKER STREET ARCHIVE // NEP-171 // {}
  </text>
  <!-- Detective Identity & Stats -->
  <text x="20" y="70" fill="#ECE8DF" font-family="monospace" font-size="15" font-weight="bold">
    AGENT: {}
  </text>
  <line x1="20" y1="84" x2="400" y2="84" stroke="#4B5B81" stroke-width="1" stroke-dasharray="3 3" />
  <text x="20" y="112" fill="#7B9C9D" font-family="serif" font-size="11">CASES SOLVED</text>
  <text x="20" y="134" fill="{}" font-family="monospace" font-size="22" font-weight="bold">{}</text>
  <text x="160" y="112" fill="#7B9C9D" font-family="serif" font-size="11">MENTAL DMG</text>
  <text x="160" y="134" fill="#ECE8DF" font-family="monospace" font-size="22" font-weight="bold">{}</text>
  <text x="300" y="112" fill="#7B9C9D" font-family="serif" font-size="11">BOUNTY WON</text>
  <text x="300" y="134" fill="#F1C84B" font-family="monospace" font-size="20" font-weight="bold">{} N</text>
  <!-- Evidence Locker Footer -->
  <rect x="20" y="160" width="380" height="64" fill="#16110E" stroke="#362820" stroke-width="1" rx="3" />
  <text x="30" y="184" fill="#7B9C9D" font-family="monospace" font-size="11">
    EVIDENCE: ASH[{}] CCTV[{}] LEDGER[{}]
  </text>
  <text x="30" y="206" fill="{}" font-family="monospace" font-size="10">
    WIRETAP[{}] CIPHER[{}] | NEAR TESTNET NEP-177 DYNAMIC SVG
  </text>
</svg>"##,
            accent_color,
            accent_color,
            accent_color,
            rank_title,
            profile.account_id,
            accent_color,
            profile.cases_cracked,
            profile.total_damage_dealt,
            bounty_near_str,
            profile.clues[0],
            profile.clues[1],
            profile.clues[2],
            profile.clues[3],
            profile.clues[4],
            accent_color
        );

        format!("data:image/svg+xml;base64,{}", base64_encode(svg.as_bytes()))
    }
}

// =============================================================================
// Comprehensive Unit Tests
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::testing_env;

    fn get_context(predecessor: &AccountId, attached_deposit: u128) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id("alibivault-yuhnkm.testnet".parse().unwrap())
            .signer_account_id(predecessor.clone())
            .predecessor_account_id(predecessor.clone())
            .attached_deposit(NearToken::from_yoctonear(attached_deposit))
            .random_seed([42u8; 32]);
        builder
    }

    #[test]
    fn test_starter_kit_and_informant_value_trade() {
        let alice: AccountId = "alice.testnet".parse().unwrap();
        let mut ctx = get_context(&alice, 1_000_000_000_000_000_000_000_000); // 1 NEAR
        testing_env!(ctx.build());

        let mut contract = AlibiVaultContract::new("owner.testnet".parse().unwrap());
        contract.claim_starter_clues();

        let prof = contract.get_detective_profile(alice.clone()).unwrap();
        // Starter gives [3 Ash, 2 CCTV, 1 Ledger, 0, 0]
        assert_eq!(prof.clues, [3, 2, 1, 0, 0]);

        // Trade 2x CCTV (Value: 2 * 2 = 4 pts). Net 90% = 3.6 -> 3 pts.
        // Target: Ash (Value: 1 pt) -> 3 Ash minted!
        contract.trade_with_informant(1, 2, 0);

        let prof_after = contract.get_detective_profile(alice.clone()).unwrap();
        assert_eq!(prof_after.clues[1], 0); // 2 CCTV burned
        assert_eq!(prof_after.clues[0], 6); // 3 original + 3 traded
    }

    #[test]
    fn test_interrogate_with_tactics_and_damage() {
        let bob: AccountId = "bob.testnet".parse().unwrap();
        let mut ctx = get_context(&bob, 1_000_000_000_000_000_000_000_000); // 1 NEAR
        testing_env!(ctx.build());

        let mut contract = AlibiVaultContract::new("owner.testnet".parse().unwrap());
        contract.deposit();
        contract.claim_starter_clues();

        // Bob uses Ledger (index 2) with mixed tactics [0, 1, 2]
        ctx.attached_deposit(NearToken::from_yoctonear(0));
        testing_env!(ctx.build());
        let outcome = contract.interrogate_suspect(2, [0, 1, 2]);

        assert!(outcome.damage_dealt > 100);
        let prof = contract.get_detective_profile(bob.clone()).unwrap();
        assert_eq!(prof.clues[2], 0); // 1 Ledger consumed
    }
}
