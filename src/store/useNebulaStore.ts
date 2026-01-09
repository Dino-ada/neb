import { create } from 'zustand';
import type { GraphData, StakeNode } from '@/lib/blockfrost';

export type NebuState = 'idle' | 'loading' | 'success' | 'analyst' | 'error';

interface AssetInfo {
    policyId: string;
    assetName?: string;
    fingerprint?: string;
    quantity?: string;
    onchainMetadata?: Record<string, unknown>;
}

interface ViewSettings {
    nodeLimit: number;
    showLinks: boolean;
    highlightWhales: boolean;
}

interface ContextMenuState {
    x: number;
    y: number;
    addresses: string[];
    stakeKey: string;
    isOpen: boolean;
}

interface NebulaStore {
    // Graph state
    graphData: GraphData | null;
    selectedNode: StakeNode | null;
    isLoading: boolean;
    error: string | null;

    // Mascot state
    nebuState: NebuState;

    // Asset info
    assetInfo: AssetInfo | null;

    // Search
    searchQuery: string;

    // View settings
    viewSettings: ViewSettings;

    // Context menu for address list
    contextMenu: ContextMenuState | null;

    // Actions
    setGraphData: (data: GraphData | null) => void;
    setSelectedNode: (node: StakeNode | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setNebuState: (state: NebuState) => void;
    setAssetInfo: (info: AssetInfo | null) => void;
    setSearchQuery: (query: string) => void;
    setViewSettings: (settings: Partial<ViewSettings>) => void;
    setContextMenu: (menu: ContextMenuState | null) => void;

    // Complex actions
    fetchGraphData: (policyId: string, assetName?: string) => Promise<void>;
    reset: () => void;

    // Computed
    getFilteredNodes: () => StakeNode[];
}

const defaultViewSettings: ViewSettings = {
    nodeLimit: 0,
    showLinks: true,
    highlightWhales: true
};

export const useNebulaStore = create<NebulaStore>((set, get) => ({
    // Initial state
    graphData: null,
    selectedNode: null,
    isLoading: false,
    error: null,
    nebuState: 'idle',
    assetInfo: null,
    searchQuery: '',
    viewSettings: defaultViewSettings,
    contextMenu: null,

    // Setters
    setGraphData: (data) => set({ graphData: data }),
    setSelectedNode: (node) => set({ selectedNode: node }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setNebuState: (state) => set({ nebuState: state }),
    setAssetInfo: (info) => set({ assetInfo: info }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setViewSettings: (settings) => set((state) => ({
        viewSettings: { ...state.viewSettings, ...settings }
    })),
    setContextMenu: (menu) => set({ contextMenu: menu }),

    // Get filtered nodes based on view settings
    getFilteredNodes: () => {
        const { graphData, viewSettings } = get();
        if (!graphData) return [];

        if (viewSettings.nodeLimit === 0) {
            return graphData.nodes;
        }

        return graphData.nodes.slice(0, viewSettings.nodeLimit);
    },

    // Fetch graph data
    fetchGraphData: async (policyId: string, assetName?: string) => {
        set({
            isLoading: true,
            error: null,
            nebuState: 'loading',
            selectedNode: null,
            contextMenu: null,
            graphData: null, // Clear previous data
            assetInfo: null  // Clear previous data
        });

        try {
            const params = new URLSearchParams({ policy: policyId });
            if (assetName) params.append('asset', assetName);

            const response = await fetch(`/api/graph?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch data');
            }

            const hasWhaleCluster = data.nodes.some(
                (node: StakeNode) => node.isWhale && (node.balance / data.metadata.totalSupply) > 0.2
            );

            set({
                graphData: data,
                assetInfo: data.asset ? {
                    policyId: data.asset.policyId,
                    assetName: data.asset.assetName,
                    fingerprint: data.asset.fingerprint,
                    quantity: data.asset.quantity,
                    onchainMetadata: data.asset.onchainMetadata
                } : { policyId },
                isLoading: false,
                nebuState: hasWhaleCluster ? 'analyst' : 'success'
            });

            setTimeout(() => {
                const currentState = get().nebuState;
                if (currentState === 'success') {
                    set({ nebuState: 'idle' });
                }
            }, 3000);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'An error occurred';
            set({
                error: message,
                isLoading: false,
                nebuState: 'error',
                graphData: null
            });
        }
    },

    // Reset store
    reset: () => set({
        graphData: null,
        selectedNode: null,
        isLoading: false,
        error: null,
        nebuState: 'idle',
        assetInfo: null,
        searchQuery: '',
        viewSettings: defaultViewSettings,
        contextMenu: null
    })
}));
