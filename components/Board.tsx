import React, { useMemo, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';
import { GameState, GameTheme, GameStatus } from '../types';
import { GRID_SIZE } from '../constants';

// Augment JSX namespace to include React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      hemisphereLight: any;
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      sprite: any;
      spriteMaterial: any;
      group: any;
      icosahedronGeometry: any;
      ringGeometry: any;
      meshBasicMaterial: any;
      fog: any;
    }
  }
}

interface BoardProps {
  gameState: GameState;
  theme: GameTheme;
}

const gridToVector3 = (x: number, y: number, z: number = 0) => {
  const offset = GRID_SIZE / 2 - 0.5;
  return [x - offset, -(y - offset), z] as const;
};

const EmojiSprite = ({ emoji, position, size = 1.2 }: { emoji: string, position: [number, number, number], size?: number }) => {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '80px serif'; 
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 5;
      ctx.fillText(emoji, 64, 68);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [emoji]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <sprite position={position} scale={[size, size, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
};

const CameraController = ({ gameState }: { gameState: GameState }) => {
  const { camera } = useThree();
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  useFrame((state, delta) => {
    const { snake, status } = gameState;
    const head = snake[0];
    
    // Safety check
    if (!head) return;

    const [hx, hy, hz] = gridToVector3(head.x, head.y, 0);
    const headPos = new THREE.Vector3(hx, hy, 0); // Logic uses z=0 for lookAt base

    // Configuration for different states
    let targetPos: THREE.Vector3;
    let lookAtPoint: THREE.Vector3;

    if (status === GameStatus.PLAYING || status === GameStatus.PAUSED) {
      // Immersive Follow Mode
      // Position: Centered on X with head, but offset Y (back) and Z (up)
      // We dampen X follow slightly by averaging or just direct follow.
      // Direct follow is usually best for gameplay clarity.
      // Offset: x=0, y=-10 (back), z=12 (up)
      targetPos = new THREE.Vector3(hx, hy - 10, 12);
      lookAtPoint = headPos;
    } else {
      // Overview Mode (Idle / Game Over)
      targetPos = new THREE.Vector3(0, -16, 20);
      lookAtPoint = new THREE.Vector3(0, 0, 0);
    }

    // Smooth camera movement (Lerp)
    // Delta * Speed. Speed 3.0 gives a nice weighted follow.
    state.camera.position.lerp(targetPos, delta * 3);
    
    // Smooth lookAt
    targetLookAt.current.lerp(lookAtPoint, delta * 4);
    state.camera.lookAt(targetLookAt.current);
  });

  return null;
};

const Scene: React.FC<BoardProps> = ({ gameState, theme }) => {
  const { snake, food } = gameState;

  return (
    <group>
      {/* Dynamic Fog for immersion */}
      <fog attach="fog" args={[theme.backgroundColor, 10, 45]} />

      <ambientLight intensity={0.6} color={theme.textColor} />
      <pointLight 
        position={[5, 5, 10]} 
        intensity={1.5} 
        castShadow 
      />
      <hemisphereLight intensity={0.3} groundColor={theme.backgroundColor} />

      {/* Board Base (Floor) */}
      <mesh position={[0, 0, -0.5]} receiveShadow>
        <boxGeometry args={[GRID_SIZE + 0.5, GRID_SIZE + 0.5, 1]} />
        <meshStandardMaterial color={theme.gridColor} roughness={0.8} />
      </mesh>
      
      {/* Board Border */}
      <mesh position={[0, 0, -0.6]}>
        <boxGeometry args={[GRID_SIZE + 2, GRID_SIZE + 2, 0.8]} />
        <meshStandardMaterial color={theme.borderColor} />
      </mesh>

      {/* Snake Body */}
      {snake.map((part, index) => {
        const isHead = index === 0;
        const pos = gridToVector3(part.x, part.y, 0.5);
        
        return (
          <group key={`${part.x}-${part.y}-${index}`} position={pos}>
            <RoundedBox args={[0.9, 0.9, 0.9]} radius={0.15} smoothness={4} castShadow receiveShadow>
              <meshStandardMaterial color={theme.snakeColor} roughness={0.3} metalness={0.1} />
            </RoundedBox>
            {isHead && (
               <EmojiSprite 
                 emoji={theme.snakeHeadEmoji} 
                 position={[0, 0, 1.2]} 
                 size={1.5} 
               />
            )}
          </group>
        );
      })}

      {/* Food */}
      <group position={gridToVector3(food.x, food.y, 0.5)}>
        <Float speed={3} rotationIntensity={1} floatIntensity={0.5}>
            <mesh castShadow receiveShadow scale={0.6}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color={theme.snakeColor} emissive={theme.snakeColor} emissiveIntensity={0.5} />
            </mesh>
            <EmojiSprite emoji={theme.foodEmoji} position={[0, 0, 1]} size={1.4} />
        </Float>
        {/* Simple glow effect on floor */}
        <mesh position={[0, 0, -0.49]} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.3, 0.5, 32]} />
            <meshBasicMaterial color={theme.snakeColor} transparent opacity={0.3} />
        </mesh>
      </group>

      <CameraController gameState={gameState} />
    </group>
  );
};

export const Board: React.FC<BoardProps> = ({ gameState, theme }) => {
  const { status } = gameState;

  return (
    <div className="relative w-full aspect-square max-w-[500px] max-h-[500px] border-4 rounded-xl shadow-2xl overflow-hidden bg-slate-950" 
         style={{ borderColor: theme.borderColor, backgroundColor: theme.gridColor }}>
      
      {/* 3D Canvas */}
      <Canvas 
        shadows 
        camera={{ position: [0, -16, 20], fov: 45 }}
        className="block w-full h-full"
      >
        <Scene gameState={gameState} theme={theme} />
      </Canvas>

      {/* Overlays (kept in HTML for crisp text) */}
      {status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
              <div className="text-center animate-bounce">
                  <h2 className="text-4xl font-bold text-red-500 tracking-tighter" style={{ textShadow: '0 2px 10px rgba(220, 38, 38, 0.5)' }}>GAME OVER</h2>
                  <p className="text-slate-300 mt-2 text-sm">Press "Try Again"</p>
              </div>
          </div>
      )}
       {status === GameStatus.PAUSED && (
          <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Paused</h2>
              </div>
          </div>
      )}
    </div>
  );
};