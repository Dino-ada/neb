import axios from 'axios';

const BLOCKFROST_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';

const blockfrostClient = axios.create({
  baseURL: BLOCKFROST_URL,
  headers: {
    'project_id': process.env.BLOCKFROST_PROJECT_ID || '',
  },
});

export interface AssetHolder {
  address: string;
  quantity: string;
}

export interface AddressInfo {
  address: string;
  amount: Array<{ unit: string; quantity: string }>;
  stake_address: string | null;
  type: string;
}

export interface StakeNode {
  id: string;
  stakeAddress: string;
  balance: number;
  addresses: string[];
  isWhale: boolean;
  rank: number;
  label?: {
    name: string;
    category: string;
    icon: string;
    verified: boolean;
  };
}

export interface TransactionLink {
  source: string;
  target: string;
  strength: number;
}

export interface GraphData {
  nodes: StakeNode[];
  links: TransactionLink[];
  metadata: {
    totalSupply: number;
    uniqueStakers: number;
    topWhalePercentage: number;
  };
}

// Fetch top holders for an asset
export async function getAssetHolders(policyId: string, assetName: string = ''): Promise<AssetHolder[]> {
  const assetId = assetName ? `${policyId}${assetName}` : policyId;

  try {
    const response = await blockfrostClient.get(`/assets/${assetId}/addresses`, {
      params: { count: 100, order: 'desc' }
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

// Resolve stake address for a given address
export async function getAddressInfo(address: string): Promise<AddressInfo | null> {
  try {
    const response = await blockfrostClient.get(`/addresses/${address}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// Get transactions for an address (for link building)
export async function getAddressTransactions(address: string): Promise<string[]> {
  try {
    const response = await blockfrostClient.get(`/addresses/${address}/transactions`, {
      params: { count: 10, order: 'desc' }
    });
    return response.data.map((tx: { tx_hash: string }) => tx.tx_hash);
  } catch {
    return [];
  }
}

// Get asset metadata
export async function getAssetMetadata(policyId: string, assetName: string = '') {
  const assetId = assetName ? `${policyId}${assetName}` : policyId;

  try {
    const response = await blockfrostClient.get(`/assets/${assetId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// Get all assets for a policy
export async function getPolicyAssets(policyId: string): Promise<{ asset: string; quantity: string }[]> {
  try {
    const response = await blockfrostClient.get(`/assets/policy/${policyId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

// Batch delay to avoid rate limiting
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default blockfrostClient;
