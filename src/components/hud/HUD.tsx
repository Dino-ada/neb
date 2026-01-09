'use client';

import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';
import TokenInfo from './TokenInfo';
import ViewControls from './ViewControls';
import AddressContextMenu from './AddressContextMenu';
import Nebu from '@/components/mascot/Nebu';
import { useNebulaStore } from '@/store/useNebulaStore';

export default function HUD() {
    const { graphData, viewSettings, setViewSettings, getFilteredNodes, contextMenu, setContextMenu, nebuState } = useNebulaStore();

    const totalNodes = graphData?.nodes.length || 0;
    const visibleNodes = getFilteredNodes().length;

    return (
        <div className="fixed inset-0 pointer-events-none z-10">
            {/* Top Center - Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto w-full max-w-2xl px-4"
            >
                <SearchBar />
            </motion.div>

            {/* Top Left - Logo */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-6 left-6"
            >
                <h1 className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-nebula via-cyan to-nebula bg-clip-text text-transparent">
                        NEBULA
                    </span>
                </h1>
                <p className="text-xs text-gray-500">Cardano Token Distribution Explorer</p>
            </motion.div>

            {/* Left Side - Token Info */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute top-32 left-6 pointer-events-auto max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin"
            >
                <TokenInfo />
            </motion.div>

            {/* Right Side - View Controls */}
            {graphData && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-32 right-6 pointer-events-auto"
                >
                    <ViewControls
                        totalNodes={totalNodes}
                        visibleNodes={visibleNodes}
                        onMinBalanceChange={(limit) => setViewSettings({ nodeLimit: limit })}
                        onShowLinksChange={(show) => setViewSettings({ showLinks: show })}
                        onHighlightWhalesChange={(highlight) => setViewSettings({ highlightWhales: highlight })}
                    />
                </motion.div>
            )}

            {/* Right-Click Context Menu for Addresses */}
            <AnimatePresence>
                {contextMenu?.isOpen && (
                    <div className="pointer-events-auto">
                        <AddressContextMenu
                            x={contextMenu.x}
                            y={contextMenu.y}
                            addresses={contextMenu.addresses}
                            stakeKey={contextMenu.stakeKey}
                            onClose={() => setContextMenu(null)}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* Bottom Right - Nebu Mascot */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-6 right-6 pointer-events-auto"
            >
                <Nebu />
            </motion.div>

            {/* Bottom Center - Controls Legend */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
            >
                <div className="flex gap-6 text-xs text-gray-500 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="flex items-center gap-1">
                        <span className="text-base">🖱️</span> Drag to rotate
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-base">🔍</span> Scroll to zoom
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-base">👆</span> Click for details
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-base">👉</span> Right-click for addresses
                    </span>
                </div>
            </motion.div>

            {/* Keyboard shortcuts hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute top-6 right-6 pointer-events-none"
            >
                <div className="text-xs text-gray-600">
                    Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">ESC</kbd> to reset view
                </div>
            </motion.div>
        </div>
    );
}
