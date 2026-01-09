import {
    getAssetHolders,
    getAddressInfo,
    getAddressTransactions,
    getPolicyAssets,
    delay,
    type StakeNode,
    type TransactionLink,
    type GraphData
} from './blockfrost';
import { getLabelForStakeKey, getLabelsForAddresses } from './knownWallets';

interface StakeAggregation {
    stakeAddress: string;
    totalBalance: number;
    addresses: string[];
}

export async function aggregateByStakeKey(
    policyId: string,
    assetName: string = ''
): Promise<GraphData> {
    // Step 0: If no asset name provided, find the primary asset for this policy
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

                // Extract asset name from best match (remove policy id prefix)
                const bestAsset = policyAssets[0].asset;
                if (bestAsset.startsWith(policyId)) {
                    targetAsset = bestAsset.slice(policyId.length);
                }
            }
        } catch (error) {
            console.warn('Failed to resolve policy assets:', error);
        }
    }

    // Step 1: Get top holders
    const holders = await getAssetHolders(policyId, targetAsset);

    if (holders.length === 0) {
        return {
            nodes: [],
            links: [],
            metadata: {
                totalSupply: 0,
                uniqueStakers: 0,
                topWhalePercentage: 0
            }
        };
    }

    // Step 2: Resolve stake addresses with rate limiting
    const stakeMap = new Map<string, StakeAggregation>();
    const addressToStake = new Map<string, string>();

    for (let i = 0; i < holders.length; i++) {
        const holder = holders[i];

        try {
            const addressInfo = await getAddressInfo(holder.address);

            if (addressInfo?.stake_address) {
                const stakeAddr = addressInfo.stake_address;
                addressToStake.set(holder.address, stakeAddr);

                if (stakeMap.has(stakeAddr)) {
                    const existing = stakeMap.get(stakeAddr)!;
                    existing.totalBalance += parseInt(holder.quantity);
                    existing.addresses.push(holder.address);
                } else {
                    stakeMap.set(stakeAddr, {
                        stakeAddress: stakeAddr,
                        totalBalance: parseInt(holder.quantity),
                        addresses: [holder.address]
                    });
                }
            } else {
                // No stake key - treat address as its own entity
                stakeMap.set(holder.address, {
                    stakeAddress: holder.address,
                    totalBalance: parseInt(holder.quantity),
                    addresses: [holder.address]
                });
                addressToStake.set(holder.address, holder.address);
            }

            // Rate limiting: delay every 5 requests
            if (i > 0 && i % 5 === 0) {
                await delay(100);
            }
        } catch (error) {
            console.error(`Error resolving address ${holder.address}:`, error);
        }
    }

    // Step 3: Convert to nodes and sort by balance
    const aggregations = Array.from(stakeMap.values());
    aggregations.sort((a, b) => b.totalBalance - a.totalBalance);

    const totalSupply = aggregations.reduce((sum, a) => sum + a.totalBalance, 0);
    const topHolderPercentage = aggregations.length > 0
        ? (aggregations[0].totalBalance / totalSupply) * 100
        : 0;

    const nodes: StakeNode[] = aggregations.map((agg, index) => {
        // Try to find a label for this wallet
        const stakeLabel = getLabelForStakeKey(agg.stakeAddress);
        const addressLabel = getLabelsForAddresses(agg.addresses);
        const label = stakeLabel || addressLabel;

        return {
            id: agg.stakeAddress,
            stakeAddress: agg.stakeAddress,
            balance: agg.totalBalance,
            addresses: agg.addresses,
            isWhale: (agg.totalBalance / totalSupply) > 0.01,
            rank: index + 1,
            ...(label && {
                label: {
                    name: label.name,
                    category: label.category,
                    icon: label.icon,
                    verified: label.verified
                }
            })
        };
    });

    // Step 4: Build links for top 30 whales based on transaction history
    const links: TransactionLink[] = [];
    const topWhales = nodes.slice(0, 30);
    const txToAddresses = new Map<string, Set<string>>();

    for (let i = 0; i < topWhales.length; i++) {
        const whale = topWhales[i];
        const primaryAddress = whale.addresses[0];

        try {
            const txHashes = await getAddressTransactions(primaryAddress);

            for (const txHash of txHashes) {
                if (!txToAddresses.has(txHash)) {
                    txToAddresses.set(txHash, new Set());
                }
                txToAddresses.get(txHash)!.add(whale.id);
            }

            // Rate limiting
            if (i > 0 && i % 3 === 0) {
                await delay(100);
            }
        } catch (error) {
            console.error(`Error getting transactions for ${primaryAddress}:`, error);
        }
    }

    // Create links between nodes that share transactions
    const linkMap = new Map<string, number>();

    for (const [, addresses] of txToAddresses) {
        const addrArray = Array.from(addresses);
        for (let i = 0; i < addrArray.length; i++) {
            for (let j = i + 1; j < addrArray.length; j++) {
                const key = [addrArray[i], addrArray[j]].sort().join('|');
                linkMap.set(key, (linkMap.get(key) || 0) + 1);
            }
        }
    }

    for (const [key, strength] of linkMap) {
        const [source, target] = key.split('|');
        links.push({ source, target, strength });
    }

    return {
        nodes,
        links,
        metadata: {
            totalSupply,
            uniqueStakers: nodes.length,
            topWhalePercentage: topHolderPercentage
        }
    };
}
