'use client';

import { motion, useDragControls } from 'framer-motion';
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface ViewControlsProps {
    onMinBalanceChange: (value: number) => void;
    onShowLinksChange: (show: boolean) => void;
    onHighlightWhalesChange: (highlight: boolean) => void;
    totalNodes: number;
    visibleNodes: number;
}

export default function ViewControls({
    onMinBalanceChange,
    onShowLinksChange,
    onHighlightWhalesChange,
    totalNodes,
    visibleNodes
}: ViewControlsProps) {
    const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default
    const [minBalance, setMinBalance] = useState(0);
    const [showLinks, setShowLinks] = useState(true);
    const [highlightWhales, setHighlightWhales] = useState(true);
    const dragControls = useDragControls();
    const constraintsRef = useRef(null);

    const handleMinBalanceChange = (value: number) => {
        setMinBalance(value);
        onMinBalanceChange(value);
    };

    const handleShowLinksChange = (value: boolean) => {
        setShowLinks(value);
        onShowLinksChange(value);
    };

    const handleHighlightWhalesChange = (value: boolean) => {
        setHighlightWhales(value);
        onHighlightWhalesChange(value);
    };

    const presets = [
        { label: 'All', value: 0 },
        { label: 'Top 50', value: 50 },
        { label: 'Top 20', value: 20 },
        { label: 'Whales', value: 10 },
    ];

    return (
        <>
            {/* Drag constraints container */}
            <div
                ref={constraintsRef}
                className="fixed inset-0 pointer-events-none z-0"
            />

            <motion.div
                drag
                dragControls={dragControls}
                dragMomentum={false}
                dragElastic={0.1}
                dragConstraints={constraintsRef}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="cursor-move"
                whileDrag={{ scale: 1.02 }}
            >
                <Card className="p-3 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl shadow-lg shadow-black/20 min-w-[240px]">
                    {/* Header - always visible */}
                    <div
                        className="flex items-center justify-between text-sm cursor-pointer select-none"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <span className="text-white font-medium flex items-center gap-2">
                            <span className="cursor-grab active:cursor-grabbing">⋮⋮</span>
                            ⚙️ View Controls
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                                {visibleNodes}/{totalNodes}
                            </span>
                            <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▶'}</span>
                        </div>
                    </div>

                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-3 pt-3 border-t border-white/10"
                        >
                            {/* Quick Filters */}
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Quick Filter</p>
                                <div className="flex gap-1 flex-wrap">
                                    {presets.map(preset => (
                                        <button
                                            key={preset.label}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMinBalanceChange(preset.value);
                                            }}
                                            className={`
                                                px-2 py-1 text-xs rounded-md transition-all
                                                ${minBalance === preset.value
                                                    ? 'bg-cyan/20 text-cyan border border-cyan/50'
                                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}
                                            `}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Toggle Options */}
                            <div className="space-y-2">
                                <label className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Show Links</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShowLinksChange(!showLinks);
                                        }}
                                        className={`
                                            w-10 h-5 rounded-full transition-all relative
                                            ${showLinks ? 'bg-cyan' : 'bg-white/20'}
                                        `}
                                    >
                                        <div className={`
                                            absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all
                                            ${showLinks ? 'left-5' : 'left-0.5'}
                                        `} />
                                    </button>
                                </label>

                                <label className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Highlight Whales</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleHighlightWhalesChange(!highlightWhales);
                                        }}
                                        className={`
                                            w-10 h-5 rounded-full transition-all relative
                                            ${highlightWhales ? 'bg-solar' : 'bg-white/20'}
                                        `}
                                    >
                                        <div className={`
                                            absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all
                                            ${highlightWhales ? 'left-5' : 'left-0.5'}
                                        `} />
                                    </button>
                                </label>
                            </div>

                            {/* Legend */}
                            <div className="pt-2 border-t border-white/10">
                                <p className="text-xs text-gray-500 mb-2">Legend</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-solar" />
                                        <span className="text-gray-400">#1 Holder</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-nebula" />
                                        <span className="text-gray-400">Whales</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-cyan" />
                                        <span className="text-gray-400">Holders</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-cyan/50" />
                                        <span className="text-gray-400">Tx Link</span>
                                    </div>
                                </div>
                            </div>

                            {/* Drag hint */}
                            <p className="text-[10px] text-gray-600 text-center pt-1">
                                Drag ⋮⋮ to move this panel
                            </p>
                        </motion.div>
                    )}
                </Card>
            </motion.div>
        </>
    );
}
