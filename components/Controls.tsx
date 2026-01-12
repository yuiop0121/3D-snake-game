import React, { useState } from 'react';
import { GameStatus, GameTheme } from '../types';
import { generateTheme } from '../services/gemini';
import { Sparkles, Play, Pause, RotateCcw, Loader2 } from 'lucide-react';

interface ControlsProps {
  status: GameStatus;
  score: number;
  highScore: number;
  onStart: () => void;
  onPause: () => void;
  onThemeChange: (theme: GameTheme) => void;
  currentTheme: GameTheme;
}

export const Controls: React.FC<ControlsProps> = ({
  status,
  score,
  highScore,
  onStart,
  onPause,
  onThemeChange,
  currentTheme,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    // Pause game if playing so user doesn't die while waiting
    if (status === GameStatus.PLAYING) {
      onPause();
    }

    const newTheme = await generateTheme(prompt);
    onThemeChange(newTheme);
    setIsGenerating(false);
    setPrompt('');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
      
      {/* Score Board */}
      <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-lg border border-slate-800" style={{ borderColor: currentTheme.borderColor }}>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-slate-400">Score</p>
          <p className="text-2xl font-bold font-mono" style={{ color: currentTheme.snakeColor }}>{score}</p>
        </div>
        <div className="h-8 w-px bg-slate-800"></div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-slate-400">High Score</p>
          <p className="text-2xl font-bold font-mono text-white">{highScore}</p>
        </div>
      </div>

      {/* Game Controls */}
      <div className="grid grid-cols-2 gap-3">
        {status === GameStatus.IDLE || status === GameStatus.GAME_OVER ? (
          <button
            onClick={onStart}
            className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-slate-950 transition-transform active:scale-95 shadow-lg"
            style={{ backgroundColor: currentTheme.snakeColor }}
          >
            {status === GameStatus.GAME_OVER ? <RotateCcw size={20} /> : <Play size={20} />}
            {status === GameStatus.GAME_OVER ? 'Try Again' : 'Start Game'}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            {status === GameStatus.PAUSED ? <Play size={20} /> : <Pause size={20} />}
            {status === GameStatus.PAUSED ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>

      {/* AI Theme Generator */}
      <div className="border-t border-slate-800 pt-6 mt-2">
        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          AI Theme Designer
        </label>
        <form onSubmit={handleGenerateTheme} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 'Cyberpunk City', 'Candy Land'"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-slate-200"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
            title="Generate Theme"
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          </button>
        </form>
        {currentTheme.name && (
            <div className="mt-3 text-xs text-slate-500 text-center italic">
                Playing in: <span className="text-slate-300 not-italic font-medium">{currentTheme.name}</span>
            </div>
        )}
      </div>

       <div className="text-[10px] text-slate-600 text-center mt-2">
         Use Arrow Keys or WASD to move
       </div>
    </div>
  );
};
