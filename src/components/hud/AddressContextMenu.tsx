'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useNebulaStore } from '@/store/useNebulaStore';

interface AddressMenuProps {
    x: number;
    y: number;
    addresses: string[];
    stakeKey: string;
    onClose: () => void;
}

function truncateAddress(address: string): string {
    if (address.length <= 24) return address;
    return `${address.slice(0, 12)}...${address.slice(-10)}`;
}

function getExplorerLink(address: string): string {
    return `https://cexplorer.io/address/${address}`;
}

function getStakeExplorerLink(stakeKey: string): string {
    return `https://cexplorer.io/stake/${stakeKey}`;
}

export default function AddressContextMenu({ x, y, addresses, stakeKey, onClose }: AddressMenuProps) {
    // Adjust position to keep menu on screen
    const adjustedX = Math.min(x, window.innerWidth - 320);
    const adjustedY = Math.min(y, window.innerHeight - (addresses.length * 40 + 100));

    return (
        <>
            {/* Backdrop to close menu */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.15 }}
                className="fixed z-50 min-w-[300px] max-w-[400px] bg-void/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
                style={{ left: adjustedX, top: adjustedY }}
            >
                {/* Header */}
                <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">
                            📍 {addresses.length} Address{addresses.length > 1 ? 'es' : ''} in Cluster
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors text-lg"
                        >
                            ✕
                        </button>
                    </div>
                    <a
                        href={getStakeExplorerLink(stakeKey)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan/70 hover:text-cyan font-mono mt-1 flex items-center gap-1"
                    >
                        Stake: {truncateAddress(stakeKey)}
                        <span className="text-[10px]">↗</span>
                    </a>
                </div>

                {/* Address List */}
                <div className="max-h-[300px] overflow-y-auto">
                    {addresses.map((address, index) => (
                        <a
                            key={index}
                            href={getExplorerLink(address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-6">#{index + 1}</span>
                                <span className="text-sm font-mono text-gray-300 group-hover:text-white transition-colors">
                                    {truncateAddress(address)}
                                </span>
                            </div>
                            <span className="text-cyan text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                View <span>↗</span>
                            </span>
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-white/5 border-t border-white/10">
                    <p className="text-[10px] text-gray-500 text-center">
                        Click any address to verify on Cexplorer
                    </p>
                </div>
            </motion.div>
        </>
    );
}

// Hook to manage context menu state
export function useAddressContextMenu() {
    const { contextMenu, setContextMenu } = useNebulaStore();

    const showMenu = (x: number, y: number, addresses: string[], stakeKey: string) => {
        setContextMenu({ x, y, addresses, stakeKey, isOpen: true });
    };

    const hideMenu = () => {
        setContextMenu(null);
    };

    return { contextMenu, showMenu, hideMenu };
}
