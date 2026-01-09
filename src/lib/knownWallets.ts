/**
 * Known Cardano Wallet Labels
 * 
 * This registry contains known service wallets, DEX addresses, 
 * burn wallets, vesting contracts, and other labeled addresses.
 * 
 * Format: stakeKey or address -> label info
 */

export type WalletCategory =
    | 'dex'          // DEX wallets (MuesliSwap, Minswap, SundaeSwap, etc.)
    | 'liquidity'    // Liquidity pool addresses
    | 'burn'         // Burn/dead wallets
    | 'vesting'      // Vesting contracts (CNFT Tools, etc.)
    | 'treasury'     // Project treasury wallets
    | 'cex'          // Centralized exchange wallets
    | 'nft'          // NFT marketplaces
    | 'bridge'       // Cross-chain bridges
    | 'staking'      // Staking pools
    | 'dao'          // DAO treasuries
    | 'unknown';     // Labeled but category unknown

export interface WalletLabel {
    name: string;
    category: WalletCategory;
    icon: string;
    description?: string;
    verified: boolean;
}

// Category icons and colors
export const CATEGORY_STYLES: Record<WalletCategory, { icon: string; color: string; bgColor: string }> = {
    dex: { icon: '🔄', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    liquidity: { icon: '💧', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
    burn: { icon: '🔥', color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
    vesting: { icon: '🔒', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    treasury: { icon: '🏛️', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    cex: { icon: '🏦', color: 'text-red-400', bgColor: 'bg-red-500/20' },
    nft: { icon: '🖼️', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
    bridge: { icon: '🌉', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    staking: { icon: '📊', color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
    dao: { icon: '🗳️', color: 'text-violet-400', bgColor: 'bg-violet-500/20' },
    unknown: { icon: '❓', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
};

// Known wallet addresses (by stake key or payment address)
// This can be expanded over time with community contributions
const KNOWN_WALLETS: Record<string, WalletLabel> = {
    // ===== BURN WALLETS =====
    'addr1w8qmxkacjdffxah0l3qg8hq2pmvs58q8lcy42zy9kda2ylc6dy5r4': {
        name: 'BURN Address',
        category: 'burn',
        icon: '🔥',
        description: 'Common Cardano burn address',
        verified: true
    },
    'addr1w999n67e86jn6xal07pzxtrmqynspgx0fwmcmpua4wc6yzsxpljz3': {
        name: 'SNEK Burn',
        category: 'burn',
        icon: '🔥',
        description: 'Official SNEK burn address',
        verified: true
    },

    // ===== DEX WALLETS =====
    // Minswap
    'stake1uxqh9rn76n8nynsnyvf4ulndjv0srcc8jtvumut3989cqmggjdxpm': {
        name: 'Minswap DEX',
        category: 'dex',
        icon: '🔄',
        description: 'Minswap decentralized exchange',
        verified: true
    },

    // SundaeSwap
    'stake1u9uqkj4f55yxm7zl7skt0y9gvz3mp2cler7xvw34rpv5ktqsw3avz': {
        name: 'SundaeSwap DEX',
        category: 'dex',
        icon: '🔄',
        description: 'SundaeSwap decentralized exchange',
        verified: true
    },

    // MuesliSwap
    'stake1uxkptsa4lkr55jleztw43t37vgdn88l6ghclfwuxld2eykgpgvg3f': {
        name: 'MuesliSwap DEX',
        category: 'dex',
        icon: '🔄',
        description: 'MuesliSwap decentralized exchange',
        verified: true
    },

    // WingRiders
    'stake178k0u9fw4gha7hlhws6gpa3vqcfnrjycnpj4xrt2r2j3dqgk6wsxe': {
        name: 'WingRiders DEX',
        category: 'dex',
        icon: '🔄',
        description: 'WingRiders decentralized exchange',
        verified: true
    },

    // VyFinance
    'stake1ux3g2c9dx2nhhehyrezyxpkstartcqmu9hk63qgfkccw5rqttygt7': {
        name: 'VyFinance DEX',
        category: 'dex',
        icon: '🔄',
        description: 'VyFinance decentralized exchange',
        verified: true
    },

    // ===== VESTING / LOCKING =====
    'stake1uxpdrerp9wrxunfh6ukyv5267j70fzxgw0fr3z8zeac5vyqhf9jhy': {
        name: 'CNFT Tools Vesting',
        category: 'vesting',
        icon: '🔒',
        description: 'CNFT Tools token vesting contract',
        verified: true
    },

    // JPG Store vestings are often contract-based
    'stake1u8a9qstrmj4rvc3k5z8fems7f0j2vztz8det2klgakhfc8ce79fma': {
        name: 'Vesting Contract',
        category: 'vesting',
        icon: '🔒',
        description: 'Token vesting contract',
        verified: false
    },

    // ===== CENTRALIZED EXCHANGES =====
    'stake1u89sasnfyjtmgk8ydqfv3fdl52f36x3djedfnzfc9rkgzrcss5vgc': {
        name: 'Exchange Wallet',
        category: 'cex',
        icon: '🏦',
        description: 'Centralized exchange hot wallet',
        verified: false
    },

    // ===== NFT MARKETPLACES =====
    'stake1uxqnl95vc2w2qxpw7pv8jk3e6zc8l0t4d9uhthtgxlq3z3csml9yf': {
        name: 'JPG Store',
        category: 'nft',
        icon: '🖼️',
        description: 'JPG Store marketplace',
        verified: true
    },

    // ===== LIQUIDITY POOLS =====
    // Generic LP markers - these work by address pattern matching too
};

// Address prefix patterns for smart contract detection
const CONTRACT_PATTERNS: Array<{ pattern: RegExp; label: WalletLabel }> = [
    {
        pattern: /^addr1w/, // Plutus V1/V2 script address
        label: {
            name: 'Smart Contract',
            category: 'unknown',
            icon: '📜',
            description: 'Plutus smart contract address',
            verified: false
        }
    },
    {
        pattern: /^addr1z/, // Plutus script with stake credential
        label: {
            name: 'Script + Stake',
            category: 'unknown',
            icon: '📜',
            description: 'Script address with staking',
            verified: false
        }
    }
];

/**
 * Look up a wallet label by stake key or address
 */
export function getWalletLabel(stakeKeyOrAddress: string): WalletLabel | null {
    // Direct lookup first
    if (KNOWN_WALLETS[stakeKeyOrAddress]) {
        return KNOWN_WALLETS[stakeKeyOrAddress];
    }

    // Check contract patterns
    for (const { pattern, label } of CONTRACT_PATTERNS) {
        if (pattern.test(stakeKeyOrAddress)) {
            return label;
        }
    }

    return null;
}

/**
 * Check if any addresses in a list have known labels
 */
export function getLabelsForAddresses(addresses: string[]): WalletLabel | null {
    for (const addr of addresses) {
        const label = getWalletLabel(addr);
        if (label) return label;
    }
    return null;
}

/**
 * Get label for a stake key
 */
export function getLabelForStakeKey(stakeKey: string): WalletLabel | null {
    return getWalletLabel(stakeKey);
}

/**
 * Check if this is a service wallet (DEX, LP, burn, etc.)
 * that should potentially be excluded from some metrics
 */
export function isServiceWallet(label: WalletLabel | null): boolean {
    if (!label) return false;
    return ['dex', 'liquidity', 'burn', 'vesting', 'cex', 'bridge', 'staking'].includes(label.category);
}

// Export for use in components
export { KNOWN_WALLETS };
