import GalaxyCanvas from '@/components/galaxy/GalaxyCanvas';
import HUD from '@/components/hud/HUD';

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* 3D Galaxy Background */}
      <div className="absolute inset-0">
        <GalaxyCanvas />
      </div>

      {/* HUD Overlay */}
      <HUD />
    </main>
  );
}
