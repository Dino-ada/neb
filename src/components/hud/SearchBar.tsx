'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNebulaStore } from '@/store/useNebulaStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Example tokens for quick access
const EXAMPLE_TOKENS = [
    { name: 'SNEK', policy: '279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f', asset: '534e454b' },
    { name: 'HOSKY', policy: 'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235', asset: '484f534b59' },
    { name: 'MIN', policy: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6', asset: '4d494e' },
];

export default function SearchBar() {
    const [input, setInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { fetchGraphData, isLoading } = useNebulaStore();

    const handleSearch = useCallback(async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        // Check if input contains asset name (policy.asset format)
        if (trimmed.includes('.')) {
            const [policy, asset] = trimmed.split('.');
            await fetchGraphData(policy, asset);
        }
        // Check for concatenated asset ID (policy + asset name, >56 hex chars)
        else if (trimmed.length > 56 && /^[0-9a-fA-F]+$/.test(trimmed)) {
            const policy = trimmed.slice(0, 56);
            const asset = trimmed.slice(56);
            await fetchGraphData(policy, asset);
        }
        // Just policy ID (exactly 56 hex chars)
        else {
            await fetchGraphData(trimmed);
        }
    }, [input, isLoading, fetchGraphData]);

    const handleQuickSelect = useCallback(async (policy: string, asset: string) => {
        setInput(`${policy}.${asset}`);
        await fetchGraphData(policy, asset);
    }, [fetchGraphData]);

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            {/* Main search bar */}
            <motion.div
                className="relative"
                animate={{
                    boxShadow: isFocused
                        ? '0 0 30px rgba(0, 243, 255, 0.3)'
                        : '0 0 10px rgba(0, 243, 255, 0.1)'
                }}
                transition={{ duration: 0.3 }}
            >
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            type="text"
                            placeholder="Enter policy ID or full asset ID..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            disabled={isLoading}
                            className={`
                w-full h-14 px-6 
                bg-white/5 backdrop-blur-xl 
                border-2 border-white/10 
                rounded-xl
                text-white placeholder:text-gray-500
                focus:border-cyan focus:ring-2 focus:ring-cyan/20
                transition-all duration-300
                font-mono text-sm
                ${isFocused ? 'glitch-text' : ''}
              `}
                        />

                        {/* Glitch overlay effect */}
                        {isFocused && (
                            <motion.div
                                className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="glitch-effect" />
                            </motion.div>
                        )}
                    </div>

                    <Button
                        onClick={handleSearch}
                        disabled={isLoading || !input.trim()}
                        className={`
              h-14 px-8
              bg-gradient-to-r from-nebula to-cyan
              hover:from-nebula/80 hover:to-cyan/80
              border-0 rounded-xl
              font-bold text-white
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isLoading ? 'animate-pulse' : ''}
            `}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Scanning
                            </span>
                        ) : (
                            'Explore'
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* Quick access tokens */}
            <div className="flex flex-wrap justify-center gap-2">
                <span className="text-gray-500 text-sm">Quick explore:</span>
                {EXAMPLE_TOKENS.map((token) => (
                    <button
                        key={token.name}
                        onClick={() => handleQuickSelect(token.policy, token.asset)}
                        disabled={isLoading}
                        className={`
              px-3 py-1 
              bg-white/5 hover:bg-white/10
              border border-white/10 hover:border-cyan/50
              rounded-lg
              text-sm text-cyan hover:text-white
              transition-all duration-200
              disabled:opacity-50
            `}
                    >
                        ${token.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
