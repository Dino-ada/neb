import { NextRequest, NextResponse } from 'next/server';
import { aggregateByStakeKey } from '@/lib/stakeAggregator';
import { getAssetMetadata, getPolicyAssets } from '@/lib/blockfrost';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const policyId = searchParams.get('policy');
    const assetName = searchParams.get('asset') || '';

    if (!policyId) {
        return NextResponse.json(
            { error: 'Policy ID is required' },
            { status: 400 }
        );
    }

    // Validate policy ID format (56 hex characters)
    if (!/^[a-fA-F0-9]{56}$/.test(policyId)) {
        return NextResponse.json(
            { error: 'Invalid policy ID format. Must be 56 hex characters.' },
            { status: 400 }
        );
    }

    try {
        // Step 0: Resolve asset if only policy ID is provided
        let targetAsset = assetName;
        if (!targetAsset) {
            try {
                const policyAssets = await getPolicyAssets(policyId);
                if (policyAssets.length > 0) {
                    // Sort by quantity (desc) to find the primary token
                    policyAssets.sort((a, b) => {
                        const lenA = a.quantity.length;
                        const lenB = b.quantity.length;
                        if (lenA !== lenB) return lenB - lenA;
                        return b.quantity.localeCompare(a.quantity);
                    });

                    // Extract asset name from best match
                    const bestAsset = policyAssets[0].asset;
                    if (bestAsset.startsWith(policyId)) {
                        targetAsset = bestAsset.slice(policyId.length);
                    }
                }
            } catch (error) {
                console.warn('Failed to resolve policy assets:', error);
            }
        }

        // Fetch graph data and metadata in parallel with resolved asset
        const [graphData, metadata] = await Promise.all([
            aggregateByStakeKey(policyId, targetAsset),
            getAssetMetadata(policyId, targetAsset)
        ]);

        if (graphData.nodes.length === 0) {
            return NextResponse.json(
                { error: 'No holders found for this asset' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...graphData,
            asset: metadata ? {
                policyId: metadata.policy_id,
                assetName: metadata.asset_name,
                fingerprint: metadata.fingerprint,
                quantity: metadata.quantity,
                mintTxHash: metadata.initial_mint_tx_hash,
                onchainMetadata: metadata.onchain_metadata
            } : null
        });
    } catch (error) {
        console.error('Graph API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch token data. Please try again.' },
            { status: 500 }
        );
    }
}
