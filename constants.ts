import { Direction, GameState, GameStatus, GameTheme } from './types';

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150;
export const MIN_SPEED = 50;
export const SPEED_INCREMENT = 2;

export const DEFAULT_THEME: GameTheme = {
  name: 'Retro Terminal',
  backgroundColor: '#0f172a', // slate-950
  gridColor: '#1e293b', // slate-800
  snakeColor: '#22c55e', // green-500
  snakeHeadEmoji: '🟩',
  snakeBodyChar: 'sq',
  foodEmoji: '🍎',
  borderColor: '#334155', // slate-700
  textColor: '#f1f5f9', // slate-100
  description: 'Classic retro snake experience.'
};

export const INITIAL_GAME_STATE: GameState = {
  snake: [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ],
  food: { x: 5, y: 5 },
  direction: Direction.UP,
  score: 0,
  highScore: 0,
  status: GameStatus.IDLE,
  speed: INITIAL_SPEED,
};
