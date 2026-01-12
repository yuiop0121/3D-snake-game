import React, { useState, useEffect } from 'react';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { useSnakeGame } from './hooks/useSnakeGame';
import { Direction, GameTheme, GameStatus } from './types';
import { DEFAULT_THEME } from './constants';
import { Gamepad2 } from 'lucide-react';

const App: React.FC = () => {
  const { gameState, startGame, pauseGame, changeDirection } = useSnakeGame();
  const [theme, setTheme] = useState<GameTheme>(DEFAULT_THEME);

  // Handle Keyboard Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      // Handle Game Controls if not generating text (simple check could be improved)
      if (gameState.status !== GameStatus.PLAYING && e.key === 'Enter') {
          // Optional: Press enter to start? Maybe conflict with form. 
          // Let's stick to buttons for start to avoid complexity with the input focus.
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection(Direction.UP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection(Direction.DOWN);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection(Direction.LEFT);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection(Direction.RIGHT);
          break;
        case 'Escape':
        case ' ': // Spacebar
             if (gameState.status === GameStatus.PLAYING || gameState.status === GameStatus.PAUSED) {
                 pauseGame();
             }
             break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, gameState.status, pauseGame]);

  // Dynamic Background Style based on theme
  useEffect(() => {
    document.body.style.backgroundColor = theme.backgroundColor;
    document.body.style.color = theme.textColor;
  }, [theme]);

  return (
    <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-700 ease-in-out gap-8"
        style={{ backgroundColor: theme.backgroundColor }} // Fallback/Main BG
    >
      <header className="flex flex-col items-center gap-2 mb-2">
        <div className="flex items-center gap-3">
             <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: theme.snakeColor }}>
                <Gamepad2 size={32} className="text-white" />
             </div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: theme.textColor }}>
               SNAKE<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">3D</span>
             </h1>
        </div>
        <p className="text-sm opacity-75 max-w-xs text-center leading-relaxed" style={{ color: theme.textColor }}>
            {theme.description || "The classic game, reimagined with Generative AI."}
        </p>
      </header>

      <main className="flex flex-col lg:flex-row items-center lg:items-start gap-8 w-full max-w-4xl justify-center">
        <Board gameState={gameState} theme={theme} />
        
        <div className="flex flex-col w-full max-w-md">
            <Controls
                status={gameState.status}
                score={gameState.score}
                highScore={gameState.highScore}
                onStart={startGame}
                onPause={pauseGame}
                onThemeChange={setTheme}
                currentTheme={theme}
            />
            
            <div className="mt-6 p-4 rounded-lg border border-slate-800 bg-slate-900/30 text-xs text-slate-500">
                <h3 className="font-bold text-slate-400 mb-2">How it works</h3>
                <p>
                    This game uses <strong>Gemini 3 Flash</strong> to generate custom themes. 
                    Type a prompt like "Matrix", "Underwater", or "Volcano" to instantly 
                    restyle the entire 3D world.
                </p>
            </div>
        </div>
      </main>

    </div>
  );
};

export default App;