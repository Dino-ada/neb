'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useNebulaStore, type NebuState } from '@/store/useNebulaStore';
import { useState } from 'react';

interface MascotConfig {
    src: string;
    alt: string;
    message: string;
    emoji: string;
}

const mascotImages: Record<NebuState, MascotConfig> = {
    idle: {
        src: '/mascot/idle.png',
        alt: 'Nebu standing',
        message: "Ready to explore the cosmos! 🌟",
        emoji: '🐰'
    },
    loading: {
        src: '/mascot/rocket.png',
        alt: 'Nebu on rocket',
        message: "Scanning the blockchain... 🚀",
        emoji: '🚀'
    },
    success: {
        src: '/mascot/idle.png',
        alt: 'Nebu cheering',
        message: "Galaxy mapped successfully! ✨",
        emoji: '🎉'
    },
    analyst: {
        src: '/mascot/idle.png',
        alt: 'Nebu with sunglasses',
        message: "🔍 Whale cluster detected!",
        emoji: '😎'
    },
    error: {
        src: '/mascot/balloon.png',
        alt: 'Nebu with balloon',
        message: "Oops! No data found... 🎈",
        emoji: '🎈'
    }
};

export default function Nebu() {
    const { nebuState, error } = useNebulaStore();
    const mascot = mascotImages[nebuState];
    const [imageError, setImageError] = useState(false);

    return (
        <div className="flex flex-col items-end gap-2">
            {/* Speech Bubble */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={nebuState}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 max-w-[200px]"
                >
                    <p className="text-sm text-white/90">
                        {error || mascot.message}
                    </p>
                    {/* Bubble tail */}
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white/10 backdrop-blur-md border-r border-b border-white/20 rotate-45 transform" />
                </motion.div>
            </AnimatePresence>

            {/* Mascot */}
            <motion.div
                key={`mascot-${nebuState}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: 1,
                    opacity: 1,
                    y: nebuState === 'loading' ? [0, -10, 0] : 0
                }}
                transition={{
                    duration: 0.3,
                    y: nebuState === 'loading' ? {
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    } : {}
                }}
                className="relative w-28 h-28"
            >
                {/* Show image if available, otherwise show emoji fallback */}
                {!imageError ? (
                    <Image
                        src={mascot.src}
                        alt={mascot.alt}
                        fill
                        className="object-contain drop-shadow-[0_0_15px_rgba(188,19,254,0.5)]"
                        onError={() => setImageError(true)}
                        priority
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nebula/20 to-cyan/20 rounded-full backdrop-blur-sm border border-white/10">
                        <span className="text-5xl">{mascot.emoji}</span>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
