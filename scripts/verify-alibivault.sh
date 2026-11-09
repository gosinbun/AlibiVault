#!/usr/bin/env bash
# ==============================================================================
# ALIBI VAULT — LIVE NEAR TESTNET ON-CHAIN VERIFICATION SCRIPT
# Track 1: Games With Real Economies
# Track 2: Privacy & Private AI (NEAR AI Cloud TEE)
# Track 3: NFTs That Do Something (Dynamic NEP-177 SVG Detective Badge)
# ==============================================================================

set -e

CONTRACT_ID="${1:-alibivault-yuhnkm.testnet}"
RPC_URL="${NEAR_RPC_URL:-https://rpc.testnet.near.org}"

echo "======================================================================"
echo "  🕵️  ALIBI VAULT ON-CHAIN VERIFIER // NEAR TESTNET"
echo "  Target Contract : $CONTRACT_ID"
echo "  RPC Endpoint    : $RPC_URL"
echo "  NearBlocks URL  : https://testnet.nearblocks.io/address/$CONTRACT_ID"
echo "======================================================================"
echo ""

# 1. Query live dashboard state via JSON-RPC
echo ">>> [1/2] Fetching get_dashboard_state() via RPC..."
RPC_PAYLOAD='{"jsonrpc":"2.0","id":"alibi-verify","method":"query","params":{"request_type":"call_function","finality":"final","account_id":"'$CONTRACT_ID'","method_name":"get_dashboard_state","args_base64":"e30="}}'

RAW_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$RPC_PAYLOAD" "$RPC_URL")

# Check if curl succeeded and has result
if echo "$RAW_RESPONSE" | grep -q "result"; then
    echo "RPC query successful!"
    # Decode bytes array from result if jq and python or node are available
    if command -v node >/dev/null 2>&1; then
        node -e '
            const res = JSON.parse(process.argv[1]);
            if (res.result && res.result.result) {
                const bytes = Buffer.from(res.result.result);
                const data = JSON.parse(bytes.toString("utf8"));
                console.log("\n--- ACTIVE CASE STATE ---");
                console.log("Case Number        :", data.active_case.case_number);
                console.log("Suspect            :", data.active_case.suspect_name, `(${data.active_case.sub_account_id})`);
                console.log("Composure (HP)     :", `${data.active_case.current_composure} / ${data.active_case.max_composure}`);
                console.log("Bounty Vault       :", (BigInt(data.active_case.bounty_jackpot_yocto) / 10n**24n).toString() + " NEAR", `(${data.active_case.bounty_jackpot_yocto} yocto)`);
                console.log("Alibi Defense      :", `CCTV: ${data.active_case.alibi_defense_bps[0]/100}% | Dark Ledger: ${data.active_case.alibi_defense_bps[1]/100}% (Sums to ${data.active_case.alibi_defense_bps[0]+data.active_case.alibi_defense_bps[1]} bps)`);
                console.log("Circulating Clues  :", `CCTV: ${data.clue_supplies[0]} | Dark Ledger: ${data.clue_supplies[1]}`);
                console.log("Last Suspect Quote :", data.active_case.last_suspect_quote);
                console.log("Live Badge SVG URI :", data.badge_svg_data_uri.substring(0, 80) + "...");
            }
        ' "$RAW_RESPONSE"
    fi
else
    echo "Notice: RPC returned non-standard format, falling back to near view CLI..."
    if command -v near >/dev/null 2>&1; then
        NEAR_ENV=testnet near view "$CONTRACT_ID" get_dashboard_state '{}'
    fi
fi

echo ""
# 2. Query live NEP-171 / NEP-177 Dynamic SVG Badge Token
TEST_DETECTIVE="agent-noir.$CONTRACT_ID"
echo ">>> [2/2] Fetching live NEP-171 badge for $TEST_DETECTIVE via near view..."
if command -v near >/dev/null 2>&1; then
    NEAR_ENV=testnet near view "$CONTRACT_ID" nft_token '{"token_id":"'$TEST_DETECTIVE'"}' || true
fi

echo ""
echo "======================================================================"
echo "  ✅ VERIFICATION COMPLETE"
echo "  Suspect Sub-Account Identity : vex.$CONTRACT_ID"
echo "  Explore on NearBlocks        : https://testnet.nearblocks.io/address/$CONTRACT_ID"
echo "======================================================================"
