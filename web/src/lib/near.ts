import * as nearAPI from "near-api-js";

export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID || "alibivault-yuhnkm.testnet";
export const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || "testnet";
export const NODE_URL =
  process.env.NEXT_PUBLIC_NODE_URL || "https://test.rpc.fastnear.com";

export const DEMO_ACCOUNT_ID = "agent-noir.alibivault-yuhnkm.testnet";
export const DEMO_PRIVATE_KEY =
  "ed25519:54QxpUyJNGY6mDkmnG2kGnh5hdM5XLHABt2vy7tUN1j84yAyasD4ZTyZMcsW8pUfWwJBqYd1Wo8habB8cXnkaWKx";

export interface DashboardState {
  active_case: {
    case_number: number;
    suspect_id: string;
    suspect_name: string;
    sub_account_id: string;
    current_composure: number;
    max_composure: number;
    bounty_jackpot_yocto: string;
    informant_reserve_yocto: string;
    alibi_defense_bps: number[];
    buyback_multiplier_bps: number[];
    total_case_damage: number;
    interrogations_survived: number;
    last_suspect_quote: string;
    last_tee_chat_id: string;
    last_tee_signature: string;
  };
  clue_supplies: number[];
  detective_profile: {
    account_id: string;
    internal_balance_yocto: string;
    claimed_starter: boolean;
    clues: number[];
    cases_cracked: number;
    total_damage_dealt: number;
    total_bounty_won_yocto: string;
    badge_rank: "Rookie" | "Inspector" | "ChiefDetective";
  } | null;
  caller_case_damage: number;
  estimated_payout_yocto: string;
  badge_svg_data_uri: string;
}

export interface InterrogationResult {
  cracked: boolean;
  damage_dealt: number;
  remaining_composure: number;
  final_bonus_yocto: string;
  proportional_share_yocto: string;
  total_jackpot_won_yocto: string;
  new_case_number: number;
  suspect_quote: string;
  tx_hash?: string;
}

// Fetch dashboard state directly from NEAR RPC (read-only view call)
export async function fetchDashboardState(
  accountId?: string
): Promise<DashboardState> {
  const args = accountId ? { account_id: accountId } : {};
  const argsBase64 = Buffer.from(JSON.stringify(args)).toString("base64");

  const res = await fetch(NODE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "alibi-view",
      method: "query",
      params: {
        request_type: "call_function",
        finality: "final",
        account_id: CONTRACT_ID,
        method_name: "get_dashboard_state",
        args_base64: argsBase64,
      },
    }),
  });

  const json = await res.json();
  if (json.error || !json.result || !json.result.result) {
    throw new Error(
      json.error?.data || json.error?.message || "Failed to query get_dashboard_state"
    );
  }

  const rawBytes = Buffer.from(json.result.result);
  return JSON.parse(rawBytes.toString("utf8"));
}

// Get near connection & signer for an account
export async function getNearAccount(
  accountId: string,
  privateKey: string
): Promise<nearAPI.Account> {
  const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
  const keyPair = nearAPI.KeyPair.fromString(privateKey as any);
  await keyStore.setKey(NETWORK_ID, accountId, keyPair);

  const near = await nearAPI.connect({
    networkId: NETWORK_ID,
    nodeUrl: NODE_URL,
    keyStore,
  });

  return near.account(accountId);
}

// Execute signless function call directly using local session key
export async function executeSignlessCall(
  accountId: string,
  privateKey: string,
  methodName: string,
  args: Record<string, any> = {},
  attachedDepositYocto: string = "0",
  gas: string = "100000000000000" // 100 Tgas
): Promise<{ txHash: string; rawResult: any }> {
  const account = await getNearAccount(accountId, privateKey);
  const outcome = await account.functionCall({
    contractId: CONTRACT_ID,
    methodName,
    args,
    gas: BigInt(gas) as any,
    attachedDeposit: BigInt(attachedDepositYocto) as any,
  });

  const txHash = outcome.transaction.hash;
  return { txHash, rawResult: outcome };
}

// Convert yoctoNEAR string to formatted NEAR number
export function formatNearAmount(yocto: string | number, decimals: number = 2): string {
  try {
    const b = BigInt(yocto.toString());
    const oneNear = 10n ** 24n;
    const whole = b / oneNear;
    const remainder = b % oneNear;
    const fraction = Number(remainder) / 1e24;
    return (Number(whole) + fraction).toFixed(decimals);
  } catch {
    return "0.00";
  }
}
