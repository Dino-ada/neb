'use client';

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNebulaStore } from '@/store/useNebulaStore';
import type { StakeNode } from '@/lib/blockfrost';
import * as THREE from 'three';

// Dynamic import to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="text-cyan animate-pulse text-xl">Initializing Galaxy...</div>
        </div>
    )
});

interface GraphNode extends StakeNode {
    x?: number;
    y?: number;
    z?: number;
    fx?: number;
    fy?: number;
    fz?: number;
}

interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    strength: number;
}

export default function GalaxyCanvas() {
    const graphRef = useRef<any>(null);
    const {
        graphData,
        setSelectedNode,
        viewSettings,
        getFilteredNodes,
        setContextMenu
    } = useNebulaStore();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Handle resize
    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Configure forces when graph is ready
    useEffect(() => {
        if (graphRef.current && graphData) {
            const fg = graphRef.current;

            (fg.d3Force('charge') as any)?.strength?.(-300);
            (fg.d3Force('link') as any)?.distance?.((link: GraphLink) =>
                100 / (link.strength || 1)
            );
            (fg.d3Force('center') as any)?.strength?.(0.05);

            setTimeout(() => {
                fg.cameraPosition(
                    { x: 0, y: 0, z: 500 },
                    { x: 0, y: 0, z: 0 },
                    1000
                );
            }, 500);
        }
    }, [graphData]);

    // Get filtered nodes
    const filteredNodes = useMemo(() => getFilteredNodes(), [getFilteredNodes, graphData, viewSettings]);

    // Calculate node size based on balance
    const getNodeSize = useCallback((node: GraphNode) => {
        if (!graphData) return 5;
        const maxBalance = Math.max(...graphData.nodes.map(n => n.balance));
        const normalized = node.balance / maxBalance;
        return 4 + Math.log10(1 + normalized * 100) * 12;
    }, [graphData]);

    // Create custom node object with glow effect
    const nodeThreeObject = useCallback((node: GraphNode) => {
        const size = getNodeSize(node);
        const group = new THREE.Group();

        let color: THREE.Color;
        if (node.rank === 1) {
            color = new THREE.Color('#ffd700');
        } else if (node.isWhale && viewSettings.highlightWhales) {
            color = new THREE.Color('#bc13fe');
        } else {
            color = new THREE.Color('#00f3ff');
        }

        // Core sphere
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.95
        });
        const sphere = new THREE.Mesh(geometry, material);
        group.add(sphere);

        // Glow layers
        const glowGeometry = new THREE.SphereGeometry(size * 1.3, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.2
        });
        group.add(new THREE.Mesh(glowGeometry, glowMaterial));

        const outerGlowGeometry = new THREE.SphereGeometry(size * 1.8, 8, 8);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.08
        });
        group.add(new THREE.Mesh(outerGlowGeometry, outerGlowMaterial));

        // Ring for top 3
        if (node.rank <= 3) {
            const ringGeometry = new THREE.RingGeometry(size * 1.5, size * 1.7, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: node.rank === 1 ? new THREE.Color('#ffd700') : new THREE.Color('#bc13fe'),
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
        }

        return group;
    }, [getNodeSize, viewSettings.highlightWhales]);

    // Handle node click
    const handleNodeClick = useCallback((node: GraphNode) => {
        if (!node) return;

        setContextMenu(null); // Close any open context menu

        // Focus camera on node
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);

        if (graphRef.current) {
            graphRef.current.cameraPosition(
                { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio }, // new position
                { x: node.x || 0, y: node.y || 0, z: node.z || 0 }, // lookAt ({ x, y, z })
                3000  // ms transition duration
            );
        }

        setSelectedNode(node);
    }, [setSelectedNode, setContextMenu]);

    // Handle right-click to show address context menu
    const handleNodeRightClick = useCallback((node: GraphNode, event: MouseEvent) => {
        event.preventDefault();

        if (node.addresses.length > 0) {
            setContextMenu({
                x: event.clientX,
                y: event.clientY,
                addresses: node.addresses,
                stakeKey: node.stakeAddress,
                isOpen: true
            });
        }
    }, [setContextMenu]);

    // Prepare graph data
    const processedData = useMemo(() => {
        if (!graphData) return { nodes: [], links: [] };

        const nodeIds = new Set(filteredNodes.map(n => n.id));

        const visibleLinks = viewSettings.showLinks
            ? graphData.links.filter(link =>
                nodeIds.has(link.source as string) && nodeIds.has(link.target as string)
            )
            : [];

        return {
            nodes: filteredNodes.map(node => ({ ...node })),
            links: visibleLinks.map(link => ({
                source: link.source,
                target: link.target,
                strength: link.strength
            }))
        };
    }, [graphData, filteredNodes, viewSettings.showLinks]);

    if (!graphData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-void">
                <div className="text-center space-y-6">
                    <div className="text-6xl animate-pulse">🌌</div>
                    <div className="space-y-2">
                        <p className="text-gray-400 text-lg">Enter a token policy ID to explore its galaxy</p>
                        <p className="text-gray-600 text-sm">Or try one of the quick explore options above</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-void">
            <ForceGraph3D
                ref={graphRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={processedData as any}
                nodeThreeObject={nodeThreeObject as any}
                nodeThreeObjectExtend={false}
                linkColor={() => 'rgba(0, 243, 255, 0.25)'}
                linkWidth={(link) => Math.min(3, (link as GraphLink).strength * 0.5)}
                linkOpacity={0.3}
                backgroundColor="#050510"
                onNodeClick={handleNodeClick as any}
                onNodeRightClick={handleNodeRightClick as any}
                nodeLabel={(node) => {
                    const n = node as GraphNode;
                    const pct = graphData ? ((n.balance / graphData.metadata.totalSupply) * 100).toFixed(2) : '?';
                    const addrCount = n.addresses.length;
                    const labelText = n.label ? ` | ${n.label.icon} ${n.label.name}` : '';
                    return `Rank #${n.rank} | ${pct}%${labelText} | ${addrCount} wallet${addrCount > 1 ? 's' : ''} | Right-click for addresses`;
                }}
                enableNodeDrag={true}
                enableNavigationControls={true}
                showNavInfo={false}
            />
        </div>
    );
}
