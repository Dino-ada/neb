'use client';

import { motion } from 'framer-motion';
import { useNebulaStore } from '@/store/useNebulaStore';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface DistributionTier {
    label: string;
    count: number;
    percentage: number;
    color: string;
}

function formatBalance(balance: number): string {
    if (balance >= 1e12) return `${(balance / 1e12).toFixed(2)}T`;
    if (balance >= 1e9) return `${(balance / 1e9).toFixed(2)}B`;
    if (balance >= 1e6) return `${(balance / 1e6).toFixed(2)}M`;
    if (balance >= 1e3) return `${(balance / 1e3).toFixed(2)}K`;
    return balance.toLocaleString();
}

function truncateAddress(address: string): string {
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

function hexToString(hex: string): string {
    if (!hex) return '';
    if (!/^[0-9a-fA-F]+$/.test(hex)) return hex;

    try {
        const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const decoded = new TextDecoder('utf-8').decode(bytes);
        if (/^[\x20-\x7E]+$/.test(decoded)) {
            return decoded;
        }
        return hex;
    } catch {
        return hex;
    }
}

// Explorer link for Cardano addresses
function getExplorerLink(address: string, type: 'address' | 'stake' = 'address'): string {
    if (type === 'stake') {
        return `https://cexplorer.io/stake/${address}`;
    }
    return `https://cexplorer.io/address/${address}`;
}

export default function TokenInfo() {
    const { selectedNode, graphData, assetInfo } = useNebulaStore();
    const [showAnalytics, setShowAnalytics] = useState(true);

    if (!graphData || !assetInfo) {
        return null;
    }

    const { metadata: tokenMetadata, nodes } = graphData;

    const tokenName = assetInfo.onchainMetadata?.name as string ||
        assetInfo.onchainMetadata?.ticker as string ||
        (assetInfo.assetName ? hexToString(assetInfo.assetName) : null) ||
        'Unknown Token';

    // Calculate distribution tiers
    const calculateDistribution = (): DistributionTier[] => {
        const tiers = [
            { label: 'Whales (>1%)', threshold: 0.01, count: 0, balance: 0, color: 'bg-solar' },
            { label: 'Dolphins (0.1-1%)', threshold: 0.001, count: 0, balance: 0, color: 'bg-nebula' },
            { label: 'Fish (0.01-0.1%)', threshold: 0.0001, count: 0, balance: 0, color: 'bg-cyan' },
            { label: 'Shrimp (<0.01%)', threshold: 0, count: 0, balance: 0, color: 'bg-gray-500' },
        ];

        nodes.forEach(node => {
            const pct = node.balance / tokenMetadata.totalSupply;
            if (pct >= 0.01) { tiers[0].count++; tiers[0].balance += node.balance; }
            else if (pct >= 0.001) { tiers[1].count++; tiers[1].balance += node.balance; }
            else if (pct >= 0.0001) { tiers[2].count++; tiers[2].balance += node.balance; }
            else { tiers[3].count++; tiers[3].balance += node.balance; }
        });

        return tiers.map(t => ({
            label: t.label,
            count: t.count,
            percentage: (t.balance / tokenMetadata.totalSupply) * 100,
            color: t.color
        }));
    };

    const distribution = calculateDistribution();
    const top10Holdings = nodes.slice(0, 10).reduce((sum, n) => sum + n.balance, 0) / tokenMetadata.totalSupply * 100;

    // Improved Decentralization Score (0-100)
    // Uses logarithmic scaling for holder count and balanced penalties
    const calculateDecentralizationScore = () => {
        const topHolder = tokenMetadata.topWhalePercentage;
        const top10 = top10Holdings;
        const holderCount = nodes.length;

        // Component 1: Top holder penalty (0-35 points)
        // Logarithmic: 1% holder = 0 penalty, 50%+ = 35 penalty
        const topHolderPenalty = Math.min(35, Math.max(0,
            topHolder <= 5 ? 0 :
                topHolder <= 20 ? (topHolder - 5) * 0.5 :
                    topHolder <= 50 ? 7.5 + (topHolder - 20) * 0.6 :
                        25 + (topHolder - 50) * 0.2
        ));

        // Component 2: Top 10 concentration penalty (0-30 points)
        // 30% top10 = 0 penalty, 100% = 30 penalty
        const top10Penalty = Math.min(30, Math.max(0, (top10 - 30) * 0.43));

        // Component 3: Holder diversity bonus (0-35 points)
        // Logarithmic: more holders = higher bonus, diminishing returns
        const holderBonus = Math.min(35, Math.log10(holderCount + 1) * 17.5);

        // Final score: start at 65, apply penalties, add bonus
        const score = 65 - topHolderPenalty - top10Penalty + holderBonus;

        return Math.max(0, Math.min(100, Math.round(score)));
    };

    const decentralizationScore = calculateDecentralizationScore();

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-warning';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 70) return 'Healthy';
        if (score >= 40) return 'Moderate';
        return 'Risky';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3 max-w-xs"
        >
            {/* Token Overview */}
            <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nebula to-cyan flex items-center justify-center">
                            <span className="text-lg">🪐</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">{tokenName}</h3>
                            <a
                                href={`https://cexplorer.io/policy/${assetInfo.policyId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-cyan/70 hover:text-cyan font-mono transition-colors flex items-center gap-1"
                            >
                                {truncateAddress(assetInfo.policyId)}
                                <span className="text-[10px]">↗</span>
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                        <div>
                            <p className="text-xs text-gray-500">Unique Holders</p>
                            <p className="text-lg font-bold text-cyan">
                                {tokenMetadata.uniqueStakers.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Top Holder</p>
                            <p className={`text-lg font-bold ${tokenMetadata.topWhalePercentage > 20 ? 'text-warning' : 'text-solar'
                                }`}>
                                {tokenMetadata.topWhalePercentage.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Decentralization Score */}
                    <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Decentralization Score</span>
                            <span className={`text-sm font-bold ${getScoreColor(decentralizationScore)}`}>
                                {decentralizationScore.toFixed(0)}/100 • {getScoreLabel(decentralizationScore)}
                            </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${decentralizationScore >= 70 ? 'bg-green-400' :
                                    decentralizationScore >= 40 ? 'bg-yellow-400' : 'bg-warning'
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${decentralizationScore}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                    </div>

                    {tokenMetadata.topWhalePercentage > 20 && (
                        <div className="p-2 bg-warning/10 border border-warning/30 rounded-lg">
                            <p className="text-xs text-warning flex items-center gap-1">
                                ⚠️ High concentration detected
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Analytics Panel */}
            <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="w-full flex items-center justify-between text-sm font-medium text-white mb-2"
                >
                    <span>📊 Distribution Analysis</span>
                    <span className="text-gray-400">{showAnalytics ? '▼' : '▶'}</span>
                </button>

                {showAnalytics && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                    >
                        {/* Distribution Bars */}
                        <div className="space-y-2">
                            {distribution.map((tier, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">{tier.label}</span>
                                        <span className="text-white">{tier.count} ({tier.percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className={tier.color}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(tier.percentage, 100)}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.1 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Key Metrics */}
                        <div className="pt-2 border-t border-white/10 space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Top 10 Holdings</span>
                                <span className={`${top10Holdings > 50 ? 'text-warning' : 'text-gray-300'}`}>
                                    {top10Holdings.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Whale Count (&gt;1%)</span>
                                <span className="text-gray-300">{distribution[0].count}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </Card>

            {/* Selected Node Info */}
            {selectedNode && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                >
                    <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    {selectedNode.isWhale && <span className="text-solar">🐋</span>}
                                    Rank #{selectedNode.rank}
                                </h4>
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Wallet Label Badge */}
                            {selectedNode.label && (
                                <div className={`
                                    inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                                    ${selectedNode.label.category === 'dex' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : ''}
                                    ${selectedNode.label.category === 'burn' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : ''}
                                    ${selectedNode.label.category === 'vesting' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : ''}
                                    ${selectedNode.label.category === 'liquidity' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : ''}
                                    ${selectedNode.label.category === 'cex' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
                                    ${selectedNode.label.category === 'treasury' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : ''}
                                    ${selectedNode.label.category === 'nft' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : ''}
                                    ${!['dex', 'burn', 'vesting', 'liquidity', 'cex', 'treasury', 'nft'].includes(selectedNode.label.category) ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : ''}
                                `}>
                                    <span>{selectedNode.label.icon}</span>
                                    <span>{selectedNode.label.name}</span>
                                    {selectedNode.label.verified && <span className="text-green-400">✓</span>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-gray-500">Balance</p>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-nebula to-cyan bg-clip-text text-transparent">
                                        {formatBalance(selectedNode.balance)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Stake Key</p>
                                    <a
                                        href={getExplorerLink(selectedNode.stakeAddress, 'stake')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-mono text-cyan/70 hover:text-cyan break-all transition-colors flex items-center gap-1"
                                    >
                                        {truncateAddress(selectedNode.stakeAddress)}
                                        <span className="text-[10px] flex-shrink-0">↗</span>
                                    </a>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 flex items-center justify-between">
                                        <span>Addresses ({selectedNode.addresses.length})</span>
                                        {selectedNode.addresses.length > 1 && (
                                            <span className="text-[10px] text-gray-600">Right-click node for all</span>
                                        )}
                                    </p>
                                    <div className="max-h-24 overflow-y-auto space-y-1 mt-1">
                                        {selectedNode.addresses.slice(0, 5).map((addr, i) => (
                                            <a
                                                key={i}
                                                href={getExplorerLink(addr)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-mono text-gray-400 hover:text-cyan transition-colors flex items-center gap-1 group"
                                            >
                                                <span className="truncate">{truncateAddress(addr)}</span>
                                                <span className="text-[10px] opacity-0 group-hover:opacity-100 flex-shrink-0">↗</span>
                                            </a>
                                        ))}
                                        {selectedNode.addresses.length > 5 && (
                                            <p className="text-xs text-gray-500">
                                                +{selectedNode.addresses.length - 5} more
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                    <span className="text-xs text-gray-500">Ownership</span>
                                    <span className={`font-bold ${(selectedNode.balance / tokenMetadata.totalSupply) > 0.1
                                        ? 'text-warning'
                                        : 'text-cyan'
                                        }`}>
                                        {((selectedNode.balance / tokenMetadata.totalSupply) * 100).toFixed(2)}%
                                    </span>
                                </div>

                                {/* Verify on Explorer Button */}
                                <a
                                    href={getExplorerLink(selectedNode.stakeAddress, 'stake')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-2 bg-cyan/10 hover:bg-cyan/20 border border-cyan/30 rounded-lg text-xs text-cyan transition-colors"
                                >
                                    🔍 Verify on Cexplorer
                                </a>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}
